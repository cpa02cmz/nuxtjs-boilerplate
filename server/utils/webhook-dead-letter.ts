import type {
  Webhook,
  WebhookQueueItem,
  DeadLetterWebhook,
} from '~/types/webhook'
import { randomUUID } from 'node:crypto'
import { webhookStorage } from './webhookStorage'

export class DeadLetterManager {
  addToDeadLetter(
    item: WebhookQueueItem,
    webhook: Webhook,
    error: Error | null
  ): void {
    const deliveries = webhookStorage.getDeliveriesByWebhookId(webhook.id)
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
      deliveryAttempts: failedDeliveries,
    }

    webhookStorage.addToDeadLetterQueue(deadLetterItem)
  }

  removeFromDeadLetter(id: string): void {
    webhookStorage.removeFromDeadLetterQueue(id)
  }

  getDeadLetterItems(): DeadLetterWebhook[] {
    return webhookStorage.getDeadLetterQueue()
  }

  getDeadLetterItemById(id: string): DeadLetterWebhook | null {
    return webhookStorage.getDeadLetterWebhookById(id)
  }

  getDeadLetterItemsByWebhookId(webhookId: string): DeadLetterWebhook[] {
    return webhookStorage
      .getDeadLetterQueue()
      .filter(item => item.webhookId === webhookId)
  }

  retry(
    id: string,
    enqueueCallback: (item: WebhookQueueItem) => void
  ): boolean {
    const deadLetterItem = webhookStorage.getDeadLetterWebhookById(id)
    if (!deadLetterItem) {
      return false
    }

    const webhook = webhookStorage.getWebhookById(deadLetterItem.webhookId)
    if (!webhook) {
      return false
    }

    webhookStorage.removeFromDeadLetterQueue(id)

    const queueItem: WebhookQueueItem = {
      id: `q_${randomUUID()}`,
      webhookId: webhook.id,
      event: deadLetterItem.event,
      payload: deadLetterItem.payload,
      priority: 10,
      scheduledFor: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      retryCount: 0,
      maxRetries: 3,
    }

    enqueueCallback(queueItem)
    return true
  }

  getDeadLetterCount(): number {
    return webhookStorage.getDeadLetterQueue().length
  }

  getDeadLetterCountByWebhookId(webhookId: string): number {
    return webhookStorage
      .getDeadLetterQueue()
      .filter(item => item.webhookId === webhookId).length
  }

  clearDeadLetterQueue(): void {
    const deadLetterItems = webhookStorage.getDeadLetterQueue()
    deadLetterItems.forEach(item => {
      webhookStorage.removeFromDeadLetterQueue(item.id)
    })
  }
}

export const deadLetterManager = new DeadLetterManager()
