// Status Configuration - Resource Status Labels, Colors, and Thresholds
// Flexy hates hardcoded values! All status settings are now configurable.

export const statusConfig = {
  // Status Types and Labels
  statuses: {
    active: {
      label: process.env.STATUS_ACTIVE_LABEL || 'Active',
      title:
        process.env.STATUS_ACTIVE_TITLE ||
        'This resource is currently active and maintained',
    },
    deprecated: {
      label: process.env.STATUS_DEPRECATED_LABEL || 'Deprecated',
      title:
        process.env.STATUS_DEPRECATED_TITLE ||
        'This resource is deprecated and no longer recommended',
    },
    discontinued: {
      label: process.env.STATUS_DISCONTINUED_LABEL || 'Discontinued',
      title:
        process.env.STATUS_DISCONTINUED_TITLE ||
        'This resource has been discontinued',
    },
    updated: {
      label: process.env.STATUS_UPDATED_LABEL || 'Updated',
      title:
        process.env.STATUS_UPDATED_TITLE ||
        'This resource has been recently updated',
    },
    pending: {
      label: process.env.STATUS_PENDING_LABEL || 'Pending',
      title:
        process.env.STATUS_PENDING_TITLE || 'This resource is pending review',
    },
    unknown: {
      label: process.env.STATUS_UNKNOWN_LABEL || 'Unknown',
      title: process.env.STATUS_UNKNOWN_TITLE || 'Status unknown',
    },
  },

  // Status Badge Colors (background, text, border)
  colors: {
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

  // Health Score Thresholds
  healthThresholds: {
    excellent: parseInt(process.env.HEALTH_THRESHOLD_EXCELLENT || '90'),
    good: parseInt(process.env.HEALTH_THRESHOLD_GOOD || '70'),
    fair: parseInt(process.env.HEALTH_THRESHOLD_FAIR || '50'),
  },

  // Health Labels
  healthLabels: {
    excellent: process.env.HEALTH_LABEL_EXCELLENT || 'Health: Excellent',
    good: process.env.HEALTH_LABEL_GOOD || 'Health: Good',
    fair: process.env.HEALTH_LABEL_FAIR || 'Health: Fair',
    poor: process.env.HEALTH_LABEL_POOR || 'Health: Poor',
    unknown: process.env.HEALTH_LABEL_UNKNOWN || 'Health status unknown',
  },

  // Health Colors (for SVG/icons)
  healthColors: {
    good: process.env.HEALTH_COLOR_GOOD || '#22c55e',
    warning: process.env.HEALTH_COLOR_WARNING || '#f59e0b',
    bad: process.env.HEALTH_COLOR_BAD || '#ef4444',
    unknown: process.env.HEALTH_COLOR_UNKNOWN || '#9ca3af',
  },
} as const

export type StatusConfig = typeof statusConfig
export type StatusType = keyof typeof statusConfig.statuses
