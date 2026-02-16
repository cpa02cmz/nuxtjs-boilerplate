import type { Webhook, WebhookPayload, WebhookDelivery } from '~/types/webhook'
import { randomUUID } from 'node:crypto'
import { webhookStorage } from './webhookStorage'
import { webhookSigner } from './webhook-signer'
import { getCircuitBreaker } from './circuit-breaker'
import { createCircuitBreakerError } from './api-error'
import { webhooksConfig } from '~/configs/webhooks.config'
import { timeConfig } from '~/configs/time.config'

export interface WebhookDeliveryOptions {
  maxRetries?: number
  timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = webhooksConfig.request.timeoutMs

/**
 * Validates webhook URL to prevent SSRF attacks
 * Blocks private IP ranges, cloud metadata endpoints, and non-HTTPS in production
 *
 * FIX #3059: Enhanced SSRF protection against multiple bypass vectors:
 * - URL-encoded IPs (e.g., %31%32%37%2e%30%2e%30%2e%31)
 * - IPv6 loopback variants (::1, ::ffff:127.0.0.1)
 * - Octal/hex IP representations (0177.0.0.1, 0x7f.0.0.1)
 */
function validateWebhookUrl(url: string): void {
  try {
    // FIX #3059: Decode URL to prevent encoded bypasses
    let decodedUrl = url
    try {
      // Decode multiple times to handle double/triple encoding
      for (let i = 0; i < 3; i++) {
        const newUrl = decodeURIComponent(decodedUrl)
        if (newUrl === decodedUrl) break
        decodedUrl = newUrl
      }
    } catch {
      // If decoding fails, use original URL
      decodedUrl = url
    }

    const parsedUrl = new URL(decodedUrl)

    // Enforce HTTPS in production
    if (
      process.env.NODE_ENV === 'production' &&
      parsedUrl.protocol !== 'https:'
    ) {
      throw new Error('Webhook URL must use HTTPS in production')
    }

    let hostname = parsedUrl.hostname.toLowerCase()

    // FIX #3059: Remove IPv6 brackets if present
    hostname = hostname.replace(/^\[/, '').replace(/\]$/, '')

    // Block localhost and loopback addresses
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '0:0:0:0:0:0:0:1' ||
      hostname === '0000:0000:0000:0000:0000:0000:0000:0001'
    ) {
      throw new Error(
        'Webhook URL cannot target localhost or loopback addresses'
      )
    }

    // FIX #3059: Block IPv4-mapped IPv6 loopback addresses
    if (
      hostname === '::ffff:127.0.0.1' ||
      hostname === '::ffff:7f00:1' ||
      hostname.startsWith('::ffff:127.') ||
      hostname.startsWith('0:0:0:0:0:ffff:127.')
    ) {
      throw new Error(
        'Webhook URL cannot target IPv4-mapped IPv6 loopback addresses'
      )
    }

    // Block cloud metadata endpoints
    if (hostname === '169.254.169.254' || hostname === '169.254.170.2') {
      throw new Error('Webhook URL cannot target cloud metadata endpoints')
    }

    // FIX #3059: Block octal/hex IP representations
    // Octal IPs like 0177.0.0.1 (127.0.0.1) or 010.0.0.1 (8.0.0.1)
    const octalHexMatch = hostname.match(
      /^(0[0-7]+|0x[0-9a-f]+)\.(\d+|0[0-7]+|0x[0-9a-f]+)\.(\d+|0[0-7]+|0x[0-9a-f]+)\.(\d+|0[0-7]+|0x[0-9a-f]+)$/i
    )
    if (octalHexMatch) {
      throw new Error(
        'Webhook URL cannot use octal or hexadecimal IP representations'
      )
    }

    // Block private IP ranges
    const ipMatch = hostname.match(
      /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
    )
    if (ipMatch) {
      const octets = ipMatch.slice(1, 5).map(Number)
      const [a, b, c, d] = octets

      // Check if it's a valid IP
      if (
        a &&
        (a > 255 || (b && (b > 255 || (c && (c > 255 || (d && d > 255))))))
      ) {
        throw new Error('Invalid IP address in webhook URL')
      }

      // Block private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16
      if (a === 10) {
        throw new Error(
          'Webhook URL cannot target private IP ranges (10.0.0.0/8)'
        )
      }
      if (a === 172 && b !== undefined && b >= 16 && b <= 31) {
        throw new Error(
          'Webhook URL cannot target private IP ranges (172.16.0.0/12)'
        )
      }
      if (a === 192 && b === 168) {
        throw new Error(
          'Webhook URL cannot target private IP ranges (192.168.0.0/16)'
        )
      }
      if (a === 169 && b === 254) {
        throw new Error(
          'Webhook URL cannot target link-local addresses (169.254.0.0/16)'
        )
      }
      // Block 127.0.0.0/8 loopback range
      if (a === 127) {
        throw new Error(
          'Webhook URL cannot target loopback addresses (127.0.0.0/8)'
        )
      }
      // FIX #3059: Block 0.0.0.0/8
      if (a === 0) {
        throw new Error(
          'Webhook URL cannot target zero-range addresses (0.0.0.0/8)'
        )
      }
    }

    // FIX #3059: Enhanced IPv6 blocking
    if (
      hostname === '::1' ||
      hostname === '0:0:0:0:0:0:0:1' ||
      hostname.startsWith('fe80:') ||
      hostname.startsWith('fc') ||
      hostname.startsWith('fd') ||
      hostname.startsWith('::ffff:')
    ) {
      throw new Error('Webhook URL cannot target private IPv6 ranges')
    }

    // FIX #3059: Block short IPv6 loopback variations
    if (/^::1$/.test(hostname) || hostname === ':1' || hostname === ':1:') {
      throw new Error('Webhook URL cannot target IPv6 loopback addresses')
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Webhook URL')) {
      throw error
    }
    throw new Error('Invalid webhook URL format')
  }
}

