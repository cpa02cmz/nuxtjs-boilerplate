/**
 * Theme Configuration
 * All colors, spacing, and visual styling
 * Flexy says: "Colors should be centralized, not scattered!"
 */

// Color Palette
export const COLORS = {
  // Primary colors
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },

  // Neutral colors
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Status colors - Success
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Status colors - Error
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Status colors - Warning
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Status colors - Info
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
} as const

// Semantic Colors (mapped to use cases)
export const SEMANTIC_COLORS = {
  // Background colors
  background: {
    primary: COLORS.neutral[0],
    secondary: COLORS.neutral[50],
    tertiary: COLORS.neutral[100],
    inverse: COLORS.neutral[900],
  },

  // Text colors
  text: {
    primary: COLORS.neutral[900],
    secondary: COLORS.neutral[600],
    tertiary: COLORS.neutral[400],
    inverse: COLORS.neutral[0],
    disabled: COLORS.neutral[400],
  },

  // Border colors
  border: {
    default: COLORS.neutral[200],
    hover: COLORS.neutral[300],
    focus: COLORS.primary[500],
    error: COLORS.error[500],
  },

  // Status badges
  status: {
    active: {
      background: COLORS.success[50],
      text: COLORS.success[800],
      border: COLORS.success[200],
    },
    inactive: {
      background: COLORS.neutral[100],
      text: COLORS.neutral[600],
      border: COLORS.neutral[200],
    },
    pending: {
      background: COLORS.warning[50],
      text: COLORS.warning[800],
      border: COLORS.warning[200],
    },
    error: {
      background: COLORS.error[50],
      text: COLORS.error[800],
      border: COLORS.error[200],
    },
    info: {
      background: COLORS.info[50],
      text: COLORS.info[800],
      border: COLORS.info[200],
    },
  },

  // Toast notifications
  toast: {
    success: {
      background: COLORS.success[50],
      border: COLORS.success[200],
      text: COLORS.success[800],
      icon: COLORS.success[500],
    },
    error: {
      background: COLORS.error[50],
      border: COLORS.error[200],
      text: COLORS.error[800],
      icon: COLORS.error[500],
    },
    warning: {
      background: COLORS.warning[50],
      border: COLORS.warning[200],
      text: COLORS.warning[800],
      icon: COLORS.warning[500],
    },
    info: {
      background: COLORS.info[50],
      border: COLORS.info[200],
      text: COLORS.info[800],
      icon: COLORS.info[500],
    },
  },

  // Resource status
  resourceStatus: {
    verified: {
      background: COLORS.success[50],
      text: COLORS.success[700],
    },
    unverified: {
      background: COLORS.warning[50],
      text: COLORS.warning[700],
    },
    deprecated: {
      background: COLORS.error[50],
      text: COLORS.error[700],
    },
  },

  // Skeleton loader
  skeleton: {
    start: COLORS.neutral[100],
    middle: COLORS.neutral[200],
    end: COLORS.neutral[100],
  },

  // Scrollbar
  scrollbar: {
    track: 'rgba(0, 0, 0, 0.05)',
    thumb: 'rgba(0, 0, 0, 0.2)',
    thumbHover: 'rgba(0, 0, 0, 0.3)',
  },
} as const

// Spacing Scale (in rem)
export const SPACING = {
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
} as const

// Typography Scale
export const TYPOGRAPHY = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
    base: ['1rem', { lineHeight: '1.5rem' }], // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }], // 48px
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const

// Border Radius
export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem', // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
} as const

// Shadows
export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const

// Transitions
export const TRANSITIONS = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  timing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    ease: 'ease',
    'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
    'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
  },
} as const

// Export theme
export const THEME = {
  colors: COLORS,
  semantic: SEMANTIC_COLORS,
  spacing: SPACING,
  typography: TYPOGRAPHY,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  transitions: TRANSITIONS,
} as const

export default THEME
