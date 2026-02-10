import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { databaseConfig } from '~/configs/database.config'

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
          url: process.env.DATABASE_URL || 'file:./data/dev.db',
          timeout: dbConfig.timeout,
        }),
      })

      // Log successful connection
      if (process.env.NODE_ENV !== 'test') {
        console.log('[Database] Prisma client initialized successfully')
      }

      return client
    } catch (error) {
      retries++

      if (retries < MAX_RETRIES) {
        console.warn(
          `[Database] Connection attempt ${retries} failed, retrying...`,
          error instanceof Error ? error.message : 'Unknown error'
        )

        // Return a proxy that will retry on first use
        return createRetryProxy(attemptConnection)
      }

      console.error(
        '[Database] Failed to initialize Prisma client after retries:',
        error
      )
      throw error
    }
  }

  return attemptConnection()
}

/**
 * Create a proxy that retries connection on first database operation
 */
function createRetryProxy(retryFn: () => PrismaClient): PrismaClient {
  let client: PrismaClient | null = null

  return new Proxy({} as unknown as PrismaClient, {
    get(target, prop: string | symbol) {
      if (!client) {
        client = retryFn()
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
    console.error('[Database] Health check failed:', error)
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
    console.log('[Database] Prisma client disconnected successfully')
  } catch (error) {
    console.error('[Database] Error disconnecting Prisma client:', error)
  }
}

export default prisma
