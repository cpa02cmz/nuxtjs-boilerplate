/**
 * Validation Constants
 * Form validation limits, patterns, and enums
 * Flexy approves - consistent validation across the app!
 */

// Validation limits for form fields
export const VALIDATION_LIMITS = {
  // Text fields
  titleMinLength: 1,
  titleMaxLength: 200,
  descriptionMinLength: 10,
  descriptionMaxLength: 2000,

  // Arrays
  maxTags: 20,
  maxTechnologies: 20,
  maxBenefits: 10,

  // Search
  minQueryLength: 1,
  maxQueryLength: 500,

  // API
  maxResourceIds: 100,
  apiKeyNameMaxLength: 100,

  // IDs
  maxResourceIdLength: 25,
  maxCategoryLength: 100,
  maxUserAgentLength: 500,
  maxIpLength: 45,

  // Moderation
  reasonMinLength: 10,
  reasonMaxLength: 500,
  notesMaxLength: 1000,

  // Events
  maxEventTypeLength: 50,
} as const

// Validation error messages
export const VALIDATION_MESSAGES = {
  titleRequired: 'Title is required',
  titleTooLong: `Title is too long (max ${VALIDATION_LIMITS.titleMaxLength} characters)`,
  descriptionRequired: 'Description is required',
  descriptionTooShort: `Description must be at least ${VALIDATION_LIMITS.descriptionMinLength} characters`,
  descriptionTooLong: `Description is too long (max ${VALIDATION_LIMITS.descriptionMaxLength} characters)`,
  urlRequired: 'URL is required',
  urlInvalid: 'Please enter a valid URL',
  categoryRequired: 'Category is required',
  tooManyTags: `Too many tags (max ${VALIDATION_LIMITS.maxTags})`,
  tooManyTechnologies: `Too many technologies (max ${VALIDATION_LIMITS.maxTechnologies})`,
  tooManyBenefits: `Too many benefits (max ${VALIDATION_LIMITS.maxBenefits})`,
  queryRequired: 'Search query is required',
  queryTooLong: `Query too long (max ${VALIDATION_LIMITS.maxQueryLength} characters)`,
} as const

// Pricing models
export const PRICING_MODELS = [
  'Free',
  'Freemium',
  'Paid',
  'Open Source',
] as const
export type PricingModel = (typeof PRICING_MODELS)[number]

// Difficulty levels
export const DIFFICULTY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
] as const
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number]

// Skill levels (for user preferences)
export const SKILL_LEVELS = [
  'beginner',
  'intermediate',
  'advanced',
  'expert',
] as const
export type SkillLevel = (typeof SKILL_LEVELS)[number]

// Resource statuses
export const RESOURCE_STATUSES = ['active', 'archived', 'deprecated'] as const
export type ResourceStatus = (typeof RESOURCE_STATUSES)[number]

// Validation patterns (regex)
export const VALIDATION_PATTERNS = {
  // IPv4 address
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,

  // IPv6 address
  ipv6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^:(?::[0-9a-fA-F]{1,4}){1,7}|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,7}|(?:[0-9a-fA-F]{1,4}:){1,7}:|:(?::[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$/,

  // Resource ID (alphanumeric, hyphens, underscores)
  resourceId: /^[a-zA-Z0-9_-]+$/,
} as const
