// Analytics Configuration - Analytics and Tracking Settings
// Flexy hates hardcoded values! All analytics settings are now configurable.

export const analyticsConfig = {
  // Tracking Settings
  tracking: {
    // Delay before tracking events (ms)
    delayMs: parseInt(process.env.ANALYTICS_TRACKING_DELAY_MS || '100'),

    // Debounce time for events (ms)
    debounceMs: parseInt(process.env.ANALYTICS_DEBOUNCE_MS || '300'),

    // Minimum time on page to count as view (ms)
    minTimeOnPageMs: parseInt(
      process.env.ANALYTICS_MIN_TIME_ON_PAGE_MS || '2000'
    ),

    // Scroll depth tracking interval (%)
    scrollDepthInterval: parseInt(
      process.env.ANALYTICS_SCROLL_DEPTH_INTERVAL || '25'
    ),
  },

  // Rating Settings
  rating: {
    min: parseInt(process.env.ANALYTICS_RATING_MIN || '1'),
    max: parseInt(process.env.ANALYTICS_RATING_MAX || '5'),
    scale: process.env.ANALYTICS_RATING_SCALE || '1-5',
  },

  // Event Types
  events: {
    validTypes: parseEventTypes(
      process.env.ANALYTICS_VALID_EVENT_TYPES ||
        'resource_view, search, filter_change, bookmark, comparison, submission'
    ),
  },

  // Storage Keys
  storage: {
    prefix: process.env.ANALYTICS_STORAGE_PREFIX || 'web-vitals-',
    maxEntries: parseInt(process.env.ANALYTICS_MAX_STORAGE_ENTRIES || '100'),
  },

  // Performance Tracking
  performance: {
    // Maximum performance history entries
    maxHistory: parseInt(process.env.PERFORMANCE_MAX_HISTORY || '100'),

    // CLS (Cumulative Layout Shift) threshold
    clsThreshold: parseFloat(process.env.PERFORMANCE_CLS_THRESHOLD || '0.1'),

    // LCP (Largest Contentful Paint) threshold (ms)
    lcpThreshold: parseInt(process.env.PERFORMANCE_LCP_THRESHOLD || '2500'),

    // FID (First Input Delay) threshold (ms)
    fidThreshold: parseInt(process.env.PERFORMANCE_FID_THRESHOLD || '100'),

    // Slow query threshold (ms)
    slowQueryThresholdMs: parseInt(
      process.env.PERFORMANCE_SLOW_QUERY_THRESHOLD_MS || '200'
    ),
  },
} as const

// Helper function to parse event types
function parseEventTypes(value: string): string[] {
  return value.split(',').map(s => s.trim())
}

export type AnalyticsConfig = typeof analyticsConfig
