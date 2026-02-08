// ============================================
// ERROR MESSAGES CONFIGURATION
// Centralized error and success messages
// ============================================

export const ERROR_MESSAGES = {
  // Generic errors
  generic: {
    unknown: 'An unknown error occurred',
    unexpected: 'An unexpected error occurred',
    serverError: 'Internal server error',
    notFound: 'Resource not found',
    unauthorized: 'Unauthorized access',
    forbidden: 'Access forbidden',
    badRequest: 'Invalid request',
    timeout: 'Request timed out',
    networkError: 'Network error occurred',
  },

  // Validation errors
  validation: {
    invalidInput: 'Invalid input provided',
    missingField: (field: string) => `${field} is required`,
    invalidFormat: (field: string) => `${field} format is invalid`,
    tooShort: (field: string, min: number) =>
      `${field} must be at least ${min} characters`,
    tooLong: (field: string, max: number) =>
      `${field} is too long (max ${max} characters)`,
    invalidUrl: 'Please enter a valid URL',
    invalidEmail: 'Please enter a valid email address',
    invalidCategory: 'Invalid category selected',
  },

  // API errors
  api: {
    rateLimit: 'Rate limit exceeded. Please try again later.',
    serviceUnavailable: 'Service temporarily unavailable',
    badGateway: 'Bad gateway',
    gatewayTimeout: 'Gateway timeout',
    notImplemented: 'Feature not implemented',
  },

  // Database errors
  database: {
    connectionError: 'Database connection error',
    queryError: 'Database query error',
    duplicateEntry: 'Entry already exists',
    foreignKeyConstraint: 'Referenced resource does not exist',
  },

  // Authentication errors
  auth: {
    invalidCredentials: 'Invalid credentials',
    sessionExpired: 'Session has expired',
    invalidToken: 'Invalid or expired token',
    insufficientPermissions: 'Insufficient permissions',
  },

  // Resource errors
  resource: {
    notFound: 'Resource not found',
    alreadyExists: 'Resource already exists',
    invalidId: 'Invalid resource ID',
    creationFailed: 'Failed to create resource',
    updateFailed: 'Failed to update resource',
    deletionFailed: 'Failed to delete resource',
  },

  // Webhook errors
  webhook: {
    deliveryFailed: 'Webhook delivery failed',
    invalidPayload: 'Invalid webhook payload',
    endpointNotFound: 'Webhook endpoint not found',
    maxRetriesExceeded: 'Maximum retry attempts exceeded',
  },

  // Search errors
  search: {
    queryTooShort: 'Search query is too short',
    queryTooLong: 'Search query is too long',
    invalidQuery: 'Invalid search query',
    noResults: 'No results found',
  },

  // Clipboard errors
  clipboard: {
    copyFailed: 'Failed to copy to clipboard',
    unsupported: 'Clipboard API not supported',
  },

  // Network errors
  network: {
    offline: 'You are currently offline',
    connectionLost: 'Connection lost',
    unableToConnect: 'Unable to connect to server',
  },
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  // Generic success
  generic: {
    success: 'Operation completed successfully',
    saved: 'Changes saved successfully',
    deleted: 'Deleted successfully',
    updated: 'Updated successfully',
    created: 'Created successfully',
  },

  // Resource operations
  resource: {
    created: 'Resource created successfully',
    updated: 'Resource updated successfully',
    deleted: 'Resource deleted successfully',
    submitted: 'Resource submitted successfully',
    approved: 'Resource approved successfully',
    rejected: 'Resource rejected successfully',
    flagged: 'Resource flagged successfully',
  },

  // Webhook operations
  webhook: {
    created: 'Webhook created successfully',
    updated: 'Webhook updated successfully',
    deleted: 'Webhook deleted successfully',
    triggered: 'Webhook triggered successfully',
    delivered: 'Webhook delivered successfully',
    alreadyDelivered: 'Webhook already delivered (idempotent request)',
    noWebhooks: 'No webhooks to trigger',
    queued: (count: number, event: string) =>
      `Queued ${count} webhooks for async delivery for event: ${event}`,
  },

  // Moderation
  moderation: {
    approved: 'Submission approved successfully',
    rejected: 'Submission rejected successfully',
    flagged: 'Resource flagged successfully',
  },

  // Submission
  submission: {
    submitted: 'Resource submitted successfully',
    pendingReview: 'Your submission is pending review',
  },

  // Bookmarks
  bookmark: {
    added: 'Added to bookmarks',
    removed: 'Removed from bookmarks',
    cleared: 'All bookmarks cleared',
  },

  // Clipboard
  clipboard: {
    copied: 'Copied to clipboard',
    urlCopied: 'URL copied to clipboard',
  },

  // Search
  search: {
    saved: 'Search saved',
    cleared: 'Search history cleared',
  },
} as const

// Helper function to get error message
export function getErrorMessage(error: unknown, fallback?: string): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return fallback || ERROR_MESSAGES.generic.unknown
}

// Helper function to format error with field name
export function formatValidationError(
  message: string | ((field: string) => string),
  field: string
): string {
  return typeof message === 'function' ? message(field) : message
}
