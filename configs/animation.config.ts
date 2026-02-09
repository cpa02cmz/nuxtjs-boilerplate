// Animation Configuration - Animation Timing, Easing, and Durations
// Flexy hates hardcoded values! All animation settings are now configurable.

export const animationConfig = {
  // Timing Durations (in milliseconds)
  duration: {
    fast: parseInt(process.env.ANIMATION_DURATION_FAST_MS || '200'),
    normal: parseInt(process.env.ANIMATION_DURATION_NORMAL_MS || '300'),
    slow: parseInt(process.env.ANIMATION_DURATION_SLOW_MS || '500'),
    staggerDelay: parseInt(process.env.ANIMATION_STAGGER_DELAY || '50'),
    staggerMaxDelay: parseInt(process.env.ANIMATION_STAGGER_MAX_DELAY || '500'),
    itemStaggerDelay: parseInt(
      process.env.ANIMATION_ITEM_STAGGER_DELAY || '100'
    ),
  },

  // Easing Functions
  easing: {
    default: process.env.ANIMATION_EASING_DEFAULT || 'ease-in-out',
    bounce:
      process.env.ANIMATION_EASING_BOUNCE ||
      'cubic-bezier(0.34, 1.56, 0.64, 1)',
    elastic:
      process.env.ANIMATION_EASING_ELASTIC ||
      'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    smooth:
      process.env.ANIMATION_EASING_SMOOTH || 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Page-specific Animation Settings
  pageAnimations: {
    index: {
      staggerDelay: parseInt(process.env.PAGE_INDEX_STAGGER_DELAY || '50'),
      staggerMaxDelay: parseInt(process.env.PAGE_INDEX_STAGGER_MAX || '500'),
    },
    search: {
      staggerDelay: parseInt(process.env.PAGE_SEARCH_STAGGER_DELAY || '50'),
      staggerMaxDelay: parseInt(process.env.PAGE_SEARCH_STAGGER_MAX || '500'),
    },
  },

  // Component-specific Animation Settings
  components: {
    resourceCard: {
      transitionDuration:
        process.env.CARD_TRANSITION_DURATION || 'duration-200',
      hoverScale: parseFloat(process.env.CARD_HOVER_SCALE || '1.02'),
    },
    emptyState: {
      staggerDelay: parseInt(process.env.EMPTY_STATE_STAGGER_DELAY || '100'),
    },
  },

  // CSS Custom Properties (for runtime theming)
  cssVariables: {
    durationFast: process.env.CSS_ANIMATION_FAST || '200ms',
    durationNormal: process.env.CSS_ANIMATION_NORMAL || '300ms',
    durationSlow: process.env.CSS_ANIMATION_SLOW || '500ms',
    easingDefault: process.env.CSS_EASING_DEFAULT || 'ease-in-out',
    easingBounce:
      process.env.CSS_EASING_BOUNCE || 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const

export type AnimationConfig = typeof animationConfig
