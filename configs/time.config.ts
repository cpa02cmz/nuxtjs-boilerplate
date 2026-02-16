// Time Configuration - Time conversion constants and utilities
// Flexy hates hardcoded values! All time calculations use these constants.

// Base time units in milliseconds
export const TIME_MS = {
  // Base units
  MILLISECOND: 1,
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000, // Approximate
  YEAR: 365 * 24 * 60 * 60 * 1000, // Approximate

  // Common durations
  FIVE_MINUTES: 5 * 60 * 1000,
  FIFTEEN_MINUTES: 15 * 60 * 1000,
  THIRTY_MINUTES: 30 * 60 * 1000,
  FORTY_FIVE_MINUTES: 45 * 60 * 1000,

  // Hour-based
  SIX_HOURS: 6 * 60 * 60 * 1000,
  TWELVE_HOURS: 12 * 60 * 60 * 1000,
  TWENTY_FOUR_HOURS: 24 * 60 * 60 * 1000,

  // Day-based
  THREE_DAYS: 3 * 24 * 60 * 60 * 1000,
  SEVEN_DAYS: 7 * 24 * 60 * 60 * 1000,
  THIRTY_DAYS: 30 * 24 * 60 * 60 * 1000,
  NINETY_DAYS: 90 * 24 * 60 * 60 * 1000,
} as const

// Time units in seconds (for cookies, JWT, etc.)
export const TIME_SECONDS = {
  SECOND: 1,
  MINUTE: 60,
  HOUR: 60 * 60,
  DAY: 24 * 60 * 60,
  WEEK: 7 * 24 * 60 * 60,
  MONTH: 30 * 24 * 60 * 60,
  YEAR: 365 * 24 * 60 * 60,
} as const

