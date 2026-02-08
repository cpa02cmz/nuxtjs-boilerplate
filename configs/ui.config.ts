/**
 * UI Configuration
 * Flexy says: UI constants should be centralized!
 */

// Toast Notification Configuration
export const TOAST_CONFIG = {
  // Display durations (in milliseconds)
  duration: {
    success: parseInt(process.env.TOAST_DURATION_SUCCESS || '5000'),
    error: parseInt(process.env.TOAST_DURATION_ERROR || '10000'),
    warning: parseInt(process.env.TOAST_DURATION_WARNING || '7000'),
    info: parseInt(process.env.TOAST_DURATION_INFO || '5000'),
  },

  // Positioning
  position: {
    top: parseInt(process.env.TOAST_POSITION_TOP || '20'),
    right: parseInt(process.env.TOAST_POSITION_RIGHT || '20'),
    maxWidth: parseInt(process.env.TOAST_MAX_WIDTH || '400'),
    minWidth: parseInt(process.env.TOAST_MIN_WIDTH || '300'),
  },

  // Animation
  animation: {
    enterDuration: parseInt(process.env.TOAST_ANIMATION_ENTER || '300'),
    leaveDuration: parseInt(process.env.TOAST_ANIMATION_LEAVE || '200'),
  },

  // Colors (using Tailwind classes)
  styles: {
    success: {
      background: 'bg-green-50',
      border: 'border-l-4 border-green-500',
      text: 'text-green-800',
      icon: 'text-green-500',
    },
    error: {
      background: 'bg-red-50',
      border: 'border-l-4 border-red-500',
      text: 'text-red-800',
      icon: 'text-red-500',
    },
    warning: {
      background: 'bg-yellow-50',
      border: 'border-l-4 border-yellow-500',
      text: 'text-yellow-800',
      icon: 'text-yellow-500',
    },
    info: {
      background: 'bg-blue-50',
      border: 'border-l-4 border-blue-500',
      text: 'text-blue-800',
      icon: 'text-blue-500',
    },
  },
} as const

// UI Feedback Timing
export const UI_FEEDBACK = {
  // Message display duration
  messageDisplay: parseInt(process.env.UI_MESSAGE_DURATION || '3000'),

  // Announcement clear delay
  announcementClear: parseInt(process.env.UI_ANNOUNCEMENT_CLEAR || '3000'),

  // Success message clear
  successMessageClear: parseInt(process.env.UI_SUCCESS_CLEAR || '3000'),
} as const

// UI Timing Constants
export const UI_TIMING = {
  // Search debouncing
  searchDebounceMs: parseInt(process.env.UI_SEARCH_DEBOUNCE || '300'),
  searchBlurDelayMs: parseInt(process.env.UI_SEARCH_BLUR_DELAY || '200'),

  // Connection checking
  connectionTimeoutMs: parseInt(process.env.UI_CONNECTION_TIMEOUT || '5000'),
  connectionRetryIntervalMs: parseInt(process.env.UI_CONNECTION_RETRY || '100'),

  // Animation durations
  animationDurationMs: parseInt(process.env.UI_ANIMATION_DURATION || '300'),
  animationLeaveDurationMs: parseInt(process.env.UI_ANIMATION_LEAVE || '200'),
} as const

// Layout Constants
export const UI_LAYOUT = {
  // Spacing scale (in rem, multiplied by 0.25)
  spacing: {
    xs: 0.25,
    sm: 0.5,
    md: 0.75,
    lg: 1,
    xl: 1.5,
    '2xl': 2,
  },

  // Border radius (in rem)
  borderRadius: {
    sm: 0.25,
    md: 0.5,
    lg: 0.75,
    full: 9999,
  },

  // Font sizes (in rem)
  fontSize: {
    sm: 0.75,
    md: 0.875,
    lg: 1,
    xl: 1.125,
    '2xl': 1.25,
  },

  // Line heights
  lineHeight: {
    sm: 1,
    md: 1.25,
    lg: 1.5,
  },
} as const

// Z-Index Scale
export const Z_INDEX = {
  toast: 9999,
  modal: 9000,
  dropdown: 1000,
  sticky: 100,
  base: 1,
} as const

// Animation Durations (in seconds)
export const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
} as const

// Skeleton Loader Configuration
export const SKELETON_CONFIG = {
  colors: {
    light: {
      start: '#e5e7eb',
      end: '#f3f4f6',
    },
    dark: {
      start: '#374151',
      end: '#4b5563',
    },
  },
  animation: {
    duration: '1.5s',
  },
} as const

// Export all UI configs
export default {
  toast: TOAST_CONFIG,
  feedback: UI_FEEDBACK,
  timing: UI_TIMING,
  layout: UI_LAYOUT,
  zIndex: Z_INDEX,
  animation: ANIMATION_DURATION,
  skeleton: SKELETON_CONFIG,
}
