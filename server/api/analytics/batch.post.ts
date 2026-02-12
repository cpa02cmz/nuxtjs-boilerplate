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
import { z } from 'zod'

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

// Batch event schema
const batchAnalyticsSchema = z.object({
  events: z
    .array(analyticsEventSchema)
    .min(1, 'At least one event is required')
    .max(50, 'Maximum 50 events per batch'),
})

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const headers = getHeaders(event)
    const rawIP = getRequestIP(event) || 'unknown'
    const clientIP = hashIP(rawIP) // Hash IP for privacy protection

    await rateLimit(event, rawIP) // Use raw IP for rate limiting only

    // Validate batch structure
    const batchValidation = batchAnalyticsSchema.safeParse(body)
    if (!batchValidation.success) {
      const firstError = batchValidation.error.issues[0]
      return sendValidationError(
        event,
        firstError?.path.join('.') || 'events',
        firstError?.message || 'Invalid batch format'
      )
    }

    const { events } = batchValidation.data
    const results = []
    const failedEvents = []

    // Process each event in the batch
    for (const eventData of events) {
      try {
        const analyticsEvent = {
          type: eventData.type,
          resourceId: eventData.resourceId,
          category: eventData.category,
          url: eventData.url,
          userAgent: headers['user-agent'],
          ip: clientIP,
          timestamp: eventData.timestamp || Date.now(),
          properties: eventData.properties,
        }

        const success = await insertAnalyticsEvent(analyticsEvent)

        if (success) {
          results.push({
            eventId: randomUUID(),
            type: eventData.type,
            success: true,
          })
        } else {
          failedEvents.push({
            type: eventData.type,
            error: 'Failed to store event',
          })
        }
      } catch (error) {
        logger.error('Error processing batch event:', error)
        failedEvents.push({
          type: eventData.type,
          error: 'Processing error',
        })
      }
    }

    // Get rate limit info from response headers set by rateLimit()
    const rateLimitRemaining = event.node.res?.getHeader(
      'X-RateLimit-Remaining'
    )
    const rateLimitLimit = event.node.res?.getHeader('X-RateLimit-Limit')
    const rateLimitReset = event.node.res?.getHeader('X-RateLimit-Reset')

    // Return batch processing results
    return sendSuccessResponse(
      event,
      {
        processed: results.length,
        failed: failedEvents.length,
        events: results,
        failedEvents: failedEvents.length > 0 ? failedEvents : undefined,
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
      failedEvents.length > 0 ? 207 : 201 // Multi-Status if some failed
    )
  } catch (error) {
    logger.error('Batch analytics event error:', error)
    const apiError = createApiError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Failed to process batch analytics events',
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
