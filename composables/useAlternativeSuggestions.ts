import { ref, readonly } from 'vue'
import type { Resource, AlternativeSuggestion } from '~/types/resource'
import { useRecommendationEngine } from '~/composables/useRecommendationEngine'
import { limitsConfig } from '~/configs/limits.config'
import { recommendationConfig } from '~/configs/recommendation.config'

// Configuration for alternative suggestions
export interface AlternativeConfig {
  minSimilarityScore: number
  maxAlternatives: number
  includeSimilar: boolean
  similarityThresholds: {
    high: number
    medium: number
    low: number
  }
}

// Main composable for alternative suggestions
export const useAlternativeSuggestions = (
  allResources: readonly Resource[]
) => {
  // Configuration for the alternative suggestions system
  const config = ref<AlternativeConfig>({
    minSimilarityScore: recommendationConfig.similarity.minScore,
    maxAlternatives: limitsConfig.suggestions.maxAlternatives,
    includeSimilar: true,
    similarityThresholds: {
      high: recommendationConfig.similarity.thresholds.high,
      medium: recommendationConfig.similarity.thresholds.medium,
      low: recommendationConfig.similarity.thresholds.low,
    },
  })

  const getAlternativesForResource = (
    targetResource: Resource
  ): AlternativeSuggestion[] => {
    if (!allResources || allResources.length === 0) return []

    const alternatives: AlternativeSuggestion[] = []
    const engine = useRecommendationEngine(allResources)

    // Performance: Convert targetResource arrays to Sets for O(1) lookups
    // This changes tag/technology matching from O(n*m) to O(n+m)
    const targetTagsSet = new Set(targetResource.tags)
    const targetTechnologySet = new Set(targetResource.technology)

    for (const resource of allResources) {
      if (resource.id === targetResource.id) continue

      // Check if this resource is explicitly marked as an alternative
      const isExplicitAlternative =
        targetResource.alternatives?.includes(resource.id) ||
        resource.alternatives?.includes(targetResource.id)

      // Calculate similarity score
      const similarityScore = engine.calculateSimilarity(
        targetResource,
        resource
      )

      if (
        isExplicitAlternative ||
        similarityScore >= config.value.minSimilarityScore
      ) {
        // Determine similarity factors for the reason description
        const factors: string[] = []

        if (targetResource.category === resource.category) {
          factors.push('Same category')
        }

        // Performance: Use Set.has() for O(1) lookup instead of Array.includes() O(n)
        if (resource.tags.some(tag => targetTagsSet.has(tag))) {
          factors.push('Shared tags')
        }

        // Performance: Use Set.has() for O(1) lookup instead of Array.includes() O(n)
        if (resource.technology.some(tech => targetTechnologySet.has(tech))) {
          factors.push('Similar technology')
        }

        // Determine the reason based on whether it's explicitly an alternative
        const reason = isExplicitAlternative
          ? 'Marked as alternative'
          : getSimilarityReason(similarityScore)

        alternatives.push({
          resource,
          score: isExplicitAlternative ? 1 : similarityScore,
          reason,
          isAlternative: isExplicitAlternative || true, // Consider all similar resources as alternatives
          similarityFactors: factors,
        })
      }
    }

    // Sort by score descending and limit results
    return alternatives
      .sort((a, b) => b.score - a.score)
      .slice(0, config.value.maxAlternatives)
  }

  // Get similarity reason based on score
  const getSimilarityReason = (score: number): string => {
    if (score >= config.value.similarityThresholds.high) {
      return 'High similarity'
    } else if (score >= config.value.similarityThresholds.medium) {
      return 'Medium similarity'
    } else {
      return 'Low similarity'
    }
  }

  const getAlternativesWithCriteria = (
    targetResource: Resource,
    criteria: Partial<AlternativeConfig>
  ): AlternativeSuggestion[] => {
    // Temporarily update config for this request
    const originalConfig = { ...config.value }
    config.value = { ...config.value, ...criteria }

    const results = getAlternativesForResource(targetResource)

    // Restore original config
    config.value = originalConfig

    return results
  }

  // Update configuration
  const updateConfig = (newConfig: Partial<AlternativeConfig>) => {
    config.value = { ...config.value, ...newConfig }
  }

  // Get resource by ID helper
  const getResourceById = (id: string): Resource | undefined => {
    return allResources.find(resource => resource.id === id)
  }

  return {
    config: readonly(config),
    getAlternativesForResource,
    getAlternativesWithCriteria,
    updateConfig,
    getResourceById,
  }
}
