import { PrismaClient } from '@prisma/client'
import { PrismaBetterSQLite3 as PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { databaseConfig } from '~/configs/database.config'

// Flexy hates hardcoded values! Using config for log prefix
const LOG_PREFIX = databaseConfig.logging.prefix

declare global {
  var __dbPrisma: PrismaClient | undefined
}

// SQLite connection configuration
// Note: SQLite is file-based and doesn't use connection pooling like PostgreSQL/MySQL
// The better-sqlite3 adapter handles connections differently - it's synchronous and
// uses a single connection per database file. We configure timeout for busy handling.
const getDatabaseConfig = () => {
  const env = process.env.NODE_ENV || 'development'

  // Environment-specific configurations - now using modular databaseConfig
  const configs = {
    development: {
      timeout: databaseConfig.timeouts.development,
    },
    production: {
      timeout: databaseConfig.timeouts.production,
    },
    test: {
      timeout: databaseConfig.timeouts.test,
    },
  }

  return configs[env as keyof typeof configs] || configs.development
}

const dbConfig = getDatabaseConfig()

// FIXED: Add retry logic and error handling for database connection
const MAX_RETRIES = databaseConfig.retries.maxAttempts

/**
 * Create Prisma client with retry logic and error handling
 * Prevents server crashes on database connection issues
 */
function createPrismaClient(): PrismaClient {
  let retries = 0

  const attemptConnection = (): PrismaClient => {
    try {
      const client = new PrismaClient({
        adapter: new PrismaBetterSqlite3({
          url: databaseConfig.paths.defaultDb,
          timeout: dbConfig.timeout,
        }),
      })

      // Log successful connection
      if (process.env.NODE_ENV !== 'test') {
        console.log(`${LOG_PREFIX} Prisma client initialized successfully`)
      }

      return client
    } catch (error) {
      retries++

      if (retries < MAX_RETRIES) {
        console.warn(
          `${LOG_PREFIX} Connection attempt ${retries} failed, retrying...`,
          error instanceof Error ? error.message : 'Unknown error'
        )

        // Return a proxy that will retry on first use
        return createRetryProxy(attemptConnection)
      }

      console.error(
        `${LOG_PREFIX} Failed to initialize Prisma client after retries:`,
        error
      )
      throw error
    }
  }

  return attemptConnection()
}

/**
 * Create a proxy that retries connection on first database operation
 * Handles connection errors gracefully to prevent server crashes
 */
function createRetryProxy(retryFn: () => PrismaClient): PrismaClient {
  let client: PrismaClient | null = null
  let connectionError: Error | null = null

  return new Proxy({} as unknown as PrismaClient, {
    get(target, prop: string | symbol) {
      if (!client && !connectionError) {
        try {
          client = retryFn()
        } catch (error) {
          connectionError =
            error instanceof Error ? error : new Error(String(error))
          console.error(
            '[Database] Connection failed after all retries:',
            connectionError
          )
          // Return a mock that throws on database operations
          return () => {
            throw new Error(
              `Database connection failed: ${connectionError?.message}`
            )
          }
        }
      }

      if (connectionError) {
        return () => {
          throw new Error(
            `Database connection failed: ${connectionError?.message}`
          )
        }
      }

      return (client as unknown as Record<string | symbol, unknown>)[prop]
    },
  })
}

export const prisma = global.__dbPrisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.__dbPrisma = prisma
}

/**
 * Health check function to verify database connectivity
 * Returns true if database is accessible, false otherwise
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Simple query to check connection
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error(`${LOG_PREFIX} Health check failed:`, error)
    return false
  }
}

/**
 * Graceful shutdown handler for Prisma client
 * Should be called when the server is shutting down
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect()
    console.log(`${LOG_PREFIX} Prisma client disconnected successfully`)
  } catch (error) {
    console.error(`${LOG_PREFIX} Error disconnecting Prisma client:`, error)
  }
}

// Query timeout configuration per environment
const getQueryTimeout = (): number => {
  const env = process.env.NODE_ENV || 'development'

  const timeouts = {
    development: databaseConfig.query.timeoutMs || 5000,
    production: databaseConfig.query.timeoutMs || 10000,
    test: 1000, // Always 1s for tests to fail fast
  }

  return timeouts[env as keyof typeof timeouts] || timeouts.development
}

const QUERY_TIMEOUT_MS = getQueryTimeout()

/**
 * Execute a database query with timeout protection
 * Prevents queries from hanging indefinitely during high load or lock contention
 *
 * @param queryFn - Function that returns a Promise (the database query)
 * @param timeoutMs - Optional custom timeout in milliseconds
 * @param operationName - Name of the operation for logging
 * @returns Promise with query result
 * @throws Error if query times out or fails
 */
export async function executeWithTimeout<T>(
  queryFn: () => Promise<T>,
  timeoutMs: number = QUERY_TIMEOUT_MS,
  operationName: string = 'database query'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        new Error(
          `Query timeout: ${operationName} exceeded ${timeoutMs}ms limit`
        )
      )
    }, timeoutMs)

    // Clean up timeout if query completes first
    return () => clearTimeout(timeoutId)
  })

  const startTime = Date.now()

  try {
    // Race between query and timeout
    const result = await Promise.race([queryFn(), timeoutPromise])

    const duration = Date.now() - startTime

    // Log slow queries for debugging (queries taking > 50% of timeout)
    if (duration > timeoutMs * 0.5) {
      console.warn(
        `${LOG_PREFIX} Slow query detected: ${operationName} took ${duration}ms (timeout: ${timeoutMs}ms)`
      )
    }

    return result
  } catch (error) {
    const duration = Date.now() - startTime

    if (error instanceof Error && error.message.includes('Query timeout')) {
      console.error(
        `${LOG_PREFIX} Query timed out after ${duration}ms: ${operationName}`
      )
      throw error
    }

    // Re-throw original error
    throw error
  }
}

export default prisma
