import type { WebhookQueueItem } from '~/types/webhook'
import { webhookStorage } from './webhookStorage'

export class WebhookQueueManager {
  private isProcessing = false
  private processorInterval: NodeJS.Timeout | null = null
  private processCallback: ((item: WebhookQueueItem) => Promise<void>) | null =
    null

  enqueue(item: WebhookQueueItem): void {
    webhookStorage.addToQueue(item)
  }

  dequeue(): WebhookQueueItem | null {
    const queue = webhookStorage.getQueue()
    if (queue.length === 0) {
      return null
    }

    const item = queue[0]
    webhookStorage.removeFromQueue(item.id)
    return item
  }

  getPendingItems(): WebhookQueueItem[] {
    return webhookStorage.getQueue()
  }

  remove(id: string): void {
    webhookStorage.removeFromQueue(id)
  }

  startProcessor(callback: (item: WebhookQueueItem) => Promise<void>): void {
    this.processCallback = callback

    if (this.isProcessing) {
      return
    }

    this.isProcessing = true
    this.processorInterval = setInterval(() => {
      this.processQueue()
    }, 5000)
  }

  stopProcessor(): void {
    if (this.processorInterval) {
      clearInterval(this.processorInterval)
      this.processorInterval = null
    }
    this.isProcessing = false
  }

  private async processQueue(): Promise<void> {
    const queue = webhookStorage.getQueue()
    const now = new Date()

    for (const item of queue) {
      const scheduledFor = new Date(item.scheduledFor)

      if (scheduledFor <= now && this.processCallback) {
        try {
          await this.processCallback(item)
        } catch (error) {
          console.error(`Error processing queue item ${item.id}:`, error)
        }
      }
    }
  }

  getQueueSize(): number {
    return webhookStorage.getQueue().length
  }

  isRunning(): boolean {
    return this.isProcessing
  }

  getNextScheduledTime(): string | null {
    const queue = webhookStorage.getQueue()
    return queue.length > 0 ? queue[0].scheduledFor : null
  }
}

export const webhookQueueManager = new WebhookQueueManager()
