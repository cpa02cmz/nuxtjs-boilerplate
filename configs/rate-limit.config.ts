// ============================================
// RATE LIMITING CONFIGURATION
// All rate limiting windows, thresholds, and messages
// ============================================

export const RATE_LIMIT_CONFIG = {
  // Time windows in milliseconds
  windows: {
    general: 15 * 60 * 1000, // 15 minutes
    api: 5 * 60 * 1000, // 5 minutes
    search: 60 * 1000, // 1 minute
    heavy: 60 * 1000, // 1 minute
    export: 60 * 1000, // 1 minute
    webhook: 5 * 60 * 1000, // 5 minutes
    apiKey: 5 * 60 * 1000, // 5 minutes
  },

  // Maximum requests per window
  maxRequests: {
    general: 100,
    search: 30,
    heavy: 10,
    export: 5,
    webhook: 20,
    apiKey: 10,
    api: {
      default: 100,
      authenticated: 1000,
    },
  },

  // Error messages
  messages: {
    general: 'Too many requests, please try again later.',
    search: 'Too many search requests, please slow down.',
    heavy: 'Too many heavy computation requests, please slow down.',
    export: 'Too many export requests, please slow down.',
    webhook: 'Too many webhook requests, please slow down.',
    apiKey: 'Too many API key management requests.',
    api: 'API rate limit exceeded. Please try again later.',
  },

  // Headers
  headers: {
    limit: 'X-RateLimit-Limit',
    remaining: 'X-RateLimit-Remaining',
    reset: 'X-RateLimit-Reset',
    retryAfter: 'Retry-After',
  },

  // Skip rate limiting for these paths
  skipPaths: [
    '/health',
    '/_nuxt',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
  ],

  // Trusted IP ranges (optional)
  trustedIps: [] as string[],
} as const

// Enhanced rate limit tiers
export const RATE_LIMIT_TIERS = {
  anonymous: {
    points: 30,
    duration: 60, // seconds
    blockDuration: 300, // seconds
  },
  user: {
    points: 100,
    duration: 60,
    blockDuration: 300,
  },
  premium: {
    points: 500,
    duration: 60,
    blockDuration: 300,
  },
  internal: {
    points: 1000,
    duration: 60,
    blockDuration: 0,
  },
} as const

export type RateLimitTier = keyof typeof RATE_LIMIT_TIERS
