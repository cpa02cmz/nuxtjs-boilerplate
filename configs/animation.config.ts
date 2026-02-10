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

  // Bookmark Button Animations - Flexy hates hardcoded durations!
  bookmark: {
    // Heart pop animation duration when adding bookmark (ms)
    heartPopDurationMs: parseInt(
      process.env.BOOKMARK_HEART_POP_DURATION_MS || '400'
    ),
    // Bounce scale animation duration (ms)
    bounceScaleDurationMs: parseInt(
      process.env.BOOKMARK_BOUNCE_SCALE_DURATION_MS || '400'
    ),
    // Pulse animation duration for bookmarked state (seconds)
    pulseDurationSec: parseInt(process.env.BOOKMARK_PULSE_DURATION_SEC || '2'),
    // Status announcement clear delay (ms)
    statusClearDelayMs: parseInt(
      process.env.BOOKMARK_STATUS_CLEAR_DELAY_MS || '1000'
    ),
    // Heart pop scale factor (1.3 = 130%)
    heartPopScale: parseFloat(process.env.BOOKMARK_HEART_POP_SCALE || '1.3'),
    // Bounce scale factors
    bounceScale: {
      shrink: parseFloat(process.env.BOOKMARK_BOUNCE_SHRINK || '0.9'),
      expand: parseFloat(process.env.BOOKMARK_BOUNCE_EXPAND || '1.05'),
    },
    // Pulse box shadow values
    pulseShadow: {
      startOpacity: parseFloat(
        process.env.BOOKMARK_PULSE_START_OPACITY || '0.2'
      ),
      endSpread: parseInt(process.env.BOOKMARK_PULSE_END_SPREAD || '4'),
    },
  },

  // Empty State Animations
  emptyState: {
    floatDurationSec: parseInt(process.env.EMPTY_FLOAT_DURATION_SEC || '3'),
    floatDelaySec: parseFloat(process.env.EMPTY_FLOAT_DELAY_SEC || '0.4'),
    pulseDurationSec: parseInt(process.env.EMPTY_PULSE_DURATION_SEC || '3'),
    pulseDelaySec: parseFloat(process.env.EMPTY_PULSE_DELAY_SEC || '0.5'),
    scanDurationSec: parseInt(process.env.EMPTY_SCAN_DURATION_SEC || '3'),
    scanDelaySec: parseFloat(process.env.EMPTY_SCAN_DELAY_SEC || '1.2'),
    ringDurationSec: parseInt(process.env.EMPTY_RING_DURATION_SEC || '4'),
    ringDelaySec: parseFloat(process.env.EMPTY_RING_DELAY_SEC || '1.5'),
    particleDurationSec: parseInt(
      process.env.EMPTY_PARTICLE_DURATION_SEC || '2'
    ),
    particleDelaySec: parseFloat(process.env.EMPTY_PARTICLE_DELAY_SEC || '2'),
    iconPulseDurationSec: parseInt(
      process.env.EMPTY_ICON_PULSE_DURATION_SEC || '2'
    ),
    spinDurationSec: parseInt(process.env.EMPTY_SPIN_DURATION_SEC || '4'),
    staggerDelayMs: parseInt(process.env.EMPTY_STAGGER_DELAY_MS || '100'),
  },

  // PWA Install Prompt Animations
  pwaInstall: {
    iconPulseDurationSec: parseInt(
      process.env.PWA_ICON_PULSE_DURATION_SEC || '1'
    ),
    spinDurationSec: parseInt(process.env.PWA_SPIN_DURATION_SEC || '1'),
    autoDismissIntervalMs: parseInt(
      process.env.PWA_AUTO_DISMISS_INTERVAL_MS || '50'
    ),
  },
} as const

export type AnimationConfig = typeof animationConfig
