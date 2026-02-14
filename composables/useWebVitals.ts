// composables/useWebVitals.ts
// Core Web Vitals tracking using web-vitals library
// Tracks LCP, INP, CLS, FCP, TTFB metrics for performance monitoring

import { onMounted, onUnmounted } from 'vue'
import { analyticsConfig } from '~/configs/analytics.config'
import logger from '~/utils/logger'

// Type for connection API
type NavigatorWithConnection = Navigator & {
  connection?: {
    effectiveType?: string
  }
}

export interface WebVitalsMetric {
  name: 'LCP' | 'INP' | 'CLS' | 'FCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta?: number
  entries?: PerformanceEntry[]
  navigationType?: string
}

interface WebVitalsReport {
  metric: WebVitalsMetric
  timestamp: string
  url: string
  userAgent: string
  connection?: string
}

// Thresholds per Core Web Vitals guidelines
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // milliseconds
  INP: { good: 200, poor: 500 }, // milliseconds
  CLS: { good: 0.1, poor: 0.25 }, // unitless
  FCP: { good: 1800, poor: 3000 }, // milliseconds
  TTFB: { good: 600, poor: 1800 }, // milliseconds
}

// Get rating based on value and thresholds
function getRating(
  value: number,
  thresholds: { good: number; poor: number }
): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.poor) return 'needs-improvement'
  return 'poor'
}

// Report metric to analytics endpoint
async function reportMetric(report: WebVitalsReport): Promise<void> {
  try {
    // Respect user's Do Not Track preference
    if (typeof navigator !== 'undefined' && navigator.doNotTrack === '1') {
      return
    }

    // Batch metrics in session storage for efficiency
    const storageKey = analyticsConfig.storage.prefix + 'metrics'
    const existing = sessionStorage.getItem(storageKey)
    const metrics: WebVitalsReport[] = existing ? JSON.parse(existing) : []

    metrics.push(report)

    // Keep only last N entries
    const maxEntries = analyticsConfig.storage.maxEntries
    while (metrics.length > maxEntries) {
      metrics.shift()
    }

    sessionStorage.setItem(storageKey, JSON.stringify(metrics))

    // Send to analytics API
    const response = await fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report),
      // Use keepalive to ensure data is sent even if page unloads
      keepalive: true,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
  } catch (error) {
    // Silent fail - don't impact user experience
    logger.debug('Web vitals report failed:', error)
  }
}

// Initialize web-vitals tracking
export function useWebVitals() {
  let cleanupFunctions: (() => void)[] = []

  onMounted(async () => {
    // Only run on client
    if (typeof window === 'undefined') return

    try {
      // Dynamic import to avoid SSR issues
      const { onLCP, onINP, onCLS, onFCP, onTTFB } = await import('web-vitals')

      const reportHandler = (metric: WebVitalsMetric) => {
        const report: WebVitalsReport = {
          metric,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          connection: (navigator as NavigatorWithConnection).connection
            ?.effectiveType,
        }
        reportMetric(report)
      }

      // Track each Core Web Vital
      onLCP(metric => {
        reportHandler({
          name: 'LCP',
          value: metric.value,
          rating: getRating(metric.value, THRESHOLDS.LCP),
          delta: metric.delta,
          entries: metric.entries,
          navigationType: metric.navigationType,
        })
      })

      onINP(metric => {
        reportHandler({
          name: 'INP',
          value: metric.value,
          rating: getRating(metric.value, THRESHOLDS.INP),
          delta: metric.delta,
          entries: metric.entries,
          navigationType: metric.navigationType,
        })
      })

      onCLS(metric => {
        reportHandler({
          name: 'CLS',
          value: metric.value,
          rating: getRating(metric.value, THRESHOLDS.CLS),
          delta: metric.delta,
          entries: metric.entries,
          navigationType: metric.navigationType,
        })
      })

      onFCP(metric => {
        reportHandler({
          name: 'FCP',
          value: metric.value,
          rating: getRating(metric.value, THRESHOLDS.FCP),
          delta: metric.delta,
          entries: metric.entries,
          navigationType: metric.navigationType,
        })
      })

      onTTFB(metric => {
        reportHandler({
          name: 'TTFB',
          value: metric.value,
          rating: getRating(metric.value, THRESHOLDS.TTFB),
          delta: metric.delta,
          entries: metric.entries,
          navigationType: metric.navigationType,
        })
      })
    } catch (error) {
      logger.warn('Failed to initialize web-vitals:', error)
    }
  })

  onUnmounted(() => {
    // Clean up any subscriptions
    cleanupFunctions.forEach(cleanup => cleanup())
    cleanupFunctions = []
  })
}

export default useWebVitals
