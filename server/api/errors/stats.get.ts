import { defineEventHandler, getQuery } from 'h3'
import { createErrorTracker } from '~/server/utils/error-tracker'
import { logger } from '~/utils/logger'

/**
 * API endpoint for retrieving error statistics
 * GET /api/errors/stats?hours=24
 */
export default defineEventHandler(async event => {
  // Only allow GET requests
  if (event.node.req.method !== 'GET') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed',
    })
  }

  try {
    const query = getQuery(event)
    const hours = parseInt(query.hours as string) || 24

    // Validate hours parameter
    if (hours < 1 || hours > 168) {
      // Max 1 week
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid hours parameter. Must be between 1 and 168.',
      })
    }

    const errorTracker = createErrorTracker()

    const end = new Date()
    const start = new Date(end.getTime() - hours * 60 * 60 * 1000)

    const stats = await errorTracker.getErrorStats({ start, end })

    if (!stats) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to retrieve error statistics',
      })
    }

    return {
      success: true,
      data: {
        timeRange: { start, end, hours },
        ...stats,
      },
    }
  } catch (err) {
    logger.error('[Error API] Failed to get error stats:', err)

    // Re-throw if it's already an H3 error
    if (err && typeof err === 'object' && 'statusCode' in err) {
      throw err
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve error statistics',
    })
  }
})
