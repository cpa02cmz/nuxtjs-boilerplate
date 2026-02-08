/**
 * Server Constants
 * Flexy says: Import from modular configs instead of hardcoding!
 */

import {
  SEARCH_BEHAVIOR,
  CACHE_LIMITS,
  PAGINATION,
  TOAST_CONFIG,
  UI_TIMING,
  UI_LAYOUT,
  Z_INDEX,
  ANIMATION_DURATION,
  WEBHOOK_RETRY_CONFIG,
  RETRY_CONFIG,
  CIRCUIT_BREAKER_CONFIG,
} from '../../configs'

// Storage keys for localStorage/sessionStorage
export const STORAGE_KEYS = {
  SEARCH_HISTORY: 'resource_search_history',
  SAVED_SEARCHES: 'resource_saved_searches',
  BOOKMARKS: 'resource_bookmarks',
  USER_PROFILE: 'userProfile',
  PWA_INSTALL_DISMISSED: 'pwa-install-dismissed',
  WEB_VITALS_PREFIX: 'web-vitals-',
} as const

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

// Timing constants (in milliseconds) - now using modular config
export const TIMING = {
  // Webhook processing intervals
  WEBHOOK_QUEUE_PROCESSOR_INTERVAL: 5000,
  WEBHOOK_RETRY_DELAY_BASE: WEBHOOK_RETRY_CONFIG.baseDelayMs,
  WEBHOOK_RETRY_DELAY_MAX: WEBHOOK_RETRY_CONFIG.maxDelayMs,
  WEBHOOK_REQUEST_TIMEOUT: WEBHOOK_RETRY_CONFIG.timeoutMs,

  // Retry and backoff settings
  RETRY_BASE_DELAY_MS: RETRY_CONFIG.defaults.baseDelayMs,
  RETRY_MAX_DELAY_MS: RETRY_CONFIG.defaults.maxDelayMs,
  RETRY_MAX_ATTEMPTS: RETRY_CONFIG.defaults.maxAttempts,

  // Circuit breaker settings
  CIRCUIT_BREAKER_TIMEOUT_MS: CIRCUIT_BREAKER_CONFIG.defaults.timeoutMs,
  CIRCUIT_BREAKER_FAILURE_THRESHOLD:
    CIRCUIT_BREAKER_CONFIG.defaults.failureThreshold,
  CIRCUIT_BREAKER_SUCCESS_THRESHOLD:
    CIRCUIT_BREAKER_CONFIG.defaults.successThreshold,

  // Cache and debounce settings
  DEBOUNCE_DEFAULT_MS: UI_TIMING.searchDebounceMs,
  CACHE_TTL_MS: 300000, // 5 minutes

  // Rate limiting windows
  RATE_LIMIT_WINDOW_MS: 900000, // 15 minutes
  RATE_LIMIT_API_WINDOW_MS: 300000, // 5 minutes
  RATE_LIMIT_SEARCH_WINDOW_MS: 60000, // 1 minute
} as const

// Toast notification durations - using modular config
export const TOAST_DURATION = {
  SUCCESS: TOAST_CONFIG.duration.success,
  ERROR: TOAST_CONFIG.duration.error,
  WARNING: TOAST_CONFIG.duration.warning,
  INFO: TOAST_CONFIG.duration.info,
} as const

// UI feedback message duration (announcements, success messages)
export const UI_FEEDBACK_DURATION = {
  MESSAGE_DISPLAY: 3000,
  ANNOUNCEMENT_CLEAR: 3000,
  SUCCESS_MESSAGE_CLEAR: 3000,
} as const

// UI interaction timing constants - using modular config
export const UI_TIMING_CONSTANTS = {
  // Search and input debouncing
  SEARCH_DEBOUNCE_MS: UI_TIMING.searchDebounceMs,
  SEARCH_BLUR_DELAY_MS: UI_TIMING.searchBlurDelayMs,
  SUGGESTION_CHECK_INTERVAL_MS: 100,

  // Connection checking
  CONNECTION_TIMEOUT_MS: UI_TIMING.connectionTimeoutMs,
  CONNECTION_RETRY_INTERVAL_MS: UI_TIMING.connectionRetryIntervalMs,

  // Toast and notification intervals
  TOAST_CHECK_INTERVAL_MS: 100,

  // Animation durations
  ANIMATION_DURATION_MS: UI_TIMING.animationDurationMs,
  ANIMATION_LEAVE_DURATION_MS: UI_TIMING.animationLeaveDurationMs,
} as const

