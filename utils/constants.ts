// Storage keys for localStorage/sessionStorage
// Flexy says: These are internal constants, not user-configurable settings

export const STORAGE_KEYS = {
  SEARCH_HISTORY: 'resource_search_history',
  SAVED_SEARCHES: 'resource_saved_searches',
  BOOKMARKS: 'resource_bookmarks',
  USER_PROFILE: 'userProfile',
  PWA_INSTALL_DISMISSED: 'pwa-install-dismissed',
  WEB_VITALS_PREFIX: 'web-vitals-',
} as const

// Re-export configurable constants from modular config system
// Flexy loves modularity!
export {
  webhooksConfig as WEBHOOKS_CONFIG,
  type WebhooksConfig,
} from '~/configs/webhooks.config'

export {
  paginationConfig as PAGINATION_CONFIG,
  type PaginationConfig,
} from '~/configs/pagination.config'

export {
  analyticsConfig as ANALYTICS_CONFIG,
  type AnalyticsConfig,
} from '~/configs/analytics.config'

export { uiConfig as UI_CONFIG, type UiConfig } from '~/configs/ui.config'

export {
  searchConfig as SEARCH_CONFIG,
  type SearchConfig,
} from '~/configs/search.config'

export {
  limitsConfig as LIMITS_CONFIG,
  type LimitsConfig,
} from '~/configs/limits.config'

export {
  comparisonConfig as COMPARISON_CONFIG,
  type ComparisonConfig,
} from '~/configs/comparison.config'

// Backward-compatible re-exports using config values
// These maintain the old constant names but use configurable values
import { webhooksConfig } from '~/configs/webhooks.config'
import { uiConfig } from '~/configs/ui.config'
import { cacheConfig } from '~/configs/cache.config'
import { searchConfig } from '~/configs/search.config'
import { paginationConfig } from '~/configs/pagination.config'

// Timing constants (in milliseconds) - now configurable via env vars
export const TIMING = {
  // Webhook processing intervals
  WEBHOOK_QUEUE_PROCESSOR_INTERVAL: webhooksConfig.queue.processorIntervalMs,
  WEBHOOK_RETRY_DELAY_BASE: webhooksConfig.retry.baseDelayMs,
  WEBHOOK_RETRY_DELAY_MAX: webhooksConfig.retry.maxDelayMs,
  WEBHOOK_REQUEST_TIMEOUT: webhooksConfig.request.timeoutMs,

  // Retry and backoff settings
  RETRY_BASE_DELAY_MS: webhooksConfig.retry.baseDelayMs,
  RETRY_MAX_DELAY_MS: webhooksConfig.retry.maxDelayMs,
  RETRY_MAX_ATTEMPTS: webhooksConfig.retry.maxAttempts,

  // Circuit breaker settings
  CIRCUIT_BREAKER_TIMEOUT_MS: webhooksConfig.circuitBreaker.timeoutMs,
  CIRCUIT_BREAKER_FAILURE_THRESHOLD:
    webhooksConfig.circuitBreaker.failureThreshold,
  CIRCUIT_BREAKER_SUCCESS_THRESHOLD:
    webhooksConfig.circuitBreaker.successThreshold,

  // Cache and debounce settings
  DEBOUNCE_DEFAULT_MS: uiConfig.toast.animation.durationMs,
  CACHE_TTL_MS: cacheConfig.server.defaultTtlMs,

  // Rate limiting windows
  RATE_LIMIT_WINDOW_MS: cacheConfig.rateLimit.windowMs,
  RATE_LIMIT_API_WINDOW_MS: cacheConfig.rateLimit.apiWindowMs,
  RATE_LIMIT_SEARCH_WINDOW_MS: cacheConfig.rateLimit.searchWindowMs,
} as const

// Toast notification durations - now configurable via env vars
export const TOAST_DURATION = {
  SUCCESS: uiConfig.toast.duration.success,
  ERROR: uiConfig.toast.duration.error,
  WARNING: uiConfig.toast.duration.warning,
  INFO: uiConfig.toast.duration.info,
} as const

