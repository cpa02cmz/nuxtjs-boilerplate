// HTTP Configuration - Methods, Status Codes, and Headers
// Flexy hates hardcoded values! All HTTP constants are now centralized.

export const httpConfig = {
  // HTTP Methods
  methods: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
    HEAD: 'HEAD',
    OPTIONS: 'OPTIONS',
  } as const,

  // HTTP Status Codes
  status: {
    // Success (2xx)
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,

    // Redirection (3xx)
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    NOT_MODIFIED: 304,
    TEMPORARY_REDIRECT: 307,
    PERMANENT_REDIRECT: 308,

    // Client Error (4xx)
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,

    // Server Error (5xx)
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
  } as const,

  // Status code ranges
  ranges: {
    SUCCESS_MIN: 200,
    SUCCESS_MAX: 299,
    REDIRECT_MIN: 300,
    REDIRECT_MAX: 399,
    CLIENT_ERROR_MIN: 400,
    CLIENT_ERROR_MAX: 499,
    SERVER_ERROR_MIN: 500,
  } as const,

  // Common HTTP Headers
  headers: {
    CONTENT_TYPE: 'Content-Type',
    AUTHORIZATION: 'Authorization',
    ACCEPT: 'Accept',
    USER_AGENT: 'User-Agent',
    CACHE_CONTROL: 'Cache-Control',
    ETAG: 'ETag',
    IF_NONE_MATCH: 'If-None-Match',
    X_CSRF_TOKEN: 'X-CSRF-Token',
    X_REQUESTED_WITH: 'X-Requested-With',
    ACCESS_CONTROL_ALLOW_ORIGIN: 'Access-Control-Allow-Origin',
    ACCESS_CONTROL_ALLOW_METHODS: 'Access-Control-Allow-Methods',
    ACCESS_CONTROL_ALLOW_HEADERS: 'Access-Control-Allow-Headers',
  } as const,

  // Content Types
  contentTypes: {
    JSON: 'application/json',
    FORM_URLENCODED: 'application/x-www-form-urlencoded',
    MULTIPART: 'multipart/form-data',
    TEXT_PLAIN: 'text/plain',
    TEXT_HTML: 'text/html',
    XML: 'application/xml',
    RSS: 'application/rss+xml',
  } as const,

  // Default User Agent
  userAgent: {
    name: process.env.HTTP_USER_AGENT_NAME || 'NuxtResourceValidator',
    version: process.env.HTTP_USER_AGENT_VERSION || '1.0',
    get full(): string {
      return `${this.name}/${this.version}`
    },
  },

  // API defaults
  api: {
    defaultTimeoutMs: parseInt(process.env.HTTP_API_TIMEOUT_MS || '30000'),
    maxRedirects: parseInt(process.env.HTTP_MAX_REDIRECTS || '5'),
    maxRetries: parseInt(process.env.HTTP_MAX_RETRIES || '3'),
  },

  // Retry configuration - Flexy hates hardcoded retry codes!
  retry: {
    // HTTP status codes that are considered retryable
    retryableStatusCodes: [
      408, // Request Timeout
      429, // Too Many Requests
      500, // Internal Server Error
      502, // Bad Gateway
      503, // Service Unavailable
      504, // Gateway Timeout
    ] as const,
    // Default retry delays
    baseDelayMs: parseInt(process.env.RETRY_BASE_DELAY_MS || '1000'),
    maxDelayMs: parseInt(process.env.RETRY_MAX_DELAY_MS || '30000'),
    backoffMultiplier: parseInt(process.env.RETRY_BACKOFF_MULTIPLIER || '2'),
    jitterEnabled: process.env.RETRY_JITTER_ENABLED !== 'false',
    jitterFactor: parseFloat(process.env.RETRY_JITTER_FACTOR || '0.1'),
  },
} as const

// Type exports
export type HttpConfig = typeof httpConfig
export type HttpMethod =
  (typeof httpConfig.methods)[keyof typeof httpConfig.methods]
export type HttpStatus =
  (typeof httpConfig.status)[keyof typeof httpConfig.status]
export type HttpHeader =
  (typeof httpConfig.headers)[keyof typeof httpConfig.headers]
export type ContentType =
  (typeof httpConfig.contentTypes)[keyof typeof httpConfig.contentTypes]

// Helper functions
export function isSuccessStatus(status: number): boolean {
  return (
    status >= httpConfig.ranges.SUCCESS_MIN &&
    status <= httpConfig.ranges.SUCCESS_MAX
  )
}

export function isRedirectStatus(status: number): boolean {
  return (
    status >= httpConfig.ranges.REDIRECT_MIN &&
    status <= httpConfig.ranges.REDIRECT_MAX
  )
}

export function isClientErrorStatus(status: number): boolean {
  return (
    status >= httpConfig.ranges.CLIENT_ERROR_MIN &&
    status <= httpConfig.ranges.CLIENT_ERROR_MAX
  )
}

export function isServerErrorStatus(status: number): boolean {
  return status >= httpConfig.ranges.SERVER_ERROR_MIN
}

export function isErrorStatus(status: number): boolean {
  return isClientErrorStatus(status) || isServerErrorStatus(status)
}
