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

// UI interaction timing constants
export const UI_TIMING = {
  // Search and input debouncing
  SEARCH_DEBOUNCE_MS: 300,
  SEARCH_BLUR_DELAY_MS: 200,
  SUGGESTION_CHECK_INTERVAL_MS: 100,

  // Connection checking
  CONNECTION_TIMEOUT_MS: 5000,
  CONNECTION_RETRY_INTERVAL_MS: 100,

  // Toast and notification intervals
  TOAST_CHECK_INTERVAL_MS: 100,

  // Animation durations
  ANIMATION_DURATION_MS: 300,
  ANIMATION_LEAVE_DURATION_MS: 200,
} as const

// Search configuration
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_SUGGESTIONS: 5,
  MAX_HISTORY_ITEMS: 10,
} as const

// RSS feed configuration
export const RSS_CONFIG = {
  MAX_ITEMS: 50,
  DEFAULT_LIMIT: 20,
} as const

// Pagination and data limits
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MAX_ITEMS_PER_REQUEST: 1000,
} as const

// Cache configuration
export const CACHE_CONFIG = {
  MAX_CACHE_SIZE: 100,
  MAX_POPULAR_SEARCHES: 50,
  MAX_ZERO_RESULT_SEARCHES: 50,
  MAX_PERFORMANCE_HISTORY: 100,
  MAX_ANALYTICS_ENTRIES: 100,
} as const

// HTTP status code ranges
export const HTTP_STATUS = {
  OK_MIN: 200,
  OK_MAX: 399,
  REDIRECT_MIN: 300,
  REDIRECT_MAX: 399,
  CLIENT_ERROR_MIN: 400,
  CLIENT_ERROR_MAX: 499,
  SERVER_ERROR_MIN: 500,
} as const

// UI layout constants (in pixels)
export const UI_LAYOUT = {
  // Toast/notification positioning
  TOAST_CONTAINER_TOP: 20,
  TOAST_CONTAINER_RIGHT: 20,
  TOAST_MAX_WIDTH: 400,
  TOAST_MIN_WIDTH: 300,

  // Spacing scale (in rem units, multiplied by 0.25)
  SPACING_XS: 0.25, // 0.25rem = 4px
  SPACING_SM: 0.5, // 0.5rem = 8px
  SPACING_MD: 0.75, // 0.75rem = 12px
  SPACING_LG: 1, // 1rem = 16px
  SPACING_XL: 1.5, // 1.5rem = 24px
  SPACING_2XL: 2, // 2rem = 32px

  // Border radius (in rem)
  BORDER_RADIUS_SM: 0.25,
  BORDER_RADIUS_MD: 0.5,
  BORDER_RADIUS_LG: 0.75,

  // Font sizes (in rem)
  FONT_SIZE_SM: 0.75,
  FONT_SIZE_MD: 0.875,
  FONT_SIZE_LG: 1,

  // Line heights (in rem)
  LINE_HEIGHT_SM: 1,
  LINE_HEIGHT_MD: 1.25,
  LINE_HEIGHT_LG: 1.5,
} as const

// Animation duration constants (in seconds)
export const ANIMATION_DURATION = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
} as const

// Z-index scale
export const Z_INDEX = {
  TOAST: 9999,
  MODAL: 9000,
  DROPDOWN: 1000,
  STICKY: 100,
} as const
