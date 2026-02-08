// ============================================
// VALIDATION CONFIGURATION
// String limits, schema constraints, and error messages
// ============================================

export const VALIDATION_CONFIG = {
  // String length limits
  limits: {
    // Resource fields
    title: {
      min: 3,
      max: 200,
    },
    description: {
      min: 10,
      max: 2000,
    },
    url: {
      max: 2000,
    },

    // Arrays
    tags: {
      max: 20,
      minLength: 1,
      maxLength: 50,
    },
    technologies: {
      max: 20,
    },
    benefits: {
      max: 10,
    },

    // Search
    query: {
      min: 2,
      max: 500,
    },

    // API Keys
    apiKeyName: {
      min: 1,
      max: 100,
    },

    // Moderation
    reason: {
      min: 10,
      max: 500,
    },
    notes: {
      max: 1000,
    },

    // Bulk operations
    resourceIds: {
      max: 100,
    },
  },

  // Pagination limits
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
    maxItemsPerRequest: 1000,
  },

  // RSS/Feed limits
  feed: {
    defaultLimit: 20,
    maxLimit: 50,
  },

  // Search configuration
  search: {
    minQueryLength: 2,
    maxSuggestions: 5,
    maxHistoryItems: 10,
    defaultLimit: 20,
  },

  // Error message templates
  messages: {
    required: (field: string) => `${field} is required`,
    minLength: (field: string, min: number) =>
      `${field} must be at least ${min} characters`,
    maxLength: (field: string, max: number) =>
      `${field} must not exceed ${max} characters`,
    minValue: (field: string, min: number) =>
      `${field} must be at least ${min}`,
    maxValue: (field: string, max: number) => `${field} must not exceed ${max}`,
    invalidFormat: (field: string) => `${field} format is invalid`,
    invalidUrl: 'Please enter a valid URL',
    invalidEmail: 'Please enter a valid email address',
    arrayTooLong: (field: string, max: number) =>
      `Too many ${field} (maximum ${max})`,
  },
} as const

// Validation patterns
export const VALIDATION_PATTERNS = {
  // URLs
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,

  // Email
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // Slug
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,

  // Image extensions
  image: /\.(png|jpe?g|gif|svg|webp)$/i,

  // GitHub URL
  github: /^https:\/\/github\.com\/[^/]+\/[^/]+/,

  // UUID
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const
