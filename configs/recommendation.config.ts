/**
 * Recommendation Algorithm Configuration
 * Flexy says: ML weights should be tunable!
 */

// Algorithm Weights
export const ALGORITHM_WEIGHTS = {
  // Collaborative filtering weight
  collaborative: parseFloat(process.env.REC_WEIGHT_COLLABORATIVE || '0.3'),

  // Content-based filtering weight
  contentBased: parseFloat(process.env.REC_WEIGHT_CONTENT_BASED || '0.3'),

  // Popularity-based weight
  popularity: parseFloat(process.env.REC_WEIGHT_POPULARITY || '0.2'),

  // Personalization weight
  personalization: parseFloat(process.env.REC_WEIGHT_PERSONALIZATION || '0.2'),
} as const

// Algorithm Limits
export const ALGORITHM_LIMITS = {
  // Maximum recommendations to return
  maxRecommendations: parseInt(process.env.REC_MAX_RECOMMENDATIONS || '10'),

  // Minimum similarity score threshold
  minSimilarityScore: parseFloat(process.env.REC_MIN_SIMILARITY || '0.3'),

  // Diversity factor for recommendations
  diversityFactor: parseFloat(process.env.REC_DIVERSITY_FACTOR || '0.3'),

  // Number of trending items to show
  trendingSlice: parseInt(process.env.REC_TRENDING_SLICE || '3'),

  // Number of popular items to show
  popularSlice: parseInt(process.env.REC_POPULAR_SLICE || '3'),

  // Diversity check threshold
  maxDiversityCheck: parseInt(process.env.REC_DIVERSITY_CHECK || '3'),
} as const

// Similarity Calculation Weights
export const SIMILARITY_WEIGHTS = {
  // Category match weight
  category: parseFloat(process.env.SIM_WEIGHT_CATEGORY || '0.5'),

  // Tag match weight
  tags: parseFloat(process.env.SIM_WEIGHT_TAGS || '0.3'),

  // Technology match weight
  technologies: parseFloat(process.env.SIM_WEIGHT_TECH || '0.2'),
} as const

// Interest Match Weights
export const INTEREST_WEIGHTS = {
  // Category interest weight
  category: parseFloat(process.env.INTEREST_WEIGHT_CATEGORY || '0.4'),

  // Tag interest weight
  tags: parseFloat(process.env.INTEREST_WEIGHT_TAGS || '0.3'),

  // Technology interest weight
  technologies: parseFloat(process.env.INTEREST_WEIGHT_TECH || '0.3'),
} as const

// Recommendation Feature Flags
export const RECOMMENDATION_FEATURES = {
  // Enable collaborative filtering
  collaborativeFiltering: process.env.REC_ENABLE_COLLABORATIVE !== 'false',

  // Enable content-based filtering
  contentBasedFiltering: process.env.REC_ENABLE_CONTENT_BASED !== 'false',

  // Enable trending recommendations
  trendingEnabled: process.env.REC_ENABLE_TRENDING !== 'false',

  // Enable personalized recommendations
  personalizationEnabled: process.env.REC_ENABLE_PERSONALIZATION !== 'false',

  // Enable diversity in recommendations
  diversityEnabled: process.env.REC_ENABLE_DIVERSITY !== 'false',
} as const

// Export all recommendation configs
export default {
  weights: ALGORITHM_WEIGHTS,
  limits: ALGORITHM_LIMITS,
  similarity: SIMILARITY_WEIGHTS,
  interest: INTEREST_WEIGHTS,
  features: RECOMMENDATION_FEATURES,
}
