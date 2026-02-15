// Thresholds Configuration - UI Change Thresholds and Feedback Magnitude Settings
// Flexy hates hardcoded values! All threshold settings are now configurable.

export const thresholdsConfig = {
  // Resource Sort Change Indicator Thresholds
  changeIndicator: {
    // Minimum change value to show the change indicator
    minChange: parseInt(process.env.CHANGE_INDICATOR_MIN_CHANGE || '3'),

    // Medium magnitude threshold - applies different styling
    mediumThreshold: parseInt(
      process.env.CHANGE_INDICATOR_MEDIUM_THRESHOLD || '10'
    ),

    // High magnitude threshold - applies prominent styling
    highThreshold: parseInt(
      process.env.CHANGE_INDICATOR_HIGH_THRESHOLD || '20'
    ),

    // How long to display the change indicator (ms)
    displayDurationMs: parseInt(
      process.env.CHANGE_INDICATOR_DISPLAY_DURATION_MS || '2000'
    ),
  },

  // Count Animation Settings
  countAnimation: {
    // Default duration for count animation (ms)
    defaultDurationMs: parseInt(
      process.env.COUNT_ANIMATION_DURATION_MS || '400'
    ),

    // Duration for color reset after count change (ms)
    colorResetDelayMs: parseInt(
      process.env.COUNT_COLOR_RESET_DELAY_MS || '600'
    ),
  },

  // Search Index Management
  searchIndex: {
    // Maximum number of popular searches to track
    maxPopularSearches: parseInt(
      process.env.SEARCH_MAX_POPULAR_SEARCHES || '1000'
    ),

    // Trim threshold - when to start trimming the map
    trimThreshold: parseInt(process.env.SEARCH_TRIM_THRESHOLD || '1200'),
  },

  // Focus Management
  focus: {
    // Delay before focusing element after transition (ms)
    transitionFocusDelayMs: parseInt(
      process.env.FOCUS_TRANSITION_DELAY_MS || '100'
    ),
  },

  // Virtual List Settings
  virtualList: {
    // Default container height CSS value
    defaultContainerHeight:
      process.env.VIRTUAL_LIST_CONTAINER_HEIGHT || 'calc(100vh - 200px)',
  },

  // Skeleton Loader Dimensions
  skeleton: {
    // Default chip skeleton width (px)
    chipWidthPx: parseInt(process.env.SKELETON_CHIP_WIDTH_PX || '80'),

    // Default chip skeleton height (px)
    chipHeightPx: parseInt(process.env.SKELETON_CHIP_HEIGHT_PX || '28'),

    // Grid minimum height CSS class
    gridMinHeight: process.env.SKELETON_GRID_MIN_HEIGHT || 'min-h-[400px]',
  },

  // Page-level Settings
  page: {
    // Grid container minimum height
    gridContainerMinHeightPx: parseInt(
      process.env.PAGE_GRID_MIN_HEIGHT_PX || '400'
    ),
  },

  // Pagination Settings - Prevents DOM bloat on resource grids
  pagination: {
    // Initial number of resources to show
    initialCount: parseInt(process.env.PAGINATION_INITIAL_COUNT || '12'),
    // Number of resources to load on each "Load More" click
    loadMoreCount: parseInt(process.env.PAGINATION_LOAD_MORE_COUNT || '12'),
  },

  // Character Counter Thresholds - Flexy hates hardcoded percentage values!
  characterCounter: {
    // Progress bar color change thresholds (percentage)
    progress: {
      // Warning threshold - yellow/amber color (80%)
      warningPercent: parseInt(
        process.env.CHAR_COUNTER_WARNING_PERCENT || '80'
      ),
      // Error threshold - red color (90%)
      errorPercent: parseInt(process.env.CHAR_COUNTER_ERROR_PERCENT || '90'),
    },
    // Remaining characters warning thresholds (absolute count)
    remaining: {
      // Title field - warning when 20 or fewer characters remain
      titleWarning: parseInt(process.env.CHAR_COUNTER_TITLE_WARNING || '20'),
      // Title field - error when 10 or fewer characters remain
      titleError: parseInt(process.env.CHAR_COUNTER_TITLE_ERROR || '10'),
      // Description field - warning when 100 or fewer characters remain
      descriptionWarning: parseInt(
        process.env.CHAR_COUNTER_DESC_WARNING || '100'
      ),
      // Description field - error when 50 or fewer characters remain
      descriptionError: parseInt(process.env.CHAR_COUNTER_DESC_ERROR || '50'),
    },
  },

  // Test Coverage Thresholds - Flexy hates hardcoded coverage values!
  coverage: {
    // Minimum percentage thresholds for different metrics
    branches: parseInt(process.env.COVERAGE_BRANCHES_THRESHOLD || '70'),
    functions: parseInt(process.env.COVERAGE_FUNCTIONS_THRESHOLD || '70'),
    lines: parseInt(process.env.COVERAGE_LINES_THRESHOLD || '70'),
    statements: parseInt(process.env.COVERAGE_STATEMENTS_THRESHOLD || '70'),
  },

  // Core Web Vitals Thresholds - Flexy hates hardcoded Web Vitals values!
  // Based on Google's Core Web Vitals guidelines
  webVitals: {
    // Largest Contentful Paint (LCP) - measures loading performance
    LCP: {
      // Good: 0-2.5 seconds
      good: parseInt(process.env.WEB_VITALS_LCP_GOOD || '2500'),
      // Poor: >4 seconds
      poor: parseInt(process.env.WEB_VITALS_LCP_POOR || '4000'),
    },
    // Interaction to Next Paint (INP) - measures interactivity
    INP: {
      // Good: 0-200 milliseconds
      good: parseInt(process.env.WEB_VITALS_INP_GOOD || '200'),
      // Poor: >500 milliseconds
      poor: parseInt(process.env.WEB_VITALS_INP_POOR || '500'),
    },
    // Cumulative Layout Shift (CLS) - measures visual stability
    CLS: {
      // Good: 0-0.1
      good: parseFloat(process.env.WEB_VITALS_CLS_GOOD || '0.1'),
      // Poor: >0.25
      poor: parseFloat(process.env.WEB_VITALS_CLS_POOR || '0.25'),
    },
    // First Contentful Paint (FCP) - measures perceived load speed
    FCP: {
      // Good: 0-1.8 seconds
      good: parseInt(process.env.WEB_VITALS_FCP_GOOD || '1800'),
      // Poor: >3 seconds
      poor: parseInt(process.env.WEB_VITALS_FCP_POOR || '3000'),
    },
    // Time to First Byte (TTFB) - measures server response time
    TTFB: {
      // Good: 0-600 milliseconds
      good: parseInt(process.env.WEB_VITALS_TTFB_GOOD || '600'),
      // Poor: >1.8 seconds
      poor: parseInt(process.env.WEB_VITALS_TTFB_POOR || '1800'),
    },
  },

  // Timer Pool Configuration - Flexy hates hardcoded timer pool values!
  timerPool: {
    // Maximum pool size for timeouts
    maxTimeoutPoolSize: parseInt(process.env.TIMER_POOL_MAX_TIMEOUT || '20'),
    // Maximum pool size for intervals
    maxIntervalPoolSize: parseInt(process.env.TIMER_POOL_MAX_INTERVAL || '10'),
    // Cleanup interval for unused pool items (ms)
    cleanupIntervalMs: parseInt(
      process.env.TIMER_POOL_CLEANUP_INTERVAL || '30000'
    ),
    // Maximum age for unused pool items (ms)
    maxAgeMs: parseInt(process.env.TIMER_POOL_MAX_AGE || '60000'),
  },
} as const

export type ThresholdsConfig = typeof thresholdsConfig
