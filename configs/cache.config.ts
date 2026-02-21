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
    maxMemorySize: parseInt(process.env.CACHE_MAX_MEMORY_SIZE || '1000'),
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

    // Cleanup settings
    cleanupIntervalMs: parseInt(
      process.env.CACHE_CLEANUP_INTERVAL_MS || '300000'
    ), // 5 minutes

    // Default TTL in seconds for cache operations
    defaultTtlSeconds: parseInt(
      process.env.CACHE_DEFAULT_TTL_SECONDS || '3600'
    ), // 1 hour

    // LRU cleanup percentage - what percentage of entries to remove when full
    lruCleanupPercentage: parseFloat(
      process.env.CACHE_LRU_CLEANUP_PERCENTAGE || '0.1'
    ), // 10%

    // Memory size multiplier for cache manager initialization (default: 2x base config)
    // Flexy hates hardcoded multipliers!
    memorySizeMultiplier: parseFloat(
      process.env.CACHE_MEMORY_MULTIPLIER || '2'
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
    // TTL for RSS feed cache (seconds) - Flexy hates hardcoded values!
    // Default: 15 minutes (reasonable for feed readers)
    ttlSeconds: parseInt(process.env.RSS_CACHE_TTL_SECONDS || '900'),
  },

  // Search Suggestions Cache
  searchSuggestions: {
    // TTL for search suggestions cache (seconds)
    ttlSeconds: parseInt(
      process.env.SEARCH_SUGGESTIONS_CACHE_TTL_SECONDS || '60'
    ),
  },

  // API Endpoint Cache TTLs - Flexy hates hardcoded TTL values!
  api: {
    // Default TTL for resource endpoints (seconds)
    resourceTtlSeconds: parseInt(
      process.env.CACHE_API_RESOURCE_TTL_SECONDS || '600'
    ), // 10 minutes

    // Default TTL for comparison endpoints (seconds)
    comparisonTtlSeconds: parseInt(
      process.env.CACHE_API_COMPARISON_TTL_SECONDS || '300'
    ), // 5 minutes

    // Default TTL for analytics endpoints (seconds)
    analyticsTtlSeconds: parseInt(
      process.env.CACHE_API_ANALYTICS_TTL_SECONDS || '60'
    ), // 1 minute

    // Default TTL for recommendations endpoints (seconds)
    recommendationsTtlSeconds: parseInt(
      process.env.CACHE_API_RECOMMENDATIONS_TTL_SECONDS || '300'
    ), // 5 minutes
  },

  // Route Cache Settings - HTTP Cache-Control headers for different routes
  routes: {
    home: {
      maxAge: parseInt(process.env.ROUTE_HOME_MAX_AGE || '60'), // 1 minute
      sMaxAge: parseInt(process.env.ROUTE_HOME_S_MAX_AGE || '300'), // 5 minutes
    },
    search: {
      maxAge: parseInt(process.env.ROUTE_SEARCH_MAX_AGE || '60'), // 1 minute
      sMaxAge: parseInt(process.env.ROUTE_SEARCH_S_MAX_AGE || '300'), // 5 minutes
    },
    about: {
      maxAge: parseInt(process.env.ROUTE_ABOUT_MAX_AGE || '300'), // 5 minutes
      sMaxAge: parseInt(process.env.ROUTE_ABOUT_S_MAX_AGE || '3600'), // 1 hour
    },
    assets: {
      maxAge: parseInt(process.env.ROUTE_ASSETS_MAX_AGE || '31536000'), // 1 year
      immutable: true,
    },
  },

  // Redis Configuration - Flexy hates hardcoded Redis settings!
  redis: {
    // Maximum retry attempts per request
    maxRetriesPerRequest: parseInt(
      process.env.REDIS_MAX_RETRIES_PER_REQUEST || '3'
    ),
    // Connection timeout in milliseconds
    connectTimeoutMs: parseInt(process.env.REDIS_CONNECT_TIMEOUT_MS || '10000'),
    // Enable lazy connection
    lazyConnect: process.env.REDIS_LAZY_CONNECT !== 'false',
    // Enable ready check
    enableReadyCheck: process.env.REDIS_ENABLE_READY_CHECK !== 'false',
    // Keep alive interval in milliseconds
    keepAliveMs: parseInt(process.env.REDIS_KEEP_ALIVE_MS || '30000'),
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
