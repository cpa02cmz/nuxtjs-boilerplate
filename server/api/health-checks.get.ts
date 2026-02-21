import { defineEventHandler, setResponseHeaders } from 'h3'
import { apiConfig } from '~/configs/api.config'
import { getAllResourceHealthStatuses } from '~/server/utils/resourceHealth'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  wrapApiHandler,
} from '~/server/utils/api-response'

// [-engineer] Refactored to use wrapApiHandler for standardized error handling
export default defineEventHandler(
  wrapApiHandler(async event => {
    await rateLimit(event)

    // Deprecation headers for backward compatibility
    setResponseHeaders(event, {
      Sunset: apiConfig.deprecation.sunsetDate,
      Deprecation: 'true',
      Link: `<${apiConfig.deprecation.healthChecksSuccessorUrl}>; rel="successor-version"`,
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
  })
)
