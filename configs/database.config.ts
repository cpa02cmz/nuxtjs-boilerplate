// Database Configuration - Database Connection and Timeout Settings
// Flexy hates hardcoded values! All database settings are now configurable.

export const databaseConfig = {
  // Database Connection URL
  // Uses PostgreSQL connection string format
  url:
    process.env.DATABASE_URL ||
    'postgresql://user:password@localhost:5432/mydb',

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

  // Connection Pool Settings - Now Active for PostgreSQL
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
  // Prisma manages connection pooling automatically via DATABASE_URL
  // These settings can be tuned via connection string parameters or Prisma configuration
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
} as const

export type DatabaseConfig = typeof databaseConfig
