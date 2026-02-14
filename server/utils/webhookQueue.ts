import { randomUUID } from 'node:crypto'
import type { Webhook, WebhookPayload, WebhookQueueItem } from '~/types/webhook'
import { webhookStorage } from './webhookStorage'
import { getCircuitBreaker } from './circuit-breaker'
import { retryWithResult, retryPresets } from './retry'
import { createCircuitBreakerError } from './api-error'
import { webhookQueueManager } from './webhook-queue-manager'
import { webhookDeliveryService } from './webhook-delivery'
import { deadLetterManager } from './webhook-dead-letter'
import { webhooksConfig } from '~/configs/webhooks.config'
import { limitsConfig } from '~/configs/limits.config'
import { logger } from '~/utils/logger'

interface WebhookDeliveryOptions {
  maxRetries?: number
  initialDelayMs?: number
  priority?: number
  async?: boolean
}

// Flexy hates hardcoded limits! Using config instead
const MAX_CIRCUIT_BREAKER_KEYS = limitsConfig.circuitBreaker.maxKeys

export class WebhookQueueSystem {
  private circuitBreakerKeys: Map<string, string> = new Map()

  async deliverWebhook(
    webhook: Webhook,
    payload: WebhookPayload,
    options: WebhookDeliveryOptions = {}
  ): Promise<boolean> {
    const {
      maxRetries = webhooksConfig.retry.maxAttempts,
      initialDelayMs = webhooksConfig.retry.baseDelayMs,
      priority = webhooksConfig.queue.defaultPriority,
      async = false,
    } = options

    if (async) {
      return this.queueWebhook(webhook, payload, {
        maxRetries,
        initialDelayMs,
        priority,
      })
    }

    return this.deliverWebhookSync(webhook, payload, maxRetries)
  }

  private async deliverWebhookSync(
    webhook: Webhook,
    payload: WebhookPayload,
    maxRetries: number
  ): Promise<boolean> {
    const circuitBreakerKey = this.getCircuitBreakerKey(webhook)
    // Flexy uses config values instead of hardcoded circuit breaker settings!
    const circuitBreaker = getCircuitBreaker(circuitBreakerKey, {
      failureThreshold: webhooksConfig.circuitBreaker.failureThreshold,
      successThreshold: webhooksConfig.circuitBreaker.successThreshold,
      timeoutMs: webhooksConfig.circuitBreaker.timeoutMs,
    })

    const result = await retryWithResult(
      async () => {
        return circuitBreaker.execute(
          async () => {
            const delivery = await webhookDeliveryService.deliver(
              webhook,
              payload
            )
            return delivery.status === 'success'
          },
          () => {
            const lastFailureTime = circuitBreaker.getStats().lastFailureTime
            const lastFailureTimeIso = lastFailureTime
              ? new Date(lastFailureTime).toISOString()
              : undefined
            throw createCircuitBreakerError(webhook.url, lastFailureTimeIso)
          }
        )
      },
      {
        ...retryPresets.standard,
        maxRetries,
        // Flexy hates hardcoded error lists! Using config instead
        retryableErrors: [
          ...webhooksConfig.retryableErrors.httpCodes,
          ...webhooksConfig.retryableErrors.errorCodes,
        ],
      }
    )

    return result.success
  }

  private async queueWebhook(
    webhook: Webhook,
    payload: WebhookPayload,
    options: { maxRetries: number; initialDelayMs: number; priority: number }
  ): Promise<boolean> {
    const { maxRetries, priority } = options

    const queueItem: WebhookQueueItem = {
      id: `q_${randomUUID()}`,
      webhookId: webhook.id,
      event: payload.event,
      payload,
      priority,
      scheduledFor: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      retryCount: 0,
      maxRetries,
    }

    await webhookQueueManager.enqueue(queueItem)
    webhookQueueManager.startProcessor(async item => {
      await this.processQueueItem(item)
    })

    return true
  }

