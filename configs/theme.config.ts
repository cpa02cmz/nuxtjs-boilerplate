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
} as const

export type ThemeConfig = typeof themeConfig