// UI feedback message duration - now configurable via env vars
export const UI_FEEDBACK_DURATION = {
  MESSAGE_DISPLAY: uiConfig.feedback.displayDurationMs,
  ANNOUNCEMENT_CLEAR: uiConfig.feedback.announcementClearMs,
  SUCCESS_MESSAGE_CLEAR: uiConfig.feedback.successMessageClearMs,
} as const

// UI interaction timing constants - now configurable via env vars
export const UI_TIMING = {
  // Search and input debouncing
  SEARCH_DEBOUNCE_MS: searchConfig.behavior.debounceMs,
  SEARCH_BLUR_DELAY_MS: searchConfig.behavior.blurDelayMs,
  SUGGESTION_CHECK_INTERVAL_MS: uiConfig.toast.animation.checkIntervalMs,

  // Connection checking
  CONNECTION_TIMEOUT_MS: webhooksConfig.request.timeoutMs,
  CONNECTION_RETRY_INTERVAL_MS: 100,

  // Toast and notification intervals
  TOAST_CHECK_INTERVAL_MS: uiConfig.toast.animation.checkIntervalMs,

  // Animation durations
  ANIMATION_DURATION_MS: uiConfig.toast.animation.durationMs,
  ANIMATION_LEAVE_DURATION_MS: uiConfig.animation.leaveDurationMs,
} as const

// RSS feed configuration - now configurable via env vars
export const RSS_CONFIG = {
  MAX_ITEMS: cacheConfig.rss.maxItems,
  DEFAULT_LIMIT: cacheConfig.rss.defaultLimit,
} as const

// Pagination and data limits - now configurable via env vars
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: paginationConfig.defaults.pageSize,
  MAX_PAGE_SIZE: paginationConfig.limits.maxPageSize,
  MAX_ITEMS_PER_REQUEST: paginationConfig.limits.maxItemsPerRequest,
} as const

// Cache configuration - now configurable via env vars
export const CACHE_CONFIG = {
  MAX_CACHE_SIZE: cacheConfig.server.maxCacheSize,
  MAX_POPULAR_SEARCHES: cacheConfig.server.maxPopularSearches,
  MAX_ZERO_RESULT_SEARCHES: cacheConfig.server.maxZeroResultSearches,
  MAX_PERFORMANCE_HISTORY: cacheConfig.server.maxPerformanceHistory,
  MAX_ANALYTICS_ENTRIES: cacheConfig.server.maxAnalyticsEntries,
} as const

// HTTP status code ranges - internal constants
export const HTTP_STATUS = {
  OK_MIN: 200,
  OK_MAX: 399,
  REDIRECT_MIN: 300,
  REDIRECT_MAX: 399,
  CLIENT_ERROR_MIN: 400,
  CLIENT_ERROR_MAX: 499,
  SERVER_ERROR_MIN: 500,
} as const

// UI layout constants (in pixels) - now configurable via env vars
export const UI_LAYOUT = {
  // Toast/notification positioning
  TOAST_CONTAINER_TOP: uiConfig.toast.position.top,
  TOAST_CONTAINER_RIGHT: uiConfig.toast.position.right,
  TOAST_MAX_WIDTH: uiConfig.toast.position.maxWidth,
  TOAST_MIN_WIDTH: uiConfig.toast.position.minWidth,

  // Spacing scale (in rem units, multiplied by 0.25)
  SPACING_XS: 0.25,
  SPACING_SM: 0.5,
  SPACING_MD: 0.75,
  SPACING_LG: 1,
  SPACING_XL: 1.5,
  SPACING_2XL: 2,

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

// Animation duration constants (in seconds) - now configurable via env vars
export const ANIMATION_DURATION = {
  FAST: uiConfig.animation.fast,
  NORMAL: uiConfig.animation.normal,
  SLOW: uiConfig.animation.slow,
} as const

// Z-index scale - now configurable via env vars
export const Z_INDEX = {
  TOAST: uiConfig.zIndex.toast,
  MODAL: uiConfig.zIndex.modal,
  DROPDOWN: uiConfig.zIndex.dropdown,
  STICKY: uiConfig.zIndex.sticky,
} as const
