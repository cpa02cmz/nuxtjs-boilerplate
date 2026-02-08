/**
 * Rate Limiting Configuration
 * Flexy says: Rate limits should be configurable per environment!
 */

// Time windows in milliseconds
const TIME_WINDOWS = {
  ONE_MINUTE: 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  FIFTEEN_MINUTES: 15 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
} as const

// Default rate limit settings
const DEFAULT_RATE_LIMIT = {
  windowMs: TIME_WINDOWS.FIFTEEN_MINUTES,
  maxRequests: 100,
} as const

// Route-specific rate limits
export const RATE_LIMITS = {
  // General API endpoints
  general: {
    windowMs:
      parseInt(process.env.RATE_LIMIT_GENERAL_WINDOW_MS || '0') ||
      TIME_WINDOWS.FIFTEEN_MINUTES,
    maxRequests: parseInt(process.env.RATE_LIMIT_GENERAL_MAX || '0') || 100,
  },

  // Search endpoints (stricter)
  search: {
    windowMs:
      parseInt(process.env.RATE_LIMIT_SEARCH_WINDOW_MS || '0') ||
      TIME_WINDOWS.ONE_MINUTE,
    maxRequests: parseInt(process.env.RATE_LIMIT_SEARCH_MAX || '0') || 30,
  },

  // Heavy operations (very strict)
  heavy: {
    windowMs:
      parseInt(process.env.RATE_LIMIT_HEAVY_WINDOW_MS || '0') ||
      TIME_WINDOWS.ONE_MINUTE,
    maxRequests: parseInt(process.env.RATE_LIMIT_HEAVY_MAX || '0') || 10,
  },

  // Export operations (strictest)
  export: {
    windowMs:
      parseInt(process.env.RATE_LIMIT_EXPORT_WINDOW_MS || '0') ||
      TIME_WINDOWS.ONE_MINUTE,
    maxRequests: parseInt(process.env.RATE_LIMIT_EXPORT_MAX || '0') || 5,
  },

  // API-specific endpoints
  api: {
    windowMs:
      parseInt(process.env.RATE_LIMIT_API_WINDOW_MS || '0') ||
      TIME_WINDOWS.FIVE_MINUTES,
    maxRequests: parseInt(process.env.RATE_LIMIT_API_MAX || '0') || 50,
  },

  // Analytics endpoints
  analytics: {
    windowMs:
      parseInt(process.env.RATE_LIMIT_ANALYTICS_WINDOW_MS || '0') ||
      TIME_WINDOWS.ONE_MINUTE,
    maxRequests: parseInt(process.env.RATE_LIMIT_ANALYTICS_MAX || '0') || 10,
  },
} as const

// Default rate limiter config
export const DEFAULT_RATE_LIMITER_CONFIG = {
  maxRequests: parseInt(process.env.RATE_LIMIT_DEFAULT_MAX || '0') || 10,
  windowSeconds: parseInt(process.env.RATE_LIMIT_DEFAULT_WINDOW || '0') || 60,
} as const

// Enhanced rate limit configuration
export const ENHANCED_RATE_LIMIT_CONFIG = {
  // Storage configuration
  storage: {
    prefix: process.env.RATE_LIMIT_STORAGE_PREFIX || 'rate-limit:',
  },

  // Retryable status codes
  retryableStatusCodes: [408, 429, 500, 502, 503, 504] as const,

  // Headers
  headers: {
    limit: 'X-RateLimit-Limit',
    remaining: 'X-RateLimit-Remaining',
    reset: 'X-RateLimit-Reset',
  },
} as const

// Export all rate limit configs
export default {
  timeWindows: TIME_WINDOWS,
  defaults: DEFAULT_RATE_LIMIT,
  limits: RATE_LIMITS,
  enhanced: ENHANCED_RATE_LIMIT_CONFIG,
}
