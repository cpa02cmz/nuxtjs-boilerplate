// Shadows Configuration - All shadow and rgba values centralized
// Flexy hates hardcoded values! All shadow settings are now configurable.

export const shadowsConfig = {
  // Scroll To Top Component Shadows
  scrollToTop: {
    default:
      process.env.SCROLLTOTOP_SHADOW_DEFAULT ||
      '0 4px 12px rgba(0, 0, 0, 0.15)',
    hover:
      process.env.SCROLLTOTOP_SHADOW_HOVER || '0 6px 20px rgba(0, 0, 0, 0.2)',
    focus: {
      primary:
        process.env.SCROLLTOTOP_SHADOW_FOCUS_PRIMARY ||
        'rgba(59, 130, 246, 0.5)',
      secondary:
        process.env.SCROLLTOTOP_SHADOW_FOCUS_SECONDARY ||
        '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
  },

  // Toast/Notification Shadows
  toast: {
    default:
      process.env.TOAST_SHADOW_DEFAULT || '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    hover:
      process.env.TOAST_SHADOW_HOVER || '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  // Focus Ring Shadows (used across components)
  focusRing: {
    blue: process.env.FOCUS_RING_BLUE || 'rgba(59, 130, 246, 0.5)',
    primary:
      process.env.FOCUS_RING_PRIMARY || '0 0 0 3px rgba(59, 130, 246, 0.5)',
  },

  // PWA Install Prompt Shadows
  pwaInstall: {
    iconPulse: process.env.PWA_ICON_PULSE_SHADOW || 'rgba(59, 130, 246, 0.4)',
  },

  // Offline Indicator Shadows
  offlineIndicator: {
    pulse:
      process.env.OFFLINE_INDICATOR_PULSE_SHADOW || 'rgba(217, 119, 6, 0.4)',
  },

  // Modal/Dialog Shadows
  modal: {
    overlay: process.env.MODAL_OVERLAY_BG || 'rgba(0, 0, 0, 0.5)',
    content:
      process.env.MODAL_SHADOW_CONTENT ||
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  // Resource Card Shadows
  resourceCard: {
    ripple:
      process.env.RESOURCE_CARD_RIPPLE_COLOR || 'rgba(255, 255, 255, 0.25)',
  },

  // Filter Chip Shimmer Effect
  filterChip: {
    shimmer: process.env.FILTER_CHIP_SHIMMER || 'rgba(255, 255, 255, 0.4)',
  },

  // Reading Progress Shimmer & Text Shadow
  readingProgress: {
    shimmer: process.env.READING_PROGRESS_SHIMMER || 'rgba(255, 255, 255, 0.4)',
    textShadow:
      process.env.READING_PROGRESS_TEXT_SHADOW ||
      '0 1px 2px rgba(0, 0, 0, 0.1)',
  },

  // Moderation Dashboard Shadows
  moderationDashboard: {
    cardShadow:
      process.env.MODERATION_CARD_SHADOW || '0 4px 8px rgba(0, 0, 0, 0.1)',
    approvedBg: process.env.MODERATION_APPROVED_BG || 'rgba(40, 167, 69, 0.1)',
    rejectedBg: process.env.MODERATION_REJECTED_BG || 'rgba(220, 53, 69, 0.1)',
    flaggedBg: process.env.MODERATION_FLAGGED_BG || 'rgba(255, 193, 7, 0.1)',
    pendingBg: process.env.MODERATION_PENDING_BG || 'rgba(0, 123, 255, 0.1)',
  },

  // Search Focus Pulse Colors
  searchFocus: {
    pulseStart:
      process.env.SEARCH_FOCUS_PULSE_START || 'rgba(59, 130, 246, 0.4)',
    pulseMid: process.env.SEARCH_FOCUS_PULSE_MID || 'rgba(59, 130, 246, 0.2)',
    pulseEnd: process.env.SEARCH_FOCUS_PULSE_END || 'rgba(59, 130, 246, 0)',
  },

  // Color Opacity Variants (centralized rgba values)
  colors: {
    primary: {
      base: process.env.COLOR_PRIMARY_BASE || '#3b82f6',
      opacity10:
        process.env.COLOR_PRIMARY_OPACITY10 || 'rgba(59, 130, 246, 0.1)',
      opacity20:
        process.env.COLOR_PRIMARY_OPACITY20 || 'rgba(59, 130, 246, 0.2)',
      opacity40:
        process.env.COLOR_PRIMARY_OPACITY40 || 'rgba(59, 130, 246, 0.4)',
      opacity50:
        process.env.COLOR_PRIMARY_OPACITY50 || 'rgba(59, 130, 246, 0.5)',
    },
    black: {
      opacity10: process.env.COLOR_BLACK_OPACITY10 || 'rgba(0, 0, 0, 0.1)',
      opacity15: process.env.COLOR_BLACK_OPACITY15 || 'rgba(0, 0, 0, 0.15)',
      opacity20: process.env.COLOR_BLACK_OPACITY20 || 'rgba(0, 0, 0, 0.2)',
      opacity25: process.env.COLOR_BLACK_OPACITY25 || 'rgba(0, 0, 0, 0.25)',
      opacity50: process.env.COLOR_BLACK_OPACITY50 || 'rgba(0, 0, 0, 0.5)',
    },
    white: {
      opacity25:
        process.env.COLOR_WHITE_OPACITY25 || 'rgba(255, 255, 255, 0.25)',
      opacity40:
        process.env.COLOR_WHITE_OPACITY40 || 'rgba(255, 255, 255, 0.4)',
      opacity50:
        process.env.COLOR_WHITE_OPACITY50 || 'rgba(255, 255, 255, 0.5)',
    },
    amber: {
      opacity40: process.env.COLOR_AMBER_OPACITY40 || 'rgba(217, 119, 6, 0.4)',
    },
  },

  // Box Shadow Scale
  boxShadow: {
    sm: process.env.SHADOW_SM || '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: process.env.SHADOW_MD || '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: process.env.SHADOW_LG || '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: process.env.SHADOW_XL || '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': process.env.SHADOW_2XL || '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: process.env.SHADOW_INNER || 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  // Review Queue Shadows
  reviewQueue: {
    cardShadow:
      process.env.REVIEW_QUEUE_CARD_SHADOW || '0 2px 8px rgba(0, 0, 0, 0.1)',
    cardShadowHover:
      process.env.REVIEW_QUEUE_CARD_SHADOW_HOVER ||
      '0 4px 12px rgba(0, 0, 0, 0.15)',
    buttonShadowHover:
      process.env.REVIEW_QUEUE_BUTTON_SHADOW_HOVER ||
      '0 4px 8px rgba(0, 0, 0, 0.2)',
  },

  // Toast Component Shadows (multi-layer)
  toastComponent: {
    default:
      process.env.TOAST_COMPONENT_SHADOW ||
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },

  // Resource Card Shadows (multi-layer)
  resourceCardComponent: {
    card:
      process.env.RESOURCE_CARD_COMPONENT_SHADOW ||
      '0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 10px 20px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.1)',
    actions:
      process.env.RESOURCE_CARD_ACTIONS_SHADOW ||
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05)',
  },

  // Share Button Shadows (multi-layer)
  shareButton: {
    default:
      process.env.SHARE_BUTTON_SHADOW ||
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05)',
  },

  // Social Share Shadows (multi-layer)
  socialShare: {
    default:
      process.env.SOCIAL_SHARE_SHADOW ||
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05)',
  },

  // Active Filters Shadows
  activeFilters: {
    default:
      process.env.ACTIVE_FILTERS_SHADOW ||
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    focusPrimary:
      process.env.ACTIVE_FILTERS_FOCUS_PRIMARY || 'rgba(59, 130, 246, 0.3)',
    focusRing: {
      default:
        process.env.ACTIVE_FILTERS_FOCUS_RING ||
        '0 0 0 3px rgba(59, 130, 246, 0.3)',
      pulse:
        process.env.ACTIVE_FILTERS_FOCUS_PULSE ||
        '0 0 0 5px rgba(59, 130, 246, 0.2)',
    },
  },

  // Status Manager Shadows
  statusManager: {
    default:
      process.env.STATUS_MANAGER_SHADOW ||
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    focusRing: {
      default:
        process.env.STATUS_MANAGER_FOCUS_RING ||
        '0 0 0 3px rgba(59, 130, 246, 0.1)',
      pulseStart:
        process.env.STATUS_MANAGER_PULSE_START || 'rgba(59, 130, 246, 0.4)',
      pulseEnd: process.env.STATUS_MANAGER_PULSE_END || 'rgba(59, 130, 246, 0)',
    },
  },

  // Lifecycle Timeline Shadows
  lifecycleTimeline: {
    default:
      process.env.LIFECYCLE_TIMELINE_SHADOW || '0 2px 4px rgba(0, 0, 0, 0.1)',
  },

  // Resource Share Shadows
  resourceShare: {
    default:
      process.env.RESOURCE_SHARE_SHADOW || '0 4px 12px rgba(0, 0, 0, 0.15)',
  },

  // Resource Card Skeleton Shadows
  resourceCardSkeleton: {
    pulseStart: process.env.SKELETON_PULSE_START || 'rgba(209, 213, 219, 0.4)',
    pulseEnd: process.env.SKELETON_PULSE_END || 'rgba(209, 213, 219, 0)',
  },

  // Resource Comments Shadows
  resourceComments: {
    pulseStart: process.env.COMMENTS_PULSE_START || 'rgba(34, 197, 94, 0.4)',
    pulseMid: process.env.COMMENTS_PULSE_MID || 'rgba(34, 197, 94, 0.2)',
    pulseEnd: process.env.COMMENTS_PULSE_END || 'rgba(34, 197, 94, 0)',
  },

  // PWA Install Prompt Shadows
  pwaInstallPrompt: {
    pulseStart: process.env.PWA_PULSE_START || 'rgba(59, 130, 246, 0.4)',
    pulseEnd: process.env.PWA_PULSE_END || 'rgba(59, 130, 246, 0)',
  },

  // Error Boundary Shadows
  errorBoundary: {
    successPulseStart:
      process.env.ERROR_SUCCESS_PULSE_START || 'rgba(34, 197, 94, 0.7)',
    successPulseMid:
      process.env.ERROR_SUCCESS_PULSE_MID || 'rgba(34, 197, 94, 0)',
    focusRing: {
      default:
        process.env.ERROR_FOCUS_RING || '0 0 0 3px rgba(59, 130, 246, 0.4)',
      pulse:
        process.env.ERROR_FOCUS_PULSE || '0 0 0 5px rgba(59, 130, 246, 0.2)',
    },
  },

  // Deprecation Notice Shadows
  deprecationNotice: {
    default: process.env.DEPRECATION_SHADOW || '0 2px 4px rgba(0, 0, 0, 0.1)',
    warning:
      process.env.DEPRECATION_WARNING_SHADOW || '0 2px 4px rgba(0, 0, 0, 0.1)',
    pulseStart:
      process.env.DEPRECATION_PULSE_START || 'rgba(245, 158, 11, 0.4)',
    pulseEnd: process.env.DEPRECATION_PULSE_END || 'rgba(245, 158, 11, 0)',
  },

  // Resource Breadcrumbs Shadows
  breadcrumbs: {
    pulseStart: process.env.BREADCRUMBS_PULSE_START || 'rgba(37, 99, 235, 0.4)',
    pulseEnd: process.env.BREADCRUMBS_PULSE_END || 'rgba(37, 99, 235, 0)',
  },

  // Offline Indicator Component Shadows
  offlineIndicatorComponent: {
    default:
      process.env.OFFLINE_COMPONENT_SHADOW || '0 2px 4px rgba(0, 0, 0, 0.1)',
  },

  // Additional Color Opacity Variants
  colorsExtended: {
    green: {
      opacity40: process.env.COLOR_GREEN_OPACITY40 || 'rgba(34, 197, 94, 0.4)',
      opacity70: process.env.COLOR_GREEN_OPACITY70 || 'rgba(34, 197, 94, 0.7)',
    },
    blueAlt: {
      opacity30:
        process.env.COLOR_BLUE_ALT_OPACITY30 || 'rgba(37, 99, 235, 0.3)',
      opacity40:
        process.env.COLOR_BLUE_ALT_OPACITY40 || 'rgba(37, 99, 235, 0.4)',
    },
    gray: {
      opacity40: process.env.COLOR_GRAY_OPACITY40 || 'rgba(209, 213, 219, 0.4)',
    },
    amberAlt: {
      opacity40:
        process.env.COLOR_AMBER_ALT_OPACITY40 || 'rgba(245, 158, 11, 0.4)',
    },
  },

  // Text Shadows
  textShadow: {
    sm: process.env.TEXT_SHADOW_SM || '0 1px 2px rgba(0, 0, 0, 0.1)',
  },
} as const

export type ShadowsConfig = typeof shadowsConfig
