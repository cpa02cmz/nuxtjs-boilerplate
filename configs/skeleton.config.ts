// Skeleton Configuration - All Skeleton Loading Colors and Values
// Flexy hates hardcoded values! All skeleton settings are now configurable.

export const skeletonConfig = {
  // Light mode skeleton colors - Flexy hates hardcoded hex codes!
  light: {
    // Main skeleton gradient colors
    main: {
      start: process.env.SKELETON_LIGHT_START || '#e5e7eb',
      middle: process.env.SKELETON_LIGHT_MIDDLE || '#f3f4f6',
      end: process.env.SKELETON_LIGHT_END || '#e5e7eb',
    },
    // Icon skeleton gradient colors
    icon: {
      start: process.env.SKELETON_ICON_START || '#d1d5db',
      middle: process.env.SKELETON_ICON_MIDDLE || '#e5e7eb',
      end: process.env.SKELETON_ICON_END || '#d1d5db',
    },
    // Reduced motion fallback colors
    reducedMotion: {
      main: process.env.SKELETON_REDUCED_MAIN || '#e5e7eb',
      icon: process.env.SKELETON_REDUCED_ICON || '#d1d5db',
    },
  },

  // Dark mode skeleton colors
  dark: {
    // Main skeleton gradient colors
    main: {
      start: process.env.SKELETON_DARK_START || '#374151',
      middle: process.env.SKELETON_DARK_MIDDLE || '#4b5563',
      end: process.env.SKELETON_DARK_END || '#374151',
    },
    // Icon skeleton gradient colors
    icon: {
      start: process.env.SKELETON_DARK_ICON_START || '#4b5563',
      middle: process.env.SKELETON_DARK_ICON_MIDDLE || '#6b7280',
      end: process.env.SKELETON_DARK_ICON_END || '#4b5563',
    },
    // Reduced motion fallback colors
    reducedMotion: {
      main: process.env.SKELETON_DARK_REDUCED_MAIN || '#374151',
      icon: process.env.SKELETON_DARK_REDUCED_ICON || '#4b5563',
    },
  },

  // High contrast mode colors
  highContrast: {
    main: process.env.SKELETON_HIGH_CONTRAST_MAIN || '#767676',
    icon: process.env.SKELETON_HIGH_CONTRAST_ICON || '#595959',
  },

  // Animation timing - already in animation.config.ts, but keeping for reference
  timing: {
    shimmerDurationSec: parseFloat(
      process.env.SKELETON_SHIMMER_DURATION_SEC || '1.5'
    ),
    pulseDurationSec: parseFloat(
      process.env.SKELETON_PULSE_DURATION_SEC || '2'
    ),
    waveDurationSec: parseFloat(process.env.SKELETON_WAVE_DURATION_SEC || '2'),
    waveStaggerSec: parseFloat(process.env.SKELETON_WAVE_STAGGER_SEC || '0.08'),
    cardEnterDurationSec: parseFloat(
      process.env.SKELETON_CARD_ENTER_DURATION_SEC || '0.3'
    ),
    reducedMotionEnterDurationSec: parseFloat(
      process.env.SKELETON_REDUCED_MOTION_ENTER_DURATION_SEC || '0.2'
    ),
    hoverTransitionSec: parseFloat(
      process.env.SKELETON_HOVER_TRANSITION_SEC || '0.3'
    ),
    staggerDelayMs: parseInt(process.env.SKELETON_STAGGER_DELAY_MS || '0'),
    staggerIncrementMs: parseInt(
      process.env.SKELETON_STAGGER_INCREMENT_MS || '75'
    ),
  },

  // Visual effects
  effects: {
    // Hover brightness adjustment
    hoverBrightness: parseFloat(
      process.env.SKELETON_HOVER_BRIGHTNESS || '1.05'
    ),
    hoverSaturate: parseFloat(process.env.SKELETON_HOVER_SATURATE || '1.1'),
    // Icon hover scale
    iconHoverScale: parseFloat(process.env.SKELETON_ICON_HOVER_SCALE || '1.08'),
    // Box shadow opacity
    shadowOpacity: parseFloat(process.env.SKELETON_SHADOW_OPACITY || '0.1'),
    shadowOpacitySm: parseFloat(
      process.env.SKELETON_SHADOW_OPACITY_SM || '0.05'
    ),
  },

  // Icon pulse effect
  iconPulse: {
    boxShadowStartOpacity: parseFloat(
      process.env.SKELETON_ICON_PULSE_START_OPACITY || '0.4'
    ),
    boxShadowEndSpread: parseInt(
      process.env.SKELETON_ICON_PULSE_END_SPREAD || '4'
    ),
    boxShadowColor: process.env.SKELETON_ICON_PULSE_COLOR || '209, 213, 219',
  },
} as const

export type SkeletonConfig = typeof skeletonConfig
