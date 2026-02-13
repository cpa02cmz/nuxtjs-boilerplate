import type { Resource } from '~/types/resource'
import { getRouterParam } from 'h3'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { updateResourceHealth } from '~/server/utils/resourceHealth'
import {
  sendNotFoundError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { contentConfig } from '~/configs/content.config'

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)
    const resourceId = getRouterParam(event, 'id')

    // Get all resources to find specific resource
    const resourcesModule = await import(contentConfig.paths.resourcesData)
    const resources: Resource[] = resourcesModule.default || resourcesModule
    const resource = resources.find((r: Resource) => r.id === resourceId)

    if (!resource) {
      sendNotFoundError(event, 'Resource', resourceId)
      return
    }

    // Perform health check
    const healthStatus = await updateResourceHealth(resource)

    return sendSuccessResponse(event, {
      healthStatus,
      resource: {
        id: resource.id,
        url: resource.url,
        status: resource.status || 'active',
      },
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
