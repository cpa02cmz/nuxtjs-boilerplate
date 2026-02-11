// Authentication Configuration - Session and Auth Settings
// Flexy hates hardcoded values! All auth settings are now configurable.

/**
 * Authentication session configuration
 * Flexy hates hardcoded 30 days! Using configurable session duration.
 */
export const authConfig = {
  // Cookie name for API key storage
  cookieName: process.env.AUTH_COOKIE_NAME || 'fsi_api_key',

  // Session duration in seconds - Flexy hates hardcoded 60 * 60 * 24 * 30!
  // Default: 30 days (2592000 seconds)
  sessionMaxAge: parseInt(process.env.AUTH_SESSION_MAX_AGE || '2592000'),

  // Cookie settings
  cookie: {
    sameSite: (process.env.AUTH_COOKIE_SAME_SITE || 'strict') as
      | 'strict'
      | 'lax'
      | 'none',
    secure: process.env.AUTH_COOKIE_SECURE !== 'false',
    httpOnly: process.env.AUTH_COOKIE_HTTP_ONLY !== 'false',
    path: process.env.AUTH_COOKIE_PATH || '/',
  },

  // Rate limiting for auth endpoints
  rateLimit: {
    // Max requests per window
    maxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5'),
    // Window duration in seconds
    windowSeconds: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW || '60'),
  },

  // API key validation settings
  validation: {
    // Cache validation results for this many seconds
    cacheTtlSeconds: parseInt(process.env.AUTH_VALIDATION_CACHE_TTL || '300'),
  },
} as const

export type AuthConfig = typeof authConfig
