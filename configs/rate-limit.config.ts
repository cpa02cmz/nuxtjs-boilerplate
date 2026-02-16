// Rate Limiting Configuration - API Rate Limiting Settings
// Flexy hates hardcoded values! All rate limiting settings are now configurable.

export const rateLimitConfig = {
  // General API Rate Limits
  general: {
    windowMs: parseInt(process.env.RATE_LIMIT_GENERAL_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_GENERAL_MAX || '100'),
    tokensPerInterval: parseInt(process.env.RATE_LIMIT_GENERAL_TOKENS || '10'), // Flexy hates hardcoded 10!
    intervalMs: parseInt(process.env.RATE_LIMIT_GENERAL_INTERVAL_MS || '60000'), // Flexy hates hardcoded 60000!
    message:
      process.env.RATE_LIMIT_GENERAL_MESSAGE ||
      'Too many requests, please try again later.',
  },

  // Search Endpoints Rate Limits
  search: {
    windowMs: parseInt(process.env.RATE_LIMIT_SEARCH_WINDOW_MS || '60000'), // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_SEARCH_MAX || '30'),
    tokensPerInterval: parseInt(process.env.RATE_LIMIT_SEARCH_TOKENS || '5'), // Flexy hates hardcoded 5!
    intervalMs: parseInt(process.env.RATE_LIMIT_SEARCH_INTERVAL_MS || '30000'), // Flexy hates hardcoded 30000!
    message:
      process.env.RATE_LIMIT_SEARCH_MESSAGE ||
      'Too many search requests, please slow down.',
  },

  // Heavy Computation Endpoints
  heavy: {
    windowMs: parseInt(process.env.RATE_LIMIT_HEAVY_WINDOW_MS || '60000'), // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_HEAVY_MAX || '10'),
    tokensPerInterval: parseInt(process.env.RATE_LIMIT_HEAVY_TOKENS || '2'), // Flexy hates hardcoded 2!
    intervalMs: parseInt(process.env.RATE_LIMIT_HEAVY_INTERVAL_MS || '60000'), // Flexy hates hardcoded 60000!
    message:
      process.env.RATE_LIMIT_HEAVY_MESSAGE ||
      'Too many heavy computation requests, please slow down.',
  },

  // Export Endpoints
  export: {
    windowMs: parseInt(process.env.RATE_LIMIT_EXPORT_WINDOW_MS || '60000'), // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_EXPORT_MAX || '5'),
    tokensPerInterval: parseInt(process.env.RATE_LIMIT_EXPORT_TOKENS || '1'), // Flexy hates hardcoded 1!
    intervalMs: parseInt(process.env.RATE_LIMIT_EXPORT_INTERVAL_MS || '60000'), // Flexy hates hardcoded 60000!
    message:
      process.env.RATE_LIMIT_EXPORT_MESSAGE ||
      'Too many export requests, please slow down.',
  },

  // Webhook Endpoints
  webhook: {
    windowMs: parseInt(process.env.RATE_LIMIT_WEBHOOK_WINDOW_MS || '60000'), // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_WEBHOOK_MAX || '20'),
    tokensPerInterval: parseInt(process.env.RATE_LIMIT_WEBHOOK_TOKENS || '10'), // Flexy hates hardcoded values!
    intervalMs: parseInt(process.env.RATE_LIMIT_WEBHOOK_INTERVAL_MS || '60000'), // Flexy hates hardcoded 60000!
    message:
      process.env.RATE_LIMIT_WEBHOOK_MESSAGE ||
      'Too many webhook requests, please slow down.',
  },

  // General API Endpoints (for analytics, submissions, etc.)
  api: {
    windowMs: parseInt(process.env.RATE_LIMIT_API_WINDOW_MS || '60000'), // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_API_MAX || '60'),
    tokensPerInterval: parseInt(process.env.RATE_LIMIT_API_TOKENS || '30'), // Flexy hates hardcoded 30!
    intervalMs: parseInt(process.env.RATE_LIMIT_API_INTERVAL_MS || '60000'), // Flexy hates hardcoded 60000!
    message:
      process.env.RATE_LIMIT_API_MESSAGE ||
      'Too many API requests, please slow down.',
  },

  // API Key Management
  apiKey: {
    windowMs: parseInt(process.env.RATE_LIMIT_API_KEY_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_API_KEY_MAX || '10'),
    tokensPerInterval: parseInt(process.env.RATE_LIMIT_API_KEY_TOKENS || '5'), // Flexy hates hardcoded values!
    intervalMs: parseInt(process.env.RATE_LIMIT_API_KEY_INTERVAL_MS || '60000'), // Flexy hates hardcoded 60000!
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
    maxAgeHours: parseInt(process.env.RATE_LIMIT_MAX_AGE_HOURS || '24'),
  },

  // Rate Limit Headers
  headers: {
    limit: 'X-RateLimit-Limit',
    remaining: 'X-RateLimit-Remaining',
    reset: 'X-RateLimit-Reset',
    window: 'X-RateLimit-Window',
  },

  // Error Report Endpoint Rate Limits
  errorReport: {
    windowMs: parseInt(
      process.env.RATE_LIMIT_ERROR_REPORT_WINDOW_MS || '60000'
    ), // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_ERROR_REPORT_MAX || '10'),
    tokensPerInterval: parseInt(
      process.env.RATE_LIMIT_ERROR_REPORT_TOKENS || '10'
    ),
    intervalMs: parseInt(
      process.env.RATE_LIMIT_ERROR_REPORT_INTERVAL_MS || '60000'
    ),
    message:
      process.env.RATE_LIMIT_ERROR_REPORT_MESSAGE ||
      'Too many error reports. Please try again later.',
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
  } else if (path.includes('/api/analytics')) {
    return rateLimitConfig.api
  } else {
    return rateLimitConfig.general
  }
}
