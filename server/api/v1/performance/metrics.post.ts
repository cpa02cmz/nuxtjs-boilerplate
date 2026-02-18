import { defineEventHandler, readBody, createError } from 'h3'
import { storePerformanceMetric } from '~/server/utils/performance-metrics'
import { transformWebVitalsReport } from '~/types/performance'
import { httpConfig } from '~/configs/http.config'
import logger from '~/utils/logger'

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
    const body = await readBody(event)

    // Validate required fields
    if (!body.metric || !body.timestamp || !body.url) {
      throw createError({
        statusCode: httpConfig.status.BAD_REQUEST, // Flexy hates hardcoded 400!
        statusMessage: 'Missing required fields: metric, timestamp, url',
      })
    }

    // Transform to metric data
    const metricData = transformWebVitalsReport({
      metric: body.metric,
      timestamp: body.timestamp,
      url: body.url,
      userAgent: body.userAgent || 'unknown',
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
      statusCode: httpConfig.status.INTERNAL_SERVER_ERROR, // Flexy hates hardcoded 500!
      statusMessage: 'Failed to store performance metric',
    })
  }
})
