// Validation Configuration - Field Validation and Constraint Settings
// Flexy hates hardcoded values! All validation settings are now configurable.

export const validationConfig = {
  // Validation Messages - Flexy hates hardcoded strings!
  messages: {
    required: {
      title: process.env.VALIDATION_MSG_TITLE_REQUIRED || 'Title is required',
      description:
        process.env.VALIDATION_MSG_DESC_REQUIRED || 'Description is required',
      url: process.env.VALIDATION_MSG_URL_REQUIRED || 'URL is required',
      category:
        process.env.VALIDATION_MSG_CATEGORY_REQUIRED || 'Category is required',
    },
    invalid: {
      url: process.env.VALIDATION_MSG_URL_INVALID || 'Please enter a valid URL',
    },
    tooLong: {
      title:
        process.env.VALIDATION_MSG_TITLE_TOO_LONG ||
        'Title is too long (max {{max}} characters)',
      description:
        process.env.VALIDATION_MSG_DESC_TOO_LONG ||
        'Description is too long (max {{max}} characters)',
    },
    tooShort: {
      description:
        process.env.VALIDATION_MSG_DESC_TOO_SHORT ||
        'Description must be at least {{min}} characters',
    },
  },

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
      minLength: parseInt(process.env.SEARCH_QUERY_MIN_LENGTH || '1'),
      maxLength: parseInt(process.env.SEARCH_QUERY_MAX_LENGTH || '500'),
    },
    limit: {
      min: parseInt(process.env.SEARCH_LIMIT_MIN || '1'),
      max: parseInt(process.env.SEARCH_LIMIT_MAX || '100'),
      default: parseInt(process.env.SEARCH_LIMIT_DEFAULT || '20'),
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

  // API Key Validation
  apiKey: {
    name: {
      minLength: parseInt(process.env.API_KEY_NAME_MIN_LENGTH || '1'),
      maxLength: parseInt(process.env.API_KEY_NAME_MAX_LENGTH || '100'),
    },
  },

  // Bulk Operations
  bulk: {
    maxResourceIds: parseInt(process.env.BULK_MAX_RESOURCE_IDS || '100'),
  },

  // Moderation Validation
  moderation: {
    reason: {
      minLength: parseInt(process.env.MODERATION_REASON_MIN_LENGTH || '10'),
      maxLength: parseInt(process.env.MODERATION_REASON_MAX_LENGTH || '500'),
    },
    notes: {
      maxLength: parseInt(process.env.MODERATION_NOTES_MAX_LENGTH || '1000'),
    },
  },

  // URL Validation
  urlValidation: {
    timeout: parseInt(process.env.URL_VALIDATION_TIMEOUT || '10000'),
    retries: {
      min: parseInt(process.env.URL_VALIDATION_RETRIES_MIN || '0'),
      max: parseInt(process.env.URL_VALIDATION_RETRIES_MAX || '10'),
      default: parseInt(process.env.URL_VALIDATION_RETRIES_DEFAULT || '3'),
    },
    retryDelay: parseInt(process.env.URL_VALIDATION_RETRY_DELAY || '1000'),
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
