import type { Webhook, WebhookPayload, WebhookDelivery } from '~/types/webhook'
import { randomUUID } from 'node:crypto'
import { webhookStorage } from './webhookStorage'
import { webhookSigner } from './webhook-signer'
import { TIMING } from './constants'

export interface WebhookDeliveryOptions {
  maxRetries?: number
  timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = TIMING.WEBHOOK_REQUEST_TIMEOUT

export class WebhookDeliveryService {
  async deliver(
    webhook: Webhook,
    payload: WebhookPayload
  ): Promise<WebhookDelivery> {
    const signature = webhookSigner.generateSignature(
      payload,
      webhook.secret || ''
    )
    const payloadWithSignature = { ...payload, signature }

    let responseCode: number | undefined
    let responseMessage: string | undefined
    let success = false

    try {
      await $fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': payload.event,
          'X-Webhook-Signature': signature,
          'X-Webhook-Timestamp': payload.timestamp,
          ...(payload.idempotencyKey && {
            'X-Webhook-Idempotency-Key': payload.idempotencyKey,
          }),
        },
        body: JSON.stringify(payloadWithSignature),
        timeout: DEFAULT_TIMEOUT_MS,
      })

      responseCode = 200
      responseMessage = 'OK'
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

    webhookStorage.createDelivery(delivery)

    if (payload.idempotencyKey) {
      webhookStorage.setDeliveryByIdempotencyKey(
        payload.idempotencyKey,
        delivery
      )
    }

    webhookStorage.updateWebhook(webhook.id, {
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
    const baseDelayMs = 1000
    const maxDelayMs = 30000

    let delay = baseDelayMs * Math.pow(2, attempt)
    delay = Math.min(delay, maxDelayMs)

    const jitterRange = delay * 0.1
    const jitter = (Math.random() - 0.5) * jitterRange
    delay += jitter

    return Math.max(0, Math.floor(delay))
  }
}

export const webhookDeliveryService = new WebhookDeliveryService()
