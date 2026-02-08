/**
 * Retry Configuration
 * Flexy says: Retry strategies should be configurable!
 */

// Retry Configuration Constants
export const RETRY_CONFIG = {
  // Default settings
  defaults: {
    maxAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS || '3'),
    baseDelayMs: parseInt(process.env.RETRY_BASE_DELAY || '1000'),
    maxDelayMs: parseInt(process.env.RETRY_MAX_DELAY || '30000'),
    backoffMultiplier: parseFloat(process.env.RETRY_BACKOFF_MULTIPLIER || '2'),
  },

  // Timeout settings
  timeout: {
    default: parseInt(process.env.RETRY_TIMEOUT_DEFAULT || '30000'),
    min: parseInt(process.env.RETRY_TIMEOUT_MIN || '1000'),
    max: parseInt(process.env.RETRY_TIMEOUT_MAX || '120000'),
  },
} as const

// Retry Presets for different scenarios
export const RETRY_PRESETS = {
  // Quick retries for fast operations
  quick: {
    maxAttempts: 2,
    baseDelayMs: 500,
    maxDelayMs: 2000,
    backoffMultiplier: 1.5,
  },

  // Standard retry strategy
  standard: {
    maxAttempts: RETRY_CONFIG.defaults.maxAttempts,
    baseDelayMs: RETRY_CONFIG.defaults.baseDelayMs,
    maxDelayMs: RETRY_CONFIG.defaults.maxDelayMs,
    backoffMultiplier: RETRY_CONFIG.defaults.backoffMultiplier,
  },

  // Slow retries for heavy operations
  slow: {
    maxAttempts: 5,
    baseDelayMs: 2000,
    maxDelayMs: 60000,
    backoffMultiplier: 2,
  },

  // Aggressive retries for critical operations
  aggressive: {
    maxAttempts: 10,
    baseDelayMs: 100,
    maxDelayMs: 10000,
    backoffMultiplier: 1.2,
  },

  // HTTP-specific retry strategy
  http: {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504] as const,
  },
} as const

// Circuit Breaker Configuration
export const CIRCUIT_BREAKER_CONFIG = {
  defaults: {
    failureThreshold: parseInt(
      process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || '5'
    ),
    successThreshold: parseInt(
      process.env.CIRCUIT_BREAKER_SUCCESS_THRESHOLD || '2'
    ),
    timeoutMs: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '60000'),
  },

  // State monitoring
  monitoring: {
    enabled: process.env.CIRCUIT_BREAKER_MONITORING_ENABLED === 'true',
    logStateChanges: process.env.CIRCUIT_BREAKER_LOG_STATE === 'true',
  },
} as const

// Webhook Delivery Retry Configuration
export const WEBHOOK_RETRY_CONFIG = {
  // Base delay for exponential backoff
  baseDelayMs: parseInt(process.env.WEBHOOK_RETRY_BASE_DELAY || '1000'),

  // Maximum delay between retries
  maxDelayMs: parseInt(process.env.WEBHOOK_RETRY_MAX_DELAY || '30000'),

  // Maximum number of retry attempts
  maxAttempts: parseInt(process.env.WEBHOOK_RETRY_MAX_ATTEMPTS || '5'),

  // Timeout for webhook requests
  timeoutMs: parseInt(process.env.WEBHOOK_TIMEOUT || '10000'),

  // Retry status codes
  retryableStatusCodes: [408, 429, 500, 502, 503, 504] as const,
} as const

// Export all retry configs
export default {
  config: RETRY_CONFIG,
  presets: RETRY_PRESETS,
  circuitBreaker: CIRCUIT_BREAKER_CONFIG,
  webhook: WEBHOOK_RETRY_CONFIG,
}
