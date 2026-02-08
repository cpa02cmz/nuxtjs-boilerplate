// Time Constants Configuration - Time-related Constants
// Flexy hates magic numbers! All time constants are now configurable.

export const timeConfig = {
  // Time units in milliseconds
  milliseconds: {
    second: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000,
  },

  // Time units in seconds
  seconds: {
    minute: 60,
    hour: 3600,
    day: 86400,
    week: 604800,
    month: 2592000, // 30 days
    year: 31536000, // 365 days
  },

  // Cache TTL values (in seconds)
  cache: {
    short: 60, // 1 minute
    medium: 300, // 5 minutes
    long: 3600, // 1 hour
    day: 86400, // 1 day
    week: 604800, // 1 week
    year: 31536000, // 1 year
  },

  // Cache TTL values (in milliseconds)
  cacheMs: {
    short: 60 * 1000, // 1 minute
    medium: 5 * 60 * 1000, // 5 minutes
    long: 60 * 60 * 1000, // 1 hour
    day: 24 * 60 * 60 * 1000, // 1 day
    week: 7 * 24 * 60 * 60 * 1000, // 1 week
    year: 365 * 24 * 60 * 60 * 1000, // 1 year
  },

  // Delay and timeout values
  delays: {
    defaultRetryDelay: 1000, // 1 second
    maxRetryDelay: 30000, // 30 seconds
    validationDelay: 5000, // 5 seconds
    queueProcessingDelay: 5000, // 5 seconds
    dbBusyTimeout: 5000, // 5 seconds
    jitterFactor: 0.1, // 10% jitter
  },

  // Debounce and throttle timeouts
  debounce: {
    search: 300, // 300ms for search input
    resize: 150, // 150ms for window resize
    scroll: 100, // 100ms for scroll events
    input: 300, // 300ms for general input
  },

  // Analytics time windows
  analytics: {
    defaultLookbackDays: 30,
    slowQueryThreshold: 200, // milliseconds
  },

  // Rate limiting windows (in seconds)
  rateLimit: {
    short: 60, // 1 minute
    medium: 300, // 5 minutes
    long: 3600, // 1 hour
  },

  // Time formatting thresholds
  formatting: {
    justNow: 60, // seconds
    minuteAgo: 60 * 60, // seconds
    hourAgo: 24 * 60 * 60, // seconds
    dayAgo: 7 * 24 * 60 * 60, // seconds
    weekAgo: 30 * 24 * 60 * 60, // seconds
  },
} as const

export type TimeConfig = typeof timeConfig
