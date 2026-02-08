// server/plugins/analytics-cleanup.ts
import { defineNitroPlugin } from 'nitropack/runtime'
import logger from '~/utils/logger'
import { TIME_CONSTANTS } from '~/utils/constants'

export default defineNitroPlugin(async () => {
  logger.info('Analytics cleanup plugin initialized')

  // Dynamically import analytics cleanup only at runtime, not during build/prerendering
  try {
    const { runAnalyticsCleanup } = await import('../utils/analyticsCleanup')

    // Run cleanup once when the server starts
    await runAnalyticsCleanup().catch(error => {
      logger.error('Error during initial analytics cleanup', error)
    })

    // Set up periodic cleanup (every 24 hours)
    const cleanupInterval = setInterval(() => {
      logger.info('Running scheduled analytics cleanup...')
      runAnalyticsCleanup().catch(error => {
        logger.error('Error during scheduled analytics cleanup', error)
      })
    }, TIME_CONSTANTS.DAY_MS) // 24 hours

    // Clean up interval when Nitro shuts down
    process.on('SIGINT', () => {
      clearInterval(cleanupInterval)
      logger.info('Analytics cleanup interval cleared')
    })
  } catch (error) {
    logger.warn(
      'Analytics cleanup not available (likely during build/prerendering)',
      error
    )
  }
})
