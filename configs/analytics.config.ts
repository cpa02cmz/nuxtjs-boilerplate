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

  // BroCula: Disable analytics API calls in static/SPA mode to prevent 404/500 console errors
  // Set ANALYTICS_API_ENABLED=false when running static builds without API
  // Set ANALYTICS_API_ENABLED=true to enable in development (requires database)
  // In browser/client-side, we check if API is actually available before making calls
  apiEnabled: (() => {
    // Check explicit environment variable first
    if (process.env.ANALYTICS_API_ENABLED === 'false') {
      return false
    }
    if (process.env.ANALYTICS_API_ENABLED === 'true') {
      return true
    }
    // BroCula: In development/production, default to false to prevent console errors
    // when database is not available. Developers must explicitly enable analytics.
    return false
  })(),

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

  // Retention Settings - Flexy hates hardcoded retention days!
  retention: {
    // Number of days to retain analytics events before cleanup (default: 30 days)
    eventsDays: parseInt(process.env.ANALYTICS_RETENTION_EVENTS_DAYS || '30'),

    // Number of days to retain dead letter queue items (default: 30 days)
    deadLetterDays: parseInt(
      process.env.ANALYTICS_RETENTION_DEAD_LETTER_DAYS || '30'
    ),

    // Minimum retention days allowed
    minDays: parseInt(process.env.ANALYTICS_RETENTION_MIN_DAYS || '1'),

    // Maximum retention days allowed
    maxDays: parseInt(process.env.ANALYTICS_RETENTION_MAX_DAYS || '365'),
  },

  // Export Settings - Flexy hates hardcoded batch sizes!
  export: {
    // Maximum number of events to export in a single batch (default: 100000)
    batchSize: parseInt(process.env.ANALYTICS_EXPORT_BATCH_SIZE || '100000'),

    // Minimum batch size allowed
    minBatchSize: parseInt(
      process.env.ANALYTICS_EXPORT_MIN_BATCH_SIZE || '1000'
    ),

    // Maximum batch size allowed
    maxBatchSize: parseInt(
      process.env.ANALYTICS_EXPORT_MAX_BATCH_SIZE || '500000'
    ),
  },

  // Goals and Thresholds - Flexy hates hardcoded 10000!
  goals: {
    // Default view goal for analytics dashboards (e.g., 10000 views)
    defaultViewGoal: parseInt(
      process.env.ANALYTICS_DEFAULT_VIEW_GOAL || '10000'
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

  // Validation Settings - Flexy hates hardcoded validation limits!
  validation: {
    // Maximum length for resource IDs in analytics
    resourceIdMaxLength: parseInt(
      process.env.ANALYTICS_RESOURCE_ID_MAX_LENGTH || '255'
    ),
  },

  // Search Analytics Limits - Flexy hates hardcoded 10!
  // Configurable limits for search analytics queries
  searchLimits: {
    // Number of popular searches to return (default: 10)
    popularSearches: parseInt(
      process.env.ANALYTICS_POPULAR_SEARCHES_LIMIT || '10'
    ),
    // Number of zero-result searches to return (default: 10)
    zeroResultSearches: parseInt(
      process.env.ANALYTICS_ZERO_RESULT_SEARCHES_LIMIT || '10'
    ),
  },
} as const

// Helper function to parse event types
function parseEventTypes(value: string): string[] {
  return value.split(',').map(s => s.trim())
}

export type AnalyticsConfig = typeof analyticsConfig
