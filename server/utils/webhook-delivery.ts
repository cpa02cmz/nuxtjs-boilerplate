import type { Webhook, WebhookPayload, WebhookDelivery } from '~/types/webhook'
import { randomUUID } from 'node:crypto'
import { webhookStorage } from './webhookStorage'
import { webhookSigner } from './webhook-signer'
import { getCircuitBreaker } from './circuit-breaker'
import { createCircuitBreakerError } from './api-error'
import { webhooksConfig } from '~/configs/webhooks.config'

export interface WebhookDeliveryOptions {
  maxRetries?: number
  timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = webhooksConfig.request.timeoutMs

export class WebhookDeliveryService {
  private circuitBreakerKeys: Map<string, string> = new Map()
  // Flexy hates hardcoded limits! Using config instead
  private static readonly MAX_CIRCUIT_BREAKER_KEYS =
    webhooksConfig.circuitBreakerKeys.maxKeys

  async deliver(
    webhook: Webhook,
    payload: WebhookPayload
  ): Promise<WebhookDelivery> {
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

    await webhookStorage.createDelivery(delivery)

    if (payload.idempotencyKey) {
      await webhookStorage.setDeliveryByIdempotencyKey(
        payload.idempotencyKey,
        delivery
      )
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

    let delay = baseDelayMs * Math.pow(2, attempt)
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
      const key = `webhook:${webhook.url}`
      this.circuitBreakerKeys.set(webhook.id, key)
    }
    return this.circuitBreakerKeys.get(webhook.id)!
  }
}

export const webhookDeliveryService = new WebhookDeliveryService()
