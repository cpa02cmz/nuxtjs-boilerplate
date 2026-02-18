import { defineEventHandler, setResponseHeaders } from 'h3'
import { getAllResourceHealthStatuses } from '~/server/utils/resourceHealth'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)

    // Deprecation headers for backward compatibility
    setResponseHeaders(event, {
      Sunset: 'Mon, 01 Jun 2026 00:00:00 GMT',
      Deprecation: 'true',
      Link: '</api/v1/health-checks>; rel="successor-version"',
    })

    const healthStatuses = getAllResourceHealthStatuses()

    const responseData = {
      totalChecks: healthStatuses.length,
      healthStatuses,
      summary: {
        healthy: healthStatuses.filter(h => h.isHealthy).length,
        unhealthy: healthStatuses.filter(h => h.isHealthy === false).length,
        unknown: healthStatuses.filter(h => h.lastStatus === null).length,
      },
      lastUpdated: new Date().toISOString(),
    }

    return sendSuccessResponse(event, responseData)
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
