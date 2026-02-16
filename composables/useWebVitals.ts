// composables/useWebVitals.ts
// Core Web Vitals tracking using web-vitals library
// Tracks LCP, INP, CLS, FCP, TTFB metrics for performance monitoring

import { onMounted, onUnmounted, getCurrentInstance } from 'vue'
import { analyticsConfig } from '~/configs/analytics.config'
import {
  webVitalsConfig,
  WEB_VITALS_THRESHOLDS,
  getWebVitalsRating,
} from '~/configs/webVitals.config'
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

// Thresholds imported from modular config - Flexy hates hardcoded values!
const THRESHOLDS = WEB_VITALS_THRESHOLDS

// Report metric to analytics endpoint
async function reportMetric(report: WebVitalsReport): Promise<void> {
  try {
    // BroCula: Skip reporting if analytics API is disabled (e.g., static builds)
    if (!analyticsConfig.apiEnabled) {
      return
    }

    // Respect user's Do Not Track preference
    if (typeof navigator !== 'undefined' && navigator.doNotTrack === '1') {
      return
    }

    // Batch metrics in session storage for efficiency
    const storageKey =
      analyticsConfig.storage.prefix +
      webVitalsConfig.reporting.storagePrefix +
      'metrics'
    const existing = sessionStorage.getItem(storageKey)
    const metrics: WebVitalsReport[] = existing ? JSON.parse(existing) : []

    metrics.push(report)

    // Keep only last N entries
    const maxEntries = webVitalsConfig.reporting.maxEntries
    while (metrics.length > maxEntries) {
      metrics.shift()
    }

    sessionStorage.setItem(storageKey, JSON.stringify(metrics))

    // Send to analytics API
    const response = await fetch(webVitalsConfig.reporting.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report),
      // Use keepalive to ensure data is sent even if page unloads
      keepalive: webVitalsConfig.reporting.useKeepalive,
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
  // BroCula fix: Check if we're in a Vue component context
  const hasVueInstance = getCurrentInstance()

  // Core logic to initialize web vitals
  const initializeWebVitals = () => {
    // Only run on client
    if (typeof window === 'undefined') return

    // Dynamic import to avoid SSR issues
    import('web-vitals')
      .then(({ onLCP, onINP, onCLS, onFCP, onTTFB }) => {
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
        // Track each Core Web Vital using modular config - Flexy hates hardcoded values!
        // BroCula: web-vitals v4+ returns cleanup functions
        if (webVitalsConfig.collection.enabled.LCP) {
          onLCP(metric => {
            reportHandler({
              name: 'LCP',
              value: metric.value,
              rating: getWebVitalsRating(metric.value, THRESHOLDS.LCP),
              delta: metric.delta,
              entries: metric.entries,
              navigationType: metric.navigationType,
            })
          })
        }

        if (webVitalsConfig.collection.enabled.INP) {
          onINP(metric => {
            reportHandler({
              name: 'INP',
              value: metric.value,
              rating: getWebVitalsRating(metric.value, THRESHOLDS.INP),
              delta: metric.delta,
              entries: metric.entries,
              navigationType: metric.navigationType,
            })
          })
        }

        if (webVitalsConfig.collection.enabled.CLS) {
          onCLS(metric => {
            reportHandler({
              name: 'CLS',
              value: metric.value,
              rating: getWebVitalsRating(metric.value, THRESHOLDS.CLS),
              delta: metric.delta,
              entries: metric.entries,
              navigationType: metric.navigationType,
            })
          })
        }

        if (webVitalsConfig.collection.enabled.FCP) {
          onFCP(metric => {
            reportHandler({
              name: 'FCP',
              value: metric.value,
              rating: getWebVitalsRating(metric.value, THRESHOLDS.FCP),
              delta: metric.delta,
              entries: metric.entries,
              navigationType: metric.navigationType,
            })
          })
        }

        if (webVitalsConfig.collection.enabled.TTFB) {
          onTTFB(metric => {
            reportHandler({
              name: 'TTFB',
              value: metric.value,
              rating: getWebVitalsRating(metric.value, THRESHOLDS.TTFB),
              delta: metric.delta,
              entries: metric.entries,
              navigationType: metric.navigationType,
            })
          })
        }
      })
      .catch(error => {
        logger.warn('Failed to initialize web-vitals:', error)
      })
  }

  if (hasVueInstance) {
    // In Vue component context - use lifecycle hooks
    onMounted(() => {
      initializeWebVitals()
    })

    onUnmounted(() => {
      // BroCula: Web-vitals observers auto-cleanup on page unload
      // No manual cleanup needed for performance observers
    })
  } else {
    // Outside Vue component context (e.g., plugin) - run immediately
    initializeWebVitals()
  }
}

export default useWebVitals
