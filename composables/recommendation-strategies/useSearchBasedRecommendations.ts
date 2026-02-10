import type { Resource } from '~/types/resource'
import type {
  RecommendationStrategy,
  RecommendationContext,
} from '~/types/recommendation'
import {
  calculateSearchPopularityScore,
  calculateSearchTermMatch,
  calculateTrendingSearchBoost,
  applyDiversity,
  type RecommendationConfig,
  type RecommendationResult,
} from '~/utils/recommendation-algorithms'
import { memoize } from '~/utils/memoize'
import type { SearchAnalyticsData } from '~/types/analytics'
import { recommendationConfig } from '~/configs/recommendation.config'

export interface SearchBasedRecommendationOptions {
  searchAnalytics?: SearchAnalyticsData | null
  currentSearchQuery?: string
  userSearchHistory?: string[]
}

export function useSearchBasedRecommendations(
  allResources: readonly Resource[],
  config: RecommendationConfig,
  options: SearchBasedRecommendationOptions = {}
): RecommendationStrategy {
  const { searchAnalytics, currentSearchQuery, userSearchHistory } = options

  const getRecommendations = (
    context?: RecommendationContext
  ): RecommendationResult[] => {
    const resources = context?.allResources ?? allResources
    const configValue = context?.config ?? config

    // If no search analytics data available, return empty
    if (!searchAnalytics?.data) {
      return []
    }

    const searchBasedRecs: RecommendationResult[] = []
    const popularSearches = searchAnalytics.data.popularSearches || []
    const zeroResultQueries = searchAnalytics.data.zeroResultQueries || []

    for (const resource of resources) {
      let searchPopularityScore = 0
      let searchTermMatchScore = 0
      let trendingBoostScore = 0
      let userHistoryScore = 0

      // Calculate search popularity score based on popular searches
      searchPopularityScore = calculateSearchPopularityScore(
        resource,
        popularSearches
      )

      // Calculate search term match score for current query
      if (currentSearchQuery) {
        searchTermMatchScore = calculateSearchTermMatch(
          resource,
          currentSearchQuery
        )
      }

      // Calculate trending boost from search analytics
      trendingBoostScore = calculateTrendingSearchBoost(
        resource,
        popularSearches
      )

      // Calculate user search history match
      if (userSearchHistory && userSearchHistory.length > 0) {
        const historyMatches = userSearchHistory.filter(
          query => calculateSearchTermMatch(resource, query) > 0.5
        ).length
        userHistoryScore =
          (historyMatches / userSearchHistory.length) *
          (configValue.searchBasedWeight || 0.15)
      }

      // Calculate content gap opportunity score
      // Resources that could fill zero-result searches get a boost
      let contentGapScore = 0
      for (const zeroQuery of zeroResultQueries) {
        const matchScore = calculateSearchTermMatch(resource, zeroQuery.query)
        if (matchScore > 0.6) {
          contentGapScore += matchScore * 0.1 // Small boost for gap fillers
        }
      }

      // Combine all search-based scores
      const finalScore =
        searchPopularityScore * 0.3 +
        searchTermMatchScore * 0.25 +
        trendingBoostScore * 0.2 +
        userHistoryScore * 0.15 +
        contentGapScore * 0.1

      if (finalScore > configValue.minSimilarityScore) {
        let reason:
          | 'collaborative'
          | 'content-based'
          | 'trending'
          | 'popular'
          | 'personalized'
          | 'serendipity'
          | 'search-based' = 'search-based'
        // Flexy hates hardcoded values! Using config strings
        let explanation: string =
          recommendationConfig.explanations.searchBased.default

        if (searchTermMatchScore > 0.7 && currentSearchQuery) {
          reason = 'search-based'
          explanation =
            recommendationConfig.explanations.searchBased.matchesQuery(
              currentSearchQuery
            )
        } else if (trendingBoostScore > 0.6) {
          reason = 'trending'
          explanation = recommendationConfig.explanations.searchBased.trending
        } else if (contentGapScore > 0.3) {
          reason = 'search-based'
          explanation = recommendationConfig.explanations.searchBased.contentGap
        } else if (searchPopularityScore > 0.5) {
          reason = 'popular'
          explanation =
            recommendationConfig.explanations.searchBased.frequentlyDiscovered
        }

        searchBasedRecs.push({
          resource,
          score: finalScore,
          reason,
          explanation,
        })
      }
    }

    return applyDiversity(
      searchBasedRecs,
      configValue.diversityFactor,
      configValue.maxRecommendations
    )
      .sort((a, b) => b.score - a.score)
      .slice(0, configValue.maxRecommendations)
  }

  const memoizedGetRecommendations = memoize(
    getRecommendations as (...args: unknown[]) => RecommendationResult[],
    () => {
      const analyticsKey = searchAnalytics?.data?.totalSearches || 'none'
      const queryKey = currentSearchQuery || 'none'
      const historyKey = userSearchHistory?.join(',') || 'none'
      return `search-based:${analyticsKey}:${queryKey}:${historyKey}:${config.maxRecommendations}`
    }
  )

  return {
    name: 'searchBased',
    getRecommendations: memoizedGetRecommendations,
  }
}
