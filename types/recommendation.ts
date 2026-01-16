import type { Resource } from '~/types/resource'
import type {
  RecommendationConfig,
  RecommendationResult,
  UserPreferences,
} from '~/utils/recommendation-algorithms'

export interface RecommendationStrategy {
  readonly name: string
  getRecommendations(context?: RecommendationContext): RecommendationResult[]
}

export interface RecommendationContext {
  allResources: readonly Resource[]
  config: RecommendationConfig
  userPreferences?: UserPreferences
  currentResource?: Resource
  currentCategory?: string
}
