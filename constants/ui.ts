/**
 * UI Constants
 * User interface layout, colors, animations, and styling
 * Flexy approves - consistent UI across the app!
 */

// UI Layout constants (in pixels)
export const UI_LAYOUT = {
  // Toast/notification positioning
  toastContainerTop: 20,
  toastContainerRight: 20,
  toastMaxWidth: 400,
  toastMinWidth: 300,

  // Spacing scale (in rem units, multiplied by 0.25)
  spacingXs: 0.25, // 0.25rem = 4px
  spacingSm: 0.5, // 0.5rem = 8px
  spacingMd: 0.75, // 0.75rem = 12px
  spacingLg: 1, // 1rem = 16px
  spacingXl: 1.5, // 1.5rem = 24px
  spacing2Xl: 2, // 2rem = 32px

  // Border radius (in rem)
  borderRadiusSm: 0.25,
  borderRadiusMd: 0.5,
  borderRadiusLg: 0.75,

  // Font sizes (in rem)
  fontSizeSm: 0.75,
  fontSizeMd: 0.875,
  fontSizeLg: 1,

  // Line heights (in rem)
  lineHeightSm: 1,
  lineHeightMd: 1.25,
  lineHeightLg: 1.5,
} as const

// Toast notification durations (in milliseconds)
export const TOAST_DURATION = {
  success: 5000,
  error: 10000,
  warning: 7000,
  info: 5000,
} as const

// Toast theme colors
export const TOAST_THEME = {
  success: {
    background: '#f0fdf4',
    border: '#22c55e',
    text: '#166534',
  },
  error: {
    background: '#fef2f2',
    border: '#ef4444',
    text: '#b91c1c',
  },
  warning: {
    background: '#fffbeb',
    border: '#f59e0b',
    text: '#92400e',
  },
  info: {
    background: '#eff6ff',
    border: '#3b82f6',
    text: '#1e40af',
  },
} as const

// Animation durations (in seconds)
export const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
} as const

// Z-index scale
export const Z_INDEX = {
  toast: 9999,
  modal: 9000,
  dropdown: 1000,
  sticky: 100,
} as const

// UI feedback durations (in milliseconds)
export const UI_FEEDBACK_DURATION = {
  messageDisplay: 3000,
  announcementClear: 3000,
  successMessageClear: 3000,
  errorDisplay: 5000,
} as const

// UI timing constants (in milliseconds)
export const UI_TIMING = {
  // Search and input debouncing
  searchDebounceMs: 300,
  searchBlurDelayMs: 200,
  suggestionCheckIntervalMs: 100,

  // Connection checking
  connectionTimeoutMs: 5000,
  connectionRetryIntervalMs: 100,

  // Toast and notification intervals
  toastCheckIntervalMs: 100,

  // Animation durations
  animationDurationMs: 300,
  animationLeaveDurationMs: 200,
} as const

// Container heights
export const CONTAINER_HEIGHTS = {
  resourceList: 'calc(100vh - 200px)',
} as const

// Skeleton dimensions
export const SKELETON_DIMENSIONS = {
  categoryButton: {
    width: '80px',
    height: '28px',
  },
} as const

// Spinner sizes (in rem)
export const SPINNER_SIZES = {
  sm: '1rem',
  md: '1.5rem',
  lg: '3rem',
} as const

// Image configuration
export const IMAGE_CONFIG = {
  quality: 80,
  formats: ['webp', 'avif', 'jpeg'] as const,
  densities: [1, 2] as const,
} as const

// Search configuration
export const SEARCH_CONFIG = {
  minQueryLength: 2,
  maxSuggestions: 5,
  maxHistoryItems: 10,
  snippetMaxLength: 160,
  snippetContextRatio: 4, // maxLength / 4
} as const

// Pagination
export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
  maxItemsPerRequest: 1000,
} as const

// Highlight styling
export const HIGHLIGHT_STYLES = {
  class: 'bg-yellow-200 text-gray-900',
} as const
