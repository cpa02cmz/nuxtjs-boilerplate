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
} as const

export type ThresholdsConfig = typeof thresholdsConfig
