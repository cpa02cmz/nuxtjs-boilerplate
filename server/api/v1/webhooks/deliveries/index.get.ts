import { defineEventHandler, getQuery } from 'h3'
import { webhookStorage } from '~/server/utils/webhookStorage'
import {
  sendSuccessResponse,
  sendUnauthorizedError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'

export default defineEventHandler(async event => {
  try {
    // Check authentication
    if (!event.context.apiKey) {
      return sendUnauthorizedError(event, 'Authentication required')
    }

    // Apply rate limiting: 30 requests per minute for delivery listing
    await rateLimit(event)

    const query = getQuery(event)
    const webhookId = query.webhookId as string | undefined
    const status = query.status as string | undefined

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
