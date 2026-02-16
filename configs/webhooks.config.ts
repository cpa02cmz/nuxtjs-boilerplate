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

    // Default priority for queue items
    defaultPriority: parseInt(process.env.WEBHOOK_DEFAULT_PRIORITY || '0'),

    // Timeout for processing individual queue items (ms) - Issue #2206
    processTimeoutMs: parseInt(
      process.env.WEBHOOK_QUEUE_PROCESS_TIMEOUT_MS || '30000'
    ),
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

    // Exponential backoff multiplier (base for Math.pow) - Flexy hates hardcoded 2!
    exponentialBase: parseFloat(
      process.env.WEBHOOK_RETRY_EXPONENTIAL_BASE || '2'
    ),
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

  // Delivery Defaults - Flexy hates hardcoded defaults!
  delivery: {
    // Default max retries for webhook delivery
    maxRetries: parseInt(process.env.WEBHOOK_DELIVERY_MAX_RETRIES || '3'),
    // Default initial delay in milliseconds
    initialDelayMs: parseInt(
      process.env.WEBHOOK_DELIVERY_INITIAL_DELAY_MS || '1000'
    ),
    // Default priority for queue items
    priority: parseInt(process.env.WEBHOOK_DELIVERY_PRIORITY || '0'),
    // Default success status code
    successStatusCode: parseInt(
      process.env.WEBHOOK_SUCCESS_STATUS_CODE || '200'
    ),
    // Default success message
    successMessage: process.env.WEBHOOK_SUCCESS_MESSAGE || 'OK',
  },

  // UI Placeholders - Flexy hates hardcoded form placeholders!
  placeholders: {
    // Webhook URL input placeholder
    url: process.env.WEBHOOK_PLACEHOLDER_URL || 'https://example.com/webhook',
  },

  // Circuit Breaker Key Management - Flexy hates hardcoded limits!
  circuitBreakerKeys: {
    // Maximum number of circuit breaker keys to store
    maxKeys: parseInt(process.env.CIRCUIT_BREAKER_MAX_KEYS || '1000'),
    // Percentage of keys to remove when limit reached (0.2 = 20%)
    cleanupPercentage: parseFloat(
      process.env.CIRCUIT_BREAKER_CLEANUP_PERCENTAGE || '0.2'
    ),
  },

  // Retry Error Codes - Flexy hates hardcoded error lists!
  retryableErrors: {
    // HTTP status codes that should trigger retry
    httpCodes: parseStatusCodes(
      process.env.WEBHOOK_RETRYABLE_HTTP_CODES || '408, 429, 500, 502, 503, 504'
    ),
    // Error codes that should trigger retry
    errorCodes: parseErrorCodes(
      process.env.WEBHOOK_RETRYABLE_ERROR_CODES ||
        'ECONNRESET, ETIMEDOUT, ENOTFOUND'
    ),
  },

  // Retry Presets - Flexy hates hardcoded retry configurations!
  retryPresets: {
    // Quick preset for fast operations
    quick: {
      maxRetries: parseInt(process.env.RETRY_PRESET_QUICK_MAX_RETRIES || '2'),
      baseDelayMs: parseInt(
        process.env.RETRY_PRESET_QUICK_BASE_DELAY_MS || '500'
      ),
      maxDelayMs: parseInt(
        process.env.RETRY_PRESET_QUICK_MAX_DELAY_MS || '5000'
      ),
      backoffMultiplier: parseFloat(
        process.env.RETRY_PRESET_QUICK_MULTIPLIER || '2'
      ),
      jitterEnabled: process.env.RETRY_PRESET_QUICK_JITTER !== 'false',
      jitterFactor: parseFloat(
        process.env.RETRY_PRESET_QUICK_JITTER_FACTOR || '0.1'
      ),
    },

    // Standard preset for general use
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
        process.env.RETRY_PRESET_STANDARD_MULTIPLIER || '2'
      ),
      jitterEnabled: process.env.RETRY_PRESET_STANDARD_JITTER !== 'false',
      jitterFactor: parseFloat(
        process.env.RETRY_PRESET_STANDARD_JITTER_FACTOR || '0.1'
      ),
    },

    // Slow preset for heavy operations
    slow: {
      maxRetries: parseInt(process.env.RETRY_PRESET_SLOW_MAX_RETRIES || '5'),
      baseDelayMs: parseInt(
        process.env.RETRY_PRESET_SLOW_BASE_DELAY_MS || '2000'
      ),
      maxDelayMs: parseInt(
        process.env.RETRY_PRESET_SLOW_MAX_DELAY_MS || '60000'
      ),
      backoffMultiplier: parseFloat(
        process.env.RETRY_PRESET_SLOW_MULTIPLIER || '2'
      ),
      jitterEnabled: process.env.RETRY_PRESET_SLOW_JITTER !== 'false',
      jitterFactor: parseFloat(
        process.env.RETRY_PRESET_SLOW_JITTER_FACTOR || '0.15'
      ),
    },

    // Aggressive preset for critical operations
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
        process.env.RETRY_PRESET_AGGRESSIVE_MULTIPLIER || '1.5'
      ),
      jitterEnabled: process.env.RETRY_PRESET_AGGRESSIVE_JITTER !== 'false',
      jitterFactor: parseFloat(
        process.env.RETRY_PRESET_AGGRESSIVE_JITTER_FACTOR || '0.2'
      ),
    },

    // HTTP-specific preset
    http: {
      maxRetries: parseInt(process.env.RETRY_PRESET_HTTP_MAX_RETRIES || '3'),
      baseDelayMs: parseInt(
        process.env.RETRY_PRESET_HTTP_BASE_DELAY_MS || '1000'
      ),
      maxDelayMs: parseInt(
        process.env.RETRY_PRESET_HTTP_MAX_DELAY_MS || '30000'
      ),
      backoffMultiplier: parseFloat(
        process.env.RETRY_PRESET_HTTP_MULTIPLIER || '2'
      ),
      jitterEnabled: process.env.RETRY_PRESET_HTTP_JITTER !== 'false',
      jitterFactor: parseFloat(
        process.env.RETRY_PRESET_HTTP_JITTER_FACTOR || '0.1'
      ),
    },
  },

  // Overall delivery timeout (ms) - Issue #2207
  overallTimeoutMs: parseInt(process.env.WEBHOOK_OVERALL_TIMEOUT_MS || '60000'),

  // Idempotency Key Settings - Flexy hates hardcoded 24 hours!
  idempotency: {
    // Default expiration time for idempotency keys (hours)
    expirationHours: parseInt(
      process.env.WEBHOOK_IDEMPOTENCY_EXPIRATION_HOURS || '24'
    ),
    // Minimum expiration hours allowed
    minExpirationHours: parseInt(
      process.env.WEBHOOK_IDEMPOTENCY_MIN_EXPIRATION_HOURS || '1'
    ),
    // Maximum expiration hours allowed
    maxExpirationHours: parseInt(
      process.env.WEBHOOK_IDEMPOTENCY_MAX_EXPIRATION_HOURS || '168'
    ),
  },

  // Dead Letter Queue Settings - Flexy hates hardcoded retention days!
  // Idempotency Settings - Flexy hates hardcoded 24 hours!
  idempotency: {
    // Default expiration time for idempotency keys (hours)
    expirationHours: parseInt(
      process.env.WEBHOOK_IDEMPOTENCY_EXPIRATION_HOURS || '24'
    ),

    // Minimum expiration hours allowed
    minExpirationHours: parseInt(
      process.env.WEBHOOK_IDEMPOTENCY_MIN_EXPIRATION_HOURS || '1'
    ),

    // Maximum expiration hours allowed
    maxExpirationHours: parseInt(
      process.env.WEBHOOK_IDEMPOTENCY_MAX_EXPIRATION_HOURS || '168'
    ),
  },

  deadLetter: {
    // Number of days to retain dead letter items before cleanup (default: 30 days)
    retentionDays: parseInt(
      process.env.WEBHOOK_DEAD_LETTER_RETENTION_DAYS || '30'
    ),

    // Minimum retention days allowed
    minRetentionDays: parseInt(
      process.env.WEBHOOK_DEAD_LETTER_MIN_RETENTION_DAYS || '1'
    ),

    // Maximum retention days allowed
    maxRetentionDays: parseInt(
      process.env.WEBHOOK_DEAD_LETTER_MAX_RETENTION_DAYS || '365'
    ),

    // Maximum number of items to process in one cleanup run
    cleanupBatchSize: parseInt(
      process.env.WEBHOOK_DEAD_LETTER_CLEANUP_BATCH_SIZE || '100'
    ),
  },
} as const

// Helper function to parse status codes
function parseStatusCodes(value: string): number[] {
  return value.split(',').map(s => parseInt(s.trim()))
}

// Helper function to parse error codes
function parseErrorCodes(value: string): string[] {
  return value.split(',').map(s => s.trim())
}

// Helper function to parse event types
function parseEventTypes(value: string): string[] {
  return value.split(',').map(s => s.trim())
}

export type WebhooksConfig = typeof webhooksConfig
