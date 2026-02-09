// Animation Configuration - Animation Timing and Duration Settings
// Flexy hates hardcoded values! All animation settings are now configurable.

export const animationConfig = {
  // Focus pulse animation (SearchBar.vue)
  focusPulse: {
    durationMs: parseInt(process.env.ANIMATION_FOCUS_PULSE_MS || '600'),
    durationCss: `${parseInt(process.env.ANIMATION_FOCUS_PULSE_MS || '600') / 1000}s`,
  },

  // Skeleton loading animations (ResourceCardSkeleton.vue)
  skeleton: {
    // Shimmer animation duration
    shimmerDurationSec: parseFloat(
      process.env.SKELETON_SHIMMER_DURATION || '1.5'
    ),
    // Pulse animation duration (reduced motion)
    pulseDurationSec: parseFloat(process.env.SKELETON_PULSE_DURATION || '2.0'),
    // Staggered delays for wave effect (in ms)
    staggerDelaysMs: [0, 75, 150, 225, 300, 375, 450, 525] as const,
    // Gradient colors for shimmer effect
    colors: {
      primary: process.env.SKELETON_COLOR_PRIMARY || '#e5e7eb',
      secondary: process.env.SKELETON_COLOR_SECONDARY || '#f3f4f6',
      icon: process.env.SKELETON_COLOR_ICON || '#d1d5db',
    },
  },

  // Loading spinner animations (LoadingSpinner.vue)
  loadingSpinner: {
    rotateDurationSec: parseFloat(process.env.SPINNER_ROTATE_DURATION || '2.0'),
    dashDurationSec: parseFloat(process.env.SPINNER_DASH_DURATION || '1.5'),
    strokeValues: {
      dashArray: process.env.SPINNER_DASH_ARRAY || '1, 200',
      dashOffset: process.env.SPINNER_DASH_OFFSET || '-35px',
      dashOffsetActive: process.env.SPINNER_DASH_OFFSET_ACTIVE || '-124px',
    },
    // Reduced motion settings
    reducedMotion: {
      pulseDurationSec: parseFloat(
        process.env.SPINNER_REDUCED_PULSE_DURATION || '2.0'
      ),
    },
  },

  // Empty state animations (EmptyState.vue)
  emptyState: {
    floatDurationSec: parseFloat(
      process.env.EMPTY_STATE_FLOAT_DURATION || '3.0'
    ),
    iconPulseDurationSec: parseFloat(
      process.env.EMPTY_STATE_ICON_PULSE || '1.0'
    ),
    iconPulseDelaySec: parseFloat(
      process.env.EMPTY_STATE_ICON_PULSE_DELAY || '1.2'
    ),
    starAnimationDurationSec: parseFloat(
      process.env.EMPTY_STATE_STAR_DURATION || '3.0'
    ),
    starAnimationDelaySec: parseFloat(
      process.env.EMPTY_STATE_STAR_DELAY || '3.5'
    ),
    sparkleDurationSec: parseFloat(
      process.env.EMPTY_STATE_SPARKLE_DURATION || '2.0'
    ),
    textFadeInDurationSec: parseFloat(
      process.env.EMPTY_STATE_TEXT_FADE || '0.4'
    ),
    // Pixel values for transforms
    transformOffsets: {
      large: parseInt(process.env.EMPTY_STATE_OFFSET_LARGE || '-10'),
      medium: parseInt(process.env.EMPTY_STATE_OFFSET_MEDIUM || '-8'),
      small: parseInt(process.env.EMPTY_STATE_OFFSET_SMALL || '-5'),
      positive: parseInt(process.env.EMPTY_STATE_OFFSET_POSITIVE || '10'),
    },
  },

  // Toast notification animations (ToastNotification.vue)
  toast: {
    enterDurationSec: parseFloat(process.env.TOAST_ENTER_DURATION || '0.3'),
    leaveDurationSec: parseFloat(process.env.TOAST_LEAVE_DURATION || '0.2'),
  },

  // Scroll to top button animations (ScrollToTop.vue)
  scrollToTop: {
    strokeColorDefault: process.env.SCROLL_STROKE_DEFAULT || '#e5e7eb',
    strokeColorActive: process.env.SCROLL_STROKE_ACTIVE || '#3b82f6',
  },

  // Resource card animations (ResourceCard.vue)
  resourceCard: {
    navigationDelayMs: parseInt(process.env.RESOURCE_CARD_NAV_DELAY || '400'),
    copySuccessTimeoutMs: parseInt(
      process.env.RESOURCE_CARD_COPY_TIMEOUT || '2000'
    ),
  },

  // Standard animation durations
  durations: {
    fast: parseFloat(process.env.ANIMATION_DURATION_FAST || '0.15'),
    normal: parseFloat(process.env.ANIMATION_DURATION_NORMAL || '0.3'),
    slow: parseFloat(process.env.ANIMATION_DURATION_SLOW || '0.5'),
    xslow: parseFloat(process.env.ANIMATION_DURATION_XSLOW || '1.0'),
  },

  // Easing functions
  easing: {
    default: process.env.ANIMATION_EASING_DEFAULT || 'ease-in-out',
    linear: process.env.ANIMATION_EASING_LINEAR || 'linear',
    cubic: process.env.ANIMATION_EASING_CUBIC || 'cubic-bezier(0.4, 0, 0.6, 1)',
  },

  // Animation delays
  delays: {
    short: parseInt(process.env.ANIMATION_DELAY_SHORT || '100'),
    medium: parseInt(process.env.ANIMATION_DELAY_MEDIUM || '200'),
    long: parseInt(process.env.ANIMATION_DELAY_LONG || '300'),
  },

  // Timing values in milliseconds
  timing: {
    bookmarkAnimationMs: parseInt(
      process.env.TIMING_BOOKMARK_ANIMATION || '400'
    ),
    bookmarkStatusClearMs: parseInt(
      process.env.TIMING_BOOKMARK_STATUS_CLEAR || '1000'
    ),
    copySuccessTimeoutMs: parseInt(process.env.TIMING_COPY_SUCCESS || '2000'),
    searchTrackingDelayMs: parseInt(
      process.env.TIMING_SEARCH_TRACKING || '500'
    ),
    setTimeoutShort: parseInt(process.env.TIMEOUT_SHORT || '100'),
    setTimeoutMedium: parseInt(process.env.TIMEOUT_MEDIUM || '500'),
    setTimeoutLong: parseInt(process.env.TIMEOUT_LONG || '1000'),
  },
} as const

export type AnimationConfig = typeof animationConfig
export type AnimationDurations = typeof animationConfig.durations
export type AnimationEasing = typeof animationConfig.easing
export type AnimationTiming = typeof animationConfig.timing
