import { getQuery, setResponseStatus } from 'h3'
import type { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'
import { cacheManager } from '~/server/utils/enhanced-cache'
import { searchAnalyticsTracker } from '~/utils/searchAnalytics'

/**
 * GET /api/analytics/search
 *
 * Get search-specific analytics data
 *
 * Query parameters:
 * - days: Number of days to look back (default: 30, options: 7, 30, 90)
 */
export default defineEventHandler(async event => {
  try {
    // Parse query parameters
    const query = getQuery(event)
    const days = parseInt(query.days as string) || 30

    // Validate days parameter
    if (![7, 30, 90].includes(days)) {
      // Default to 30 if invalid
      console.warn(`Invalid days parameter: ${days}, defaulting to 30`)
    }

    // Generate cache key based on query parameters
    const cacheKey = `search-analytics:${days}`

    // Try to get from cache first
    const cachedResult = await cacheManager.get(cacheKey)
    if (cachedResult) {
      event.node.res?.setHeader('X-Cache', 'HIT')
      event.node.res?.setHeader('X-Cache-Key', cacheKey)
      return cachedResult
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    // Get search analytics data
    // In a real implementation, this would come from a database
    // For now, we'll use the in-memory tracker and generate some sample data
    const popularSearches = searchAnalyticsTracker.getPopularSearches(10)
    const zeroResultSearches = searchAnalyticsTracker.getZeroResultSearches(10)
    const performanceMetrics = searchAnalyticsTracker.getOverallPerformance()

    // Calculate success rate based on zero-result searches
    const totalSearches =
      popularSearches.reduce((sum, search) => sum + search.count, 0) || 0
    const zeroResultCount =
      zeroResultSearches.reduce((sum, search) => sum + search.count, 0) || 0
    const successRate =
      totalSearches > 0
        ? Math.round(((totalSearches - zeroResultCount) / totalSearches) * 100)
        : 100

    // Generate sample search trends (in a real app, this would come from database)
    const searchTrends = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split('T')[0]

      // Generate a sample count based on popularity
      const sampleCount = Math.floor(Math.random() * 50) + 10
      searchTrends.push({
        date: dateString,
        count: sampleCount,
      })
    }

    // Calculate performance metrics
    let fastSearches = 0
    let mediumSearches = 0
    let slowSearches = 0

    if (performanceMetrics) {
      // In a real implementation, we'd have more granular data
      // For now, we'll generate sample data based on overall metrics
      const totalPerfSearches = performanceMetrics.totalSearches
      fastSearches = Math.floor(totalPerfSearches * 0.7)
      mediumSearches = Math.floor(totalPerfSearches * 0.2)
      slowSearches = Math.floor(totalPerfSearches * 0.1)
    } else {
      // Default values if no performance data
      fastSearches = 70
      mediumSearches = 20
      slowSearches = 10
    }

    // Prepare response
    const response = {
      success: true,
      data: {
        totalSearches,
        successRate,
        zeroResultCount,
        avgResponseTime: performanceMetrics
          ? Math.round(performanceMetrics.avgDuration)
          : 0,
        searchTrends,
        popularSearches: popularSearches.map(search => ({
          query: search.query,
          count: search.count,
        })),
        zeroResultQueries: zeroResultSearches.map(search => ({
          query: search.query,
          count: search.count,
        })),
        performanceMetrics: {
          fastSearches,
          mediumSearches,
          slowSearches,
        },
      },
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
    }

    // Cache the result for 15 minutes (900 seconds)
    await cacheManager.set(cacheKey, response, 900)

    // Set cache miss header
    event.node.res?.setHeader('X-Cache', 'MISS')
    event.node.res?.setHeader('X-Cache-Key', cacheKey)

    // Set success response status
    setResponseStatus(event, 200)
    return response
  } catch (error: any) {
    // Log error using our error logging service
    logError(
      `Error fetching search analytics: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-analytics-search',
      {
        query: getQuery(event),
        errorType: error?.constructor?.name,
      }
    )

    // Set error response status
    setResponseStatus(event, 500)
    return {
      success: false,
      message: 'An error occurred while fetching search analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})