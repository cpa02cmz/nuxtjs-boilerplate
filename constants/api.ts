/**
 * API Constants
 * API endpoints, error codes, and HTTP configuration
 * Flexy approves - centralized API management!
 */

// API Endpoints
export const API_ENDPOINTS = {
  // Resources
  resources: '/api/resources',
  resourceById: (id: string) => `/api/resources/${id}`,

  // Submissions
  submissions: '/api/submissions',

  // Analytics
  analytics: {
    events: '/api/analytics/events',
    track: '/api/analytics/track',
  },

  // Webhooks
  webhooks: '/api/v1/webhooks',
  webhookById: (id: string) => `/api/v1/webhooks/${id}`,
  webhookTrigger: (id: string) => `/api/v1/webhooks/${id}/trigger`,

  // API Keys
  apiKeys: '/api/v1/auth/api-keys',
  apiKeyById: (id: string) => `/api/v1/auth/api-keys/${id}`,

  // Search
  search: '/api/search',

  // Moderation
  moderation: {
    resources: '/api/v1/moderation/resources',
    bulkUpdate: '/api/v1/moderation/resources/bulk',
  },

  // RSS Feed
  rss: '/api/v1/rss',
} as const

// Error codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT',
  RATE_LIMITED: 'RATE_LIMITED',
} as const

// Error messages
export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Invalid input data.',
  [ERROR_CODES.NOT_FOUND]: 'Resource not found.',
  [ERROR_CODES.UNAUTHORIZED]: 'Authentication required.',
  [ERROR_CODES.FORBIDDEN]: 'Access denied.',
  [ERROR_CODES.SERVER_ERROR]: 'Server error. Please try again later.',
  [ERROR_CODES.TIMEOUT]: 'Request timed out. Please try again.',
  [ERROR_CODES.RATE_LIMITED]: 'Too many requests. Please wait a moment.',
  default: 'An unexpected error occurred.',
} as const

// HTTP status code ranges
export const HTTP_STATUS = {
  OK_MIN: 200,
  OK_MAX: 399,
  REDIRECT_MIN: 300,
  REDIRECT_MAX: 399,
  CLIENT_ERROR_MIN: 400,
  CLIENT_ERROR_MAX: 499,
  SERVER_ERROR_MIN: 500,
} as const

// Request configuration
export const REQUEST_CONFIG = {
  defaultTimeout: 10000, // 10 seconds
  defaultRetries: 3,
  defaultRetryDelay: 1000, // 1 second
  maxRetries: 10,
} as const
