// Database Configuration - SQLite Database Settings
// Flexy hates hardcoded! All database settings are now configurable.

export const databaseConfig = {
  // SQLite Timeouts (busy timeout in milliseconds)
  timeouts: {
    // Development environment: 5 seconds
    development: parseInt(process.env.DB_TIMEOUT_DEVELOPMENT || '5000'),

    // Production environment: 10 seconds for high load
    production: parseInt(process.env.DB_TIMEOUT_PRODUCTION || '10000'),

    // Test environment: 1 second for fast test failures
    test: parseInt(process.env.DB_TIMEOUT_TEST || '1000'),
  },

  // Connection settings
  connection: {
    // Default database URL
    url: process.env.DATABASE_URL || 'file:./data/dev.db',

    // Connection retry settings
    maxRetries: parseInt(process.env.DB_MAX_RETRIES || '3'),
    retryDelayMs: parseInt(process.env.DB_RETRY_DELAY_MS || '1000'),
  },

  // Query settings
  query: {
    // Slow query threshold (ms)
    slowQueryThresholdMs: parseInt(
      process.env.DB_SLOW_QUERY_THRESHOLD || '1000'
    ),

    // Maximum query execution time (ms)
    maxQueryTimeMs: parseInt(process.env.DB_MAX_QUERY_TIME_MS || '30000'),
  },
} as const

// Helper function to get timeout for current environment
export function getDatabaseTimeout(): number {
  const env = process.env.NODE_ENV || 'development'
  return (
    databaseConfig.timeouts[env as keyof typeof databaseConfig.timeouts] ||
    databaseConfig.timeouts.development
  )
}

export type DatabaseConfig = typeof databaseConfig
