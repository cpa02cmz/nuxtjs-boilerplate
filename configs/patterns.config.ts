// Patterns Configuration - Regex patterns and string constants
// Flexy hates hardcoded values! All patterns are now centralized and configurable.

export const patternsConfig = {
  // API Key Patterns
  apiKey: {
    // Prefixes that indicate an API key
    prefixes: parsePrefixes(
      process.env.API_KEY_PREFIXES || 'ak_, sk_, pk_, api_'
    ),
    // Regex pattern for matching API keys in strings
    pattern: new RegExp(
      process.env.API_KEY_PATTERN || '\\b(ak_|sk_|pk_|api_)[a-zA-Z0-9]{20,}\\b',
      'g'
    ),
    // Field names that might contain API keys
    fieldPattern: new RegExp(
      process.env.API_KEY_FIELD_PATTERN ||
        'api[_-]?key|key|token|secret|password',
      'i'
    ),
    // Masking display
    mask: {
      placeholder: process.env.API_KEY_MASK_PLACEHOLDER || '***',
      visiblePrefixLength: parseInt(
        process.env.API_KEY_MASK_PREFIX_LENGTH || '8'
      ),
      visibleSuffixLength: parseInt(
        process.env.API_KEY_MASK_SUFFIX_LENGTH || '4'
      ),
    },
  },

  // Webhook Patterns
  webhook: {
    // Signature version prefix
    signaturePrefix: process.env.WEBHOOK_SIGNATURE_PREFIX || 'v1=',
    // Hash algorithm for signatures
    signatureAlgorithm: process.env.WEBHOOK_SIGNATURE_ALGORITHM || 'sha256',
  },

  // CSRF Token Patterns
  csrf: {
    // Cookie name for CSRF token
    cookieName: process.env.CSRF_COOKIE_NAME || 'csrf_token',
    // Regex pattern for extracting CSRF token from cookies
    cookiePattern: new RegExp(
      process.env.CSRF_COOKIE_PATTERN || '(^| )csrf_token=([^;]+)',
      'g'
    ),
  },

  // Search Patterns
  search: {
    // Regex for search operators (AND, OR, NOT)
    operatorPattern: new RegExp(
      process.env.SEARCH_OPERATOR_PATTERN || '\\b(?:AND|OR|NOT)\\b',
      'i'
    ),
    // Regex for splitting by operators
    operatorSplitPattern: new RegExp(
      process.env.SEARCH_OPERATOR_SPLIT_PATTERN || '\\b(AND|OR|NOT)\\b',
      'gi'
    ),
    // Regex for removing quotes
    quotePattern: new RegExp(process.env.SEARCH_QUOTE_PATTERN || '^"|"$', 'g'),
    // Highlight CSS classes
    highlightClasses:
      process.env.SEARCH_HIGHLIGHT_CLASSES ||
      'bg-yellow-200 text-gray-900 px-1 rounded',
    // Min match length for suggestions
    minMatchLength: parseInt(process.env.SEARCH_MIN_MATCH_LENGTH || '1'),
  },

  // Retry Patterns
  retry: {
    // Pattern for identifying retryable client errors
    retryableErrorPattern: new RegExp(
      process.env.RETRYABLE_ERROR_PATTERN || 'Client error (408|429|409):'
    ),
    // Backoff multiplier for exponential backoff
    backoffMultiplier: parseInt(process.env.RETRY_BACKOFF_MULTIPLIER || '2'),
    // Display offset for retry count (e.g., showing "attempt 1 of 3" instead of "attempt 0 of 3")
    displayOffset: parseInt(process.env.RETRY_DISPLAY_OFFSET || '1'),
  },

  // Storage Keys Pattern (prefix for consistency)
  storage: {
    prefix: process.env.STORAGE_KEY_PREFIX || 'fs_',
    separator: process.env.STORAGE_KEY_SEPARATOR || '_',
  },

  // Date Serialization
  dateSerialization: {
    // Key used to identify serialized dates
    key: process.env.DATE_SERIALIZATION_KEY || '__date__',
  },

  // Media Query Patterns
  mediaQueries: {
    // Dark mode preference
    prefersDark:
      process.env.MEDIA_QUERY_PREFERS_DARK || '(prefers-color-scheme: dark)',
    // Reduced motion preference
    prefersReducedMotion:
      process.env.MEDIA_QUERY_REDUCED_MOTION ||
      '(prefers-reduced-motion: reduce)',
  },

  // Storage Keys
  storageKeys: {
    // Theme preference storage key
    themePreference: process.env.STORAGE_KEY_THEME || 'theme-preference',
  },

  // File Export Patterns
  export: {
    // Date format for export filenames (ISO date part)
    dateFormat: process.env.EXPORT_DATE_FORMAT || 'YYYY-MM-DD',
    // Bookmarks export filename template
    bookmarksFilenameTemplate:
      process.env.EXPORT_BOOKMARKS_TEMPLATE || 'bookmarks-{date}.json',
  },

  // Memoization/Caching
  memoization: {
    // Length of random string for object cache keys
    cacheKeyLength: parseInt(process.env.MEMO_CACHE_KEY_LENGTH || '9'),
    // Prefix for object cache keys
    objectKeyPrefix: process.env.MEMO_OBJECT_PREFIX || 'obj:',
    // Prefix for function cache keys
    functionKeyPrefix: process.env.MEMO_FUNCTION_PREFIX || 'func',
    // Key for null values
    nullKey: process.env.MEMO_NULL_KEY || 'null',
  },

  // Clipboard Operations
  clipboard: {
    // Off-screen positioning for textarea (px)
    textareaOffset: process.env.CLIPBOARD_TEXTAREA_OFFSET || '-9999px',
    // Max selection range for execCommand
    selectionRangeMax: parseInt(
      process.env.CLIPBOARD_SELECTION_RANGE || '99999'
    ),
  },

  // Error Patterns
  errors: {
    // Network error code
    networkErrorCode: process.env.ERROR_NETWORK_CODE || 'NETWORK_ERROR',
    // Network error category
    networkErrorCategory: process.env.ERROR_NETWORK_CATEGORY || 'network',
    // Generic error message
    genericErrorMessage:
      process.env.ERROR_GENERIC_MESSAGE || 'An unexpected error occurred',
  },
} as const

// Helper function to parse API key prefixes
function parsePrefixes(value: string): string[] {
  return value.split(',').map(s => s.trim())
}

export type PatternsConfig = typeof patternsConfig
