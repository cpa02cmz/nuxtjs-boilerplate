// server/api/analytics/web-vitals.post.ts
// API endpoint for receiving Core Web Vitals metrics
// Stores performance data for analysis and monitoring

import { defineEventHandler, readBody, getRequestHeaders } from 'h3'
import { z } from 'zod'
import logger from '~/utils/logger'

// Validation schema for web vitals report
const webVitalsSchema = z.object({
  metric: z.object({
    name: z.enum(['LCP', 'INP', 'CLS', 'FCP', 'TTFB']),
    value: z.number(),
    rating: z.enum(['good', 'needs-improvement', 'poor']),
    delta: z.number().optional(),
    navigationType: z.string().optional(),
  }),
  timestamp: z.string().datetime(),
  url: z.string().url(),
  userAgent: z.string(),
  connection: z.string().optional(),
})

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)

    // Validate input
    const result = webVitalsSchema.safeParse(body)
    if (!result.success) {
      logger.warn('Invalid web vitals data:', result.error.issues)
      return {
        success: false,
        message: 'Invalid data format',
        errors: result.error.issues,
      }
    }

    const report = result.data
    const headers = getRequestHeaders(event)

    // Add server-side metadata
    const enrichedReport = {
      ...report,
      server: {
        receivedAt: new Date().toISOString(),
        ip: headers['x-forwarded-for'] || 'unknown',
        country: headers['cf-ipcountry'] || 'unknown',
      },
    }

    // In production, store in database or analytics service
    // For now, log at debug level with enriched data
    logger.debug('Web Vitals Report:', {
      metric: enrichedReport.metric.name,
      value: enrichedReport.metric.value,
      rating: enrichedReport.metric.rating,
      url: enrichedReport.url,
      server: enrichedReport.server,
    })

    // TODO: Store in analytics database
    // await storeWebVitalsMetric(enrichedReport)

    return {
      success: true,
      message: 'Metric received',
    }
  } catch (error) {
    logger.error('Web vitals API error:', error)
    return {
      success: false,
      message: 'Internal server error',
    }
  }
})
