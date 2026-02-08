// Recommendation Configuration - Recommendation Engine Settings
// Flexy hates hardcoded values! All recommendation settings are now configurable.

export const recommendationConfig = {
  // Algorithm Weights
  weights: {
    collaborative: parseFloat(process.env.REC_WEIGHT_COLLABORATIVE || '0.3'),
    contentBased: parseFloat(process.env.REC_WEIGHT_CONTENT_BASED || '0.3'),
    popularity: parseFloat(process.env.REC_WEIGHT_POPULARITY || '0.2'),
    personalization: parseFloat(
      process.env.REC_WEIGHT_PERSONALIZATION || '0.2'
    ),
  },

  // Similarity Calculation Weights
  similarity: {
    category: parseFloat(process.env.REC_SIMILARITY_CATEGORY || '0.5'),
    tags: parseFloat(process.env.REC_SIMILARITY_TAGS || '0.3'),
    technology: parseFloat(process.env.REC_SIMILARITY_TECHNOLOGY || '0.2'),
    // Minimum score to be considered similar
    minScore: parseFloat(process.env.REC_SIMILARITY_MIN_SCORE || '0.3'),
    // Thresholds for similarity levels
    thresholds: {
      high: parseFloat(process.env.REC_SIMILARITY_THRESHOLD_HIGH || '0.7'),
      medium: parseFloat(process.env.REC_SIMILARITY_THRESHOLD_MEDIUM || '0.5'),
      low: parseFloat(process.env.REC_SIMILARITY_THRESHOLD_LOW || '0.3'),
    },
  },

  // Interest Match Weights
  interestMatch: {
    category: parseFloat(process.env.REC_INTEREST_CATEGORY || '0.4'),
    tags: parseFloat(process.env.REC_INTEREST_TAGS || '0.3'),
    technology: parseFloat(process.env.REC_INTEREST_TECHNOLOGY || '0.3'),
  },

  // Thresholds and Limits
  thresholds: {
    minSimilarityScore: parseFloat(process.env.REC_MIN_SIMILARITY || '0.3'),
    defaultSkillMatch: parseFloat(process.env.REC_DEFAULT_SKILL_MATCH || '0.5'),
    interactionScoreMultiplier: parseFloat(
      process.env.REC_INTERACTION_MULTIPLIER || '0.5'
    ),
  },

  // Diversity and Limits
  limits: {
    maxRecommendations: parseInt(process.env.REC_MAX_RECOMMENDATIONS || '10'),
    diversityFactor: parseFloat(process.env.REC_DIVERSITY_FACTOR || '0.3'),
    trendingLimit: parseInt(process.env.REC_TRENDING_LIMIT || '3'),
    popularLimit: parseInt(process.env.REC_POPULAR_LIMIT || '3'),
    minDiversePool: parseInt(process.env.REC_MIN_DIVERSE_POOL || '3'),
  },

  // Fallback Values
  fallback: {
    defaultInterestMatch: parseFloat(
      process.env.REC_DEFAULT_INTEREST_MATCH || '0.5'
    ),
    collaborativeBaseline: 0,
  },
} as const

export type RecommendationConfig = typeof recommendationConfig
