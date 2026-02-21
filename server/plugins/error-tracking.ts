import { logger } from '~/utils/logger'
import { createErrorTracker } from '~/server/utils/error-tracker'

interface NitroError extends Error {
  statusCode?: number
}

/**
 * Nitro plugin for server-side error tracking
 * Captures all unhandled errors from API routes and Nitro events
 */
export default defineNitroPlugin(nitroApp => {
  const errorTracker = createErrorTracker()

  // Track errors from API routes
  nitroApp.hooks.hook('error', async (error: NitroError, { event }) => {
    const url = event?.path || 'unknown'
    const method = event?.method || 'UNKNOWN'
    const ip =
      event?.node?.req?.headers['x-forwarded-for'] ||
      event?.node?.req?.socket?.remoteAddress ||
      'unknown'
    const userAgent = event?.node?.req?.headers['user-agent'] || 'unknown'

    logger.error(`[API Error] ${method} ${url}`, error, {
      ip,
      userAgent,
      stack: error.stack,
    })

    // Track error in database (async, don't block response)
    errorTracker
      .trackError({
        message: error.message || 'Unknown server error',
        // SECURITY (CWE-532): Omit stack traces in production to prevent information disclosure
        // Stack traces can leak internal paths, dependencies, and architecture details
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        source: 'server',
        severity:
          error.statusCode && error.statusCode >= 500 ? 'critical' : 'error',
        url: `${method} ${url}`,
        userAgent: typeof userAgent === 'string' ? userAgent : undefined,
        ip: typeof ip === 'string' ? ip : undefined,
      })
      .catch((err: Error) => {
        logger.error('Failed to track server error:', err)
      })
  })

  // Track request errors (4xx client errors)
  nitroApp.hooks.hook('request', async event => {
    const originalEnd = event.node.res.end.bind(event.node.res)

    event.node.res.end = function (...args: unknown[]) {
      const statusCode = event.node.res.statusCode

      // Track 4xx/5xx errors
      if (statusCode >= 400) {
        const url = event.path
        const method = event.method
        const ip =
          event.node.req.headers['x-forwarded-for'] ||
          event.node.req.socket?.remoteAddress ||
          'unknown'
        const userAgent = event.node.req.headers['user-agent'] || 'unknown'

        const severity = statusCode >= 500 ? 'critical' : 'warning'

        errorTracker
          .trackError({
            message: `HTTP ${statusCode} error`,
            source: 'api',
            severity,
            url: `${method} ${url}`,
            userAgent: typeof userAgent === 'string' ? userAgent : undefined,
            ip: typeof ip === 'string' ? ip : undefined,
          })
          .catch((err: Error) => {
            logger.error('Failed to track API error:', err)
          })
      }

      return originalEnd(...(args as unknown as Parameters<typeof originalEnd>))
    }
  })

  logger.info('[Error Tracking] Server-side error tracking initialized')
})
