import type { Resource } from '~/types/resource'
import { getRouterParam } from 'h3'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendNotFoundError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)
    const resourceId = getRouterParam(event, 'id')

    // Get all resources to find specific resource
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule
    const resource = resources.find((r: Resource) => r.id === resourceId)

    if (!resource) {
      sendNotFoundError(event, 'Resource', resourceId)
      return
    }

    return sendSuccessResponse(event, {
      id: resource.id,
      title: resource.title,
      status: resource.status || 'active',
    })
  } catch (error) {
    handleApiRouteError(event, error)
  }
})
