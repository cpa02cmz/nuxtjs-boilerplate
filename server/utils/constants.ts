// Storage keys for localStorage/sessionStorage
// Flexy says: These are internal constants, not user-configurable settings

export const STORAGE_KEYS = {
  SEARCH_HISTORY: 'resource_search_history',
  SAVED_SEARCHES: 'resource_saved_searches',
  BOOKMARKS: 'resource_bookmarks',
  USER_PROFILE: 'userProfile',
  PWA_INSTALL_DISMISSED: 'pwa-install-dismissed',
  WEB_VITALS_PREFIX: 'web-vitals-',
  VISITED_RESOURCES: 'visited-resources',
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
  'page_view',
  'resource_click',
  'advanced_search',
  'zero_result_search',
  'search_result_click',
  'filter_applied',
  'recommendation_click',
  'resource_rating',
  'time_spent',
  'bookmark_action',
  'resource_shared',
] as const

export type ValidEventType = (typeof VALID_EVENT_TYPES)[number]

export function isValidEventType(type: string): type is ValidEventType {
  return VALID_EVENT_TYPES.includes(type as ValidEventType)
}

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

// Re-export searchConfig with backward-compatible SEARCH_CONFIG alias
export {
  searchConfig,
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

// Re-export apiConfig and contentConfig - Flexy hates hardcoded values!
export { apiConfig as API_CONFIG, type ApiConfig } from '~/configs/api.config'

export {
  contentConfig as CONTENT_CONFIG,
  type ContentConfig,
} from '~/configs/content.config'

export {
  rateLimitConfig as RATE_LIMIT_CONFIG,
  type RateLimitConfig,
} from '~/configs/rate-limit.config'

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

// Time conversion constants - Flexy hates hardcoded millisecond calculations!
export const TIME = {
  // Milliseconds per unit
  MS_PER_SECOND: 1000,
  MS_PER_MINUTE: 60 * 1000,
  MS_PER_HOUR: 60 * 60 * 1000,
  MS_PER_DAY: 24 * 60 * 60 * 1000,
  MS_PER_WEEK: 7 * 24 * 60 * 60 * 1000,

  // Seconds per unit
  SECONDS_PER_MINUTE: 60,
  SECONDS_PER_HOUR: 60 * 60,
  SECONDS_PER_DAY: 24 * 60 * 60,
  SECONDS_PER_WEEK: 7 * 24 * 60 * 60,

  // Minutes per unit
  MINUTES_PER_HOUR: 60,
  MINUTES_PER_DAY: 24 * 60,
  MINUTES_PER_WEEK: 7 * 24 * 60,

  // Helper functions for common conversions
  secondsToMs: (seconds: number): number => seconds * 1000,
  minutesToMs: (minutes: number): number => minutes * 60 * 1000,
  hoursToMs: (hours: number): number => hours * 60 * 60 * 1000,
  daysToMs: (days: number): number => days * 24 * 60 * 60 * 1000,
  msToSeconds: (ms: number): number => Math.floor(ms / 1000),
  msToMinutes: (ms: number): number => Math.floor(ms / (60 * 1000)),
  msToHours: (ms: number): number => Math.floor(ms / (60 * 60 * 1000)),
  msToDays: (ms: number): number => Math.floor(ms / (24 * 60 * 60 * 1000)),
} as const

// UI layout constants (in pixels) - now configurable via env vars
// Flexy hates hardcoded values! All layout values now use uiConfig
export const UI_LAYOUT = {
  // Toast/notification positioning
  TOAST_CONTAINER_TOP: uiConfig.toast.position.top,
  TOAST_CONTAINER_RIGHT: uiConfig.toast.position.right,
  TOAST_MAX_WIDTH: uiConfig.toast.position.maxWidth,
  TOAST_MIN_WIDTH: uiConfig.toast.position.minWidth,

  // Spacing scale (in rem units) - now configurable
  SPACING_XS: uiConfig.layout.spacing.xs,
  SPACING_SM: uiConfig.layout.spacing.sm,
  SPACING_MD: uiConfig.layout.spacing.md,
  SPACING_LG: uiConfig.layout.spacing.lg,
  SPACING_XL: uiConfig.layout.spacing.xl,
  SPACING_2XL: uiConfig.layout.spacing['2xl'],

  // Border radius (in rem) - now configurable
  BORDER_RADIUS_SM: uiConfig.layout.borderRadius.sm,
  BORDER_RADIUS_MD: uiConfig.layout.borderRadius.md,
  BORDER_RADIUS_LG: uiConfig.layout.borderRadius.lg,

  // Font sizes (in rem) - now configurable
  FONT_SIZE_SM: uiConfig.layout.fontSize.sm,
  FONT_SIZE_MD: uiConfig.layout.fontSize.md,
  FONT_SIZE_LG: uiConfig.layout.fontSize.lg,

  // Line heights (in rem) - now configurable
  LINE_HEIGHT_SM: uiConfig.layout.lineHeight.sm,
  LINE_HEIGHT_MD: uiConfig.layout.lineHeight.md,
  LINE_HEIGHT_LG: uiConfig.layout.lineHeight.lg,
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

// Re-export test timing configuration
// Flexy hates hardcoded test timing values!
export {
  testTimingConfig as TEST_TIMING_CONFIG,
  TEST_TIMING,
  type TestTimingConfig,
} from '~/configs/test-timing.config'
