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

  // Status Badge Colors
  status: {
    active: {
      bg: process.env.STATUS_ACTIVE_BG || '#dcfce7',
      text: process.env.STATUS_ACTIVE_TEXT || '#166534',
    },
    deprecated: {
      bg: process.env.STATUS_DEPRECATED_BG || '#fef9c3',
      text: process.env.STATUS_DEPRECATED_TEXT || '#854d0e',
    },
    discontinued: {
      bg: process.env.STATUS_DISCONTINUED_BG || '#fee2e2',
      text: process.env.STATUS_DISCONTINUED_TEXT || '#991b1b',
    },
    pending: {
      bg: process.env.STATUS_PENDING_BG || '#dbeafe',
      text: process.env.STATUS_PENDING_TEXT || '#1e40af',
    },
  },

  // Social Media Brand Colors
  social: {
    twitter: {
      bg: process.env.SOCIAL_TWITTER_BG || '#3b82f6',
      hover: process.env.SOCIAL_TWITTER_HOVER || '#2563eb',
    },
    facebook: {
      bg: process.env.SOCIAL_FACEBOOK_BG || '#1d4ed8',
      hover: process.env.SOCIAL_FACEBOOK_HOVER || '#1e40af',
    },
    linkedin: {
      bg: process.env.SOCIAL_LINKEDIN_BG || '#0077b5',
      hover: process.env.SOCIAL_LINKEDIN_HOVER || '#005885',
    },
    reddit: {
      bg: process.env.SOCIAL_REDDIT_BG || '#f97316',
      hover: process.env.SOCIAL_REDDIT_HOVER || '#ea580c',
    },
    email: {
      bg: process.env.SOCIAL_EMAIL_BG || '#6b7280',
      hover: process.env.SOCIAL_EMAIL_HOVER || '#4b5563',
    },
    copy: {
      bg: process.env.SOCIAL_COPY_BG || '#10b981',
      hover: process.env.SOCIAL_COPY_HOVER || '#059669',
    },
  },

  // Skeleton Loader Colors
  skeleton: {
    base: process.env.SKELETON_BASE_COLOR || '#e5e7eb',
    highlight: process.env.SKELETON_HIGHLIGHT_COLOR || '#f3f4f6',
    shine: process.env.SKELETON_SHINE_COLOR || '#d1d5db',
    text: process.env.SKELETON_TEXT_COLOR || '#374151',
  },

  // Scrollbar Colors
  scrollbar: {
    track: process.env.SCROLLBAR_TRACK_COLOR || '#f1f5f9',
    thumb: process.env.SCROLLBAR_THUMB_COLOR || '#cbd5e1',
    thumbHover: process.env.SCROLLBAR_THUMB_HOVER_COLOR || '#94a3b8',
  },

  // Status Manager Component Colors
  statusManager: {
    borderColor: process.env.STATUS_MANAGER_BORDER || '#e5e7eb',
    selectBg: process.env.STATUS_MANAGER_SELECT_BG || '#ffffff',
    selectBorder: process.env.STATUS_MANAGER_SELECT_BORDER || '#d1d5db',
    selectFocus: process.env.STATUS_MANAGER_SELECT_FOCUS || '#3b82f6',
    updateButtonBg: process.env.STATUS_MANAGER_UPDATE_BTN_BG || '#4f46e5',
    updateButtonHover: process.env.STATUS_MANAGER_UPDATE_BTN_HOVER || '#4338ca',
  },
} as const

export type ThemeConfig = typeof themeConfig
