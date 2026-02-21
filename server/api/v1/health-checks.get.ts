import { defineEventHandler } from 'h3'
import { getAllResourceHealthStatuses } from '~/server/utils/resourceHealth'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)

    const healthStatuses = getAllResourceHealthStatuses()

    // Performance: Single-pass reduce instead of three filter calls (O(3n) → O(n))
    const summary = healthStatuses.reduce(
      (acc, h) => ({
        healthy: acc.healthy + (h.isHealthy ? 1 : 0),
        unhealthy: acc.unhealthy + (h.isHealthy === false ? 1 : 0),
        unknown: acc.unknown + (h.lastStatus === null ? 1 : 0),
      }),
      { healthy: 0, unhealthy: 0, unknown: 0 }
    )

    const responseData = {
      totalChecks: healthStatuses.length,
      healthStatuses,
      summary,
      lastUpdated: new Date().toISOString(),
    }

    return sendSuccessResponse(event, responseData)
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
