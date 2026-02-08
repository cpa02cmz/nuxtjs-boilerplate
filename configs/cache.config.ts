// ============================================
// CACHE CONFIGURATION
// TTL values, size limits, and cleanup intervals
// ============================================

export const CACHE_CONFIG = {
  // Time-to-live values in milliseconds
  ttl: {
    default: 5 * 60 * 1000, // 5 minutes
    short: 60 * 1000, // 1 minute
    medium: 5 * 60 * 1000, // 5 minutes
    long: 60 * 60 * 1000, // 1 hour
    day: 24 * 60 * 60 * 1000, // 24 hours
  },

  // TTL values in seconds (for nitro/server)
  ttlSeconds: {
    default: 300, // 5 minutes
    search: 120, // 2 minutes
    resources: 300, // 5 minutes
    suggestions: 60, // 1 minute
    analytics: 60, // 1 minute
    static: 86400, // 24 hours
  },

  // Size limits
  limits: {
    maxEntries: 1000,
    maxMemorySize: 1000,
    maxMemorySizeEnhanced: 2000,
    maxPopularSearches: 50,
    maxZeroResultSearches: 50,
    maxPerformanceHistory: 100,
    maxAnalyticsEntries: 100,
    maxCacheSize: 100,
  },

  // Cleanup intervals
  cleanup: {
    interval: 5 * 60 * 1000, // 5 minutes
    staleThreshold: 30 * 60 * 1000, // 30 minutes
  },

  // Cache keys prefixes
  prefixes: {
    search: 'search:',
    resource: 'resource:',
    analytics: 'analytics:',
    session: 'session:',
    rateLimit: 'ratelimit:',
  },

  // Tag-based cache invalidation
  tags: {
    resources: 'resources',
    search: 'search',
    analytics: 'analytics',
    all: 'all',
  },
} as const

// Cache control headers
export const CACHE_HEADERS = {
  // Directives
  noStore: 'no-store',
  noCache: 'no-cache',
  mustRevalidate: 'must-revalidate',
  private: 'private',
  public: 'public',

  // Max ages (in seconds)
  maxAge: {
    default: 300,
    static: 86400,
    api: 60,
  },
} as const
