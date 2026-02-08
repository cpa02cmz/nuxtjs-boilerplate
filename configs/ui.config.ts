// ============================================
// UI CONFIGURATION
// Animation durations, z-index, spacing, and styling
// ============================================

export const UI_CONFIG = {
  // Animation durations (in seconds)
  animation: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    xslow: 1.0,
  },

  // Animation durations (in milliseconds)
  animationMs: {
    fast: 200,
    normal: 300,
    slow: 500,
    xslow: 1000,
  },

  // Z-index scale
  zIndex: {
    toast: 9999,
    modal: 9000,
    overlay: 8000,
    dropdown: 1000,
    sticky: 100,
    base: 1,
    below: -1,
  },

  // Spacing scale (in rem units)
  spacing: {
    xs: 0.25, // 4px
    sm: 0.5, // 8px
    md: 0.75, // 12px
    lg: 1, // 16px
    xl: 1.5, // 24px
    '2xl': 2, // 32px
    '3xl': 3, // 48px
    '4xl': 4, // 64px
  },

  // Border radius (in rem)
  borderRadius: {
    none: 0,
    sm: 0.25,
    md: 0.5,
    lg: 0.75,
    xl: 1,
    full: 9999,
  },

  // Font sizes (in rem)
  fontSize: {
    xs: 0.75, // 12px
    sm: 0.875, // 14px
    md: 1, // 16px
    lg: 1.125, // 18px
    xl: 1.25, // 20px
    '2xl': 1.5, // 24px
    '3xl': 1.875, // 30px
    '4xl': 2.25, // 36px
  },

  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Container widths (in pixels)
  container: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },

  // Max content widths
  contentMaxWidth: {
    prose: '65ch',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    full: '100%',
  },

  // Colors (for reference - Tailwind classes preferred)
  colors: {
    primary: '#4f46e5',
    primaryDark: '#4338ca',
    background: '#ffffff',
    backgroundDark: '#111827',
    text: '#111827',
    textDark: '#f9fafb',
    border: '#e5e7eb',
    borderDark: '#374151',
  },

  // Skeleton loader colors
  skeleton: {
    light: {
      start: '#e5e7eb',
      end: '#f3f4f6',
      border: '#9ca3af',
    },
    dark: {
      start: '#374151',
      end: '#4b5563',
      border: '#6b7280',
    },
  },
} as const

// Toast notification configuration
export const TOAST_CONFIG = {
  // Display durations (in milliseconds)
  duration: {
    success: 5000,
    error: 10000,
    warning: 7000,
    info: 5000,
  },

  // Positioning
  position: {
    top: 20,
    right: 20,
    maxWidth: 400,
    minWidth: 300,
  },

  // Check interval
  checkInterval: 100,

  // Max visible toasts
  maxVisible: 5,
} as const

// Feedback messages configuration
export const FEEDBACK_CONFIG = {
  // Display durations (in milliseconds)
  duration: {
    message: 3000,
    announcement: 3000,
    success: 3000,
    error: 5000,
  },

  // Auto-dismiss delays
  autoDismiss: {
    success: 3000,
    error: 5000,
    warning: 4000,
    info: 3000,
  },
} as const

// Timing configuration for UI interactions
export const UI_TIMING_CONFIG = {
  // Debounce delays
  debounce: {
    search: 300,
    input: 300,
    resize: 200,
    scroll: 100,
  },

  // Delay for blur events
  blurDelay: 200,

  // Check intervals
  interval: {
    suggestion: 100,
    toast: 100,
    connection: 100,
  },

  // Connection timeout
  connection: {
    timeout: 5000,
    retryInterval: 100,
  },

  // Animation leave duration
  animationLeave: 200,
} as const

// Skeleton loader dimensions
export const SKELETON_CONFIG = {
  // Default sizes
  default: {
    width: '100%',
    height: '1rem',
  },

  // Preset sizes
  presets: {
    title: { width: '60%', height: '1.5rem' },
    text: { width: '100%', height: '1rem' },
    avatar: { width: '2.5rem', height: '2.5rem' },
    button: { width: '80px', height: '28px' },
    card: { width: '100%', height: '200px' },
  },

  // Animation
  animation: {
    duration: 1.5,
    easing: 'linear',
  },
} as const
