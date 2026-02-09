// Animation Configuration - All Animation Timing and Duration Settings
// Flexy hates hardcoded values! All animation settings are now configurable.

export const animationConfig = {
  // Tooltip Animations
  tooltip: {
    showDelayMs: parseInt(process.env.TOOLTIP_SHOW_DELAY_MS || '300'),
    hideDelayMs: parseInt(process.env.TOOLTIP_HIDE_DELAY_MS || '100'),
  },

  // Skeleton/Loading Animations
  skeleton: {
    shimmerDurationMs: parseInt(
      process.env.SKELETON_SHIMMER_DURATION_MS || '1500'
    ),
    staggerDelayMs: parseInt(process.env.SKELETON_STAGGER_DELAY_MS || '0'),
    staggerIncrementMs: parseInt(
      process.env.SKELETON_STAGGER_INCREMENT_MS || '75'
    ),
    maxStaggerItems: parseInt(process.env.SKELETON_MAX_STAGGER_ITEMS || '8'),
  },

  // Card Entrance Animations
  card: {
    staggerDelayMs: parseInt(process.env.CARD_STAGGER_DELAY_MS || '50'),
    maxDelayMs: parseInt(process.env.CARD_MAX_DELAY_MS || '500'),
    enterDurationMs: parseInt(process.env.CARD_ENTER_DURATION_MS || '500'),
    enterDistancePx: parseInt(process.env.CARD_ENTER_DISTANCE_PX || '20'),
  },

  // Focus Animations
  focus: {
    pulseDurationMs: parseInt(process.env.FOCUS_PULSE_DURATION_MS || '600'),
    pulseColor: process.env.FOCUS_PULSE_COLOR || 'rgba(59, 130, 246, 0.5)',
  },

  // Copy Success Animation
  copySuccess: {
    resetDelayMs: parseInt(process.env.COPY_SUCCESS_RESET_MS || '2000'),
  },

  // Suggestion/Filter Animations
  suggestion: {
    staggerDelayMs: parseInt(process.env.SUGGESTION_STAGGER_DELAY_MS || '100'),
  },

  // Navigation/Transition Animations
  navigation: {
    reducedMotionDelayMs: parseInt(
      process.env.NAV_REDUCED_MOTION_DELAY_MS || '400'
    ),
  },

  // Button/Interaction Animations
  button: {
    feedbackDurationMs: parseInt(
      process.env.BUTTON_FEEDBACK_DURATION_MS || '150'
    ),
  },

  // Search Tracking Delay
  analytics: {
    trackingDelayMs: parseInt(process.env.ANALYTICS_TRACKING_DELAY_MS || '500'),
  },
} as const

export type AnimationConfig = typeof animationConfig
