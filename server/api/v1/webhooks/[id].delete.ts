import { webhookStorage } from '~/server/utils/webhookStorage'
import {
  sendSuccessResponse,
  sendNotFoundError,
  sendUnauthorizedError,
  sendBadRequestError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { getRouterParam } from 'h3'

export default defineEventHandler(async event => {
  try {
    // Apply rate limiting: 20 requests per minute for webhook deletion
    await rateLimit(event, 'webhook-delete')

    // Check authentication
    if (!event.context.apiKey) {
      return sendUnauthorizedError(event, 'Authentication required')
    }

    // BUGFIXER FIX #3470: Add proper ID parameter validation
    // Use getRouterParam helper and validate the ID exists
    const id = getRouterParam(event, 'id')
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return sendBadRequestError(
        event,
        'Webhook ID is required and must be a valid string'
      )
    }

    // Find webhook by ID
    const webhook = await webhookStorage.getWebhookById(id)
    if (!webhook) {
      return sendNotFoundError(event, 'Webhook', id)
    }

    // Remove webhook
    const deleted = await webhookStorage.deleteWebhook(id)
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
