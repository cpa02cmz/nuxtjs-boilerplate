// Easing Configuration - Centralized easing functions for consistent animations
// Flexy hates hardcoded cubic-bezier values! All easing functions are now modular.

export const easingConfig = {
  // Spring/Bounce easings - for delightful micro-interactions
  spring: {
    // Standard spring easing - bouncy but controlled
    standard: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    // Snappy spring - faster bounce
    snappy: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    // Soft spring - gentler bounce
    soft: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Material Design easings - for standard UI interactions
  material: {
    // Standard easing - smooth deceleration
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    // Decelerate - for elements entering the screen
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    // Accelerate - for elements exiting the screen
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    // Sharp - for quick interactions
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },

  // Standard CSS easings
  standard: {
    // Default ease-out - smooth stop
    easeOut: 'ease-out',
    // Default ease-in - smooth start
    easeIn: 'ease-in',
    // Default ease - smooth both ways
    ease: 'ease',
    // Linear - constant speed
    linear: 'linear',
  },

  // Custom brand easings - for product-specific feel
  brand: {
    // Premium feel - elegant deceleration
    premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
    // Playful feel - slight overshoot
    playful: 'cubic-bezier(0.34, 1.8, 0.64, 1)',
    // Smooth feel - gentle all around
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const

// Export individual easings for convenience
export const EASING = {
  // Spring easings
  SPRING_STANDARD: easingConfig.spring.standard,
  SPRING_SNAPPY: easingConfig.spring.snappy,
  SPRING_SOFT: easingConfig.spring.soft,

  // Material easings
  MATERIAL_STANDARD: easingConfig.material.standard,
  MATERIAL_DECELERATE: easingConfig.material.decelerate,
  MATERIAL_ACCELERATE: easingConfig.material.accelerate,
  MATERIAL_SHARP: easingConfig.material.sharp,

  // Standard easings
  EASE_OUT: easingConfig.standard.easeOut,
  EASE_IN: easingConfig.standard.easeIn,
  EASE: easingConfig.standard.ease,
  LINEAR: easingConfig.standard.linear,

  // Brand easings
  BRAND_PREMIUM: easingConfig.brand.premium,
  BRAND_PLAYFUL: easingConfig.brand.playful,
  BRAND_SMOOTH: easingConfig.brand.smooth,
} as const

export type EasingConfig = typeof easingConfig
export type EasingType = typeof EASING
