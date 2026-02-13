import { prisma } from './db'
import { logger } from '~/utils/logger'
import { webhooksConfig } from '~/configs/webhooks.config'

/**
 * Configuration for idempotency key cleanup
 * Keys are cleaned up after their expiration time or after a default TTL
 * Values are read from webhooksConfig to ensure consistency

/**
 * Cleanup expired idempotency keys from the database
 * Removes keys where expiresAt has passed or keys older than TTL
 *
 * @param maxAgeDays - Maximum age in days for non-expiring keys (uses config default)
 * @returns Object containing cleanup statistics
 */
export async function cleanupExpiredIdempotencyKeys(
  maxAgeDays: number = webhooksConfig.idempotency.defaultTtlDays
): Promise<{
  deletedCount: number
  error?: string
}> {
  try {
    const now = new Date()
    const maxAgeDate = new Date(
      now.getTime() - maxAgeDays * 24 * 60 * 60 * 1000
    )

    // Delete keys that:
    // 1. Have an explicit expiresAt that has passed, OR
    // 2. Were created before the max age and have no expiresAt
    const result = await prisma.idempotencyKey.deleteMany({
      where: {
        OR: [
          {
            expiresAt: {
              lt: now,
            },
          },
          {
            AND: [
              { expiresAt: null },
              {
                createdAt: {
                  lt: maxAgeDate,
                },
              },
            ],
          },
        ],
      },
    })

    const deletedCount = result.count

    if (deletedCount > 0) {
      logger.info(
        `[IdempotencyCleanup] Cleaned up ${deletedCount} expired idempotency keys (max age: ${maxAgeDays} days)`
      )
    }

    return { deletedCount }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    logger.error('[IdempotencyCleanup] Failed to cleanup expired keys:', error)
    return {
      deletedCount: 0,
      error: errorMessage,
    }
  }
}

/**
 * Get statistics about idempotency keys in the database
 * Useful for monitoring and debugging
 */
export async function getIdempotencyKeyStats(): Promise<{
  totalCount: number
  expiredCount: number
  expiringSoonCount: number
}> {
  try {
    const now = new Date()
    const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours from now

    const [totalCount, expiredCount, expiringSoonCount] = await Promise.all([
      prisma.idempotencyKey.count({
        where: { deletedAt: null },
      }),
      prisma.idempotencyKey.count({
        where: {
          deletedAt: null,
          expiresAt: {
            lt: now,
          },
        },
      }),
      prisma.idempotencyKey.count({
        where: {
          deletedAt: null,
          expiresAt: {
            gte: now,
            lte: soon,
          },
        },
      }),
    ])

    return {
      totalCount,
      expiredCount,
      expiringSoonCount,
    }
  } catch (error) {
    logger.error('[IdempotencyCleanup] Failed to get stats:', error)
    return {
      totalCount: 0,
      expiredCount: 0,
      expiringSoonCount: 0,
    }
  }
}

/**
 * Run complete idempotency key cleanup routine
 * This function is designed to be called periodically (e.g., via a cron job or scheduled task)
 *
 * @param retentionDays - How many days to retain idempotency keys
 */
export async function runIdempotencyKeyCleanup(
  retentionDays: number = webhooksConfig.idempotency.defaultTtlDays
): Promise<void> {
  try {
    logger.info(
      `[IdempotencyCleanup] Starting cleanup (retention: ${retentionDays} days)...`
    )

    // Get stats before cleanup
    const beforeStats = await getIdempotencyKeyStats()
    logger.info(`[IdempotencyCleanup] Stats before cleanup:`, beforeStats)

    // Perform cleanup
    const { deletedCount, error } =
      await cleanupExpiredIdempotencyKeys(retentionDays)

    if (error) {
      logger.error(
        `[IdempotencyCleanup] Cleanup completed with errors: ${error}`
      )
    } else {
      logger.info(
        `[IdempotencyCleanup] Cleanup completed successfully. Removed ${deletedCount} keys.`
      )
    }

    // Get stats after cleanup
    const afterStats = await getIdempotencyKeyStats()
    logger.info(`[IdempotencyCleanup] Stats after cleanup:`, afterStats)
  } catch (error) {
    logger.error('[IdempotencyCleanup] Cleanup routine failed:', error)
  }
}
