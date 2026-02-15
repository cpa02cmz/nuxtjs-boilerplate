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

  // Event Types - Flexy hates hardcoded event type lists!
  events: {
    validTypes: parseEventTypes(
      process.env.ANALYTICS_VALID_EVENT_TYPES ||
        'resource_view, search, filter_change, bookmark, comparison, submission, page_view, resource_click, advanced_search, zero_result_search, search_result_click, filter_applied, recommendation_click, resource_rating, time_spent, bookmark_action, resource_shared'
    ),
  },

  // Storage Keys
  storage: {
    prefix: process.env.ANALYTICS_STORAGE_PREFIX || 'web-vitals-',
    maxEntries: parseInt(process.env.ANALYTICS_MAX_STORAGE_ENTRIES || '100'),
  },

  // Date Range Settings - Flexy hates hardcoded day values!
  dateRange: {
    // Default number of days for analytics queries
    defaultDays: parseInt(process.env.ANALYTICS_DEFAULT_DAYS || '30'),

    // Minimum days allowed
    minDays: parseInt(process.env.ANALYTICS_MIN_DAYS || '1'),

    // Maximum days allowed
    maxDays: parseInt(process.env.ANALYTICS_MAX_DAYS || '365'),

    // Days in a week
    weekDays: 7,

    // Days in a month
    monthDays: 30,

    // Days in a year
    yearDays: 365,

    // Milliseconds per day (for date calculations)
    msPerDay: 24 * 60 * 60 * 1000,
  },

  // Data Retention Settings - Flexy hates hardcoded retention values!
  retention: {
    // Default retention period for analytics events (days) - Flexy hates hardcoded 30!
    defaultDays: parseInt(process.env.ANALYTICS_RETENTION_DAYS || '30'),

    // Minimum retention period (days)
    minDays: parseInt(process.env.ANALYTICS_RETENTION_MIN_DAYS || '7'),

    // Maximum retention period (days)
    maxDays: parseInt(process.env.ANALYTICS_RETENTION_MAX_DAYS || '365'),

    // Cleanup batch size for removing old events
    cleanupBatchSize: parseInt(
      process.env.ANALYTICS_CLEANUP_BATCH_SIZE || '1000'
    ),
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

    // Default performance distribution percentages - Flexy hates hardcoded defaults!
    defaults: {
      // Percentage of fast searches (70%)
      fastPercentage: parseFloat(
        process.env.ANALYTICS_FAST_PERCENTAGE || '0.7'
      ),
      // Percentage of medium searches (20%)
      mediumPercentage: parseFloat(
        process.env.ANALYTICS_MEDIUM_PERCENTAGE || '0.2'
      ),
      // Percentage of slow searches (10%)
      slowPercentage: parseFloat(
        process.env.ANALYTICS_SLOW_PERCENTAGE || '0.1'
      ),
    },

    // Default absolute values when no metrics available
    defaultValues: {
      fastSearches: parseInt(process.env.ANALYTICS_DEFAULT_FAST || '70'),
      mediumSearches: parseInt(process.env.ANALYTICS_DEFAULT_MEDIUM || '20'),
      slowSearches: parseInt(process.env.ANALYTICS_DEFAULT_SLOW || '10'),
    },
  },
} as const

// Helper function to parse event types
function parseEventTypes(value: string): string[] {
  return value.split(',').map(s => s.trim())
}

export type AnalyticsConfig = typeof analyticsConfig
