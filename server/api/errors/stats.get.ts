import { defineEventHandler, getQuery } from 'h3'
import { createErrorTracker } from '~/server/utils/error-tracker'
import { logger } from '~/utils/logger'
import {
  sendMethodNotAllowedError,
  sendBadRequestError,
  sendSuccessResponse,
  handleApiRouteError,
  sendApiError,
} from '~/server/utils/api-response'
import {
  createApiError,
  ErrorCode,
  ErrorCategory,
} from '~/server/utils/api-error'

/**
 * API endpoint for retrieving error statistics
 * GET /api/errors/stats?hours=24
 */
export default defineEventHandler(async event => {
  // Only allow GET requests
  if (event.node.req.method !== 'GET') {
    return sendMethodNotAllowedError(event, 'GET')
  }

  try {
    const query = getQuery(event)
    const hours = parseInt(query.hours as string) || 24

    // Validate hours parameter
    if (hours < 1 || hours > 168) {
      // Max 1 week
      return sendBadRequestError(
        event,
        'Invalid hours parameter. Must be between 1 and 168.'
      )
    }

    const errorTracker = createErrorTracker()

    const end = new Date()
    const start = new Date(end.getTime() - hours * 60 * 60 * 1000)

    const stats = await errorTracker.getErrorStats({ start, end })

    if (!stats) {
      const error = createApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to retrieve error statistics',
        ErrorCategory.INTERNAL
      )
      return sendApiError(event, error)
    }

    return sendSuccessResponse(event, {
      timeRange: { start, end, hours },
      ...stats,
    })
  } catch (err) {
    logger.error('[Error API] Failed to get error stats:', err)
    return handleApiRouteError(event, err)
  }
})
