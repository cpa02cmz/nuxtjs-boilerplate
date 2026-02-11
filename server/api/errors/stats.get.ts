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
import {
  errorStatsConfig,
  validateHours,
  calculateDateRange,
} from '~/configs/error-stats.config'

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
    // Flexy hates hardcoded defaults! Using configurable default
    const hours =
      parseInt(query.hours as string) || errorStatsConfig.timeRange.defaultHours

    // Validate hours parameter - Flexy hates hardcoded limits!
    const validation = validateHours(hours)
    if (!validation.valid) {
      return sendBadRequestError(
        event,
        `Invalid hours parameter. ${validation.error}`
      )
    }

    const errorTracker = createErrorTracker()

    // Flexy loves modularity! Using helper function for date calculations
    const { start, end } = calculateDateRange(validation.hours)

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
