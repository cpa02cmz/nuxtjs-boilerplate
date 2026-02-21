import { defineEventHandler, readBody, getHeader } from 'h3'
import type { Resource } from '~/types/resource'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendBadRequestError,
  sendSuccessResponse,
  sendUnauthorizedError,
  sendForbiddenError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { paginationConfig } from '~/configs/pagination.config'
import { contentConfig } from '~/configs/content.config'
import { bulkStatusUpdateSchema } from '~/server/utils/validation-schemas'
import { webhookStorage } from '~/server/utils/webhookStorage'

// Maximum number of resources that can be updated in a single bulk request
// Flexy hates hardcoded limits! Using config instead
const MAX_BULK_UPDATE_COUNT = paginationConfig.limits.maxBulkUpdateItems

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)

    // Security Engineer FIX: Add proper API key validation and permission check
    // Previously only checked header presence without validating key or permissions
    // CWE-284: Improper Access Control - Any API key could bulk update resources
    const authApiKey = getHeader(event, 'X-API-Key')
    if (!authApiKey) {
      return sendUnauthorizedError(event, 'API key required')
    }

    // Validate API key
    const storedKey = await webhookStorage.getApiKeyByValue(authApiKey)
    if (!storedKey || !storedKey.active) {
      return sendUnauthorizedError(event, 'Invalid or inactive API key')
    }

    // Security Engineer FIX: Check for required permissions
    // Bulk status update requires write, delete, or admin permission
    const hasRequiredPermission =
      storedKey.permissions?.includes('write') ||
      storedKey.permissions?.includes('delete') ||
      storedKey.permissions?.includes('admin')

    if (!hasRequiredPermission) {
      return sendForbiddenError(
        event,
        'Insufficient permissions. Bulk status update requires write, delete, or admin permission.'
      )
    }

    const body = await readBody(event)

    // Validate using Zod schema
    const validationResult = bulkStatusUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map(e => e.message)
        .join(', ')
      return sendBadRequestError(event, errorMessage)
    }

    const { resourceIds, status } = validationResult.data

    // Validate array length to prevent DoS via memory exhaustion
    if (resourceIds.length > MAX_BULK_UPDATE_COUNT) {
      return sendBadRequestError(
        event,
        `Cannot update more than ${MAX_BULK_UPDATE_COUNT} resources at once`
      )
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
