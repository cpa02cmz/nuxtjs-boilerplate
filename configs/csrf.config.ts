// CSRF Protection Configuration
// Flexy hates hardcoded values! All CSRF settings are now configurable.

// Time constants (in seconds)
const ONE_HOUR = 60 * 60
const ONE_DAY = ONE_HOUR * 24

export const csrfConfig = {
  // Cookie settings
  cookie: {
    name: process.env.CSRF_COOKIE_NAME || 'csrf_token',
    maxAge: parseInt(process.env.CSRF_COOKIE_MAX_AGE_SECONDS || `${ONE_DAY}`),
    httpOnly: false, // Must be accessible by JavaScript for Double Submit pattern
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  },

  // Header settings
  header: {
    name: process.env.CSRF_HEADER_NAME || 'x-csrf-token',
    responseHeader: 'X-CSRF-Token',
  },

  // Token generation
  token: {
    bytes: parseInt(process.env.CSRF_TOKEN_BYTES || '32'),
    encoding: 'hex' as const,
  },

  // Protected paths that require CSRF validation
  protectedPaths: {
    prefixes: [
      '/api/submissions',
      '/api/v1/auth/api-keys',
      '/api/analytics/events',
      '/api/user/preferences',
      '/api/moderation/flag',
      '/api/moderation/approve',
      '/api/moderation/reject',
      '/api/resources/bulk-status',
      '/api/resources/',
    ],
  },

  // HTTP methods that don't require CSRF validation (safe methods)
  safeMethods: ['GET', 'HEAD', 'OPTIONS'] as const,

  // HTTP methods that require CSRF validation (state-changing methods)
  stateChangingMethods: ['POST', 'PUT', 'PATCH', 'DELETE'] as const,

  // Content types that may contain CSRF tokens in body
  contentTypes: {
    json: 'application/json',
    formUrlEncoded: 'application/x-www-form-urlencoded',
    multipart: 'multipart/form-data',
  },

  // Error messages
  errors: {
    validationFailed:
      'CSRF token validation failed. Please include the CSRF token in the X-CSRF-Token header.',
    missingToken: 'CSRF token is missing.',
    invalidToken: 'Invalid CSRF token.',
  },
} as const

// Type exports
export type CsrfConfig = typeof csrfConfig
export type SafeMethod = (typeof csrfConfig.safeMethods)[number]
export type StateChangingMethod =
  (typeof csrfConfig.stateChangingMethods)[number]

// Helper functions
export function isSafeMethod(method: string): method is SafeMethod {
  return csrfConfig.safeMethods.includes(method as SafeMethod)
}

export function isStateChangingMethod(
  method: string
): method is StateChangingMethod {
  return csrfConfig.stateChangingMethods.includes(method as StateChangingMethod)
}

export function requiresCsrfProtection(path: string): boolean {
  return csrfConfig.protectedPaths.prefixes.some(prefix =>
    path.startsWith(prefix)
  )
}
