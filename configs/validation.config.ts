/**
 * Validation Configuration
 * All field validation limits and rules
 * Flexy says: "Validation limits should be configurable!"
 */

// Field Length Limits
export const FIELD_LIMITS = {
  // Resource name
  name: {
    min: 2,
    max: 200,
  },

  // Resource description
  description: {
    min: 10,
    max: 2000,
  },

  // Resource URL
  url: {
    min: 5,
    max: 2000,
  },

  // Tags
  tags: {
    min: 1,
    max: 10,
    maxLength: 50,
  },

  // Search query
  searchQuery: {
    min: 2,
    max: 200,
  },

  // User name
  userName: {
    min: 2,
    max: 100,
  },

  // Email
  email: {
    max: 254, // RFC 5321
  },

  // Comment/Review
  comment: {
    min: 5,
    max: 1000,
  },
} as const

// Validation History Configuration
export const VALIDATION_CONFIG = {
  // Maximum validation history size
  historySize: 10,

  // URL validation timeout
  urlTimeoutMs: 10000,

  // Health check interval
  healthCheckIntervalMs: 86400000, // 24 hours

  // Minimum description quality score
  minDescriptionQuality: 30,
} as const

// Quality Check Configuration
export const QUALITY_CONFIG = {
  // Minimum description length for quality check
  minDescriptionLength: 30,

  // Quality score thresholds
  excellent: 80,
  good: 60,
  average: 40,
  poor: 20,
} as const

// Enum Values
export const ENUM_VALUES = {
  // Valid pricing models
  pricingModels: ['Free', 'Freemium', 'Paid', 'Contact for Pricing'],

  // Valid difficulty levels
  difficultyLevels: ['Beginner', 'Intermediate', 'Advanced'],

  // Valid resource statuses
  statuses: ['active', 'inactive', 'pending', 'deprecated'],

  // Valid event types
  eventTypes: [
    'resource_view',
    'search',
    'filter_change',
    'bookmark',
    'comparison',
    'submission',
  ],
} as const

// Export all validation configs
export const VALIDATION = {
  fieldLimits: FIELD_LIMITS,
  config: VALIDATION_CONFIG,
  quality: QUALITY_CONFIG,
  enums: ENUM_VALUES,
} as const

export default VALIDATION