// Search configuration - using modular config
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: SEARCH_BEHAVIOR.minQueryLength,
  MAX_SUGGESTIONS: SEARCH_BEHAVIOR.maxSuggestions,
  MAX_HISTORY_ITEMS: SEARCH_BEHAVIOR.maxHistoryItems,
} as const

// RSS feed configuration
export const RSS_CONFIG = {
  MAX_ITEMS: 50,
  DEFAULT_LIMIT: 20,
} as const

// Pagination and data limits - using modular config
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: PAGINATION.DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE: PAGINATION.MAX_PAGE_SIZE,
  MAX_ITEMS_PER_REQUEST: 1000,
} as const

// Cache configuration - using modular config
export const CACHE_CONFIG = {
  MAX_CACHE_SIZE: CACHE_LIMITS.maxEntries,
  MAX_POPULAR_SEARCHES: CACHE_LIMITS.maxPopularSearches,
  MAX_ZERO_RESULT_SEARCHES: CACHE_LIMITS.maxZeroResultSearches,
  MAX_PERFORMANCE_HISTORY: CACHE_LIMITS.maxPerformanceHistory,
  MAX_ANALYTICS_ENTRIES: CACHE_LIMITS.maxAnalyticsEntries,
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

// UI layout constants (in pixels) - using modular config
export const UI_LAYOUT_CONSTANTS = {
  // Toast/notification positioning
  TOAST_CONTAINER_TOP: TOAST_CONFIG.position.top,
  TOAST_CONTAINER_RIGHT: TOAST_CONFIG.position.right,
  TOAST_MAX_WIDTH: TOAST_CONFIG.position.maxWidth,
  TOAST_MIN_WIDTH: TOAST_CONFIG.position.minWidth,

  // Spacing scale (in rem units, multiplied by 0.25)
  SPACING_XS: UI_LAYOUT.spacing.xs,
  SPACING_SM: UI_LAYOUT.spacing.sm,
  SPACING_MD: UI_LAYOUT.spacing.md,
  SPACING_LG: UI_LAYOUT.spacing.lg,
  SPACING_XL: UI_LAYOUT.spacing.xl,
  SPACING_2XL: UI_LAYOUT.spacing['2xl'],

  // Border radius (in rem)
  BORDER_RADIUS_SM: UI_LAYOUT.borderRadius.sm,
  BORDER_RADIUS_MD: UI_LAYOUT.borderRadius.md,
  BORDER_RADIUS_LG: UI_LAYOUT.borderRadius.lg,

  // Font sizes (in rem)
  FONT_SIZE_SM: UI_LAYOUT.fontSize.sm,
  FONT_SIZE_MD: UI_LAYOUT.fontSize.md,
  FONT_SIZE_LG: UI_LAYOUT.fontSize.lg,

  // Line heights (in rem)
  LINE_HEIGHT_SM: UI_LAYOUT.lineHeight.sm,
  LINE_HEIGHT_MD: UI_LAYOUT.lineHeight.md,
  LINE_HEIGHT_LG: UI_LAYOUT.lineHeight.lg,
} as const

// Animation duration constants (in seconds) - using modular config
export const ANIMATION_DURATION_CONSTANTS = {
  FAST: ANIMATION_DURATION.fast,
  NORMAL: ANIMATION_DURATION.normal,
  SLOW: ANIMATION_DURATION.slow,
} as const

// Z-index scale - using modular config
export const Z_INDEX_CONSTANTS = {
  TOAST: Z_INDEX.toast,
  MODAL: Z_INDEX.modal,
  DROPDOWN: Z_INDEX.dropdown,
  STICKY: Z_INDEX.sticky,
} as const

// Legacy exports for backward compatibility
export { UI_TIMING_CONSTANTS as UI_TIMING }
export { PAGINATION_CONFIG as PAGINATION }
export { UI_LAYOUT_CONSTANTS as UI_LAYOUT }
export { ANIMATION_DURATION_CONSTANTS as ANIMATION_DURATION }
export { Z_INDEX_CONSTANTS as Z_INDEX }
