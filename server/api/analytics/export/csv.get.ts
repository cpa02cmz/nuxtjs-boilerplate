import {
  defineEventHandler,
  getQuery,
  setResponseHeader,
  createError,
} from 'h3'
import { exportAnalyticsToCsv } from '~/server/utils/analytics-db'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { handleApiRouteError } from '~/server/utils/api-response'
import { analyticsConfig } from '~/configs/analytics.config'
import { logger } from '~/utils/logger'

/**
 * GET /api/analytics/export/csv
 *
 * Export analytics data as CSV format
 * P1 Security Fix: Issue #3782 - Added authentication and permission checks
 */
export default defineEventHandler(async event => {
  try {
    await rateLimit(event)

    // P1 Security Fix: Issue #3782 - Verify authentication
    if (!event.context.apiKey) {
      logger.warn('Unauthorized analytics export attempt - no API key', {
        path: event.path,
        method: event.method,
        ip: event.node.req.socket.remoteAddress,
      })
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required for analytics export',
      })
    }

    // P1 Security Fix: Issue #3782 - Verify analytics read permission
    const apiKey = event.context.apiKey
    const hasAnalyticsPermission =
      apiKey.permissions?.includes('analytics:read') ||
      apiKey.permissions?.includes('admin') ||
      apiKey.permissions?.length === 0 // Backward compatibility: keys without permissions can export

    if (!hasAnalyticsPermission) {
      logger.warn(
        'Forbidden analytics export attempt - insufficient permissions',
        {
          path: event.path,
          method: event.method,
          apiKeyId: apiKey.id,
          apiKeyName: apiKey.name,
          permissions: apiKey.permissions,
          ip: event.node.req.socket.remoteAddress,
        }
      )
      throw createError({
        statusCode: 403,
        statusMessage:
          'Insufficient permissions for analytics export. Required: analytics:read or admin.',
      })
    }

    const query = getQuery(event)

    const startDate = query.startDate
      ? new Date(query.startDate as string)
      : new Date(
          Date.now() -
            analyticsConfig.dateRange.defaultDays *
              analyticsConfig.dateRange.msPerDay
        )
    const endDate = query.endDate
      ? new Date(query.endDate as string)
      : new Date()

    const csvContent = await exportAnalyticsToCsv(startDate, endDate)

    setResponseHeader(event, 'Content-Type', 'text/csv')
    setResponseHeader(
      event,
      'Content-Disposition',
      `attachment; filename="analytics-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv"`
    )

    setResponseHeader(event, 'Content-Length', Buffer.byteLength(csvContent))

    return csvContent
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
