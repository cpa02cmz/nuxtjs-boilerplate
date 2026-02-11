// Component Styles Configuration - Component-specific styling values
// Flexy hates hardcoded values! All component styles are now configurable.

export const componentStylesConfig = {
  // Status Manager Component Styles
  statusManager: {
    padding: process.env.STATUS_MANAGER_PADDING || '1rem',
    borderWidth: process.env.STATUS_MANAGER_BORDER_WIDTH || '1px',
    borderStyle: process.env.STATUS_MANAGER_BORDER_STYLE || 'solid',
    borderColor: process.env.STATUS_MANAGER_BORDER_COLOR || '#e5e7eb',
    borderRadius: process.env.STATUS_MANAGER_BORDER_RADIUS || '0.5rem',
    backgroundColor: process.env.STATUS_MANAGER_BG_COLOR || '#fafafa',
    titleFontSize: process.env.STATUS_MANAGER_TITLE_SIZE || '1.25rem',
    titleFontWeight: process.env.STATUS_MANAGER_TITLE_WEIGHT || '600',
    titleMarginBottom: process.env.STATUS_MANAGER_TITLE_MARGIN || '1rem',
    titleColor: process.env.STATUS_MANAGER_TITLE_COLOR || '#1f2937',
    controlGap: process.env.STATUS_MANAGER_CONTROL_GAP || '1rem',
    labelColor: process.env.STATUS_MANAGER_LABEL_COLOR || '#374151',
    labelFontSize: process.env.STATUS_MANAGER_LABEL_SIZE || '0.875rem',
    inputPadding: process.env.STATUS_MANAGER_INPUT_PADDING || '0.5rem',
    inputBorderColor: process.env.STATUS_MANAGER_INPUT_BORDER || '#d1d5db',
    inputBorderRadius: process.env.STATUS_MANAGER_INPUT_RADIUS || '0.375rem',
    inputFontSize: process.env.STATUS_MANAGER_INPUT_SIZE || '1rem',
    notesMinHeight: process.env.STATUS_MANAGER_NOTES_MIN_HEIGHT || '60px',
    buttonPadding: process.env.STATUS_MANAGER_BUTTON_PADDING || '0.5rem 1rem',
    buttonBgColor: process.env.STATUS_MANAGER_BUTTON_BG || '#10b981',
    buttonTextColor: process.env.STATUS_MANAGER_BUTTON_TEXT || 'white',
    buttonBorderRadius: process.env.STATUS_MANAGER_BUTTON_RADIUS || '0.375rem',
    buttonFontWeight: process.env.STATUS_MANAGER_BUTTON_WEIGHT || '500',
    buttonFontSize: process.env.STATUS_MANAGER_BUTTON_SIZE || '1rem',
    buttonHoverBg: process.env.STATUS_MANAGER_BUTTON_HOVER_BG || '#059669',
    buttonDisabledBg:
      process.env.STATUS_MANAGER_BUTTON_DISABLED_BG || '#9ca3af',
    resultMarginTop: process.env.STATUS_MANAGER_RESULT_MARGIN || '1rem',
    resultPadding: process.env.STATUS_MANAGER_RESULT_PADDING || '0.75rem',
    resultBorderRadius: process.env.STATUS_MANAGER_RESULT_RADIUS || '0.375rem',
    // Message colors - Flexy hates hardcoded colors!
    message: {
      success: {
        textColor: process.env.STATUS_MSG_SUCCESS_TEXT || '#16a34a',
        bgColor: process.env.STATUS_MSG_SUCCESS_BG || '#dcfce7',
        borderColor: process.env.STATUS_MSG_SUCCESS_BORDER || '#bbf7d0',
      },
      error: {
        textColor: process.env.STATUS_MSG_ERROR_TEXT || '#dc2626',
        bgColor: process.env.STATUS_MSG_ERROR_BG || '#fee2e2',
        borderColor: process.env.STATUS_MSG_ERROR_BORDER || '#fecaca',
      },
    },
  },

  // Loading Spinner Component Styles
  loadingSpinner: {
    sizes: {
      small: {
        width: process.env.SPINNER_SMALL_WIDTH || '1rem',
        height: process.env.SPINNER_SMALL_HEIGHT || '1rem',
      },
      medium: {
        width: process.env.SPINNER_MEDIUM_WIDTH || '1.5rem',
        height: process.env.SPINNER_MEDIUM_HEIGHT || '1.5rem',
      },
      large: {
        width: process.env.SPINNER_LARGE_WIDTH || '3rem',
        height: process.env.SPINNER_LARGE_HEIGHT || '3rem',
      },
    },
    animation: {
      rotationDuration: process.env.SPINNER_ROTATION_DURATION || '2s',
      dashDuration: process.env.SPINNER_DASH_DURATION || '1.5s',
      reducedMotionPulseDuration:
        process.env.SPINNER_REDUCED_MOTION_DURATION || '2s',
    },
    label: {
      fontSize: process.env.SPINNER_LABEL_SIZE || '0.875rem',
      color: process.env.SPINNER_LABEL_COLOR || '#6b7280',
    },
    stroke: {
      width: parseInt(process.env.SPINNER_STROKE_WIDTH || '2'),
      dashArray: process.env.SPINNER_DASH_ARRAY || '1, 200',
      dashOffset: parseInt(process.env.SPINNER_DASH_OFFSET || '0'),
    },
  },

  // Empty State Component Styles
  emptyState: {
    illustrationSize: {
      width: process.env.EMPTY_STATE_ILLUSTRATION_WIDTH || '12rem',
      height: process.env.EMPTY_STATE_ILLUSTRATION_HEIGHT || '12rem',
    },
    iconSizes: {
      magnifyingGlass: process.env.EMPTY_STATE_ICON_MAGNIFY || '3rem',
      document: process.env.EMPTY_STATE_ICON_DOCUMENT || '4rem',
      star: process.env.EMPTY_STATE_ICON_STAR || '2rem',
      sparkles: process.env.EMPTY_STATE_ICON_SPARKLES || '1.5rem',
    },
    animation: {
      staggerDelayMs: parseInt(process.env.EMPTY_STATE_STAGGER_DELAY || '100'),
      floatDurationSec: parseInt(process.env.EMPTY_STATE_FLOAT_DURATION || '3'),
      pulseDurationSec: parseInt(process.env.EMPTY_STATE_PULSE_DURATION || '3'),
    },
  },

  // Filter Chip Component Styles
  filterChip: {
    widths: {
      queryMax: process.env.FILTER_CHIP_QUERY_MAX || '200px',
      valueMax: process.env.FILTER_CHIP_VALUE_MAX || '150px',
    },
    animation: {
      staggerDelayMs: parseInt(process.env.FILTER_CHIP_STAGGER_DELAY || '100'),
    },
  },

  // Moderation Dashboard Styles
  moderationDashboard: {
    statusBgColors: {
      approved:
        process.env.MODERATION_STATUS_APPROVED_BG || 'rgba(40, 167, 69, 0.1)',
      rejected:
        process.env.MODERATION_STATUS_REJECTED_BG || 'rgba(220, 53, 69, 0.1)',
      flagged:
        process.env.MODERATION_STATUS_FLAGGED_BG || 'rgba(255, 193, 7, 0.1)',
      pending:
        process.env.MODERATION_STATUS_PENDING_BG || 'rgba(0, 123, 255, 0.1)',
    },
    cardShadow:
      process.env.MODERATION_CARD_SHADOW || '0 4px 8px rgba(0, 0, 0, 0.1)',
  },

  // Confetti Celebration Styles
  confetti: {
    particle: {
      startOffset: process.env.CONFETTI_PARTICLE_START_OFFSET || '-20px',
    },
  },

  // API Keys Component Styles
  apiKeys: {
    modalOverlayBg: process.env.API_KEYS_MODAL_OVERLAY || 'rgba(0, 0, 0, 0.5)',
  },

  // Error Boundary Component Styles
  errorBoundary: {
    minHeight: process.env.ERROR_BOUNDARY_MIN_HEIGHT || '300px',
    maxWidth: process.env.ERROR_BOUNDARY_MAX_WIDTH || '400px',
    iconMarginBottom: process.env.ERROR_BOUNDARY_ICON_MARGIN || '1rem',
    titleFontSize: process.env.ERROR_BOUNDARY_TITLE_SIZE || '1.5rem',
    titleMarginBottom: process.env.ERROR_BOUNDARY_TITLE_MARGIN || '0.5rem',
    messageFontSize: process.env.ERROR_BOUNDARY_MSG_SIZE || '0.875rem',
    buttonGap: process.env.ERROR_BOUNDARY_BUTTON_GAP || '0.5rem',
    buttonPadding: process.env.ERROR_BOUNDARY_BUTTON_PADDING || '0.5rem 1rem',
    buttonBorderRadius: process.env.ERROR_BOUNDARY_BUTTON_RADIUS || '0.375rem',
    buttonFontSize: process.env.ERROR_BOUNDARY_BUTTON_SIZE || '0.875rem',
  },

  // Reading Progress Component Styles
  readingProgress: {
    height: process.env.READING_PROGRESS_HEIGHT || '3px',
    gradient:
      process.env.READING_PROGRESS_GRADIENT ||
      'linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #3b82f6 100%)',
    shimmerWidth: process.env.READING_PROGRESS_SHIMMER_WIDTH || '100px',
    tooltipTop: process.env.READING_PROGRESS_TOOLTIP_TOP || '12px',
    tooltipPadding: process.env.READING_PROGRESS_TOOLTIP_PADDING || '6px 12px',
    tooltipBorderRadius: process.env.READING_PROGRESS_TOOLTIP_RADIUS || '8px',
    tooltipFontSize: process.env.READING_PROGRESS_TOOLTIP_SIZE || '12px',
    tooltipFontWeight: process.env.READING_PROGRESS_TOOLTIP_WEIGHT || '600',
    minHeightBreakpoint: parseInt(
      process.env.READING_PROGRESS_MIN_HEIGHT || '600'
    ),
  },

  // Scroll To Top Component Styles
  scrollToTop: {
    position: {
      bottom: process.env.SCROLLTOTOP_POSITION_BOTTOM || '2rem',
      right: process.env.SCROLLTOTOP_POSITION_RIGHT || '2rem',
    },
    size: {
      width: process.env.SCROLLTOTOP_WIDTH || '48px',
      height: process.env.SCROLLTOTOP_HEIGHT || '48px',
    },
    mobile: {
      bottom: process.env.SCROLLTOTOP_MOBILE_BOTTOM || '1.5rem',
      right: process.env.SCROLLTOTOP_MOBILE_RIGHT || '1.5rem',
      width: process.env.SCROLLTOTOP_MOBILE_WIDTH || '44px',
      height: process.env.SCROLLTOTOP_MOBILE_HEIGHT || '44px',
    },
    progressRing: {
      viewBox: process.env.SCROLLTOTOP_VIEWBOX || '0 0 48 48',
      center: parseInt(process.env.SCROLLTOTOP_CENTER || '24'),
      radius: parseInt(process.env.SCROLLTOTOP_RADIUS || '20'),
      strokeWidth: parseInt(process.env.SCROLLTOTOP_STROKE_WIDTH || '3'),
    },
  },
} as const

export type ComponentStylesConfig = typeof componentStylesConfig
