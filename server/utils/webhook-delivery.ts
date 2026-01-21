import type { Webhook, WebhookPayload, WebhookDelivery } from '~/types/webhook'
import { randomUUID } from 'node:crypto'
import { webhookStorage } from './webhookStorage'
import { webhookSigner } from './webhook-signer'

export interface WebhookDeliveryOptions {
  maxRetries?: number
  timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 10000

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
      const err = error as { status?: number; message?: string }
      responseCode = err.status || 0
      responseMessage = err.message || 'Unknown error'
      success = false
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
