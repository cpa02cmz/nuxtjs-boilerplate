/**
 * Recommendation Configuration
 * All recommendation algorithm settings
 * Flexy says: "Recommendation weights should be adjustable!"
 */

// Similarity Scoring Weights
export const SIMILARITY_WEIGHTS = {
  // Category match weight
  category: 0.5,

  // Tag overlap weight
  tags: 0.3,

  // Pricing model match weight
  pricing: 0.2,
} as const

// Interest Match Configuration
export const INTEREST_MATCH_CONFIG = {
  // Default interest match threshold
  defaultThreshold: 0.5,

  // Category weight in interest matching
  categoryWeight: 0.4,

  // Tag weight in interest matching
  tagWeight: 0.3,

  // Difficulty weight in interest matching
  difficultyWeight: 0.2,

  // Pricing weight in interest matching
  pricingWeight: 0.1,
} as const

// Recommendation Limits
export const RECOMMENDATION_LIMITS = {
  // Default number of recommendations
  default: 5,

  // Maximum recommendations for home page trending
  homeTrending: 5,

  // Maximum recommendations for home page popular
  homePopular: 3,

  // Maximum recommendations for home page new
  homeNew: 5,

  // Maximum alternatives
  alternatives: 6,

  // Maximum comparison titles
  comparison: 3,

  // Maximum similar resources
  similar: 10,

  // Maximum recommendations per request
  maxPerRequest: 50,
} as const

// Algorithm Scoring Configuration
export const SCORING_CONFIG = {
  // Tag overlap boost
  tagOverlapBoost: 1.5,

  // Category match boost
  categoryBoost: 2.0,

  // Same difficulty bonus
  difficultyBonus: 0.3,

  // Same pricing bonus
  pricingBonus: 0.2,

  // Recency weight (newer resources get higher scores)
  recencyWeight: 0.1,

  // Popularity weight
  popularityWeight: 0.15,
} as const

// Trending Algorithm Configuration
export const TRENDING_CONFIG = {
  // Time window for trending (in days)
  timeWindow: 7,

  // Minimum views to be considered trending
  minViews: 10,

  // Weight for recent views
  recentViewWeight: 0.6,

  // Weight for bookmarks
  bookmarkWeight: 0.4,
} as const

// Export all recommendation configs
export const RECOMMENDATION = {
  similarityWeights: SIMILARITY_WEIGHTS,
  interestMatch: INTEREST_MATCH_CONFIG,
  limits: RECOMMENDATION_LIMITS,
  scoring: SCORING_CONFIG,
  trending: TRENDING_CONFIG,
} as const

export default RECOMMENDATION
