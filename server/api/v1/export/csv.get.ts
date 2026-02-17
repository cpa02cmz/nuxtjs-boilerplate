import { defineEventHandler, setResponseHeader, createError } from 'h3'
import type { Resource } from '~/types/resource'
import { resourcesToCsv } from '~/utils/csv'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  handleApiRouteError,
  sendForbiddenError,
} from '~/server/utils/api-response'
import { contentConfig } from '~/configs/content.config'
import { logger } from '~/utils/logger'

/**
 * GET /api/v1/export/csv
 *
 * Export all resources as CSV format
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
      sendForbiddenError(
        event,
        'Insufficient permissions for export. Required: export:read or admin.'
      )
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: Insufficient permissions for export',
      })
    }

    // Import resources from JSON
    const resourcesModule = await import(contentConfig.paths.resourcesData)
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Convert resources to CSV
    const csvContent = resourcesToCsv(resources)

    // Set appropriate content type for CSV
    setResponseHeader(event, 'Content-Type', 'text/csv')
    setResponseHeader(
      event,
      'Content-Disposition',
      'attachment; filename="resources.csv"'
    )

    return csvContent
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
