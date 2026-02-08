import db from './db'
import { logger } from '~/utils/logger'

export async function cleanupOldAnalyticsEvents(daysToKeep: number = 90) {
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
  } catch (error) {
    // Handle case where AnalyticsEvent table doesn't exist (e.g., during build/prerender)
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('does not exist in the current database')) {
      logger.warn(
        'AnalyticsEvent table does not exist - skipping cleanup (database may not be migrated)'
      )
      return 0
    }
    logger.error('Error cleaning up old analytics events:', error)
    throw error
  }
}

export async function runAnalyticsCleanup() {
  const retentionDays = parseInt(process.env.ANALYTICS_RETENTION_DAYS || '90')

  if (retentionDays > 0) {
    await cleanupOldAnalyticsEvents(retentionDays)
  }
}
