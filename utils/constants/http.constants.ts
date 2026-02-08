/**
 * HTTP Header constants
 * Use these instead of hardcoded header strings
 */
export const HTTP_HEADERS = {
  /** Content-Type for JSON */
  CONTENT_TYPE_JSON: 'application/json',
  /** Content-Type for form data */
  CONTENT_TYPE_FORM: 'application/x-www-form-urlencoded',
  /** Content-Type for multipart form */
  CONTENT_TYPE_MULTIPART: 'multipart/form-data',
  /** User agent for resource validator */
  USER_AGENT_VALIDATOR: 'NuxtResourceValidator/1.0',
} as const

/**
 * CSRF Protection constants
 */
export const CSRF_CONSTANTS = {
  /** CSRF cookie name */
  COOKIE_NAME: 'csrf_token',
  /** CSRF header name */
  HEADER_NAME: 'x-csrf-token',
} as const

/**
 * HTTP Status code helpers
 */
export const HTTP_STATUS = {
  /** Check if status code indicates success (2xx or 3xx) */
  isSuccess: (status: number): boolean => status >= 200 && status < 400,
  /** Check if status code indicates redirect (3xx) */
  isRedirect: (status: number): boolean => status >= 300 && status < 400,
  /** Check if status code indicates client error (4xx) */
  isClientError: (status: number): boolean => status >= 400 && status < 500,
  /** Check if status code indicates server error (5xx) */
  isServerError: (status: number): boolean => status >= 500,
  /** Check if status code indicates OK (2xx) */
  isOk: (status: number): boolean => status >= 200 && status < 300,
} as const
