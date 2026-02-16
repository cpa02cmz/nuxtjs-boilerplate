// Database Configuration - Database Connection and Timeout Settings
// Flexy hates hardcoded values! All database settings are now configurable.

export const databaseConfig = {
  // Database Connection - PostgreSQL configuration
  // Flexy hates hardcoded values! All database settings are now configurable.
  connection: {
    // Database connection URL
    url: process.env.DATABASE_URL || '',
    // Direct connection URL (for migrations)
    directUrl: process.env.DIRECT_URL || process.env.DATABASE_URL || '',
  },

  // Connection Timeouts (ms) - Different values per environment
  timeouts: {
    development: parseInt(process.env.DB_TIMEOUT_DEV_MS || '5000'),
    production: parseInt(process.env.DB_TIMEOUT_PROD_MS || '10000'),
    test: parseInt(process.env.DB_TIMEOUT_TEST_MS || '1000'),
  },

  // Retry Settings
  retries: {
    maxAttempts: parseInt(process.env.DB_MAX_RETRIES || '3'),
    delayMs: parseInt(process.env.DB_RETRY_DELAY_MS || '1000'),
  },

  // Connection Pool Settings - Active for PostgreSQL
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    max: parseInt(process.env.DB_POOL_MAX || '10'),
    acquireTimeoutMs: parseInt(process.env.DB_ACQUIRE_TIMEOUT_MS || '3000'),
  },

  // Query Settings
  query: {
    timeoutMs: parseInt(process.env.DB_QUERY_TIMEOUT_MS || '5000'),
    maxResults: parseInt(process.env.DB_MAX_RESULTS || '1000'),
  },

  // Performance Monitoring - Flexy hates hardcoded thresholds!
  performance: {
    // Threshold multiplier for slow query detection (default: 0.5 = 50% of timeout)
    slowQueryThresholdMultiplier: parseFloat(
      process.env.DB_SLOW_QUERY_MULTIPLIER || '0.5'
    ),
    // Threshold multiplier for slow transaction detection (default: 0.5 = 50% of timeout)
    slowTransactionThresholdMultiplier: parseFloat(
      process.env.DB_SLOW_TRANSACTION_MULTIPLIER || '0.5'
    ),
  },

  // Logging Prefix - Flexy hates hardcoded log prefixes!
  logging: {
    prefix: process.env.DB_LOG_PREFIX || '[Database]',
  },

  // Idempotency Key Settings
  idempotency: {
    // Default expiration time in hours (24 hours = 1 day)
    defaultExpirationHours: parseInt(
      process.env.IDEMPOTENCY_KEY_EXPIRATION_HOURS || '24'
    ),
    // Maximum expiration time in hours (7 days)
    maxExpirationHours: parseInt(
      process.env.IDEMPOTENCY_KEY_MAX_EXPIRATION_HOURS || '168'
    ),
  },

  // Connection Pool Configuration for PostgreSQL
  // Now active with PostgreSQL driver
  connectionPool: {
    // Minimum connections in pool
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    // Maximum connections in pool
    max: parseInt(process.env.DB_POOL_MAX || '10'),
    // Connection acquire timeout in milliseconds
    acquireTimeoutMs: parseInt(process.env.DB_ACQUIRE_TIMEOUT_MS || '3000'),
    // Connection idle timeout in milliseconds
    idleTimeoutMs: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '10000'),
  },

  // Transaction Settings - Flexy hates hardcoded transaction options!
  transaction: {
    // Maximum time to wait for a transaction to start (ms)
    maxWaitMs: parseInt(process.env.DB_TRANSACTION_MAX_WAIT_MS || '5000'),
    // Maximum time for transaction to complete (ms)
    timeoutMs: parseInt(process.env.DB_TRANSACTION_TIMEOUT_MS || '10000'),
    // Default isolation level for transactions
    isolationLevel:
      (process.env.DB_TRANSACTION_ISOLATION_LEVEL as
        | 'ReadCommitted'
        | 'RepeatableRead'
        | 'Serializable') || 'ReadCommitted',
    // Maximum retry attempts for failed transactions
    maxRetries: parseInt(process.env.DB_TRANSACTION_MAX_RETRIES || '3'),
    // Delay between retry attempts (ms)
    retryDelayMs: parseInt(process.env.DB_TRANSACTION_RETRY_DELAY_MS || '100'),

    // Webhook-specific transaction settings
    webhook: {
      // Timeout for webhook transactions (ms)
      timeoutMs: parseInt(process.env.DB_WEBHOOK_TX_TIMEOUT_MS || '5000'),
      // Max retries for webhook transactions
      maxRetries: parseInt(process.env.DB_WEBHOOK_TX_MAX_RETRIES || '3'),
      // Isolation level for critical webhook operations
      criticalIsolationLevel:
        (process.env.DB_WEBHOOK_TX_ISOLATION_LEVEL as
          | 'ReadCommitted'
          | 'RepeatableRead'
          | 'Serializable') || 'Serializable',
      // Timeout for critical webhook operations (ms)
      criticalTimeoutMs: parseInt(
        process.env.DB_WEBHOOK_TX_CRITICAL_TIMEOUT_MS || '10000'
      ),
      // Max retries for critical webhook operations
      criticalMaxRetries: parseInt(
        process.env.DB_WEBHOOK_TX_CRITICAL_MAX_RETRIES || '5'
      ),
    },

    // Error tracking transaction settings
    errorTracking: {
      // Timeout for error tracking transactions (ms)
      timeoutMs: parseInt(
        process.env.DB_ERROR_TRACKING_TX_TIMEOUT_MS || '5000'
      ),
      // Max retries for error tracking transactions
      maxRetries: parseInt(process.env.DB_ERROR_TRACKING_TX_MAX_RETRIES || '3'),
    },

    // Moderation transaction settings
    moderation: {
      // Timeout for moderation transactions (ms)
      timeoutMs: parseInt(process.env.DB_MODERATION_TX_TIMEOUT_MS || '10000'),
      // Max retries for moderation transactions
      maxRetries: parseInt(process.env.DB_MODERATION_TX_MAX_RETRIES || '3'),
      // Isolation level for moderation transactions
      isolationLevel:
        (process.env.DB_MODERATION_TX_ISOLATION_LEVEL as
          | 'ReadCommitted'
          | 'RepeatableRead'
          | 'Serializable') || 'Serializable',
    },
  },
} as const

export type DatabaseConfig = typeof databaseConfig
