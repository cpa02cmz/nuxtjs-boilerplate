import { PrismaClient } from '@prisma/client'
import { AsyncLocalStorage } from 'async_hooks'
import { databaseConfig } from '~/configs/database.config'
import { timeConfig } from '~/configs/time.config'
import { logger } from '~/utils/logger'

// Transaction context for nested transaction support
// Prevents deadlocks by reusing existing transactions instead of creating new ones
// -architect: Use PrismaClient type instead of typeof prisma to avoid forward reference fragility
const transactionContext = new AsyncLocalStorage<PrismaClient>()

// Flexy hates hardcoded values! Using config for log prefix
const LOG_PREFIX = databaseConfig.logging.prefix

// Models that support soft deletes (have deletedAt field)
const SOFT_DELETE_MODELS = [
  'analyticsEvent',
  'webhook',
  'webhookDelivery',
  'webhookQueue',
  'deadLetterWebhook',
  'apiKey',
  'resource',
  'submission',
  'idempotencyKey',
] as const

declare global {
  var __dbPrisma: PrismaClient | undefined
}

// FIXED: Add retry logic and error handling for database connection
const MAX_RETRIES = databaseConfig.retries.maxAttempts

/**
 * Create Prisma client with retry logic, error handling, and soft delete filtering
 * Prevents server crashes on database connection issues
 * Automatically filters out soft-deleted records (deletedAt != null)
 */
function createPrismaClient(): PrismaClient {
  let retries = 0

  const attemptConnection = (): PrismaClient => {
    try {
      // Create base Prisma client
      const baseClient = new PrismaClient({
        log:
          process.env.NODE_ENV === 'development'
            ? ['query', 'info', 'warn', 'error']
            : ['error'],
      })

      // Extend client with soft delete filtering
      const client = baseClient.$extends({
        query: {
          $allModels: {
            async findMany({ model, args, query }) {
              if (
                SOFT_DELETE_MODELS.includes(
                  model as (typeof SOFT_DELETE_MODELS)[number]
                )
              ) {
                args = args || {}
                args.where = { ...args.where, deletedAt: null }
              }
              return query(args)
            },
            async findFirst({ model, args, query }) {
              if (
                SOFT_DELETE_MODELS.includes(
                  model as (typeof SOFT_DELETE_MODELS)[number]
                )
              ) {
                args = args || {}
                args.where = { ...args.where, deletedAt: null }
              }
              return query(args)
            },
            async findUnique({ model, args, query }) {
              if (
                SOFT_DELETE_MODELS.includes(
                  model as (typeof SOFT_DELETE_MODELS)[number]
                )
              ) {
                args = args || {}
                const argsRecord = args as Record<string, unknown>
                const whereRecord =
                  (argsRecord.where as Record<string, unknown>) || {}
                argsRecord.where = { ...whereRecord, deletedAt: null }
              }
              return query(args)
            },
            async count({ model, args, query }) {
              if (
                SOFT_DELETE_MODELS.includes(
                  model as (typeof SOFT_DELETE_MODELS)[number]
                )
              ) {
                args = args || {}
                args.where = { ...args.where, deletedAt: null }
              }
              return query(args)
            },
          },
        },
      }) as unknown as PrismaClient

      // Log successful connection
      if (process.env.NODE_ENV !== 'test') {
        logger.info(
          `${LOG_PREFIX} Prisma client initialized successfully with PostgreSQL and soft delete filtering`
        )
      }

      return client
    } catch (error) {
      retries++

      if (retries < MAX_RETRIES) {
        logger.warn(
          `${LOG_PREFIX} Connection attempt ${retries} failed, retrying...`,
          error instanceof Error ? error.message : 'Unknown error'
        )

        // Return a proxy that will retry on first use
        return createRetryProxy(attemptConnection)
      }

      logger.error(
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
          logger.error(
            '[Database] Connection failed after all retries:',
            connectionError
          )
          // FIX #3467: Let the if (connectionError) block below handle this consistently
          // Fall through to the connectionError handling logic
        }
      }

      if (connectionError) {
        const value = (client as unknown as Record<string | symbol, unknown>)[
          prop
        ]
        if (typeof value === 'function') {
          return () => {
            throw new Error(
              `Database connection failed: ${connectionError?.message}`
            )
          }
        }
        throw new Error(
          `Database connection failed: ${connectionError?.message}`
        )
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
 * Issue #3306 fix - Added timeout to prevent indefinite hang
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  // Flexy hates hardcoded 5000! Using databaseConfig.healthCheck.timeoutMs
  const HEALTH_CHECK_TIMEOUT = databaseConfig.healthCheck.timeoutMs

  try {
    // SECURITY FIX: Use hardcoded safe query instead of config to prevent injection
    // The health check query should never be dynamic or user-modifiable
    const healthCheck = prisma.$queryRaw`SELECT 1`
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('Health check timeout')),
        HEALTH_CHECK_TIMEOUT
      )
    )

    await Promise.race([healthCheck, timeout])
    return true
  } catch (error) {
    logger.error(`${LOG_PREFIX} Health check failed:`, error)
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
    logger.info(`${LOG_PREFIX} Prisma client disconnected successfully`)
  } catch (error) {
    logger.error(`${LOG_PREFIX} Error disconnecting Prisma client:`, error)
  }
}

