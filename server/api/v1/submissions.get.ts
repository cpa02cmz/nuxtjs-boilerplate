import { setResponseHeaders } from 'h3'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { logger } from '~/utils/logger'

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)

    // Deprecation headers for backward compatibility
    // Legacy /api/submissions now proxies to this endpoint
    setResponseHeaders(event, {
      Sunset: 'Mon, 01 Jun 2026 00:00:00 GMT',
      Deprecation: 'true',
      Link: '</api/v2/submissions>; rel="successor-version"',
    })

    const responseData = {
      submissions: [],
      note: 'Submissions are not currently persisted to database',
      deprecationWarning:
        'This endpoint is deprecated. Please migrate to /api/v2/submissions',
    }

    return sendSuccessResponse(event, responseData)
  } catch (error) {
    logger.error('Error fetching submissions:', error)
    return handleApiRouteError(event, error)
  }
})
