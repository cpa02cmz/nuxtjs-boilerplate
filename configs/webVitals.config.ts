// Web Vitals Configuration - Core Web Vitals thresholds and settings
// Flexy hates hardcoded values! All Web Vitals thresholds are configurable.

/**
 * Core Web Vitals thresholds based on Google's guidelines
 * All values are configurable via environment variables
 * @see https://web.dev/vitals/
 */
export const WEB_VITALS_THRESHOLDS = {
  /**
   * Largest Contentful Paint (LCP)
   * Measures loading performance
   * Good: ≤ 2.5s, Poor: > 4s
   */
  LCP: {
    good: parseInt(process.env.WEB_VITALS_LCP_GOOD_MS || '2500'),
    poor: parseInt(process.env.WEB_VITALS_LCP_POOR_MS || '4000'),
  },

  /**
   * Interaction to Next Paint (INP)
   * Measures interactivity
   * Good: ≤ 200ms, Poor: > 500ms
   */
  INP: {
    good: parseInt(process.env.WEB_VITALS_INP_GOOD_MS || '200'),
    poor: parseInt(process.env.WEB_VITALS_INP_POOR_MS || '500'),
  },

  /**
   * Cumulative Layout Shift (CLS)
   * Measures visual stability
   * Good: ≤ 0.1, Poor: > 0.25
   */
  CLS: {
    good: parseFloat(process.env.WEB_VITALS_CLS_GOOD || '0.1'),
    poor: parseFloat(process.env.WEB_VITALS_CLS_POOR || '0.25'),
  },

  /**
   * First Contentful Paint (FCP)
   * Measures time to first content
   * Good: ≤ 1.8s, Poor: > 3s
   */
  FCP: {
    good: parseInt(process.env.WEB_VITALS_FCP_GOOD_MS || '1800'),
    poor: parseInt(process.env.WEB_VITALS_FCP_POOR_MS || '3000'),
  },

  /**
   * Time to First Byte (TTFB)
   * Measures server response time
   * Good: ≤ 600ms, Poor: > 1.8s
   */
  TTFB: {
    good: parseInt(process.env.WEB_VITALS_TTFB_GOOD_MS || '600'),
    poor: parseInt(process.env.WEB_VITALS_TTFB_POOR_MS || '1800'),
  },
} as const

/**
 * Web Vitals configuration object
 */
export const webVitalsConfig = {
  /**
   * Thresholds for all Core Web Vitals metrics
   */
  thresholds: WEB_VITALS_THRESHOLDS,

  /**
   * Reporting configuration
   */
  reporting: {
    // Storage key prefix for metrics batching
    storagePrefix: process.env.WEB_VITALS_STORAGE_PREFIX || 'web_vitals_',

    // Maximum entries to keep in session storage before sending
    maxEntries: parseInt(process.env.WEB_VITALS_MAX_ENTRIES || '10'),

    // API endpoint for reporting metrics
    endpoint: process.env.WEB_VITALS_ENDPOINT || '/api/analytics/web-vitals',

    // Whether to respect Do Not Track preference
    respectDNT: process.env.WEB_VITALS_RESPECT_DNT !== 'false',

    // Use keepalive for fetch requests
    useKeepalive: process.env.WEB_VITALS_USE_KEEPALIVE !== 'false',
  },

  /**
   * Collection settings
   */
  collection: {
    // Enable/disable specific metrics
    enabled: {
      LCP: process.env.WEB_VITALS_ENABLE_LCP !== 'false',
      INP: process.env.WEB_VITALS_ENABLE_INP !== 'false',
      CLS: process.env.WEB_VITALS_ENABLE_CLS !== 'false',
      FCP: process.env.WEB_VITALS_ENABLE_FCP !== 'false',
      TTFB: process.env.WEB_VITALS_ENABLE_TTFB !== 'false',
    },
  },
} as const

// Type exports
export type WebVitalsThresholds = typeof WEB_VITALS_THRESHOLDS
export type WebVitalsMetric = keyof WebVitalsThresholds
export type WebVitalsConfig = typeof webVitalsConfig

/**
 * Get rating based on value and thresholds
 * @param value - The metric value
 * @param thresholds - The thresholds object with good and poor values
 * @returns The rating: 'good', 'needs-improvement', or 'poor'
 */
export function getWebVitalsRating(
  value: number,
  thresholds: { good: number; poor: number }
): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.poor) return 'needs-improvement'
  return 'poor'
}

/**
 * Get threshold for a specific metric
 * @param metric - The metric name
 * @returns The threshold configuration
 */
export function getWebVitalsThreshold(metric: WebVitalsMetric) {
  return WEB_VITALS_THRESHOLDS[metric]
}

export default webVitalsConfig
