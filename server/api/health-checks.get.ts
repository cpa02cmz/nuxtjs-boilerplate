import { defineEventHandler } from 'h3'
import { getAllResourceHealthStatuses } from '~/server/utils/resourceHealth'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'

export default defineEventHandler(async event => {
  await rateLimit(event)

  const healthStatuses = getAllResourceHealthStatuses()

  return {
    totalChecks: healthStatuses.length,
    healthStatuses,
    summary: {
      healthy: healthStatuses.filter(h => h.isHealthy).length,
      unhealthy: healthStatuses.filter(h => h.isHealthy === false).length,
      unknown: healthStatuses.filter(h => h.lastStatus === null).length,
    },
    lastUpdated: new Date().toISOString(),
  }
})
