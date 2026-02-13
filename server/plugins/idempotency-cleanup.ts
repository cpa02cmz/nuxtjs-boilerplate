// server/plugins/idempotency-cleanup.ts
// Scheduled cleanup for expired idempotency keys
import { logger } from '~/utils/logger'

export default defineNitroPlugin(async () => {
  // Only run cleanup in production or development (not during build/prerendering)
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'development'
  ) {
    logger.info('Idempotency key cleanup plugin initialized')

    // Dynamically import cleanup utility only at runtime
    try {
      const { runIdempotencyKeyCleanup } =
        await import('../utils/idempotency-cleanup')

      // Run cleanup once when the server starts
      await runIdempotencyKeyCleanup().catch(error => {
        logger.error('Error during initial idempotency key cleanup', error)
      })

      // Set up periodic cleanup (every 6 hours)
      // Using 6 hours as a balance between performance and data freshness
      const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000 // 6 hours

      const cleanupInterval = setInterval(() => {
        logger.info('Running scheduled idempotency key cleanup...')
        runIdempotencyKeyCleanup().catch(error => {
          logger.error('Error during scheduled idempotency key cleanup', error)
        })
      }, CLEANUP_INTERVAL_MS)

      // Cleanup on process exit
      process.on('SIGINT', () => {
        clearInterval(cleanupInterval)
        logger.info('Idempotency key cleanup interval cleared')
      })

      process.on('SIGTERM', () => {
        clearInterval(cleanupInterval)
        logger.info('Idempotency key cleanup interval cleared')
      })
    } catch (error) {
      logger.warn(
        'Idempotency key cleanup not available (likely during build/prerendering)',
        error
      )
    }
  }
})
