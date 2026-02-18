import { defineEventHandler, setResponseHeader } from 'h3'
import type { Resource } from '~/types/resource'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  handleApiRouteError,
  sendForbiddenError,
} from '~/server/utils/api-response'
import { contentConfig } from '~/configs/content.config'
import { logger } from '~/utils/logger'

/**
 * GET /api/v1/export/json
 *
 * Export all resources as JSON format
 * P2 Security Fix: Issue #3336 - Added authentication and permission checks
 */
export default defineEventHandler(async event => {
  try {
    await rateLimit(event)

    // P2 Security Fix: Issue #3336 - Verify authentication
    if (!event.context.apiKey) {
      logger.warn('Unauthorized export attempt - no API key', {
        path: event.path,
        method: event.method,
        ip: event.node.req.socket.remoteAddress,
      })
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required for export',
      })
    }

    // P2 Security Fix: Issue #3336 - Verify export permission
    const apiKey = event.context.apiKey
    const hasExportPermission =
      apiKey.permissions?.includes('export:read') ||
      apiKey.permissions?.includes('admin') ||
      apiKey.permissions?.length === 0 // Backward compatibility: keys without permissions can export

    if (!hasExportPermission) {
      logger.warn('Forbidden export attempt - insufficient permissions', {
        path: event.path,
        method: event.method,
        apiKeyId: apiKey.id,
        apiKeyName: apiKey.name,
        permissions: apiKey.permissions,
        ip: event.node.req.socket.remoteAddress,
      })
      return sendForbiddenError(
        event,
        'Insufficient permissions for export. Required: export:read or admin.'
      )
    }

    // Import resources from JSON
    const resourcesModule = await import(contentConfig.paths.resourcesData)
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Set appropriate content type for JSON
    setResponseHeader(event, 'Content-Type', 'application/json')
    setResponseHeader(
      event,
      'Content-Disposition',
      'attachment; filename="resources.json"'
    )

    return resources
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
