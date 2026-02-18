import { defineEventHandler, getQuery } from 'h3'
import { webhookStorage } from '~/server/utils/webhookStorage'
import {
  sendSuccessResponse,
  sendBadRequestError,
  sendUnauthorizedError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { webhookDeliveriesQuerySchema } from '~/server/utils/validation-schemas'

export default defineEventHandler(async event => {
  try {
    // Check authentication
    if (!event.context.apiKey) {
      return sendUnauthorizedError(event, 'Authentication required')
    }

    // Apply rate limiting: 30 requests per minute for delivery listing
    await rateLimit(event)

    const query = getQuery(event)

    // BugFixer: Fixed Issue #3902 - Add validation for query parameters
    const validatedQuery = webhookDeliveriesQuerySchema.safeParse(query)
    if (!validatedQuery.success) {
      return sendBadRequestError(
        event,
        'Invalid query parameters: ' +
          validatedQuery.error.issues.map(i => i.message).join(', ')
      )
    }

    const { webhookId, status } = validatedQuery.data

    let deliveries = await webhookStorage.getAllDeliveries()

    // Filter by webhook ID if provided
    if (webhookId) {
      deliveries = deliveries.filter(d => d.webhookId === webhookId)
    }

    // Filter by status if provided
    if (status) {
      deliveries = deliveries.filter(d => d.status === status)
    }

    return sendSuccessResponse(event, {
      deliveries,
      count: deliveries.length,
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
