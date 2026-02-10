import { defineEventHandler, getQuery } from 'h3'

// In-memory store for share counts (in production, use a database)
const shareCounts = new Map<string, Map<string, number>>()

/**
 * GET /api/v1/social/counts
 * Get share counts for a URL
 */
export default defineEventHandler(async event => {
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
