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

  // Submission Review Colors - Flexy hates hardcoded submission colors!
  submissionReview: {
    warning: {
      bg: process.env.SUBMISSION_WARNING_BG || '#fff3cd',
      text: process.env.SUBMISSION_WARNING_TEXT || '#856404',
    },
    success: {
      bg: process.env.SUBMISSION_SUCCESS_BG || '#d4edda',
      text: process.env.SUBMISSION_SUCCESS_TEXT || '#155724',
    },
    error: {
      bg: process.env.SUBMISSION_ERROR_BG || '#f8d7da',
      text: process.env.SUBMISSION_ERROR_TEXT || '#721c24',
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
} as const

export type ComponentColorsConfig = typeof componentColorsConfig
