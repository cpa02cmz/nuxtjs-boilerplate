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

  const memoizedGetRecommendations = memoize(
    getRecommendations as (...args: unknown[]) => RecommendationResult[],
    (...args: unknown[]) => {
      const context = args[0] as RecommendationContext | undefined
      return `category:${context?.currentCategory || 'none'}:${config.maxRecommendations}`
    }
  )

  return {
    name: 'category-based',
    getRecommendations: memoizedGetRecommendations,
  }
}
