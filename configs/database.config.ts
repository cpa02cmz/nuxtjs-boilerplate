// Database Configuration - Database Connection and Timeout Settings
// Flexy hates hardcoded values! All database settings are now configurable.

export const databaseConfig = {
  // Database File Paths - Flexy hates hardcoded paths!
  paths: {
    // Default SQLite database file path
    defaultDb:
      process.env.DATABASE_URL ||
      process.env.DB_PATH_DEFAULT ||
      'file:./data/dev.db',
    // Data directory path
    dataDir: process.env.DB_DATA_DIR || './data',
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

  // Connection Pool Settings
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

  // Logging Prefix - Flexy hates hardcoded log prefixes!
  logging: {
    prefix: process.env.DB_LOG_PREFIX || '[Database]',
  },
} as const

export type DatabaseConfig = typeof databaseConfig
