import type { Resource } from '~/types/resource'
import { recommendationConfig } from '~/configs/recommendation.config'
import type { PopularSearch } from './searchAnalytics'

export interface RecommendationConfig {
  collaborativeWeight: number
  contentBasedWeight: number
  popularityWeight: number
  personalizationWeight: number
  searchBasedWeight: number
  maxRecommendations: number
  minSimilarityScore: number
  diversityFactor: number
}

export interface RecommendationResult {
  resource: Resource
  score: number
  reason:
    | 'collaborative'
    | 'content-based'
    | 'trending'
    | 'popular'
    | 'personalized'
    | 'serendipity'
    | 'search-based'
  explanation?: string
}

export interface UserPreferences {
  interests?: string[]
  viewedResources?: string[]
  bookmarkedResources?: string[]
  skillLevel?: string
}

/**
 * Calculates similarity between two resources
 * Flexy hates hardcoded weights - uses recommendationConfig!
 */
export function calculateSimilarity(
  resourceA: Resource,
  resourceB: Resource
): number {
  if (resourceA.id === resourceB.id) return 1

  let score = 0
  const weights = recommendationConfig.similarity

  if (resourceA.category === resourceB.category) {
    score += weights.category
  }

  const tagsB = new Set(resourceB.tags)
  const commonTags = resourceA.tags.filter(tag => tagsB.has(tag)).length
  if (commonTags > 0) {
    const tagSimilarity =
      commonTags / Math.max(resourceA.tags.length, resourceB.tags.length)
    score += weights.tags * tagSimilarity
  }

  const techB = new Set(resourceB.technology)
  const commonTech = resourceA.technology.filter(tech => techB.has(tech)).length
  if (commonTech > 0) {
    const techSimilarity =
      commonTech /
      Math.max(resourceA.technology.length, resourceB.technology.length)
    score += weights.technology * techSimilarity
  }

  return Math.min(1, score)
}

/**
 * Calculates interest match score for a resource
 * Flexy hates hardcoded weights - uses recommendationConfig!
 */
export function calculateInterestMatch(
  resource: Resource,
  userPreferences?: UserPreferences
): number {
  if (!userPreferences?.interests || userPreferences.interests.length === 0) {
    return recommendationConfig.fallback.defaultInterestMatch
  }

  let matchScore = 0
  let totalFactors = 0
  const weights = recommendationConfig.interestMatch

  const interestsSet = new Set(userPreferences.interests)

  if (interestsSet.has(resource.category)) {
    matchScore += weights.category
    totalFactors += weights.category
  }

  const matchingTags = resource.tags.filter(tag => interestsSet.has(tag)).length
  if (matchingTags > 0) {
    const tagMatch = (matchingTags / resource.tags.length) * weights.tags
    matchScore += tagMatch
    totalFactors += weights.tags
  }

  const matchingTech = resource.technology.filter(tech =>
    interestsSet.has(tech)
  ).length
  if (matchingTech > 0) {
    const techMatch =
      (matchingTech / resource.technology.length) * weights.technology
    matchScore += techMatch
    totalFactors += weights.technology
  }

  return totalFactors > 0 ? matchScore / totalFactors : 0
}

/**
 * Calculates skill match score for a resource
 */
export function calculateSkillMatch(
  resource: Resource,
  userPreferences?: UserPreferences
): number {
  if (!userPreferences?.skillLevel) {
    return recommendationConfig.thresholds.defaultSkillMatch
  }
  return recommendationConfig.thresholds.defaultSkillMatch
}

/**
 * Calculates collaborative score for a resource
 */
export function calculateCollaborativeScore(
  resourceId: string,
  userPreferences?: UserPreferences
): number {
  if (
    !userPreferences?.viewedResources &&
    !userPreferences?.bookmarkedResources
  ) {
    return recommendationConfig.fallback.collaborativeBaseline
  }

  const allInteractedResourceIds = [
    ...(userPreferences?.viewedResources || []),
    ...(userPreferences?.bookmarkedResources || []),
  ]

  const interactedSet = new Set(allInteractedResourceIds)
  const interactionCount = interactedSet.has(resourceId) ? 1 : 0
  return Math.min(
    1,
    interactionCount *
      recommendationConfig.thresholds.interactionScoreMultiplier
  )
}

/**
 * Applies diversity algorithm to recommendations
 * Flexy hates hardcoded values - uses recommendationConfig!
 */
export function applyDiversity(
  recommendations: RecommendationResult[],
  diversityFactor: number,
  maxRecommendations: number
): RecommendationResult[] {
  if (diversityFactor <= 0) return recommendations

  const diverseRecs: RecommendationResult[] = []
  const categoriesUsed = new Set<string>()
  const technologiesUsed = new Set<string>()
  const minDiversePool = recommendationConfig.limits.minDiversePool

  for (const rec of recommendations) {
    const categoryDiversity = !categoriesUsed.has(rec.resource.category)
    const techDiversity = rec.resource.technology.some(
      tech => !technologiesUsed.has(tech)
    )

    if (
      diverseRecs.length < minDiversePool ||
      categoryDiversity ||
      techDiversity ||
      Math.random() > 1 - diversityFactor
    ) {
      diverseRecs.push(rec)
      categoriesUsed.add(rec.resource.category)
      rec.resource.technology.forEach(tech => technologiesUsed.add(tech))

      if (diverseRecs.length >= maxRecommendations) break
    }
  }

  return diverseRecs
}

