import { defineEventHandler, readBody, setResponseHeaders } from 'h3'
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

// Flexy update: Using centralized limits config - no more hardcoded values!
const ALLOWED_SEVERITIES = ['error', 'warning', 'info', 'critical'] as const

/**
 * Validates and sanitizes error report input
 * Prevents log injection and ensures data integrity
 */
function validateErrorReport(body: Record<string, unknown>) {
  // Validate required message field
  if (!body.message || typeof body.message !== 'string') {
    return { error: 'Missing or invalid required field: message' }
  }

  // Sanitize and validate all fields
  const validated = {
    message: body.message
      .substring(0, limitsConfig.errorReport.maxMessageLength)
      .trim(),
    stack:
      typeof body.stack === 'string'
        ? body.stack
            .substring(0, limitsConfig.errorReport.maxStackLength)
            .trim()
        : undefined,
    component:
      typeof body.component === 'string'
        ? body.component
            .substring(0, limitsConfig.errorReport.maxComponentLength)
            .trim()
        : undefined,
    severity: ALLOWED_SEVERITIES.includes(
      body.severity as (typeof ALLOWED_SEVERITIES)[number]
    )
      ? (body.severity as (typeof ALLOWED_SEVERITIES)[number])
      : 'error',
    url:
      typeof body.url === 'string'
        ? body.url.substring(0, limitsConfig.errorReport.maxUrlLength).trim()
        : undefined,
  }

  // Additional validation for URL format if provided
  if (validated.url) {
    try {
      new URL(validated.url)
    } catch {
      validated.url = undefined
    }
  }

  return { data: validated }
}

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

    // Deprecation headers for backward compatibility
    setResponseHeaders(event, {
      Sunset: 'Mon, 01 Jun 2026 00:00:00 GMT',
      Deprecation: 'true',
      Link: '</api/v1/errors/report>; rel="successor-version"',
    })

    const body = await readBody(event)
    const errorTracker = createErrorTracker()

    // Validate and sanitize all input fields
    const validation = validateErrorReport(body)
    if (validation.error) {
      return sendBadRequestError(event, validation.error)
    }

    const validatedData = validation.data!

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
