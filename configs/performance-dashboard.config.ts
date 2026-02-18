// Performance Monitoring Dashboard Configuration
// Flexy hates hardcoded values! All performance dashboard settings configurable.

export const performanceDashboardConfig = {
  // Dashboard Settings
  dashboard: {
    // Refresh interval in seconds
    refreshIntervalSec: parseInt(
      process.env.PERFORMANCE_DASHBOARD_REFRESH_SEC || '30'
    ),

    // Default time range for charts (hours)
    defaultTimeRangeHours: parseInt(
      process.env.PERFORMANCE_DEFAULT_TIME_RANGE_HOURS || '24'
    ),

    // Available time ranges
    timeRanges: [
      { label: '1H', hours: 1 },
      { label: '6H', hours: 6 },
      { label: '24H', hours: 24 },
      { label: '7D', hours: 168 },
      { label: '30D', hours: 720 },
    ],

    // Maximum data points for charts
    maxDataPoints: parseInt(process.env.PERFORMANCE_MAX_DATA_POINTS || '100'),
  },

  // Metric Thresholds (for color coding)
  thresholds: {
    LCP: {
      good: parseInt(process.env.PERFORMANCE_LCP_GOOD || '2500'),
      poor: parseInt(process.env.PERFORMANCE_LCP_POOR || '4000'),
    },
    INP: {
      good: parseInt(process.env.PERFORMANCE_INP_GOOD || '200'),
      poor: parseInt(process.env.PERFORMANCE_INP_POOR || '500'),
    },
    CLS: {
      good: parseFloat(process.env.PERFORMANCE_CLS_GOOD || '0.1'),
      poor: parseFloat(process.env.PERFORMANCE_CLS_POOR || '0.25'),
    },
    FCP: {
      good: parseInt(process.env.PERFORMANCE_FCP_GOOD || '1800'),
      poor: parseInt(process.env.PERFORMANCE_FCP_POOR || '3000'),
    },
    TTFB: {
      good: parseInt(process.env.PERFORMANCE_TTFB_GOOD || '800'),
      poor: parseInt(process.env.PERFORMANCE_TTFB_POOR || '1800'),
    },
    API: {
      good: parseInt(process.env.PERFORMANCE_API_GOOD || '200'),
      poor: parseInt(process.env.PERFORMANCE_API_POOR || '1000'),
    },
  },

  // Data Retention
  retention: {
    // Raw metrics retention days
    rawDays: parseInt(process.env.PERFORMANCE_RAW_RETENTION_DAYS || '30'),

    // Aggregated metrics retention days
    aggregatedDays: parseInt(
      process.env.PERFORMANCE_AGGREGATED_RETENTION_DAYS || '90'
    ),

    // Cleanup interval (hours)
    cleanupIntervalHours: parseInt(
      process.env.PERFORMANCE_CLEANUP_INTERVAL_HOURS || '24'
    ),
  },

  // API Settings
  api: {
    // Rate limit per minute
    rateLimitPerMinute: parseInt(
      process.env.PERFORMANCE_API_RATE_LIMIT || '60'
    ),

    // Cache duration (seconds)
    cacheDurationSec: parseInt(process.env.PERFORMANCE_API_CACHE_SEC || '30'),
  },

  // Chart Settings
  charts: {
    // Animation duration (ms)
    animationDurationMs: parseInt(
      process.env.PERFORMANCE_CHART_ANIMATION_MS || '750'
    ),

    // Smooth curves
    smoothCurves: process.env.PERFORMANCE_CHART_SMOOTH !== 'false',

    // Show grid lines
    showGrid: process.env.PERFORMANCE_CHART_GRID !== 'false',

    // Chart height (px)
    height: parseInt(process.env.PERFORMANCE_CHART_HEIGHT || '300'),

    // Chart dimensions - Flexy hates hardcoded values!
    dimensions: {
      // Default chart width
      width: parseInt(process.env.PERFORMANCE_CHART_WIDTH || '800'),

      // Padding around chart content
      padding: {
        top: parseInt(process.env.PERFORMANCE_CHART_PADDING_TOP || '20'),
        right: parseInt(process.env.PERFORMANCE_CHART_PADDING_RIGHT || '30'),
        bottom: parseInt(process.env.PERFORMANCE_CHART_PADDING_BOTTOM || '30'),
        left: parseInt(process.env.PERFORMANCE_CHART_PADDING_LEFT || '50'),
      },
    },

    // SVG styling - Flexy hates hardcoded values!
    svg: {
      // Grid line stroke width
      gridStrokeWidth: parseInt(
        process.env.PERFORMANCE_CHART_GRID_STROKE_WIDTH || '1'
      ),

      // Grid line dash array
      gridDashArray: process.env.PERFORMANCE_CHART_GRID_DASH_ARRAY || '4',

      // Data line stroke width
      lineStrokeWidth: parseInt(
        process.env.PERFORMANCE_CHART_LINE_STROKE_WIDTH || '2'
      ),

      // Data point radius
      pointRadius: parseInt(process.env.PERFORMANCE_CHART_POINT_RADIUS || '4'),

      // Data point hover radius
      pointHoverRadius: parseInt(
        process.env.PERFORMANCE_CHART_POINT_HOVER_RADIUS || '6'
      ),
    },
  },

  // Alert Settings
  alerts: {
    // Enable alerts
    enabled: process.env.PERFORMANCE_ALERTS_ENABLED === 'true',

    // Check interval (minutes)
    checkIntervalMinutes: parseInt(
      process.env.PERFORMANCE_ALERT_CHECK_INTERVAL || '5'
    ),

    // Cooldown between alerts (minutes)
    cooldownMinutes: parseInt(
      process.env.PERFORMANCE_ALERT_COOLDOWN_MINUTES || '60'
    ),

    // Default thresholds
    defaultThresholds: {
      errorRate: parseFloat(process.env.PERFORMANCE_ALERT_ERROR_RATE || '0.05'),
      p95Latency: parseInt(process.env.PERFORMANCE_ALERT_P95_LATENCY || '2000'),
    },
  },

  // Accessibility
  accessibility: {
    // Enable live region updates
    liveUpdates: process.env.PERFORMANCE_A11Y_LIVE !== 'false',

    // Announcement delay (ms)
    announcementDelayMs: parseInt(
      process.env.PERFORMANCE_A11Y_DELAY_MS || '1000'
    ),
  },

  // Time Series Bucket Sizes (in minutes) - Flexy hates hardcoded values!
  bucketSizes: {
    oneHour: parseInt(process.env.PERFORMANCE_BUCKET_1H_MINUTES || '5'),
    sixHours: parseInt(process.env.PERFORMANCE_BUCKET_6H_MINUTES || '15'),
    twentyFourHours: parseInt(
      process.env.PERFORMANCE_BUCKET_24H_MINUTES || '60'
    ),
    sevenDays: parseInt(process.env.PERFORMANCE_BUCKET_7D_MINUTES || '360'),
    thirtyDays: parseInt(process.env.PERFORMANCE_BUCKET_30D_MINUTES || '1440'),
  },
} as const

export type PerformanceDashboardConfig = typeof performanceDashboardConfig
