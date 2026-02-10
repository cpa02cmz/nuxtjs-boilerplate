// Cache Configuration - Caching and TTL Settings
// Flexy hates hardcoded values! All cache settings are now configurable.

export const cacheConfig = {
  // PWA/Workbox Cache Settings
  pwa: {
    // Glob patterns for precaching
    globPatterns: parseGlobPatterns(
      process.env.PWA_CACHE_GLOB_PATTERNS ||
        '**/*.{js,css,html,png,svg,ico,jpg,webp,woff2}'
    ),

    // API Cache
    api: {
      name: process.env.PWA_API_CACHE_NAME || 'api-cache',
      maxEntries: parseInt(process.env.PWA_API_CACHE_MAX_ENTRIES || '50'),
      maxAgeSeconds: parseInt(process.env.PWA_API_CACHE_MAX_AGE || '86400'), // 24 hours
    },

    // Resources Cache
    resources: {
      name: process.env.PWA_RESOURCES_CACHE_NAME || 'resources-cache',
      maxEntries: parseInt(process.env.PWA_RESOURCES_CACHE_MAX_ENTRIES || '10'),
      maxAgeSeconds: parseInt(
        process.env.PWA_RESOURCES_CACHE_MAX_AGE || '604800'
      ), // 1 week
    },

    // Google Fonts Cache
    fonts: {
      name: process.env.PWA_FONTS_CACHE_NAME || 'google-fonts-cache',
      maxEntries: parseInt(process.env.PWA_FONTS_CACHE_MAX_ENTRIES || '10'),
      maxAgeSeconds: parseInt(
        process.env.PWA_FONTS_CACHE_MAX_AGE || '31536000'
      ), // 1 year
    },

    // Nuxt Assets Cache
    assets: {
      name: process.env.PWA_ASSETS_CACHE_NAME || 'nuxt-assets-cache',
      maxEntries: parseInt(process.env.PWA_ASSETS_CACHE_MAX_ENTRIES || '50'),
      maxAgeSeconds: parseInt(
        process.env.PWA_ASSETS_CACHE_MAX_AGE || '2592000'
      ), // 30 days
    },

    // GitHub CDN Cache
    github: {
      name: process.env.PWA_GITHUB_CACHE_NAME || 'github-cdn-cache',
      maxEntries: parseInt(process.env.PWA_GITHUB_CACHE_MAX_ENTRIES || '10'),
      maxAgeSeconds: parseInt(process.env.PWA_GITHUB_CACHE_MAX_AGE || '604800'), // 1 week
    },

    // Image Cache
    images: {
      name: process.env.PWA_IMAGE_CACHE_NAME || 'image-cache',
      maxEntries: parseInt(process.env.PWA_IMAGE_CACHE_MAX_ENTRIES || '20'),
      maxAgeSeconds: parseInt(process.env.PWA_IMAGE_CACHE_MAX_AGE || '604800'), // 1 week
    },
  },

  // Server-side Cache Settings
  server: {
    // Default TTL for cached data
    defaultTtlMs: parseInt(process.env.CACHE_DEFAULT_TTL_MS || '300000'), // 5 minutes

    // Cache size limits
    maxCacheSize: parseInt(process.env.CACHE_MAX_SIZE || '100'),
    maxPopularSearches: parseInt(
      process.env.CACHE_MAX_POPULAR_SEARCHES || '50'
    ),
    maxZeroResultSearches: parseInt(
      process.env.CACHE_MAX_ZERO_RESULT_SEARCHES || '50'
    ),
    maxPerformanceHistory: parseInt(
      process.env.CACHE_MAX_PERFORMANCE_HISTORY || '100'
    ),
    maxAnalyticsEntries: parseInt(
      process.env.CACHE_MAX_ANALYTICS_ENTRIES || '100'
    ),
  },

  // Rate Limiting Cache
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    apiWindowMs: parseInt(process.env.RATE_LIMIT_API_WINDOW_MS || '300000'), // 5 minutes
    searchWindowMs: parseInt(
      process.env.RATE_LIMIT_SEARCH_WINDOW_MS || '60000'
    ), // 1 minute
  },

  // RSS Feed Cache
  rss: {
    maxItems: parseInt(process.env.RSS_MAX_ITEMS || '50'),
    defaultLimit: parseInt(process.env.RSS_DEFAULT_LIMIT || '20'),
  },

  // Search Suggestions Cache
  searchSuggestions: {
    // TTL for search suggestions cache (seconds)
    ttlSeconds: parseInt(
      process.env.SEARCH_SUGGESTIONS_CACHE_TTL_SECONDS || '60'
    ),
  },
} as const

// Helper function to parse glob patterns
// Supports both comma-separated patterns and brace expansion patterns
function parseGlobPatterns(value: string): string[] {
  // If the value contains brace expansion (e.g., **/*.{js,css}), keep it as a single pattern
  if (value.includes('{') && value.includes('}')) {
    return [value.trim()]
  }
  // Otherwise, split by comma for multiple patterns
  return value.split(',').map(s => s.trim())
}

export type CacheConfig = typeof cacheConfig
