import type { Resource } from '~/types/resource'
import type {
  RecommendationStrategy,
  RecommendationContext,
} from '~/types/recommendation'
import {
  calculateSimilarity,
  calculateInterestMatch,
  calculateSkillMatch,
  calculateCollaborativeScore,
  applyDiversity,
  type RecommendationConfig,
  type RecommendationResult,
  type UserPreferences,
} from '~/utils/recommendation-algorithms'
import { memoize } from '~/utils/memoize'
import { recommendationConfig } from '~/configs/recommendation.config'

export function usePersonalizedRecommendations(
  allResources: readonly Resource[],
  config: RecommendationConfig,
  userPreferences?: UserPreferences,
  getDiverseRecommendations?: (
    _currentResource?: Resource,
    _currentCategory?: string
  ) => RecommendationResult[]
): RecommendationStrategy {
  const getRecommendations = (
    context?: RecommendationContext
  ): RecommendationResult[] => {
    const resources = context?.allResources ?? allResources
    const configValue = context?.config ?? config
    const userPrefs = context?.userPreferences ?? userPreferences
    const currentResource = context?.currentResource
    const currentCategory = context?.currentCategory

    if (!userPrefs && getDiverseRecommendations) {
      return getDiverseRecommendations(currentResource, currentCategory)
    }

    const personalizedRecs: RecommendationResult[] = []

    for (const resource of resources) {
      if (currentResource && resource.id === currentResource.id) continue

      let contentScore = 0
      let interestScore = 0
      let collaborativeScore = 0
      let popularityScore = 0
      let skillScore = 0

      if (currentResource) {
        contentScore =
          calculateSimilarity(currentResource, resource) *
          configValue.contentBasedWeight
      }

      interestScore =
        calculateInterestMatch(resource, userPrefs) *
        configValue.personalizationWeight

      collaborativeScore =
        calculateCollaborativeScore(resource.id, userPrefs) *
        configValue.collaborativeWeight

      popularityScore =
        (resource.popularity / 10) * configValue.popularityWeight

      skillScore = calculateSkillMatch(resource, userPrefs) * 0.1

      const finalScore =
        contentScore +
        interestScore +
        collaborativeScore +
        popularityScore +
        skillScore

      if (finalScore > configValue.minSimilarityScore) {
        let reason:
          | 'collaborative'
          | 'content-based'
          | 'trending'
          | 'popular'
          | 'personalized'
          | 'serendipity' = 'personalized'
        // Flexy hates hardcoded values! Using config strings
        let explanation: string =
          recommendationConfig.explanations.personalized.default

        if (
          interestScore > contentScore &&
          interestScore > collaborativeScore
        ) {
          reason = 'personalized'
          explanation =
            recommendationConfig.explanations.personalized.interestMatch(
              resource.category
            )
        } else if (
          contentScore > interestScore &&
          contentScore > collaborativeScore
        ) {
          reason = 'content-based'
          explanation = currentResource
            ? recommendationConfig.explanations.contentBased.similarTo(
                currentResource.title
              )
            : recommendationConfig.explanations.contentBased.default
        } else if (
          collaborativeScore > interestScore &&
          collaborativeScore > contentScore
        ) {
          reason = 'collaborative'
          explanation = recommendationConfig.explanations.collaborative
        } else if (popularityScore > 0.5) {
          reason = 'popular'
          explanation = recommendationConfig.explanations.popular
        }

        personalizedRecs.push({
          resource,
          score: finalScore,
          reason,
          explanation,
        })
      }
    }

    return applyDiversity(
      personalizedRecs,
      configValue.diversityFactor,
      configValue.maxRecommendations
    )
      .sort((a, b) => b.score - a.score)
      .slice(0, configValue.maxRecommendations)
  }

  const memoizedGetRecommendations = memoize(
    getRecommendations as (...args: unknown[]) => RecommendationResult[],
    (...args: unknown[]) => {
      const context = args[0] as RecommendationContext | undefined
      const userPrefs = context?.userPreferences ?? userPreferences
      const prefsKey = userPrefs
        ? `${userPrefs.interests?.join(',') || ''}:${userPrefs.viewedResources?.join(',') || ''}:${userPrefs.bookmarkedResources?.join(',') || ''}`
        : 'none'
      return `personalized:${prefsKey}:${config.maxRecommendations}:${config.minSimilarityScore}`
    }
  )

  return {
    name: 'personalized',
    getRecommendations: memoizedGetRecommendations,
  }
}
