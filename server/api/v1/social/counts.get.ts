import { defineEventHandler, getQuery } from 'h3'
import { getShareCounts } from '~/server/utils/social-share-store'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  sendBadRequestError,
  sendApiError,
} from '~/server/utils/api-response'
import {
  createApiError,
  ErrorCode,
  ErrorCategory,
} from '~/server/utils/api-error'
import { logger } from '~/utils/logger'

/**
 * GET /api/v1/social/counts
 * Get share counts for a URL
 */
export default defineEventHandler(async event => {
  try {
    // Apply rate limiting: 60 requests per minute for counts endpoint
    await rateLimit(event)

    const query = getQuery(event)
    const url = query.url as string

    if (!url) {
      return sendBadRequestError(event, 'URL parameter is required')
    }

    const counts = await getShareCounts(url)
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0)

    logger.debug('Retrieved share counts:', { url, counts, total })

    return sendSuccessResponse(event, {
      url,
      counts,
      total,
    })
  } catch (error) {
    logger.error('Error retrieving share counts:', error)
    const apiError = createApiError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Failed to retrieve share counts',
      ErrorCategory.INTERNAL
    )
    return sendApiError(event, apiError)
  }
})
