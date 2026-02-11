// Network Configuration - Network errors and retry settings
// Flexy hates hardcoded values! All network settings are now configurable.

export const networkConfig = {
  // Retryable network errors - these errors trigger automatic retry
  retryableErrors: parseRetryableErrors(
    process.env.NETWORK_RETRYABLE_ERRORS
  ) || ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'],

  // Request timeout settings
  timeout: {
    // Default request timeout in milliseconds
    defaultMs: parseInt(process.env.NETWORK_TIMEOUT_DEFAULT_MS || '5000'),
    // URL validation specific timeout
    urlValidationMs: parseInt(
      process.env.NETWORK_TIMEOUT_URL_VALIDATION_MS || '10000'
    ),
    // Webhook request timeout
    webhookMs: parseInt(process.env.NETWORK_TIMEOUT_WEBHOOK_MS || '30000'),
  },

  // Retry settings
  retry: {
    // Maximum number of retry attempts
    maxAttempts: parseInt(process.env.NETWORK_RETRY_MAX_ATTEMPTS || '3'),
    // Base delay between retries in milliseconds
    baseDelayMs: parseInt(process.env.NETWORK_RETRY_BASE_DELAY_MS || '1000'),
    // Maximum delay between retries in milliseconds
    maxDelayMs: parseInt(process.env.NETWORK_RETRY_MAX_DELAY_MS || '10000'),
    // Exponential backoff multiplier
    backoffMultiplier: parseFloat(
      process.env.NETWORK_RETRY_BACKOFF_MULTIPLIER || '2'
    ),
  },

  // Circuit breaker settings
  circuitBreaker: {
    // Number of failures before opening the circuit
    failureThreshold: parseInt(
      process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || '5'
    ),
    // Number of successful requests before closing the circuit
    successThreshold: parseInt(
      process.env.CIRCUIT_BREAKER_SUCCESS_THRESHOLD || '3'
    ),
    // Time in milliseconds before attempting to close the circuit
    timeoutMs: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT_MS || '60000'),
  },
} as const

// Helper function to parse retryable errors from environment variable
function parseRetryableErrors(value: string | undefined): string[] | null {
  if (!value) return null
  return value.split(',').map(s => s.trim())
}

export type NetworkConfig = typeof networkConfig
