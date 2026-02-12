import { webhookQueueSystem } from '~/server/utils/webhookQueue'
import {
  sendNotFoundError,
  sendSuccessResponse,
  sendUnauthorizedError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'

export default defineEventHandler(async event => {
  try {
    // Apply rate limiting: 10 requests per minute for webhook retries
    await rateLimit(event, 'webhook-retry')

    // Check authentication
    if (!event.context.apiKey) {
      return sendUnauthorizedError(event, 'Authentication required')
    }

    const id = getRouterParam(event, 'id')

    if (!id) {
      sendNotFoundError(event, 'Dead Letter Webhook', id)
      return
    }

    const success = await webhookQueueSystem.retryDeadLetterWebhook(id)

    if (!success) {
      sendNotFoundError(event, 'Dead Letter Webhook', id)
      return
    }

    return sendSuccessResponse(event, {
      message: 'Webhook re-queued for delivery',
      id,
    })
  } catch (error) {
    handleApiRouteError(event, error)
  }
})
