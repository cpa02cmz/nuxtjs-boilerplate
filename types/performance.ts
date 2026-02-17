import { performanceDashboardConfig } from '~/configs/performance-dashboard.config'
import type { WebVitalsMetric } from '~/composables/useWebVitals'

// Types for performance metrics
export interface PerformanceMetricData {
  id?: string
  timestamp: Date
  metricType: 'web-vital' | 'api' | 'resource' | 'custom'
  metricName: string
  value: number
  rating?: 'good' | 'needs-improvement' | 'poor'
  url?: string
  userAgent?: string
  connection?: string
  metadata?: Record<string, unknown>
}

export interface AggregatedMetric {
  metricName: string
  timeBucket: Date
  avg: number
  min: number
  max: number
  p50: number
  p75: number
  p90: number
  p95: number
  p99: number
  count: number
}

export interface WebVitalsSummary {
  LCP: { avg: number; p75: number; p95: number; rating: string }
  INP: { avg: number; p75: number; p95: number; rating: string }
  CLS: { avg: number; p75: number; p95: number; rating: string }
  FCP: { avg: number; p75: number; p95: number; rating: string }
  TTFB: { avg: number; p75: number; p95: number; rating: string }
}

export interface TimeSeriesDataPoint {
  timestamp: string
  value: number
  count: number
}

export interface PerformanceDashboardData {
  webVitals: WebVitalsSummary
  timeSeries: Record<string, TimeSeriesDataPoint[]>
  apiPerformance: {
    avgResponseTime: number
    p95ResponseTime: number
    errorRate: number
    totalRequests: number
  }
  lastUpdated: string
}

// Get rating based on value and thresholds
export function getMetricRating(
  metricName: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds =
    performanceDashboardConfig.thresholds[
      metricName as keyof typeof performanceDashboardConfig.thresholds
    ]

  if (!thresholds) return 'good'

  const { good, poor } = thresholds as { good: number; poor: number }

  if (value <= good) return 'good'
  if (value <= poor) return 'needs-improvement'
  return 'poor'
}

// Format metric value for display
export function formatMetricValue(metricName: string, value: number): string {
  switch (metricName) {
    case 'LCP':
    case 'INP':
    case 'FCP':
    case 'TTFB':
      return `${value.toFixed(0)}ms`
    case 'CLS':
      return value.toFixed(3)
    default:
      return value.toFixed(2)
  }
}

// Get metric description
export function getMetricDescription(metricName: string): string {
  const descriptions: Record<string, string> = {
    LCP: 'Largest Contentful Paint - Measures loading performance',
    INP: 'Interaction to Next Paint - Measures interactivity',
    CLS: 'Cumulative Layout Shift - Measures visual stability',
    FCP: 'First Contentful Paint - Measures initial load time',
    TTFB: 'Time to First Byte - Measures server response time',
  }
  return descriptions[metricName] || metricName
}

// Transform web vitals report to metric data
export function transformWebVitalsReport(report: {
  metric: WebVitalsMetric
  timestamp: string
  url: string
  userAgent: string
  connection?: string
}): PerformanceMetricData {
  return {
    timestamp: new Date(report.timestamp),
    metricType: 'web-vital',
    metricName: report.metric.name,
    value: report.metric.value,
    rating: report.metric.rating,
    url: report.url,
    userAgent: report.userAgent,
    connection: report.connection,
    metadata: {
      delta: report.metric.delta,
      navigationType: report.metric.navigationType,
    },
  }
}