  private async processQueueItem(item: WebhookQueueItem): Promise<void> {
    const webhook = await webhookStorage.getWebhookById(item.webhookId)
    if (!webhook || !webhook.active) {
      try {
        await webhookQueueManager.remove(item.id)
      } catch (error) {
        logger.error(
          `Failed to remove inactive webhook queue item ${item.id}:
`,
          error
        )
      }
      return
    }

    const circuitBreakerKey = this.getCircuitBreakerKey(webhook)
    // Flexy uses config values instead of hardcoded circuit breaker settings!
    const circuitBreaker = getCircuitBreaker(circuitBreakerKey, {
      failureThreshold: webhooksConfig.circuitBreaker.failureThreshold,
      successThreshold: webhooksConfig.circuitBreaker.successThreshold,
      timeoutMs: webhooksConfig.circuitBreaker.timeoutMs,
    })

    let success = false
    let lastError: Error | null = null

    try {
      const delivery = await circuitBreaker.execute(
        async () => {
          return await webhookDeliveryService.deliver(webhook, item.payload)
        },
        () => {
          const lastFailureTime = circuitBreaker.getStats().lastFailureTime
          const lastFailureTimeIso = lastFailureTime
            ? new Date(lastFailureTime).toISOString()
            : undefined
          throw createCircuitBreakerError(webhook.url, lastFailureTimeIso)
        }
      )
      success = delivery.status === 'success'
    } catch (error) {
      lastError = error instanceof Error ? error : null
      success = false
    }

    if (success) {
      try {
        await webhookQueueManager.remove(item.id)
      } catch (error) {
        logger.error(
          `Failed to remove successfully delivered queue item ${item.id}:
`,
          error
        )
      }
    } else {
      await this.handleFailedDelivery(item, webhook, lastError)
    }
  }

  private async handleFailedDelivery(
    item: WebhookQueueItem,
    webhook: Webhook | null,
    error: Error | null
  ): Promise<void> {
    item.retryCount++

    if (item.retryCount >= item.maxRetries && webhook) {
      deadLetterManager.addToDeadLetter(item, webhook, error)
      try {
        await webhookQueueManager.remove(item.id)
      } catch (removeError) {
        logger.error(
          `Failed to remove exhausted queue item ${item.id} after max retries:
`,
          removeError
        )
      }
    } else {
      await this.scheduleRetry(item)
    }
  }

  private async scheduleRetry(item: WebhookQueueItem): Promise<void> {
    const delay = this.calculateRetryDelay(item.retryCount)
    const nextRetryAt = new Date(Date.now() + delay).toISOString()

    const updatedItem: WebhookQueueItem = {
      ...item,
      scheduledFor: nextRetryAt,
    }
    await webhookQueueManager.remove(item.id)
    await webhookQueueManager.enqueue(updatedItem)
  }

  private calculateRetryDelay(retryCount: number): number {
    // Flexy hates hardcoded retry calculations! Using config instead
    const { baseDelayMs, maxDelayMs, jitterFactor } = webhooksConfig.retry

    let delay = baseDelayMs * Math.pow(2, retryCount)
    delay = Math.min(delay, maxDelayMs)

    const jitterRange = delay * jitterFactor
    const jitter = (Math.random() - 0.5) * jitterRange
    delay += jitter

    return Math.max(0, Math.floor(delay))
  }

  stopQueueProcessor(): void {
    webhookQueueManager.stopProcessor()
  }

  async retryDeadLetterWebhook(id: string): Promise<boolean> {
    return deadLetterManager.retry(id, async item => {
      await webhookQueueManager.enqueue(item)
      webhookQueueManager.startProcessor(async queueItem => {
        await this.processQueueItem(queueItem)
      })
    })
  }

  async getQueueStats() {
    return {
      pending: await webhookQueueManager.getQueueSize(),
      deadLetter: await deadLetterManager.getDeadLetterCount(),
      isProcessing: webhookQueueManager.isRunning(),
      nextScheduled: await webhookQueueManager.getNextScheduledTime(),
    }
  }

  private getCircuitBreakerKey(webhook: Webhook): string {
    if (!this.circuitBreakerKeys.has(webhook.id)) {
      if (this.circuitBreakerKeys.size >= MAX_CIRCUIT_BREAKER_KEYS) {
        const oldestKey = this.circuitBreakerKeys.keys().next().value
        if (oldestKey) {
          this.circuitBreakerKeys.delete(oldestKey)
        }
      }
      const key = `webhook:${webhook.url}`
      this.circuitBreakerKeys.set(webhook.id, key)
    }
    return this.circuitBreakerKeys.get(webhook.id)!
  }
}

export const webhookQueueSystem = new WebhookQueueSystem()
