// Timer Pool Configuration - Timer pooling settings and defaults
// Flexy hates hardcoded values! All timer pool parameters are configurable.

import { TIME_MS } from './time.config'

/**
 * Timer Pool default configuration
 * All values can be overridden via environment variables
 */
export const TIMER_POOL_DEFAULTS = {
  /**
   * Maximum number of timeout slots in the pool
   * @default 20
   */
  maxTimeoutPoolSize: parseInt(process.env.TIMER_POOL_MAX_TIMEOUT_SIZE || '20'),

  /**
   * Maximum number of interval slots in the pool
   * @default 10
   */
  maxIntervalPoolSize: parseInt(
    process.env.TIMER_POOL_MAX_INTERVAL_SIZE || '10'
  ),

  /**
   * Cleanup interval in milliseconds
   * How often to check for and remove expired pool items
   * @default 30000 (30 seconds)
   */
  cleanupIntervalMs: parseInt(
    process.env.TIMER_POOL_CLEANUP_INTERVAL_MS || `${TIME_MS.SECOND * 30}`
  ),

  /**
   * Maximum age of unused pool items before cleanup
   * Items not in use for longer than this will be removed
   * @default 60000 (1 minute)
   */
  maxAgeMs: parseInt(process.env.TIMER_POOL_MAX_AGE_MS || `${TIME_MS.MINUTE}`),
} as const

/**
 * Timer Pool configuration object
 */
export const timerPoolConfig = {
  /**
   * Default pool settings
   */
  defaults: TIMER_POOL_DEFAULTS,

  /**
   * Pool size limits
   */
  limits: {
    // Absolute maximum pool sizes (safety limits)
    maxTimeoutPoolSize: parseInt(
      process.env.TIMER_POOL_ABS_MAX_TIMEOUT || '100'
    ),
    maxIntervalPoolSize: parseInt(
      process.env.TIMER_POOL_ABS_MAX_INTERVAL || '50'
    ),

    // Minimum pool sizes
    minTimeoutPoolSize: parseInt(process.env.TIMER_POOL_MIN_TIMEOUT || '5'),
    minIntervalPoolSize: parseInt(process.env.TIMER_POOL_MIN_INTERVAL || '3'),
  },

  /**
   * Performance tuning
   */
  performance: {
    // Enable pool statistics tracking
    trackStats: process.env.TIMER_POOL_TRACK_STATS !== 'false',

    // Auto-cleanup on component unmount
    autoCleanup: process.env.TIMER_POOL_AUTO_CLEANUP !== 'false',

    // Log pool statistics periodically (for debugging)
    logStats: process.env.TIMER_POOL_LOG_STATS === 'true',

    // Stats logging interval (if logStats enabled)
    statsLogIntervalMs: parseInt(
      process.env.TIMER_POOL_STATS_LOG_INTERVAL_MS || `${TIME_MS.MINUTE * 5}`
    ),
  },

  /**
   * Memory management
   */
  memory: {
    // Maximum number of recycled timers before forcing cleanup
    maxRecycledTimeouts: parseInt(
      process.env.TIMER_POOL_MAX_RECYCLED_TIMEOUT || '1000'
    ),
    maxRecycledIntervals: parseInt(
      process.env.TIMER_POOL_MAX_RECYCLED_INTERVAL || '500'
    ),

    // Enable aggressive cleanup when memory pressure detected
    aggressiveCleanup: process.env.TIMER_POOL_AGGRESSIVE_CLEANUP === 'true',
  },
} as const

// Type exports
export type TimerPoolDefaults = typeof TIMER_POOL_DEFAULTS
export type TimerPoolConfig = typeof timerPoolConfig

/**
 * Create timer pool options with defaults applied
 * @param options - Partial options to override defaults
 * @returns Complete timer pool options
 */
export function createTimerPoolOptions(
  options: Partial<{
    maxTimeoutPoolSize: number
    maxIntervalPoolSize: number
    cleanupInterval: number
  }> = {}
) {
  return {
    maxTimeoutPoolSize:
      options.maxTimeoutPoolSize ?? TIMER_POOL_DEFAULTS.maxTimeoutPoolSize,
    maxIntervalPoolSize:
      options.maxIntervalPoolSize ?? TIMER_POOL_DEFAULTS.maxIntervalPoolSize,
    cleanupInterval:
      options.cleanupInterval ?? TIMER_POOL_DEFAULTS.cleanupIntervalMs,
  }
}

export default timerPoolConfig
