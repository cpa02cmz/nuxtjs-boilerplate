import type { Resource } from '~/types/resource'
import type {
  RecommendationStrategy,
  RecommendationContext,
} from '~/types/recommendation'
import {
  type RecommendationConfig,
  type RecommendationResult,
} from '~/utils/recommendation-algorithms'

export function useCategoryBasedRecommendations(
  allResources: readonly Resource[],
  config: RecommendationConfig
): RecommendationStrategy {
  const getRecommendations = (
    context?: RecommendationContext
  ): RecommendationResult[] => {
    const resources = context?.allResources ?? allResources
    const configValue = context?.config ?? config
    const category = context?.currentCategory

    if (!category) return []

    const categoryResources = resources
      .filter(resource => resource.category === category)
      .map(resource => ({
        resource,
        score: resource.popularity,
        reason: 'content-based' as const,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, configValue.maxRecommendations)

    return categoryResources
  }

  return {
    name: 'category-based',
    getRecommendations,
  }
}
