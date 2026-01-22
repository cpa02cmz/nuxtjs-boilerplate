import type { Resource } from '~/types/resource'
import type {
  RecommendationStrategy,
  RecommendationContext,
} from '~/types/recommendation'
import {
  type RecommendationConfig,
  type RecommendationResult,
} from '~/utils/recommendation-algorithms'
import { memoize } from '~/utils/memoize'

export function useTrendingRecommendations(
  allResources: readonly Resource[],
  config: RecommendationConfig
): RecommendationStrategy {
  const getRecommendations = (
    context?: RecommendationContext
  ): RecommendationResult[] => {
    const resources = context?.allResources ?? allResources
    const configValue = context?.config ?? config

    const now = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(now.getDate() - 30)

    const trending = resources
      .filter(resource => {
        const addedDate = new Date(resource.dateAdded)
        return addedDate >= thirtyDaysAgo && resource.popularity > 5
      })
      .map(resource => ({
        resource,
        score: resource.popularity,
        reason: 'trending' as const,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, configValue.maxRecommendations)

    return trending
  }

  const memoizedGetRecommendations = memoize(
    getRecommendations as (...args: unknown[]) => RecommendationResult[],
    () => `trending:${Date.now()}:${config.maxRecommendations}`
  )

  return {
    name: 'trending',
    getRecommendations: memoizedGetRecommendations,
  }
}
