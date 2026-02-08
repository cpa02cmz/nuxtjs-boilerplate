/**
 * Cache Configuration
 * Flexy says: Cache settings should be environment-specific!
 */

// Cache TTL Configuration (in seconds)
export const CACHE_TTL = {
  // API endpoints
  resources: parseInt(process.env.CACHE_TTL_RESOURCES || '300'), // 5 minutes
  search: parseInt(process.env.CACHE_TTL_SEARCH || '120'), // 2 minutes
  trending: parseInt(process.env.CACHE_TTL_TRENDING || '60'), // 1 minute
  analytics: parseInt(process.env.CACHE_TTL_ANALYTICS || '300'), // 5 minutes

  // Static content
  static: parseInt(process.env.CACHE_TTL_STATIC || '86400'), // 1 day
  assets: parseInt(process.env.CACHE_TTL_ASSETS || '2592000'), // 30 days
  fonts: parseInt(process.env.CACHE_TTL_FONTS || '31536000'), // 1 year

  // Data
  categories: parseInt(process.env.CACHE_TTL_CATEGORIES || '3600'), // 1 hour
  tags: parseInt(process.env.CACHE_TTL_TAGS || '1800'), // 30 minutes
} as const

// Cache Size Limits
export const CACHE_LIMITS = {
  maxMemorySize: parseInt(process.env.CACHE_MAX_MEMORY_SIZE || '2000'),
  maxEntries: parseInt(process.env.CACHE_MAX_ENTRIES || '100'),
  maxPopularSearches: parseInt(process.env.CACHE_MAX_POPULAR_SEARCHES || '50'),
  maxZeroResultSearches: parseInt(
    process.env.CACHE_MAX_ZERO_RESULT_SEARCHES || '50'
  ),
  maxPerformanceHistory: parseInt(
    process.env.CACHE_MAX_PERFORMANCE_HISTORY || '100'
  ),
  maxAnalyticsEntries: parseInt(
    process.env.CACHE_MAX_ANALYTICS_ENTRIES || '100'
  ),
} as const

// Cache Strategy Configuration
export const CACHE_STRATEGIES = {
  // HTTP Cache-Control headers
  headers: {
    // API responses
    api: {
      public: true,
      maxAge: CACHE_TTL.resources,
      staleWhileRevalidate: 60,
    },
    // Static assets
    static: {
      public: true,
      maxAge: CACHE_TTL.static,
      immutable: true,
    },
    // Build assets
    assets: {
      public: true,
      maxAge: CACHE_TTL.assets,
      immutable: true,
    },
  },

  // Storage prefixes
  prefixes: {
    memory: process.env.CACHE_PREFIX_MEMORY || 'memory:',
    persistent: process.env.CACHE_PREFIX_PERSISTENT || 'cache:',
    analytics: process.env.CACHE_PREFIX_ANALYTICS || 'analytics:',
    search: process.env.CACHE_PREFIX_SEARCH || 'search:',
  },
} as const

// Enhanced Cache Configuration
export const ENHANCED_CACHE_CONFIG = {
  // Default cache options
  defaults: {
    ttlSeconds: CACHE_TTL.resources,
    staleWhileRevalidate: true,
    backgroundRefresh: true,
  },

  // Compression settings
  compression: {
    enabled: process.env.CACHE_COMPRESSION_ENABLED === 'true',
    threshold: parseInt(process.env.CACHE_COMPRESSION_THRESHOLD || '1024'), // 1KB
  },

  // Monitoring
  monitoring: {
    enabled: process.env.CACHE_MONITORING_ENABLED === 'true',
    logHitRate: process.env.CACHE_LOG_HIT_RATE === 'true',
  },
} as const

// Export all cache configs
export default {
  ttl: CACHE_TTL,
  limits: CACHE_LIMITS,
  strategies: CACHE_STRATEGIES,
  enhanced: ENHANCED_CACHE_CONFIG,
}
