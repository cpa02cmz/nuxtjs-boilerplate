import { defineEventHandler, readBody, getQuery } from 'h3'
import { z } from 'zod'

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

// In-memory store for share counts (in production, use a database)
const shareCounts = new Map<string, Map<string, number>>()

/**
 * POST /api/v1/social/share
 * Track a social share event
 */
export default defineEventHandler(async event => {
  // Only allow POST requests
  if (event.node.req.method !== 'POST') {
    return {
      statusCode: 405,
      statusMessage: 'Method Not Allowed',
      message: 'Only POST requests are allowed',
    }
  }

  try {
    const body = await readBody(event)

    // Validate the request body
    const validation = shareEventSchema.safeParse(body)

    if (!validation.success) {
      // Log detailed errors server-side only for debugging
      console.warn('Share event validation failed:', validation.error.issues)
      // Return generic error message to client (security: don't expose validation details)
      return {
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Invalid share event data',
      }
    }

    const shareEvent = validation.data
    const url = shareEvent.url
    const platform = shareEvent.platform

    // Update share counts
    if (!shareCounts.has(url)) {
      shareCounts.set(url, new Map())
    }
    const urlCounts = shareCounts.get(url)!
    const currentCount = urlCounts.get(platform) || 0
    urlCounts.set(platform, currentCount + 1)

    // Log share event (in production, save to analytics database)
    console.info('Social share tracked:', {
      platform: shareEvent.platform,
      url: shareEvent.url,
      resourceId: shareEvent.resourceId,
      resourceType: shareEvent.resourceType,
      timestamp: new Date(shareEvent.timestamp).toISOString(),
    })

    return {
      statusCode: 200,
      statusMessage: 'OK',
      message: 'Share tracked successfully',
      data: {
        platform: shareEvent.platform,
        url: shareEvent.url,
      },
    }
  } catch (error) {
    console.error('Error tracking social share:', error)
    return {
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to track share event',
    }
  }
})

/**
 * GET /api/v1/social/counts
 * Get share counts for a URL
 */
export const getShareCounts = defineEventHandler(async event => {
  const query = getQuery(event)
  const url = query.url as string

  if (!url) {
    return {
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'URL parameter is required',
    }
  }

  const urlCounts = shareCounts.get(url)
  const counts: Record<string, number> = {}

  if (urlCounts) {
    urlCounts.forEach((count, platform) => {
      counts[platform] = count
    })
  }

  return {
    statusCode: 200,
    statusMessage: 'OK',
    data: {
      url,
      counts,
      total: Object.values(counts).reduce((sum, count) => sum + count, 0),
    },
  }
})
