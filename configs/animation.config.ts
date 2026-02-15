// Animation Configuration - All Animation Timing and Duration Settings
// Flexy hates hardcoded values! All animation settings are now configurable.
import {
  EASING as EASING_CONSTANTS,
  easingConfig as EASING_CONFIG,
} from './easing.config'

// Convenience alias for cubic-bezier easing functions
const EASING_REF = EASING_CONSTANTS

export const animationConfig = {
  // Tooltip Animations
  tooltip: {
    showDelayMs: parseInt(process.env.TOOLTIP_SHOW_DELAY_MS || '300'),
    hideDelayMs: parseInt(process.env.TOOLTIP_HIDE_DELAY_MS || '100'),
    // Instant delay for immediate tooltip display (no delay)
    instantDelayMs: 0,
    // Touch device long-press duration (ms) - Flexy hates hardcoded 500!
    longPressDurationMs: parseInt(
      process.env.TOOLTIP_LONG_PRESS_DURATION_MS || '500'
    ),
    // Touch reset delay after touch ends (ms) - Flexy hates hardcoded 100!
    touchResetDelayMs: parseInt(
      process.env.TOOLTIP_TOUCH_RESET_DELAY_MS || '100'
    ),
    // Grace period for hover intent - prevents flickering when moving between trigger and tooltip (ms)
    gracePeriodMs: parseInt(process.env.TOOLTIP_GRACE_PERIOD_MS || '150'),
    // Position transition duration when tooltip repositions due to viewport collision (ms)
    positionTransitionMs: parseInt(
      process.env.TOOLTIP_POSITION_TRANSITION_MS || '200'
    ),
    // Swipe gesture threshold for dismissing tooltip on mobile (px) - Flexy hates hardcoded 50!
    swipeThresholdPx: parseInt(process.env.TOOLTIP_SWIPE_THRESHOLD_PX || '50'),
  },

  // Live Indicator Animations - Palette's micro-UX delight! 🎨
  // Used by RelativeTimeBadge for pulsing indicator dot
  liveIndicator: {
    // Pulse animation duration in seconds
    pulseDurationSec:
      parseInt(process.env.LIVE_INDICATOR_PULSE_DURATION_MS || '2000') / 1000,
    // Scale multiplier for pulse effect
    pulseScale: parseFloat(process.env.LIVE_INDICATOR_PULSE_SCALE || '1.2'),
    // Ring spread scale for pulse ripple
    ringSpreadScale: parseFloat(
      process.env.LIVE_INDICATOR_RING_SPREAD || '2.0'
    ),
  },

  // Relative Time Badge Animations - Palette's micro-UX delight! 🎨
  // Visual feedback when relative time updates (e.g., "just now" → "1 min ago")
  relativeTimeBadge: {
    // Duration of the highlight animation when time updates (ms)
    updateHighlightDurationMs: parseInt(
      process.env.RELATIVE_TIME_UPDATE_HIGHLIGHT_MS || '600'
    ),
    // Background color for the highlight flash (tailwind color or hex)
    updateHighlightColor:
      process.env.RELATIVE_TIME_UPDATE_HIGHLIGHT_COLOR ||
      'rgba(59, 130, 246, 0.15)',
    // Scale effect on text when updating
    updateTextScale: parseFloat(
      process.env.RELATIVE_TIME_UPDATE_SCALE || '1.02'
    ),
    // Enable/disable the update animation
    enableUpdateAnimation: process.env.RELATIVE_TIME_ENABLE_UPDATE !== 'false',
    // Minimum time between updates to trigger animation (prevents spam) (ms)
    updateDebounceMs: parseInt(
      process.env.RELATIVE_TIME_UPDATE_DEBOUNCE_MS || '5000'
    ),
  },

  // Skeleton/Loading Animations
  skeleton: {
    shimmerDurationMs: parseInt(
      process.env.SKELETON_SHIMMER_DURATION_MS || '1500'
    ),
    // CSS-compatible duration string for v-bind()
    shimmerDurationSec: `${parseInt(process.env.SKELETON_SHIMMER_DURATION_MS || '1500') / 1000}s`,
    staggerDelayMs: parseInt(process.env.SKELETON_STAGGER_DELAY_MS || '0'),
    staggerIncrementMs: parseInt(
      process.env.SKELETON_STAGGER_INCREMENT_MS || '75'
    ),
    maxStaggerItems: parseInt(process.env.SKELETON_MAX_STAGGER_ITEMS || '8'),
    // Pulse animation for reduced motion
    pulseDurationSec: `${parseInt(process.env.SKELETON_PULSE_DURATION_SEC || '2')}s`,
    // Card entrance animation
    cardEnterDurationSec: `${parseInt(process.env.SKELETON_CARD_ENTER_DURATION_MS || '300') / 1000}s`,
    // Reduced motion card entrance
    reducedMotionEnterDurationSec: `${parseInt(process.env.SKELETON_REDUCED_ENTER_DURATION_MS || '200') / 1000}s`,
    // Image loading shimmer
    imageShimmerDurationSec: `${parseInt(process.env.IMAGE_SHIMMER_DURATION_MS || '1500') / 1000}s`,
    // Image fade in duration
    imageFadeInDurationSec: `${parseInt(process.env.IMAGE_FADE_IN_DURATION_MS || '300') / 1000}s`,
    // Subtle pulse for loading state
    subtlePulseDurationSec: `${parseInt(process.env.SUBTLE_PULSE_DURATION_SEC || '2')}s`,
    // Wave animation for coordinated skeleton shimmer effect
    waveDurationSec: parseFloat(process.env.SKELETON_WAVE_DURATION_SEC || '2'),
    waveStaggerSec: parseFloat(process.env.SKELETON_WAVE_STAGGER_SEC || '0.08'),
    // Card entrance animation transforms - Flexy hates hardcoded CSS!
    cardEnterStartTranslateYPx: parseInt(
      process.env.SKELETON_ENTER_START_TRANSLATE_Y_PX || '20'
    ),
    cardEnterStartScale: parseFloat(
      process.env.SKELETON_ENTER_START_SCALE || '0.96'
    ),
    cardEnterMidTranslateYPx: parseInt(
      process.env.SKELETON_ENTER_MID_TRANSLATE_Y_PX || '-4'
    ),
    cardEnterMidScale: parseFloat(
      process.env.SKELETON_ENTER_MID_SCALE || '1.01'
    ),
    // 🎨 Palette: Scanning laser line effect - makes loading feel active and high-tech!
    scanLine: {
      durationSec: parseFloat(process.env.SKELETON_SCAN_DURATION_SEC || '2.5'),
      delaySec: parseFloat(process.env.SKELETON_SCAN_DELAY_SEC || '0.5'),
      color: process.env.SKELETON_SCAN_COLOR || 'rgba(59, 130, 246, 0.3)',
      opacity: parseFloat(process.env.SKELETON_SCAN_OPACITY || '0.6'),
    },
  },

  // OptimizedImage Component Animations - Palette's micro-UX enhancement!
  // Enhanced loading states, hover effects, and error handling for images
  optimizedImage: {
    // Entrance animation durations based on load time
    fastEntranceMs: parseInt(process.env.IMAGE_FAST_ENTRANCE_MS || '200'),
    normalEntranceMs: parseInt(process.env.IMAGE_NORMAL_ENTRANCE_MS || '400'),
    slowEntranceMs: parseInt(process.env.IMAGE_SLOW_ENTRANCE_MS || '600'),
    // Entrance animation start scale (slightly smaller for pop effect)
    entranceStartScale: parseFloat(
      process.env.IMAGE_ENTRANCE_START_SCALE || '0.95'
    ),
    // Hover zoom scale factor
    hoverZoomScale: parseFloat(process.env.IMAGE_HOVER_ZOOM_SCALE || '1.05'),
    // Hover animation duration
    hoverDurationMs: parseInt(process.env.IMAGE_HOVER_DURATION_MS || '300'),
    // Border radius for wrapper
    borderRadius: process.env.IMAGE_BORDER_RADIUS || '4px',
    // Placeholder background color
    placeholderBg: process.env.IMAGE_PLACEHOLDER_BG || '#f3f4f6',
    // Loading spinner rotation duration
    spinnerRotateDurationSec: `${parseInt(process.env.IMAGE_SPINNER_ROTATE_MS || '1000') / 1000}s`,
    // Loading spinner dash animation duration
    spinnerDashDurationSec: `${parseInt(process.env.IMAGE_SPINNER_DASH_MS || '1500') / 1000}s`,
    // Error state pulse duration
    errorPulseDurationSec: `${parseInt(process.env.IMAGE_ERROR_PULSE_MS || '2000') / 1000}s`,
    // Retry button spin duration
    retrySpinDurationSec: `${parseInt(process.env.IMAGE_RETRY_SPIN_MS || '1000') / 1000}s`,
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

  // Idle Pulse Animation - Flexy hates hardcoded values!
  // Provides subtle animation to indicate keyboard shortcut availability
  idlePulse: {
    // Duration of one complete pulse cycle (ms)
    durationMs: parseInt(process.env.IDLE_PULSE_DURATION_MS || '2000'),
    // CSS duration string for v-bind
    durationSec: `${parseInt(process.env.IDLE_PULSE_DURATION_MS || '2000') / 1000}s`,
    // Number of pulse iterations before stopping
    iterationCount: parseInt(process.env.IDLE_PULSE_ITERATIONS || '3'),
    // Scale factor at peak of pulse
    peakScale: parseFloat(process.env.IDLE_PULSE_PEAK_SCALE || '1.1'),
  },

  // Search Complete Animation - Flexy hates hardcoded values!
  // Provides positive feedback when search completes
  searchComplete: {
    // Duration of the search complete animation (ms)
    durationMs: parseInt(process.env.SEARCH_COMPLETE_DURATION_MS || '800'),
    // CSS duration string for v-bind
    durationSec: `${parseInt(process.env.SEARCH_COMPLETE_DURATION_MS || '800') / 1000}s`,
    // Scale factor at peak of animation
    peakScale: parseFloat(process.env.SEARCH_COMPLETE_PEAK_SCALE || '1.2'),
    // Easing function for the animation
    easing: process.env.SEARCH_COMPLETE_EASING || EASING_REF.SPRING_STANDARD,
  },

  // Focus Glow Effect - Palette's micro-UX enhancement!
  // Adds a subtle animated glow around focused inputs for better visibility
  focusGlow: {
    // Duration of the glow pulse animation (ms)
    durationMs: parseInt(process.env.FOCUS_GLOW_DURATION_MS || '2000'),
    // CSS duration string for v-bind
    durationSec: `${parseInt(process.env.FOCUS_GLOW_DURATION_MS || '2000') / 1000}s`,
    // Glow color (blue-500 with opacity)
    color: process.env.FOCUS_GLOW_COLOR || 'rgba(59, 130, 246, 0.3)',
    // Secondary glow color for pulse effect
    secondaryColor:
      process.env.FOCUS_GLOW_SECONDARY_COLOR || 'rgba(59, 130, 246, 0.1)',
    // Box shadow spread at minimum (px)
    spreadMin: parseInt(process.env.FOCUS_GLOW_SPREAD_MIN || '2'),
    // Box shadow spread at maximum (px)
    spreadMax: parseInt(process.env.FOCUS_GLOW_SPREAD_MAX || '8'),
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.FOCUS_GLOW_RESPECT_REDUCED_MOTION !== 'false',
  },

  // Ripple Effect Animations - Flexy hates hardcoded colors!
  ripple: {
    // Default ripple color (white with 30% opacity)
    defaultColor:
      process.env.RIPPLE_DEFAULT_COLOR || 'rgba(255, 255, 255, 0.3)',
    // Alternative colors for different themes
    primaryColor: process.env.RIPPLE_PRIMARY_COLOR || 'rgba(59, 130, 246, 0.3)',
    successColor: process.env.RIPPLE_SUCCESS_COLOR || 'rgba(34, 197, 94, 0.3)',
    dangerColor: process.env.RIPPLE_DANGER_COLOR || 'rgba(239, 68, 68, 0.3)',
    // Bookmark-specific ripple color (yellow)
    bookmarkColor:
      process.env.RIPPLE_BOOKMARK_COLOR || 'rgba(234, 179, 8, 0.4)',
    // Maximum ripple radius in pixels - Flexy hates hardcoded 100!
    maxRadius: parseInt(process.env.RIPPLE_MAX_RADIUS || '100'),
    // Animation timing multipliers - Flexy hates hardcoded magic numbers!
    fadeOutStartMultiplier: parseFloat(
      process.env.RIPPLE_FADE_OUT_START || '0.7'
    ),
    fadeOutEndMultiplier: parseFloat(process.env.RIPPLE_FADE_OUT_END || '0.3'),
    // Ripple animation duration (ms) - BugFixer's bug fix!
    durationMs: parseInt(process.env.RIPPLE_DURATION_MS || '600'),
  },

  // SearchBar Shortcut Success Animation - Flexy hates hardcoded CSS colors!
  searchShortcut: {
    // Duration of the success animation (ms)
    durationMs: parseInt(process.env.SEARCH_SHORTCUT_DURATION_MS || '600'),
    // Success color (green-500)
    successColor: process.env.SEARCH_SHORTCUT_SUCCESS_COLOR || '34, 197, 94',
    // Success color with opacity for box-shadow
    successColorAlpha:
      process.env.SEARCH_SHORTCUT_SUCCESS_COLOR_ALPHA || '34, 197, 94, 0.6',
    // Default background color (gray-50)
    defaultBgColor: process.env.SEARCH_SHORTCUT_DEFAULT_BG || '249, 250, 251',
    // Default text color (gray-500)
    defaultTextColor:
      process.env.SEARCH_SHORTCUT_DEFAULT_TEXT || '107, 114, 128',
    // Default border color (gray-200)
    defaultBorderColor:
      process.env.SEARCH_SHORTCUT_DEFAULT_BORDER || '229, 231, 235',
    // Scale factor at peak of animation
    peakScale: parseFloat(process.env.SEARCH_SHORTCUT_PEAK_SCALE || '1.15'),
    // Box-shadow spread at start
    shadowSpreadStart: parseInt(
      process.env.SEARCH_SHORTCUT_SHADOW_SPREAD_START || '0'
    ),
    // Box-shadow spread at 30%
    shadowSpreadMid: parseInt(
      process.env.SEARCH_SHORTCUT_SHADOW_SPREAD_MID || '8'
    ),
  },

  // Copy Success Animation
  copySuccess: {
    resetDelayMs: parseInt(process.env.COPY_SUCCESS_RESET_MS || '2000'),
    // Duration for the copied tooltip to remain visible (ms)
    tooltipDurationMs: parseInt(process.env.COPY_SUCCESS_TOOLTIP_MS || '1500'),
    // Checkmark animation delay for copy success (seconds)
    checkmarkDelaySec: parseFloat(
      process.env.COPY_SUCCESS_CHECKMARK_DELAY || '0.3'
    ),
  },

  // Global easing functions for animations
  easing: {
    spring: EASING_REF.SPRING_STANDARD,
    snappy: EASING_REF.SPRING_SNAPPY,
    smooth: EASING_REF.MATERIAL_STANDARD,
  },

  // Copy Error Animation - UX feedback when clipboard fails
  copyError: {
    resetDelayMs: parseInt(process.env.COPY_ERROR_RESET_MS || '2500'),
  },

  // Copy Feedback Animation - Palette's delightful micro-UX touch!
  // Provides satisfying visual feedback when users copy text to clipboard
  copyFeedback: {
    // Duration the feedback tooltip remains visible (ms)
    durationMs: parseInt(process.env.COPY_FEEDBACK_DURATION_MS || '1500'),
    // Position of the tooltip relative to trigger element
    position: process.env.COPY_FEEDBACK_POSITION || 'top',
    // Offset from trigger element (px)
    offsetPx: parseInt(process.env.COPY_FEEDBACK_OFFSET_PX || '8'),
    // Animation scale factor for the pop effect
    popScale: parseFloat(process.env.COPY_FEEDBACK_POP_SCALE || '1.05'),
    // Checkmark draw animation duration (seconds)
    checkmarkDrawDurationSec: parseFloat(
      process.env.COPY_FEEDBACK_CHECKMARK_DURATION || '0.18'
    ),
    // Delay before checkmark starts drawing (seconds)
    checkmarkDelaySec: parseFloat(
      process.env.COPY_FEEDBACK_CHECKMARK_DELAY || '0.06'
    ),
    // Success pop animation duration (ms) - for button feedback
    successPopDurationMs: parseInt(
      process.env.COPY_FEEDBACK_SUCCESS_POP_DURATION || '300'
    ),
    // Tooltip styling values - Flexy hates hardcoded CSS!
    styles: {
      paddingX: parseInt(process.env.COPY_FEEDBACK_PADDING_X || '12'),
      paddingY: parseInt(process.env.COPY_FEEDBACK_PADDING_Y || '6'),
      fontSize: parseInt(process.env.COPY_FEEDBACK_FONT_SIZE || '12'),
      borderRadius: parseInt(process.env.COPY_FEEDBACK_BORDER_RADIUS || '6'),
      arrowSize: parseInt(process.env.COPY_FEEDBACK_ARROW_SIZE || '8'),
      animationDuration: parseFloat(
        process.env.COPY_FEEDBACK_ANIMATION_DURATION || '0.3'
      ),
      shadow: {
        y: parseInt(process.env.COPY_FEEDBACK_SHADOW_Y || '4'),
        blur: parseInt(process.env.COPY_FEEDBACK_SHADOW_BLUR || '6'),
        spread: parseInt(process.env.COPY_FEEDBACK_SHADOW_SPREAD || '-1'),
        opacity: parseFloat(process.env.COPY_FEEDBACK_SHADOW_OPACITY || '0.1'),
      },
    },
  },

  // Suggestion/Filter Animations - Palette's micro-UX delight!
  // Adds tactile press feedback and spring animations for delightful interactions
  suggestion: {
    staggerDelayMs: parseInt(process.env.SUGGESTION_STAGGER_DELAY_MS || '100'),
    // Press animation duration for tactile feedback (ms)
    pressDurationMs: parseInt(
      process.env.SUGGESTION_PRESS_DURATION_MS || '100'
    ),
    // Scale factor when item is pressed (0.98 = 98% of original size)
    pressScale: parseFloat(process.env.SUGGESTION_PRESS_SCALE || '0.98'),
    // Spring back animation duration after release (ms)
    springBackDurationMs: parseInt(
      process.env.SUGGESTION_SPRING_BACK_MS || '300'
    ),
    // Background color transition duration (ms)
    bgTransitionMs: parseInt(process.env.SUGGESTION_BG_TRANSITION_MS || '150'),
  },

  // Navigation/Transition Animations
  navigation: {
    reducedMotionDelayMs: parseInt(
      process.env.NAV_REDUCED_MOTION_DELAY_MS || '400'
    ),
    // Reset delay for navigation state (e.g., after clicking external links)
    resetDelayMs: parseInt(process.env.NAV_RESET_DELAY_MS || '2000'),
  },

  // Button/Interaction Animations
  button: {
    feedbackDurationMs: parseInt(
      process.env.BUTTON_FEEDBACK_DURATION_MS || '150'
    ),
    // Ripple animation duration for button press effects (ms)
    rippleDurationMs: parseInt(process.env.BUTTON_RIPPLE_DURATION_MS || '600'),
  },

  // Icon Interaction Animations - Palette's micro-UX delight!
  // Adds delightful hover lift and press effects for interactive icons
  iconInteraction: {
    // Duration of the scale animation (ms)
    durationMs: parseInt(process.env.ICON_INTERACTION_DURATION_MS || '200'),
    // CSS duration string for v-bind
    durationSec: `${parseInt(process.env.ICON_INTERACTION_DURATION_MS || '200') / 1000}s`,
    // Scale factor for hover state (1.15 = 115% of original size)
    hoverScale: parseFloat(process.env.ICON_INTERACTION_HOVER_SCALE || '1.15'),
    // Scale factor for active/pressed state (0.95 = 95% of original size)
    activeScale: parseFloat(
      process.env.ICON_INTERACTION_ACTIVE_SCALE || '0.95'
    ),
    // Cubic bezier easing for bouncy feel
    easing: process.env.ICON_INTERACTION_EASING || EASING_REF.SPRING_STANDARD,
  },

  // Search Tracking Delay
  analyticsTracking: {
    trackingDelayMs: parseInt(process.env.ANALYTICS_TRACKING_DELAY_MS || '500'),
  },
  // Draft Save Pulse Animation - Palette's micro-UX delight!
  // Adds a satisfying pulse ring when auto-save occurs
  draftSave: {
    // Duration of the pulse ring animation (ms)
    pulseDurationMs: parseInt(
      process.env.DRAFT_SAVE_PULSE_DURATION_MS || '800'
    ),
    // CSS duration string for v-bind
    pulseDurationSec: `${parseInt(process.env.DRAFT_SAVE_PULSE_DURATION_MS || '800') / 1000}s`,
    // Scale factor for the pulse ring (1.5 = 150% of original size)
    pulseScale: parseFloat(process.env.DRAFT_SAVE_PULSE_SCALE || '1.8'),
    // Color of the pulse ring (green-500 with opacity)
    pulseColor: process.env.DRAFT_SAVE_PULSE_COLOR || 'rgba(34, 197, 94, 0.4)',
    // Secondary pulse color for fade effect
    pulseFadeColor:
      process.env.DRAFT_SAVE_PULSE_FADE_COLOR || 'rgba(34, 197, 94, 0)',
    // Ring border width (px)
    ringWidth: parseInt(process.env.DRAFT_SAVE_RING_WIDTH || '2'),
    // Delay before pulse starts (ms) - gives a moment to notice
    pulseDelayMs: parseInt(process.env.DRAFT_SAVE_PULSE_DELAY_MS || '100'),
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
    // Particle Burst Animation - Palette's delightful micro-UX touch!
    // Creates a celebratory particle burst when bookmarking
    particleBurst: {
      // Enable/disable particle burst
      enabled: process.env.BOOKMARK_PARTICLE_ENABLED !== 'false',
      // Number of particles in the burst
      particleCount: parseInt(process.env.BOOKMARK_PARTICLE_COUNT || '12'),
      // Animation duration in seconds
      durationSec: parseFloat(process.env.BOOKMARK_PARTICLE_DURATION || '0.6'),
      // Particle spread distance in pixels
      spreadPx: parseInt(process.env.BOOKMARK_PARTICLE_SPREAD || '60'),
      // Particle colors (amber/yellow theme for bookmarks)
      colors: [
        process.env.BOOKMARK_PARTICLE_COLOR_1 || '#fbbf24', // amber-400
        process.env.BOOKMARK_PARTICLE_COLOR_2 || '#f59e0b', // amber-500
        process.env.BOOKMARK_PARTICLE_COLOR_3 || '#fcd34d', // amber-300
        process.env.BOOKMARK_PARTICLE_COLOR_4 || '#fbbf24', // amber-400
      ],
      // Particle size range in pixels
      minSizePx: parseInt(process.env.BOOKMARK_PARTICLE_MIN_SIZE || '4'),
      maxSizePx: parseInt(process.env.BOOKMARK_PARTICLE_MAX_SIZE || '8'),
      // Delay before particles start disappearing
      fadeDelaySec: parseFloat(
        process.env.BOOKMARK_PARTICLE_FADE_DELAY || '0.3'
      ),
      // Angle randomness in degrees - adds natural variation to particle distribution
      angleRandomnessDeg: parseInt(
        process.env.BOOKMARK_PARTICLE_ANGLE_RANDOMNESS || '30'
      ),
      // Distance variation factor - particles spread between 70-130% of base spread
      distanceVariationMin: parseFloat(
        process.env.BOOKMARK_PARTICLE_DISTANCE_MIN || '0.7'
      ),
      distanceVariationMax: parseFloat(
        process.env.BOOKMARK_PARTICLE_DISTANCE_MAX || '1.3'
      ),
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

  // Offline Indicator Connection Pulse - Palette's micro-UX enhancement!
  // Adds a radar-like pulse animation to indicate active reconnection attempts
  offlineConnectionPulse: {
    // Duration of the radar pulse animation (ms)
    durationMs: parseInt(process.env.OFFLINE_PULSE_DURATION_MS || '2000'),
    // CSS duration string for v-bind
    durationSec: `${parseInt(process.env.OFFLINE_PULSE_DURATION_MS || '2000') / 1000}s`,
    // Delay between successive pulses (ms)
    delayMs: parseInt(process.env.OFFLINE_PULSE_DELAY_MS || '500'),
    // Scale of the pulse at its peak (1.0 = 100%)
    maxScale: parseFloat(process.env.OFFLINE_PULSE_MAX_SCALE || '2.5'),
    // Starting opacity of the pulse ring
    startOpacity: parseFloat(process.env.OFFLINE_PULSE_START_OPACITY || '0.6'),
    // Ending opacity of the pulse ring
    endOpacity: parseFloat(process.env.OFFLINE_PULSE_END_OPACITY || '0'),
    // Color of the pulse ring (amber-500 with opacity)
    color: process.env.OFFLINE_PULSE_COLOR || 'rgba(245, 158, 11, 0.4)',
    // Number of pulse rings to show simultaneously
    ringCount: parseInt(process.env.OFFLINE_PULSE_RING_COUNT || '3'),
  },

  // Offline Indicator Retry Button Animation
  offlineRetry: {
    // Duration of the button press feedback (ms)
    pressDurationMs: parseInt(
      process.env.OFFLINE_RETRY_PRESS_DURATION_MS || '150'
    ),
    // Scale when button is pressed
    pressScale: parseFloat(process.env.OFFLINE_RETRY_PRESS_SCALE || '0.95'),
    // Duration of the success checkmark animation (ms)
    successDurationMs: parseInt(
      process.env.OFFLINE_RETRY_SUCCESS_DURATION_MS || '600'
    ),
    // Spin duration for the retry spinner (ms)
    spinDurationMs: parseInt(
      process.env.OFFLINE_RETRY_SPIN_DURATION_MS || '800'
    ),
    // Delay before redirecting after successful connection (ms)
    redirectDelayMs: parseInt(
      process.env.OFFLINE_RETRY_REDIRECT_DELAY_MS || '500'
    ),
  },

  // Form Validation Animations - Gentle feedback for validation errors
  validation: {
    // Duration of shake animation when validation fails (ms)
    shakeDurationMs: parseInt(
      process.env.VALIDATION_SHAKE_DURATION_MS || '500'
    ),
    // Duration of shake animation in seconds (for CSS animations)
    shakeDurationSec: `${parseInt(process.env.VALIDATION_SHAKE_DURATION_MS || '500') / 1000}s`,
    // Shake intensity in pixels (how far the element moves)
    shakeIntensityPx: parseInt(
      process.env.VALIDATION_SHAKE_INTENSITY_PX || '8'
    ),
    // Number of shake cycles
    shakeCycles: parseInt(process.env.VALIDATION_SHAKE_CYCLES || '3'),
  },

  // Reading Progress Animations
  readingProgress: {
    transitionDuration: process.env.READING_PROGRESS_TRANSITION || '0.1s',
    shimmerDurationSec: parseInt(
      process.env.READING_PROGRESS_SHIMMER_DURATION || '2'
    ),
    tooltipAppearDuration:
      process.env.READING_PROGRESS_TOOLTIP_APPEAR || '0.2s',
    // Milestone interval for progress announcements (percent)
    milestoneInterval: parseInt(
      process.env.READING_PROGRESS_MILESTONE_INTERVAL || '25'
    ),
    // Celebration animation duration when reading completes (ms)
    celebrationDurationMs: parseInt(
      process.env.READING_PROGRESS_CELEBRATION_DURATION || '3000'
    ),
    // Scroll timeout for progress updates (ms)
    scrollTimeoutMs: parseInt(
      process.env.READING_PROGRESS_SCROLL_TIMEOUT || '100'
    ),
    // Checkmark draw animation duration (ms) - Flexy hates hardcoded 0.3s!
    checkmarkDrawDurationMs: parseInt(
      process.env.READING_PROGRESS_CHECKMARK_DRAW_MS || '300'
    ),
    // Checkmark draw animation delay (ms)
    checkmarkDrawDelayMs: parseInt(
      process.env.READING_PROGRESS_CHECKMARK_DRAW_DELAY_MS || '300'
    ),
    // Text fade-in animation duration (ms)
    textFadeInDurationMs: parseInt(
      process.env.READING_PROGRESS_TEXT_FADE_MS || '300'
    ),
    // Text fade-in animation delay (ms)
    textFadeInDelayMs: parseInt(
      process.env.READING_PROGRESS_TEXT_FADE_DELAY_MS || '400'
    ),
    // Confetti burst animation duration (ms)
    confettiBurstDurationMs: parseInt(
      process.env.READING_PROGRESS_CONFETTI_BURST_MS || '800'
    ),
    // Confetti burst animation delay (ms)
    confettiBurstDelayMs: parseInt(
      process.env.READING_PROGRESS_CONFETTI_BURST_DELAY_MS || '200'
    ),
  },

  // Error Boundary Animations - Palette's micro-UX enhancements
  errorBoundary: {
    transitionDuration: process.env.ERROR_BOUNDARY_TRANSITION || '0.3s',
    // Shake animation duration when error appears (ms)
    shakeDurationMs: parseInt(
      process.env.ERROR_BOUNDARY_SHAKE_DURATION_MS || '500'
    ),
    // Success pulse animation duration on reset (ms)
    successPulseDurationMs: parseInt(
      process.env.ERROR_BOUNDARY_SUCCESS_PULSE_DURATION_MS || '400'
    ),
    // Countdown ring configuration for auto-retry
    countdownRing: {
      // Radius of the countdown ring in pixels
      radiusPx: parseInt(process.env.ERROR_BOUNDARY_RING_RADIUS_PX || '18'),
      // Stroke width of the ring
      strokeWidthPx: parseInt(
        process.env.ERROR_BOUNDARY_RING_STROKE_WIDTH_PX || '2'
      ),
      // Ring color
      color: process.env.ERROR_BOUNDARY_RING_COLOR || 'rgba(59, 130, 246, 0.8)',
      // Background track color
      trackColor:
        process.env.ERROR_BOUNDARY_RING_TRACK_COLOR ||
        'rgba(59, 130, 246, 0.2)',
    },
  },

  // API Keys Animations - Flexy hates hardcoded draw animation!
  // SVG draw animation for key generation visual feedback
  apiKeys: {
    // SVG draw animation duration (ms)
    drawDurationMs: parseInt(process.env.API_KEYS_DRAW_DURATION_MS || '1500'),
    // CSS duration string for v-bind
    drawDurationSec: `${parseInt(process.env.API_KEYS_DRAW_DURATION_MS || '1500') / 1000}s`,
    // Pulse slow animation duration (seconds)
    pulseSlowDurationSec: parseFloat(
      process.env.API_KEYS_PULSE_SLOW_SEC || '3'
    ),
    // Bounce subtle animation duration (seconds)
    bounceSubtleDurationSec: parseFloat(
      process.env.API_KEYS_BOUNCE_SUBTLE_SEC || '2'
    ),
    // Float animation duration for decorative keys (seconds)
    floatDurationSec: parseFloat(process.env.API_KEYS_FLOAT_SEC || '3.5'),
  },

  // Card Animations
  cardAnimations: {
    enterDistancePx: parseInt(process.env.CARD_ENTER_DISTANCE_PX || '30'),
    enterScale: parseFloat(process.env.CARD_ENTER_SCALE || '0.92'),
    hoverTranslateYPx: parseInt(process.env.CARD_HOVER_TRANSLATE_Y || '-4'),
    hoverScale: parseFloat(process.env.CARD_HOVER_SCALE || '1.02'),
    activeTranslateYPx: parseInt(process.env.CARD_ACTIVE_TRANSLATE_Y || '2'),
    activeScale: parseFloat(process.env.CARD_ACTIVE_SCALE || '0.99'),
  },

  // Empty State Stagger
  emptyStateStagger: {
    baseDelayMs: parseInt(process.env.EMPTY_STATE_STAGGER_BASE || '100'),
  },

  // PWA Install Prompt Pulse
  pwaPulse: {
    color: process.env.PWA_PULSE_COLOR || 'rgba(59, 130, 246, 0.4)',
  },

  // Card Shine Effect - Palette's premium micro-UX touch!
  // Adds a subtle moving gradient on hover for a polished, premium feel
  cardShine: {
    // Duration of the shine animation (seconds)
    durationSec: parseFloat(process.env.CARD_SHINE_DURATION_SEC || '1.2'),
    // Delay before shine starts on hover (ms)
    delayMs: parseInt(process.env.CARD_SHINE_DELAY_MS || '0'),
    // Gradient color start (white with low opacity)
    gradientStart:
      process.env.CARD_SHINE_GRADIENT_START || 'rgba(255, 255, 255, 0)',
    // Gradient middle (white with higher opacity for the shine)
    gradientMiddle:
      process.env.CARD_SHINE_GRADIENT_MIDDLE || 'rgba(255, 255, 255, 0.15)',
    // Gradient end (white with low opacity)
    gradientEnd:
      process.env.CARD_SHINE_GRADIENT_END || 'rgba(255, 255, 255, 0)',
    // Angle of the shine sweep (degrees)
    angleDegrees: parseInt(process.env.CARD_SHINE_ANGLE_DEGREES || '110'),
    // Scale factor for the shine gradient
    scaleFactor: parseFloat(process.env.CARD_SHINE_SCALE_FACTOR || '1.5'),
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.CARD_SHINE_RESPECT_REDUCED_MOTION !== 'false',
  },

  // Smart Paste Animations - Palette's micro-UX enhancement!
  // Provides delightful visual feedback when users paste content
  smartPaste: {
    // Duration for the paste indicator to remain visible (ms)
    indicatorDurationMs: parseInt(
      process.env.SMART_PASTE_DURATION_MS || '1200'
    ),
    // Animation scale factor for the indicator pop effect
    popScale: parseFloat(process.env.SMART_PASTE_POP_SCALE || '1.05'),
    // Vertical offset for indicator position (px)
    verticalOffset: parseInt(process.env.SMART_PASTE_VERTICAL_OFFSET || '8'),
    // Screen reader announcement timeout (ms) - Flexy hates hardcoded 1000!
    announcementTimeoutMs: parseInt(
      process.env.SMART_PASTE_ANNOUNCEMENT_TIMEOUT_MS || '1000'
    ),
    // Z-index for paste indicator - Flexy hates hardcoded 9999!
    zIndex: parseInt(process.env.SMART_PASTE_Z_INDEX || '9999'),
    // CSS styling values - Flexy hates hardcoded CSS!
    styles: {
      // Padding (px)
      paddingX: parseInt(process.env.SMART_PASTE_PADDING_X || '12'),
      paddingY: parseInt(process.env.SMART_PASTE_PADDING_Y || '6'),
      // Font size (px)
      fontSize: parseInt(process.env.SMART_PASTE_FONT_SIZE || '12'),
      // Border radius (px)
      borderRadius: parseInt(process.env.SMART_PASTE_BORDER_RADIUS || '6'),
      // Arrow size (px)
      arrowSize: parseInt(process.env.SMART_PASTE_ARROW_SIZE || '8'),
      // Animation duration (seconds)
      animationDuration: parseFloat(
        process.env.SMART_PASTE_ANIMATION_DURATION || '0.3'
      ),
      // Box shadow values
      shadow: {
        y: parseInt(process.env.SMART_PASTE_SHADOW_Y || '4'),
        blur: parseInt(process.env.SMART_PASTE_SHADOW_BLUR || '6'),
        spread: parseInt(process.env.SMART_PASTE_SHADOW_SPREAD || '-1'),
        opacity: parseFloat(process.env.SMART_PASTE_SHADOW_OPACITY || '0.1'),
      },
    },
  },

  // Confetti Celebration Animations - Palette's delightful micro-UX touch!
  confetti: {
    // Delay before triggering confetti after success (ms) - allows UI to update first
    submissionDelayMs: parseInt(
      process.env.CONFETTI_SUBMISSION_DELAY_MS || '100'
    ),
    // Delay before triggering confetti in comparison page (ms)
    comparisonDelayMs: parseInt(
      process.env.CONFETTI_COMPARISON_DELAY_MS || '200'
    ),
    // Delay before triggering confetti when clearing bookmarks (ms)
    clearBookmarksDelayMs: parseInt(
      process.env.CONFETTI_CLEAR_BOOKMARKS_DELAY_MS || '100'
    ),
    // Duration of confetti animation in milliseconds
    durationMs: parseInt(process.env.CONFETTI_DURATION_MS || '3000'),
    // Duration for light celebration confetti (ms)
    lightDurationMs: parseInt(process.env.CONFETTI_LIGHT_DURATION_MS || '2000'),
    // Number of particles for light celebration
    particleCountLight: parseInt(process.env.CONFETTI_PARTICLE_LIGHT || '30'),
    // Number of particles for medium celebration
    particleCountMedium: parseInt(process.env.CONFETTI_PARTICLE_MEDIUM || '60'),
    // Number of particles for heavy celebration
    particleCountHeavy: parseInt(process.env.CONFETTI_PARTICLE_HEAVY || '100'),
    // Minimum particle size in pixels
    particleSizeMin: parseInt(process.env.CONFETTI_SIZE_MIN || '8'),
    // Maximum particle size in pixels
    particleSizeMax: parseInt(process.env.CONFETTI_SIZE_MAX || '16'),
    // Delay between particle generation (stagger effect)
    staggerDelayMs: parseInt(process.env.CONFETTI_STAGGER_DELAY_MS || '50'),
    // Duration variation for particles (adds randomness)
    durationVariationMs: parseInt(
      process.env.CONFETTI_DURATION_VARIATION_MS || '1500'
    ),
    // Brand colors for confetti particles - Flexy hates hardcoded hex codes!
    colors: [
      process.env.CONFETTI_COLOR_BLUE || '#3b82f6',
      process.env.CONFETTI_COLOR_PURPLE || '#8b5cf6',
      process.env.CONFETTI_COLOR_GREEN || '#10b981',
      process.env.CONFETTI_COLOR_AMBER || '#f59e0b',
      process.env.CONFETTI_COLOR_RED || '#ef4444',
      process.env.CONFETTI_COLOR_CYAN || '#06b6d4',
      process.env.CONFETTI_COLOR_ORANGE || '#f97316',
      process.env.CONFETTI_COLOR_PINK || '#ec4899',
    ],
    // Maximum random delay for particle generation (seconds)
    delayMaxSec: parseFloat(process.env.CONFETTI_DELAY_MAX_SEC || '0.5'),
    // Minimum animation duration (seconds)
    durationMinSec: parseFloat(process.env.CONFETTI_DURATION_MIN_SEC || '1.5'),
    // Maximum animation duration (seconds)
    durationMaxSec: parseFloat(process.env.CONFETTI_DURATION_MAX_SEC || '3.0'),
    // Shape probabilities - Flexy hates magic numbers!
    shapeProbability: {
      // If random > threshold, use circle
      circle: parseFloat(process.env.CONFETTI_CIRCLE_THRESHOLD || '0.6'),
      // If random > threshold, use square (else rectangle)
      square: parseFloat(process.env.CONFETTI_SQUARE_THRESHOLD || '0.5'),
    },
    // Cleanup buffer time after animation completes (ms)
    cleanupBufferMs: parseInt(process.env.CONFETTI_CLEANUP_BUFFER_MS || '1000'),
    // Rectangle height ratio (percentage of width)
    rectangleHeightRatio: parseFloat(
      process.env.CONFETTI_RECTANGLE_HEIGHT_RATIO || '0.6'
    ),
  },

  // Transition Durations - Flexy hates hardcoded CSS duration classes!
  // Standardized transition durations for consistent UX
  transition: {
    // Fast transitions (150ms) - for quick feedback like button presses
    fast: {
      durationMs: parseInt(process.env.TRANSITION_FAST_DURATION_MS || '150'),
      class: 'duration-150',
    },
    // Normal transitions (200ms) - for most UI interactions
    normal: {
      durationMs: parseInt(process.env.TRANSITION_NORMAL_DURATION_MS || '200'),
      class: 'duration-200',
    },
    // Slow transitions (300ms) - for more prominent animations
    slow: {
      durationMs: parseInt(process.env.TRANSITION_SLOW_DURATION_MS || '300'),
      class: 'duration-300',
    },
    // Slower transitions (500ms) - for prominent entrances and exits
    slower: {
      durationMs: parseInt(process.env.TRANSITION_SLOWER_DURATION_MS || '500'),
      class: 'duration-500',
    },
    // Easing functions
    easeOut: process.env.TRANSITION_EASE_OUT || 'ease-out',
    easeIn: process.env.TRANSITION_EASE_IN || 'ease-in',
  },

  // CSS Transition Durations - Flexy hates hardcoded CSS duration values!
  // For use in <style> sections of Vue components with CSS transitions
  cssTransitions: {
    // Zero delay (0ms) - for particle effects and no-delay scenarios
    // Flexy hates hardcoded 0s! Now configurable via env var
    zeroDelayMs: parseInt(process.env.CSS_TRANSITION_ZERO_DELAY_MS || '0'),
    zeroDelaySec: `${parseInt(process.env.CSS_TRANSITION_ZERO_DELAY_MS || '0') / 1000}s`,

    // Instant/Immediate transitions (1ms) - for reduced motion or instant feedback
    instantMs: parseInt(process.env.CSS_TRANSITION_INSTANT_MS || '1'),
    instantSec: `${parseInt(process.env.CSS_TRANSITION_INSTANT_MS || '1') / 1000}s`,

    // Ultra-fast transitions (50ms) - for micro-interactions
    ultraFastMs: parseInt(process.env.CSS_TRANSITION_ULTRA_FAST_MS || '50'),
    ultraFastSec: `${parseInt(process.env.CSS_TRANSITION_ULTRA_FAST_MS || '50') / 1000}s`,

    // Fast transitions (100ms/0.1s) - for quick feedback like opacity changes
    fastMs: parseInt(process.env.CSS_TRANSITION_FAST_MS || '100'),
    fastSec: `${parseInt(process.env.CSS_TRANSITION_FAST_MS || '100') / 1000}s`,

    // Quick transitions (150ms) - for button presses and small UI changes
    quickMs: parseInt(process.env.CSS_TRANSITION_QUICK_MS || '150'),
    quickSec: `${parseInt(process.env.CSS_TRANSITION_QUICK_MS || '150') / 1000}s`,

    // Normal transitions (200ms/0.2s) - for most UI interactions
    normalMs: parseInt(process.env.CSS_TRANSITION_NORMAL_MS || '200'),
    normalSec: `${parseInt(process.env.CSS_TRANSITION_NORMAL_MS || '200') / 1000}s`,

    // Standard transitions (300ms/0.3s) - for hover states and transforms
    standardMs: parseInt(process.env.CSS_TRANSITION_STANDARD_MS || '300'),
    standardSec: `${parseInt(process.env.CSS_TRANSITION_STANDARD_MS || '300') / 1000}s`,

    // Slow transitions (400ms) - for more noticeable animations
    slowMs: parseInt(process.env.CSS_TRANSITION_SLOW_MS || '400'),
    slowSec: `${parseInt(process.env.CSS_TRANSITION_SLOW_MS || '400') / 1000}s`,

    // Slower transitions (500ms) - for entrance/exit animations
    slowerMs: parseInt(process.env.CSS_TRANSITION_SLOWER_MS || '500'),
    slowerSec: `${parseInt(process.env.CSS_TRANSITION_SLOWER_MS || '500') / 1000}s`,

    // Long transitions (600ms) - for dramatic effects
    longMs: parseInt(process.env.CSS_TRANSITION_LONG_MS || '600'),
    longSec: `${parseInt(process.env.CSS_TRANSITION_LONG_MS || '600') / 1000}s`,

    // Hover-specific transitions (commonly 200-300ms)
    hoverMs: parseInt(process.env.CSS_TRANSITION_HOVER_MS || '200'),
    hoverSec: `${parseInt(process.env.CSS_TRANSITION_HOVER_MS || '200') / 1000}s`,

    // Reduced motion transitions (shorter duration for accessibility)
    reducedMotionMs: parseInt(process.env.CSS_TRANSITION_REDUCED_MS || '100'),
    reducedMotionSec: `${parseInt(process.env.CSS_TRANSITION_REDUCED_MS || '100') / 1000}s`,
  },

  // Tailwind Duration Classes - Flexy hates hardcoded duration-* classes!
  // Use these in Vue templates: :class="animationConfig.tailwindDurations.fast"
  tailwindDurations: {
    // Instant (0ms/1ms)
    instant: process.env.TAILWIND_DURATION_INSTANT || 'duration-0',
    // Ultra-fast (50ms) - micro-interactions
    ultraFast: process.env.TAILWIND_DURATION_ULTRA_FAST || 'duration-75',
    // Fast (100ms) - quick feedback
    fast: process.env.TAILWIND_DURATION_FAST || 'duration-100',
    // Quick (150ms) - button presses
    quick: process.env.TAILWIND_DURATION_QUICK || 'duration-150',
    // Normal (200ms) - most UI interactions
    normal: process.env.TAILWIND_DURATION_NORMAL || 'duration-200',
    // Moderate (250ms) - between normal and standard - Flexy hates hardcoded duration-250!
    moderate: process.env.TAILWIND_DURATION_MODERATE || 'duration-250',
    // Standard (300ms) - hover states
    standard: process.env.TAILWIND_DURATION_STANDARD || 'duration-300',
    // Slow (400ms) - noticeable animations
    slow: process.env.TAILWIND_DURATION_SLOW || 'duration-400',
    // Slower (500ms) - entrance animations
    slower: process.env.TAILWIND_DURATION_SLOWER || 'duration-500',
    // Long (600ms) - dramatic effects
    long: process.env.TAILWIND_DURATION_LONG || 'duration-600',
    // Extra long (700ms)
    extraLong: process.env.TAILWIND_DURATION_EXTRA_LONG || 'duration-700',
    // Extended (1000ms/1s) - slow transitions
    extended: process.env.TAILWIND_DURATION_EXTENDED || 'duration-1000',
  },

  // CSS Animation Timing - Flexy hates hardcoded animation delays!
  // For CSS animations with animation-delay and animation-duration
  cssAnimations: {
    // Zero delay (0ms) - for particle effects and immediate animations
    // Flexy hates hardcoded 0s! Now configurable via env var
    zeroDelayMs: parseInt(process.env.CSS_ANIM_ZERO_DELAY_MS || '0'),
    zeroDelaySec: `${parseInt(process.env.CSS_ANIM_ZERO_DELAY_MS || '0') / 1000}s`,

    // Micro delays for staggered animations
    microDelayMs: parseInt(process.env.CSS_ANIM_MICRO_DELAY_MS || '50'),
    microDelaySec: `${parseInt(process.env.CSS_ANIM_MICRO_DELAY_MS || '50') / 1000}s`,

    // Small delays (100-200ms)
    smallDelayMs: parseInt(process.env.CSS_ANIM_SMALL_DELAY_MS || '100'),
    smallDelaySec: `${parseInt(process.env.CSS_ANIM_SMALL_DELAY_MS || '100') / 1000}s`,

    // Medium delays (300-500ms)
    mediumDelayMs: parseInt(process.env.CSS_ANIM_MEDIUM_DELAY_MS || '300'),
    mediumDelaySec: `${parseInt(process.env.CSS_ANIM_MEDIUM_DELAY_MS || '300') / 1000}s`,

    // Large delays (800ms-1s) - for icon attention animations
    iconAttentionDelayMs: parseInt(process.env.CSS_ANIM_ICON_DELAY_MS || '500'),
    iconAttentionDelaySec: `${parseInt(process.env.CSS_ANIM_ICON_DELAY_MS || '500') / 1000}s`,

    // Icon attention animation duration
    iconAttentionDurationMs: parseInt(
      process.env.CSS_ANIM_ICON_DURATION_MS || '2000'
    ),
    iconAttentionDurationSec: `${parseInt(process.env.CSS_ANIM_ICON_DURATION_MS || '2000') / 1000}s`,

    // Standard animation duration (300ms)
    standardDurationMs: parseInt(process.env.CSS_ANIM_STANDARD_MS || '300'),
    standardDurationSec: `${parseInt(process.env.CSS_ANIM_STANDARD_MS || '300') / 1000}s`,

    // Medium animation duration (400ms) - for check-pop and success animations
    mediumDurationMs: parseInt(
      process.env.CSS_ANIM_MEDIUM_DURATION_MS || '400'
    ),
    mediumDurationSec: `${parseInt(process.env.CSS_ANIM_MEDIUM_DURATION_MS || '400') / 1000}s`,

    // Long animation duration (3s for breathe animations)
    longDurationMs: parseInt(process.env.CSS_ANIM_LONG_MS || '3000'),
    longDurationSec: `${parseInt(process.env.CSS_ANIM_LONG_MS || '3000') / 1000}s`,

    // Extended animation duration (1s) - for countdown rings and progress indicators
    extendedDurationMs: parseInt(process.env.CSS_ANIM_EXTENDED_MS || '1000'),
    extendedDurationSec: `${parseInt(process.env.CSS_ANIM_EXTENDED_MS || '1000') / 1000}s`,

    // Extra extended animation duration (1.5s) - for paused state pulses
    extraExtendedDurationMs: parseInt(
      process.env.CSS_ANIM_EXTRA_EXTENDED_MS || '1500'
    ),
    extraExtendedDurationSec: `${parseInt(process.env.CSS_ANIM_EXTRA_EXTENDED_MS || '1500') / 1000}s`,

    // Sweep animation duration (0.8s) - for shimmer sweep effects
    sweepDurationMs: parseInt(process.env.CSS_ANIM_SWEEP_MS || '800'),
    sweepDurationSec: `${parseInt(process.env.CSS_ANIM_SWEEP_MS || '800') / 1000}s`,
  },

  // Floating Label Animations - Palette's micro-UX delight!
  // Creates smooth floating label transitions for form inputs
  floatingLabel: {
    // Duration of the label float animation (ms)
    durationMs: parseInt(process.env.FLOATING_LABEL_DURATION_MS || '200'),
    // CSS duration string for transitions
    durationSec: `${parseInt(process.env.FLOATING_LABEL_DURATION_MS || '200') / 1000}s`,
    // Easing function for the animation
    easing: process.env.FLOATING_LABEL_EASING || EASING_REF.MATERIAL_STANDARD,
    // Scale factor when label floats up (0.85 = 85% of original size)
    scale: parseFloat(process.env.FLOATING_LABEL_SCALE || '0.85'),
    // Vertical translation when floating (px) - moves up
    translateYPx: parseInt(process.env.FLOATING_LABEL_TRANSLATE_Y || '-24'),
    // Background color for floating label (to cover input border)
    bgColor: process.env.FLOATING_LABEL_BG_COLOR || 'rgba(255, 255, 255, 1)',
    // Padding for floating label background
    paddingX: parseInt(process.env.FLOATING_LABEL_PADDING_X || '4'),
    // Horizontal offset when floating (px)
    translateXPx: parseInt(process.env.FLOATING_LABEL_TRANSLATE_X || '4'),
    // Label color when floating
    colorFloating:
      process.env.FLOATING_LABEL_COLOR_FLOATING || 'rgb(59, 130, 246)',
    // Label color when not floating
    colorDefault:
      process.env.FLOATING_LABEL_COLOR_DEFAULT || 'rgb(107, 114, 128)',
    // Label color when input has error
    colorError: process.env.FLOATING_LABEL_COLOR_ERROR || 'rgb(239, 68, 68)',
    // Label color when input is valid
    colorSuccess:
      process.env.FLOATING_LABEL_COLOR_SUCCESS || 'rgb(34, 197, 94)',
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.FLOATING_LABEL_RESPECT_REDUCED_MOTION !== 'false',
  },

  // Scroll Progress Indicator - Palette's micro-UX enhancement!
  // Provides visual feedback of scroll position in virtual lists
  scrollProgress: {
    // Height of the progress bar (px)
    barHeightPx: parseInt(process.env.SCROLL_PROGRESS_BAR_HEIGHT_PX || '3'),
    // Background color of the progress bar
    barColor:
      process.env.SCROLL_PROGRESS_BAR_COLOR || 'rgba(59, 130, 246, 0.8)',
    // Background color of the track
    trackColor: process.env.SCROLL_PROGRESS_TRACK_COLOR || 'transparent',
    // Glow color for the progress bar
    glowColor:
      process.env.SCROLL_PROGRESS_GLOW_COLOR || 'rgba(59, 130, 246, 0.4)',
    // Glow blur radius (px)
    glowBlurPx: parseInt(process.env.SCROLL_PROGRESS_GLOW_BLUR_PX || '6'),
    // Whether to show the glow effect
    showGlow: process.env.SCROLL_PROGRESS_SHOW_GLOW !== 'false',
    // Transition duration for smooth updates (ms)
    transitionDurationMs: parseInt(
      process.env.SCROLL_PROGRESS_TRANSITION_MS || '100'
    ),
    // Minimum scroll percentage before showing the indicator (0-100)
    minScrollPercent: parseInt(process.env.SCROLL_PROGRESS_MIN_PERCENT || '0'),
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.SCROLL_PROGRESS_RESPECT_REDUCED_MOTION !== 'false',
    // Flexy hates hardcoded border-radius values!
    borderRadius: process.env.SCROLL_PROGRESS_BORDER_RADIUS || '0 2px 2px 0',
  },

  // Checkbox Micro-Interactions - Palette's delightful micro-UX touch!
  // Adds satisfying visual feedback when selecting/deselecting filter checkboxes
  checkbox: {
    // Duration of the check draw animation (ms)
    checkDrawDurationMs: parseInt(
      process.env.CHECKBOX_DRAW_DURATION_MS || '300'
    ),
    // CSS duration string
    checkDrawDurationSec: `${parseInt(process.env.CHECKBOX_DRAW_DURATION_MS || '300') / 1000}s`,
    // Duration of the pop animation (ms)
    popDurationMs: parseInt(process.env.CHECKBOX_POP_DURATION_MS || '250'),
    // Scale factor at peak of pop animation
    popScale: parseFloat(process.env.CHECKBOX_POP_SCALE || '1.25'),
    // Duration of color bloom effect (ms)
    bloomDurationMs: parseInt(process.env.CHECKBOX_BLOOM_DURATION_MS || '400'),
    // Scale factor for bloom ring
    bloomScale: parseFloat(process.env.CHECKBOX_BLOOM_SCALE || '1.8'),
    // Bloom ring opacity
    bloomOpacity: parseFloat(process.env.CHECKBOX_BLOOM_OPACITY || '0.3'),
    // Duration of background highlight fade (ms)
    highlightDurationMs: parseInt(
      process.env.CHECKBOX_HIGHLIGHT_DURATION_MS || '300'
    ),
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.CHECKBOX_RESPECT_REDUCED_MOTION !== 'false',
  },

  // Spring Physics Micro-Interaction - Palette's delightful micro-UX touch!
  // Adds tactile spring physics animations to filter chips for satisfying interactions
  filterChipSpring: {
    // Spring stiffness (higher = stiffer, faster bounce)
    stiffness: parseFloat(process.env.FILTER_CHIP_STIFFNESS || '300'),
    // Spring damping (higher = less bounce)
    damping: parseFloat(process.env.FILTER_CHIP_DAMPING || '25'),
    // Spring mass (higher = more inertia)
    mass: parseFloat(process.env.FILTER_CHIP_MASS || '1'),
    // Duration of the spring animation (ms)
    durationMs: parseInt(process.env.FILTER_CHIP_SPRING_DURATION_MS || '600'),
    // CSS duration string for transitions
    durationSec: `${parseInt(process.env.FILTER_CHIP_SPRING_DURATION_MS || '600') / 1000}s`,
    // Scale factor when chip is pressed
    pressScale: parseFloat(process.env.FILTER_CHIP_PRESS_SCALE || '0.92'),
    // Scale factor when chip enters (bouncy entrance)
    enterScale: parseFloat(process.env.FILTER_CHIP_ENTER_SCALE || '1.1'),
    // Rotation angle when chip is removed (degrees)
    removeRotationDeg: parseInt(
      process.env.FILTER_CHIP_REMOVE_ROTATION || '15'
    ),
    // Translation distance when chip is removed (px)
    removeTranslateXPx: parseInt(
      process.env.FILTER_CHIP_REMOVE_TRANSLATE_X || '50'
    ),
    // Haptic feedback pattern when chip is removed
    hapticPattern: process.env.FILTER_CHIP_HAPTIC_PATTERN || '20, 30, 20',
    // Whether to play sound effect on removal (using Web Audio API)
    playSoundOnRemove: process.env.FILTER_CHIP_PLAY_SOUND === 'true',
    // Sound frequency for removal (Hz)
    soundFrequency: parseInt(process.env.FILTER_CHIP_SOUND_FREQ || '800'),
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.FILTER_CHIP_RESPECT_REDUCED_MOTION !== 'false',
  },

  // Loading Spinner Glow Effect - Palette's micro-UX delight!
  // Adds a subtle pulsing glow around the loading spinner for visual engagement
  spinnerGlow: {
    // Duration of the glow pulse animation (ms)
    durationMs: parseInt(process.env.SPINNER_GLOW_DURATION_MS || '2000'),
    // CSS duration string for v-bind
    durationSec: `${parseInt(process.env.SPINNER_GLOW_DURATION_MS || '2000') / 1000}s`,
    // Primary glow color (blue-500 with opacity)
    primaryColor:
      process.env.SPINNER_GLOW_PRIMARY_COLOR || 'rgba(59, 130, 246, 0.4)',
    // Secondary glow color for pulse effect (blue-400 with lower opacity)
    secondaryColor:
      process.env.SPINNER_GLOW_SECONDARY_COLOR || 'rgba(96, 165, 250, 0.2)',
    // Box shadow spread at minimum (px)
    spreadMin: parseInt(process.env.SPINNER_GLOW_SPREAD_MIN || '4'),
    // Box shadow spread at maximum (px)
    spreadMax: parseInt(process.env.SPINNER_GLOW_SPREAD_MAX || '16'),
    // Scale factor for the glow ring
    scale: parseFloat(process.env.SPINNER_GLOW_SCALE || '1.2'),
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.SPINNER_GLOW_RESPECT_REDUCED_MOTION !== 'false',
  },

  // Alternative Suggestions Animations - Palette's micro-UX delight!
  // Staggered card entrance with subtle hover effects
  alternativeSuggestions: {
    // Duration of each card's entrance animation (ms)
    entranceDurationMs: parseInt(
      process.env.ALTERNATIVES_ENTRANCE_DURATION_MS || '500'
    ),
    // CSS duration string
    entranceDurationSec: `${parseInt(process.env.ALTERNATIVES_ENTRANCE_DURATION_MS || '500') / 1000}s`,
    // Delay between each card's entrance (stagger effect) (ms)
    staggerDelayMs: parseInt(process.env.ALTERNATIVES_STAGGER_MS || '100'),
    // Maximum stagger delay to prevent long waits (ms)
    maxStaggerDelayMs: parseInt(
      process.env.ALTERNATIVES_MAX_STAGGER_MS || '600'
    ),
    // Distance cards travel during entrance (px)
    entranceDistancePx: parseInt(
      process.env.ALTERNATIVES_ENTRANCE_DISTANCE || '30'
    ),
    // Scale at start of entrance animation
    entranceStartScale: parseFloat(
      process.env.ALTERNATIVES_ENTRANCE_SCALE || '0.92'
    ),
    // Hover lift amount (px)
    hoverLiftPx: parseInt(process.env.ALTERNATIVES_HOVER_LIFT || '4'),
    // Hover scale factor
    hoverScale: parseFloat(process.env.ALTERNATIVES_HOVER_SCALE || '1.02'),
    // Shine effect duration on hover (seconds)
    shineDurationSec: parseFloat(
      process.env.ALTERNATIVES_SHINE_DURATION || '0.8'
    ),
    // Loading pulse duration (seconds)
    loadingPulseDurationSec: parseFloat(
      process.env.ALTERNATIVES_LOADING_PULSE || '1.5'
    ),
    // Initial loading delay to show loading state for better UX (ms)
    loadingDelayMs: parseInt(
      process.env.ALTERNATIVES_LOADING_DELAY_MS || '300'
    ),
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.ALTERNATIVES_RESPECT_REDUCED_MOTION !== 'false',
  },

  // Similar Resources Micro-UX - Palette's delightful enhancement! ✨
  // Staggered card entrance with lift and press effects
  similarResources: {
    // Duration of each card's entrance animation (ms)
    entranceDurationMs: parseInt(
      process.env.SIMILAR_ENTRANCE_DURATION_MS || '500'
    ),
    // CSS duration string
    entranceDurationSec: `${parseInt(process.env.SIMILAR_ENTRANCE_DURATION_MS || '500') / 1000}s`,
    // Duration of leave animation (ms)
    leaveDurationMs: parseInt(process.env.SIMILAR_LEAVE_DURATION_MS || '300'),
    // CSS duration string for leave
    leaveDurationSec: `${parseInt(process.env.SIMILAR_LEAVE_DURATION_MS || '300') / 1000}s`,
    // Delay between each card's entrance (stagger effect) (ms)
    staggerDelayMs: parseInt(process.env.SIMILAR_STAGGER_MS || '100'),
    // Maximum stagger delay to prevent long waits (ms)
    maxStaggerDelayMs: parseInt(process.env.SIMILAR_MAX_STAGGER_MS || '600'),
    // Distance cards travel during entrance (px)
    entranceDistancePx: parseInt(process.env.SIMILAR_ENTRANCE_DISTANCE || '24'),
    // Scale at start of entrance animation
    entranceStartScale: parseFloat(
      process.env.SIMILAR_ENTRANCE_SCALE || '0.95'
    ),
    // Hover lift amount (px)
    hoverLiftPx: parseInt(process.env.SIMILAR_HOVER_LIFT || '4'),
    // Hover scale factor
    hoverScale: parseFloat(process.env.SIMILAR_HOVER_SCALE || '1.02'),
    // Hover transition duration (ms)
    hoverTransitionMs: parseInt(
      process.env.SIMILAR_HOVER_TRANSITION_MS || '200'
    ),
    // Press scale factor (tactile feedback)
    pressScale: parseFloat(process.env.SIMILAR_PRESS_SCALE || '0.98'),
    // Press transition duration (ms)
    pressTransitionMs: parseInt(
      process.env.SIMILAR_PRESS_TRANSITION_MS || '100'
    ),
    // Arrow bounce animation duration (seconds)
    arrowBounceDurationSec: parseFloat(
      process.env.SIMILAR_ARROW_BOUNCE || '0.6'
    ),
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.SIMILAR_RESPECT_REDUCED_MOTION !== 'false',
  },

  // Resource Header Micro-UX - Palette's magnetic enhancement! 🎨
  // Enhanced entrance animations and magnetic bookmark button
  resourceHeader: {
    // Title entrance animation duration (ms)
    titleEntranceDurationMs: parseInt(
      process.env.RESOURCE_HEADER_TITLE_DURATION_MS || '600'
    ),
    // CSS duration string
    titleEntranceDurationSec: `${parseInt(process.env.RESOURCE_HEADER_TITLE_DURATION_MS || '600') / 1000}s`,
    // Category entrance animation duration (ms)
    categoryEntranceDurationMs: parseInt(
      process.env.RESOURCE_HEADER_CATEGORY_DURATION_MS || '500'
    ),
    // CSS duration string
    categoryEntranceDurationSec: `${parseInt(process.env.RESOURCE_HEADER_CATEGORY_DURATION_MS || '500') / 1000}s`,
    // Delay between title and category entrance (ms)
    entranceStaggerDelayMs: parseInt(
      process.env.RESOURCE_HEADER_STAGGER_MS || '100'
    ),
    // Initial Y translation for entrance (px)
    entranceTranslateYPx: parseInt(
      process.env.RESOURCE_HEADER_ENTRANCE_Y || '12'
    ),
    // Entrance easing function
    entranceEasing:
      process.env.RESOURCE_HEADER_EASING || 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    // Magnetic button strength (0-1)
    magneticStrength: parseFloat(
      process.env.RESOURCE_HEADER_MAGNETIC_STRENGTH || '0.4'
    ),
    // Maximum magnetic pull distance (px)
    magneticMaxDistancePx: parseInt(
      process.env.RESOURCE_HEADER_MAGNETIC_DISTANCE || '8'
    ),
    // Magnetic button return duration (ms)
    magneticReturnDurationMs: parseInt(
      process.env.RESOURCE_HEADER_MAGNETIC_RETURN_MS || '300'
    ),
    // Button hover lift (px)
    buttonHoverLiftPx: parseInt(process.env.RESOURCE_HEADER_BUTTON_LIFT || '2'),
    // Button press scale
    buttonPressScale: parseFloat(
      process.env.RESOURCE_HEADER_BUTTON_PRESS_SCALE || '0.97'
    ),
    // Icon animation duration (ms)
    iconAnimationDurationMs: parseInt(
      process.env.RESOURCE_HEADER_ICON_DURATION_MS || '300'
    ),
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.RESOURCE_HEADER_RESPECT_REDUCED_MOTION !== 'false',
  },

  // Typing Indicator Micro-UX - Palette's delightful touch! ✨
  // Animated bouncing dots that provide visual feedback during typing
  typingIndicator: {
    // Duration to show the indicator after last keystroke (ms)
    indicatorDurationMs: parseInt(
      process.env.TYPING_INDICATOR_DURATION_MS || '800'
    ),
    // Duration of each dot's bounce animation (ms)
    bounceDurationMs: parseInt(
      process.env.TYPING_INDICATOR_BOUNCE_DURATION_MS || '600'
    ),
    // Delay between each dot's animation start (ms)
    staggerDelayMs: parseInt(process.env.TYPING_INDICATOR_STAGGER_MS || '150'),
    // Size of each indicator dot (px)
    dotSizePx: parseInt(process.env.TYPING_INDICATOR_DOT_SIZE || '6'),
    // Dot color (blue-500)
    dotColor: process.env.TYPING_INDICATOR_DOT_COLOR || 'bg-blue-500',
    // Vertical bounce distance (px)
    bounceDistancePx: parseInt(
      process.env.TYPING_INDICATOR_BOUNCE_DISTANCE || '4'
    ),
    // Enable haptic feedback on mobile devices
    hapticFeedback: process.env.TYPING_INDICATOR_HAPTIC !== 'false',
    // Haptic feedback duration (ms)
    hapticDurationMs: parseInt(
      process.env.TYPING_INDICATOR_HAPTIC_DURATION || '5'
    ),
    // Debounce time for haptic feedback (ms) - prevents excessive vibration
    hapticDebounceMs: parseInt(
      process.env.TYPING_INDICATOR_HAPTIC_DEBOUNCE || '100'
    ),
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.TYPING_INDICATOR_RESPECT_REDUCED_MOTION !== 'false',
    // Palette's micro-UX enhancement: Sound Wave Mode for voice/audio input! 🎨
    // Animated bars that visualize audio input for accessibility and delight
    soundwave: {
      // Number of bars in the sound wave visualization
      barCount: parseInt(process.env.TYPING_SOUNDWAVE_BAR_COUNT || '5'),
      // Width of each bar (px)
      barWidthPx: parseInt(process.env.TYPING_SOUNDWAVE_BAR_WIDTH || '3'),
      // Height of the sound wave container (px)
      heightPx: parseInt(process.env.TYPING_SOUNDWAVE_HEIGHT || '16'),
      // Gap between bars (px)
      gapPx: parseInt(process.env.TYPING_SOUNDWAVE_GAP || '2'),
      // Animation duration for one complete pulse cycle (seconds)
      durationSec: parseFloat(process.env.TYPING_SOUNDWAVE_DURATION || '0.8'),
      // Delay between each bar's animation (ms)
      staggerDelayMs: parseInt(process.env.TYPING_SOUNDWAVE_STAGGER_MS || '80'),
      // CSS-compatible stagger delay (seconds)
      staggerDelaySec: parseFloat(
        process.env.TYPING_SOUNDWAVE_STAGGER_SEC || '0.08'
      ),
      // Minimum scale for bar animation (0-1)
      minScale: parseFloat(process.env.TYPING_SOUNDWAVE_MIN_SCALE || '0.4'),
      // Maximum scale for bar animation
      maxScale: parseFloat(process.env.TYPING_SOUNDWAVE_MAX_SCALE || '1.0'),
      // Minimum opacity for bar animation (0-1)
      minOpacity: parseFloat(process.env.TYPING_SOUNDWAVE_MIN_OPACITY || '0.5'),
      // Maximum opacity for bar animation (0-1)
      maxOpacity: parseFloat(process.env.TYPING_SOUNDWAVE_MAX_OPACITY || '1.0'),
      // Glow effect blur radius (px)
      glowBlurPx: parseInt(process.env.TYPING_SOUNDWAVE_GLOW_BLUR || '6'),
      // Glow effect opacity (0-1)
      glowOpacity: parseFloat(
        process.env.TYPING_SOUNDWAVE_GLOW_OPACITY || '0.4'
      ),
      // Reduced motion: static scale value
      reducedMotionScale: parseFloat(
        process.env.TYPING_SOUNDWAVE_REDUCED_SCALE || '0.7'
      ),
      // Reduced motion: static opacity value
      reducedMotionOpacity: parseFloat(
        process.env.TYPING_SOUNDWAVE_REDUCED_OPACITY || '0.8'
      ),
    },
  },

  // 3D Card Tilt Micro-UX - Palette's premium delight! 🎨
  // Adds subtle 3D parallax tilt effect based on mouse position
  card3dTilt: {
    // Maximum rotation on X axis (degrees) - tilting up/down
    maxTiltXPx: parseFloat(process.env.CARD_3D_TILT_X || '3'),
    // Maximum rotation on Y axis (degrees) - tilting left/right
    maxTiltYPx: parseFloat(process.env.CARD_3D_TILT_Y || '5'),
    // CSS perspective value for 3D effect (px) - lower = more dramatic
    perspectivePx: parseInt(process.env.CARD_3D_PERSPECTIVE || '1000'),
    // Vertical lift when hovering (px)
    hoverLiftPx: parseInt(process.env.CARD_3D_HOVER_LIFT || '8'),
    // Scale factor when hovering
    hoverScale: parseFloat(process.env.CARD_3D_HOVER_SCALE || '1.02'),
    // Duration to reset tilt when mouse leaves (seconds)
    resetDurationSec: parseFloat(process.env.CARD_3D_RESET_DURATION || '0.4'),
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.CARD_3D_RESPECT_REDUCED_MOTION !== 'false',
  },

  // Popular Searches Micro-UX - Palette's delightful enhancement! ✨
  // Staggered entrance animations and satisfying interactions for search suggestions
  popularSearches: {
    // Delay between each item's entrance animation (ms)
    staggerDelayMs: parseInt(process.env.POPULAR_SEARCHES_STAGGER_MS || '50'),
    // Duration of entrance animation (ms)
    entranceDurationMs: parseInt(
      process.env.POPULAR_SEARCHES_ENTRANCE_DURATION_MS || '500'
    ),
    // CSS duration string for v-bind
    entranceDurationSec: `${parseInt(process.env.POPULAR_SEARCHES_ENTRANCE_DURATION_MS || '500') / 1000}s`,
    // Duration of hover lift transition (ms)
    hoverTransitionMs: parseInt(
      process.env.POPULAR_SEARCHES_HOVER_TRANSITION_MS || '300'
    ),
    // Vertical lift amount on hover (px)
    hoverLiftPx: parseInt(process.env.POPULAR_SEARCHES_HOVER_LIFT || '2'),
    // Scale factor when clicked
    clickScale: parseFloat(process.env.POPULAR_SEARCHES_CLICK_SCALE || '0.98'),
    // Duration of click feedback (ms)
    clickDurationMs: parseInt(
      process.env.POPULAR_SEARCHES_CLICK_DURATION_MS || '150'
    ),
    // Ripple animation duration (ms)
    rippleDurationMs: parseInt(
      process.env.POPULAR_SEARCHES_RIPPLE_DURATION_MS || '600'
    ),
    // Trending indicator pulse duration (seconds)
    trendingPulseDurationSec: parseFloat(
      process.env.POPULAR_SEARCHES_TRENDING_PULSE || '2'
    ),
    // Arrow slide animation duration (ms)
    arrowSlideDurationMs: parseInt(
      process.env.POPULAR_SEARCHES_ARROW_SLIDE_MS || '300'
    ),
    // Count badge transition duration (ms)
    badgeTransitionMs: parseInt(
      process.env.POPULAR_SEARCHES_BADGE_TRANSITION_MS || '300'
    ),
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.POPULAR_SEARCHES_REDUCED_MOTION !== 'false',
  },

  // Related Searches Animations - Palette's micro-UX delight! ✨
  // Used by RelatedSearches component for delightful button interactions
  relatedSearches: {
    // Delay between each button's entrance animation (ms)
    staggerDelayMs: parseInt(process.env.RELATED_SEARCHES_STAGGER_MS || '60'),
    // Container entrance animation duration (seconds)
    containerEntranceSec: `${parseInt(process.env.RELATED_SEARCHES_CONTAINER_ENTRANCE_MS || '300') / 1000}s`,
    // Button entrance animation duration (seconds)
    buttonEntranceSec: `${parseInt(process.env.RELATED_SEARCHES_BUTTON_ENTRANCE_MS || '400') / 1000}s`,
    // Icon bounce animation duration (seconds)
    iconBounceSec: `${parseInt(process.env.RELATED_SEARCHES_ICON_BOUNCE_MS || '2000') / 1000}s`,
  },

  // Magnetic Button Effect - Palette's premium micro-UX delight! 🧲
  // Creates a subtle "magnetic" pull that draws buttons toward the cursor
  magneticButton: {
    // Strength of the magnetic pull (0-1, where 1 is strongest)
    strength: parseFloat(process.env.MAGNETIC_BUTTON_STRENGTH || '0.4'),
    // Maximum distance the button can move (pixels)
    maxDistancePx: parseInt(process.env.MAGNETIC_BUTTON_MAX_DISTANCE || '12'),
    // Duration of the return animation when mouse leaves (ms)
    returnDurationMs: parseInt(process.env.MAGNETIC_BUTTON_RETURN_MS || '400'),
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.MAGNETIC_BUTTON_RESPECT_REDUCED_MOTION !== 'false',
  },

  // Press and Hold Interaction - Palette's protective micro-UX enhancement! ⏱️
  // Prevents accidental destructive actions by requiring intentional long-press
  pressAndHold: {
    // Duration user must hold to trigger action (ms)
    durationMs: parseInt(process.env.PRESS_AND_HOLD_DURATION_MS || '800'),
    // CSS duration string for v-bind
    durationSec: `${parseInt(process.env.PRESS_AND_HOLD_DURATION_MS || '800') / 1000}s`,
    // Size of the progress ring (px)
    ringSize: parseInt(process.env.PRESS_AND_HOLD_RING_SIZE || '24'),
    // Stroke width of the progress ring (px)
    strokeWidth: parseInt(process.env.PRESS_AND_HOLD_STROKE_WIDTH || '3'),
    // Scale when button is being pressed
    pressScale: parseFloat(process.env.PRESS_AND_HOLD_PRESS_SCALE || '0.95'),
    // Color of the progress ring
    ringColor: process.env.PRESS_AND_HOLD_RING_COLOR || '#ef4444',
    // Background color of the progress ring
    ringBgColor:
      process.env.PRESS_AND_HOLD_RING_BG_COLOR || 'rgba(239, 68, 68, 0.2)',
    // Whether to show progress text
    showProgressText: process.env.PRESS_AND_HOLD_SHOW_PROGRESS !== 'false',
    // Whether to respect reduced motion preference
    respectReducedMotion: process.env.PRESS_AND_HOLD_REDUCED_MOTION !== 'false',
  },

  // Breadcrumbs Micro-UX - Palette's navigational delight! 🧭
  // Adds satisfying slide-in underline and pulsing indicator for better navigation feedback
  breadcrumbs: {
    // Duration of the underline slide-in animation (ms)
    underlineDurationMs: parseInt(
      process.env.BREADCRUMBS_UNDERLINE_DURATION_MS || '250'
    ),
    // CSS duration string for v-bind
    underlineDurationSec: `${parseInt(process.env.BREADCRUMBS_UNDERLINE_DURATION_MS || '250') / 1000}s`,
    // Duration of the current page indicator pulse (ms)
    pulseDurationMs: parseInt(
      process.env.BREADCRUMBS_PULSE_DURATION_MS || '2000'
    ),
    // CSS duration string for v-bind
    pulseDurationSec: `${parseInt(process.env.BREADCRUMBS_PULSE_DURATION_MS || '2000') / 1000}s`,
    // Scale factor for the pulse dot
    pulseScale: parseFloat(process.env.BREADCRUMBS_PULSE_SCALE || '1.2'),
    // Whether to respect reduced motion preference
    respectReducedMotion: process.env.BREADCRUMBS_REDUCED_MOTION !== 'false',
  },

  // Status Manager Component - Flexy hates hardcoded values!
  statusManager: {
    // Status badge pulse animation
    badgePulseDurationSec: parseFloat(
      process.env.STATUS_BADGE_PULSE_DURATION_SEC || '2'
    ),
    // Status change pulse animation
    changePulseDurationSec: parseFloat(
      process.env.STATUS_CHANGE_PULSE_DURATION_SEC || '1.5'
    ),
    // Button spin animation
    buttonSpinDurationSec: parseFloat(
      process.env.STATUS_BUTTON_SPIN_DURATION_SEC || '1'
    ),
    // Ready pulse animation
    readyPulseDurationSec: parseFloat(
      process.env.STATUS_READY_PULSE_DURATION_SEC || '2'
    ),
    // Success bounce animation
    successBounceDurationSec: parseFloat(
      process.env.STATUS_SUCCESS_BOUNCE_DURATION_SEC || '0.5'
    ),
    // Ripple out animation
    rippleOutDurationSec: parseFloat(
      process.env.STATUS_RIPPLE_OUT_DURATION_SEC || '0.6'
    ),
    // Transition duration
    transitionDurationSec: `${parseInt(process.env.STATUS_TRANSITION_DURATION_MS || '200') / 1000}s`,
    // Timing values - Flexy hates hardcoded timeouts!
    messageDismissDelayMs: parseInt(
      process.env.STATUS_MESSAGE_DISMISS_DELAY_MS || '4000'
    ),
    announcementTimeoutMs: parseInt(
      process.env.STATUS_ANNOUNCEMENT_TIMEOUT_MS || '1000'
    ),
    successResetDelayMs: parseInt(
      process.env.STATUS_SUCCESS_RESET_DELAY_MS || '2000'
    ),
    // Status badge colors - Flexy hates hardcoded hex codes!
    colors: {
      active: {
        bg: process.env.STATUS_ACTIVE_BG || '#d1fae5',
        text: process.env.STATUS_ACTIVE_TEXT || '#065f46',
        dot: process.env.STATUS_ACTIVE_DOT || '#10b981',
      },
      deprecated: {
        bg: process.env.STATUS_DEPRECATED_BG || '#fef3c7',
        text: process.env.STATUS_DEPRECATED_TEXT || '#92400e',
        dot: process.env.STATUS_DEPRECATED_DOT || '#f59e0b',
      },
      discontinued: {
        bg: process.env.STATUS_DISCONTINUED_BG || '#fee2e2',
        text: process.env.STATUS_DISCONTINUED_TEXT || '#991b1b',
        dot: process.env.STATUS_DISCONTINUED_DOT || '#ef4444',
      },
      updated: {
        bg: process.env.STATUS_UPDATED_BG || '#dbeafe',
        text: process.env.STATUS_UPDATED_TEXT || '#1e40af',
        dot: process.env.STATUS_UPDATED_DOT || '#3b82f6',
      },
      pending: {
        bg: process.env.STATUS_PENDING_BG || '#f3e8ff',
        text: process.env.STATUS_PENDING_TEXT || '#6b21a8',
        dot: process.env.STATUS_PENDING_DOT || '#a855f7',
      },
    },
    // Focus and border colors
    focusColor: process.env.STATUS_FOCUS_COLOR || '#3b82f6',
    changeBorderColor: process.env.STATUS_CHANGE_BORDER_COLOR || '#f59e0b',
    changeBgColor: process.env.STATUS_CHANGE_BG_COLOR || '#fffbeb',
  },

  // Resource Status Component - Palette's micro-UX delight! 🎨
  // Adds delightful animations and celebrations for resource status badges
  resourceStatus: {
    // Pulse animation duration for updated/pending status (seconds)
    pulseDurationSec: parseFloat(
      process.env.RESOURCE_STATUS_PULSE_DURATION_SEC || '2'
    ),
    // Celebration animation duration when health is excellent (ms)
    celebrationDurationMs: parseInt(
      process.env.RESOURCE_STATUS_CELEBRATION_DURATION_MS || '800'
    ),
    // CSS duration string for v-bind
    celebrationDurationSec: `${parseInt(process.env.RESOURCE_STATUS_CELEBRATION_DURATION_MS || '800') / 1000}s`,
    // Health ring pulse duration (seconds)
    healthRingDurationSec: parseFloat(
      process.env.RESOURCE_STATUS_HEALTH_RING_SEC || '1.5'
    ),
    // Glow pulse duration for excellent health (seconds) - Palette's micro-UX enhancement!
    glowPulseDurationSec: parseFloat(
      process.env.RESOURCE_STATUS_GLOW_PULSE_SEC || '2.0'
    ),
    // Celebration easing function
    celebrationEasing:
      process.env.RESOURCE_STATUS_CELEBRATION_EASING ||
      EASING_CONSTANTS.SPRING_STANDARD,
    // Scale factor for celebration animation
    celebrationScale: parseFloat(
      process.env.RESOURCE_STATUS_CELEBRATION_SCALE || '1.15'
    ),
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.RESOURCE_STATUS_RESPECT_REDUCED_MOTION !== 'false',
  },

  // PWA Install Prompt Component - Flexy hates hardcoded values!
  pwaInstallPrompt: {
    // Success toast animation
    successPopDurationSec: parseFloat(
      process.env.PWA_SUCCESS_POP_DURATION_SEC || '0.5'
    ),
    // Check pop animation
    checkPopDurationSec: parseFloat(
      process.env.PWA_CHECK_POP_DURATION_SEC || '0.4'
    ),
    checkPopDelaySec: parseFloat(process.env.PWA_CHECK_POP_DELAY_SEC || '0.2'),
    // Check draw animation
    checkDrawDurationSec: parseFloat(
      process.env.PWA_CHECK_DRAW_DURATION_SEC || '0.3'
    ),
    checkDrawDelaySec: parseFloat(
      process.env.PWA_CHECK_DRAW_DELAY_SEC || '0.4'
    ),
    // Icon pulse animation
    iconPulseDurationSec: parseFloat(
      process.env.PWA_ICON_PULSE_DURATION_SEC || '2'
    ),
    iconPulseDelaySec: parseFloat(
      process.env.PWA_ICON_PULSE_DELAY_SEC || '0.5'
    ),
    // Auto dismiss interval
    autoDismissIntervalMs: parseInt(
      process.env.PWA_AUTO_DISMISS_INTERVAL_MS || '50'
    ),
    // Success toast dismiss delay (default: 4 seconds)
    successDismissDelayMs: parseInt(
      process.env.PWA_SUCCESS_DISMISS_DELAY_MS || '4000'
    ),
    // Easing function
    easing: process.env.PWA_INSTALL_EASING || EASING_REF.SPRING_SNAPPY,
  },

  // Webhook Manager Component - Flexy hates hardcoded values!
  webhookManager: {
    // Float animation duration
    floatDurationSec: parseFloat(process.env.WEBHOOK_FLOAT_DURATION_SEC || '3'),
    floatDelaySec: parseFloat(process.env.WEBHOOK_FLOAT_DELAY_SEC || '1.5'),
    // Pulse animations
    pulseSlowDurationSec: parseFloat(
      process.env.WEBHOOK_PULSE_SLOW_DURATION_SEC || '4'
    ),
    bounceDurationSec: parseFloat(
      process.env.WEBHOOK_BOUNCE_DURATION_SEC || '2'
    ),
    // Draw animation
    drawDurationSec: parseFloat(process.env.WEBHOOK_DRAW_DURATION_SEC || '1.5'),
    // Transition duration
    transitionDurationSec: `${parseInt(process.env.WEBHOOK_TRANSITION_DURATION_MS || '150') / 1000}s`,
    transitionDurationMs: parseInt(
      process.env.WEBHOOK_TRANSITION_DURATION_MS || '150'
    ),
    // Colors
    colors: {
      gradientStart: process.env.WEBHOOK_GRADIENT_START || '#f3f4f6',
      gradientEnd: process.env.WEBHOOK_GRADIENT_END || '#e5e7eb',
      iconColor: process.env.WEBHOOK_ICON_COLOR || '#111827',
      deleteBg: process.env.WEBHOOK_DELETE_BG || '#dc2626',
      deleteStroke: process.env.WEBHOOK_DELETE_STROKE || '#ef4444',
      glowColor: process.env.WEBHOOK_GLOW_COLOR || 'rgba(59, 130, 246, 0.25)',
      pulseColor: process.env.WEBHOOK_PULSE_COLOR || 'rgba(239, 68, 68, 0.2)',
    },
    // Dimensions - Flexy hates hardcoded pixel values!
    dimensions: {
      // Empty state illustration container
      illustrationWidth: process.env.WEBHOOK_ILLUSTRATION_WIDTH || '120px',
      illustrationHeight: process.env.WEBHOOK_ILLUSTRATION_HEIGHT || '120px',
      // Icon size inside illustration
      iconWidth: process.env.WEBHOOK_ICON_WIDTH || '48px',
      iconHeight: process.env.WEBHOOK_ICON_HEIGHT || '48px',
      // Floating dot sizes
      dotLargeSize: process.env.WEBHOOK_DOT_LARGE_SIZE || '8px',
      dotSmallSize: process.env.WEBHOOK_DOT_SMALL_SIZE || '6px',
      // Text container
      descriptionMaxWidth: process.env.WEBHOOK_DESC_MAX_WIDTH || '280px',
      // Button
      buttonMinWidth: process.env.WEBHOOK_BUTTON_MIN_WIDTH || '70px',
      // Container
      containerMaxWidth: process.env.WEBHOOK_CONTAINER_MAX_WIDTH || '800px',
    },
    // Palette's micro-UX enhancement: Success celebration configuration
    celebrationDurationMs: parseInt(
      process.env.WEBHOOK_CELEBRATION_DURATION_MS || '2000'
    ),
    celebrationPosition: {
      top: process.env.WEBHOOK_CELEBRATION_TOP || '20px',
      right: process.env.WEBHOOK_CELEBRATION_RIGHT || '20px',
    },
    celebrationGap: process.env.WEBHOOK_CELEBRATION_GAP || '12px',
    celebrationPadding: process.env.WEBHOOK_CELEBRATION_PADDING || '12px 20px',
    celebrationBorderRadius: process.env.WEBHOOK_CELEBRATION_RADIUS || '12px',
    celebrationIconSize: process.env.WEBHOOK_CELEBRATION_ICON_SIZE || '28px',
    celebrationFontSize: process.env.WEBHOOK_CELEBRATION_FONT_SIZE || '14px',
    // Animation timing for sparkles and effects
    sparkleStaggerDelaySec: parseFloat(
      process.env.WEBHOOK_SPARKLE_STAGGER_SEC || '0.05'
    ),
    // Stroke transition duration for SVG animations (ms)
    strokeTransitionMs: parseInt(
      process.env.WEBHOOK_STROKE_TRANSITION_MS || '300'
    ),
    // Reduced motion opacity transition (seconds)
    reducedMotionOpacitySec: `${parseInt(process.env.WEBHOOK_REDUCED_MOTION_OPACITY_MS || '300') / 1000}s`,
  },

  // Zero Result Searches Component - Flexy hates hardcoded values!
  zeroResultSearches: {
    // Stagger entrance animation
    staggerDurationSec: parseFloat(
      process.env.ZERO_RESULT_STAGGER_DURATION_SEC || '0.4'
    ),
    staggerDelayMs: parseInt(process.env.ZERO_RESULT_STAGGER_DELAY_MS || '50'),
    // Ripple animation
    rippleDurationSec: parseFloat(
      process.env.ZERO_RESULT_RIPPLE_DURATION_SEC || '0.6'
    ),
    // Subtle pulse animation
    subtlePulseDurationSec: parseFloat(
      process.env.ZERO_RESULT_PULSE_DURATION_SEC || '2'
    ),
    // Transition duration
    transitionDurationSec: `${parseInt(process.env.ZERO_RESULT_TRANSITION_DURATION_MS || '100') / 1000}s`,
    // SVG Draw animation for empty state icon - Palette's delightful enhancement!
    drawDurationSec: parseFloat(
      process.env.ZERO_RESULT_DRAW_DURATION_SEC || '1.2'
    ),
    drawDelaySec: parseFloat(process.env.ZERO_RESULT_DRAW_DELAY_SEC || '0.2'),
    // Fade-in delayed animation duration (seconds) - Flexy hates hardcoded 0.3s!
    fadeInDurationSec: parseFloat(
      process.env.ZERO_RESULT_FADE_IN_DURATION_SEC || '0.3'
    ),
    drawEasing:
      process.env.ZERO_RESULT_DRAW_EASING ||
      'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    // Floating elements animation - adds visual delight to empty state!
    floatDurationSec: parseFloat(
      process.env.ZERO_RESULT_FLOAT_DURATION_SEC || '3'
    ),
    floatDelaySec: parseFloat(process.env.ZERO_RESULT_FLOAT_DELAY_SEC || '0.5'),
    floatDistance: process.env.ZERO_RESULT_FLOAT_DISTANCE || '8px',
    // Spring physics for hover effects - satisfying tactile feedback!
    springEasing:
      process.env.ZERO_RESULT_SPRING_EASING ||
      'cubic-bezier(0.34, 1.56, 0.64, 1)',
    springDurationSec: parseFloat(
      process.env.ZERO_RESULT_SPRING_DURATION_SEC || '0.4'
    ),
  },

  // Convenience easing reference for component use - uses standard ease-out
  easeOutQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',

  // Animation Frame Rate - Flexy hates hardcoded 16ms!
  // Standard 60fps refresh interval for smooth animations
  frameRate: {
    fps60: parseInt(process.env.ANIMATION_FPS60_MS || '16'),
    fps30: parseInt(process.env.ANIMATION_FPS30_MS || '33'),
  },

  // UI Micro-Interactions - Flexy hates hardcoded small timeouts!
  microInteractions: {
    // Quick reset delay for visual feedback (ms)
    resetDelayMs: parseInt(process.env.MICRO_RESET_DELAY_MS || '150'),
    // Completion reset delay (ms)
    completionResetMs: parseInt(process.env.MICRO_COMPLETION_RESET_MS || '300'),
    // Quick feedback delay (ms)
    quickFeedbackMs: parseInt(process.env.MICRO_QUICK_FEEDBACK_MS || '50'),
    // Screen reader announcement delay (ms)
    announcementDelayMs: parseInt(
      process.env.MICRO_ANNOUNCEMENT_DELAY_MS || '1000'
    ),
    // Shake animation duration (ms)
    shakeDurationMs: parseInt(process.env.MICRO_SHAKE_DURATION_MS || '500'),
    // Confetti trigger delay (ms)
    confettiDelayMs: parseInt(process.env.MICRO_CONFETTI_DELAY_MS || '800'),
    // Draft indicator delay (ms)
    draftIndicatorDelayMs: parseInt(
      process.env.MICRO_DRAFT_INDICATOR_MS || '50'
    ),
    // Saved indicator timeout (ms)
    savedIndicatorTimeoutMs: parseInt(
      process.env.MICRO_SAVED_INDICATOR_MS || '2000'
    ),
    // Draft pulse timeout (ms)
    draftPulseTimeoutMs: parseInt(process.env.MICRO_DRAFT_PULSE_MS || '500'),
    // Feedback duration for micro-interactions (ms)
    feedbackDurationMs: parseInt(
      process.env.MICRO_FEEDBACK_DURATION_MS || '300'
    ),
    // Glow animation duration (ms)
    glowDurationMs: parseInt(process.env.MICRO_GLOW_DURATION_MS || '400'),
    // Category selection animation duration (ms) - Palette's micro-UX enhancement!
    categorySelectDurationMs: parseInt(
      process.env.MICRO_CATEGORY_SELECT_MS || '300'
    ),
    // Skill level selection animation duration (ms) - Palette's micro-UX enhancement!
    skillSelectDurationMs: parseInt(process.env.MICRO_SKILL_SELECT_MS || '250'),
    // Click feedback animation duration (ms) - Palette's micro-UX delight!
    clickFeedbackDurationMs: parseInt(
      process.env.MICRO_CLICK_FEEDBACK_MS || '300'
    ),
    // Click feedback shrink scale - how much element shrinks when clicked
    clickShrinkScale: parseFloat(
      process.env.MICRO_CLICK_SHRINK_SCALE || '0.97'
    ),
    // Press animation duration for tactile feedback (ms) - BugFixer's bug fix!
    pressDurationMs: parseInt(process.env.MICRO_PRESS_DURATION_MS || '100'),
  },

  // User Preference Settings - Palette's micro-UX enhancement!
  userPreference: {
    // Save success animation duration (ms)
    saveSuccessDurationMs: parseInt(
      process.env.USER_PREF_SAVE_SUCCESS_MS || '1500'
    ),
  },

  // Gradient Colors - Flexy hates hardcoded hex codes!
  gradients: {
    emerald: {
      start: process.env.GRADIENT_EMERALD_START || '#10b981',
      end: process.env.GRADIENT_EMERALD_END || '#059669',
      mid: process.env.GRADIENT_EMERALD_MID || '#0d9488',
    },
    blue: {
      start: process.env.GRADIENT_BLUE_START || '#3b82f6',
      end: process.env.GRADIENT_BLUE_END || '#2563eb',
    },
    purple: {
      start: process.env.GRADIENT_PURPLE_START || '#8b5cf6',
      end: process.env.GRADIENT_PURPLE_END || '#7c3aed',
    },
  },

  // Shadow Colors - Flexy hates hardcoded rgba values!
  shadows: {
    light: {
      sm: process.env.SHADOW_LIGHT_SM || 'rgba(0, 0, 0, 0.05)',
      md: process.env.SHADOW_LIGHT_MD || 'rgba(0, 0, 0, 0.1)',
      lg: process.env.SHADOW_LIGHT_LG || 'rgba(0, 0, 0, 0.15)',
      xl: process.env.SHADOW_LIGHT_XL || 'rgba(0, 0, 0, 0.2)',
    },
    dark: {
      sm: process.env.SHADOW_DARK_SM || 'rgba(0, 0, 0, 0.2)',
      md: process.env.SHADOW_DARK_MD || 'rgba(0, 0, 0, 0.4)',
      lg: process.env.SHADOW_DARK_LG || 'rgba(0, 0, 0, 0.5)',
    },
    inset: {
      light: process.env.SHADOW_INSET_LIGHT || 'rgba(255, 255, 255, 0.1)',
    },
  },

  // Opacity Values - Flexy hates hardcoded opacity!
  opacity: {
    none: parseFloat(process.env.OPACITY_NONE || '0'),
    subtle: parseFloat(process.env.OPACITY_SUBTLE || '0.1'),
    light: parseFloat(process.env.OPACITY_LIGHT || '0.2'),
    medium: parseFloat(process.env.OPACITY_MEDIUM || '0.4'),
    semi: parseFloat(process.env.OPACITY_SEMI || '0.5'),
    strong: parseFloat(process.env.OPACITY_STRONG || '0.6'),
    heavy: parseFloat(process.env.OPACITY_HEAVY || '0.8'),
    full: parseFloat(process.env.OPACITY_FULL || '1'),
  },

  // Border Radius Values - Flexy hates hardcoded pixel values!
  borderRadius: {
    xs: parseInt(process.env.BORDER_RADIUS_XS || '1'),
    sm: parseInt(process.env.BORDER_RADIUS_SM || '2'),
    md: parseInt(process.env.BORDER_RADIUS_MD || '4'),
    lg: parseInt(process.env.BORDER_RADIUS_LG || '6'),
    xl: parseInt(process.env.BORDER_RADIUS_XL || '8'),
    xxl: parseInt(process.env.BORDER_RADIUS_XXL || '12'),
    full: process.env.BORDER_RADIUS_FULL || '9999px',
  },

  // Pixel Values - Flexy hates magic numbers!
  pixels: {
    arrowSize: parseInt(process.env.PIXEL_ARROW_SIZE || '8'),
    checkmarkSize: parseInt(process.env.PIXEL_CHECKMARK_SIZE || '16'),
    tooltipGap: parseInt(process.env.PIXEL_TOOLTIP_GAP || '6'),
    arrowOffset: parseInt(process.env.PIXEL_ARROW_OFFSET || '4'),
    // Resource share section margin (px)
    shareSectionMargin: parseInt(
      process.env.PIXEL_SHARE_SECTION_MARGIN || '32'
    ),
    // Share button padding (px)
    shareButtonPadding: parseInt(process.env.PIXEL_SHARE_BUTTON_PADDING || '8'),
    // Ripple effect size (px)
    rippleSize: parseInt(process.env.PIXEL_RIPPLE_SIZE || '100'),
  },

  // SVG Stroke Animation Values - Flexy hates hardcoded stroke-dasharray!
  // Used for animated checkmarks, loaders, and progress indicators
  svgStroke: {
    // Small checkmark (20px path)
    smallCheckmark: {
      dashArray: parseInt(process.env.SVG_STROKE_SMALL_DASH || '20'),
      dashOffset: parseInt(process.env.SVG_STROKE_SMALL_OFFSET || '20'),
    },
    // Medium checkmark (24px path)
    mediumCheckmark: {
      dashArray: parseInt(process.env.SVG_STROKE_MEDIUM_DASH || '24'),
      dashOffset: parseInt(process.env.SVG_STROKE_MEDIUM_OFFSET || '24'),
    },
    // Large circle/progress (100px circumference)
    largeCircle: {
      dashArray: parseInt(process.env.SVG_STROKE_LARGE_DASH || '100'),
      dashOffset: parseInt(process.env.SVG_STROKE_LARGE_OFFSET || '100'),
    },
    // Animation duration for stroke draw effect (ms)
    drawDurationMs: parseInt(process.env.SVG_STROKE_DRAW_DURATION_MS || '300'),
    // CSS duration string for v-bind
    drawDurationSec: `${parseInt(process.env.SVG_STROKE_DRAW_DURATION_MS || '300') / 1000}s`,
    // Animation easing for stroke draw
    drawEasing: process.env.SVG_STROKE_DRAW_EASING || 'ease-out',
  },

  // Viewed Badge Micro-UX - Palette's delightful enhancement!
  // Celebrates when a user views a resource with satisfying entrance animation
  viewedBadge: {
    // Duration of the entrance pop animation (ms)
    popDurationMs: parseInt(process.env.VIEWED_BADGE_POP_DURATION_MS || '400'),
    // CSS duration string for v-bind
    popDurationSec: `${parseInt(process.env.VIEWED_BADGE_POP_DURATION_MS || '400') / 1000}s`,
    // Duration of the icon bounce animation (ms)
    bounceDurationMs: parseInt(
      process.env.VIEWED_BADGE_BOUNCE_DURATION_MS || '500'
    ),
    // CSS duration string for v-bind
    bounceDurationSec: `${parseInt(process.env.VIEWED_BADGE_BOUNCE_DURATION_MS || '500') / 1000}s`,
    // Duration of the glow pulse animation (ms)
    glowDurationMs: parseInt(
      process.env.VIEWED_BADGE_GLOW_DURATION_MS || '800'
    ),
    // CSS duration string for v-bind
    glowDurationSec: `${parseInt(process.env.VIEWED_BADGE_GLOW_DURATION_MS || '800') / 1000}s`,
    // Total animation duration including all effects (ms)
    animationDurationMs: parseInt(
      process.env.VIEWED_BADGE_ANIMATION_DURATION_MS || '600'
    ),
    // Scale factor at peak of bounce animation
    peakScale: parseFloat(process.env.VIEWED_BADGE_PEAK_SCALE || '1.1'),
    // Scale factor for icon at peak bounce
    iconPeakScale: parseFloat(
      process.env.VIEWED_BADGE_ICON_PEAK_SCALE || '1.3'
    ),
    // Rotation angle for icon entrance (degrees)
    iconRotationDegrees: parseInt(
      process.env.VIEWED_BADGE_ICON_ROTATION || '45'
    ),
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.VIEWED_BADGE_RESPECT_REDUCED_MOTION !== 'false',
  },

  // Comparison Value Animations - Palette's micro-UX enhancement!
  // Delightful copy-to-clipboard interactions with visual feedback
  comparisonValue: {
    // Duration for copy feedback state (ms)
    copyFeedbackDurationMs: parseInt(
      process.env.COMPARISON_VALUE_COPY_FEEDBACK_MS || '2000'
    ),
    // Copy success animation duration (ms)
    copySuccessAnimationMs: parseInt(
      process.env.COMPARISON_VALUE_COPY_SUCCESS_MS || '400'
    ),
    // Boolean value pop animation duration (ms)
    booleanPopDurationMs: parseInt(
      process.env.COMPARISON_VALUE_BOOL_POP_MS || '300'
    ),
  },

  // Comments Section Animations - Palette's micro-UX delight!
  // Provides smooth scroll and highlight effects for newly posted comments
  comments: {
    // Duration for comment highlight animation (seconds)
    highlightDurationSec: `${parseInt(process.env.COMMENT_HIGHLIGHT_DURATION_MS || '2000') / 1000}s`,
    // Delay before scrolling to new comment (ms) - allows DOM to update
    scrollDelayMs: parseInt(process.env.COMMENT_SCROLL_DELAY_MS || '100'),
    // Scroll behavior: 'smooth' or 'auto'
    scrollBehavior: process.env.COMMENT_SCROLL_BEHAVIOR || 'smooth',
    // Highlight color RGB values (yellow-400)
    highlightColor: process.env.COMMENT_HIGHLIGHT_COLOR || '250, 204, 21',
    // Maximum highlight opacity (0-1)
    highlightOpacity: parseFloat(
      process.env.COMMENT_HIGHLIGHT_OPACITY || '0.2'
    ),
    // Particle burst animation for like button - Palette's delightful touch!
    particleBurst: {
      // Number of particles in the burst
      particleCount: parseInt(process.env.COMMENT_PARTICLE_COUNT || '6'),
      // Angle increment per particle in degrees (360 / particleCount)
      angleIncrementDeg: parseInt(
        process.env.COMMENT_PARTICLE_ANGLE_INCREMENT || '60'
      ),
      // Stagger delay between particles (ms)
      staggerDelayMs: parseInt(process.env.COMMENT_PARTICLE_STAGGER_MS || '50'),
      // Animation duration (seconds)
      durationSec: parseFloat(
        process.env.COMMENT_PARTICLE_DURATION_SEC || '0.6'
      ),
      // Spread distance (px)
      spreadPx: parseInt(process.env.COMMENT_PARTICLE_SPREAD_PX || '40'),
      // Particle colors (pink/red theme for likes)
      colors: [
        process.env.COMMENT_PARTICLE_COLOR_1 || '#ec4899', // pink-500
        process.env.COMMENT_PARTICLE_COLOR_2 || '#f472b6', // pink-400
        process.env.COMMENT_PARTICLE_COLOR_3 || '#f43f5e', // rose-500
        process.env.COMMENT_PARTICLE_COLOR_4 || '#fb7185', // rose-400
      ],
    },
  },

  // Error Page Animations - Palette's micro-UX enhancement!
  // Subtle entrance animations and visual feedback for error states
  errorPage: {
    // Duration for content entrance animation (ms)
    entranceDurationMs: parseInt(
      process.env.ERROR_PAGE_ENTRANCE_DURATION_MS || '400'
    ),
    // Icon pulse animation duration (seconds)
    iconPulseDurationSec: parseFloat(
      process.env.ERROR_PAGE_ICON_PULSE_SEC || '2'
    ),
    // Pulse ring animation duration (seconds)
    pulseRingDurationSec: parseFloat(
      process.env.ERROR_PAGE_PULSE_RING_SEC || '1.5'
    ),
  },

  // Toast Notification Micro-UX - Palette's delightful enhancement! 🎨
  // Spring physics entrance animation for satisfying toast notifications
  toastNotification: {
    // Entrance animation duration (ms)
    entranceDurationMs: parseInt(
      process.env.TOAST_ENTRANCE_DURATION_MS || '500'
    ),
    // CSS duration string for v-bind
    entranceDurationSec: `${parseInt(process.env.TOAST_ENTRANCE_DURATION_MS || '500') / 1000}s`,
    // Exit animation duration (ms)
    exitDurationMs: parseInt(process.env.TOAST_EXIT_DURATION_MS || '300'),
    // CSS duration string for v-bind
    exitDurationSec: `${parseInt(process.env.TOAST_EXIT_DURATION_MS || '300') / 1000}s`,
    // Spring bounce scale - how much the toast "overshoots" before settling
    bounceScale: parseFloat(process.env.TOAST_BOUNCE_SCALE || '1.05'),
    // Initial scale when toast first appears (starts slightly smaller)
    initialScale: parseFloat(process.env.TOAST_INITIAL_SCALE || '0.8'),
    // Initial translation from right (px)
    initialTranslateXPx: parseInt(
      process.env.TOAST_INITIAL_TRANSLATE_X || '100'
    ),
    // Spring easing function for delightful bounce effect
    springEasing:
      process.env.TOAST_SPRING_EASING || 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    // Exit easing - smooth acceleration out
    exitEasing: process.env.TOAST_EXIT_EASING || 'cubic-bezier(0.4, 0, 0.2, 1)',
    // Stagger delay between multiple toasts (ms)
    staggerDelayMs: parseInt(process.env.TOAST_STAGGER_DELAY_MS || '100'),
    // Maximum number of toasts to show simultaneously
    maxVisibleToasts: parseInt(process.env.TOAST_MAX_VISIBLE || '5'),
    // Icon animation duration (ms) - subtle pop when toast appears
    iconPopDurationMs: parseInt(
      process.env.TOAST_ICON_POP_DURATION_MS || '300'
    ),
    // Icon pop delay after toast entrance (ms)
    iconPopDelayMs: parseInt(process.env.TOAST_ICON_POP_DELAY_MS || '150'),
    // Progress bar animation easing
    progressEasing: process.env.TOAST_PROGRESS_EASING || 'linear',
    // Whether to respect reduced motion preference
    respectReducedMotion: process.env.TOAST_RESPECT_REDUCED_MOTION !== 'false',
    // Reduced motion alternative duration (ms) - faster, simpler animation
    reducedMotionDurationMs: parseInt(
      process.env.TOAST_REDUCED_MOTION_DURATION_MS || '200'
    ),
  },

  // Scroll To Top Completion Celebration - Palette's micro-UX delight! 🎉
  // Adds a satisfying celebration animation when user reaches 100% scroll progress
  scrollToTop: {
    // Duration of the completion pulse animation (ms)
    completionPulseDurationMs: parseInt(
      process.env.SCROLL_COMPLETION_PULSE_DURATION_MS || '1200'
    ),
    // CSS duration string for v-bind
    completionPulseDurationSec: `${parseInt(process.env.SCROLL_COMPLETION_PULSE_DURATION_MS || '1200') / 1000}s`,
    // Duration of the ring expansion animation (ms)
    ringExpandDurationMs: parseInt(
      process.env.SCROLL_RING_EXPAND_DURATION_MS || '800'
    ),
    // Scale factor for the pulse ring at peak (1.8 = 180% of original)
    completionPulseScale: parseFloat(
      process.env.SCROLL_COMPLETION_PULSE_SCALE || '1.8'
    ),
    // Primary pulse color (blue-500 with opacity)
    completionPulseColor:
      process.env.SCROLL_COMPLETION_PULSE_COLOR || 'rgba(59, 130, 246, 0.5)',
    // Secondary pulse color (fading ring)
    completionPulseFadeColor:
      process.env.SCROLL_COMPLETION_PULSE_FADE_COLOR || 'rgba(59, 130, 246, 0)',
    // Delay before starting celebration after reaching 100% (ms)
    celebrationDelayMs: parseInt(
      process.env.SCROLL_CELEBRATION_DELAY_MS || '100'
    ),
    // Cooldown period before triggering celebration again (ms)
    celebrationCooldownMs: parseInt(
      process.env.SCROLL_CELEBRATION_COOLDOWN_MS || '5000'
    ),
    // Whether to show a checkmark icon during celebration
    showCheckmark: process.env.SCROLL_SHOW_CHECKMARK !== 'false',
    // Duration of checkmark draw animation (ms)
    checkmarkDrawDurationMs: parseInt(
      process.env.SCROLL_CHECKMARK_DRAW_DURATION_MS || '400'
    ),
    // Delay before checkmark appears (ms)
    checkmarkDelayMs: parseInt(process.env.SCROLL_CHECKMARK_DELAY_MS || '200'),
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.SCROLL_CELEBRATION_RESPECT_REDUCED_MOTION !== 'false',
  },

  // ScrollToTop Tooltip Styling - Flexy hates hardcoded CSS!
  // Centralized styling values for the scroll progress tooltip
  scrollToTopTooltip: {
    // Mobile positioning from bottom (rem) - Flexy hates hardcoded 5rem!
    mobileBottomRem: parseFloat(
      process.env.SCROLLTOOLTIP_MOBILE_BOTTOM_REM || '5'
    ),
    // Tooltip vertical offset from button (px)
    verticalOffsetPx: parseInt(
      process.env.SCROLLTOOLTIP_VERTICAL_OFFSET_PX || '8'
    ),
    // Tooltip padding X axis (px)
    paddingXPx: parseInt(process.env.SCROLLTOOLTIP_PADDING_X_PX || '10'),
    // Tooltip padding Y axis (px)
    paddingYPx: parseInt(process.env.SCROLLTOOLTIP_PADDING_Y_PX || '6'),
    // Tooltip border radius (px)
    borderRadiusPx: parseInt(process.env.SCROLLTOOLTIP_BORDER_RADIUS_PX || '8'),
    // Main text font size (px) - Flexy hates hardcoded 14px!
    textFontSizePx: parseInt(
      process.env.SCROLLTOOLTIP_TEXT_FONT_SIZE_PX || '14'
    ),
    // Label text font size (px) - Flexy hates hardcoded 10px!
    labelFontSizePx: parseInt(
      process.env.SCROLLTOOLTIP_LABEL_FONT_SIZE_PX || '10'
    ),
    // Label letter spacing (px) - Flexy hates hardcoded 0.5px!
    labelLetterSpacingPx: parseFloat(
      process.env.SCROLLTOOLTIP_LABEL_SPACING_PX || '0.5'
    ),
    // Label margin top (px)
    labelMarginTopPx: parseInt(
      process.env.SCROLLTOOLTIP_LABEL_MARGIN_TOP_PX || '2'
    ),
    // Tooltip arrow size (px) - border size for CSS triangle
    arrowSizePx: parseInt(process.env.SCROLLTOOLTIP_ARROW_SIZE_PX || '6'),
    // Box shadow values
    shadow: {
      x: parseInt(process.env.SCROLLTOOLTIP_SHADOW_X || '0'),
      y: parseInt(process.env.SCROLLTOOLTIP_SHADOW_Y || '4'),
      blur: parseInt(process.env.SCROLLTOOLTIP_SHADOW_BLUR || '12'),
      opacity: parseFloat(process.env.SCROLLTOOLTIP_SHADOW_OPACITY || '0.15'),
    },
  },

  // Mobile Positioning Config - Flexy hates hardcoded media query values!
  // Standardized mobile positioning values for fixed elements
  mobilePositioning: {
    // Bottom position for mobile (rem) - prevents overlap with other fixed elements
    bottomSpacingRem: parseFloat(process.env.MOBILE_BOTTOM_SPACING_REM || '5'),
    // Tablet breakpoint max-width (px)
    tabletBreakpointPx: parseInt(
      process.env.MOBILE_TABLET_BREAKPOINT_PX || '768'
    ),
    // Mobile breakpoint max-width (px)
    mobileBreakpointPx: parseInt(
      process.env.MOBILE_MOBILE_BREAKPOINT_PX || '640'
    ),
  },

  // Recommendations Section Micro-UX - Palette's delightful enhancement!
  // Staggered entrance animations and success feedback for recommendations
  recommendations: {
    // Delay between each card's entrance animation (ms)
    staggerDelayMs: parseInt(process.env.RECOMMENDATIONS_STAGGER_MS || '100'),
    // Duration of entrance animation (ms)
    entranceDurationMs: parseInt(
      process.env.RECOMMENDATIONS_ENTRANCE_DURATION_MS || '600'
    ),
    // CSS duration string for v-bind
    entranceDurationSec: `${parseInt(process.env.RECOMMENDATIONS_ENTRANCE_DURATION_MS || '600') / 1000}s`,
    // Distance cards travel during entrance (px)
    entranceDistancePx: parseInt(
      process.env.RECOMMENDATIONS_ENTRANCE_DISTANCE || '30'
    ),
    // Scale at start of entrance animation
    entranceStartScale: parseFloat(
      process.env.RECOMMENDATIONS_ENTRANCE_SCALE || '0.92'
    ),
    // Loading shimmer animation duration (seconds)
    shimmerDurationSec: parseFloat(
      process.env.RECOMMENDATIONS_SHIMMER_DURATION || '1.5'
    ),
    // Success celebration animation duration (ms)
    successDurationMs: parseInt(
      process.env.RECOMMENDATIONS_SUCCESS_DURATION_MS || '800'
    ),
    // Delay before triggering haptic feedback on load (ms)
    hapticDelayMs: parseInt(
      process.env.RECOMMENDATIONS_HAPTIC_DELAY_MS || '300'
    ),
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.RECOMMENDATIONS_RESPECT_REDUCED_MOTION !== 'false',
    // Sparkle burst animation settings
    sparkleBurst: {
      durationSec: `${parseInt(process.env.RECOMMENDATIONS_SPARKLE_DURATION_MS || '600') / 1000}s`,
      staggerDelaySec: `${parseInt(process.env.RECOMMENDATIONS_SPARKLE_STAGGER_MS || '50') / 1000}s`,
    },
    // Card transition settings
    cardTransition: {
      durationSec: `${parseInt(process.env.RECOMMENDATIONS_CARD_TRANSITION_MS || '300') / 1000}s`,
    },
  },
  // VirtualList Component Animations - Palette's micro-UX enhancement!
  // Staggered entrance animations and smooth transitions for virtual scrolling
  virtualList: {
    // Entrance animation duration for list items (ms)
    entranceDurationMs: parseInt(
      process.env.VIRTUAL_LIST_ENTRANCE_DURATION_MS || '400'
    ),
    // Easing function for entrance animation
    entranceEasing:
      process.env.VIRTUAL_LIST_ENTRANCE_EASING || EASING_REF.SPRING_STANDARD,
    // Stagger delay between each item (ms) - creates wave effect
    staggerDelayMs: parseInt(process.env.VIRTUAL_LIST_STAGGER_DELAY_MS || '50'),
    // Maximum number of items to animate in a batch (prevents performance issues)
    maxAnimatedItems: parseInt(
      process.env.VIRTUAL_LIST_MAX_ANIMATED_ITEMS || '10'
    ),
    // Transition duration for item enter/leave (ms)
    transitionDurationMs: parseInt(
      process.env.VIRTUAL_LIST_TRANSITION_DURATION_MS || '200'
    ),
    // Move transition duration for reordering (ms)
    moveDurationMs: parseInt(
      process.env.VIRTUAL_LIST_MOVE_DURATION_MS || '300'
    ),
    // Reduced motion duration - faster and simpler for accessibility (ms)
    reducedMotionDurationMs: parseInt(
      process.env.VIRTUAL_LIST_REDUCED_MOTION_DURATION_MS || '100'
    ),
    // Entrance animation start translate Y (px)
    entranceStartTranslateYPx: parseInt(
      process.env.VIRTUAL_LIST_ENTRANCE_START_TRANSLATE_Y_PX || '20'
    ),
    // Entrance animation start scale
    entranceStartScale: parseFloat(
      process.env.VIRTUAL_LIST_ENTRANCE_START_SCALE || '0.95'
    ),
    // Entrance animation mid-point translate Y for bounce effect (px)
    entranceMidTranslateYPx: parseInt(
      process.env.VIRTUAL_LIST_ENTRANCE_MID_TRANSLATE_Y_PX || '-2'
    ),
    // Entrance animation mid-point scale for bounce effect
    entranceMidScale: parseFloat(
      process.env.VIRTUAL_LIST_ENTRANCE_MID_SCALE || '1.01'
    ),
  },

  // ReviewQueue Component Animations - Palette's micro-UX delight! 🎨
  // Staggered card entrances, loading skeletons, and delightful hover effects
  reviewQueue: {
    // Stagger delay between card entrances (ms)
    staggerDelayMs: parseInt(process.env.REVIEW_QUEUE_STAGGER_MS || '100'),
    // Card entrance animation duration (ms)
    entranceDurationMs: parseInt(
      process.env.REVIEW_QUEUE_ENTRANCE_DURATION_MS || '400'
    ),
    // Card hover transition duration (ms)
    hoverTransitionMs: parseInt(
      process.env.REVIEW_QUEUE_HOVER_TRANSITION_MS || '200'
    ),
    // Status badge pulse animation duration (ms)
    badgePulseDurationMs: parseInt(
      process.env.REVIEW_QUEUE_BADGE_PULSE_MS || '2000'
    ),
    // Empty state float animation duration (ms)
    emptyFloatDurationMs: parseInt(
      process.env.REVIEW_QUEUE_EMPTY_FLOAT_MS || '3000'
    ),
    // Skeleton shimmer animation duration (ms)
    skeletonShimmerDurationMs: parseInt(
      process.env.REVIEW_QUEUE_SKELETON_SHIMMER_MS || '1500'
    ),
    // Button pulse animation duration (ms)
    buttonPulseDurationMs: parseInt(
      process.env.REVIEW_QUEUE_BUTTON_PULSE_MS || '400'
    ),
    // Filter transition duration (ms)
    filterTransitionMs: parseInt(
      process.env.REVIEW_QUEUE_FILTER_TRANSITION_MS || '200'
    ),
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.REVIEW_QUEUE_RESPECT_REDUCED_MOTION !== 'false',
  },

  // SubmissionReview Component Animations - Palette's micro-UX delight! 🎉
  // Celebration animation for successful submission approvals
  submissionReview: {
    // Duration for the celebration overlay to show (ms)
    celebrationDurationMs: parseInt(
      process.env.SUBMISSION_REVIEW_CELEBRATION_DURATION_MS || '2500'
    ),
    // Duration for the checkmark circle scale animation (ms)
    circleScaleDurationMs: parseInt(
      process.env.SUBMISSION_REVIEW_CIRCLE_SCALE_MS || '300'
    ),
    // Duration for the checkmark draw animation (ms)
    checkmarkDrawDurationMs: parseInt(
      process.env.SUBMISSION_REVIEW_CHECKMARK_DRAW_MS || '400'
    ),
    // Delay before starting checkmark draw animation (ms)
    checkmarkDrawDelayMs: parseInt(
      process.env.SUBMISSION_REVIEW_CHECKMARK_DELAY_MS || '200'
    ),
    // Duration for the pop-in animation (seconds)
    popInDurationSec: `${parseInt(process.env.SUBMISSION_REVIEW_POP_IN_MS || '500') / 1000}s`,
    // Duration for confetti burst animation (ms)
    confettiDurationMs: parseInt(
      process.env.SUBMISSION_REVIEW_CONFETTI_DURATION_MS || '800'
    ),
    // Delay before starting confetti animation (ms)
    confettiDelayMs: parseInt(
      process.env.SUBMISSION_REVIEW_CONFETTI_DELAY_MS || '100'
    ),
    // Duration for status badge pulse animation (seconds)
    statusPulseDurationSec: `${parseInt(process.env.SUBMISSION_REVIEW_STATUS_PULSE_MS || '2000') / 1000}s`,
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.SUBMISSION_REVIEW_RESPECT_REDUCED_MOTION !== 'false',
    // Success message configuration
    successMessage: {
      title: process.env.SUBMISSION_SUCCESS_TITLE || 'Success!',
      button: process.env.SUBMISSION_SUCCESS_BUTTON || 'Continue',
    },
    // Celebration animation configuration
    celebration: {
      durationMs: parseInt(
        process.env.SUBMISSION_CELEBRATION_DURATION_MS || '2500'
      ),
      durationSec: `${parseInt(process.env.SUBMISSION_CELEBRATION_DURATION_MS || '2500') / 1000}s`,
      popInDurationSec: `${parseInt(process.env.SUBMISSION_REVIEW_POP_IN_MS || '500') / 1000}s`,
      circleScaleDurationMs: parseInt(
        process.env.SUBMISSION_REVIEW_CIRCLE_SCALE_MS || '300'
      ),
      checkmarkDrawDurationMs: parseInt(
        process.env.SUBMISSION_REVIEW_CHECKMARK_DRAW_MS || '400'
      ),
      checkmarkDrawDelayMs: parseInt(
        process.env.SUBMISSION_REVIEW_CHECKMARK_DELAY_MS || '200'
      ),
      confettiDurationMs: parseInt(
        process.env.SUBMISSION_REVIEW_CONFETTI_DURATION_MS || '800'
      ),
      confettiDelayMs: parseInt(
        process.env.SUBMISSION_REVIEW_CONFETTI_DELAY_MS || '100'
      ),
    },
  },

  // Comparison Empty State Animations - Palette's delightful micro-UX touch! 🎨
  // Delightful animations and visual feedback for the comparison table empty state
  comparisonEmptyState: {
    // Duration for icon bounce animation (ms)
    iconBounceDurationMs: parseInt(
      process.env.COMPARISON_EMPTY_ICON_BOUNCE_MS || '2000'
    ),
    // CSS duration string for icon bounce
    iconBounceDurationSec: `${parseInt(process.env.COMPARISON_EMPTY_ICON_BOUNCE_MS || '2000') / 1000}s`,
    // Duration for icon pulse animation (ms)
    iconPulseDurationMs: parseInt(
      process.env.COMPARISON_EMPTY_ICON_PULSE_MS || '3000'
    ),
    // Duration for scale icon animation (ms)
    scaleIconDurationMs: parseInt(
      process.env.COMPARISON_EMPTY_SCALE_ICON_MS || '4000'
    ),
    // Ring rotation duration (ms)
    ringRotateDurationMs: parseInt(
      process.env.COMPARISON_EMPTY_RING_ROTATE_MS || '20000'
    ),
    // Dot float animation duration (ms)
    dotFloatDurationMs: parseInt(
      process.env.COMPARISON_EMPTY_DOT_FLOAT_MS || '3000'
    ),
    // Circle float animation duration (ms)
    circleFloatDurationMs: parseInt(
      process.env.COMPARISON_EMPTY_CIRCLE_FLOAT_MS || '8000'
    ),
    // Text reveal animation duration (ms)
    textRevealDurationMs: parseInt(
      process.env.COMPARISON_EMPTY_TEXT_REVEAL_MS || '600'
    ),
    // CSS duration string for text reveal
    textRevealDurationSec: `${parseInt(process.env.COMPARISON_EMPTY_TEXT_REVEAL_MS || '600') / 1000}s`,
    // Suggestion button pop animation duration (ms)
    suggestionPopDurationMs: parseInt(
      process.env.COMPARISON_EMPTY_SUGGESTION_POP_MS || '400'
    ),
    // Base animation delay before suggestions start animating (ms) - Flexy hates hardcoded 400ms!
    suggestionBaseDelayMs: parseInt(
      process.env.COMPARISON_EMPTY_SUGGESTION_BASE_DELAY_MS || '400'
    ),
    // Stagger delay between suggestion buttons (ms)
    suggestionStaggerDelayMs: parseInt(
      process.env.COMPARISON_EMPTY_SUGGESTION_STAGGER_MS || '100'
    ),
    // Scale factor for icon bounce (how far it moves up)
    iconBounceDistancePx: parseInt(
      process.env.COMPARISON_EMPTY_BOUNCE_DISTANCE_PX || '4'
    ),
    // Icon pulse scale multiplier
    iconPulseScale: parseFloat(
      process.env.COMPARISON_EMPTY_PULSE_SCALE || '1.2'
    ),
    // Dot float distance (px)
    dotFloatDistancePx: parseInt(
      process.env.COMPARISON_EMPTY_DOT_FLOAT_PX || '8'
    ),
    // Text reveal stagger delays - Flexy hates hardcoded 100ms, 200ms, 300ms!
    textRevealStaggerMs: parseInt(
      process.env.COMPARISON_EMPTY_TEXT_STAGGER_MS || '100'
    ),
    // Dot float animation delays (seconds) - Flexy hates hardcoded delays!
    dotFloatDelaysSec: [
      parseFloat(process.env.COMPARISON_EMPTY_DOT_DELAY_1 || '0'),
      parseFloat(process.env.COMPARISON_EMPTY_DOT_DELAY_2 || '1'),
      parseFloat(process.env.COMPARISON_EMPTY_DOT_DELAY_3 || '2'),
    ],
    // Circle float animation delays (seconds) - negative delays for offset
    circleFloatDelaysSec: [
      parseFloat(process.env.COMPARISON_EMPTY_CIRCLE_DELAY_1 || '0'),
      parseFloat(process.env.COMPARISON_EMPTY_CIRCLE_DELAY_2 || '-3'),
      parseFloat(process.env.COMPARISON_EMPTY_CIRCLE_DELAY_3 || '-5'),
    ],
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.COMPARISON_EMPTY_RESPECT_REDUCED_MOTION !== 'false',
  },

  // Comparison Table Animations
  comparisonTable: {
    // Icon bounce duration (seconds)
    iconBounceSec: parseFloat(process.env.COMPARISON_ICON_BOUNCE_SEC || '2'),
    // Icon pulse duration (seconds)
    iconPulseSec: parseFloat(process.env.COMPARISON_ICON_PULSE_SEC || '3'),
    // Icon scale duration (seconds)
    iconScaleSec: parseFloat(process.env.COMPARISON_ICON_SCALE_SEC || '4'),
    // Ring rotate duration (seconds)
    ringRotateSec: parseFloat(process.env.COMPARISON_RING_ROTATE_SEC || '20'),
    // Dot float duration (seconds)
    dotFloatSec: parseFloat(process.env.COMPARISON_DOT_FLOAT_SEC || '3'),
    // Circle float durations (seconds)
    circleFloatSec1: parseFloat(
      process.env.COMPARISON_CIRCLE_FLOAT_SEC_1 || '8'
    ),
    circleFloatSec2: parseFloat(
      process.env.COMPARISON_CIRCLE_FLOAT_SEC_2 || '10'
    ),
    circleFloatSec3: parseFloat(
      process.env.COMPARISON_CIRCLE_FLOAT_SEC_3 || '12'
    ),
    // Text reveal duration (seconds)
    textRevealSec: parseFloat(process.env.COMPARISON_TEXT_REVEAL_SEC || '0.6'),
    // Blur radius (px)
    blurRadiusPx: parseInt(process.env.COMPARISON_BLUR_RADIUS_PX || '40'),
    // Circle size large (px)
    circleSizeLargePx: parseInt(
      process.env.COMPARISON_CIRCLE_SIZE_LARGE_PX || '120'
    ),
    // Circle size medium (px)
    circleSizeMediumPx: parseInt(
      process.env.COMPARISON_CIRCLE_SIZE_MEDIUM_PX || '100'
    ),
    // Circle size small (px)
    circleSizeSmallPx: parseInt(
      process.env.COMPARISON_CIRCLE_SIZE_SMALL_PX || '80'
    ),
    // Circle offset top (px)
    circleOffsetTopPx: parseInt(
      process.env.COMPARISON_CIRCLE_OFFSET_TOP_PX || '-20'
    ),
  },

  // Offline Indicator Animations
  offlineIndicator: {
    // Pulse subtle duration (seconds)
    pulseSubtleSec: parseFloat(process.env.OFFLINE_PULSE_SUBTLE_SEC || '2'),
    // Icon pulse duration (seconds)
    iconPulseSec: parseFloat(process.env.OFFLINE_ICON_PULSE_SEC || '2'),
    // Bounce subtle duration (seconds)
    bounceSubtleSec: parseFloat(process.env.OFFLINE_BOUNCE_SUBTLE_SEC || '0.5'),
    // Check pop duration (seconds)
    checkPopSec: parseFloat(process.env.OFFLINE_CHECK_POP_SEC || '0.4'),
    // Spin duration (seconds)
    spinSec: parseFloat(process.env.OFFLINE_SPIN_SEC || '1'),
  },

  // Moderation Dashboard Animations - Flexy hates hardcoded values! 🎯
  // Counter animations, stagger effects, and timing for dashboard statistics
  moderationDashboard: {
    // Initial delay before starting counter animations (ms) - Flexy hates hardcoded 300!
    counterStartDelayMs: parseInt(
      process.env.MODERATION_COUNTER_START_DELAY_MS || '300'
    ),
    // Duration of counter animation from start to end (ms) - Flexy hates hardcoded 2000!
    counterAnimationDurationMs: parseInt(
      process.env.MODERATION_COUNTER_DURATION_MS || '2000'
    ),
    // Duration for individual counter updates on value changes (ms) - Flexy hates hardcoded 800!
    counterUpdateDurationMs: parseInt(
      process.env.MODERATION_COUNTER_UPDATE_MS || '800'
    ),
    // How long to show completion announcement (ms) - Flexy hates hardcoded 3000!
    announcementDisplayDurationMs: parseInt(
      process.env.MODERATION_ANNOUNCEMENT_DURATION_MS || '3000'
    ),
    // Delay between each stat card's entrance (stagger effect) (ms)
    cardStaggerDelayMs: parseInt(
      process.env.MODERATION_CARD_STAGGER_MS || '100'
    ),
    // Delay between each activity item's entrance (ms)
    activityStaggerDelayMs: parseInt(
      process.env.MODERATION_ACTIVITY_STAGGER_MS || '75'
    ),
    // Maximum stagger delay for activities to prevent long waits (ms)
    maxActivityStaggerDelayMs: parseInt(
      process.env.MODERATION_MAX_ACTIVITY_STAGGER_MS || '600'
    ),
    // Delay between each action button's entrance (ms)
    actionStaggerDelayMs: parseInt(
      process.env.MODERATION_ACTION_STAGGER_MS || '100'
    ),
    // Card hover transition duration (ms)
    cardHoverTransitionMs: parseInt(
      process.env.MODERATION_CARD_HOVER_MS || '200'
    ),
    // Card press transition duration (ms)
    cardPressTransitionMs: parseInt(
      process.env.MODERATION_CARD_PRESS_MS || '100'
    ),
    // Activity item hover transition duration (ms)
    activityHoverTransitionMs: parseInt(
      process.env.MODERATION_ACTIVITY_HOVER_MS || '150'
    ),
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.MODERATION_RESPECT_REDUCED_MOTION !== 'false',
    // Card entrance animation duration in seconds
    cardEntranceDurationSec: `${parseInt(process.env.MODERATION_CARD_ENTRANCE_DURATION_MS || '500') / 1000}s`,
    // Activity entrance animation duration in seconds
    activityEntranceDurationSec: `${parseInt(process.env.MODERATION_ACTIVITY_ENTRANCE_DURATION_MS || '400') / 1000}s`,
    // Base delay offset for activity animations (ms) - Flexy hates hardcoded 400ms!
    activityDelayOffsetMs: parseInt(
      process.env.MODERATION_ACTIVITY_DELAY_OFFSET_MS || '400'
    ),
    // Action button entrance animation duration in seconds
    actionEntranceDurationSec: `${parseInt(process.env.MODERATION_ACTION_ENTRANCE_DURATION_MS || '400') / 1000}s`,
    // Base delay offset for action button animations (ms) - Flexy hates hardcoded 600ms!
    actionDelayOffsetMs: parseInt(
      process.env.MODERATION_ACTION_DELAY_OFFSET_MS || '600'
    ),
    // Trend pulse animation duration in seconds
    trendPulseDurationSec: `${parseInt(process.env.MODERATION_TREND_PULSE_DURATION_MS || '800') / 1000}s`,
    // Float animation duration in seconds (for empty state)
    floatDurationSec: parseFloat(
      process.env.MODERATION_FLOAT_DURATION_SEC || '3'
    ),
  },

  // Resource Card Animations
  resourceCard: {
    // New badge pulse duration (seconds)
    newPulseSec: parseFloat(process.env.RESOURCE_CARD_NEW_PULSE_SEC || '2'),
  },

  // Resource Comments Animations
  resourceComments: {
    // Avatar pulse duration (seconds)
    avatarPulseSec: parseFloat(process.env.COMMENTS_AVATAR_PULSE_SEC || '2'),
  },

  // Counter Animations - Flexy hates hardcoded values! 🎯
  // General counter animation configuration for stat displays and analytics
  counter: {
    // Duration of counter animation from start to end (ms) - Flexy hates hardcoded 1500!
    durationMs: parseInt(process.env.COUNTER_ANIMATION_DURATION_MS || '1500'),
    // Delay before starting counter animation (ms) - Flexy hates hardcoded 100!
    startDelayMs: parseInt(process.env.COUNTER_START_DELAY_MS || '100'),
    // Easing function for counter animation ('linear' | 'easeOut' | 'easeInOut')
    easing:
      (process.env.COUNTER_EASING as 'linear' | 'easeOut' | 'easeInOut') ||
      'easeOut',
    // Whether to use spring physics for bouncy effect
    useSpringPhysics: process.env.COUNTER_USE_SPRING !== 'false',
    // Spring tension for counter animation (higher = faster)
    springTension: parseFloat(process.env.COUNTER_SPRING_TENSION || '120'),
    // Spring friction for counter animation (higher = less bounce)
    springFriction: parseFloat(process.env.COUNTER_SPRING_FRICTION || '14'),
    // Whether to format large numbers with commas during animation
    formatNumbers: process.env.COUNTER_FORMAT_NUMBERS !== 'false',
    // Update interval for counter animation in ms (lower = smoother but more CPU)
    updateIntervalMs: parseInt(process.env.COUNTER_UPDATE_INTERVAL_MS || '16'),
    // Whether to reduce precision for very large numbers (e.g., show 1.2K instead of 1234)
    abbreviateLargeNumbers: process.env.COUNTER_ABBREViate_LARGE === 'true',
    // Threshold for large number abbreviation
    abbreviationThreshold: parseInt(
      process.env.COUNTER_ABBREVIATION_THRESHOLD || '10000'
    ),
  },

  // ============================================
  // Flexy ULW Loop - Additional Modular Configs
  // Eliminating hardcoded values! 🎯
  // ============================================
  // ============================================
  // Flexy ULW Loop - Additional Modular Configs
  // Eliminating hardcoded values! 🎯
  // ============================================

  // CSS Cubic-Bezier Easing Functions - Flexy hates hardcoded values!
  // Centralized easing functions for consistent animations
  cssEasing: {
    // Spring standard easing (commonly cubic-bezier(0.175, 0.885, 0.32, 1.275))
    spring:
      process.env.CSS_EASING_SPRING ||
      'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    // Bouncy easing (commonly cubic-bezier(0.34, 1.56, 0.64, 1))
    bouncy:
      process.env.CSS_EASING_BOUNCY || 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    // Standard easing (commonly cubic-bezier(0.25, 0.46, 0.45, 0.94))
    standard:
      process.env.CSS_EASING_STANDARD || 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    // Entrance easing (commonly cubic-bezier(0.16, 1, 0.3, 1))
    entrance:
      process.env.CSS_EASING_ENTRANCE || 'cubic-bezier(0.16, 1, 0.3, 1)',
  },

  // Comparison Animations - Additional properties for suggestion pop
  // Used for pop animations in comparison views
  comparisonPop: {
    // Pop animation duration in seconds (commonly 0.4s)
    durationSec: `${parseInt(process.env.COMPARISON_POP_MS || '400') / 1000}s`,
    // Entrance easing for icon animations
    easing:
      process.env.COMPARISON_ENTRANCE_EASING || 'cubic-bezier(0.16, 1, 0.3, 1)',
  },

  // Checkmark Success Animations
  // Used for success state checkmark animations
  checkmarkAnim: {
    // Circle scale animation duration in seconds
    circleScaleDurationSec: `${parseInt(process.env.CHECKMARK_CIRCLE_SCALE_MS || '300') / 1000}s`,
    // Checkmark draw duration in seconds
    drawDurationSec: `${parseInt(process.env.CHECKMARK_DRAW_MS || '300') / 1000}s`,
    // Icon rotate-in duration in seconds
    iconRotateDurationSec: `${parseInt(process.env.CHECKMARK_ICON_ROTATE_MS || '400') / 1000}s`,
    // Text fade-in duration in seconds
    textFadeDurationSec: `${parseInt(process.env.CHECKMARK_TEXT_FADE_MS || '300') / 1000}s`,
  },

  // Validation Shake Animation
  // Used for form validation error feedback
  validationShakeAnim: {
    // Shake animation duration in seconds
    durationSec: `${parseInt(process.env.VALIDATION_SHAKE_DURATION_MS || '500') / 1000}s`,
    // X-axis translation values for shake in pixels
    translateXPx: [0, -4, 4, -2, 2],
  },

  // Offline Page Animations
  // Used for offline page animations
  offlineAnim: {
    // Pulse animation duration in seconds
    pulseDurationSec: `${parseInt(process.env.OFFLINE_PULSE_MS || '3000') / 1000}s`,
    // Bounce animation duration in seconds
    bounceDurationSec: `${parseInt(process.env.OFFLINE_BOUNCE_MS || '600') / 1000}s`,
  },

  // Float Animations
  // Used for floating decorative elements
  floatAnim: {
    // Float animation duration in seconds
    durationSec: `${parseInt(process.env.FLOAT_DURATION_MS || '3000') / 1000}s`,
    // Easing function
    easing: process.env.FLOAT_EASING || 'ease-in-out',
  },

  // Features Section Animations - Palette's micro-UX delight! 🎨
  // Staggered entrance animations for feature lists with delightful checkmarks
  featuresSection: {
    // Delay between each feature item entrance (ms)
    staggerDelayMs: parseInt(process.env.FEATURES_STAGGER_DELAY_MS || '80'),
    // CSS-compatible stagger delay (seconds)
    staggerDelaySec: parseFloat(
      process.env.FEATURES_STAGGER_DELAY_SEC || '0.08'
    ),
    // Feature item entrance animation duration (ms)
    entranceDurationMs: parseInt(
      process.env.FEATURES_ENTRANCE_DURATION_MS || '500'
    ),
    // CSS-compatible entrance duration (seconds)
    entranceDurationSec: parseFloat(
      process.env.FEATURES_ENTRANCE_DURATION_SEC || '0.5'
    ),
    // Checkmark draw animation duration (ms)
    checkmarkDrawMs: parseInt(process.env.FEATURES_CHECKMARK_DRAW_MS || '400'),
    // CSS-compatible checkmark draw duration (seconds)
    checkmarkDrawSec: parseFloat(
      process.env.FEATURES_CHECKMARK_DRAW_SEC || '0.4'
    ),
    // Checkmark scale animation duration (ms)
    checkmarkScaleMs: parseInt(
      process.env.FEATURES_CHECKMARK_SCALE_MS || '300'
    ),
    // Hover lift distance (px)
    hoverLiftPx: parseInt(process.env.FEATURES_HOVER_LIFT_PX || '2'),
    // Hover scale factor
    hoverScale: parseFloat(process.env.FEATURES_HOVER_SCALE || '1.01'),
    // Icon pulse scale on entrance
    iconPulseScale: parseFloat(process.env.FEATURES_ICON_PULSE_SCALE || '1.2'),
    // Entrance distance from below (px)
    entranceDistancePx: parseInt(
      process.env.FEATURES_ENTRANCE_DISTANCE_PX || '15'
    ),
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.FEATURES_RESPECT_REDUCED_MOTION !== 'false',
  },

  // Comparison Builder Animations - Palette's micro-UX delight! 🎨
  // Staggered resource tags, celebration effects, and delightful interactions
  comparison: {
    // Progress dot transition duration (ms)
    dotTransitionMs: parseInt(
      process.env.COMPARISON_DOT_TRANSITION_MS || '200'
    ),
    // Progress dot pop animation duration (ms)
    popDurationMs: parseInt(process.env.COMPARISON_POP_DURATION_MS || '400'),
    // Progress dot glow animation duration (ms)
    glowDurationMs: parseInt(process.env.COMPARISON_GLOW_DURATION_MS || '2000'),
    // Stagger delay for progress dots (ms)
    staggerDelayMs: parseInt(process.env.COMPARISON_STAGGER_DELAY_MS || '50'),
    // Button press transition duration (ms)
    buttonTransitionMs: parseInt(
      process.env.COMPARISON_BUTTON_TRANSITION_MS || '150'
    ),
    // Resource tag enter animation duration (ms)
    tagEnterDurationMs: parseInt(
      process.env.COMPARISON_TAG_ENTER_DURATION_MS || '300'
    ),
    // Resource tag exit animation duration (ms)
    tagExitDurationMs: parseInt(
      process.env.COMPARISON_TAG_EXIT_DURATION_MS || '200'
    ),
    // Resource tag hover transition duration (ms)
    tagTransitionMs: parseInt(
      process.env.COMPARISON_TAG_TRANSITION_MS || '200'
    ),
    // Remove button hover transition duration (ms)
    removeTransitionMs: parseInt(
      process.env.COMPARISON_REMOVE_TRANSITION_MS || '150'
    ),
    // Max reached celebration bounce duration (ms)
    celebrationBounceMs: parseInt(
      process.env.COMPARISON_CELEBRATION_BOUNCE_MS || '1000'
    ),
    // Confetti duration for max reached celebration (ms)
    confettiDurationMs: parseInt(
      process.env.COMPARISON_CONFETTI_DURATION_MS || '2000'
    ),
  },

  // Resource Analytics Animations - Flexy hates hardcoded stagger delays!
  // Used by ResourceAnalytics.vue for card entrance and skeleton loading
  analytics: {
    // Stagger delay between analytics cards (ms)
    cardStaggerDelayMs: parseInt(
      process.env.ANALYTICS_CARD_STAGGER_DELAY_MS || '100'
    ),
    // CSS-compatible card stagger delay (seconds)
    cardStaggerDelaySec: `${
      parseInt(process.env.ANALYTICS_CARD_STAGGER_DELAY_MS || '100') / 1000
    }s`,
    // Stagger delay between skeleton items (ms)
    skeletonStaggerDelayMs: parseInt(
      process.env.ANALYTICS_SKELETON_STAGGER_DELAY_MS || '150'
    ),
    // CSS-compatible skeleton stagger delay (seconds)
    skeletonStaggerDelaySec: `${
      parseInt(process.env.ANALYTICS_SKELETON_STAGGER_DELAY_MS || '150') / 1000
    }s`,
    // Transition duration for value color changes (ms)
    valueTransitionMs: parseInt(
      process.env.ANALYTICS_VALUE_TRANSITION_MS || '200'
    ),
    // CSS-compatible value transition duration (seconds)
    valueTransitionSec: `${
      parseInt(process.env.ANALYTICS_VALUE_TRANSITION_MS || '200') / 1000
    }s`,
    // Progress bar animation - Flexy hates hardcoded transitions!
    progressBar: {
      // Width transition duration (ms)
      widthTransitionMs: parseInt(
        process.env.ANALYTICS_PROGRESS_WIDTH_MS || '1000'
      ),
      // CSS-compatible width transition duration (seconds)
      widthTransitionSec: `${
        parseInt(process.env.ANALYTICS_PROGRESS_WIDTH_MS || '1000') / 1000
      }s`,
      // Easing function for width transition (spring effect)
      widthEasing:
        process.env.ANALYTICS_PROGRESS_EASING ||
        EASING_CONFIG.cubicBezier.spring,
    },
  },

  // Search Analytics Animations - Flexy hates hardcoded timing values!
  // Used by SearchAnalytics.vue for chart animations and transitions
  searchAnalytics: {
    // Chart transition duration after entrance animation (ms)
    chartTransitionMs: parseInt(
      process.env.SEARCH_ANALYTICS_CHART_TRANSITION_MS || '300'
    ),
    // Bar stagger delay multiplier for chart bars (ms per index)
    barStaggerMultiplierMs: parseInt(
      process.env.SEARCH_ANALYTICS_BAR_STAGGER_MULTIPLIER_MS || '50'
    ),
    // Fade in animation duration (seconds)
    fadeInDurationSec: parseFloat(
      process.env.SEARCH_ANALYTICS_FADE_IN_DURATION_SEC || '0.3'
    ),
    // Glow pulse animation duration (seconds) - Flexy hates hardcoded 2s!
    glowPulseDurationSec: parseFloat(
      process.env.SEARCH_ANALYTICS_GLOW_PULSE_SEC || '2'
    ),
    // Live pulse indicator animation duration (seconds)
    livePulseDurationSec: parseFloat(
      process.env.SEARCH_ANALYTICS_LIVE_PULSE_SEC || '2'
    ),
    // Live ring animation duration (seconds)
    liveRingDurationSec: parseFloat(
      process.env.SEARCH_ANALYTICS_LIVE_RING_SEC || '2'
    ),
    // Shimmer spin animation duration (seconds)
    shimmerSpinDurationSec: parseFloat(
      process.env.SEARCH_ANALYTICS_SHIMMER_SPIN_SEC || '2'
    ),
  },

  // Client Error Boundary Animations - Flexy hates hardcoded values!
  // Used by ClientErrorBoundary.vue for loading and error animations
  clientErrorBoundary: {
    // Shimmer spin animation duration (seconds) - Flexy hates hardcoded 1s!
    shimmerSpinDurationSec: parseFloat(
      process.env.CLIENT_ERROR_SHIMMER_SPIN_SEC || '1'
    ),
    // Error pulse animation duration (seconds)
    errorPulseDurationSec: parseFloat(
      process.env.CLIENT_ERROR_PULSE_SEC || '2'
    ),
    // Error pulse iteration count
    errorPulseIterations: parseInt(
      process.env.CLIENT_ERROR_PULSE_ITERATIONS || '3'
    ),
    // Error icon shake animation duration (seconds)
    errorShakeDurationSec: parseFloat(
      process.env.CLIENT_ERROR_SHAKE_SEC || '0.5'
    ),
  },

  // Comparison Builder Float Animations - Flexy hates hardcoded delays!
  // Used for floating decorative dots in empty state
  comparisonFloat: {
    // Animation duration for floating dots (seconds)
    durationSec: parseFloat(process.env.COMPARISON_FLOAT_DURATION_SEC || '3'),
    // Delay for second floating dot (seconds)
    dot2DelaySec: parseFloat(
      process.env.COMPARISON_FLOAT_DOT2_DELAY_SEC || '1'
    ),
    // Delay for third floating dot (seconds)
    dot3DelaySec: parseFloat(
      process.env.COMPARISON_FLOAT_DOT3_DELAY_SEC || '2'
    ),
  },

  // Features Section Icon Pop Animation - Flexy hates hardcoded offsets!
  // Additional delay offset for icon pop animation after stagger
  featuresIconPop: {
    // Delay offset after stagger delay (ms)
    delayOffsetMs: parseInt(
      process.env.FEATURES_ICON_POP_DELAY_OFFSET_MS || '150'
    ),
    // CSS-compatible delay offset (seconds)
    delayOffsetSec: `${parseInt(process.env.FEATURES_ICON_POP_DELAY_OFFSET_MS || '150') / 1000}s`,
  },

  // Specifications Section Animations - Flexy hates hardcoded 50ms and 300ms!
  // Used by SpecificationsSection.vue for staggered item entrance animations
  specificationsSection: {
    // Stagger delay multiplier per item index (ms)
    staggerMultiplierMs: parseInt(
      process.env.SPEC_SECTION_STAGGER_MULTIPLIER_MS || '50'
    ),
    // Maximum stagger delay cap (ms) - prevents excessive delays with many items
    staggerMaxDelayMs: parseInt(
      process.env.SPEC_SECTION_STAGGER_MAX_DELAY_MS || '300'
    ),
  },

  // Health Monitor Animations - BugFixer's bug fix! 🐛
  // Animation settings for HealthMonitor component status changes
  healthMonitor: {
    // Delay before triggering haptic feedback on status change (ms)
    hapticDelayMs: parseInt(
      process.env.HEALTH_MONITOR_HAPTIC_DELAY_MS || '100'
    ),
    // Duration of success animation (ms)
    successDurationMs: parseInt(
      process.env.HEALTH_MONITOR_SUCCESS_DURATION_MS || '2000'
    ),
    // Success animation duration in seconds
    successDurationSec: `${parseInt(process.env.HEALTH_MONITOR_SUCCESS_DURATION_MS || '2000') / 1000}s`,
    // Duration of error animation (ms)
    errorDurationMs: parseInt(
      process.env.HEALTH_MONITOR_ERROR_DURATION_MS || '2000'
    ),
    // Error animation duration in seconds
    errorDurationSec: `${parseInt(process.env.HEALTH_MONITOR_ERROR_DURATION_MS || '2000') / 1000}s`,
    // Pulse animation duration in seconds
    pulseDurationSec: `${parseInt(process.env.HEALTH_MONITOR_PULSE_DURATION_MS || '1500') / 1000}s`,
    // Pulse scale multiplier
    pulseScale: parseFloat(process.env.HEALTH_MONITOR_PULSE_SCALE || '1.1'),
    // Success animation scale
    successScale: parseFloat(process.env.HEALTH_MONITOR_SUCCESS_SCALE || '1.2'),
    // Success rotation in degrees
    successRotationDeg: parseInt(
      process.env.HEALTH_MONITOR_SUCCESS_ROTATION_DEG || '360'
    ),
    // Spinner animation duration in ms
    spinnerDurationMs: parseInt(
      process.env.HEALTH_MONITOR_SPINNER_DURATION_MS || '1000'
    ),
  },

  // Saved Searches Micro-UX - Palette's delightful enhancement! ✨
  // Particle burst celebration on delete, staggered entrance, and undo progress bar
  savedSearches: {
    // Particle burst animation duration (ms)
    particleBurstDurationMs: parseInt(
      process.env.SAVED_SEARCHES_PARTICLE_DURATION_MS || '600'
    ),
    // CSS duration string for particle burst
    particleBurstDurationSec: `${parseInt(process.env.SAVED_SEARCHES_PARTICLE_DURATION_MS || '600') / 1000}s`,
    // Number of particles in the burst
    particleCount: parseInt(process.env.SAVED_SEARCHES_PARTICLE_COUNT || '8'),
    // Particle spread distance (px)
    particleSpreadPx: parseInt(
      process.env.SAVED_SEARCHES_PARTICLE_SPREAD || '40'
    ),
    // Particle colors (red/gray theme for deletion)
    particleColors: [
      process.env.SAVED_SEARCHES_PARTICLE_COLOR_1 || '#ef4444', // red-500
      process.env.SAVED_SEARCHES_PARTICLE_COLOR_2 || '#f87171', // red-400
      process.env.SAVED_SEARCHES_PARTICLE_COLOR_3 || '#9ca3af', // gray-400
      process.env.SAVED_SEARCHES_PARTICLE_COLOR_4 || '#d1d5db', // gray-300
    ],
    // Particle size range (px)
    particleMinSizePx: parseInt(
      process.env.SAVED_SEARCHES_PARTICLE_MIN_SIZE || '3'
    ),
    particleMaxSizePx: parseInt(
      process.env.SAVED_SEARCHES_PARTICLE_MAX_SIZE || '6'
    ),
    // Delay before particles start disappearing (seconds)
    particleFadeDelaySec: parseFloat(
      process.env.SAVED_SEARCHES_PARTICLE_FADE_DELAY || '0.3'
    ),
    // Staggered entrance animation delay between items (ms)
    staggerDelayMs: parseInt(process.env.SAVED_SEARCHES_STAGGER_MS || '80'),
    // Maximum stagger delay to prevent long waits (ms)
    maxStaggerDelayMs: parseInt(
      process.env.SAVED_SEARCHES_MAX_STAGGER_MS || '500'
    ),
    // Entrance animation duration (ms)
    entranceDurationMs: parseInt(
      process.env.SAVED_SEARCHES_ENTRANCE_DURATION_MS || '400'
    ),
    // CSS duration string for entrance
    entranceDurationSec: `${parseInt(process.env.SAVED_SEARCHES_ENTRANCE_DURATION_MS || '400') / 1000}s`,
    // Distance items travel during entrance (px)
    entranceDistancePx: parseInt(
      process.env.SAVED_SEARCHES_ENTRANCE_DISTANCE || '15'
    ),
    // Undo notification progress bar duration (ms)
    undoProgressDurationMs: parseInt(
      process.env.SAVED_SEARCHES_UNDO_PROGRESS_MS || '5000'
    ),
    // CSS duration string for undo progress
    undoProgressDurationSec: `${parseInt(process.env.SAVED_SEARCHES_UNDO_PROGRESS_MS || '5000') / 1000}s`,
    // Progress bar color
    progressBarColor:
      process.env.SAVED_SEARCHES_PROGRESS_COLOR || 'rgba(245, 158, 11, 0.8)', // amber-500
    // Progress bar background color
    progressBarBgColor:
      process.env.SAVED_SEARCHES_PROGRESS_BG_COLOR || 'rgba(245, 158, 11, 0.2)',
    // Progress bar height (px)
    progressBarHeightPx: parseInt(
      process.env.SAVED_SEARCHES_PROGRESS_HEIGHT || '3'
    ),
    // Whether to respect reduced motion preference
    respectReducedMotion:
      process.env.SAVED_SEARCHES_RESPECT_REDUCED_MOTION !== 'false',
  },

  // SVG Stroke Dasharray Values - Flexy hates hardcoded stroke-dasharray!
  // Used for checkmark draw animations, progress rings, and loading spinners
  svg: {
    strokeDasharray: {
      // Extra small (10) - for small icons and micro indicators
      xs: parseInt(process.env.SVG_STROKE_DASHARRAY_XS || '10'),
      // Small (20) - for checkmarks and small icons
      small: parseInt(process.env.SVG_STROKE_DASHARRAY_SMALL || '20'),
      // Medium (24) - for standard checkmarks
      medium: parseInt(process.env.SVG_STROKE_DASHARRAY_MEDIUM || '24'),
      // Standard (30) - for progress indicators
      standard: parseInt(process.env.SVG_STROKE_DASHARRAY_STANDARD || '30'),
      // Large (60) - for larger animations
      large: parseInt(process.env.SVG_STROKE_DASHARRAY_LARGE || '60'),
      // Extra large (100) - for full circles and large progress rings
      xlarge: parseInt(process.env.SVG_STROKE_DASHARRAY_XLARGE || '100'),
      // Spinner values - comma-separated for dash patterns
      spinnerDash: process.env.SVG_SPINNER_DASH || '1, 150',
      spinnerGap: process.env.SVG_SPINNER_GAP || '90, 150',
    },
  },
} as const

export type AnimationConfig = typeof animationConfig
