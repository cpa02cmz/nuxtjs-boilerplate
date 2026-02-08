/**
 * Validation Configuration
 * Flexy says: Validation rules should be centralized!
 */

// URL Validation Configuration
export const URL_VALIDATION = {
  // Timeout for URL validation requests (ms)
  timeout: parseInt(process.env.URL_VALIDATION_TIMEOUT || '10000'),

  // Retry settings
  retries: parseInt(process.env.URL_VALIDATION_RETRIES || '3'),
  retryDelay: parseInt(process.env.URL_VALIDATION_RETRY_DELAY || '1000'),

  // Valid protocols
  allowedProtocols: ['http:', 'https:'] as const,

  // URL length limits
  minLength: parseInt(process.env.URL_MIN_LENGTH || '10'),
  maxLength: parseInt(process.env.URL_MAX_LENGTH || '2000'),

  // Blocked domains (can be set via env)
  blockedDomains: process.env.URL_BLOCKED_DOMAINS?.split(',') || [],
} as const

// Resource Validation Configuration
export const RESOURCE_VALIDATION = {
  // Name constraints
  name: {
    minLength: parseInt(process.env.RESOURCE_NAME_MIN || '2'),
    maxLength: parseInt(process.env.RESOURCE_NAME_MAX || '100'),
  },

  // Description constraints
  description: {
    minLength: parseInt(process.env.RESOURCE_DESC_MIN || '10'),
    maxLength: parseInt(process.env.RESOURCE_DESC_MAX || '2000'),
  },

  // Tag constraints
  tags: {
    maxCount: parseInt(process.env.RESOURCE_MAX_TAGS || '10'),
    minLength: parseInt(process.env.RESOURCE_TAG_MIN || '2'),
    maxLength: parseInt(process.env.RESOURCE_TAG_MAX || '30'),
  },

  // Technology constraints
  technologies: {
    maxCount: parseInt(process.env.RESOURCE_MAX_TECH || '10'),
    minLength: parseInt(process.env.RESOURCE_TECH_MIN || '1'),
    maxLength: parseInt(process.env.RESOURCE_TECH_MAX || '30'),
  },
} as const

// Skill Level Options
export const SKILL_LEVELS = {
  options: ['beginner', 'intermediate', 'advanced', 'expert'] as const,
  default: 'beginner' as const,
} as const

// Pricing Model Options
export const PRICING_MODELS = {
  options: ['free', 'freemium', 'paid', 'open-source'] as const,
  default: 'free' as const,
} as const

// Submission Validation
export const SUBMISSION_VALIDATION = {
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.SUBMISSION_RATE_LIMIT_WINDOW || '3600000'), // 1 hour
    maxSubmissions: parseInt(process.env.SUBMISSION_RATE_LIMIT_MAX || '5'),
  },

  // Auto-approval settings
  autoApproval: {
    enabled: process.env.SUBMISSION_AUTO_APPROVAL === 'true',
    trustedUsersOnly: process.env.SUBMISSION_TRUSTED_ONLY === 'true',
  },

  // Duplicate detection
  duplicate: {
    checkInterval: parseInt(process.env.DUPLICATE_CHECK_INTERVAL || '86400000'), // 24 hours
    similarityThreshold: parseFloat(process.env.DUPLICATE_THRESHOLD || '0.8'),
  },
} as const

// Sanitization Configuration
export const SANITIZATION_CONFIG = {
  // Allowed tags for HTML content
  allowedTags: process.env.SANITIZE_ALLOWED_TAGS?.split(',') || [
    'p',
    'br',
    'strong',
    'em',
    'u',
    'a',
  ],

  // Allowed attributes
  allowedAttributes: {
    a: ['href', 'title', 'target'],
  },

  // Forbidden tags
  forbiddenTags: process.env.SANITIZE_FORBIDDEN_TAGS?.split(',') || [
    'script',
    'style',
    'iframe',
    'object',
    'embed',
    'form',
    'input',
    'textarea',
  ],

  // Forbidden attributes
  forbiddenAttributes: process.env.SANITIZE_FORBIDDEN_ATTR?.split(',') || [
    'onerror',
    'onload',
    'onclick',
    'onmouseover',
  ],
} as const

// Export all validation configs
export default {
  url: URL_VALIDATION,
  resource: RESOURCE_VALIDATION,
  skillLevels: SKILL_LEVELS,
  pricingModels: PRICING_MODELS,
  submission: SUBMISSION_VALIDATION,
  sanitization: SANITIZATION_CONFIG,
}
