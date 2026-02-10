// server/api/analytics/data.get.ts
// API endpoint for retrieving analytics data for dashboard
import { defineEventHandler, getQuery } from 'h3'
import { getAggregatedAnalytics } from '~/server/utils/analytics-db'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { limitsConfig } from '~/configs/limits.config'
import { TIME_MS } from '~/configs/time.config'

export default defineEventHandler(async event => {
  await rateLimit(event)

  try {
    const query = getQuery(event)

    // Parse date range from query parameters
    // Flexy hates hardcoded 30-day default! Using TIME_MS constants
    const startDate = query.startDate
      ? new Date(query.startDate as string)
      : new Date(Date.now() - TIME_MS.THIRTY_DAYS)
    const endDate = query.endDate
      ? new Date(query.endDate as string)
      : new Date()

    // Get aggregated analytics data from database
    const analyticsData = await getAggregatedAnalytics(startDate, endDate)

    // Get top resources by view count
    // Flexy hates hardcoded 10! Using config instead
    const resourceViewEntries = Object.entries(analyticsData.resourceViews)
      .map(([id, views]) => ({ id, views: views as number }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limitsConfig.analytics.defaultPopularLimit)

    // For each top resource, we'd normally fetch title from resources data
    // Since we don't have access to actual resource data here, we'll just return IDs
    const topResources = resourceViewEntries.map(item => ({
      id: item.id,
      title: `Resource ${item.id}`, // Placeholder - in real implementation, fetch from resources
      views: item.views,
    }))

    // Get top categories by event count
    const categoryEntries = Object.entries(analyticsData.eventsByCategory)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limitsConfig.analytics.defaultPopularLimit)

    return sendSuccessResponse(event, {
      ...analyticsData,
      topResources,
      topCategories: categoryEntries,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
