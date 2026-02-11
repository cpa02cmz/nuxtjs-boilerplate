import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import {
  incrementShareCount,
  getShareCounts,
} from '~/server/utils/social-share-store'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  sendBadRequestError,
  sendMethodNotAllowedError,
  sendApiError,
} from '~/server/utils/api-response'
import { logger } from '~/utils/logger'
import {
  createApiError,
  ErrorCode,
  ErrorCategory,
} from '~/server/utils/api-error'

// Schema for share event validation
const shareEventSchema = z.object({
  platform: z.string(),
  resourceId: z.string().optional(),
  resourceType: z.string().optional(),
  url: z.string().url(),
  timestamp: z.string().datetime().or(z.date()),
  userAgent: z.string().optional(),
  referrer: z.string().optional(),
})

/**
 * POST /api/v1/social/share
 * Track a social share event
 */
export default defineEventHandler(async event => {
  // Only allow POST requests
  if (event.node.req.method !== 'POST') {
    return sendMethodNotAllowedError(event, 'Only POST requests are allowed')
  }

  try {
    // Apply rate limiting: 10 requests per minute for social shares
    await rateLimit(event)

    const body = await readBody(event)

    // Validate the request body
    const validation = shareEventSchema.safeParse(body)

    if (!validation.success) {
      // Log detailed errors server-side only for debugging
      logger.warn('Share event validation failed:', validation.error.issues)
      // Return generic error message to client (security: don't expose validation details)
      return sendBadRequestError(event, 'Invalid share event data')
    }

    const shareEvent = validation.data
    const url = shareEvent.url
    const platform = shareEvent.platform

    // Update share counts using shared store
    const newCount = await incrementShareCount(url, platform)
    const allCounts = await getShareCounts(url)

    // Log share event (in production, save to analytics database)
    logger.info('Social share tracked:', {
      platform: shareEvent.platform,
      url: shareEvent.url,
      resourceId: shareEvent.resourceId,
      resourceType: shareEvent.resourceType,
      timestamp: new Date(shareEvent.timestamp).toISOString(),
      count: newCount,
    })

    return sendSuccessResponse(event, {
      platform: shareEvent.platform,
      url: shareEvent.url,
      count: newCount,
      total: Object.values(allCounts).reduce((sum, c) => sum + c, 0),
    })
  } catch (error) {
    logger.error('Error tracking social share:', error)
    const apiError = createApiError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Failed to track share event',
      ErrorCategory.INTERNAL
    )
    return sendApiError(event, apiError)
  }
})
