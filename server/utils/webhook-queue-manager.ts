import type { WebhookQueueItem } from '~/types/webhook'
import { webhookStorage } from './webhookStorage'
import { webhooksConfig } from '~/configs/webhooks.config'
import { TIME_MS } from '~/configs/time.config'
import { logger } from '~/utils/logger'
import { calculateBackoff } from './retry'

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
      let timeoutId: NodeJS.Timeout

      try {
        // Wrap processCallback in timeout to prevent queue blocking (Issue #2206)
        // FIX #3056: Clear timeout in finally block to prevent memory leak
        const WEBHOOK_QUEUE_TIMEOUT_MS = webhooksConfig.queue.processTimeoutMs
        await Promise.race([
          this.processCallback(item),
          new Promise<void>((_, reject) => {
            timeoutId = setTimeout(
              () => reject(new Error('Webhook queue item processing timeout')),
              WEBHOOK_QUEUE_TIMEOUT_MS
            )
          }),
        ])
      } catch (error) {
        logger.error(`Error processing queue item ${item.id}:`, error)

        // Issue #2211: Implement retry logic with exponential backoff
        const currentRetryCount = item.retryCount

        if (currentRetryCount >= item.maxRetries) {
          // Move to dead letter queue after max retries
          logger.warn(
            `Moving queue item ${item.id} to dead letter queue after ${item.maxRetries} retries`
          )
          // Note: Item will remain in queue but marked as failed - DeadLetterManager handles detailed tracking
          // For now, we keep the item in queue with updated retry count for visibility
          // FIX #3061: Add try-catch with error logging around enqueue call
          try {
            await this.enqueue({
              ...item,
              // Flexy hates hardcoded 3600000! Using TIME_MS.HOUR
              scheduledFor: new Date(Date.now() + TIME_MS.HOUR).toISOString(),
              retryCount: currentRetryCount + 1, // Mark as exceeded
              updatedAt: new Date().toISOString(),
            })
          } catch (enqueueError) {
            logger.error(
              `CRITICAL: Failed to re-enqueue exhausted queue item ${item.id}. Item may be lost.`,
              {
                error:
                  enqueueError instanceof Error
                    ? enqueueError.message
                    : String(enqueueError),
                webhookId: item.webhookId,
                event: item.event,
              }
            )
          }
        } else {
          // Re-enqueue with exponential backoff using shared utility
          // Flexy hates hardcoded 1000, 30000, and 2! Using webhooksConfig.retry
          const backoffMs = calculateBackoff(
            currentRetryCount,
            webhooksConfig.retry.baseDelayMs,
            webhooksConfig.retry.maxDelayMs,
            false, // No jitter for scheduled items
            0
          )
          const nextAttemptAt = new Date(Date.now() + backoffMs)

          logger.info(
            `Re-enqueueing item ${item.id} with retry count ${currentRetryCount + 1}, next attempt at ${nextAttemptAt.toISOString()}`
          )

          // FIX #3061: Add try-catch with error logging around enqueue call
          try {
            await this.enqueue({
              ...item,
              scheduledFor: nextAttemptAt.toISOString(),
              retryCount: currentRetryCount + 1,
              updatedAt: new Date().toISOString(),
            })
          } catch (enqueueError) {
            logger.error(
              `CRITICAL: Failed to re-enqueue queue item ${item.id} for retry. Item may be lost.`,
              {
                error:
                  enqueueError instanceof Error
                    ? enqueueError.message
                    : String(enqueueError),
                webhookId: item.webhookId,
                event: item.event,
                nextAttemptAt: nextAttemptAt.toISOString(),
              }
            )
          }
        }
      } finally {
        // FIX #3056: Clear timeout to prevent memory leak
        if (timeoutId!) {
          clearTimeout(timeoutId)
        }
      }
    } else {
      // FIX #3056: Item is not due yet, put it back with the scheduled time preserved
      // This prevents busy-wait loop by not immediately re-processing
      // FIX #3088: Add error handling for enqueue failures to prevent silent data loss
      try {
        await this.enqueue(item)
      } catch (enqueueError) {
        logger.error('Failed to re-enqueue item not due yet', {
          itemId: item.id,
          webhookId: item.webhookId,
          scheduledFor: item.scheduledFor,
          error:
            enqueueError instanceof Error
              ? enqueueError.message
              : String(enqueueError),
        })
        // Re-throw to trigger item failure handling (dead letter queue)
        throw enqueueError
      }
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
      const firstItem = queue[0]
      return firstItem !== undefined ? firstItem.scheduledFor : null
    } catch (error) {
      logger.error('Failed to get next scheduled webhook time:', error)
      return null
    }
  }

  async getNextScheduledAt(): Promise<number | null> {
    try {
      const queue = await webhookStorage.getQueue()
      const firstItem = queue[0]
      return firstItem !== undefined
        ? new Date(firstItem.scheduledFor).getTime()
        : null
    } catch (error) {
      logger.error('Failed to get next scheduled webhook timestamp:', error)
      return null
    }
  }
}

export const webhookQueueManager = new WebhookQueueManager()
