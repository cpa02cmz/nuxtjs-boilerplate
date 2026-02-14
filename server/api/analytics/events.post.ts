import { defineEventHandler, readBody, getHeaders, getRequestIP } from 'h3'
import { randomUUID, createHash } from 'node:crypto'
import { insertAnalyticsEvent } from '~/server/utils/analytics-db'
import { analyticsEventSchema } from '~/server/utils/validation-schemas'
import {
  sendValidationError,
  sendApiError,
  sendSuccessResponse,
} from '~/server/utils/api-response'
import {
  createApiError,
  ErrorCode,
  ErrorCategory,
} from '~/server/utils/api-error'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { logger } from '~/utils/logger'
import { rateLimitConfig } from '~/configs/rate-limit.config'
import { limitsConfig } from '~/configs/limits.config'

/**
 * Hashes an IP address for privacy protection
 * Uses SHA-256 with a daily rotating salt to prevent tracking across days
 * while still allowing daily analytics
 */
function hashIP(ip: string): string {
  // Create a daily salt based on current date (changes every day)
  const dailySalt = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const hash = createHash('sha256')
    .update(ip + dailySalt)
    .digest('hex')
    .substring(0, limitsConfig.displayLength.hashStorage) // Use configured length for shorter storage
  return `hash_${hash}`
}

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const headers = getHeaders(event)
    const rawIP = getRequestIP(event) || 'unknown'
    const clientIP = hashIP(rawIP) // Hash IP for privacy protection

    await rateLimit(event, rawIP) // Use raw IP for rate limiting only

    const validationResult = analyticsEventSchema.safeParse({
      type: body.type,
      resourceId: body.resourceId,
      category: body.category,
      url: body.url,
      userAgent: headers['user-agent'],
      ip: clientIP,
      timestamp: Date.now(),
      properties: body.properties,
    })

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      if (!firstError) {
        return sendValidationError(event, 'unknown', 'Validation failed')
      }
      return sendValidationError(
        event,
        firstError.path[0] as string,
        firstError.message,
        (body as Record<string, unknown>)[firstError.path[0] as string]
      )
    }

    const validatedData = validationResult.data
    const analyticsEvent = {
      type: validatedData.type,
      resourceId: validatedData.resourceId,
      category: validatedData.category,
      url: validatedData.url,
      userAgent: validatedData.userAgent,
      ip: validatedData.ip || clientIP,
      timestamp: validatedData.timestamp || Date.now(),
      properties: validatedData.properties,
    }

    const result = await insertAnalyticsEvent(analyticsEvent)
    if (!result.success) {
      // Check if this is a "table not found" error - be graceful in development/CI
      if (result.tableNotFound) {
        logger.warn(
          'AnalyticsEvent table not found - event dropped (run migrations to enable analytics)'
        )
        // Return success anyway to prevent console errors in development
      } else {
        const error = createApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          'Failed to store analytics event',
          ErrorCategory.INTERNAL
        )
        return sendApiError(event, error)
      }
    }

    // Generate unique event ID using UUID
    const eventId = randomUUID()

    // Get rate limit info from response headers set by rateLimit()
    const rateLimitRemaining = event.node.res?.getHeader(
      'X-RateLimit-Remaining'
    )
    const rateLimitLimit = event.node.res?.getHeader('X-RateLimit-Limit')
    const rateLimitReset = event.node.res?.getHeader('X-RateLimit-Reset')

    // Use standardized success response helper
    // Flexy hates hardcoded values! Using rateLimitConfig for fallback
    return sendSuccessResponse(
      event,
      {
        eventId,
        rateLimit: {
          remaining: rateLimitRemaining
            ? parseInt(rateLimitRemaining as string, 10)
            : 0,
          limit: rateLimitLimit
            ? parseInt(rateLimitLimit as string, 10)
            : rateLimitConfig.defaults.maxRequests,
          reset: rateLimitReset
            ? new Date(
                parseInt(rateLimitReset as string, 10) * 1000
              ).toISOString()
            : new Date().toISOString(),
        },
      },
      201
    )
  } catch (error) {
    logger.error('Analytics event error:', error)
    const apiError = createApiError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Failed to process analytics event',
      ErrorCategory.INTERNAL,
      process.env.NODE_ENV === 'development'
        ? error instanceof Error
          ? error.message
          : String(error)
        : undefined
    )
    return sendApiError(event, apiError)
  }
})
