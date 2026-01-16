import type { Resource } from '~/types/resource'
import type {
  RecommendationStrategy,
  RecommendationContext,
} from '~/types/recommendation'
import {
  calculateSimilarity,
  type RecommendationConfig,
  type RecommendationResult,
} from '~/utils/recommendation-algorithms'

export function useContentBasedRecommendations(
  allResources: readonly Resource[],
  config: RecommendationConfig
): RecommendationStrategy {
  const getRecommendations = (
    context?: RecommendationContext
  ): RecommendationResult[] => {
    const targetResource = context?.currentResource
    const resources = context?.allResources ?? allResources
    const configValue = context?.config ?? config

    if (!targetResource) return []

    const similarities: RecommendationResult[] = []

    for (const resource of resources) {
      if (resource.id === targetResource.id) continue

      const similarity = calculateSimilarity(targetResource, resource)
      if (similarity >= configValue.minSimilarityScore) {
        similarities.push({
          resource,
          score: similarity,
          reason: 'content-based',
        })
      }
    }

    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, configValue.maxRecommendations)
  }

  return {
    name: 'content-based',
    getRecommendations,
  }
}