export class WebhookDeliveryService {
  private circuitBreakerKeys: Map<string, string> = new Map()
  // Flexy hates hardcoded limits! Using config instead
  private static readonly MAX_CIRCUIT_BREAKER_KEYS =
    webhooksConfig.circuitBreakerKeys.maxKeys

  async deliver(
    webhook: Webhook,
    payload: WebhookPayload
  ): Promise<WebhookDelivery> {
    // Overall timeout wrapper for entire delivery process (Issue #2207)
    const OVERALL_TIMEOUT_MS = webhooksConfig.overallTimeoutMs

    return new Promise<WebhookDelivery>((resolve, reject) => {
      const timeoutId: NodeJS.Timeout = setTimeout(() => {
        reject(new Error('Overall delivery timeout'))
      }, OVERALL_TIMEOUT_MS)

      this.executeDelivery(webhook, payload).then(result => {
        clearTimeout(timeoutId)
        resolve(result)
      })
    })
  }

  private async executeDelivery(
    webhook: Webhook,
    payload: WebhookPayload
  ): Promise<WebhookDelivery> {
    // Validate webhook URL to prevent SSRF attacks
    validateWebhookUrl(webhook.url)

    const signature = webhookSigner.generateSignature(
      payload,
      webhook.secret || ''
    )
    const payloadWithSignature = { ...payload, signature }

    // Get circuit breaker per hostname to prevent cascading failures
    // Flexy hates hardcoded values! Using webhooksConfig for circuit breaker settings
    const circuitBreakerKey = this.getCircuitBreakerKey(webhook)
    const circuitBreaker = getCircuitBreaker(circuitBreakerKey, {
      failureThreshold: webhooksConfig.circuitBreaker.failureThreshold,
      successThreshold: webhooksConfig.circuitBreaker.successThreshold,
      timeoutMs: webhooksConfig.circuitBreaker.timeoutMs,
    })

    let responseCode: number | undefined
    let responseMessage: string | undefined
    let success = false

    try {
      await circuitBreaker.execute(
        async () => {
          await $fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Event': payload.event,
              'X-Webhook-Signature': signature,
              'X-Webhook-Timestamp': payload.timestamp,
              ...(payload.idempotencyKey && {
                'X-Idempotency-Key': payload.idempotencyKey,
              }),
            },
            body: JSON.stringify(payloadWithSignature),
            timeout: DEFAULT_TIMEOUT_MS,
          })
        },
        () => {
          const lastFailureTime = circuitBreaker.getStats().lastFailureTime
          const lastFailureTimeIso = lastFailureTime
            ? new Date(lastFailureTime).toISOString()
            : undefined
          throw createCircuitBreakerError(webhook.url, lastFailureTimeIso)
        }
      )

      // Flexy uses config values instead of hardcoded success codes!
      responseCode = webhooksConfig.delivery.successStatusCode
      responseMessage = webhooksConfig.delivery.successMessage
      success = true
    } catch (error: unknown) {
      const err = error as {
        status?: number
        message?: string
        code?: string
        name?: string
      }
      responseCode = err.status || 0
      success = false

      // Categorize error types for better retry logic and monitoring
      if (
        err.message?.includes('timeout') ||
        err.code === 'ETIMEDOUT' ||
        err.code === 'ECONNABORTED'
      ) {
        responseMessage = `Timeout error: ${err.message || 'Request timed out'}`
      } else if (
        err.message?.includes('ECONNREFUSED') ||
        err.code === 'ECONNREFUSED'
      ) {
        responseMessage = `Connection refused: ${err.message || 'Connection refused'}`
      } else if (
        err.message?.includes('ENOTFOUND') ||
        err.message?.includes('dns') ||
        err.code === 'ENOTFOUND'
      ) {
        responseMessage = `DNS resolution error: ${err.message || 'DNS lookup failed'}`
      } else if (
        err.message?.includes('SSL') ||
        err.message?.includes('certificate') ||
        err.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
      ) {
        responseMessage = `SSL/TLS error: ${err.message || 'SSL certificate verification failed'}`
      } else if (responseCode >= 400 && responseCode < 500) {
        responseMessage = `Client error ${responseCode}: ${err.message || 'HTTP client error'}`
      } else if (responseCode >= 500) {
        responseMessage = `Server error ${responseCode}: ${err.message || 'HTTP server error'}`
      } else if (err.message?.includes('Circuit breaker is OPEN')) {
        responseMessage = `Circuit breaker open: ${err.message || 'Service temporarily unavailable'}`
      } else {
        responseMessage = `Network error: ${err.message || 'Unknown error'}`
      }
    }

    const delivery: WebhookDelivery = {
      id: `del_${randomUUID()}`,
      webhookId: webhook.id,
      event: payload.event,
      payload: payloadWithSignature,
      status: success ? 'success' : 'failed',
      statusCode: responseCode,
      responseBody: responseMessage,
      attemptCount: 1,
      createdAt: new Date().toISOString(),
      idempotencyKey: payload.idempotencyKey,
      updatedAt: new Date().toISOString(),
    }

    // Atomically create delivery and store idempotency key to prevent duplicate deliveries
    if (payload.idempotencyKey) {
      await webhookStorage.createDeliveryWithIdempotencyKey(
        delivery,
        payload.idempotencyKey
      )
    } else {
      await webhookStorage.createDelivery(delivery)
    }

    await webhookStorage.updateWebhook(webhook.id, {
      updatedAt: new Date().toISOString(),
    })

    return delivery
  }

  async deliverWithRetry(
    webhook: Webhook,
    payload: WebhookPayload,
    options: WebhookDeliveryOptions = {}
  ): Promise<{ success: boolean; delivery: WebhookDelivery }> {
    const { maxRetries = 1 } = options

    let lastDelivery: WebhookDelivery | null = null
    let success = false

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        lastDelivery = await this.deliver(webhook, payload)
        success = lastDelivery.status === 'success'

        if (success) {
          return { success, delivery: lastDelivery }
        }

        // Check if error is retryable based on response message
        if (!this.isRetryableError(lastDelivery.responseBody)) {
          return { success, delivery: lastDelivery }
        }

        if (attempt < maxRetries) {
          await new Promise(resolve =>
            setTimeout(resolve, this.calculateRetryDelay(attempt))
          )
        }
      } catch (error) {
        if (attempt === maxRetries) {
          throw error
        }

        await new Promise(resolve =>
          setTimeout(resolve, this.calculateRetryDelay(attempt))
        )
      }
    }

    return { success, delivery: lastDelivery! }
  }

  private isRetryableError(responseMessage?: string): boolean {
    if (!responseMessage) return true

    // Don't retry client errors (4xx) except for specific cases
    if (responseMessage.includes('Client error 4')) {
      // Retry on 408 (timeout), 429 (rate limit), 409 (conflict)
      if (/Client error (408|429|409):/.test(responseMessage)) {
        return true
      }
      return false
    }

    // Always retry server errors (5xx), timeouts, connection issues
    if (
      responseMessage.includes('Server error') ||
      responseMessage.includes('Timeout error') ||
      responseMessage.includes('Connection refused') ||
      responseMessage.includes('DNS resolution error') ||
      responseMessage.includes('Network error')
    ) {
      return true
    }

    // Don't retry SSL errors (likely configuration issue)
    if (responseMessage.includes('SSL/TLS error')) {
      return false
    }

    return true
  }

  private calculateRetryDelay(attempt: number): number {
    // Flexy hates hardcoded values! Using webhooksConfig for retry settings
    const baseDelayMs = webhooksConfig.retry.baseDelayMs
    const maxDelayMs = webhooksConfig.retry.maxDelayMs
    const jitterFactor = webhooksConfig.retry.jitterFactor
    // Flexy hates hardcoded 2! Using configurable exponential base from timeConfig
    const exponentialBase = timeConfig.retry.exponentialBase

    let delay = baseDelayMs * Math.pow(exponentialBase, attempt)
    delay = Math.min(delay, maxDelayMs)

    const jitterRange = delay * jitterFactor
    const jitter = (Math.random() - 0.5) * jitterRange
    delay += jitter

    return Math.max(0, Math.floor(delay))
  }

  private getCircuitBreakerKey(webhook: Webhook): string {
    // Prevent unbounded memory growth by limiting map size
    if (
      this.circuitBreakerKeys.size >=
      WebhookDeliveryService.MAX_CIRCUIT_BREAKER_KEYS
    ) {
      // Remove oldest entries based on config percentage to make room - Flexy hates hardcoded 20%!
      const keysToRemove = Math.floor(
        WebhookDeliveryService.MAX_CIRCUIT_BREAKER_KEYS *
          webhooksConfig.circuitBreakerKeys.cleanupPercentage
      )
      let removed = 0
      for (const key of this.circuitBreakerKeys.keys()) {
        if (removed >= keysToRemove) break
        this.circuitBreakerKeys.delete(key)
        removed++
      }
    }

    if (!this.circuitBreakerKeys.has(webhook.id)) {
      const key = `webhook:${webhook.id}:${webhook.url}`
      this.circuitBreakerKeys.set(webhook.id, key)
    }
    return this.circuitBreakerKeys.get(webhook.id)!
  }
}

export const webhookDeliveryService = new WebhookDeliveryService()
