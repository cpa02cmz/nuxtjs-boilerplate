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

  // Suggestion/Filter Animations
  suggestion: {
    staggerDelayMs: parseInt(process.env.SUGGESTION_STAGGER_DELAY_MS || '100'),
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
  },

  // Search Tracking Delay
  analytics: {
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
  },

  // Form Validation Animations - Gentle feedback for validation errors
  validation: {
    // Duration of shake animation when validation fails (ms)
    shakeDurationMs: parseInt(
      process.env.VALIDATION_SHAKE_DURATION_MS || '500'
    ),
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
  },

  // Error Boundary Animations
  errorBoundary: {
    transitionDuration: process.env.ERROR_BOUNDARY_TRANSITION || '0.3s',
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
    // Easing functions
    easeOut: process.env.TRANSITION_EASE_OUT || 'ease-out',
    easeIn: process.env.TRANSITION_EASE_IN || 'ease-in',
  },

  // Floating Label Animations - Palette's micro-UX delight!
  // Creates smooth floating label transitions for form inputs
  floatingLabel: {
    // Duration of the label float animation (ms)
    durationMs: parseInt(process.env.FLOATING_LABEL_DURATION_MS || '200'),
    // CSS duration string for transitions
    durationSec: `${parseInt(process.env.FLOATING_LABEL_DURATION_MS || '200') / 1000}s`,
    // Easing function for the animation
    easing: process.env.FLOATING_LABEL_EASING || 'cubic-bezier(0.4, 0, 0.2, 1)',
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
} as const

export type AnimationConfig = typeof animationConfig
