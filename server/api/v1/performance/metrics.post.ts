import { defineEventHandler, createError } from 'h3'
import { storePerformanceMetric } from '~/server/utils/performance-metrics'
import { transformWebVitalsReport } from '~/types/performance'
import logger from '~/utils/logger'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { performanceMetricsBodySchema } from '~/server/utils/validation-schemas'
import { validateRequestBody } from '~/server/utils/validation-utils'

/**
 * POST /api/v1/performance/metrics
 * Store performance metrics
 *
 * Body:
 * - metric: WebVitalsMetric
 * - timestamp: string
 * - url: string
 * - userAgent: string
 * - connection?: string
 */
export default defineEventHandler(async event => {
  try {
    await rateLimit(event, 'performance-metrics')

    // Validate request body using Zod schema
    const body = await validateRequestBody(performanceMetricsBodySchema, event)

    // Transform to metric data
    const metricData = transformWebVitalsReport({
      metric: body.metric,
      timestamp: body.timestamp,
      url: body.url,
      userAgent: body.userAgent,
      connection: body.connection,
    })

    // Store metric
    await storePerformanceMetric(metricData)

    return { success: true, stored: true }
  } catch (error: unknown) {
    logger.error('Failed to store performance metric:', error)

    const err = error as { statusCode?: number; statusMessage?: string }
    if (err.statusCode) {
      throw createError({
        statusCode: err.statusCode,
        statusMessage: err.statusMessage,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to store performance metric',
    })
  }
})
