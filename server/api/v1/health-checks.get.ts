import { createApiRoute } from '~/server/utils/create-api-route'
import { getAllResourceHealthStatuses } from '~/server/utils/resourceHealth'

/**
 * GET /api/v1/health-checks
 *
 * Retrieve health status for all monitored resources
 * Uses standardized API route wrapper for consistent error handling and logging
 */
export default createApiRoute(
  async () => {
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

    return {
      totalChecks: healthStatuses.length,
      healthStatuses,
      summary,
      lastUpdated: new Date().toISOString(),
    }
  },
  {
    logContext: 'api-v1-health-checks',
    logMetadata: {
      endpoint: '/api/v1/health-checks',
      description: 'Health status for all monitored resources',
    },
  }
)
