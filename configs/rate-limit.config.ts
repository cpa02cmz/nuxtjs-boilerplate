// Rate Limiting Configuration - API Rate Limiting Settings
// Flexy hates hardcoded values! All rate limiting settings are now configurable.

export const rateLimitConfig = {
  // General API Rate Limits
  general: {
    windowMs: parseInt(process.env.RATE_LIMIT_GENERAL_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_GENERAL_MAX || '100'),
    message:
      process.env.RATE_LIMIT_GENERAL_MESSAGE ||
      'Too many requests, please try again later.',
  },

  // Search Endpoints Rate Limits
  search: {
    windowMs: parseInt(process.env.RATE_LIMIT_SEARCH_WINDOW_MS || '60000'), // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_SEARCH_MAX || '30'),
    message:
      process.env.RATE_LIMIT_SEARCH_MESSAGE ||
      'Too many search requests, please slow down.',
  },

  // Heavy Computation Endpoints
  heavy: {
    windowMs: parseInt(process.env.RATE_LIMIT_HEAVY_WINDOW_MS || '60000'), // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_HEAVY_MAX || '10'),
    message:
      process.env.RATE_LIMIT_HEAVY_MESSAGE ||
      'Too many heavy computation requests, please slow down.',
  },

  // Export Endpoints
  export: {
    windowMs: parseInt(process.env.RATE_LIMIT_EXPORT_WINDOW_MS || '60000'), // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_EXPORT_MAX || '5'),
    message:
      process.env.RATE_LIMIT_EXPORT_MESSAGE ||
      'Too many export requests, please slow down.',
  },

  // Webhook Endpoints
  webhook: {
    windowMs: parseInt(process.env.RATE_LIMIT_WEBHOOK_WINDOW_MS || '60000'), // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_WEBHOOK_MAX || '20'),
    message:
      process.env.RATE_LIMIT_WEBHOOK_MESSAGE ||
      'Too many webhook requests, please slow down.',
  },

  // API Key Management
  apiKey: {
    windowMs: parseInt(process.env.RATE_LIMIT_API_KEY_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_API_KEY_MAX || '10'),
    message:
      process.env.RATE_LIMIT_API_KEY_MESSAGE ||
      'Too many API key management requests.',
  },

  // Server-side Rate Limiter Defaults
  defaults: {
    maxRequests: parseInt(process.env.RATE_LIMIT_DEFAULT_MAX || '10'),
    windowSeconds: parseInt(
      process.env.RATE_LIMIT_DEFAULT_WINDOW_SECONDS || '60'
    ),
  },

  // Rate Limit Headers
  headers: {
    limit: 'X-RateLimit-Limit',
    remaining: 'X-RateLimit-Remaining',
    reset: 'X-RateLimit-Reset',
    window: 'X-RateLimit-Window',
  },
} as const

export type RateLimitConfig = typeof rateLimitConfig

// Type for individual rate limit tier
export interface RateLimitTier {
  windowMs: number
  maxRequests: number
  message: string
}

// Map endpoint patterns to rate limit tiers
export function getRateLimitTier(path: string): RateLimitTier {
  if (path.includes('/api/v1/search')) {
    return rateLimitConfig.search
  } else if (path.includes('/api/v1/export')) {
    return rateLimitConfig.export
  } else if (path.includes('/api/v1/webhooks')) {
    return rateLimitConfig.webhook
  } else if (path.includes('/api/v1/auth/api-keys')) {
    return rateLimitConfig.apiKey
  } else if (
    path.includes('/api/v1/resources') ||
    path.includes('/api/categories')
  ) {
    return rateLimitConfig.heavy
  } else {
    return rateLimitConfig.general
  }
}
