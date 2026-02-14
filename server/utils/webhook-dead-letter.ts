import type {
  Webhook,
  WebhookQueueItem,
  DeadLetterWebhook,
} from '~/types/webhook'
import { randomUUID } from 'node:crypto'
import { webhookStorage } from './webhookStorage'
import { webhooksConfig } from '~/configs/webhooks.config'
import logger from '~/utils/logger'

export class DeadLetterManager {
  async addToDeadLetter(
    item: WebhookQueueItem,
    webhook: Webhook,
    error: Error | null
  ): Promise<void> {
    const deliveries = await webhookStorage.getDeliveriesByWebhookId(webhook.id)
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
   * @param retentionDays Number of days to retain items (default: 30)
   * @returns Number of items deleted
   */
  async cleanupOldItems(retentionDays: number = 30): Promise<number> {
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
      priority: 10,
      scheduledFor: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      retryCount: 0,
      maxRetries: webhooksConfig.delivery.maxRetries,
    }

    await enqueueCallback(queueItem)
    return true
  }
}

export const deadLetterManager = new DeadLetterManager()