// Query timeout configuration per environment
// Flexy hates hardcoded 5000 and 10000! Using config values instead.
const getQueryTimeout = (): number => {
  const env = process.env.NODE_ENV || 'development'

  const timeouts = {
    development: databaseConfig.timeouts.development,
    production: databaseConfig.timeouts.production,
    test: databaseConfig.timeouts.test, // Use config value for tests to fail fast
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
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new Error(
          `Query timeout: ${operationName} exceeded ${timeoutMs}ms limit`
        )
      )
    }, timeoutMs)
  })

  const startTime = Date.now()

  try {
    // Race between query and timeout
    const result = await Promise.race([queryFn(), timeoutPromise])
    // Clear timeout if query completed first to prevent memory leak
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    const duration = Date.now() - startTime

    // Log slow queries for debugging (queries taking > configured threshold of timeout)
    // Flexy hates hardcoded 0.5! Using configurable threshold from databaseConfig
    if (
      duration >
      timeoutMs * databaseConfig.performance.slowQueryThresholdMultiplier
    ) {
      logger.warn(
        `${LOG_PREFIX} Slow query detected: ${operationName} took ${duration}ms (timeout: ${timeoutMs}ms)`
      )
    }

    return result
  } catch (error) {
    // Clear timeout on error to prevent memory leak
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    const duration = Date.now() - startTime

    if (error instanceof Error && error.message.includes('Query timeout')) {
      logger.error(
        `${LOG_PREFIX} Query timed out after ${duration}ms: ${operationName}`
      )
      throw error
    }

    // Re-throw original error
    throw error
  }
}

/**
 * Transaction configuration options
 */
export interface TransactionOptions {
  maxWait?: number
  timeout?: number
  isolationLevel?: 'ReadCommitted' | 'RepeatableRead' | 'Serializable'
  maxRetries?: number
  retryDelayMs?: number
}

/**
 * Default transaction options - Flexy hates hardcoded values!
 * All transaction settings now come from database.config.ts
 */
const DEFAULT_TRANSACTION_OPTIONS: TransactionOptions = {
  maxWait: databaseConfig.transaction.maxWaitMs,
  timeout: databaseConfig.transaction.timeoutMs,
  isolationLevel: databaseConfig.transaction.isolationLevel,
  maxRetries: databaseConfig.transaction.maxRetries,
  retryDelayMs: databaseConfig.transaction.retryDelayMs,
}

/**
 * PostgreSQL error codes that indicate transient/retryable errors
 * -architect: Added comprehensive error code detection for better retry handling
 * -architect: Added 08006 connection_failure for network resilience
 * @see https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
const POSTGRESQL_RETRYABLE_CODES = {
  // Class 08 - Connection Exception
  '08006': 'connection_failure', // -architect: Common during temporary network issues
  // Class 40 - Transaction Rollback
  '40001': 'serialization_failure',
  '40003': 'statement_completion_unknown',
  '40P01': 'deadlock_detected',
  // Class 53 - Insufficient Resources
  '53000': 'insufficient_resources',
  '53100': 'disk_full',
  '53200': 'out_of_memory',
  '53300': 'too_many_connections',
  '53400': 'configuration_limit_exceeded',
  // Class 57 - Operator Intervention
  '57000': 'operator_intervention',
  '57014': 'query_canceled',
  '57P01': 'admin_shutdown',
  '57P02': 'crash_shutdown',
  '57P03': 'cannot_connect_now',
  '57P04': 'database_dropped',
  // Class 58 - System Error
  '58000': 'system_error',
  '58030': 'io_error',
  '58P01': 'undefined_file',
  '58P02': 'duplicate_file',
} as const

/**
 * Prisma error codes that indicate transient/retryable errors
 * -architect: Added Prisma-specific error codes for comprehensive handling
 * @see https://www.prisma.io/docs/reference/api-reference/error-reference
 */
