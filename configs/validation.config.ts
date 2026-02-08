// Validation Configuration - Field Validation and Constraint Settings
// Flexy hates hardcoded values! All validation settings are now configurable.

export const validationConfig = {
  // URL Validation
  url: {
    timeout: parseInt(process.env.VALIDATION_URL_TIMEOUT || '10000'),
    maxRetries: parseInt(process.env.VALIDATION_URL_MAX_RETRIES || '10'),
    allowedProtocols: parseProtocols(
      process.env.VALIDATION_ALLOWED_PROTOCOLS || 'https:, http:'
    ),
  },

  // Resource Field Limits
  resource: {
    name: {
      minLength: parseInt(process.env.RESOURCE_NAME_MIN_LENGTH || '2'),
      maxLength: parseInt(process.env.RESOURCE_NAME_MAX_LENGTH || '200'),
    },
    description: {
      minLength: parseInt(process.env.RESOURCE_DESCRIPTION_MIN_LENGTH || '10'),
      maxLength: parseInt(
        process.env.RESOURCE_DESCRIPTION_MAX_LENGTH || '2000'
      ),
    },
    url: {
      maxLength: parseInt(process.env.RESOURCE_URL_MAX_LENGTH || '2000'),
    },
    tags: {
      maxCount: parseInt(process.env.RESOURCE_TAGS_MAX_COUNT || '20'),
      maxLength: parseInt(process.env.RESOURCE_TAG_MAX_LENGTH || '50'),
    },
    features: {
      maxCount: parseInt(process.env.RESOURCE_FEATURES_MAX_COUNT || '10'),
      maxLength: parseInt(process.env.RESOURCE_FEATURE_MAX_LENGTH || '200'),
    },
  },

  // Webhook Validation
  webhook: {
    url: {
      maxLength: parseInt(process.env.WEBHOOK_URL_MAX_LENGTH || '2000'),
    },
    secret: {
      minLength: parseInt(process.env.WEBHOOK_SECRET_MIN_LENGTH || '32'),
      maxLength: parseInt(process.env.WEBHOOK_SECRET_MAX_LENGTH || '128'),
    },
    events: {
      maxCount: parseInt(process.env.WEBHOOK_EVENTS_MAX_COUNT || '50'),
    },
  },

  // Search Validation
  search: {
    query: {
      minLength: parseInt(process.env.SEARCH_QUERY_MIN_LENGTH || '2'),
      maxLength: parseInt(process.env.SEARCH_QUERY_MAX_LENGTH || '100'),
    },
  },

  // Analytics Validation
  analytics: {
    rating: {
      min: parseInt(process.env.ANALYTICS_RATING_MIN || '1'),
      max: parseInt(process.env.ANALYTICS_RATING_MAX || '5'),
    },
  },

  // Quality Check Settings
  quality: {
    descriptionMinLength: parseInt(
      process.env.QUALITY_DESCRIPTION_MIN_LENGTH || '20'
    ),
    spamKeywords: parseSpamKeywords(
      process.env.QUALITY_SPAM_KEYWORDS ||
        'spam, fake, scam, click here, buy now, free money, get rich, make money, casino, gambling'
    ),
    penalties: {
      fail: parseInt(process.env.QUALITY_PENALTY_FAIL || '25'),
      warn: parseInt(process.env.QUALITY_PENALTY_WARN || '10'),
      pending: parseInt(process.env.QUALITY_PENALTY_PENDING || '5'),
    },
  },
} as const

// Helper function to parse spam keywords
function parseSpamKeywords(value: string): string[] {
  return value.split(',').map(s => s.trim().toLowerCase())
}

// Helper function to parse protocols
function parseProtocols(value: string): string[] {
  return value.split(',').map(s => s.trim())
}

export type ValidationConfig = typeof validationConfig
