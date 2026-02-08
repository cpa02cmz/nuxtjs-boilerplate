// Comparison Configuration - Resource Comparison System Settings
// Flexy hates hardcoded values! All comparison settings are now configurable.

export const comparisonConfig = {
  // Resource comparison limits
  limits: {
    maxResources: 4,
    minResources: 2,
  },

  // Similarity thresholds
  similarity: {
    defaultThreshold: 0.3,
    highThreshold: 0.7,
    mediumThreshold: 0.5,
    lowThreshold: 0.3,
  },

  // Scoring weights for comparison criteria
  criteria: {
    category: {
      weight: 0.25,
      exactMatchBonus: 0.1,
    },
    tags: {
      weight: 0.2,
      minCommonTags: 1,
      maxScorePerTag: 0.05,
    },
    technology: {
      weight: 0.2,
      minCommonTech: 1,
      maxScorePerTech: 0.05,
    },
    difficulty: {
      weight: 0.15,
      exactMatchBonus: 0.05,
      adjacentMatchBonus: 0.02,
    },
    pricing: {
      weight: 0.2,
      exactMatchBonus: 0.05,
    },
  },

  // Alternative suggestions
  alternatives: {
    minSimilarityScore: 0.3,
    maxAlternatives: 6,
    defaultCount: 3,
  },

  // Difficulty levels order (for adjacent matching)
  difficultyLevels: ['Beginner', 'Intermediate', 'Advanced'],

  // Feature comparison
  features: {
    minBenefitsToCompare: 2,
    maxBenefitsDisplay: 5,
  },

  // UI settings
  ui: {
    showDifferencesOnly: false,
    highlightBestValue: true,
    showSimilarityScore: true,
  },
} as const

export type ComparisonConfig = typeof comparisonConfig
