// server/plugins/database-health.ts
import { defineNitroPlugin } from 'nitropack/runtime'
import { databaseConfig } from '~/configs/database.config'
import { timeConfig } from '~/configs/time.config'
import logger from '~/utils/logger'

/**
 * Database health check plugin
 * Validates database connectivity during server startup
 * Fails fast with clear error messages if database is unreachable
 * BUGFIXER FIX #3471: Added startup timeout to prevent indefinite blocking
 */
export default defineNitroPlugin(async () => {
  const LOG_PREFIX = databaseConfig.logging.prefix
  const MAX_RETRIES = databaseConfig.retries.maxAttempts
  const INITIAL_RETRY_DELAY_MS = timeConfig.retry.baseDelayMs
  const MAX_RETRY_DELAY_MS = timeConfig.retry.maxDelayMs

  // BUGFIXER FIX #3471: Add startup timeout to prevent indefinite blocking
  // This ensures server can start even if database is slow/unresponsive
  const STARTUP_TIMEOUT_MS = parseInt(
    process.env.DB_STARTUP_TIMEOUT_MS || '30000'
  ) // 30 second default

  /**
   * Sleep for specified milliseconds
   */
  const sleep = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms))

  /**
   * Calculate exponential backoff delay
   * Flexy hates hardcoded 2! Using timeConfig.retry.exponentialBase
   */
  const getRetryDelay = (attempt: number): number => {
    const delay =
      INITIAL_RETRY_DELAY_MS *
      Math.pow(timeConfig.retry.exponentialBase, attempt)
    return Math.min(delay, MAX_RETRY_DELAY_MS)
  }

  /**
   * Attempt to connect to database with retry logic
   */
  const validateDatabaseConnection = async (
    attempt: number = 0
  ): Promise<boolean> => {
    try {
      // Dynamically import db to avoid build-time issues
      const { checkDatabaseHealth } = await import('../utils/db')
      const isHealthy = await checkDatabaseHealth()

      if (isHealthy) {
        logger.info(`${LOG_PREFIX} Database connection validated successfully`)
        return true
      }

      throw new Error('Health check returned false')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'

      if (attempt < MAX_RETRIES - 1) {
        const delay = getRetryDelay(attempt)
        logger.warn(
          `${LOG_PREFIX} Database connection attempt ${attempt + 1}/${MAX_RETRIES} failed: ${errorMessage}. Retrying in ${delay}ms...`
        )
        await sleep(delay)
        return validateDatabaseConnection(attempt + 1)
      }

      logger.error(
        `${LOG_PREFIX} Database connection failed after ${MAX_RETRIES} attempts: ${errorMessage}`
      )
      return false
    }
  }

  logger.info(`${LOG_PREFIX} Validating database connection...`)

  // Skip validation during build/prerender
  if (process.env.NODE_ENV === 'prerender' || process.env.NITRO_PRERENDER) {
    logger.info(
      `${LOG_PREFIX} Skipping database validation during build/prerender`
    )
    return
  }

  // BUGFIXER FIX #3471: Wrap connection validation in timeout to prevent blocking
  // This ensures server startup is not indefinitely delayed by database issues
  let isConnected: boolean
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(
            `Database health check timed out after ${STARTUP_TIMEOUT_MS}ms`
          )
        )
      }, STARTUP_TIMEOUT_MS)
    })

    // Race between connection validation and timeout
    isConnected = await Promise.race([
      validateDatabaseConnection(),
      timeoutPromise,
    ])
  } catch (timeoutError) {
    logger.error(
      `${LOG_PREFIX} ${timeoutError instanceof Error ? timeoutError.message : 'Database health check timeout'}`
    )
    isConnected = false
  }

  if (!isConnected) {
    const errorMessage = `Failed to connect to database after ${MAX_RETRIES} attempts (timeout: ${STARTUP_TIMEOUT_MS}ms). Please check your DATABASE_URL environment variable and ensure the database is accessible.`
    logger.error(`${LOG_PREFIX} ${errorMessage}`)

    // In production, fail fast to prevent serving requests without database
    if (process.env.NODE_ENV === 'production') {
      throw new Error(errorMessage)
    } else {
      // In development, log warning but continue (better DX)
      logger.warn(
        `${LOG_PREFIX} Continuing without database connection (development mode)`
      )
    }
  } else {
    logger.info(
      `${LOG_PREFIX} Database health check passed - server ready to accept requests`
    )
  }
})
