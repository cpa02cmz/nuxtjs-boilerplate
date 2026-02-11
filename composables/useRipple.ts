// Ripple Effect Composable - Material Design Style Micro-Interaction
// Flexy hates hardcoded values! All ripple settings are configurable.

import { ref, onUnmounted } from 'vue'
import { animationConfig } from '~/configs/animation.config'

export interface RippleOptions {
  color?: string
  duration?: number
  maxRadius?: number
  centered?: boolean
}

export interface RippleInstance {
  createRipple: (event: MouseEvent | TouchEvent) => void
  cleanup: () => void
}

/**
 * Creates a ripple effect on button clicks
 * Provides delightful tactile feedback for primary actions
 *
 * @param buttonRef - Reference to the button element
 * @param options - Configuration options for the ripple
 * @returns RippleInstance with createRipple method and cleanup
 *
 * @example
 * ```vue
 * <script setup>
 * const buttonRef = ref<HTMLButtonElement>()
 * const { createRipple } = useRipple(buttonRef, { color: 'rgba(255,255,255,0.3)' })
 * </script>
 *
 * <template>
 *   <button ref="buttonRef" @click="createRipple">Click me</button>
 * </template>
 * ```
 */
export function useRipple(
  buttonRef: Ref<HTMLButtonElement | null>,
  options: RippleOptions = {}
): RippleInstance {
  // Merge options with defaults from config
  // Flexy hates hardcoded values! Using config values for ripple defaults
  const config = {
    color: options.color || animationConfig.ripple.defaultColor,
    duration:
      options.duration || animationConfig.button.feedbackDurationMs || 600,
    maxRadius: options.maxRadius || animationConfig.ripple.maxRadius || 100,
    centered: options.centered ?? false,
  }

  // Track active ripples for cleanup
  const activeRipples = ref<HTMLSpanElement[]>([])

  /**
   * Creates a ripple effect at the click position
   */
  const createRipple = (event: MouseEvent | TouchEvent) => {
    const button = buttonRef.value
    if (!button) return

    // Check for reduced motion preference
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      if (prefersReducedMotion) return
    }

    // Get click coordinates
    const rect = button.getBoundingClientRect()
    let clientX: number
    let clientY: number

    if (event.type === 'touchstart') {
      const touchEvent = event as TouchEvent
      clientX = touchEvent.touches[0]?.clientX ?? rect.left + rect.width / 2
      clientY = touchEvent.touches[0]?.clientY ?? rect.top + rect.height / 2
    } else {
      const mouseEvent = event as MouseEvent
      clientX = mouseEvent.clientX
      clientY = mouseEvent.clientY
    }

    // Calculate ripple position and size
    const size = Math.max(rect.width, rect.height)
    const x = config.centered ? rect.width / 2 : clientX - rect.left
    const y = config.centered ? rect.height / 2 : clientY - rect.top

    // Create ripple element
    const ripple = document.createElement('span')
    ripple.className = 'ripple-effect'
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background-color: ${config.color};
      pointer-events: none;
      transform: scale(0);
      animation: ripple-animation ${config.duration}ms ease-out;
      width: ${size}px;
      height: ${size}px;
      left: ${x - size / 2}px;
      top: ${y - size / 2}px;
      opacity: 1;
    `

    // Ensure button has relative positioning
    const currentPosition = window.getComputedStyle(button).position
    if (currentPosition === 'static') {
      button.style.position = 'relative'
      button.style.overflow = 'hidden'
    }

    // Add ripple to button
    button.appendChild(ripple)
    activeRipples.value.push(ripple)

    // Clean up ripple after animation
    const fadeOutStartMs =
      config.duration * animationConfig.ripple.fadeOutStartMultiplier
    const fadeOutDurationMs =
      config.duration * animationConfig.ripple.fadeOutEndMultiplier

    setTimeout(() => {
      ripple.style.opacity = '0'
      ripple.style.transition = `opacity ${fadeOutDurationMs}ms ease-out`

      setTimeout(() => {
        ripple.remove()
        const index = activeRipples.value.indexOf(ripple)
        if (index > -1) {
          activeRipples.value.splice(index, 1)
        }
      }, fadeOutDurationMs)
    }, fadeOutStartMs)
  }

  /**
   * Clean up all active ripples
   */
  const cleanup = () => {
    activeRipples.value.forEach(ripple => {
      ripple.remove()
    })
    activeRipples.value = []
  }

  // Auto-cleanup on unmount
  onUnmounted(() => {
    cleanup()
  })

  return {
    createRipple,
    cleanup,
  }
}

/**
 * Global ripple animation styles
 * Add this to your global CSS or component styles
 */
export const rippleStyles = `
@keyframes ripple-animation {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .ripple-effect {
    animation: none !important;
    display: none !important;
  }
}
`

export default useRipple
