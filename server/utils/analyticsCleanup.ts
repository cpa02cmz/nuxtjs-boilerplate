import db from './db'
import { logger } from '~/utils/logger'
import { analyticsConfig } from '~/configs/analytics.config'

// Validation constants for analytics retention - Flexy hates hardcoded values!
// Using configurable values from analyticsConfig
const MIN_RETENTION_DAYS = analyticsConfig.dateRange.minDays
const MAX_RETENTION_DAYS = analyticsConfig.dateRange.maxDays
const DEFAULT_RETENTION_DAYS = analyticsConfig.dateRange.defaultDays

/**
 * Validates retention days parameter
 * @throws Error if validation fails
 */
function validateRetentionDays(days: number): void {
  if (!Number.isInteger(days)) {
    throw new Error(
      `Retention days must be an integer, received: ${days} (${typeof days})`
    )
  }

  if (days < MIN_RETENTION_DAYS) {
    throw new Error(
      `Retention days must be at least ${MIN_RETENTION_DAYS} days, received: ${days}`
    )
  }

  if (days > MAX_RETENTION_DAYS) {
    throw new Error(
      `Retention days cannot exceed ${MAX_RETENTION_DAYS} days, received: ${days}`
    )
  }
}

/**
 * Parses and validates retention days from environment variable
 */
function parseRetentionDaysFromEnv(): number {
  const envValue = process.env.ANALYTICS_RETENTION_DAYS

  if (!envValue) {
    return DEFAULT_RETENTION_DAYS
  }

  const parsed = parseInt(envValue, 10)

  if (isNaN(parsed)) {
    logger.warn(
      `Invalid ANALYTICS_RETENTION_DAYS value: "${envValue}". Using default: ${DEFAULT_RETENTION_DAYS}`
    )
    return DEFAULT_RETENTION_DAYS
  }

  try {
    validateRetentionDays(parsed)
    return parsed
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.warn(`${message}. Using default: ${DEFAULT_RETENTION_DAYS}`)
    return DEFAULT_RETENTION_DAYS
  }
}

export async function cleanupOldAnalyticsEvents(
  daysToKeep: number = DEFAULT_RETENTION_DAYS
) {
  // Validate input parameter
  try {
    validateRetentionDays(daysToKeep)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(`Analytics cleanup validation failed: ${message}`)
    throw error
  }

  if (!db || !db.analyticsEvent) {
    logger.warn('Database not available - skipping analytics cleanup')
    return 0
  }

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
  const deletedAt = new Date()

  try {
    const result = await db.analyticsEvent.updateMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
        deletedAt: null,
      },
      data: {
        deletedAt,
      },
    })

    logger.info(`Soft-deleted ${result.count} old analytics events`)
    return result.count
  } catch (error: unknown) {
    // Check if the error is due to missing table (common during build/prerender)
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (
      errorMessage.includes('does not exist') ||
      (typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2021')
    ) {
      logger.warn(
        'AnalyticsEvent table not found - skipping cleanup (likely during build)'
      )
      return 0
    }
    logger.error('Error cleaning up old analytics events:', error)
    throw error
  }
}

export async function runAnalyticsCleanup() {
  const retentionDays = parseRetentionDaysFromEnv()

  logger.info(
    `Running analytics cleanup with retention period: ${retentionDays} days`
  )

  const deletedCount = await cleanupOldAnalyticsEvents(retentionDays)

  logger.info(
    `Analytics cleanup completed. Deleted ${deletedCount} events older than ${retentionDays} days`
  )

  return deletedCount
}
