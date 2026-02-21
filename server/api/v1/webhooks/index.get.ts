import { defineEventHandler, getQuery } from 'h3'
import { webhookStorage } from '~/server/utils/webhookStorage'
import {
  sendSuccessResponse,
  sendUnauthorizedError,
  sendBadRequestError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'

/**
 * Sanitizes query parameter to prevent prototype pollution
 * Only allows alphanumeric characters, hyphens, and underscores
 * Issue #3303 fix - Security: Query parameter prototype pollution risk
 */
const isValidEventFilter = (filter: string): boolean => {
  return /^[a-zA-Z0-9_-]+$/.test(filter)
}

export default defineEventHandler(async event => {
  try {
    // Check authentication
    if (!event.context.apiKey) {
      return sendUnauthorizedError(event, 'Authentication required')
    }

    // Apply rate limiting: 30 requests per minute for webhook listing
    await rateLimit(event)

    // Get query parameters for filtering
    const query = getQuery(event)
    const active = query.active as string | undefined
    const eventFilter = query.event as string | undefined

    let filteredWebhooks = await webhookStorage.getAllWebhooks()

    // Filter by active status
    if (active !== undefined) {
      const isActive = active === 'true'
      filteredWebhooks = filteredWebhooks.filter(w => w.active === isActive)
    }

    // Filter by event type
    // Issue #3303: Sanitize eventFilter to prevent prototype pollution
    // Return 400 for invalid filter instead of silently ignoring
    if (eventFilter) {
      if (!isValidEventFilter(eventFilter)) {
        return sendBadRequestError(
          event,
          'Invalid event filter parameter',
          'Event filter must contain only alphanumeric characters, hyphens, and underscores'
        )
      }
      filteredWebhooks = filteredWebhooks.filter(w =>
        w.events.includes(eventFilter)
      )
    }

    // Return webhooks without secrets for security
    const webhooksWithoutSecrets = filteredWebhooks.map(
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      ({ secret: _secretValue, ...webhook }) => webhook
    )

    return sendSuccessResponse(event, {
      data: webhooksWithoutSecrets,
      count: filteredWebhooks.length,
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
