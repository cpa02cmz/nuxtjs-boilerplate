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
    if (eventFilter) {
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
