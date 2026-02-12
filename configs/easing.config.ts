// Easing Configuration - Flexy hates hardcoded cubic-bezier values!
// Centralizes all easing functions for consistent animations across the app

export const easingConfig = {
  // Standard easing functions - CSS defaults
  standard: {
    // Default ease
    default: 'ease',
    // Linear - constant speed
    linear: 'linear',
    // Ease in - slow start
    easeIn: 'ease-in',
    // Ease out - slow end
    easeOut: 'ease-out',
    // Ease in-out - slow start and end
    easeInOut: 'ease-in-out',
  },

  // Cubic-bezier easing functions - Flexy hates magic numbers!
  // Material Design inspired easing
  cubicBezier: {
    // Standard deceleration - elements entering the screen
    // cubic-bezier(0.4, 0, 0.2, 1)
    standard: process.env.EASING_STANDARD || 'cubic-bezier(0.4, 0, 0.2, 1)',

    // Deceleration - elements exiting the screen
    // cubic-bezier(0, 0, 0.2, 1)
    decelerate: process.env.EASING_DECELERATE || 'cubic-bezier(0, 0, 0.2, 1)',

    // Acceleration - elements entering at full velocity
    // cubic-bezier(0.4, 0, 1, 1)
    accelerate: process.env.EASING_ACCELERATE || 'cubic-bezier(0.4, 0, 1, 1)',

    // Sharp - quick response
    // cubic-bezier(0.4, 0, 0.6, 1)
    sharp: process.env.EASING_SHARP || 'cubic-bezier(0.4, 0, 0.6, 1)',

    // Spring/Bounce - playful, elastic feel
    // cubic-bezier(0.175, 0.885, 0.32, 1.275)
    spring:
      process.env.EASING_SPRING || 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',

    // Bouncy - more pronounced bounce
    // cubic-bezier(0.34, 1.56, 0.64, 1)
    bouncy: process.env.EASING_BOUNCY || 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Animation timing presets
  timing: {
    // Quick feedback (button presses, small interactions)
    instant: parseInt(process.env.EASING_TIME_INSTANT || '100'),
    // Fast (hover states, quick transitions)
    fast: parseInt(process.env.EASING_TIME_FAST || '150'),
    // Normal (most UI transitions)
    normal: parseInt(process.env.EASING_TIME_NORMAL || '200'),
    // Slow (emphasis, important transitions)
    slow: parseInt(process.env.EASING_TIME_SLOW || '300'),
    // Slower (page transitions, large elements)
    slower: parseInt(process.env.EASING_TIME_SLOWER || '500'),
    // Very slow (special emphasis)
    dramatic: parseInt(process.env.EASING_TIME_DRAMATIC || '800'),
  },

  // CSS duration classes - maps timing to Tailwind classes
  durationClasses: {
    instant: 'duration-100',
    fast: 'duration-150',
    normal: 'duration-200',
    slow: 'duration-300',
    slower: 'duration-500',
    dramatic: 'duration-700',
  },

  // Animation specific easings - Flexy hates hardcoded values!
  animations: {
    // Checkmark draw animation
    checkmarkDraw: {
      durationMs: parseInt(process.env.ANIM_CHECKMARK_DRAW_MS || '400'),
      easing:
        process.env.ANIM_CHECKMARK_DRAW_EASING ||
        'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    // Checkmark pop/bounce
    checkmarkPop: {
      durationMs: parseInt(process.env.ANIM_CHECKMARK_POP_MS || '400'),
      easing:
        process.env.ANIM_CHECKMARK_POP_EASING ||
        'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    // Card entrance
    cardEnter: {
      durationMs: parseInt(process.env.ANIM_CARD_ENTER_MS || '500'),
      easing:
        process.env.ANIM_CARD_ENTER_EASING ||
        'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    // Celebration pulse
    celebrationPulse: {
      durationMs: parseInt(process.env.ANIM_CELEBRATION_MS || '600'),
      easing:
        process.env.ANIM_CELEBRATION_EASING ||
        'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    // Check bounce
    checkBounce: {
      durationMs: parseInt(process.env.ANIM_CHECK_BOUNCE_MS || '500'),
      easing:
        process.env.ANIM_CHECK_BOUNCE_EASING ||
        'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    // Bounce scale
    bounceScale: {
      durationMs: parseInt(process.env.ANIM_BOUNCE_SCALE_MS || '400'),
      easing:
        process.env.ANIM_BOUNCE_SCALE_EASING ||
        'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    // Pop animation
    pop: {
      durationMs: parseInt(process.env.ANIM_POP_MS || '400'),
      easing:
        process.env.ANIM_POP_EASING ||
        'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    // Empty state animations
    emptyState: {
      // Float animation
      float: {
        durationSec: parseFloat(process.env.ANIM_FLOAT_SEC || '3'),
        easing: process.env.ANIM_FLOAT_EASING || 'ease-in-out',
        distancePx: parseInt(process.env.ANIM_FLOAT_DISTANCE || '6'),
      },
      // Heartbeat animation
      heartbeat: {
        durationSec: parseFloat(process.env.ANIM_HEARTBEAT_SEC || '2'),
        easing: process.env.ANIM_HEARTBEAT_EASING || 'ease-in-out',
        scaleFactor: parseFloat(process.env.ANIM_HEARTBEAT_SCALE || '1.05'),
      },
      // Slow pulse
      pulseSlow: {
        durationSec: parseFloat(process.env.ANIM_PULSE_SLOW_SEC || '4'),
        easing: process.env.ANIM_PULSE_SLOW_EASING || 'ease-in-out',
        opacityStart: parseFloat(process.env.ANIM_PULSE_OPACITY_START || '0.6'),
        opacityEnd: parseFloat(process.env.ANIM_PULSE_OPACITY_END || '0.8'),
        scaleStart: parseFloat(process.env.ANIM_PULSE_SCALE_START || '1'),
        scaleEnd: parseFloat(process.env.ANIM_PULSE_SCALE_END || '1.02'),
      },
      // Sparkle animation
      sparkle: {
        durationSec: parseFloat(process.env.ANIM_SPARKLE_SEC || '3'),
        easing: process.env.ANIM_SPARKLE_EASING || 'ease-in-out',
        delaySec: parseFloat(process.env.ANIM_SPARKLE_DELAY || '1.5'),
        opacityStart: parseFloat(
          process.env.ANIM_SPARKLE_OPACITY_START || '0.4'
        ),
        opacityEnd: parseFloat(process.env.ANIM_SPARKLE_OPACITY_END || '1'),
        scaleStart: parseFloat(process.env.ANIM_SPARKLE_SCALE_START || '0.8'),
        scaleEnd: parseFloat(process.env.ANIM_SPARKLE_SCALE_END || '1.2'),
        rotationStart: parseInt(process.env.ANIM_SPARKLE_ROTATION_START || '0'),
        rotationEnd: parseInt(process.env.ANIM_SPARKLE_ROTATION_END || '180'),
      },
    },
    // Form shake (validation error)
    formShake: {
      durationMs: parseInt(process.env.ANIM_FORM_SHAKE_MS || '500'),
      easing: process.env.ANIM_FORM_SHAKE_EASING || 'ease-in-out',
    },
    // Box shadow transition
    boxShadow: {
      durationSec: parseFloat(process.env.ANIM_BOX_SHADOW_SEC || '0.2'),
      easing: process.env.ANIM_BOX_SHADOW_EASING || 'ease-out',
    },
  },
} as const

// Convenience exports for commonly used easing values
export const EASING = easingConfig.cubicBezier

export type EasingConfig = typeof easingConfig
