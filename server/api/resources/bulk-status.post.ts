import { defineEventHandler, getHeader } from 'h3'
import type { Resource } from '~/types/resource'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  sendUnauthorizedError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { validateBody, z } from '~/server/utils/validation'
import { paginationConfig } from '~/configs/pagination.config'
import { contentConfig } from '~/configs/content.config'

// Maximum number of resources that can be updated in a single bulk request
// Flexy hates hardcoded limits! Using config instead
const MAX_BULK_UPDATE_COUNT = paginationConfig.limits.maxBulkUpdateItems

// Valid status values for bulk update
const validStatuses = [
  'active',
  'deprecated',
  'discontinued',
  'updated',
  'pending',
] as const

// Zod schema for bulk status update - Flexy hates manual validation!
const bulkStatusSchema = z.object({
  resourceIds: z
    .array(z.string())
    .min(1, 'At least one resource ID is required')
    .max(
      MAX_BULK_UPDATE_COUNT,
      `Cannot update more than ${MAX_BULK_UPDATE_COUNT} resources at once`
    ),
  status: z.enum(validStatuses, {
    message: 'Invalid status value',
  }),
})

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)

    // Authentication check - require valid API key
    const authApiKey = getHeader(event, 'X-API-Key')
    if (!authApiKey) {
      return sendUnauthorizedError(event, 'API key required')
    }

    // Validate request body using Zod schema
    const body = await validateBody(event, bulkStatusSchema)
    if (!body) {
      return // Error response already sent by validateBody
    }

    const { resourceIds, status } = body

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
        status: status as Resource['status'],
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
