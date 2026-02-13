// Component Colors Configuration
// Flexy hates hardcoded values! All component-specific colors are now configurable.

export const componentColorsConfig = {
  // Scrollbar Colors - Flexy hates hardcoded scrollbar colors!
  scrollbar: {
    track: process.env.SCROLLBAR_TRACK_COLOR || '#f1f5f9',
    thumb: process.env.SCROLLBAR_THUMB_COLOR || '#cbd5e1',
    thumbHover: process.env.SCROLLBAR_THUMB_HOVER_COLOR || '#94a3b8',
  },

  // Skeleton Loading Colors - Flexy hates hardcoded skeleton colors!
  skeleton: {
    light: {
      start: process.env.SKELETON_LIGHT_START || '#e5e7eb',
      middle: process.env.SKELETON_LIGHT_MIDDLE || '#f3f4f6',
      end: process.env.SKELETON_LIGHT_END || '#e5e7eb',
    },
    icon: {
      start: process.env.SKELETON_ICON_START || '#d1d5db',
      middle: process.env.SKELETON_ICON_MIDDLE || '#e5e7eb',
      end: process.env.SKELETON_ICON_END || '#d1d5db',
    },
    reducedMotion: {
      light: process.env.SKELETON_REDUCED_LIGHT || '#e5e7eb',
      icon: process.env.SKELETON_REDUCED_ICON || '#d1d5db',
    },
  },

  // Focus Ring Colors - Flexy hates hardcoded focus ring colors!
  focusRing: {
    color: process.env.FOCUS_RING_COLOR || '59, 130, 246',
    opacityStart: parseFloat(process.env.FOCUS_RING_OPACITY_START || '0.5'),
    opacityMid: parseFloat(process.env.FOCUS_RING_OPACITY_MID || '0.3'),
    opacityEnd: parseFloat(process.env.FOCUS_RING_OPACITY_END || '0'),
    offsetSmall: parseInt(process.env.FOCUS_RING_OFFSET_SMALL || '4'),
    offsetLarge: parseInt(process.env.FOCUS_RING_OFFSET_LARGE || '8'),
  },

  // Box Shadow Colors - Flexy hates hardcoded shadow colors!
  shadows: {
    light: {
      sm: process.env.SHADOW_LIGHT_SM || '0, 0, 0, 0.05',
      default: process.env.SHADOW_LIGHT_DEFAULT || '0, 0, 0, 0.1',
      md: process.env.SHADOW_LIGHT_MD || '0, 0, 0, 0.15',
      lg: process.env.SHADOW_LIGHT_LG || '0, 0, 0, 0.2',
    },
    colored: {
      blue: process.env.SHADOW_COLORED_BLUE || '59, 130, 246',
    },
  },

  // Error Boundary Colors - Flexy hates hardcoded error colors!
  errorBoundary: {
    text: process.env.ERROR_BOUNDARY_TEXT || '#111827',
    mutedText: process.env.ERROR_BOUNDARY_MUTED_TEXT || '#6b7280',
    primaryButton: process.env.ERROR_BOUNDARY_PRIMARY_BTN || '#3b82f6',
    primaryButtonHover:
      process.env.ERROR_BOUNDARY_PRIMARY_BTN_HOVER || '#2563eb',
    secondaryButtonBg: process.env.ERROR_BOUNDARY_SECONDARY_BTN_BG || '#f3f4f6',
    secondaryButtonText:
      process.env.ERROR_BOUNDARY_SECONDARY_BTN_TEXT || '#374151',
    secondaryButtonBorder:
      process.env.ERROR_BOUNDARY_SECONDARY_BTN_BORDER || '#d1d5db',
    secondaryButtonHoverBg:
      process.env.ERROR_BOUNDARY_SECONDARY_BTN_HOVER_BG || '#e5e7eb',
  },

  // Deprecation Notice Colors - Flexy hates hardcoded notice colors!
  deprecationNotice: {
    warning: {
      bg: process.env.DEPRECATION_WARNING_BG || '#fffbeb',
      border: process.env.DEPRECATION_WARNING_BORDER || '#f59e0b',
      button: process.env.DEPRECATION_WARNING_BTN || '#f59e0b',
      buttonHover: process.env.DEPRECATION_WARNING_BTN_HOVER || '#d97706',
    },
    error: {
      bg: process.env.DEPRECATION_ERROR_BG || '#fef2f2',
      border: process.env.DEPRECATION_ERROR_BORDER || '#ef4444',
    },
    info: {
      bg: process.env.DEPRECATION_INFO_BG || '#dbeafe',
      border: process.env.DEPRECATION_INFO_BORDER || '#3b82f6',
      button: process.env.DEPRECATION_INFO_BTN || '#3b82f6',
      buttonHover: process.env.DEPRECATION_INFO_BTN_HOVER || '#2563eb',
    },
    text: process.env.DEPRECATION_TEXT || '#4b5563',
  },

  // Optimized Image Loading Colors - Flexy hates hardcoded loading colors!
  imageLoading: {
    light: {
      start: process.env.IMAGE_LOADING_LIGHT_START || '#f0f0f0',
      middle: process.env.IMAGE_LOADING_LIGHT_MIDDLE || '#e0e0e0',
      end: process.env.IMAGE_LOADING_LIGHT_END || '#f0f0f0',
    },
    dark: {
      start: process.env.IMAGE_LOADING_DARK_START || '#374151',
      middle: process.env.IMAGE_LOADING_DARK_MIDDLE || '#4b5563',
      end: process.env.IMAGE_LOADING_DARK_END || '#374151',
    },
  },

  // Resource Status Component Colors - Flexy hates hardcoded status colors!
  resourceStatus: {
    dropdown: {
      shadow: process.env.STATUS_DROPDOWN_SHADOW || '0, 0, 0, 0.15',
      itemShadow: process.env.STATUS_DROPDOWN_ITEM_SHADOW || '0, 0, 0, 0.1',
    },
  },

  // Reading Progress Colors - Flexy hates hardcoded progress colors!
  readingProgress: {
    gradient: {
      start: process.env.READING_PROGRESS_START || '#3b82f6',
      middle: process.env.READING_PROGRESS_MIDDLE || '#60a5fa',
      end: process.env.READING_PROGRESS_END || '#3b82f6',
    },
    shine: process.env.READING_PROGRESS_SHINE || '255, 255, 255, 0.4',
    darkGradient: {
      start: process.env.READING_PROGRESS_DARK_START || '#1f2937',
      end: process.env.READING_PROGRESS_DARK_END || '#374151',
    },
  },

  // Review Queue Colors - Flexy hates hardcoded queue colors!
  reviewQueue: {
    cardShadow: process.env.REVIEW_QUEUE_CARD_SHADOW || '0, 0, 0, 0.1',
  },

  // Toast Notification Colors - Flexy hates hardcoded toast colors!
  toast: {
    backdrop: process.env.TOAST_BACKDROP_COLOR || '0, 0, 0, 0.2',
  },

  // Submission Review Colors - Flexy hates hardcoded review badge colors!
  submissionReview: {
    badge: {
      padding: process.env.SUBMISSION_BADGE_PADDING || '0.25rem 0.5rem',
      borderRadius: process.env.SUBMISSION_BADGE_RADIUS || '12px',
      fontSize: process.env.SUBMISSION_BADGE_FONT_SIZE || '0.8rem',
      pending: {
        bg: process.env.SUBMISSION_PENDING_BG || '#fff3cd',
        text: process.env.SUBMISSION_PENDING_TEXT || '#856404',
      },
      approved: {
        bg: process.env.SUBMISSION_APPROVED_BG || '#d4edda',
        text: process.env.SUBMISSION_APPROVED_TEXT || '#155724',
      },
      rejected: {
        bg: process.env.SUBMISSION_REJECTED_BG || '#f8d7da',
        text: process.env.SUBMISSION_REJECTED_TEXT || '#721c24',
      },
    },
  },

  // Webhook Manager Colors - Flexy hates hardcoded webhook colors!
  webhookManager: {
    panelBg: process.env.WEBHOOK_PANEL_BG || '#f8f9fa',
    border: process.env.WEBHOOK_BORDER || '#d1d5db',
    mutedText: process.env.WEBHOOK_MUTED_TEXT || '#6b7280',
    cardBorder: process.env.WEBHOOK_CARD_BORDER || '#e5e7eb',
    status: {
      active: {
        bg: process.env.WEBHOOK_STATUS_ACTIVE_BG || '#dbeafe',
        text: process.env.WEBHOOK_STATUS_ACTIVE_TEXT || '#1e40af',
      },
      enabled: {
        bg: process.env.WEBHOOK_STATUS_ENABLED_BG || '#dcfce7',
        text: process.env.WEBHOOK_STATUS_ENABLED_TEXT || '#166534',
      },
      disabled: {
        bg: process.env.WEBHOOK_STATUS_DISABLED_BG || '#f3f4f6',
        text: process.env.WEBHOOK_STATUS_DISABLED_TEXT || '#6b7280',
      },
      error: {
        bg: process.env.WEBHOOK_STATUS_ERROR_BG || '#fee2e2',
        text: process.env.WEBHOOK_STATUS_ERROR_TEXT || '#dc2626',
      },
    },
    button: {
      primary: process.env.WEBHOOK_BTN_PRIMARY || '#3b82f6',
      primaryHover: process.env.WEBHOOK_BTN_PRIMARY_HOVER || '#2563eb',
      secondary: process.env.WEBHOOK_BTN_SECONDARY || '#6b7280',
      secondaryHover: process.env.WEBHOOK_BTN_SECONDARY_HOVER || '#374151',
      danger: process.env.WEBHOOK_BTN_DANGER || '#ef4444',
      dangerHover: process.env.WEBHOOK_BTN_DANGER_HOVER || '#dc2626',
    },
  },

  // Error Message Colors - Flexy hates hardcoded error message colors!
  errorMessage: {
    iconBg: process.env.ERROR_MESSAGE_ICON_BG || '0, 0, 0, 0.05',
  },

  // Scroll To Top Colors - Flexy hates hardcoded scroll button colors!
  scrollToTop: {
    focusOutline: process.env.SCROLL_TO_TOP_FOCUS || '#3b82f6',
  },

  // Resource Card Visited Link Colors - Flexy hates hardcoded visited colors!
  resourceCard: {
    visited: {
      // Visited link color (gray-500)
      linkColor: process.env.RESOURCE_CARD_VISITED_LINK || '#6b7280',
      // Visited link hover color (gray-600)
      linkHoverColor: process.env.RESOURCE_CARD_VISITED_HOVER || '#4b5563',
      // Visited indicator dot color (gray-400)
      indicatorColor: process.env.RESOURCE_CARD_VISITED_INDICATOR || '#9ca3af',
      // Visited indicator dot size (px)
      indicatorSize: parseInt(
        process.env.RESOURCE_CARD_VISITED_INDICATOR_SIZE || '6'
      ),
      // Visited indicator dot margin (px)
      indicatorMargin: parseInt(
        process.env.RESOURCE_CARD_VISITED_INDICATOR_MARGIN || '6'
      ),
      // Visited indicator opacity
      indicatorOpacity: parseFloat(
        process.env.RESOURCE_CARD_VISITED_INDICATOR_OPACITY || '0.6'
      ),
    },
  },

  // SearchBar Component Colors - Flexy hates hardcoded Tailwind classes!
  searchBar: {
    // Loading spinner color
    loadingIcon: process.env.SEARCHBAR_LOADING_ICON || 'text-blue-500',
    // Success checkmark color
    successIcon: process.env.SEARCHBAR_SUCCESS_ICON || 'text-green-500',
    // Default search icon color
    defaultIcon: process.env.SEARCHBAR_DEFAULT_ICON || 'text-gray-400',
    // Input focus ring color
    focusRing: process.env.SEARCHBAR_FOCUS_RING || 'focus:ring-blue-500',
    // Input focus border color
    focusBorder: process.env.SEARCHBAR_FOCUS_BORDER || 'focus:border-blue-500',
  },

  // ResourceShare Component Colors - Flexy hates hardcoded brand colors!
  resourceShare: {
    // Twitter/X brand colors
    twitter: {
      bg: process.env.SHARE_TWITTER_BG || 'bg-blue-500',
      hoverBg: process.env.SHARE_TWITTER_HOVER_BG || 'hover:bg-blue-600',
    },
    // Facebook brand colors
    facebook: {
      bg: process.env.SHARE_FACEBOOK_BG || 'bg-blue-700',
      hoverBg: process.env.SHARE_FACEBOOK_HOVER_BG || 'hover:bg-blue-800',
    },
    // LinkedIn brand colors
    linkedin: {
      bg: process.env.SHARE_LINKEDIN_BG || 'bg-blue-800',
      hoverBg: process.env.SHARE_LINKEDIN_HOVER_BG || 'hover:bg-blue-900',
    },
    // Reddit brand colors
    reddit: {
      bg: process.env.SHARE_REDDIT_BG || 'bg-orange-500',
      hoverBg: process.env.SHARE_REDDIT_HOVER_BG || 'hover:bg-orange-600',
    },
    // Copy link button colors
    copyButton: {
      bg: process.env.SHARE_COPY_BG || 'bg-gray-600',
      hoverBg: process.env.SHARE_COPY_HOVER_BG || 'hover:bg-gray-700',
    },
  },

  // KeyboardShortcutsHelp Component - Flexy hates hardcoded values!
  keyboardShortcuts: {
    // Modal backdrop color
    backdropColor: process.env.KB_SHORTCUTS_BACKDROP || 'bg-gray-900/50',
    // Icon color in header
    headerIcon: process.env.KB_SHORTCUTS_HEADER_ICON || 'text-blue-500',
  },

  // Tooltip Component Colors - Flexy hates hardcoded tooltip colors!
  tooltip: {
    // Background color (default: gray-900)
    bg: process.env.TOOLTIP_BG || 'bg-gray-900',
    // Text color (default: white)
    text: process.env.TOOLTIP_TEXT || 'text-white',
    // Arrow color (matches background)
    arrowBg: process.env.TOOLTIP_ARROW_BG || 'bg-gray-900',
  },

  // Health Monitor Colors - Flexy hates hardcoded health colors!
  healthMonitor: {
    container: {
      border: process.env.HEALTH_CONTAINER_BORDER || '#e5e7eb',
      background: process.env.HEALTH_CONTAINER_BG || '#fafafa',
      borderRadius: process.env.HEALTH_CONTAINER_RADIUS || '0.5rem',
      padding: process.env.HEALTH_CONTAINER_PADDING || '1rem',
    },
    header: {
      text: process.env.HEALTH_HEADER_TEXT || '#1f2937',
      fontSize: process.env.HEALTH_HEADER_FONT_SIZE || '1.25rem',
    },
    button: {
      primaryBg: process.env.HEALTH_BTN_PRIMARY_BG || '#3b82f6',
      primaryHover: process.env.HEALTH_BTN_PRIMARY_HOVER || '#2563eb',
      disabledBg: process.env.HEALTH_BTN_DISABLED_BG || '#9ca3af',
      text: process.env.HEALTH_BTN_TEXT || 'white',
      borderRadius: process.env.HEALTH_BTN_RADIUS || '0.375rem',
    },
    status: {
      healthy: {
        bg: process.env.HEALTH_STATUS_HEALTHY_BG || '#dcfce7',
        text: process.env.HEALTH_STATUS_HEALTHY_TEXT || '#16a34a',
      },
      unhealthy: {
        bg: process.env.HEALTH_STATUS_UNHEALTHY_BG || '#fee2e2',
        text: process.env.HEALTH_STATUS_UNHEALTHY_TEXT || '#dc2626',
      },
      unknown: {
        bg: process.env.HEALTH_STATUS_UNKNOWN_BG || '#f3f4f6',
        text: process.env.HEALTH_STATUS_UNKNOWN_TEXT || '#6b7280',
      },
    },
    labels: {
      primary: process.env.HEALTH_LABEL_PRIMARY || '#374151',
      secondary: process.env.HEALTH_LABEL_SECONDARY || '#6b7280',
      info: process.env.HEALTH_LABEL_INFO || '#4b5563',
    },
    error: {
      bg: process.env.HEALTH_ERROR_BG || '#fef2f2',
      border: process.env.HEALTH_ERROR_BORDER || '#ef4444',
      text: process.env.HEALTH_ERROR_TEXT || '#dc2626',
    },
    history: {
      sectionHeader: process.env.HEALTH_HISTORY_HEADER || '#1f2937',
      success: {
        bg: process.env.HEALTH_HISTORY_SUCCESS_BG || '#f0fdf4',
        border: process.env.HEALTH_HISTORY_SUCCESS_BORDER || '#bbf7d0',
        icon: process.env.HEALTH_HISTORY_SUCCESS_ICON || '#16a34a',
      },
      error: {
        bg: process.env.HEALTH_HISTORY_ERROR_BG || '#fef2f2',
        border: process.env.HEALTH_HISTORY_ERROR_BORDER || '#fecaca',
        icon: process.env.HEALTH_HISTORY_ERROR_ICON || '#dc2626',
      },
      info: process.env.HEALTH_HISTORY_INFO || '#6b7280',
      responseTime: process.env.HEALTH_HISTORY_RESPONSE_TIME || '#9ca3af',
    },
    emptyState: process.env.HEALTH_EMPTY_STATE || '#6b7280',
  },

  // Filter Section Colors - Flexy hates hardcoded filter colors!
  filterSection: {
    focusOutline: process.env.FILTER_FOCUS_OUTLINE || '#6b7280',
    scrollbar: {
      track: process.env.FILTER_SCROLLBAR_TRACK || 'transparent',
      thumb: process.env.FILTER_SCROLLBAR_THUMB || '#d1d5db',
      thumbHover: process.env.FILTER_SCROLLBAR_THUMB_HOVER || '#9ca3af',
    },
  },

  // Lifecycle Timeline Colors - Flexy hates hardcoded timeline colors!
  lifecycleTimeline: {
    border: process.env.LIFECYCLE_BORDER || '#e5e7eb',
    background: process.env.LIFECYCLE_BG || '#fafafa',
    title: process.env.LIFECYCLE_TITLE || '#1f2937',
    markers: {
      active: process.env.LIFECYCLE_MARKER_ACTIVE || '#22c55e',
      deprecated: process.env.LIFECYCLE_MARKER_DEPRECATED || '#f59e0b',
      discontinued: process.env.LIFECYCLE_MARKER_DISCONTINUED || '#ef4444',
      updated: process.env.LIFECYCLE_MARKER_UPDATED || '#3b82f6',
      pending: process.env.LIFECYCLE_MARKER_PENDING || '#6b7280',
      unknown: process.env.LIFECYCLE_MARKER_UNKNOWN || '#9ca3af',
    },
    connector: process.env.LIFECYCLE_CONNECTOR || '#d1d5db',
    statusChange: process.env.LIFECYCLE_STATUS_CHANGE || '#1f2937',
    date: process.env.LIFECYCLE_DATE || '#6b7280',
    details: process.env.LIFECYCLE_DETAILS || '#4b5563',
    reason: process.env.LIFECYCLE_REASON || '#374151',
    noHistory: process.env.LIFECYCLE_NO_HISTORY || '#6b7280',
    updateHeader: process.env.LIFECYCLE_UPDATE_HEADER || '#1f2937',
    version: process.env.LIFECYCLE_VERSION || '#1f2937',
    changelog: process.env.LIFECYCLE_CHANGELOG || '#4b5563',
    // Palette's micro-UX enhancements - hover, focus, and ripple colors
    hoverBg: process.env.LIFECYCLE_HOVER_BG || 'rgba(243, 244, 246, 0.5)',
    focusBg: process.env.LIFECYCLE_FOCUS_BG || 'rgba(229, 231, 235, 0.5)',
    rippleColor: process.env.LIFECYCLE_RIPPLE || '#9ca3af',
  },

  // Alternative Suggestions Colors - Flexy hates hardcoded alternative colors!
  alternativeSuggestions: {
    icon: {
      gradientStart: process.env.ALTERNATIVES_ICON_GRADIENT_START || '#fbbf24',
      gradientEnd: process.env.ALTERNATIVES_ICON_GRADIENT_END || '#f59e0b',
      shadow: process.env.ALTERNATIVES_ICON_SHADOW || 'rgba(251, 191, 36, 0.3)',
      shadowHover:
        process.env.ALTERNATIVES_ICON_SHADOW_HOVER || 'rgba(251, 191, 36, 0.4)',
    },
    title: process.env.ALTERNATIVES_TITLE || '#111827',
    subtitle: process.env.ALTERNATIVES_SUBTITLE || '#6b7280',
    link: {
      default: process.env.ALTERNATIVES_LINK_DEFAULT || '#2563eb',
      hover: process.env.ALTERNATIVES_LINK_HOVER || '#1d4ed8',
    },
    skeleton: {
      gradientStart: process.env.ALTERNATIVES_SKELETON_START || '#f3f4f6',
      gradientMiddle: process.env.ALTERNATIVES_SKELETON_MIDDLE || '#e5e7eb',
      gradientEnd: process.env.ALTERNATIVES_SKELETON_END || '#f3f4f6',
    },
    emptyState: {
      backgroundStart: process.env.ALTERNATIVES_EMPTY_BG_START || '#f9fafb',
      backgroundEnd: process.env.ALTERNATIVES_EMPTY_BG_END || '#f3f4f6',
      border: process.env.ALTERNATIVES_EMPTY_BORDER || '#e5e7eb',
      icon: process.env.ALTERNATIVES_EMPTY_ICON || '#9ca3af',
      title: process.env.ALTERNATIVES_EMPTY_TITLE || '#374151',
      message: process.env.ALTERNATIVES_EMPTY_MESSAGE || '#6b7280',
      ctaBg: process.env.ALTERNATIVES_EMPTY_CTA_BG || '#2563eb',
      ctaHover: process.env.ALTERNATIVES_EMPTY_CTA_HOVER || '#1d4ed8',
    },
    card: {
      background: process.env.ALTERNATIVES_CARD_BG || 'white',
      border: process.env.ALTERNATIVES_CARD_BORDER || '#e5e7eb',
      shadow: process.env.ALTERNATIVES_CARD_SHADOW || '0, 0, 0, 0.1',
    },
  },

  // Common UI Colors - Flexy hates hardcoded common colors!
  common: {
    white: process.env.COMMON_WHITE || '#ffffff',
    black: process.env.COMMON_BLACK || '#000000',
    gray: {
      50: process.env.GRAY_50 || '#f9fafb',
      100: process.env.GRAY_100 || '#f3f4f6',
      200: process.env.GRAY_200 || '#e5e7eb',
      300: process.env.GRAY_300 || '#d1d5db',
      400: process.env.GRAY_400 || '#9ca3af',
      500: process.env.GRAY_500 || '#6b7280',
      600: process.env.GRAY_600 || '#4b5563',
      700: process.env.GRAY_700 || '#374151',
      800: process.env.GRAY_800 || '#1f2937',
      900: process.env.GRAY_900 || '#111827',
    },
    blue: {
      400: process.env.BLUE_400 || '#60a5fa',
      500: process.env.BLUE_500 || '#3b82f6',
      600: process.env.BLUE_600 || '#2563eb',
      700: process.env.BLUE_700 || '#1d4ed8',
    },
    amber: {
      400: process.env.AMBER_400 || '#fbbf24',
      500: process.env.AMBER_500 || '#f59e0b',
      600: process.env.AMBER_600 || '#d97706',
    },
    green: {
      500: process.env.GREEN_500 || '#22c55e',
    },
    red: {
      500: process.env.RED_500 || '#ef4444',
    },
  },
} as const

export type ComponentColorsConfig = typeof componentColorsConfig
