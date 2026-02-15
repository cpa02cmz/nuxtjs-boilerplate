import { prisma, executeTransaction } from './db'
import { logger } from '~/utils/logger'
import { limitsConfig } from '~/configs/limits.config'
import { databaseConfig } from '~/configs/database.config'

export interface ErrorTrackingPayload {
  message: string
  stack?: string
  component?: string
  severity?: 'info' | 'warning' | 'error' | 'critical'
  url?: string
  userAgent?: string
  ip?: string
  source?: 'client' | 'server' | 'api'
}

/**
 * Creates a simple hash for error deduplication
 * Combines message (first N chars) and stack trace (first N chars)
 * Flexy loves modularity! Limits are now configurable.
 */
function createErrorHash(message: string, stack?: string): string {
  const messageMaxLength = limitsConfig.errorTracking.messageMaxLength
  const stackMaxLength = limitsConfig.errorTracking.stackMaxLength
  const normalizedMessage = message
    .slice(0, messageMaxLength)
    .toLowerCase()
    .trim()
  const normalizedStack = stack ? stack.slice(0, stackMaxLength) : ''
  const combined = `${normalizedMessage}|${normalizedStack}`

  // Simple hash function
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString(16)
}

/**
 * Error tracker for server-side error tracking
 * Provides deduplication and aggregation capabilities
 */
export function createErrorTracker() {
  return {
    /**
     * Track an error with automatic deduplication
     */
    async trackError(payload: ErrorTrackingPayload): Promise<void> {
      try {
        const severity = payload.severity || 'error'
        const source = payload.source || 'server'
        const errorHash = createErrorHash(payload.message, payload.stack)

        // Wrap all database operations in a transaction with retry logic
        await executeTransaction(
          async tx => {
            // Check for existing unresolved error with same hash
            const existingError = await tx.trackedError.findFirst({
              where: {
                errorHash,
                resolvedAt: null,
              },
            })

            if (existingError) {
              // Increment occurrence count
              await tx.trackedError.update({
                where: { id: existingError.id },
                data: {
                  occurrenceCount: { increment: 1 },
                  lastSeenAt: new Date(),
                },
              })
              logger.debug(
                `[ErrorTracker] Incremented count for existing error: ${errorHash}`
              )
            } else {
              // Create new error entry
              await tx.trackedError.create({
                data: {
                  message: payload.message,
                  stack: payload.stack,
                  component: payload.component,
                  severity,
                  url: payload.url,
                  userAgent: payload.userAgent,
                  ip: payload.ip,
                  source,
                  errorHash,
                  occurrenceCount: 1,
                },
              })
              logger.info(
                `[ErrorTracker] Created new error entry: ${errorHash}`
              )
            }
          },
          // Flexy hates hardcoded values! Using config for transaction options
          {
            timeout: databaseConfig.transaction.errorTracking.timeoutMs,
            maxRetries: databaseConfig.transaction.errorTracking.maxRetries,
          },
          'trackError'
        )

        // Update error metrics (outside transaction for performance)
        await updateErrorMetrics(severity, source)
      } catch (err) {
        logger.error('[ErrorTracker] Failed to track error:', err)
        // Don't throw - error tracking should never break the app
      }
    },

    /**
     * Get error statistics
     */
    async getErrorStats(timeRange: { start: Date; end: Date }) {
      try {
        const [totalErrors, errorsBySeverity, recentErrors] = await Promise.all(
          [
            prisma.trackedError.count({
              where: {
                firstSeenAt: { gte: timeRange.start, lte: timeRange.end },
                resolvedAt: null,
              },
            }),
            prisma.trackedError.groupBy({
              by: ['severity'],
              where: {
                firstSeenAt: { gte: timeRange.start, lte: timeRange.end },
                resolvedAt: null,
              },
              _count: { id: true },
            }),
            prisma.trackedError.findMany({
              where: {
                resolvedAt: null,
              },
              orderBy: { lastSeenAt: 'desc' },
              take: limitsConfig.errorTracking.recentErrorsLimit,
              select: {
                id: true,
                message: true,
                severity: true,
                source: true,
                occurrenceCount: true,
                lastSeenAt: true,
              },
            }),
          ]
        )

        return {
          totalErrors,
          errorsBySeverity: errorsBySeverity.reduce(
            (acc, curr) => {
              acc[curr.severity] = curr._count.id
              return acc
            },
            {} as Record<string, number>
          ),
          recentErrors,
        }
      } catch (err) {
        logger.error('[ErrorTracker] Failed to get error stats:', err)
        return null
      }
    },

    /**
     * Mark errors as resolved
     */
    async resolveErrors(errorIds: string[]): Promise<void> {
      try {
        await prisma.trackedError.updateMany({
          where: { id: { in: errorIds } },
          data: { resolvedAt: new Date() },
        })
        logger.info(`[ErrorTracker] Resolved ${errorIds.length} errors`)
      } catch (err) {
        logger.error('[ErrorTracker] Failed to resolve errors:', err)
        throw err
      }
    },
  }
}

/**
 * Validates error metric parameters to prevent constraint violations
 * Ensures all required fields are present and valid before database operation
 */
function validateErrorMetricParams(
  severity: string,
  source: string
): { isValid: boolean; error?: string } {
  // Validate severity - must be one of the allowed values
  const validSeverities = ['info', 'warning', 'error', 'critical']
  if (!validSeverities.includes(severity)) {
    return {
      isValid: false,
      error: `Invalid severity: ${severity}. Must be one of: ${validSeverities.join(', ')}`,
    }
  }

  // Validate source - must be non-empty string
  if (!source || typeof source !== 'string' || source.trim().length === 0) {
    return {
      isValid: false,
      error: `Invalid source: ${source}. Must be a non-empty string.`,
    }
  }

  // Validate source length - prevent database constraint issues
  if (source.length > 50) {
    return {
      isValid: false,
      error: `Source too long: ${source.length} characters (max 50).`,
    }
  }

  return { isValid: true }
}

/**
 * Update hourly error metrics
 * Includes application-level validation to prevent unique constraint violations
 */
async function updateErrorMetrics(
  severity: string,
  source: string
): Promise<void> {
  try {
    // Application-level validation before database operation
    const validation = validateErrorMetricParams(severity, source)
    if (!validation.isValid) {
      logger.warn(
        `[ErrorTracker] Metric validation failed: ${validation.error}`
      )
      return
    }

    const now = new Date()
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const hour = now.getHours()

    await prisma.errorMetric.upsert({
      where: {
        date_hour_severity_source: {
          date,
          hour,
          severity,
          source,
        },
      },
      update: {
        count: { increment: 1 },
      },
      create: {
        date,
        hour,
        severity,
        source,
        count: 1,
      },
    })
  } catch (err) {
    // Handle specific Prisma errors for better debugging
    if (err instanceof Error) {
      if (err.message.includes('Unique constraint failed')) {
        logger.warn(
          `[ErrorTracker] Unique constraint violation on ErrorMetric (race condition). This is typically harmless.`
        )
      } else {
        logger.error('[ErrorTracker] Failed to update metrics:', err.message)
      }
    } else {
      logger.error('[ErrorTracker] Failed to update metrics:', err)
    }
  }
}
