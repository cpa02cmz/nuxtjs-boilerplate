// Colors Configuration - Component-specific Colors
// Flexy hates hardcoded values! All color settings are now configurable.

export const colorsConfig = {
  // Status Badge Colors (CSS custom properties format)
  status: {
    active: {
      bg: process.env.STATUS_COLOR_ACTIVE_BG || 'rgb(220 252 231)',
      text: process.env.STATUS_COLOR_ACTIVE_TEXT || 'rgb(22 101 52)',
      border: process.env.STATUS_COLOR_ACTIVE_BORDER || 'rgb(187 247 208)',
    },
    deprecated: {
      bg: process.env.STATUS_COLOR_DEPRECATED_BG || 'rgb(254 243 199)',
      text: process.env.STATUS_COLOR_DEPRECATED_TEXT || 'rgb(146 64 14)',
      border: process.env.STATUS_COLOR_DEPRECATED_BORDER || 'rgb(253 230 138)',
    },
    discontinued: {
      bg: process.env.STATUS_COLOR_DISCONTINUED_BG || 'rgb(254 226 226)',
      text: process.env.STATUS_COLOR_DISCONTINUED_TEXT || 'rgb(185 28 28)',
      border:
        process.env.STATUS_COLOR_DISCONTINUED_BORDER || 'rgb(252 165 165)',
    },
    updated: {
      bg: process.env.STATUS_COLOR_UPDATED_BG || 'rgb(219 234 254)',
      text: process.env.STATUS_COLOR_UPDATED_TEXT || 'rgb(30 64 175)',
      border: process.env.STATUS_COLOR_UPDATED_BORDER || 'rgb(191 219 254)',
    },
    pending: {
      bg: process.env.STATUS_COLOR_PENDING_BG || 'rgb(229 231 235)',
      text: process.env.STATUS_COLOR_PENDING_TEXT || 'rgb(55 65 81)',
      border: process.env.STATUS_COLOR_PENDING_BORDER || 'rgb(209 213 219)',
    },
    unknown: {
      bg: process.env.STATUS_COLOR_UNKNOWN_BG || 'rgb(229 231 235)',
      text: process.env.STATUS_COLOR_UNKNOWN_TEXT || 'rgb(55 65 81)',
      border: process.env.STATUS_COLOR_UNKNOWN_BORDER || 'rgb(209 213 219)',
    },
  },

  // Health Indicator Colors
  health: {
    excellent: process.env.HEALTH_COLOR_EXCELLENT || '#22c55e',
    good: process.env.HEALTH_COLOR_GOOD || '#22c55e',
    fair: process.env.HEALTH_COLOR_FAIR || '#f59e0b',
    poor: process.env.HEALTH_COLOR_POOR || '#ef4444',
    unknown: process.env.HEALTH_COLOR_UNKNOWN || '#9ca3af',
  },

  // Toast/Notification Colors (already in theme.config, but duplicated here for component use)
  toast: {
    success: {
      bg: process.env.TOAST_COLOR_SUCCESS_BG || '#f0fdf4',
      border: process.env.TOAST_COLOR_SUCCESS_BORDER || '#22c55e',
      text: process.env.TOAST_COLOR_SUCCESS_TEXT || '#166534',
    },
    error: {
      bg: process.env.TOAST_COLOR_ERROR_BG || '#fef2f2',
      border: process.env.TOAST_COLOR_ERROR_BORDER || '#ef4444',
      text: process.env.TOAST_COLOR_ERROR_TEXT || '#b91c1c',
    },
    warning: {
      bg: process.env.TOAST_COLOR_WARNING_BG || '#fffbeb',
      border: process.env.TOAST_COLOR_WARNING_BORDER || '#f59e0b',
      text: process.env.TOAST_COLOR_WARNING_TEXT || '#92400e',
    },
    info: {
      bg: process.env.TOAST_COLOR_INFO_BG || '#eff6ff',
      border: process.env.TOAST_COLOR_INFO_BORDER || '#3b82f6',
      text: process.env.TOAST_COLOR_INFO_TEXT || '#1e40af',
    },
  },

  // Scrollbar Colors
  scrollbar: {
    track: process.env.SCROLLBAR_COLOR_TRACK || '#f1f5f9',
    thumb: process.env.SCROLLBAR_COLOR_THUMB || '#cbd5e1',
    thumbHover: process.env.SCROLLBAR_COLOR_THUMB_HOVER || '#94a3b8',
  },

  // API Documentation Colors
  apiDocs: {
    headerBg: process.env.API_DOCS_HEADER_BG || '#4f46e5',
  },
} as const

export type ColorsConfig = typeof colorsConfig
