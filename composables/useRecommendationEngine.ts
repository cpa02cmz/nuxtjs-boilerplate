import { ref } from 'vue'
import type { Resource } from '~/types/resource'
import type {
  RecommendationStrategy,
  RecommendationResult,
} from '~/types/recommendation'
import {
  calculateSimilarity,
  type RecommendationConfig,
  type UserPreferences,
} from '~/utils/recommendation-algorithms'

import { useContentBasedRecommendations } from './recommendation-strategies/useContentBasedRecommendations'
import { useTrendingRecommendations } from './recommendation-strategies/useTrendingRecommendations'
import { usePopularRecommendations } from './recommendation-strategies/usePopularRecommendations'
import { useCategoryBasedRecommendations } from './recommendation-strategies/useCategoryBasedRecommendations'
import { usePersonalizedRecommendations } from './recommendation-strategies/usePersonalizedRecommendations'

export const useRecommendationEngine = (
  allResources: readonly Resource[],
  userPreferences?: {
    interests?: string[]
    viewedResources?: string[]
    bookmarkedResources?: string[]
    skillLevel?: string
  }
) => {
  const config = ref<RecommendationConfig>({
    collaborativeWeight: 0.3,
    contentBasedWeight: 0.3,
    popularityWeight: 0.2,
    personalizationWeight: 0.2,
    maxRecommendations: 10,
    minSimilarityScore: 0.3,
    diversityFactor: 0.3,
  })

  const strategies: Record<string, RecommendationStrategy> = {
    contentBased: useContentBasedRecommendations(allResources, config.value),
    trending: useTrendingRecommendations(allResources, config.value),
    popular: usePopularRecommendations(allResources, config.value),
    categoryBased: useCategoryBasedRecommendations(allResources, config.value),
    personalized: usePersonalizedRecommendations(
      allResources,
      config.value,
      userPreferences as UserPreferences,
      undefined
    ),
  }

  const getContext = (
    currentResource?: Resource,
    currentCategory?: string
  ) => ({
    allResources,
    config: config.value,
    userPreferences: userPreferences as UserPreferences,
    currentResource,
    currentCategory,
  })

  const getDiverseRecommendations = (
    currentResource?: Resource,
    currentCategory?: string
  ): RecommendationResult[] => {
    const recommendations: RecommendationResult[] = []
    const seenResourceIds = new Set<string>()

    if (currentResource) {
      const contentBasedRecs = strategies.contentBased.getRecommendations(
        getContext(currentResource, currentCategory)
      )
      recommendations.push(...contentBasedRecs)
      contentBasedRecs.forEach(rec => seenResourceIds.add(rec.resource.id))
    }

    if (currentCategory) {
      const categoryBasedRecs = strategies.categoryBased.getRecommendations(
        getContext(currentResource, currentCategory)
      )
      const uniqueCategoryRecs = categoryBasedRecs.filter(
        rec => !seenResourceIds.has(rec.resource.id)
      )
      recommendations.push(...uniqueCategoryRecs)
      uniqueCategoryRecs.forEach(rec => seenResourceIds.add(rec.resource.id))
    }

    const trendingRecs = strategies.trending.getRecommendations(
      getContext(currentResource, currentCategory)
    )
    const uniqueTrendingRecs = trendingRecs
      .filter(rec => !seenResourceIds.has(rec.resource.id))
      .slice(0, Math.min(3, trendingRecs.length))
    recommendations.push(...uniqueTrendingRecs)
    uniqueTrendingRecs.forEach(rec => seenResourceIds.add(rec.resource.id))

    const popularRecs = strategies.popular.getRecommendations(
      getContext(currentResource, currentCategory)
    )
    const uniquePopularRecs = popularRecs
      .filter(rec => !seenResourceIds.has(rec.resource.id))
      .slice(0, Math.min(3, popularRecs.length))
    recommendations.push(...uniquePopularRecs)
    uniquePopularRecs.forEach(rec => seenResourceIds.add(rec.resource.id))

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, config.value.maxRecommendations)
  }

  const getContentBasedRecommendations = (
    currentResource?: Resource
  ): RecommendationResult[] => {
    return strategies.contentBased.getRecommendations(
      getContext(currentResource)
    )
  }

  const getTrendingRecommendations = (): RecommendationResult[] => {
    return strategies.trending.getRecommendations(getContext())
  }

  const getPopularRecommendations = (): RecommendationResult[] => {
    return strategies.popular.getRecommendations(getContext())
  }

  const getCategoryBasedRecommendations = (
    currentCategory?: string
  ): RecommendationResult[] => {
    return strategies.categoryBased.getRecommendations(
      getContext(undefined, currentCategory)
    )
  }

  const getPersonalizedRecommendations = (
    currentResource?: Resource,
    currentCategory?: string
  ): RecommendationResult[] => {
    return strategies.personalized.getRecommendations(
      getContext(currentResource, currentCategory)
    )
  }

  const updateConfig = (newConfig: Partial<RecommendationConfig>) => {
    config.value = { ...config.value, ...newConfig }
  }

  return {
    get config() {
      return config.value
    },
    calculateSimilarity,
    updateConfig,
    getDiverseRecommendations,
    getPersonalizedRecommendations,
    getContentBasedRecommendations,
    getTrendingRecommendations,
    getPopularRecommendations,
    getCategoryBasedRecommendations,
    strategies,
  }
}
