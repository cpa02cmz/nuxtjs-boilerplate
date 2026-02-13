// Tailwind Classes Configuration
// Flexy hates hardcoded Tailwind classes! All reusable Tailwind classes are now centralized.
// This provides a single source of truth for consistent styling across the application.

export const tailwindClassesConfig = {
  // Focus States - Flexy hates hardcoded focus ring colors!
  focus: {
    // Primary focus ring (blue)
    ringPrimary:
      process.env.FOCUS_RING_PRIMARY ||
      'focus:outline-none focus:ring-2 focus:ring-blue-500',
    // Focus ring with offset
    ringWithOffset:
      process.env.FOCUS_RING_OFFSET ||
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    // Secondary focus ring (gray)
    ringSecondary:
      process.env.FOCUS_RING_SECONDARY ||
      'focus:outline-none focus:ring-2 focus:ring-gray-800',
    // Secondary focus ring with offset
    ringSecondaryWithOffset:
      process.env.FOCUS_RING_SECONDARY_OFFSET ||
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800',
    // Focus border color
    borderPrimary: process.env.FOCUS_BORDER_PRIMARY || 'focus:border-blue-500',
    // Indigo focus ring (for secondary actions)
    ringIndigo:
      process.env.FOCUS_RING_INDIGO ||
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
    // Red focus ring (for destructive actions)
    ringRed:
      process.env.FOCUS_RING_RED ||
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500',
    // Inset focus ring
    ringInset:
      process.env.FOCUS_RING_INSET ||
      'focus:outline-none focus:ring-2 focus:ring-inset',
    // Focus ring only (no offset)
    ringOnly: process.env.FOCUS_RING_ONLY || 'focus:ring-2 focus:ring-blue-500',
    // Focus visible ring with offset
    ringVisibleWithOffset:
      process.env.FOCUS_VISIBLE_OFFSET ||
      'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500',
    // Focus rounded
    rounded: process.env.FOCUS_ROUNDED || 'focus:rounded',
  },

  // Shadows - Flexy hates hardcoded shadow classes!
  shadows: {
    // Small shadow
    sm: process.env.SHADOW_SM || 'shadow-sm',
    // Default shadow
    default: process.env.SHADOW_DEFAULT || 'shadow',
    // Medium shadow
    md: process.env.SHADOW_MD || 'shadow-md',
    // Large shadow
    lg: process.env.SHADOW_LG || 'shadow-lg',
    // Extra large shadow
    xl: process.env.SHADOW_XL || 'shadow-xl',
    // No shadow
    none: process.env.SHADOW_NONE || 'shadow-none',
    // Hover shadow medium
    hoverMd: process.env.SHADOW_HOVER_MD || 'hover:shadow-md',
    // Hover shadow large
    hoverLg: process.env.SHADOW_HOVER_LG || 'hover:shadow-lg',
  },

  // Transitions - Flexy hates hardcoded transition classes!
  transitions: {
    // All properties transition
    all: process.env.TRANSITION_ALL || 'transition-all',
    // Colors only transition
    colors: process.env.TRANSITION_COLORS || 'transition-colors',
    // Transform transition
    transform: process.env.TRANSITION_TRANSFORM || 'transition-transform',
    // Opacity transition
    opacity: process.env.TRANSITION_OPACITY || 'transition-opacity',
    // Combined all with duration
    allFast: process.env.TRANSITION_ALL_FAST || 'transition-all duration-200',
    allNormal:
      process.env.TRANSITION_ALL_NORMAL || 'transition-all duration-300',
    allSlow: process.env.TRANSITION_ALL_SLOW || 'transition-all duration-500',
    // Combined colors with duration
    colorsFast:
      process.env.TRANSITION_COLORS_FAST || 'transition-colors duration-200',
    colorsNormal:
      process.env.TRANSITION_COLORS_NORMAL || 'transition-colors duration-300',
    // Combined transform with duration
    transformFast:
      process.env.TRANSITION_TRANSFORM_FAST ||
      'transition-transform duration-200',
  },

  // Duration Classes - Flexy hates hardcoded duration-xxx values!
  duration: {
    // Instant (75ms) - for micro-interactions
    instant: process.env.DURATION_INSTANT || 'duration-75',
    // Fast (150ms) - for hover states, quick feedback
    fast: process.env.DURATION_FAST || 'duration-150',
    // Normal (200ms) - for standard transitions
    normal: process.env.DURATION_NORMAL || 'duration-200',
    // Medium (300ms) - for modal/dialog transitions
    medium: process.env.DURATION_MEDIUM || 'duration-300',
    // Slow (500ms) - for emphasis animations
    slow: process.env.DURATION_SLOW || 'duration-500',
    // Very slow (700ms) - for complex animations
    verySlow: process.env.DURATION_VERY_SLOW || 'duration-700',
    // Ultra slow (1000ms) - for special effects
    ultraSlow: process.env.DURATION_ULTRA_SLOW || 'duration-1000',
  },

  // Duration values in milliseconds - for JavaScript timers
  durationMs: {
    instant: parseInt(process.env.DURATION_INSTANT_MS || '75'),
    fast: parseInt(process.env.DURATION_FAST_MS || '150'),
    normal: parseInt(process.env.DURATION_NORMAL_MS || '200'),
    medium: parseInt(process.env.DURATION_MEDIUM_MS || '300'),
    slow: parseInt(process.env.DURATION_SLOW_MS || '500'),
    verySlow: parseInt(process.env.DURATION_VERY_SLOW_MS || '700'),
    ultraSlow: parseInt(process.env.DURATION_ULTRA_SLOW_MS || '1000'),
  },

  // Easing - Flexy hates hardcoded easing classes!
  easing: {
    // Ease out
    easeOut: process.env.EASING_EASE_OUT || 'ease-out',
    // Ease in
    easeIn: process.env.EASING_EASE_IN || 'ease-in',
    // Ease in out
    easeInOut: process.env.EASING_EASE_IN_OUT || 'ease-in-out',
    // Linear
    linear: process.env.EASING_LINEAR || 'linear',
    // Spring easing (custom cubic-bezier via CSS)
    spring: process.env.EASING_SPRING_CLASS || 'ease-spring',
  },

  // Interactive States - Flexy hates hardcoded hover/active classes!
  interactive: {
    // Scale on hover
    hoverScale: process.env.HOVER_SCALE || 'hover:scale-105',
    // Scale down on active
    activeScale: process.env.ACTIVE_SCALE || 'active:scale-95',
    // Lift on hover (translate Y)
    hoverLift: process.env.HOVER_LIFT || 'hover:-translate-y-0.5',
    // Return to normal on active
    activeNormal: process.env.ACTIVE_NORMAL || 'active:translate-y-0',
    // Combined hover and active scale
    scale: process.env.INTERACTIVE_SCALE || 'hover:scale-105 active:scale-95',
    // Combined lift and return
    lift:
      process.env.INTERACTIVE_LIFT ||
      'hover:-translate-y-0.5 active:translate-y-0',
    // Opacity on disabled
    disabled:
      process.env.DISABLED_OPACITY ||
      'disabled:opacity-50 disabled:cursor-not-allowed',
    // Hover background change
    hoverBg: process.env.HOVER_BG_GRAY || 'hover:bg-gray-50',
    hoverBgDark: process.env.HOVER_BG_GRAY_DARK || 'hover:bg-gray-100',
  },

  // Input Styles - Flexy hates hardcoded input classes!
  inputs: {
    // Base input
    base:
      process.env.INPUT_BASE ||
      'block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white',
    // Input with shadow
    withShadow:
      process.env.INPUT_WITH_SHADOW ||
      'block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm',
    // Input focus states combined
    focus:
      process.env.INPUT_FOCUS ||
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    // Search input specifically
    search:
      process.env.INPUT_SEARCH ||
      'block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm',
    // Textarea
    textarea:
      process.env.INPUT_TEXTAREA ||
      'w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm resize-none',
  },

  // Button Styles - Flexy hates hardcoded button classes!
  buttons: {
    // Primary button (dark)
    primary:
      process.env.BUTTON_PRIMARY ||
      'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900',
    // Secondary button (white)
    secondary:
      process.env.BUTTON_SECONDARY ||
      'inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50',
    // Blue primary button
    primaryBlue:
      process.env.BUTTON_PRIMARY_BLUE ||
      'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700',
    // Icon button
    icon:
      process.env.BUTTON_ICON ||
      'p-2 rounded-full transition-colors focus:outline-none focus:ring-2',
    // Menu item button
    menuItem:
      process.env.BUTTON_MENU_ITEM ||
      'flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100',
    // Full width button
    fullWidth:
      process.env.BUTTON_FULL_WIDTH ||
      'w-full flex justify-center py-3 px-4 border border-transparent rounded-md',
  },

  // Card Styles - Flexy hates hardcoded card classes!
  cards: {
    // Base card
    base: process.env.CARD_BASE || 'bg-white rounded-lg shadow',
    // Card with padding
    padded: process.env.CARD_PADDED || 'bg-white rounded-lg shadow-md p-6',
    // Card with hover effect
    hover:
      process.env.CARD_HOVER ||
      'bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300',
    // Bordered card
    bordered:
      process.env.CARD_BORDERED ||
      'bg-white rounded-lg shadow border border-gray-200',
  },

  // Container Styles - Flexy hates hardcoded container classes!
  containers: {
    // Page container narrow
    narrow: process.env.CONTAINER_NARROW || 'max-w-3xl',
    // Page container medium
    medium: process.env.CONTAINER_MEDIUM || 'max-w-4xl',
    // Page container wide
    wide: process.env.CONTAINER_WIDE || 'max-w-6xl',
    // Page container full
    full: process.env.CONTAINER_FULL || 'max-w-7xl',
    // Small container
    small: process.env.CONTAINER_SMALL || 'max-w-md',
    // Centered container with padding
    centered:
      process.env.CONTAINER_CENTERED ||
      'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  },

  // Typography - Flexy hates hardcoded typography classes!
  typography: {
    // Page title
    pageTitle:
      process.env.TYPO_PAGE_TITLE || 'text-3xl font-bold text-gray-900',
    // Section title
    sectionTitle:
      process.env.TYPO_SECTION_TITLE || 'text-xl font-semibold text-gray-900',
    // Card title
    cardTitle:
      process.env.TYPO_CARD_TITLE || 'text-lg font-medium text-gray-900',
    // Body text
    body: process.env.TYPO_BODY || 'text-base text-gray-600',
    // Small/muted text
    small: process.env.TYPO_SMALL || 'text-sm text-gray-500',
    // Link text
    link: process.env.TYPO_LINK || 'text-blue-600 hover:text-blue-800',
  },

  // Layout Utilities - Flexy hates hardcoded layout classes!
  layout: {
    // Flex center
    flexCenter:
      process.env.LAYOUT_FLEX_CENTER || 'flex items-center justify-center',
    // Flex between
    flexBetween:
      process.env.LAYOUT_FLEX_BETWEEN || 'flex items-center justify-between',
    // Flex start
    flexStart:
      process.env.LAYOUT_FLEX_START || 'flex items-center justify-start',
    // Screen height
    screenHeight: process.env.LAYOUT_SCREEN_HEIGHT || 'min-h-screen',
    // Full width
    fullWidth: process.env.LAYOUT_FULL_WIDTH || 'w-full',
    // Hidden element
    hidden: process.env.LAYOUT_HIDDEN || 'hidden',
    // Block element
    block: process.env.LAYOUT_BLOCK || 'block',
  },

  // Dark Mode - Flexy hates hardcoded dark mode classes!
  darkMode: {
    // Dark background
    bg: process.env.DARK_BG || 'dark:bg-gray-900',
    // Dark card background
    cardBg: process.env.DARK_CARD_BG || 'dark:bg-gray-800',
    // Dark text
    text: process.env.DARK_TEXT || 'dark:text-white',
    // Dark muted text
    textMuted: process.env.DARK_TEXT_MUTED || 'dark:text-gray-400',
    // Dark border
    border: process.env.DARK_BORDER || 'dark:border-gray-700',
    // Dark hover background
    hoverBg: process.env.DARK_HOVER_BG || 'dark:hover:bg-gray-700',
  },

  // Status Colors - Flexy hates hardcoded status colors!
  status: {
    // Success
    success: {
      text: process.env.STATUS_SUCCESS_TEXT || 'text-green-600',
      bg: process.env.STATUS_SUCCESS_BG || 'bg-green-50',
      border: process.env.STATUS_SUCCESS_BORDER || 'border-green-200',
    },
    // Error
    error: {
      text: process.env.STATUS_ERROR_TEXT || 'text-red-600',
      bg: process.env.STATUS_ERROR_BG || 'bg-red-50',
      border: process.env.STATUS_ERROR_BORDER || 'border-red-200',
    },
    // Warning
    warning: {
      text: process.env.STATUS_WARNING_TEXT || 'text-amber-600',
      bg: process.env.STATUS_WARNING_BG || 'bg-amber-50',
      border: process.env.STATUS_WARNING_BORDER || 'border-amber-200',
    },
    // Info
    info: {
      text: process.env.STATUS_INFO_TEXT || 'text-blue-600',
      bg: process.env.STATUS_INFO_BG || 'bg-blue-50',
      border: process.env.STATUS_INFO_BORDER || 'border-blue-200',
    },
  },

  // Dropdown Styles - Flexy hates hardcoded dropdown classes!
  dropdown: {
    // Dropdown container
    container:
      process.env.DROPDOWN_CONTAINER ||
      'absolute z-50 mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden',
    // Dropdown item
    item:
      process.env.DROPDOWN_ITEM ||
      'relative flex items-center justify-between px-3 py-2.5 cursor-pointer',
    // Dropdown menu (for buttons)
    menu:
      process.env.DROPDOWN_MENU ||
      'absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5',
  },

  // Tooltip Styles - Flexy hates hardcoded tooltip classes!
  tooltip: {
    // Tooltip container
    container:
      process.env.TOOLTIP_CONTAINER ||
      'absolute z-50 px-3 py-2 text-sm font-medium rounded-lg shadow-lg pointer-events-none whitespace-nowrap',
    // Tooltip arrow
    arrow: process.env.TOOLTIP_ARROW || 'absolute w-2 h-2 transform rotate-45',
    // Tooltip backdrop (for screen readers)
    backdrop: process.env.TOOLTIP_BACKDROP || 'fixed inset-0 bg-gray-900/50',
  },

  // Modal Styles - Flexy hates hardcoded modal classes!
  modal: {
    // Modal backdrop
    backdrop:
      process.env.MODAL_BACKDROP || 'fixed inset-0 bg-gray-500 bg-opacity-75',
    // Modal container
    container: process.env.MODAL_CONTAINER || 'bg-white rounded-lg shadow-xl',
    // Modal header
    header: process.env.MODAL_HEADER || 'px-6 py-4 border-b border-gray-200',
    // Modal footer
    footer:
      process.env.MODAL_FOOTER ||
      'px-6 py-4 border-t border-gray-200 flex justify-end',
  },

  // Animation Classes - Flexy hates hardcoded animation classes!
  animations: {
    // Pulse animation
    pulse: process.env.ANIMATION_PULSE || 'animate-pulse',
    // Spin animation
    spin: process.env.ANIMATION_SPIN || 'animate-spin',
    // Bounce animation
    bounce: process.env.ANIMATION_BOUNCE || 'animate-bounce',
    // Fade in
    fadeIn: process.env.ANIMATION_FADE_IN || 'animate-fade-in',
  },

  // Spacing - Flexy hates hardcoded spacing classes!
  spacing: {
    // Page padding
    page: process.env.SPACING_PAGE || 'px-4 sm:px-6 lg:px-8',
    // Card padding
    card: process.env.SPACING_CARD || 'p-6',
    // Section gap
    section: process.env.SPACING_SECTION || 'mt-6',
    // Element gap
    element: process.env.SPACING_ELEMENT || 'mt-3',
    // Small gap
    sm: process.env.SPACING_SM || 'gap-2',
    // Medium gap
    md: process.env.SPACING_MD || 'gap-4',
    // Large gap
    lg: process.env.SPACING_LG || 'gap-6',
  },

  // Border Radius - Flexy hates hardcoded border radius classes!
  borderRadius: {
    // Small radius
    sm: process.env.RADIUS_SM || 'rounded-sm',
    // Default radius
    default: process.env.RADIUS_DEFAULT || 'rounded',
    // Medium radius
    md: process.env.RADIUS_MD || 'rounded-md',
    // Large radius
    lg: process.env.RADIUS_LG || 'rounded-lg',
    // Full radius (pills)
    full: process.env.RADIUS_FULL || 'rounded-full',
  },

  // Utility Combinations - Pre-combined common patterns
  utilities: {
    // Focus ring with transition
    focusTransition:
      process.env.UTIL_FOCUS_TRANSITION ||
      'focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200',
    // Hover lift with transition
    hoverLiftTransition:
      process.env.UTIL_HOVER_LIFT ||
      'hover:-translate-y-0.5 transition-transform duration-200',
    // Card hover effect
    cardHover:
      process.env.UTIL_CARD_HOVER ||
      'hover:shadow-md hover:-translate-y-0.5 transition-all duration-300',
    // Button press effect
    buttonPress:
      process.env.UTIL_BUTTON_PRESS ||
      'active:scale-95 transition-transform duration-150',
  },
} as const

// Type export for TypeScript support
export type TailwindClassesConfig = typeof tailwindClassesConfig

// Helper function to combine multiple tailwind classes
export function combineClasses(
  ...classes: (string | undefined | false | null)[]
): string {
  return classes.filter(Boolean).join(' ')
}

// Helper function to get a nested config value by path
export function getTailwindClass(
  path: string,
  defaultValue?: string
): string | undefined {
  const keys = path.split('.')
  let result: unknown = tailwindClassesConfig

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key]
    } else {
      return defaultValue
    }
  }

  return typeof result === 'string' ? result : defaultValue
}

export default tailwindClassesConfig
