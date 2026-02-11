import { webhookQueueSystem } from '~/server/utils/webhookQueue'
import { webhookStorage } from '~/server/utils/webhookStorage'
import {
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'

export default defineEventHandler(async event => {
  try {
    // Apply rate limiting: 30 requests per minute for queue status
    await rateLimit(event)

    const queueStats = await webhookQueueSystem.getQueueStats()
    const queue = await webhookStorage.getQueue()
    const deadLetterQueue = await webhookStorage.getDeadLetterQueue()

    return sendSuccessResponse(event, {
      stats: queueStats,
      queue: queue.map(item => ({
        id: item.id,
        webhookId: item.webhookId,
        event: item.event,
        scheduledFor: item.scheduledFor,
        retryCount: item.retryCount,
        maxRetries: item.maxRetries,
        createdAt: item.createdAt,
      })),
      deadLetterQueue: deadLetterQueue.map(dl => ({
        id: dl.id,
        webhookId: dl.webhookId,
        event: dl.event,
        failureReason: dl.failureReason,
        lastAttemptAt: dl.lastAttemptAt,
        deliveryAttempts: dl.deliveryAttempts.length,
        createdAt: dl.createdAt,
      })),
    })
  } catch (error) {
    handleApiRouteError(event, error)
  }
})
