// Cache Tags Configuration - Centralized cache tag naming
// Flexy hates hardcoded values! All cache tags are now configurable.

export const cacheTagsConfig = {
  // API version tags
  api: {
    v1: 'api-v1',
    current: 'api-current',
  },

  // Resource-related cache tags
  resources: {
    all: 'resources',
    list: 'resources-list',
    detail: (id: string | number) => `resource-${id}`,
    alternatives: (id: string | number) => `resource-alternatives-${id}`,
    history: (id: string | number) => `resource-history-${id}`,
    analytics: (id: string | number) => `resource-analytics-${id}`,
  },

  // Search-related cache tags
  search: {
    results: 'search-results',
    suggestions: 'search-suggestions',
    popular: 'search-popular',
  },

  // Category-related cache tags
  categories: {
    all: 'categories',
    list: 'categories-list',
  },

  // Tags-related cache tags
  tags: {
    all: 'tags',
    hierarchical: 'tags-hierarchical',
  },

  // Submission-related cache tags
  submissions: {
    all: 'submissions',
    list: 'submissions-list',
    queue: 'submissions-queue',
  },

  // Moderation-related cache tags
  moderation: {
    queue: 'moderation-queue',
    stats: 'moderation-stats',
  },

  // Analytics-related cache tags
  analytics: {
    events: 'analytics-events',
    stats: 'analytics-stats',
    dashboard: 'analytics-dashboard',
  },

  // User-related cache tags
  user: {
    profile: (userId: string | number) => `user-profile-${userId}`,
    preferences: (userId: string | number) => `user-preferences-${userId}`,
    bookmarks: (userId: string | number) => `user-bookmarks-${userId}`,
  },

  // System cache tags
  system: {
    health: 'system-health',
    config: 'system-config',
    sitemap: 'sitemap',
    rss: 'rss-feed',
  },

  // Composite tags (arrays of tags for common scenarios)
  composite: {
    // Tag a resource and its related data
    resourceAll: (id: string | number) => [
      'resources',
      `resource-${id}`,
      `resource-alternatives-${id}`,
      'search-results',
    ],

    // Tag search-related caches
    searchAll: () => ['search-results', 'search-suggestions', 'search-popular'],

    // Tag category-related caches
    categoryAll: () => ['categories', 'categories-list', 'resources-list'],
  },
} as const

// Type exports
export type CacheTagsConfig = typeof cacheTagsConfig

// Helper to generate cache tag array for Nitro
export function generateCacheTags(...tags: string[]): string[] {
  // Add API version tag by default
  return [cacheTagsConfig.api.v1, ...tags]
}

// Helper to invalidate resource cache
export function getResourceCacheTags(resourceId: string | number): string[] {
  return generateCacheTags(
    cacheTagsConfig.resources.all,
    cacheTagsConfig.resources.detail(resourceId),
    cacheTagsConfig.resources.list
  )
}

// Helper to invalidate search cache
export function getSearchCacheTags(): string[] {
  return generateCacheTags(
    cacheTagsConfig.search.results,
    cacheTagsConfig.search.suggestions,
    cacheTagsConfig.resources.list
  )
}
