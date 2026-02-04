export const VALID_CATEGORIES = [
  'Development',
  'Design',
  'Productivity',
  'Marketing',
  'Analytics',
  'Security',
  'AI/ML',
  'DevOps',
  'Testing',
  'Education',
] as const

export type ValidCategory = (typeof VALID_CATEGORIES)[number]

export function isValidCategory(category: string): category is ValidCategory {
  return VALID_CATEGORIES.includes(category as ValidCategory)
}

export const VALID_EVENT_TYPES = [
  'resource_view',
  'search',
  'filter_change',
  'bookmark',
  'comparison',
  'submission',
] as const

export type ValidEventType = (typeof VALID_EVENT_TYPES)[number]

export function isValidEventType(type: string): type is ValidEventType {
  return VALID_EVENT_TYPES.includes(type as ValidEventType)
}

// Timing constants (in milliseconds)
export const TIMING = {
  // Webhook processing intervals
  WEBHOOK_QUEUE_PROCESSOR_INTERVAL: 5000,
  WEBHOOK_RETRY_DELAY_BASE: 1000,
  WEBHOOK_RETRY_DELAY_MAX: 30000,
  WEBHOOK_REQUEST_TIMEOUT: 10000,

  // Retry and backoff settings
  RETRY_BASE_DELAY_MS: 1000,
  RETRY_MAX_DELAY_MS: 30000,
  RETRY_MAX_ATTEMPTS: 3,

  // Circuit breaker settings
  CIRCUIT_BREAKER_TIMEOUT_MS: 60000,
  CIRCUIT_BREAKER_FAILURE_THRESHOLD: 5,
  CIRCUIT_BREAKER_SUCCESS_THRESHOLD: 2,

  // Cache and debounce settings
  DEBOUNCE_DEFAULT_MS: 300,
  CACHE_TTL_MS: 300000, // 5 minutes

  // Rate limiting windows
  RATE_LIMIT_WINDOW_MS: 900000, // 15 minutes
  RATE_LIMIT_API_WINDOW_MS: 300000, // 5 minutes
  RATE_LIMIT_SEARCH_WINDOW_MS: 60000, // 1 minute
} as const

// Toast notification durations
export const TOAST_DURATION = {
  SUCCESS: 5000,
  ERROR: 10000,
  WARNING: 7000,
  INFO: 5000,
} as const

// UI feedback message duration (announcements, success messages)
export const UI_FEEDBACK_DURATION = {
  MESSAGE_DISPLAY: 3000,
  ANNOUNCEMENT_CLEAR: 3000,
  SUCCESS_MESSAGE_CLEAR: 3000,
} as const
