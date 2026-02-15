// server/plugins/analytics-cleanup.ts
import { defineNitroPlugin } from 'nitropack/runtime'
import logger from '~/utils/logger'
import { TIME } from '../utils/constants'

export default defineNitroPlugin(async () => {
  logger.info('Analytics cleanup plugin initialized')

  // Skip during build/prerendering - no database available
  if (process.env.NUXT_BUILD || process.env.NITRO_PRERENDER) {
    logger.info('Skipping analytics cleanup during build/prerender')
    return
  }

  // Dynamically import analytics cleanup only at runtime
  try {
    const { runAnalyticsCleanup } = await import('../utils/analyticsCleanup')

    // Run cleanup once when the server starts
    await runAnalyticsCleanup().catch(error => {
      logger.error('Error during initial analytics cleanup', error)
    })

    // Set up periodic cleanup (every 24 hours) - Flexy uses TIME constants!
    const cleanupInterval = setInterval(() => {
      logger.info('Running scheduled analytics cleanup...')
      runAnalyticsCleanup().catch(error => {
        logger.error('Error during scheduled analytics cleanup', error)
      })
    }, TIME.MS_PER_DAY) // 24 hours

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
