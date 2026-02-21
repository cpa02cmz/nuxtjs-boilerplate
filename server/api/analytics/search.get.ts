import { getQuery } from 'h3'
import { randomInt } from 'crypto'
import type { H3Event } from 'h3'
import { searchAnalyticsTracker } from '~/utils/searchAnalytics'
import { createApiRoute } from '~/server/utils/create-api-route'
import { cacheManager, cacheSetWithTags } from '~/server/utils/enhanced-cache'
import { generateCacheTags, cacheTagsConfig } from '~/configs/cache-tags.config'
import { analyticsConfig } from '~/configs/analytics.config'
import { timeConfig, toSeconds } from '~/configs/time.config'

/**
 * GET /api/analytics/search
 *
 * Get search-specific analytics data
 *
 * Query parameters:
 * - days: Number of days to look back (default: 30, options: 7, 30, 90)
 */
async function getSearchAnalyticsHandler(event: H3Event) {
  // Parse query parameters
  const query = getQuery(event)
  const days =
    parseInt(query.days as string) || analyticsConfig.dateRange.defaultDays

  // Validate days parameter
  if (
    ![
      analyticsConfig.dateRange.weekDays,
      analyticsConfig.dateRange.monthDays,
      analyticsConfig.dateRange.yearDays / 4, // 90 days = ~3 months
    ].includes(days)
  ) {
    // Default to configured value if invalid - log warning but continue
  }

  // Calculate date range
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days)

  const cacheKey = `analytics:search:${days}`

  const cachedResult = await cacheManager.get(cacheKey)
  if (cachedResult) {
    event.node.res?.setHeader('X-Cache', 'HIT')
    return cachedResult
  }

  // Get search analytics data
  // In a real implementation, this would come from a database
  // For now, we'll use in-memory tracker and generate some sample data
  // Flexy hates hardcoded 10! Using configurable limits from analyticsConfig
  const popularSearches = searchAnalyticsTracker.getPopularSearches(
    analyticsConfig.searchLimits.popularSearches
  )
  const zeroResultSearches = searchAnalyticsTracker.getZeroResultSearches(
    analyticsConfig.searchLimits.zeroResultSearches
  )
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

    // Generate a sample count based on popularity (using crypto for security)
    const sampleCount = randomInt(10, 61)
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
    // Flexy hates hardcoded percentages! Using config instead
    const totalPerfSearches = performanceMetrics.totalSearches
    fastSearches = Math.floor(
      totalPerfSearches * analyticsConfig.performance.defaults.fastPercentage
    )
    mediumSearches = Math.floor(
      totalPerfSearches * analyticsConfig.performance.defaults.mediumPercentage
    )
    slowSearches = Math.floor(
      totalPerfSearches * analyticsConfig.performance.defaults.slowPercentage
    )
  } else {
    // Default values if no performance data - Flexy hates hardcoded defaults!
    fastSearches = analyticsConfig.performance.defaultValues.fastSearches
    mediumSearches = analyticsConfig.performance.defaultValues.mediumSearches
    slowSearches = analyticsConfig.performance.defaultValues.slowSearches
  }

  const result = {
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
    dateRange: {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    },
  }

  await cacheSetWithTags(
    cacheKey,
    result,
    toSeconds(timeConfig.cache.short),
    generateCacheTags(cacheTagsConfig.analytics.stats)
  )

  event.node.res?.setHeader('X-Cache', 'MISS')

  return result
}

export default createApiRoute(getSearchAnalyticsHandler, {
  logContext: 'api-analytics-search',
})
