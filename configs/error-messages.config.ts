// Error Messages Configuration - Centralized Error Messages
// Flexy hates hardcoded strings! All error messages are now configurable.

export const errorMessagesConfig = {
  // Authentication/Authorization Errors
  auth: {
    mustBeLoggedIn: 'User must be logged in to perform this action',
    mustBeModerator: 'User must be a moderator to perform this action',
    mustBeAdmin: 'User must be an admin to perform this action',
    invalidCredentials: 'Invalid credentials provided',
    sessionExpired: 'Your session has expired. Please log in again',
    unauthorized: 'You are not authorized to perform this action',
  },

  // Resource Errors
  resource: {
    notFound: 'Resource not found',
    invalidId: 'Invalid resource ID',
    alreadyExists: 'Resource already exists',
    creationFailed: 'Failed to create resource',
    updateFailed: 'Failed to update resource',
    deletionFailed: 'Failed to delete resource',
    invalidStatus: 'Invalid resource status',
  },

  // Validation Errors
  validation: {
    failed: 'Validation failed',
    invalidUrl: 'Invalid URL format',
    invalidEmail: 'Invalid email format',
    required: 'This field is required',
    tooShort: (field: string, min: number) =>
      `${field} must be at least ${min} characters`,
    tooLong: (field: string, max: number) =>
      `${field} must not exceed ${max} characters`,
    invalidCharacters: 'Field contains invalid characters',
  },

  // Search Errors
  search: {
    indexNotInitialized: 'Search index not initialized',
    queryRequired: 'Search query is required',
    queryTooLong: 'Search query too long',
    invalidFilters: 'Invalid search filters provided',
  },

  // Community Feature Errors
  community: {
    mustBeLoggedInToVote: 'User must be logged in to vote',
    mustBeLoggedInToComment: 'User must be logged in to comment',
    mustBeLoggedInToReply: 'User must be logged in to reply',
    mustBeLoggedInToBookmark: 'User must be logged in to bookmark',
    mustBeLoggedInToFlag: 'User must be logged in to flag content',
    alreadyVoted: 'You have already voted on this item',
    commentNotFound: 'Comment not found',
    cannotEditOthersComment: 'You can only edit your own comments',
    cannotDeleteOthersComment: 'You can only delete your own comments',
  },

  // API Errors
  api: {
    rateLimitExceeded: 'Rate limit exceeded. Please try again later',
    invalidApiKey: 'Invalid API key',
    apiKeyExpired: 'API key has expired',
    insufficientScopes: 'API key does not have required scopes',
    serviceUnavailable: 'Service temporarily unavailable',
  },

  // Webhook Errors
  webhook: {
    invalidUrl: 'Invalid webhook URL format',
    deliveryFailed: 'Webhook delivery failed',
    secretRequired: 'Webhook secret is required',
    eventsRequired: 'At least one event is required',
  },

  // Clipboard Errors
  clipboard: {
    copyFailed: 'Failed to copy to clipboard',
    execCommandFailed: 'execCommand copy failed',
    notSupported: 'Clipboard API not supported in this browser',
  },

  // Server Errors
  server: {
    internalError: 'Internal server error',
    requestBodyReadFailed: 'Failed to read request body',
    databaseError: 'Database operation failed',
    timeout: 'Request timeout',
  },

  // Submission Errors
  submission: {
    invalidCategory: 'Invalid category selected',
    tooManyTags: 'Too many tags provided',
    tooManyTechnologies: 'Too many technologies provided',
    tooManyBenefits: 'Too many benefits provided',
    invalidPricingModel: 'Invalid pricing model selected',
    invalidDifficulty: 'Invalid difficulty level selected',
  },

  // Moderation Errors
  moderation: {
    reasonTooShort: 'Reason must be at least 10 characters',
    reasonTooLong: 'Reason too long',
    notesTooLong: 'Notes too long',
    invalidAction: 'Invalid moderation action',
    flagNotFound: 'Flag not found',
  },
} as const

export type ErrorMessagesConfig = typeof errorMessagesConfig
