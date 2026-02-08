// Retry Configuration - Retry Logic and Backoff Settings
// Flexy hates hardcoded values! All retry settings are now configurable.

export const retryConfig = {
  // Default Settings
  defaults: {
    // Maximum number of retry attempts
    maxRetries: parseInt(process.env.RETRY_MAX_RETRIES || '3'),

    // Base delay for exponential backoff (ms)
    baseDelayMs: parseInt(process.env.RETRY_BASE_DELAY_MS || '1000'),

    // Maximum delay between retries (ms)
    maxDelayMs: parseInt(process.env.RETRY_MAX_DELAY_MS || '30000'),

    // Backoff multiplier
    backoffMultiplier: parseFloat(process.env.RETRY_BACKOFF_MULTIPLIER || '2'),

    // Enable jitter to prevent thundering herd
    jitterEnabled: process.env.RETRY_JITTER_ENABLED !== 'false',

    // Jitter factor (0-1)
    jitterFactor: parseFloat(process.env.RETRY_JITTER_FACTOR || '0.1'),
  },

  // Retryable HTTP Status Codes
  retryableStatusCodes: parseStatusCodes(
    process.env.RETRY_RETRYABLE_STATUS_CODES || '408, 429, 500, 502, 503, 504'
  ),

  // Preset Configurations for different use cases
  presets: {
    // Quick: Fast retries for transient failures
    quick: {
      maxRetries: parseInt(process.env.RETRY_QUICK_MAX_RETRIES || '2'),
      baseDelayMs: parseInt(process.env.RETRY_QUICK_BASE_DELAY_MS || '500'),
      maxDelayMs: parseInt(process.env.RETRY_QUICK_MAX_DELAY_MS || '5000'),
      backoffMultiplier: parseFloat(
        process.env.RETRY_QUICK_BACKOFF_MULTIPLIER || '2'
      ),
      jitterEnabled: process.env.RETRY_QUICK_JITTER_ENABLED !== 'false',
      jitterFactor: parseFloat(process.env.RETRY_QUICK_JITTER_FACTOR || '0.1'),
    },

    // Standard: Balanced retry strategy
    standard: {
      maxRetries: parseInt(process.env.RETRY_STANDARD_MAX_RETRIES || '3'),
      baseDelayMs: parseInt(process.env.RETRY_STANDARD_BASE_DELAY_MS || '1000'),
      maxDelayMs: parseInt(process.env.RETRY_STANDARD_MAX_DELAY_MS || '30000'),
      backoffMultiplier: parseFloat(
        process.env.RETRY_STANDARD_BACKOFF_MULTIPLIER || '2'
      ),
      jitterEnabled: process.env.RETRY_STANDARD_JITTER_ENABLED !== 'false',
      jitterFactor: parseFloat(
        process.env.RETRY_STANDARD_JITTER_FACTOR || '0.1'
      ),
    },

    // Slow: Conservative retries for expensive operations
    slow: {
      maxRetries: parseInt(process.env.RETRY_SLOW_MAX_RETRIES || '5'),
      baseDelayMs: parseInt(process.env.RETRY_SLOW_BASE_DELAY_MS || '2000'),
      maxDelayMs: parseInt(process.env.RETRY_SLOW_MAX_DELAY_MS || '60000'),
      backoffMultiplier: parseFloat(
        process.env.RETRY_SLOW_BACKOFF_MULTIPLIER || '2'
      ),
      jitterEnabled: process.env.RETRY_SLOW_JITTER_ENABLED !== 'false',
      jitterFactor: parseFloat(process.env.RETRY_SLOW_JITTER_FACTOR || '0.15'),
    },

    // Aggressive: Many fast retries
    aggressive: {
      maxRetries: parseInt(process.env.RETRY_AGGRESSIVE_MAX_RETRIES || '5'),
      baseDelayMs: parseInt(
        process.env.RETRY_AGGRESSIVE_BASE_DELAY_MS || '100'
      ),
      maxDelayMs: parseInt(process.env.RETRY_AGGRESSIVE_MAX_DELAY_MS || '5000'),
      backoffMultiplier: parseFloat(
        process.env.RETRY_AGGRESSIVE_BACKOFF_MULTIPLIER || '1.5'
      ),
      jitterEnabled: process.env.RETRY_AGGRESSIVE_JITTER_ENABLED !== 'false',
      jitterFactor: parseFloat(
        process.env.RETRY_AGGRESSIVE_JITTER_FACTOR || '0.2'
      ),
    },

    // HTTP: Specific for HTTP requests
    http: {
      maxRetries: parseInt(process.env.RETRY_HTTP_MAX_RETRIES || '3'),
      baseDelayMs: parseInt(process.env.RETRY_HTTP_BASE_DELAY_MS || '1000'),
      maxDelayMs: parseInt(process.env.RETRY_HTTP_MAX_DELAY_MS || '30000'),
      backoffMultiplier: parseFloat(
        process.env.RETRY_HTTP_BACKOFF_MULTIPLIER || '2'
      ),
      retryableErrors: parseStatusCodes(
        process.env.RETRY_HTTP_RETRYABLE_STATUS_CODES ||
          '408, 429, 500, 502, 503, 504'
      ),
      jitterEnabled: process.env.RETRY_HTTP_JITTER_ENABLED !== 'false',
      jitterFactor: parseFloat(process.env.RETRY_HTTP_JITTER_FACTOR || '0.1'),
    },
  },
} as const

export type RetryConfig = typeof retryConfig

// Helper function to parse status codes
function parseStatusCodes(value: string): number[] {
  return value.split(',').map(s => parseInt(s.trim()))
}

// Helper function to get preset config
export function getRetryPreset(
  preset: keyof typeof retryConfig.presets
): RetryPreset {
  const presetConfig = retryConfig.presets[preset]
  return {
    ...retryConfig.defaults,
    ...presetConfig,
  }
}

// Type for retry preset
export type RetryPreset = {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
  jitterEnabled: boolean
  jitterFactor: number
  retryableErrors?: number[]
}
