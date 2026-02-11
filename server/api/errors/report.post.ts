import { defineEventHandler, readBody } from 'h3'
import { createErrorTracker } from '~/server/utils/error-tracker'
import { logger } from '~/utils/logger'
import {
  sendMethodNotAllowedError,
  sendBadRequestError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

/**
 * API endpoint for client-side error reporting
 * POST /api/errors/report
 */
export default defineEventHandler(async event => {
  // Only allow POST requests
  if (event.node.req.method !== 'POST') {
    return sendMethodNotAllowedError(event, 'POST')
  }

  try {
    const body = await readBody(event)
    const errorTracker = createErrorTracker()

    // Validate required fields
    if (!body.message) {
      return sendBadRequestError(event, 'Missing required field: message')
    }

    // Get client info from request
    const ip =
      event.node.req.headers['x-forwarded-for'] ||
      event.node.req.socket?.remoteAddress ||
      'unknown'
    const userAgent = event.node.req.headers['user-agent'] || 'unknown'

    // Track the error
    await errorTracker.trackError({
      message: body.message,
      stack: body.stack,
      component: body.component,
      severity: body.severity || 'error',
      url: body.url,
      userAgent: typeof userAgent === 'string' ? userAgent : undefined,
      ip: typeof ip === 'string' ? ip : undefined,
      source: 'client',
    })

    logger.info('[Error API] Client error reported:', {
      message: body.message,
      component: body.component,
      severity: body.severity,
    })

    return sendSuccessResponse(event, {
      message: 'Error reported successfully',
    })
  } catch (err) {
    logger.error('[Error API] Failed to process error report:', err)

    // Don't expose internal errors to client
    return handleApiRouteError(event, err)
  }
})
