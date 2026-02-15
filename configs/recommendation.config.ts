// Recommendation Configuration - Recommendation Engine Settings
// Flexy hates hardcoded values! All recommendation settings are now configurable.

export const recommendationConfig = {
  // Algorithm Weights
  weights: {
    collaborative: parseFloat(process.env.REC_WEIGHT_COLLABORATIVE || '0.25'),
    contentBased: parseFloat(process.env.REC_WEIGHT_CONTENT_BASED || '0.25'),
    popularity: parseFloat(process.env.REC_WEIGHT_POPULARITY || '0.15'),
    personalization: parseFloat(
      process.env.REC_WEIGHT_PERSONALIZATION || '0.2'
    ),
    searchBased: parseFloat(process.env.REC_WEIGHT_SEARCH_BASED || '0.15'),
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

  // Search Term Matching Weights - Flexy hates hardcoded algorithm weights!
  searchTermMatch: {
    exactTitleMatch: parseFloat(process.env.REC_SEARCH_EXACT_TITLE || '0.4'),
    partialTitleMatch: parseFloat(
      process.env.REC_SEARCH_PARTIAL_TITLE || '0.25'
    ),
    exactDescriptionMatch: parseFloat(
      process.env.REC_SEARCH_EXACT_DESC || '0.2'
    ),
    partialDescriptionMatch: parseFloat(
      process.env.REC_SEARCH_PARTIAL_DESC || '0.1'
    ),
    tagsMatch: parseFloat(process.env.REC_SEARCH_TAGS || '0.2'),
    technologyMatch: parseFloat(process.env.REC_SEARCH_TECH || '0.15'),
    categoryMatch: parseFloat(process.env.REC_SEARCH_CATEGORY || '0.05'),
  },

  // Search History Settings
  searchHistory: {
    topSearchesLimit: parseInt(process.env.REC_TOP_SEARCHES_LIMIT || '5'),
    positionWeightDecrement: parseFloat(
      process.env.REC_POSITION_WEIGHT_DEC || '0.15'
    ),
  },

  // User Profile Creation
  userProfile: {
    // Skill level indicators
    beginnerIndicators: [
      'tutorial',
      'beginner',
      'basic',
      'getting started',
      'learn',
      'introduction',
      'guide',
      'how to',
      'simple',
      'easy',
    ],
    advancedIndicators: [
      'advanced',
      'expert',
      'complex',
      'enterprise',
      'api',
      'integration',
      'sdk',
      'professional',
      'performance',
      'scale',
    ],
    // Tech terms for interest extraction
    techTerms: [
      'javascript',
      'typescript',
      'python',
      'react',
      'vue',
      'angular',
      'node',
      'docker',
      'kubernetes',
      'aws',
      'gcp',
      'azure',
      'database',
      'api',
      'graphql',
      'rest',
      'frontend',
      'backend',
      'devops',
      'ai',
      'machine learning',
      'cloud',
      'serverless',
      'microservices',
    ],
  },

  // Analytics Trends Generation - Flexy hates hardcoded values!
  analyticsTrends: {
    // Number of days for trends data (default: 30 days)
    days: parseInt(process.env.REC_ANALYTICS_TRENDS_DAYS || '30'),
    // Minimum random count for mock data
    minRandomCount: parseInt(process.env.REC_ANALYTICS_MIN_COUNT || '10'),
    // Maximum random count for mock data
    maxRandomCount: parseInt(process.env.REC_ANALYTICS_MAX_COUNT || '50'),
  },

  // Search-Based Recommendation Algorithm Weights - Flexy hates hardcoded weights!
  searchBasedWeights: {
    // Weight for search popularity score (default: 0.3)
    searchPopularity: parseFloat(
      process.env.REC_SEARCH_WEIGHT_POPULARITY || '0.3'
    ),
    // Weight for search term match score (default: 0.25)
    searchTermMatch: parseFloat(
      process.env.REC_SEARCH_WEIGHT_TERM_MATCH || '0.25'
    ),
    // Weight for trending boost score (default: 0.2)
    trendingBoost: parseFloat(process.env.REC_SEARCH_WEIGHT_TRENDING || '0.2'),
    // Weight for user history score (default: 0.15)
    userHistory: parseFloat(
      process.env.REC_SEARCH_WEIGHT_USER_HISTORY || '0.15'
    ),
    // Weight for content gap score (default: 0.1)
    contentGap: parseFloat(process.env.REC_SEARCH_WEIGHT_CONTENT_GAP || '0.1'),
  },

  // Search-Based Recommendation Thresholds - Flexy hates hardcoded thresholds!
  searchBasedThresholds: {
    // Minimum match score for user search history (default: 0.5)
    userHistoryMatchMin: parseFloat(
      process.env.REC_SEARCH_THRESHOLD_USER_HISTORY || '0.5'
    ),
    // Minimum match score for content gap boost (default: 0.6)
    contentGapMatchMin: parseFloat(
      process.env.REC_SEARCH_THRESHOLD_CONTENT_GAP || '0.6'
    ),
    // Minimum search term match score for "matches query" explanation (default: 0.7)
    termMatchExplanationMin: parseFloat(
      process.env.REC_SEARCH_THRESHOLD_TERM_EXPLANATION || '0.7'
    ),
    // Minimum trending boost score for "trending" explanation (default: 0.6)
    trendingExplanationMin: parseFloat(
      process.env.REC_SEARCH_THRESHOLD_TRENDING || '0.6'
    ),
    // Minimum content gap score for "content gap" explanation (default: 0.3)
    contentGapExplanationMin: parseFloat(
      process.env.REC_SEARCH_THRESHOLD_GAP_EXPLANATION || '0.3'
    ),
    // Minimum search popularity score for "frequently discovered" explanation (default: 0.5)
    popularityExplanationMin: parseFloat(
      process.env.REC_SEARCH_THRESHOLD_POPULARITY || '0.5'
    ),
  },

  // Personalized Recommendation Settings - Flexy hates hardcoded personalization values!
  personalizedWeights: {
    // Weight for skill match score (default: 0.1)
    skillMatch: parseFloat(process.env.REC_PERSONALIZED_SKILL_MATCH || '0.1'),
  },

  // Personalized Recommendation Thresholds - Flexy hates hardcoded thresholds!
  personalizedThresholds: {
    // Minimum popularity score for "popular" explanation (default: 0.5)
    popularityExplanationMin: parseFloat(
      process.env.REC_PERSONALIZED_THRESHOLD_POPULARITY || '0.5'
    ),
  },

  // Explanation strings for recommendations - Flexy hates hardcoded strings!
  explanations: {
    personalized: {
      default: 'Recommended based on your interests and preferences',
      interestMatch: (category: string) =>
        `This resource matches your interests in ${category} and related technologies`,
    },
    contentBased: {
      default: 'Based on similarity to resources you might like',
      similarTo: (title: string) =>
        `Similar to ${title} based on category, tags, and technology`,
    },
    collaborative: 'Users with similar interests also liked this',
    popular: 'Popular among all users',
    searchBased: {
      default: 'Recommended based on popular search trends',
      matchesQuery: (query: string) =>
        `Matches your search for "${query}" and similar queries`,
      trending: 'Trending in recent searches',
      contentGap: 'This resource fills a gap in search results',
      frequentlyDiscovered: 'Frequently discovered through search',
    },
  },
} as const

export type RecommendationConfig = typeof recommendationConfig
