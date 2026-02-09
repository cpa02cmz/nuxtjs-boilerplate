// Webhooks Configuration - Webhook Processing and Delivery Settings
// Flexy hates hardcoded values! All webhook settings are now configurable.

export const webhooksConfig = {
  // Queue Processor Settings
  queue: {
    // Interval between queue processing runs (ms)
    processorIntervalMs: parseInt(
      process.env.WEBHOOK_PROCESSOR_INTERVAL_MS || '5000'
    ),

    // Batch size for processing
    batchSize: parseInt(process.env.WEBHOOK_BATCH_SIZE || '10'),

    // Maximum queue size
    maxQueueSize: parseInt(process.env.WEBHOOK_MAX_QUEUE_SIZE || '1000'),
  },

  // Retry Settings
  retry: {
    // Base delay for exponential backoff (ms)
    baseDelayMs: parseInt(process.env.WEBHOOK_RETRY_BASE_DELAY_MS || '1000'),

    // Maximum delay between retries (ms)
    maxDelayMs: parseInt(process.env.WEBHOOK_RETRY_MAX_DELAY_MS || '30000'),

    // Maximum number of retry attempts
    maxAttempts: parseInt(process.env.WEBHOOK_RETRY_MAX_ATTEMPTS || '3'),

    // Jitter factor for randomizing delays (0-1)
    jitterFactor: parseFloat(process.env.WEBHOOK_RETRY_JITTER_FACTOR || '0.1'),
  },

  // Request Settings
  request: {
    // Timeout for webhook requests (ms)
    timeoutMs: parseInt(process.env.WEBHOOK_REQUEST_TIMEOUT_MS || '10000'),

    // HTTP headers to include in requests
    headers: {
      'Content-Type': process.env.WEBHOOK_CONTENT_TYPE || 'application/json',
      'User-Agent': process.env.WEBHOOK_USER_AGENT || 'FreeStuff-Webhook/1.0',
    },

    // HTTP status codes considered successful
    successStatusCodes: parseStatusCodes(
      process.env.WEBHOOK_SUCCESS_STATUS_CODES || '200, 201, 202, 204'
    ),

    // HTTP status codes that trigger retry
    retryableStatusCodes: parseStatusCodes(
      process.env.WEBHOOK_RETRYABLE_STATUS_CODES ||
        '408, 429, 500, 502, 503, 504'
    ),
  },

  // Secret Generation
  secrets: {
    // Prefix for webhook secrets
    secretPrefix: process.env.WEBHOOK_SECRET_PREFIX || 'whsec_',

    // Prefix for webhook IDs
    idPrefix: process.env.WEBHOOK_ID_PREFIX || 'wh_',

    // Secret length (bytes)
    secretLength: parseInt(process.env.WEBHOOK_SECRET_LENGTH || '32'),
  },

  // Circuit Breaker Settings
  circuitBreaker: {
    // Timeout duration (ms)
    timeoutMs: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT_MS || '60000'),

    // Number of failures before opening circuit
    failureThreshold: parseInt(
      process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || '5'
    ),

    // Number of successes before closing circuit
    successThreshold: parseInt(
      process.env.CIRCUIT_BREAKER_SUCCESS_THRESHOLD || '2'
    ),

    // Reset timeout (ms)
    resetTimeoutMs: parseInt(
      process.env.CIRCUIT_BREAKER_RESET_TIMEOUT_MS || '30000'
    ),
  },

  // Event Types
  events: {
    // Valid event types for webhooks
    validTypes: parseEventTypes(
      process.env.WEBHOOK_VALID_EVENT_TYPES ||
        'resource.created, resource.updated, resource.deleted, resource.approved, resource.rejected'
    ),
  },

  // Retry Presets - Flexy hates hardcoded retry configs!
  presets: {
    quick: {
      maxRetries: parseInt(process.env.RETRY_PRESET_QUICK_MAX_RETRIES || '2'),
      baseDelayMs: parseInt(
        process.env.RETRY_PRESET_QUICK_BASE_DELAY_MS || '500'
      ),
      maxDelayMs: parseInt(
        process.env.RETRY_PRESET_QUICK_MAX_DELAY_MS || '5000'
      ),
      backoffMultiplier: parseFloat(
        process.env.RETRY_PRESET_QUICK_BACKOFF_MULTIPLIER || '2'
      ),
      jitterEnabled: process.env.RETRY_PRESET_QUICK_JITTER_ENABLED !== 'false',
      jitterFactor: parseFloat(
        process.env.RETRY_PRESET_QUICK_JITTER_FACTOR || '0.1'
      ),
    },
    standard: {
      maxRetries: parseInt(
        process.env.RETRY_PRESET_STANDARD_MAX_RETRIES || '3'
      ),
      baseDelayMs: parseInt(
        process.env.RETRY_PRESET_STANDARD_BASE_DELAY_MS || '1000'
      ),
      maxDelayMs: parseInt(
        process.env.RETRY_PRESET_STANDARD_MAX_DELAY_MS || '30000'
      ),
      backoffMultiplier: parseFloat(
        process.env.RETRY_PRESET_STANDARD_BACKOFF_MULTIPLIER || '2'
      ),
      jitterEnabled:
        process.env.RETRY_PRESET_STANDARD_JITTER_ENABLED !== 'false',
      jitterFactor: parseFloat(
        process.env.RETRY_PRESET_STANDARD_JITTER_FACTOR || '0.1'
      ),
    },
    slow: {
      maxRetries: parseInt(process.env.RETRY_PRESET_SLOW_MAX_RETRIES || '5'),
      baseDelayMs: parseInt(
        process.env.RETRY_PRESET_SLOW_BASE_DELAY_MS || '2000'
      ),
      maxDelayMs: parseInt(
        process.env.RETRY_PRESET_SLOW_MAX_DELAY_MS || '60000'
      ),
      backoffMultiplier: parseFloat(
        process.env.RETRY_PRESET_SLOW_BACKOFF_MULTIPLIER || '2'
      ),
      jitterEnabled: process.env.RETRY_PRESET_SLOW_JITTER_ENABLED !== 'false',
      jitterFactor: parseFloat(
        process.env.RETRY_PRESET_SLOW_JITTER_FACTOR || '0.15'
      ),
    },
    aggressive: {
      maxRetries: parseInt(
        process.env.RETRY_PRESET_AGGRESSIVE_MAX_RETRIES || '3'
      ),
      baseDelayMs: parseInt(
        process.env.RETRY_PRESET_AGGRESSIVE_BASE_DELAY_MS || '100'
      ),
      maxDelayMs: parseInt(
        process.env.RETRY_PRESET_AGGRESSIVE_MAX_DELAY_MS || '5000'
      ),
      backoffMultiplier: parseFloat(
        process.env.RETRY_PRESET_AGGRESSIVE_BACKOFF_MULTIPLIER || '1.5'
      ),
      jitterEnabled:
        process.env.RETRY_PRESET_AGGRESSIVE_JITTER_ENABLED !== 'false',
      jitterFactor: parseFloat(
        process.env.RETRY_PRESET_AGGRESSIVE_JITTER_FACTOR || '0.2'
      ),
    },
    httpRetry: {
      maxRetries: parseInt(process.env.RETRY_PRESET_HTTP_MAX_RETRIES || '3'),
      baseDelayMs: parseInt(
        process.env.RETRY_PRESET_HTTP_BASE_DELAY_MS || '1000'
      ),
      maxDelayMs: parseInt(
        process.env.RETRY_PRESET_HTTP_MAX_DELAY_MS || '30000'
      ),
      backoffMultiplier: parseFloat(
        process.env.RETRY_PRESET_HTTP_BACKOFF_MULTIPLIER || '2'
      ),
      jitterEnabled: process.env.RETRY_PRESET_HTTP_JITTER_ENABLED !== 'false',
      jitterFactor: parseFloat(
        process.env.RETRY_PRESET_HTTP_JITTER_FACTOR || '0.1'
      ),
    },
  },
} as const

// Helper function to parse status codes
function parseStatusCodes(value: string): number[] {
  return value.split(',').map(s => parseInt(s.trim()))
}

// Helper function to parse event types
function parseEventTypes(value: string): string[] {
  return value.split(',').map(s => s.trim())
}

export type WebhooksConfig = typeof webhooksConfig
