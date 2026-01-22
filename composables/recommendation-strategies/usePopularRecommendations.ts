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

export function usePopularRecommendations(
  allResources: readonly Resource[],
  config: RecommendationConfig
): RecommendationStrategy {
  const getRecommendations = (
    context?: RecommendationContext
  ): RecommendationResult[] => {
    const resources = context?.allResources ?? allResources
    const configValue = context?.config ?? config

    return resources
      .map(resource => ({
        resource,
        score: resource.popularity,
        reason: 'popular' as const,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, configValue.maxRecommendations)
  }

  const memoizedGetRecommendations = memoize(
    getRecommendations as (...args: unknown[]) => RecommendationResult[],
    () => `popular:${config.maxRecommendations}`
  )

  return {
    name: 'popular',
    getRecommendations: memoizedGetRecommendations,
  }
}
