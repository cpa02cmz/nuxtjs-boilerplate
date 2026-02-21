import { defineEventHandler, readBody } from 'h3'
import { createErrorTracker } from '~/server/utils/error-tracker'
import { logger } from '~/utils/logger'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { limitsConfig } from '~/configs/limits.config'
import {
  sendMethodNotAllowedError,
  sendBadRequestError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { errorReportSchema } from '~/server/utils/validation-schemas'

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
    // Apply rate limiting - 10 requests per minute per IP
    await rateLimit(event, 'error-report')

    const body = await readBody(event)
    const errorTracker = createErrorTracker()

    // Validate input using Zod schema for consistency with other API routes
    const validation = errorReportSchema.safeParse(body)
    if (!validation.success) {
      const errorMessage = validation.error.issues
        .map(issue => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ')
      return sendBadRequestError(event, errorMessage)
    }

    const validatedData = validation.data

    // Get client info from request
    const rawIp =
      event.node.req.headers['x-forwarded-for'] ||
      event.node.req.socket?.remoteAddress
    const rawUserAgent = event.node.req.headers['user-agent']

    // Sanitize client info
    const ip =
      typeof rawIp === 'string'
        ? rawIp.substring(0, limitsConfig.errorReport.maxIpLength).trim()
        : undefined
    const userAgent =
      typeof rawUserAgent === 'string'
        ? rawUserAgent
            .substring(0, limitsConfig.errorReport.maxUserAgentLength)
            .trim()
        : undefined

    // Track the error with validated data
    await errorTracker.trackError({
      message: validatedData.message,
      stack: validatedData.stack,
      component: validatedData.component,
      severity: validatedData.severity,
      url: validatedData.url,
      userAgent,
      ip,
      source: 'client',
    })

    logger.info('[Error API] Client error reported:', {
      message: validatedData.message,
      component: validatedData.component,
      severity: validatedData.severity,
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
