import { PrismaClient } from '@prisma/client'
import { logger } from '~/utils/logger'

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
 * Combines message (first 100 chars) and stack trace (first 200 chars)
 */
function createErrorHash(message: string, stack?: string): string {
  const normalizedMessage = message.slice(0, 100).toLowerCase().trim()
  const normalizedStack = stack ? stack.slice(0, 200) : ''
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
  const prisma = new PrismaClient()

  return {
    /**
     * Track an error with automatic deduplication
     */
    async trackError(payload: ErrorTrackingPayload): Promise<void> {
      try {
        const severity = payload.severity || 'error'
        const source = payload.source || 'server'
        const errorHash = createErrorHash(payload.message, payload.stack)

        // Check for existing unresolved error with same hash
        const existingError = await prisma.trackedError.findFirst({
          where: {
            errorHash,
            resolvedAt: null,
          },
        })

        if (existingError) {
          // Increment occurrence count
          await prisma.trackedError.update({
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
          await prisma.trackedError.create({
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
          logger.info(`[ErrorTracker] Created new error entry: ${errorHash}`)
        }

        // Update error metrics
        await updateErrorMetrics(prisma, severity, source)
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
              take: 10,
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
 * Update hourly error metrics
 */
async function updateErrorMetrics(
  prisma: PrismaClient,
  severity: string,
  source: string
): Promise<void> {
  try {
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
    logger.error('[ErrorTracker] Failed to update metrics:', err)
  }
}
