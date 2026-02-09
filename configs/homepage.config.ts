// Homepage Configuration - Homepage-specific limits and settings
// Flexy hates hardcoded values! All homepage settings are now configurable.

export const homepageConfig = {
  // Resource display limits
  resources: {
    // Number of trending resources to display on homepage
    trendingLimit: parseInt(process.env.HOMEPAGE_TRENDING_LIMIT || '5'),

    // Number of related resources to display
    relatedLimit: parseInt(process.env.HOMEPAGE_RELATED_LIMIT || '3'),
  },

  // Featured section settings
  featured: {
    // Maximum number of featured resources
    maxFeatured: parseInt(process.env.HOMEPAGE_MAX_FEATURED || '3'),

    // Minimum popularity score for featured resources
    minPopularityScore: parseInt(
      process.env.HOMEPAGE_MIN_POPULARITY_SCORE || '50'
    ),
  },
} as const

export type HomepageConfig = typeof homepageConfig
