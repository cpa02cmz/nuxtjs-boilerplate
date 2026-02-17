import type {
  Webhook,
  WebhookQueueItem,
  DeadLetterWebhook,
} from '~/types/webhook'
import { randomUUID } from 'node:crypto'
import { webhookStorage } from './webhookStorage'
import { webhooksConfig } from '~/configs/webhooks.config'
import logger from '~/utils/logger'
import {
  deadLetterEventEmitter,
  checkDeadLetterThresholds,
} from './dead-letter-alerts'
import { TIME } from './constants'
import { calculateBackoff } from './retry'

export class DeadLetterManager {
  async addToDeadLetter(
    item: WebhookQueueItem,
    webhook: Webhook,
    error: Error | null
  ): Promise<void> {
    // FIX #3064: Add try-catch around addToDeadLetterQueue call with error logging
    try {
      const deliveries = await webhookStorage.getDeliveriesByWebhookId(
        webhook.id
      )
      const failedDeliveries = deliveries
        .filter(d => d.webhookId === webhook.id && d.status === 'failed')
        .slice(-item.retryCount)

      const deadLetterItem: DeadLetterWebhook = {
        id: `dl_${randomUUID()}`,
        webhookId: webhook.id,
        event: item.event,
        payload: item.payload,
        failureReason: error?.message || 'Max retries exceeded',
        lastAttemptAt: new Date().toISOString(),
        createdAt: item.createdAt,
        updatedAt: new Date().toISOString(),
        deliveryAttempts: failedDeliveries,
      }

      await webhookStorage.addToDeadLetterQueue(deadLetterItem)

      // Emit dead letter alert events (Issue #2724)
      await checkDeadLetterThresholds(deadLetterItem, deadLetterEventEmitter)
    } catch (dlqError) {
      logger.error(
        `CRITICAL: Failed to add webhook ${webhook.id} to dead letter queue. Failed webhook data may be lost.`,
        {
          webhookId: webhook.id,
          queueItemId: item.id,
          event: item.event,
          error:
            dlqError instanceof Error ? dlqError.message : String(dlqError),
        }
      )
      // Re-throw to allow caller to handle the failure
      throw dlqError
    }
  }

  async removeFromDeadLetter(id: string): Promise<void> {
    await webhookStorage.removeFromDeadLetterQueue(id)
  }

  async getDeadLetterItems(): Promise<DeadLetterWebhook[]> {
    return await webhookStorage.getDeadLetterQueue()
  }

  async getDeadLetterItemById(id: string): Promise<DeadLetterWebhook | null> {
    return await webhookStorage.getDeadLetterWebhookById(id)
  }

  async getDeadLetterItemsByWebhookId(
    webhookId: string
  ): Promise<DeadLetterWebhook[]> {
    const items = await webhookStorage.getDeadLetterQueue()
    return items.filter(item => item.webhookId === webhookId)
  }

  async getDeadLetterCount(): Promise<number> {
    const queue = await webhookStorage.getDeadLetterQueue()
    return queue.length
  }

  async getDeadLetterCountByWebhookId(webhookId: string): Promise<number> {
    const queue = await webhookStorage.getDeadLetterQueue()
    return queue.filter(item => item.webhookId === webhookId).length
  }

  async clearDeadLetterQueue(): Promise<void> {
    const deadLetterItems = await webhookStorage.getDeadLetterQueue()
    for (const item of deadLetterItems) {
      await webhookStorage.removeFromDeadLetterQueue(item.id)
    }
  }

