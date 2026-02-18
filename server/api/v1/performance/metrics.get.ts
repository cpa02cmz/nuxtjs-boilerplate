import { defineEventHandler, createError } from 'h3'
import {
  getPerformanceMetrics,
  getAggregatedMetrics,
} from '~/server/utils/performance-metrics'
import { performanceDashboardConfig } from '~/configs/performance-dashboard.config'
import { performanceConfig } from '~/configs/performance.config'
import type {
  PerformanceDashboardData,
  WebVitalsSummary,
  TimeSeriesDataPoint,
} from '~/types/performance'
import logger from '~/utils/logger'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { performanceMetricsQuerySchema } from '~/server/utils/validation-schemas'
import { validateQueryParams } from '~/server/utils/validation-utils'

/**
 * GET /api/v1/performance/metrics
 * Get performance metrics for dashboard
 *
 * Query params:
 * - range: Time range in hours (1, 6, 24, 168, 720) - default 24
 * - refresh: Force refresh cache (optional)
 */
export default defineEventHandler(async event => {
  try {
    await rateLimit(event, 'performance-metrics')

    // Validate query parameters using Zod schema
    const validatedQuery = validateQueryParams(
      performanceMetricsQuerySchema,
      event
    )
    const rangeHours = validatedQuery.range

    // Validate range is one of the allowed values
    const validRanges = performanceDashboardConfig.dashboard.timeRanges.map(
      r => r.hours
    )
    if (!validRanges.includes(rangeHours as (typeof validRanges)[number])) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid range. Valid values: ${validRanges.join(', ')}`,
      })
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - rangeHours * 60 * 60 * 1000)

    // Fetch raw metrics for current stats
    const rawMetrics = await getPerformanceMetrics({
      startDate,
      endDate,
      metricType: 'web-vital',
    })

    // Calculate Web Vitals summary
    const webVitalsSummary = calculateWebVitalsSummary(
      rawMetrics as Array<{
        metricName: string
        value: number
        rating: string | null
      }>
    )

    // Fetch aggregated time series data
    const timeSeriesData = await getAggregatedMetrics({
      startDate,
      endDate,
      bucketMinutes: calculateBucketSize(rangeHours),
    })

    // Transform time series for chart display
    const timeSeries = transformTimeSeries(timeSeriesData)

    // Fetch API performance metrics
    const apiMetrics = await getPerformanceMetrics({
      startDate,
      endDate,
      metricType: 'api',
    })

    const apiPerformance = calculateApiPerformance(
      apiMetrics as Array<{ value: number; metadata: string | null }>
    )

    const response: PerformanceDashboardData = {
      webVitals: webVitalsSummary,
      timeSeries,
      apiPerformance,
      lastUpdated: new Date().toISOString(),
    }

    return response
  } catch (error: unknown) {
    logger.error('Failed to fetch performance metrics:', error)

    const err = error as { statusCode?: number; statusMessage?: string }
    if (err.statusCode) {
      throw createError({
        statusCode: err.statusCode,
        statusMessage: err.statusMessage,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch performance metrics',
    })
  }
})

// Calculate Web Vitals summary from raw metrics
function calculateWebVitalsSummary(
  metrics: Array<{ metricName: string; value: number; rating: string | null }>
): WebVitalsSummary {
  const webVitalNames = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB']
  const summary = {} as WebVitalsSummary

  for (const name of webVitalNames) {
    const values = metrics.filter(m => m.metricName === name).map(m => m.value)

    if (values.length === 0) {
      summary[name as keyof WebVitalsSummary] = {
        avg: 0,
        p75: 0,
        p95: 0,
        rating: 'good',
      }
      continue
    }

    // Sort for percentile calculation
    const sorted = [...values].sort((a, b) => a - b)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const p75Value =
      sorted[Math.floor(sorted.length * 0.75)] ?? sorted[sorted.length - 1] ?? 0
    const p95Value =
      sorted[Math.floor(sorted.length * 0.95)] ?? sorted[sorted.length - 1] ?? 0

    // Determine overall rating based on p75 - Flexy hates hardcoded thresholds!
    let rating = 'good'
    if (name === 'CLS') {
      if (p75Value > performanceConfig.webVitals.cls.poor) rating = 'poor'
      else if (p75Value > performanceConfig.webVitals.cls.needsImprovement)
        rating = 'needs-improvement'
    } else if (name === 'LCP') {
      if (p75Value > performanceConfig.webVitals.lcp.poor) rating = 'poor'
      else if (p75Value > performanceConfig.webVitals.lcp.needsImprovement)
        rating = 'needs-improvement'
    } else if (name === 'INP') {
      if (p75Value > performanceConfig.webVitals.inp.poor) rating = 'poor'
      else if (p75Value > performanceConfig.webVitals.inp.needsImprovement)
        rating = 'needs-improvement'
    } else if (name === 'FCP') {
      if (p75Value > performanceConfig.webVitals.fcp.poor) rating = 'poor'
      else if (p75Value > performanceConfig.webVitals.fcp.needsImprovement)
        rating = 'needs-improvement'
    } else if (name === 'TTFB') {
      if (p75Value > performanceConfig.webVitals.ttfb.poor) rating = 'poor'
      else if (p75Value > performanceConfig.webVitals.ttfb.needsImprovement)
        rating = 'needs-improvement'
    }

    summary[name as keyof WebVitalsSummary] = {
      avg,
      p75: p75Value,
      p95: p95Value,
      rating,
    }
  }

  return summary
}

// Transform aggregated data to time series format
function transformTimeSeries(
  aggregated: Array<{
    metricName: string
    timeBucket: Date
    avg: number
    p75: number
    count: number
  }>
): Record<string, TimeSeriesDataPoint[]> {
  const series: Record<string, TimeSeriesDataPoint[]> = {}

  for (const item of aggregated) {
    if (!series[item.metricName]) {
      series[item.metricName] = []
    }

    const seriesArray = series[item.metricName]
    if (seriesArray) {
      seriesArray.push({
        timestamp: item.timeBucket.toISOString(),
        value: Math.round(item.avg * 100) / 100,
        count: item.count,
      })
    }
  }

  // Sort each series by timestamp
  for (const key of Object.keys(series)) {
    const seriesArray = series[key]
    if (seriesArray) {
      seriesArray.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    }
  }

  return series
}

// Calculate API performance metrics
function calculateApiPerformance(
  metrics: Array<{ value: number; metadata: string | null }>
): {
  avgResponseTime: number
  p95ResponseTime: number
  errorRate: number
  totalRequests: number
} {
  if (metrics.length === 0) {
    return {
      avgResponseTime: 0,
      p95ResponseTime: 0,
      errorRate: 0,
      totalRequests: 0,
    }
  }

  const values = metrics.map(m => m.value)
  const sorted = [...values].sort((a, b) => a - b)

  // Count errors (assuming metadata contains status code)
  const errors = metrics.filter(m => {
    if (!m.metadata) return false
    try {
      const meta = JSON.parse(m.metadata) as { statusCode?: number }
      return meta.statusCode && meta.statusCode >= 400
    } catch {
      return false
    }
  }).length

  return {
    avgResponseTime: Math.round(
      values.reduce((a, b) => a + b, 0) / values.length
    ),
    p95ResponseTime: sorted[Math.floor(sorted.length * 0.95)] || 0,
    errorRate: Math.round((errors / metrics.length) * 10000) / 10000,
    totalRequests: metrics.length,
  }
}

// Calculate bucket size based on range - Flexy hates hardcoded values!
function calculateBucketSize(rangeHours: number): number {
  const { bucketSizes } = performanceDashboardConfig
  if (rangeHours <= 1) return bucketSizes.oneHour
  if (rangeHours <= 6) return bucketSizes.sixHours
  if (rangeHours <= 24) return bucketSizes.twentyFourHours
  if (rangeHours <= 168) return bucketSizes.sevenDays
  return bucketSizes.thirtyDays
}
