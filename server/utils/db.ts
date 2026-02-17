import { PrismaClient } from '@prisma/client'
import { AsyncLocalStorage } from 'async_hooks'
import { databaseConfig } from '~/configs/database.config'
import { timeConfig } from '~/configs/time.config'

// Transaction context for nested transaction support
// Prevents deadlocks by reusing existing transactions instead of creating new ones
const transactionContext = new AsyncLocalStorage<typeof prisma>()

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

// SECURITY FIX #3650: Soft delete model names for validation
// These models have deletedAt field and should always be filtered
const SOFT_DELETE_MODEL_NAMES = [
  'AnalyticsEvent',
  'Webhook',
  'WebhookDelivery',
  'WebhookQueue',
  'DeadLetterWebhook',
  'ApiKey',
  'Resource',
  'Submission',
  'IdempotencyKey',
] as const

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

      // SECURITY FIX #3650: Add middleware to warn about raw queries bypassing soft deletes
      // This helps catch potential data leaks during development
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(baseClient as any).$use(
        async (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          params: { action: string; args: any },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          next: (params?: any) => Promise<unknown>
        ) => {
          // Check if this is a raw query on a soft-delete model
          if (params.action === 'queryRaw' || params.action === 'executeRaw') {
            const query = String(params.args?.query || params.args || '')
            const lowerQuery = query.toLowerCase()

            // Check if query references soft-delete tables without filtering
            for (const modelName of SOFT_DELETE_MODEL_NAMES) {
              const tableName = modelName.toLowerCase()
              if (
                lowerQuery.includes(`from ${tableName}`) ||
                lowerQuery.includes(`join ${tableName}`)
              ) {
                // Check if deletedAt filter is present
                if (!lowerQuery.includes('deletedat')) {
                  const warning = `[SECURITY WARNING] Raw query on ${modelName} missing deletedAt filter. Query: ${query.substring(0, 100)}...`
                  console.warn(warning)

                  // In strict mode, throw error
                  if (process.env.STRICT_SOFT_DELETE === 'true') {
                    throw new Error(
                      `Security violation: Raw query on ${modelName} must include deletedAt filter`
                    )
                  }
                }
              }
            }
          }

          return next(params)
        }
      )

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
        console.log(
          `${LOG_PREFIX} Prisma client initialized successfully with PostgreSQL and soft delete filtering`
        )
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
      console.warn(
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
      console.error(
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
 * Check if error is retryable (deadlock, lock timeout, etc.)
 */
function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()
  return (
    message.includes('deadlock') ||
    message.includes('lock timeout') ||
    message.includes('could not obtain lock') ||
    message.includes('concurrent') ||
    message.includes('transaction rollback')
  )
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
        console.warn(
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
        console.warn(
          `${LOG_PREFIX} Transaction ${operationName} failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delayMs}ms:`,
          lastError.message
        )
        await new Promise(resolve => setTimeout(resolve, delayMs))
        continue
      }

      // Log final failure
      console.error(
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