  /**
   * Clean up dead letter queue items older than the retention period
   * @param retentionDays Number of days to retain items (default: from webhooksConfig)
   * @returns Number of items deleted
   */
  // Flexy hates hardcoded 30! Using webhooksConfig.deadLetter.retentionDays
  async cleanupOldItems(
    retentionDays: number = webhooksConfig.deadLetter.retentionDays
  ): Promise<number> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - retentionDays)

    const deadLetterItems = await webhookStorage.getDeadLetterQueue()
    const itemsToDelete = deadLetterItems.filter(item => {
      const createdAt = new Date(item.createdAt)
      return createdAt < cutoff
    })

    for (const item of itemsToDelete) {
      await webhookStorage.removeFromDeadLetterQueue(item.id)
    }

    if (itemsToDelete.length > 0) {
      logger.info(
        `[DeadLetter] Cleaned up ${itemsToDelete.length} items older than ${retentionDays} days`
      )
    }

    return itemsToDelete.length
  }

  async retry(
    id: string,
    enqueueCallback: (item: WebhookQueueItem) => Promise<void>
  ): Promise<boolean> {
    const deadLetterItem = await webhookStorage.getDeadLetterWebhookById(id)
    if (!deadLetterItem) {
      return false
    }

    const webhook = await webhookStorage.getWebhookById(
      deadLetterItem.webhookId
    )
    if (!webhook) {
      return false
    }

    await webhookStorage.removeFromDeadLetterQueue(id)

    const queueItem: WebhookQueueItem = {
      id: `q_${randomUUID()}`,
      webhookId: webhook.id,
      event: deadLetterItem.event,
      payload: deadLetterItem.payload,
      // Flexy hates hardcoded 10! Using webhooksConfig.deadLetter.retryPriority
      priority: webhooksConfig.deadLetter.retryPriority,
      scheduledFor: new Date(
        Date.now() +
          calculateBackoff(
            0,
            webhooksConfig.retry.baseDelayMs,
            webhooksConfig.retry.maxDelayMs,
            true,
            webhooksConfig.retry.jitterFactor
          )
      ).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      retryCount: 0,
      maxRetries: webhooksConfig.delivery.maxRetries,
    }

    await enqueueCallback(queueItem)
    return true
  }

  /**
   * Get dead letter queue metrics for health monitoring (Issue #2724)
   * @returns Metrics including count, recent items, and webhook-specific stats
   */
  async getMetrics(timeWindowMinutes: number = 60): Promise<{
    totalCount: number
    recentCount: number
    webhookStats: Map<string, number>
    oldestItemAge: number | null
    alertThresholdExceeded: boolean
  }> {
    const allItems = await webhookStorage.getDeadLetterQueue()
    const cutoff = new Date()
    cutoff.setMinutes(cutoff.getMinutes() - timeWindowMinutes)

    const recentItems = allItems.filter(
      item => new Date(item.createdAt) > cutoff
    )

    // Calculate webhook-specific stats
    const webhookStats = new Map<string, number>()
    for (const item of allItems) {
      const count = webhookStats.get(item.webhookId) || 0
      webhookStats.set(item.webhookId, count + 1)
    }

    // Find oldest item age in hours
    let oldestItemAge: number | null = null
    if (allItems.length > 0) {
      const oldestItem = allItems.reduce((oldest, item) =>
        new Date(item.createdAt) < new Date(oldest.createdAt) ? item : oldest
      )
      // Flexy hates hardcoded 1000 * 60 * 60! Using TIME.MS_PER_HOUR constant
      oldestItemAge = Math.floor(
        (Date.now() - new Date(oldestItem.createdAt).getTime()) /
          TIME.MS_PER_HOUR
      )
    }

    // Check if alert thresholds are exceeded
    const config = deadLetterEventEmitter.getConfig()
    const alertThresholdExceeded =
      config.enabled &&
      (allItems.length >= config.thresholds.totalCount ||
        Array.from(webhookStats.values()).some(
          count => count >= config.thresholds.webhookSpecificCount
        ))

    return {
      totalCount: allItems.length,
      recentCount: recentItems.length,
      webhookStats,
      oldestItemAge,
      alertThresholdExceeded,
    }
  }
}

export const deadLetterManager = new DeadLetterManager()
