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
} as const

export type ThemeConfig = typeof themeConfig
