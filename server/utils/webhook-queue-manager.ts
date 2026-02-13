import type { WebhookQueueItem } from '~/types/webhook'
import { webhookStorage } from './webhookStorage'
import { webhooksConfig } from '~/configs/webhooks.config'
import { logger } from '~/utils/logger'

export class WebhookQueueManager {
  private isProcessing = false
  private processorInterval: NodeJS.Timeout | null = null
  private processCallback: ((item: WebhookQueueItem) => Promise<void>) | null =
    null

  async enqueue(item: WebhookQueueItem): Promise<void> {
    try {
      await webhookStorage.addToQueue(item)
    } catch (error) {
      logger.error('Failed to enqueue webhook item:', error)
      throw error
    }
  }

  async dequeue(): Promise<WebhookQueueItem | null> {
    try {
      // Use atomic dequeue to prevent race conditions
      // This ensures only one worker can process each item
      return await webhookStorage.dequeueAtomic()
    } catch (error) {
      logger.error('Failed to dequeue webhook item:', error)
      return null
    }
  }

  async getPendingItems(): Promise<WebhookQueueItem[]> {
    try {
      return await webhookStorage.getQueue()
    } catch (error) {
      logger.error('Failed to get pending webhook items:', error)
      return []
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await webhookStorage.removeFromQueue(id)
    } catch (error) {
      logger.error(`Failed to remove webhook item ${id}:`, error)
      throw error
    }
  }

  startProcessor(callback: (item: WebhookQueueItem) => Promise<void>): void {
    this.processCallback = callback

    if (this.isProcessing) {
      return
    }

    this.isProcessing = true
    this.processorInterval = setInterval(() => {
      this.processQueue()
    }, webhooksConfig.queue.processorIntervalMs)
  }

  stopProcessor(): void {
    if (this.processorInterval) {
      clearInterval(this.processorInterval)
      this.processorInterval = null
    }
    this.isProcessing = false
  }

  private async processQueue(): Promise<void> {
    if (!this.processCallback) {
      return
    }

    // Process items atomically to prevent race conditions
    // dequeueAtomic ensures only one worker processes each item
    const item = await this.dequeue()

    if (!item) {
      return
    }

    const scheduledFor = new Date(item.scheduledFor)
    const now = new Date()

    // Only process if the item is due
    if (scheduledFor <= now) {
      try {
        // Wrap processCallback in timeout to prevent queue blocking (Issue #2206)
        const WEBHOOK_QUEUE_TIMEOUT_MS = webhooksConfig.queue.processTimeoutMs
        await Promise.race([
          this.processCallback(item),
          new Promise<void>((_, reject) =>
            setTimeout(
              () => reject(new Error('Webhook queue item processing timeout')),
              WEBHOOK_QUEUE_TIMEOUT_MS
            )
          ),
        ])
      } catch (error) {
        logger.error(`Error processing queue item ${item.id}:`, error)
      }
    } else {
      // Item is not due yet, re-enqueue it
      await this.enqueue(item)
    }
  }

  async getQueueSize(): Promise<number> {
    try {
      const queue = await webhookStorage.getQueue()
      return queue.length
    } catch (error) {
      logger.error('Failed to get webhook queue size:', error)
      return 0
    }
  }

  isRunning(): boolean {
    return this.isProcessing
  }

  async getNextScheduledTime(): Promise<string | null> {
    try {
      const queue = await webhookStorage.getQueue()
      return queue.length > 0 ? queue[0].scheduledFor : null
    } catch (error) {
      logger.error('Failed to get next scheduled webhook time:', error)
      return null
    }
  }

  async getNextScheduledAt(): Promise<number | null> {
    try {
      const queue = await webhookStorage.getQueue()
      return queue.length > 0 ? new Date(queue[0].scheduledFor).getTime() : null
    } catch (error) {
      logger.error('Failed to get next scheduled webhook timestamp:', error)
      return null
    }
  }
}

export const webhookQueueManager = new WebhookQueueManager()
