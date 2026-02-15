// Timer Pool Configuration - Flexy hates hardcoded timer limits!
// Centralized configuration for timer pooling to prevent memory leaks

export const timerPoolConfig = {
  // Default pool sizes - Flexy hates hardcoded defaults!
  poolSize: {
    // Maximum timeout pool size
    maxTimeout: parseInt(process.env.TIMER_POOL_MAX_TIMEOUT_SIZE || '20'),
    // Maximum interval pool size
    maxInterval: parseInt(process.env.TIMER_POOL_MAX_INTERVAL_SIZE || '10'),
  },

  // Cleanup configuration
  cleanup: {
    // Interval between cleanup runs (ms)
    intervalMs: parseInt(process.env.TIMER_POOL_CLEANUP_INTERVAL_MS || '30000'),
    // Maximum age for unused pool items before cleanup (ms)
    maxAgeMs: parseInt(process.env.TIMER_POOL_MAX_AGE_MS || '60000'),
  },

  // Validation
  validation: {
    // Minimum delay for timers (ms) - prevents immediate execution issues
    minDelayMs: 0,
    // Warn threshold for pool exhaustion percentage
    poolExhaustionWarningThreshold: 0.8, // 80%
  },
} as const

export type TimerPoolConfig = typeof timerPoolConfig