const PRISMA_RETRYABLE_CODES = {
  P2024: 'timed_out', // Connection timed out
  P2034: 'transaction_conflict', // Transaction write conflict or deadlock
  P2037: 'transaction_exceeded_retry_limit', // Transaction was retried too many times
  P1001: 'cannot_reach_database_server', // Can't reach database server
  P1002: 'database_server_connection_timeout', // Connection to database server timed out
  P1008: 'operations_timed_out', // Operations timed out
  P1017: 'server_closed_connection', // Server has closed the connection
} as const

/**
 * Check if error is retryable (deadlock, lock timeout, connection issues, etc.)
 * -architect: Enhanced to detect PostgreSQL and Prisma error codes in addition to message patterns
 */
function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()

  // Check for message-based patterns (existing behavior)
  const isRetryableMessage =
    message.includes('deadlock') ||
    message.includes('lock timeout') ||
    message.includes('could not obtain lock') ||
    message.includes('concurrent') ||
    message.includes('transaction rollback')

  if (isRetryableMessage) return true

  // -architect: Check for PostgreSQL error codes in message
  for (const code of Object.keys(POSTGRESQL_RETRYABLE_CODES)) {
    if (message.includes(code)) return true
  }

  // -architect: Check for Prisma error codes in message
  for (const code of Object.keys(PRISMA_RETRYABLE_CODES)) {
    if (message.includes(code)) return true
  }

  // -architect: Check error code property (Prisma errors have a code field)
  const errorWithCode = error as { code?: string }
  if (errorWithCode.code) {
    const code = errorWithCode.code
    if (code in POSTGRESQL_RETRYABLE_CODES || code in PRISMA_RETRYABLE_CODES) {
      return true
    }
  }

  return false
}

/**
 * Execute a transaction with proper configuration and retry logic
 * Handles deadlocks, lock timeouts, and other transient errors
 *
 * @param operation - Transaction operation function
 * @param options - Transaction configuration options
 * @param operationName - Name for logging/debugging
 * @returns Promise with transaction result
 */
export async function executeTransaction<T>(
  operation: (tx: typeof prisma) => Promise<T>,
  options: TransactionOptions = {},
  operationName: string = 'database transaction'
): Promise<T> {
  // Check if already in a transaction context - prevents nested transaction deadlocks
  const existingTx = transactionContext.getStore()
  if (existingTx) {
    // Reuse existing transaction to avoid deadlock
    return await operation(existingTx)
  }

  const config = { ...DEFAULT_TRANSACTION_OPTIONS, ...options }
  const { maxRetries, retryDelayMs, ...prismaOptions } = config

  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries!; attempt++) {
    try {
      const startTime = Date.now()

      const result = await prisma.$transaction(
        async tx => {
          // Store transaction in context for nested calls
          return await transactionContext.run(tx as typeof prisma, () =>
            operation(tx as typeof prisma)
          )
        },
        prismaOptions as {
          maxWait?: number
          timeout?: number
          isolationLevel?: 'ReadCommitted' | 'RepeatableRead' | 'Serializable'
        }
      )

      const duration = Date.now() - startTime

      // Log slow transactions
      // Flexy hates hardcoded values! Using configurable timeout and threshold from databaseConfig
      if (
        duration >
        (prismaOptions.timeout || databaseConfig.transaction.timeoutMs) *
          databaseConfig.performance.slowTransactionThresholdMultiplier
      ) {
        logger.warn(
          `${LOG_PREFIX} Slow transaction detected: ${operationName} took ${duration}ms`
        )
      }

      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if error is retryable
      if (isRetryableError(lastError) && attempt < maxRetries! - 1) {
        const delayMs =
          (retryDelayMs || timeConfig.retry.baseDelayMs) *
          Math.pow(timeConfig.retry.exponentialBase, attempt)
        logger.warn(
          `${LOG_PREFIX} Transaction ${operationName} failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delayMs}ms:`,
          lastError.message
        )
        await new Promise(resolve => setTimeout(resolve, delayMs))
        continue
      }

      // Log final failure
      logger.error(
        `${LOG_PREFIX} Transaction ${operationName} failed after ${attempt + 1} attempts:`
      )
      throw lastError
    }
  }

  throw (
    lastError ||
    new Error(`Transaction ${operationName} failed after ${maxRetries} retries`)
  )
}

export default prisma
