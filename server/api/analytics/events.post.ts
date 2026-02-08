import { defineEventHandler, readBody, getHeaders, getRequestIP } from 'h3'
import { randomUUID } from 'node:crypto'
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

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const headers = getHeaders(event)
    const clientIP = getRequestIP(event) || 'unknown'

    await rateLimit(event, clientIP)

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

    const success = await insertAnalyticsEvent(analyticsEvent)
    if (!success) {
      const error = createApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to store analytics event',
        ErrorCategory.INTERNAL
      )
      return sendApiError(event, error)
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
    return sendSuccessResponse(
      event,
      {
        eventId,
        rateLimit: {
          remaining: rateLimitRemaining
            ? parseInt(rateLimitRemaining as string, 10)
            : 0,
          limit: rateLimitLimit ? parseInt(rateLimitLimit as string, 10) : 10,
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
