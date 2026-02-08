// ============================================
// HTTP STATUS CONFIGURATION
// Status codes and retryable codes
// ============================================

export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Redirects
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,

  // Client errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  GONE: 410,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  REQUEST_TIMEOUT: 408,

  // Server errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const

// Status code ranges
export const HTTP_STATUS_RANGES = {
  OK_MIN: 200,
  OK_MAX: 299,
  REDIRECT_MIN: 300,
  REDIRECT_MAX: 399,
  CLIENT_ERROR_MIN: 400,
  CLIENT_ERROR_MAX: 499,
  SERVER_ERROR_MIN: 500,
  SERVER_ERROR_MAX: 599,
} as const

// Retryable HTTP status codes
export const RETRYABLE_STATUS_CODES = [
  HTTP_STATUS.REQUEST_TIMEOUT,
  HTTP_STATUS.TOO_MANY_REQUESTS,
  HTTP_STATUS.INTERNAL_SERVER_ERROR,
  HTTP_STATUS.BAD_GATEWAY,
  HTTP_STATUS.SERVICE_UNAVAILABLE,
  HTTP_STATUS.GATEWAY_TIMEOUT,
] as const

// Status code categories
export const isSuccess = (status: number): boolean =>
  status >= HTTP_STATUS_RANGES.OK_MIN && status <= HTTP_STATUS_RANGES.OK_MAX

export const isRedirect = (status: number): boolean =>
  status >= HTTP_STATUS_RANGES.REDIRECT_MIN &&
  status <= HTTP_STATUS_RANGES.REDIRECT_MAX

export const isClientError = (status: number): boolean =>
  status >= HTTP_STATUS_RANGES.CLIENT_ERROR_MIN &&
  status <= HTTP_STATUS_RANGES.CLIENT_ERROR_MAX

export const isServerError = (status: number): boolean =>
  status >= HTTP_STATUS_RANGES.SERVER_ERROR_MIN &&
  status <= HTTP_STATUS_RANGES.SERVER_ERROR_MAX

export const isRetryable = (status: number): boolean =>
  RETRYABLE_STATUS_CODES.includes(
    status as (typeof RETRYABLE_STATUS_CODES)[number]
  )
