import { webhookStorage } from '~/server/utils/webhookStorage'
import {
  sendSuccessResponse,
  sendNotFoundError,
  sendUnauthorizedError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'

export default defineEventHandler(async event => {
  try {
    // Apply rate limiting: 20 requests per minute for webhook deletion
    await rateLimit(event, 'webhook-delete')

    // Check authentication
    if (!event.context.apiKey) {
      return sendUnauthorizedError(event, 'Authentication required')
    }

    const id = event.context.params?.id

    // Find webhook by ID
    const webhook = await webhookStorage.getWebhookById(id as string)
    if (!webhook) {
      return sendNotFoundError(event, 'Webhook', id)
    }

    // Remove webhook
    const deleted = await webhookStorage.deleteWebhook(id as string)
    if (!deleted) {
      return sendNotFoundError(event, 'Webhook', id)
    }

    return sendSuccessResponse(event, {
      message: 'Webhook deleted successfully',
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
