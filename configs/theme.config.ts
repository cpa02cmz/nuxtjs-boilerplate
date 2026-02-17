// Theme Configuration - Colors, Styling, and Visual Settings
// Flexy hates hardcoded values! All theme settings are now configurable.

export const themeConfig = {
  // Primary Colors
  colors: {
    primary: process.env.THEME_PRIMARY_COLOR || '#4f46e5',
    secondary: process.env.THEME_SECONDARY_COLOR || '#7c3aed',
    background: process.env.THEME_BACKGROUND_COLOR || '#ffffff',
    surface: process.env.THEME_SURFACE_COLOR || '#f9fafb',
    text: process.env.THEME_TEXT_COLOR || '#111827',
    textMuted: process.env.THEME_TEXT_MUTED_COLOR || '#6b7280',
  },

  // PWA Theme Colors
  pwa: {
    themeColor: process.env.PWA_THEME_COLOR || '#4f46e5',
    backgroundColor: process.env.PWA_BACKGROUND_COLOR || '#ffffff',
    msTileColor: process.env.PWA_MS_TILE_COLOR || '#ffffff',
  },

  // Toast/Notification Colors
  toast: {
    success: {
      bg: process.env.TOAST_SUCCESS_BG || '#f0fdf4',
      border: process.env.TOAST_SUCCESS_BORDER || '#22c55e',
      text: process.env.TOAST_SUCCESS_TEXT || '#15803d',
    },
    error: {
      bg: process.env.TOAST_ERROR_BG || '#fef2f2',
      border: process.env.TOAST_ERROR_BORDER || '#ef4444',
      text: process.env.TOAST_ERROR_TEXT || '#b91c1c',
    },
    warning: {
      bg: process.env.TOAST_WARNING_BG || '#fffbeb',
      border: process.env.TOAST_WARNING_BORDER || '#f59e0b',
      text: process.env.TOAST_WARNING_TEXT || '#b45309',
    },
    info: {
      bg: process.env.TOAST_INFO_BG || '#eff6ff',
      border: process.env.TOAST_INFO_BORDER || '#3b82f6',
      text: process.env.TOAST_INFO_TEXT || '#1d4ed8',
    },
  },

  // Search Highlighting
  search: {
    highlightBg: process.env.SEARCH_HIGHLIGHT_BG || 'bg-yellow-200',
    highlightText: process.env.SEARCH_HIGHLIGHT_TEXT || 'text-gray-900',
  },

  // Layout Spacing (in pixels)
  layout: {
    toastTop: parseInt(process.env.TOAST_TOP_POSITION || '20'),
    toastRight: parseInt(process.env.TOAST_RIGHT_POSITION || '20'),
    toastMaxWidth: parseInt(process.env.TOAST_MAX_WIDTH || '400'),
    toastMinWidth: parseInt(process.env.TOAST_MIN_WIDTH || '300'),
  },

  // Scroll To Top Component Colors
  scrollToTop: {
    progressBg: process.env.SCROLL_PROGRESS_BG || '#e5e7eb',
    progressFill: process.env.SCROLL_PROGRESS_FILL || '#3b82f6',
    iconColor: process.env.SCROLL_ICON_COLOR || '#374151',
    iconBg: process.env.SCROLL_ICON_BG || '#f3f4f6',
    darkProgressBg: process.env.SCROLL_DARK_PROGRESS_BG || '#374151',
    darkIconColor: process.env.SCROLL_DARK_ICON_COLOR || '#1f2937',
    darkIconBg: process.env.SCROLL_DARK_ICON_BG || '#f3f4f6',
    // Palette's micro-UX enhancement: Tooltip colors
    tooltipBg: process.env.SCROLL_TOOLTIP_BG || '#1f2937',
    tooltipText: process.env.SCROLL_TOOLTIP_TEXT || '#ffffff',
    tooltipLabel: process.env.SCROLL_TOOLTIP_LABEL || '#9ca3af',
  },

  // Loading Spinner Colors
  loadingSpinner: {
    labelColor: process.env.SPINNER_LABEL_COLOR || '#6b7280',
  },

  // Error Message Colors (CSS Variable compatible)
  errorMessage: {
    error: {
      bg: process.env.ERROR_MSG_ERROR_BG || '#fef2f2',
      border: process.env.ERROR_MSG_ERROR_BORDER || '#fecaca',
      text: process.env.ERROR_MSG_ERROR_TEXT || '#b91c1c',
    },
    warning: {
      bg: process.env.ERROR_MSG_WARNING_BG || '#fffbeb',
      border: process.env.ERROR_MSG_WARNING_BORDER || '#fde68a',
      text: process.env.ERROR_MSG_WARNING_TEXT || '#92400e',
    },
    success: {
      bg: process.env.ERROR_MSG_SUCCESS_BG || '#f0fdf4',
      border: process.env.ERROR_MSG_SUCCESS_BORDER || '#bbf7d0',
      text: process.env.ERROR_MSG_SUCCESS_TEXT || '#166534',
    },
  },

  // Related Searches Colors - Palette's micro-UX enhancement!
  relatedSearches: {
    gradientStart: process.env.RELATED_SEARCHES_GRADIENT_START || '#eff6ff',
    gradientEnd: process.env.RELATED_SEARCHES_GRADIENT_END || '#dbeafe',
    borderColor: process.env.RELATED_SEARCHES_BORDER || '#bfdbfe',
    iconColor: process.env.RELATED_SEARCHES_ICON_COLOR || '#3b82f6',
    titleColor: process.env.RELATED_SEARCHES_TITLE_COLOR || '#1e40af',
    rippleColor: process.env.RELATED_SEARCHES_RIPPLE_COLOR || '#3b82f6',
    button: {
      bg: process.env.RELATED_SEARCHES_BUTTON_BG || '#ffffff',
      border: process.env.RELATED_SEARCHES_BUTTON_BORDER || '#d1d5db',
      text: process.env.RELATED_SEARCHES_BUTTON_TEXT || '#374151',
      hoverBg: process.env.RELATED_SEARCHES_BUTTON_HOVER_BG || '#eff6ff',
      hoverBorder:
        process.env.RELATED_SEARCHES_BUTTON_HOVER_BORDER || '#3b82f6',
      hoverText: process.env.RELATED_SEARCHES_BUTTON_HOVER_TEXT || '#1d4ed8',
      focusRing: process.env.RELATED_SEARCHES_BUTTON_FOCUS_RING || '#3b82f6',
      // 🎨 Pallete: Loading state background color
      loadingBg: process.env.RELATED_SEARCHES_BUTTON_LOADING_BG || '#f3f4f6',
    },
  },

  // Resource Status Badge Colors - Flexy hates hardcoded hex codes!
  resourceStatus: {
    active: {
      bg: process.env.STATUS_ACTIVE_BG || '#dcfce7',
      text: process.env.STATUS_ACTIVE_TEXT || '#166534',
      border: process.env.STATUS_ACTIVE_BORDER || '#bbf7d0',
    },
    deprecated: {
      bg: process.env.STATUS_DEPRECATED_BG || '#fef3c7',
      text: process.env.STATUS_DEPRECATED_TEXT || '#92400e',
      border: process.env.STATUS_DEPRECATED_BORDER || '#fde68a',
    },
    discontinued: {
      bg: process.env.STATUS_DISCONTINUED_BG || '#fee2e2',
      text: process.env.STATUS_DISCONTINUED_TEXT || '#b91c1c',
      border: process.env.STATUS_DISCONTINUED_BORDER || '#fca5a5',
    },
    updated: {
      bg: process.env.STATUS_UPDATED_BG || '#dbeafe',
      text: process.env.STATUS_UPDATED_TEXT || '#1e40af',
      border: process.env.STATUS_UPDATED_BORDER || '#bfdbfe',
    },
    pending: {
      bg: process.env.STATUS_PENDING_BG || '#e5e7eb',
      text: process.env.STATUS_PENDING_TEXT || '#374151',
      border: process.env.STATUS_PENDING_BORDER || '#d1d5db',
    },
    unknown: {
      bg: process.env.STATUS_UNKNOWN_BG || '#e5e7eb',
      text: process.env.STATUS_UNKNOWN_TEXT || '#374151',
      border: process.env.STATUS_UNKNOWN_BORDER || '#d1d5db',
    },
  },

  // Health Indicator Colors - Flexy hates hardcoded colors!
  healthIndicator: {
    good: process.env.HEALTH_GOOD_COLOR || '#22c55e',
    warning: process.env.HEALTH_WARNING_COLOR || '#f59e0b',
    bad: process.env.HEALTH_BAD_COLOR || '#ef4444',
    unknown: process.env.HEALTH_UNKNOWN_COLOR || '#9ca3af',
    // Glow colors for radial gradient effects
    glowStart: process.env.HEALTH_GLOW_START || 'rgba(34, 197, 94, 0.3)',
    glowEnd: process.env.HEALTH_GLOW_END || 'rgba(34, 197, 94, 0)',
  },

  // Scroll To Top Focus Colors
  scrollToTopFocus: {
    boxShadow: process.env.SCROLL_FOCUS_SHADOW || 'rgba(59, 130, 246, 0.5)',
    outline: process.env.SCROLL_FOCUS_OUTLINE || '#3b82f6',
  },

  // Z-Index Scale - Flexy hates hardcoded z-index values!
  zIndex: {
    confetti: parseInt(process.env.Z_INDEX_CONFETTI || '9998'),
    toast: parseInt(process.env.Z_INDEX_TOAST || '9999'),
    readingProgress: parseInt(process.env.Z_INDEX_READING_PROGRESS || '9999'),
    tooltip: parseInt(process.env.Z_INDEX_TOOLTIP || '10000'),
  },

  // Error Boundary Colors
  errorBoundary: {
    titleColor: process.env.ERROR_BOUNDARY_TITLE_COLOR || '#111827',
    messageColor: process.env.ERROR_BOUNDARY_MSG_COLOR || '#6b7280',
    primaryButtonBg: process.env.ERROR_BOUNDARY_PRIMARY_BTN_BG || '#3b82f6',
    primaryButtonBorder:
      process.env.ERROR_BOUNDARY_PRIMARY_BTN_BORDER || '#3b82f6',
    primaryButtonHover:
      process.env.ERROR_BOUNDARY_PRIMARY_BTN_HOVER || '#2563eb',
    secondaryButtonBg: process.env.ERROR_BOUNDARY_SECONDARY_BTN_BG || '#f3f4f6',
    secondaryButtonText:
      process.env.ERROR_BOUNDARY_SECONDARY_BTN_TEXT || '#374151',
    secondaryButtonBorder:
      process.env.ERROR_BOUNDARY_SECONDARY_BTN_BORDER || '#d1d5db',
    secondaryButtonHover:
      process.env.ERROR_BOUNDARY_SECONDARY_BTN_HOVER || '#e5e7eb',
  },

  // Reading Progress Colors
  readingProgress: {
    shimmerColor:
      process.env.READING_PROGRESS_SHIMMER || 'rgba(255, 255, 255, 0.4)',
    tooltipGradient:
      process.env.READING_PROGRESS_TOOLTIP_GRADIENT ||
      'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
    tooltipTextColor: process.env.READING_PROGRESS_TOOLTIP_TEXT || 'white',
    tooltipShadow:
      process.env.READING_PROGRESS_TOOLTIP_SHADOW ||
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    // Completion celebration colors
    completionGradient:
      process.env.READING_PROGRESS_COMPLETION_GRADIENT ||
      'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    completionShadow:
      process.env.READING_PROGRESS_COMPLETION_SHADOW ||
      '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
    completionIconBg:
      process.env.READING_PROGRESS_COMPLETION_ICON_BG || '#10b981',
    completionIconColor:
      process.env.READING_PROGRESS_COMPLETION_ICON_COLOR || 'white',
    completionTextColor:
      process.env.READING_PROGRESS_COMPLETION_TEXT_COLOR || 'white',
    confettiColors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'] as const,
  },

  // Focus Ring
  focusRing: process.env.FOCUS_RING_COLOR || '#3b82f6',

  // Comparison Value Colors - Palette's micro-UX enhancement!
  comparisonValue: {
    // Interactive text/number values
    interactiveTextColor:
      process.env.COMPARISON_VALUE_INTERACTIVE_TEXT || '#374151',
    hoverBgColor:
      process.env.COMPARISON_VALUE_HOVER_BG || 'rgba(59, 130, 246, 0.1)',
    hoverBorderColor:
      process.env.COMPARISON_VALUE_HOVER_BORDER || 'rgba(59, 130, 246, 0.3)',
    hoverShadowColor:
      process.env.COMPARISON_VALUE_HOVER_SHADOW || 'rgba(0, 0, 0, 0.1)',
    focusRingColor: process.env.COMPARISON_VALUE_FOCUS_RING || '#3b82f6',
    // Copied state colors
    copiedBgColor:
      process.env.COMPARISON_VALUE_COPIED_BG || 'rgba(34, 197, 94, 0.1)',
    copiedBorderColor:
      process.env.COMPARISON_VALUE_COPIED_BORDER || 'rgba(34, 197, 94, 0.5)',
    copiedTextColor: process.env.COMPARISON_VALUE_COPIED_TEXT || '#15803d',
    // Empty state
    emptyTextColor: process.env.COMPARISON_VALUE_EMPTY_TEXT || '#6b7280',
    // Boolean values
    booleanTrueBg:
      process.env.COMPARISON_VALUE_BOOL_TRUE_BG || 'rgba(34, 197, 94, 0.1)',
    booleanTrueColor: process.env.COMPARISON_VALUE_BOOL_TRUE_TEXT || '#15803d',
    booleanFalseBg:
      process.env.COMPARISON_VALUE_BOOL_FALSE_BG || 'rgba(239, 68, 68, 0.1)',
    booleanFalseColor:
      process.env.COMPARISON_VALUE_BOOL_FALSE_TEXT || '#b91c1c',
    // List items
    listItemBg:
      process.env.COMPARISON_VALUE_LIST_ITEM_BG || 'rgba(59, 130, 246, 0.1)',
    listItemColor: process.env.COMPARISON_VALUE_LIST_ITEM_TEXT || '#1d4ed8',
    // More button
    moreBtnBg:
      process.env.COMPARISON_VALUE_MORE_BTN_BG || 'rgba(107, 114, 128, 0.1)',
    moreBtnColor: process.env.COMPARISON_VALUE_MORE_BTN_TEXT || '#4b5563',
    moreBtnHoverBg:
      process.env.COMPARISON_VALUE_MORE_BTN_HOVER_BG ||
      'rgba(107, 114, 128, 0.2)',
    moreBtnHoverBorder:
      process.env.COMPARISON_VALUE_MORE_BTN_HOVER_BORDER ||
      'rgba(107, 114, 128, 0.3)',
    // BugFixer: Added missing preview properties for list preview popup
    previewBg: process.env.COMPARISON_VALUE_PREVIEW_BG || '#ffffff',
    previewBorder:
      process.env.COMPARISON_VALUE_PREVIEW_BORDER || 'rgba(0, 0, 0, 0.1)',
    previewDivider:
      process.env.COMPARISON_VALUE_PREVIEW_DIVIDER || 'rgba(0, 0, 0, 0.1)',
    previewTitleColor:
      process.env.COMPARISON_VALUE_PREVIEW_TITLE_COLOR || '#374151',
    previewCopyBg:
      process.env.COMPARISON_VALUE_PREVIEW_COPY_BG || 'rgba(59, 130, 246, 0.1)',
    previewCopyColor:
      process.env.COMPARISON_VALUE_PREVIEW_COPY_COLOR || '#2563eb',
    previewCopyHoverBg:
      process.env.COMPARISON_VALUE_PREVIEW_COPY_HOVER_BG ||
      'rgba(59, 130, 246, 0.2)',
    previewItemBg:
      process.env.COMPARISON_VALUE_PREVIEW_ITEM_BG ||
      'rgba(59, 130, 246, 0.08)',
    previewItemColor:
      process.env.COMPARISON_VALUE_PREVIEW_ITEM_COLOR || '#1d4ed8',
    previewItemHiddenBg:
      process.env.COMPARISON_VALUE_PREVIEW_ITEM_HIDDEN_BG ||
      'rgba(107, 114, 128, 0.1)',
    previewItemHiddenColor:
      process.env.COMPARISON_VALUE_PREVIEW_ITEM_HIDDEN_COLOR || '#6b7280',
    // BugFixer: Added missing listItemHoverBg property
    listItemHoverBg:
      process.env.COMPARISON_VALUE_LIST_ITEM_HOVER_BG ||
      'rgba(59, 130, 246, 0.15)',
  },
} as const

export type ThemeConfig = typeof themeConfig
