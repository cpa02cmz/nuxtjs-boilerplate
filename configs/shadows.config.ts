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

  // Reading Progress Shimmer
  readingProgress: {
    shimmer: process.env.READING_PROGRESS_SHIMMER || 'rgba(255, 255, 255, 0.4)',
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
} as const

export type ShadowsConfig = typeof shadowsConfig