// Time configuration for various features
export const timeConfig = {
  // Cache TTL values (in seconds for HTTP headers)
  cache: {
    short: TIME_MS.MINUTE * 5,
    medium: TIME_MS.HOUR,
    long: TIME_MS.DAY,
    veryLong: TIME_MS.WEEK,
    // HTTP Cache-Control max-age values (seconds)
    maxAge: {
      api: parseInt(process.env.CACHE_MAX_AGE_API || '300'), // 5 minutes
      static: parseInt(process.env.CACHE_MAX_AGE_STATIC || '31536000'), // 1 year
      page: parseInt(process.env.CACHE_MAX_AGE_PAGE || '3600'), // 1 hour
    },
  },

  // Rate limiting windows
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || `${TIME_MS.MINUTE}`),
    apiWindowMs: parseInt(
      process.env.RATE_LIMIT_API_WINDOW_MS || `${TIME_MS.MINUTE * 5}`
    ),
    searchWindowMs: parseInt(
      process.env.RATE_LIMIT_SEARCH_WINDOW_MS || `${TIME_MS.MINUTE}`
    ),
  },

  // Session and cookie durations
  session: {
    short: TIME_SECONDS.HOUR,
    medium: TIME_SECONDS.DAY,
    long: TIME_SECONDS.WEEK,
    persistent: TIME_SECONDS.MONTH * 3,
  },

  // Token expiration
  tokens: {
    csrfMaxAge: parseInt(
      process.env.CSRF_TOKEN_MAX_AGE_SECONDS || `${TIME_SECONDS.DAY}`
    ),
    jwtAccess: parseInt(
      process.env.JWT_ACCESS_TOKEN_EXPIRY || `${TIME_SECONDS.HOUR}`
    ),
    jwtRefresh: parseInt(
      process.env.JWT_REFRESH_TOKEN_EXPIRY || `${TIME_SECONDS.DAY * 7}`
    ),
  },

  // Retry delays
  retry: {
    baseDelayMs: parseInt(
      process.env.RETRY_BASE_DELAY_MS || `${TIME_MS.SECOND}`
    ),
    maxDelayMs: parseInt(
      process.env.RETRY_MAX_DELAY_MS || `${TIME_MS.MINUTE * 5}`
    ),
    exponentialBase: parseInt(process.env.RETRY_EXPONENTIAL_BASE || '2'),
    // Initial error tracking delay (ms) - Flexy hates hardcoded 0!
    initialErrorDelayMs: parseInt(
      process.env.RETRY_INITIAL_ERROR_DELAY_MS || '0'
    ),
  },

  // Polling intervals
  polling: {
    fast: TIME_MS.SECOND * 2,
    normal: TIME_MS.SECOND * 5,
    slow: TIME_MS.SECOND * 10,
  },

  // Debounce delays
  debounce: {
    search: parseInt(process.env.DEBOUNCE_SEARCH_MS || '300'),
    input: parseInt(process.env.DEBOUNCE_INPUT_MS || '150'),
    resize: parseInt(process.env.DEBOUNCE_RESIZE_MS || '200'),
    scroll: parseInt(process.env.DEBOUNCE_SCROLL_MS || '100'),
    draft: parseInt(process.env.DEBOUNCE_DRAFT_MS || '2000'),
  },

  // Validation and cleanup intervals
  validation: {
    // Resource validation interval (default: 1 hour)
    resourceIntervalMs: parseInt(
      process.env.RESOURCE_VALIDATION_INTERVAL_MS || `${TIME_MS.HOUR}`
    ),
    // Startup delay for initial validation (default: 5 seconds)
    startupDelayMs: parseInt(
      process.env.RESOURCE_VALIDATION_STARTUP_DELAY_MS || '5000'
    ),
  },

  cleanup: {
    // Rate limit cleanup interval (default: 5 minutes)
    rateLimitIntervalMs: parseInt(
      process.env.RATE_LIMIT_CLEANUP_INTERVAL_MS || `${TIME_MS.FIVE_MINUTES}`
    ),
    // Analytics cleanup interval (default: 24 hours)
    analyticsIntervalMs: parseInt(
      process.env.ANALYTICS_CLEANUP_INTERVAL_MS ||
        `${TIME_MS.TWENTY_FOUR_HOURS}`
    ),
    // Cache cleanup interval (default: 5 minutes)
    cacheIntervalMs: parseInt(
      process.env.CACHE_CLEANUP_INTERVAL_MS || `${TIME_MS.FIVE_MINUTES}`
    ),
  },

  // Animation durations
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },

  // TimeAgo update intervals - Flexy hates hardcoded values!
  // Controls how often relative timestamps refresh based on their age
  timeAgo: {
    // Update interval for "just now" timestamps (default: 5 seconds)
    justNowIntervalMs: parseInt(
      process.env.TIME_AGO_JUST_NOW_INTERVAL_MS || '5000'
    ),
    // Update interval for minute-level timestamps (default: 15 seconds)
    minuteIntervalMs: parseInt(
      process.env.TIME_AGO_MINUTE_INTERVAL_MS || '15000'
    ),
    // Update interval for hour-level timestamps (default: 1 minute)
    hourIntervalMs: parseInt(process.env.TIME_AGO_HOUR_INTERVAL_MS || '60000'),
    // Update interval for day-level timestamps (default: 5 minutes)
    dayIntervalMs: parseInt(process.env.TIME_AGO_DAY_INTERVAL_MS || '300000'),
    // Update interval for older timestamps (default: 1 hour)
    olderIntervalMs: parseInt(
      process.env.TIME_AGO_OLDER_INTERVAL_MS || '3600000'
    ),
  },

  // Timer Pool Configuration - Flexy hates hardcoded timer values!
  timerPool: {
    // Cleanup interval for unused pool items (default: 30 seconds)
    cleanupIntervalMs: parseInt(
      process.env.TIMER_POOL_CLEANUP_INTERVAL_MS || '30000'
    ),
    // Maximum age for unused pool items before cleanup (default: 1 minute)
    maxAgeMs: parseInt(process.env.TIMER_POOL_MAX_AGE_MS || '60000'),
  },

  // Cache Pattern Matching - Flexy hates hardcoded timeouts!
  cachePattern: {
    // Maximum execution time for pattern matching in ms (ReDoS protection)
    matchTimeoutMs: parseInt(
      process.env.CACHE_PATTERN_MATCH_TIMEOUT_MS || '100'
    ),
  },

  // Interval recalculation threshold - Flexy hates hardcoded 1000ms!
  // Minimum difference in ms to trigger interval recalculation in useTimeAgo
  intervalRecalculationThresholdMs: parseInt(
    process.env.TIME_AGO_INTERVAL_RECALC_THRESHOLD_MS || '1000'
  ),
} as const

// Type exports
export type TimeMs = typeof TIME_MS
export type TimeSeconds = typeof TIME_SECONDS
export type TimeConfig = typeof timeConfig

// Helper functions
export function toMilliseconds(seconds: number): number {
  return seconds * TIME_MS.SECOND
}

export function toSeconds(milliseconds: number): number {
  return Math.floor(milliseconds / TIME_MS.SECOND)
}

export function toMinutes(milliseconds: number): number {
  return Math.floor(milliseconds / TIME_MS.MINUTE)
}

export function toHours(milliseconds: number): number {
  return Math.floor(milliseconds / TIME_MS.HOUR)
}

export function toDays(milliseconds: number): number {
  return Math.floor(milliseconds / TIME_MS.DAY)
}

export function formatDuration(milliseconds: number): string {
  const days = toDays(milliseconds)
  const hours = toHours(milliseconds % TIME_MS.DAY)
  const minutes = toMinutes(milliseconds % TIME_MS.HOUR)
  const seconds = toSeconds(milliseconds % TIME_MS.MINUTE)

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`)

  return parts.join(' ')
}
