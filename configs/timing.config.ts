// ============================================
// TIMING CONFIGURATION
// Timeouts, intervals, and delay constants
// ============================================

export const TIMING_CONFIG = {
  // Webhook processing
  webhook: {
    queueProcessorInterval: 5000, // 5 seconds
    retryDelayBase: 1000, // 1 second
    retryDelayMax: 30000, // 30 seconds
    requestTimeout: 10000, // 10 seconds
  },

  // Retry and backoff
  retry: {
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    maxAttempts: 3,
    backoffMultiplier: 2,
  },

  // Circuit breaker
  circuitBreaker: {
    timeoutMs: 60000, // 1 minute
    failureThreshold: 5,
    successThreshold: 2,
    resetTimeoutMs: 30000,
  },

  // Debounce defaults
  debounce: {
    default: 300,
    search: 300,
    input: 300,
  },

  // Cache TTL (milliseconds)
  cache: {
    default: 300000, // 5 minutes
    short: 60000, // 1 minute
    long: 3600000, // 1 hour
  },

  // Rate limiting windows (milliseconds)
  rateLimit: {
    general: 900000, // 15 minutes
    api: 300000, // 5 minutes
    search: 60000, // 1 minute
  },
} as const

// Preset retry configurations
export const RETRY_PRESETS = {
  default: {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
  },
  aggressive: {
    maxAttempts: 5,
    baseDelayMs: 500,
    maxDelayMs: 10000,
    backoffMultiplier: 1.5,
  },
  conservative: {
    maxAttempts: 3,
    baseDelayMs: 2000,
    maxDelayMs: 60000,
    backoffMultiplier: 2,
  },
  api: {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
  },
  database: {
    maxAttempts: 5,
    baseDelayMs: 500,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
  },
  network: {
    maxAttempts: 5,
    baseDelayMs: 1000,
    maxDelayMs: 60000,
    backoffMultiplier: 2,
  },
} as const

export type RetryPreset = keyof typeof RETRY_PRESETS
