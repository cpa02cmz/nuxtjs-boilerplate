// Magnetic Button Effect Composable - Premium Micro-UX Interaction
// Creates a subtle "magnetic" pull effect that draws the button toward the cursor
// Palette's micro-UX delight! 🧲

import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  type Ref,
  type ComputedRef,
} from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { EASING } from '~/configs/easing.config'

export interface MagneticOptions {
  /** Strength of the magnetic pull (0-1, where 1 is strongest) */
  strength?: number
  /** Maximum distance the button can move (pixels) */
  maxDistancePx?: number
  /** Duration of the return animation when mouse leaves (ms) */
  returnDurationMs?: number
  /** Whether to apply the effect */
  enabled?: boolean
}

export interface MagneticInstance {
  /** Reference to bind to the target element */
  elementRef: Ref<HTMLElement | null>
  /** Current transform style to apply */
  transformStyle: ComputedRef<{ transform: string }>
  /** Whether the magnetic effect is currently active */
  isActive: Ref<boolean>
  /** Manually disable the effect */
  disable: () => void
  /** Manually enable the effect */
  enable: () => void
}

/**
 * Creates a magnetic button effect that pulls the element toward the cursor
 * Provides a premium, tactile feel to button interactions
 *
 * @param options - Configuration options for the magnetic effect
 * @returns MagneticInstance with refs and controls
 *
 * @example
 * ```vue
 * <script setup>
 * const { elementRef, transformStyle } = useMagneticButton({
 *   strength: 0.4,
 *   maxDistancePx: 12
 * })
 * </script>
 *
 * <template>
 *   <button
 *     ref="elementRef"
 *     :style="transformStyle"
 *     class="magnetic-button"
 *   >
 *     Hover me!
 *   </button>
 * </template>
 * ```
 */
export function useMagneticButton(options: MagneticOptions = {}) {
  // Merge options with defaults from config
  const config = {
    strength: options.strength ?? animationConfig.magneticButton.strength,
    maxDistancePx:
      options.maxDistancePx ?? animationConfig.magneticButton.maxDistancePx,
    returnDurationMs:
      options.returnDurationMs ??
      animationConfig.magneticButton.returnDurationMs,
    enabled: options.enabled ?? true,
  }

  const elementRef = ref<HTMLElement | null>(null)
  const isActive = ref(false)
  const translateX = ref(0)
  const translateY = ref(0)
  const isHovering = ref(false)

  // Check for reduced motion preference
  const checkReducedMotion = () => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    )
      return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  // Calculate magnetic pull based on mouse position
  const calculateMagneticPull = (event: MouseEvent) => {
    const element = elementRef.value
    if (!element || !config.enabled || checkReducedMotion()) return

    const rect = element.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Calculate distance from mouse to center
    const distanceX = event.clientX - centerX
    const distanceY = event.clientY - centerY

    // Calculate pull strength based on distance (closer = stronger pull)
    const maxDistance = Math.max(rect.width, rect.height)
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
    const pullStrength =
      Math.max(0, 1 - distance / maxDistance) * config.strength

    // Apply magnetic pull
    const targetX = distanceX * pullStrength
    const targetY = distanceY * pullStrength

    // Clamp to max distance
    const clampedX = Math.max(
      -config.maxDistancePx,
      Math.min(config.maxDistancePx, targetX)
    )
    const clampedY = Math.max(
      -config.maxDistancePx,
      Math.min(config.maxDistancePx, targetY)
    )

    translateX.value = clampedX
    translateY.value = clampedY
    isActive.value = true
  }

  // Reset position when mouse leaves
  const handleMouseLeave = () => {
    isHovering.value = false
    translateX.value = 0
    translateY.value = 0
    isActive.value = false
  }

  // Handle mouse enter
  const handleMouseEnter = () => {
    isHovering.value = true
  }

  // Computed transform style
  const transformStyle = computed(() => {
    if (!isActive.value && translateX.value === 0 && translateY.value === 0) {
      return { transform: '' }
    }

    const transition = isHovering.value
      ? `transform ${animationConfig.transition.fast.durationMs}ms ${EASING.EASE_OUT}`
      : `transform ${config.returnDurationMs}ms ${EASING.SPRING_SNAPPY}`

    return {
      transform: `translate(${translateX.value}px, ${translateY.value}px)`,
      transition,
    }
  })

  // Event listeners
  let mouseMoveHandler: ((e: MouseEvent) => void) | null = null

  onMounted(() => {
    const element = elementRef.value
    if (!element || !config.enabled) return

    // Don't apply if reduced motion is preferred
    if (checkReducedMotion()) return

    mouseMoveHandler = (e: MouseEvent) => {
      if (isHovering.value) {
        calculateMagneticPull(e)
      }
    }

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mousemove', mouseMoveHandler)
  })

  onUnmounted(() => {
    const element = elementRef.value
    if (element) {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
    if (mouseMoveHandler) {
      document.removeEventListener('mousemove', mouseMoveHandler)
    }
  })

  // Control methods
  const disable = () => {
    config.enabled = false
    handleMouseLeave()
  }

  const enable = () => {
    config.enabled = true
  }

  return {
    elementRef,
    transformStyle,
    isActive,
    disable,
    enable,
  }
}

export default useMagneticButton
