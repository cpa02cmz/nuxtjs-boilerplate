// Layout Configuration - Grid and Layout Settings
// Flexy hates hardcoded values! All layout settings are now configurable.

export const layoutConfig = {
  // Performance Dashboard Grid Layout
  // Flexy hates hardcoded minmax values!
  performanceDashboard: {
    // Charts grid min width for auto-fit (px)
    chartsGridMinWidthPx: parseInt(
      process.env.PERFORMANCE_CHARTS_GRID_MIN_WIDTH_PX || '400'
    ),
    // Charts grid gap (rem)
    chartsGridGap: parseFloat(process.env.PERFORMANCE_CHARTS_GRID_GAP || '1.5'),
    // API metrics grid min width for auto-fit (px)
    apiMetricsGridMinWidthPx: parseInt(
      process.env.PERFORMANCE_API_METRICS_GRID_MIN_WIDTH_PX || '200'
    ),
    // API metrics grid gap (rem)
    apiMetricsGridGap: parseFloat(
      process.env.PERFORMANCE_API_METRICS_GRID_GAP || '1'
    ),
  },

  // Moderation Dashboard Grid Layout
  moderationDashboard: {
    // Grid min width for auto-fit (px)
    gridMinWidthPx: parseInt(process.env.MODERATION_GRID_MIN_WIDTH_PX || '200'),
    // Grid gap (rem)
    gridGap: parseFloat(process.env.MODERATION_GRID_GAP || '1'),
  },

  // Submission Review Grid Layout
  submissionReview: {
    // Grid min width for auto-fit (px)
    gridMinWidthPx: parseInt(process.env.SUBMISSION_GRID_MIN_WIDTH_PX || '300'),
    // Grid gap (rem)
    gridGap: parseFloat(process.env.SUBMISSION_GRID_GAP || '1'),
  },

  // Comparison Preview Layout
  comparisonPreview: {
    // Minimum width (px)
    minWidthPx: parseInt(process.env.COMPARISON_PREVIEW_MIN_WIDTH_PX || '200'),
    // Maximum width (px)
    maxWidthPx: parseInt(process.env.COMPARISON_PREVIEW_MAX_WIDTH_PX || '300'),
  },

  // Breadcrumbs Layout
  breadcrumbs: {
    // Maximum width (px)
    maxWidthPx: parseInt(process.env.BREADCRUMBS_MAX_WIDTH_PX || '200'),
  },

  // Icon Sizes - Flexy hates hardcoded icon dimensions!
  iconSizes: {
    // Small icon size (px) - used in cards, lists
    small: parseInt(process.env.ICON_SIZE_SMALL_PX || '32'),
    // Medium icon size (px) - used in headers
    medium: parseInt(process.env.ICON_SIZE_MEDIUM_PX || '48'),
    // Large icon size (px) - used in hero sections
    large: parseInt(process.env.ICON_SIZE_LARGE_PX || '64'),
  },

  // Border Radius Values - Flexy hates hardcoded border-radius!
  borderRadius: {
    // Small border radius (px)
    small: parseInt(process.env.BORDER_RADIUS_SMALL_PX || '3'),
    // Medium border radius (px)
    medium: parseInt(process.env.BORDER_RADIUS_MEDIUM_PX || '4'),
    // Large border radius (px)
    large: parseInt(process.env.BORDER_RADIUS_LARGE_PX || '6'),
    // Extra large border radius (px)
    xl: parseInt(process.env.BORDER_RADIUS_XL_PX || '8'),
  },

  // Typography Sizes - Flexy hates hardcoded font sizes!
  typography: {
    // Chart label font size (px)
    chartLabelSize: parseInt(process.env.TYPOGRAPHY_CHART_LABEL_SIZE || '12'),
    // Badge font size (px)
    badgeSize: parseInt(process.env.TYPOGRAPHY_BADGE_SIZE || '10'),
    // Progress text font size (px)
    progressTextSize: parseInt(
      process.env.TYPOGRAPHY_PROGRESS_TEXT_SIZE || '12'
    ),
  },
} as const

export type LayoutConfig = typeof layoutConfig
