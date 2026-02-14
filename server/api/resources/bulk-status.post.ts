import { defineEventHandler, readBody, getHeader } from 'h3'
import type { Resource } from '~/types/resource'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendBadRequestError,
  sendSuccessResponse,
  sendUnauthorizedError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { paginationConfig } from '~/configs/pagination.config'
import { contentConfig } from '~/configs/content.config'

// Maximum number of resources that can be updated in a single bulk request
// Flexy hates hardcoded limits! Using config instead
const MAX_BULK_UPDATE_COUNT = paginationConfig.limits.maxBulkUpdateItems

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)

    // Authentication check - require valid API key
    const authApiKey = getHeader(event, 'X-API-Key')
    if (!authApiKey) {
      return sendUnauthorizedError(event, 'API key required')
    }

    const { resourceIds, status } = await readBody(event)

    // Validate required fields
    if (!Array.isArray(resourceIds) || !status) {
      return sendBadRequestError(
        event,
        'resourceIds array and status are required'
      )
    }

    // Validate array length to prevent DoS via memory exhaustion
    if (resourceIds.length > MAX_BULK_UPDATE_COUNT) {
      return sendBadRequestError(
        event,
        `Cannot update more than ${MAX_BULK_UPDATE_COUNT} resources at once`
      )
    }

    // Validate status value
    const validStatuses = [
      'active',
      'deprecated',
      'discontinued',
      'updated',
      'pending',
    ]
    if (!validStatuses.includes(status)) {
      return sendBadRequestError(event, 'Invalid status value')
    }

    // Get all resources
    const resourcesModule = await import(contentConfig.paths.resourcesData)
    const resources: Resource[] = resourcesModule.default || resourcesModule

    const updatedResources = []
    const errors = []

    for (const resourceId of resourceIds) {
      const resource = resources.find((r: Resource) => r.id === resourceId)

      if (!resource) {
        errors.push({
          resourceId,
          error: 'Resource not found',
        })
        continue
      }

      // Update resource with new status
      const updatedResource: Resource = {
        ...resource,
        status,
        lastUpdated: new Date().toISOString(),
      }

      updatedResources.push({
        id: updatedResource.id,
        status: updatedResource.status,
        title: updatedResource.title,
      })
    }

    return sendSuccessResponse(event, {
      updatedCount: updatedResources.length,
      errorCount: errors.length,
      updatedResources,
      errors,
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