// ============================================================================
// Search-Based Recommendation Algorithms
// ============================================================================

/**
 * Calculates search popularity score for a resource
 * Based on how often the resource appears in popular searches
 */
export function calculateSearchPopularityScore(
  resource: Resource,
  popularSearches: PopularSearch[]
): number {
  if (!popularSearches || popularSearches.length === 0) {
    return 0
  }

  let totalScore = 0
  const maxCount = Math.max(...popularSearches.map(s => s.count))

  for (const search of popularSearches) {
    const normalizedCount = search.count / maxCount
    const matchScore = calculateSearchTermMatch(resource, search.query)
    totalScore += matchScore * normalizedCount
  }

  // Normalize by number of searches to prevent bias towards popular terms
  return Math.min(1, totalScore / Math.sqrt(popularSearches.length))
}

/**
 * Calculates how well a resource matches a search query
 * Uses fuzzy matching on title, description, tags, and technology
 */
export function calculateSearchTermMatch(
  resource: Resource,
  searchQuery: string
): number {
  if (!searchQuery || searchQuery.trim() === '') {
    return 0
  }

  const query = searchQuery.toLowerCase().trim()
  const queryTerms = query.split(/\s+/)

  let score = 0

  // Title match (highest weight)
  const titleLower = resource.title.toLowerCase()
  if (titleLower.includes(query)) {
    score += 0.4
  } else {
    // Partial title match
    const matchingTerms = queryTerms.filter(term => titleLower.includes(term))
    score += (matchingTerms.length / queryTerms.length) * 0.25
  }

  // Description match
  const descLower = resource.description.toLowerCase()
  if (descLower.includes(query)) {
    score += 0.2
  } else {
    const matchingTerms = queryTerms.filter(term => descLower.includes(term))
    score += (matchingTerms.length / queryTerms.length) * 0.1
  }

  // Tags match
  const matchingTags = resource.tags.filter(tag =>
    queryTerms.some(term => tag.toLowerCase().includes(term))
  )
  score +=
    (matchingTags.length / Math.max(resource.tags.length, queryTerms.length)) *
    0.2

  // Technology match
  const matchingTech = resource.technology.filter(tech =>
    queryTerms.some(term => tech.toLowerCase().includes(term))
  )
  score +=
    (matchingTech.length /
      Math.max(resource.technology.length, queryTerms.length)) *
    0.15

  // Category match
  if (queryTerms.some(term => resource.category.toLowerCase().includes(term))) {
    score += 0.05
  }

  return Math.min(1, score)
}

/**
 * Calculates trending boost score based on recent search popularity
 * Resources matching trending searches get higher scores
 */
export function calculateTrendingSearchBoost(
  resource: Resource,
  popularSearches: PopularSearch[]
): number {
  if (!popularSearches || popularSearches.length === 0) {
    return 0
  }

  // Sort by count to identify trending searches
  const sortedSearches = [...popularSearches].sort((a, b) => b.count - a.count)
  const topSearches = sortedSearches.slice(0, 5) // Top 5 trending searches

  let trendingScore = 0

  for (let i = 0; i < topSearches.length; i++) {
    const search = topSearches[i]
    const positionWeight = 1 - i * 0.15 // Higher weight for top searches
    const matchScore = calculateSearchTermMatch(resource, search.query)
    trendingScore += matchScore * positionWeight
  }

  return Math.min(1, trendingScore / topSearches.length)
}

/**
 * Creates a user search profile from search history
 * Used to personalize recommendations based on search behavior
 */
export function createUserSearchProfile(searchHistory: string[]): {
  interests: string[]
  skillLevel: string
} {
  if (!searchHistory || searchHistory.length === 0) {
    return { interests: [], skillLevel: 'intermediate' }
  }

  // Extract potential interests from search queries
  const interests = new Set<string>()
  const skillIndicators = {
    beginner: [
      'tutorial',
      'beginner',
      'introduction',
      'getting started',
      ' basics',
    ],
    advanced: [
      'advanced',
      'expert',
      'performance',
      'optimization',
      'architecture',
    ],
  }

  let beginnerCount = 0
  let advancedCount = 0

  for (const query of searchHistory) {
    const queryLower = query.toLowerCase()

    // Extract technology terms as interests
    const techTerms = [
      'javascript',
      'typescript',
      'python',
      'react',
      'vue',
      'nuxt',
      'node',
      'database',
      'api',
      'frontend',
      'backend',
      'devops',
      'testing',
    ]

    for (const term of techTerms) {
      if (queryLower.includes(term)) {
        interests.add(term)
      }
    }

    // Check skill level indicators
    for (const indicator of skillIndicators.beginner) {
      if (queryLower.includes(indicator)) beginnerCount++
    }
    for (const indicator of skillIndicators.advanced) {
      if (queryLower.includes(indicator)) advancedCount++
    }
  }

  // Determine skill level based on search patterns
  let skillLevel = 'intermediate'
  if (beginnerCount > advancedCount * 1.5) {
    skillLevel = 'beginner'
  } else if (advancedCount > beginnerCount * 1.5) {
    skillLevel = 'advanced'
  }

  return {
    interests: Array.from(interests),
    skillLevel,
  }
}
