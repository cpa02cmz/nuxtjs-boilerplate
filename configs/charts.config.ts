// Chart Configuration - Flexy hates hardcoded chart values!
// All chart dimensions and styling are now configurable via environment variables.

export const chartsConfig = {
  // Performance Chart Settings - Used by PerformanceChart.vue
  performanceChart: {
    // Default chart width in pixels
    width: parseInt(process.env.CHART_PERFORMANCE_WIDTH_PX || '800'),
    // Default chart height in pixels
    height: parseInt(process.env.CHART_PERFORMANCE_HEIGHT_PX || '300'),
    // Padding configuration
    padding: {
      top: parseInt(process.env.CHART_PERFORMANCE_PADDING_TOP_PX || '20'),
      right: parseInt(process.env.CHART_PERFORMANCE_PADDING_RIGHT_PX || '30'),
      bottom: parseInt(process.env.CHART_PERFORMANCE_PADDING_BOTTOM_PX || '30'),
      left: parseInt(process.env.CHART_PERFORMANCE_PADDING_LEFT_PX || '50'),
    },
    // Data point radius
    pointRadius: parseInt(process.env.CHART_PERFORMANCE_POINT_RADIUS_PX || '4'),
    // Grid line configuration
    gridLines: {
      count: parseInt(process.env.CHART_PERFORMANCE_GRID_LINES_COUNT || '5'),
      strokeColor: process.env.CHART_PERFORMANCE_GRID_STROKE_COLOR || '#e5e7eb',
      strokeWidth: parseInt(
        process.env.CHART_PERFORMANCE_GRID_STROKE_WIDTH_PX || '1'
      ),
      dashArray: parseInt(
        process.env.CHART_PERFORMANCE_GRID_DASH_ARRAY_PX || '4'
      ),
    },
    // Line configuration
    line: {
      strokeWidth: parseInt(
        process.env.CHART_PERFORMANCE_LINE_STROKE_WIDTH_PX || '2'
      ),
    },
    // Area fill opacity (0-1)
    areaFillOpacity: parseFloat(
      process.env.CHART_PERFORMANCE_AREA_FILL_OPACITY || '0.2'
    ),
  },
} as const

export type ChartsConfig = typeof chartsConfig
