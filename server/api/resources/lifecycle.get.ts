import type { Resource } from '~/types/resource'
import { getResourceHealthStats } from '~/server/utils/resourceHealth'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { contentConfig } from '~/configs/content.config'

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)
    // Get all resources
    const resourcesModule = await import(contentConfig.paths.resourcesData)
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Count resources by status
    const statusCounts: Record<string, number> = {
      active: 0,
      deprecated: 0,
      discontinued: 0,
      updated: 0,
      pending: 0,
    }

    const resourcesByStatus: Record<string, Resource[]> = {
      active: [],
      deprecated: [],
      discontinued: [],
      updated: [],
      pending: [],
    }

    resources.forEach((resource: Resource) => {
      const status = resource.status || 'active'
      if (Object.prototype.hasOwnProperty.call(statusCounts, status)) {
        statusCounts[status] = (statusCounts[status] ?? 0) + 1
        if (resourcesByStatus[status]) {
          resourcesByStatus[status].push(resource)
        }
      } else {
        statusCounts.active = (statusCounts.active ?? 0) + 1
        resourcesByStatus.active?.push(resource)
      }
    })

    // Get health stats
    const healthStats = getResourceHealthStats()

    return sendSuccessResponse(event, {
      totalResources: resources.length,
      statusBreakdown: statusCounts,
      resourcesByStatus,
      healthStats,
      reportGeneratedAt: new Date().toISOString(),
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
