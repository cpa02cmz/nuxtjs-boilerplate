// server/api/recommendations/index.get.ts
// API endpoint for personalized recommendations with search analytics integration

import { useResourceData } from '~/composables/useResourceData'
import { useRecommendationEngine } from '~/composables/useRecommendationEngine'
import type { Resource } from '~/types/resource'
import type { SearchAnalyticsData } from '~/types/analytics'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendNotFoundError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { defineEventHandler, getQuery } from 'h3'
import { searchAnalyticsTracker } from '~/utils/searchAnalytics'

export interface RecommendationQuery {
  userId?: string
  resourceId?: string // For resource-based recommendations
  category?: string // For category-based recommendations
  limit?: string // Number of recommendations to return
  type?: 'personalized' | 'trending' | 'popular' | 'related' | 'search-based' // Type of recommendations
  query?: string // Current search query for search-based recommendations
}

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)
    const query = getQuery<RecommendationQuery>(event)
    const limit = parseInt(query.limit || '10', 10)

    // Get all resources
    const { resources } = useResourceData()
    const allResources = resources.value || []

    // Find specific resource if resourceId is provided
    let targetResource: Resource | undefined
    if (query.resourceId) {
      targetResource = allResources.find(r => r.id === query.resourceId)
      if (!targetResource) {
        sendNotFoundError(event, 'Resource', query.resourceId)
        return
      }
    }

    // Create a mock user profile for demonstration
    // In a real implementation, this would come from authentication
    const mockUserProfile = {
      interests: ['javascript', 'vue', 'nuxt', 'web-development'],
      viewedResources: query.userId ? [] : [], // In real app, get from user profile
      bookmarkedResources: query.userId ? [] : [],
      skillLevel: 'intermediate',
    }

    // Fetch search analytics data for search-based recommendations
    let searchAnalytics: SearchAnalyticsData | null = null
    try {
      const popularSearches = searchAnalyticsTracker.getPopularSearches(10)
      const zeroResultSearches =
        searchAnalyticsTracker.getZeroResultSearches(10)
      const performanceMetrics = searchAnalyticsTracker.getOverallPerformance()

      const totalSearches = popularSearches.reduce((sum, s) => sum + s.count, 0)
      const zeroResultCount = zeroResultSearches.reduce(
        (sum, s) => sum + s.count,
        0
      )
      const successRate =
        totalSearches > 0
          ? Math.round(
              ((totalSearches - zeroResultCount) / totalSearches) * 100
            )
          : 100

      // Generate search trends
      const searchTrends = []
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        searchTrends.push({
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 50) + 10,
        })
      }

      searchAnalytics = {
        success: true,
        data: {
          totalSearches,
          successRate,
          zeroResultCount,
          avgResponseTime: performanceMetrics
            ? Math.round(performanceMetrics.avgDuration)
            : 0,
          searchTrends,
          popularSearches: popularSearches.map(s => ({
            query: s.query,
            count: s.count,
          })),
          zeroResultQueries: zeroResultSearches.map(s => ({
            query: s.query,
            count: s.count,
          })),
          performanceMetrics: {
            fastSearches: Math.floor(totalSearches * 0.7),
            mediumSearches: Math.floor(totalSearches * 0.2),
            slowSearches: Math.floor(totalSearches * 0.1),
          },
        },
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          end: new Date().toISOString().split('T')[0],
        },
      }
    } catch (error) {
      console.warn('Failed to fetch search analytics:', error)
      // Continue without search analytics
    }

    // Initialize recommendation engine with user preferences and search analytics
    const engine = useRecommendationEngine(allResources, {
      userPreferences: mockUserProfile,
      searchAnalytics,
      currentSearchQuery: query.query,
      userSearchHistory: query.userId ? [] : [], // In real app, get from user profile
    })

    // Adjust max recommendations based on query
    engine.updateConfig({ maxRecommendations: Math.min(limit, 50) }) // Cap at 50

    let recommendations

    switch (query.type) {
      case 'personalized':
        recommendations = engine.getPersonalizedRecommendations(
          targetResource,
          query.category
        )
        break
      case 'related':
        recommendations = engine.getContentBasedRecommendations(targetResource!)
        break
      case 'trending':
        recommendations = engine.getTrendingRecommendations()
        break
      case 'popular':
        recommendations = engine.getPopularRecommendations()
        break
      case 'search-based':
        recommendations = engine.getSearchBasedRecommendations(
          targetResource,
          query.category
        )
        break
      default:
        // Default to diverse recommendations that include all strategies
        // This now automatically includes search-based recommendations
        recommendations = engine.getDiverseRecommendations(
          targetResource,
          query.category
        )
    }

    // Return the recommendations
    sendSuccessResponse(event, {
      recommendations: recommendations.map(r => ({
        id: r.resource.id,
        title: r.resource.title,
        description: r.resource.description,
        url: r.resource.url,
        category: r.resource.category,
        tags: r.resource.tags,
        technology: r.resource.technology,
        popularity: r.resource.popularity,
        score: r.score,
        reason: r.reason,
        explanation: r.explanation,
        dateAdded: r.resource.dateAdded,
      })),
      total: recommendations.length,
      userId: query.userId || null,
      searchAnalyticsEnabled: !!searchAnalytics?.data,
      searchQuery: query.query || null,
    })
  } catch (error) {
    handleApiRouteError(event, error)
  }
})
