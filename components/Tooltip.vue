<template>
  <div
    ref="triggerRef"
    class="relative inline-flex"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focusin="handleFocusIn"
    @focusout="handleFocusOut"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchCancel"
    @touchmove="handleTouchMove"
    @keydown="handleTriggerKeyDown"
  >
    <!-- Wrapper slot with aria-describedby for accessibility -->
    <div
      :aria-describedby="isVisible ? tooltipId : undefined"
      class="tooltip-trigger-wrapper"
    >
      <slot />
    </div>
    <Transition
      :enter-active-class="`transition ${animationConfig.transition.normal.class} ${animationConfig.transition.easeOut}`"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      :leave-active-class="`transition ${animationConfig.transition.fast.class} ${animationConfig.transition.easeIn}`"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isVisible"
        :id="tooltipId"
        ref="tooltipRef"
        role="tooltip"
        :class="[
          'absolute z-50 px-3 py-2 text-sm font-medium rounded-lg shadow-lg',
          'whitespace-nowrap',
          isPinned ? 'pointer-events-auto' : 'pointer-events-none',
          componentColorsConfig.tooltip.text,
          componentColorsConfig.tooltip.bg,
          positionClasses[adjustedPosition],
          isPositionTransitioning ? 'position-transitioning' : '',
        ]"
        @mouseenter="handleTooltipMouseEnter"
        @mouseleave="handleTooltipMouseLeave"
        @keydown.esc="hideTooltip(true)"
      >
        {{ content }}
        <!-- Pin indicator for keyboard users -->
        <span
          v-if="isPinned"
          class="ml-2 inline-flex items-center text-xs opacity-75"
          aria-hidden="true"
        >
          (Esc to close)
        </span>
        <div
          :class="[
            'absolute w-2 h-2 transform rotate-45',
            componentColorsConfig.tooltip.arrowBg,
            arrowClasses[adjustedPosition],
            isPositionTransitioning ? 'arrow-transitioning' : '',
          ]"
        />
      </div>
    </Transition>

    <!-- Screen reader announcement - announces tooltip content when visible -->
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
      {{ isVisible ? content : '' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { componentColorsConfig } from '~/configs/component-colors.config'
import { uiConfig } from '~/configs/ui.config'
import { generateId } from '~/utils/generateId'

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

interface Props {
  content: string
  position?: TooltipPosition
  delay?: number
  /**
   * Auto-dismiss tooltip after specified duration (in ms).
   * Set to 0 to disable auto-dismiss.
   * @default 0
   */
  autoDismiss?: number
  /**
   * Enable click-outside-to-dismiss functionality
   * @default true
   */
  closeOnClickOutside?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
  delay: animationConfig.tooltip.showDelayMs,
  autoDismiss: 0,
  closeOnClickOutside: true,
})

// Touch handling state - Palette's micro-UX enhancement for mobile!
const touchStartTime = ref(0)
const touchStartPosition = ref({ x: 0, y: 0 })
const isTouchDevice = ref(false)
let touchTimeout: ReturnType<typeof setTimeout> | null = null
// Long press duration for touch devices (ms) - Flexy hates hardcoded values!
const LONG_PRESS_DURATION = animationConfig.tooltip.longPressDurationMs

// Generate unique ID for accessibility - Flexy hates hardcoded ID generation!
const uniqueId = generateId({ prefix: 'tooltip' })
const tooltipId = computed(() => uniqueId)

const isVisible = ref(false)
const isPinned = ref(false)
const tooltipRef = ref<HTMLDivElement | null>(null)
const triggerRef = ref<HTMLDivElement | null>(null)
const adjustedPosition = ref<TooltipPosition>(props.position)
const isPositionTransitioning = ref(false)
let showTimeout: ReturnType<typeof setTimeout> | null = null
let hideTimeout: ReturnType<typeof setTimeout> | null = null
let autoDismissTimeout: ReturnType<typeof setTimeout> | null = null
let positionTransitionTimeout: ReturnType<typeof setTimeout> | null = null
let gracePeriodTimeout: ReturnType<typeof setTimeout> | null = null

// Hover intent tracking - prevents flickering when moving between trigger and tooltip
const isMouseOverTrigger = ref(false)
const isMouseOverTooltip = ref(false)

// Swipe gesture tracking for mobile
const touchStartY = ref(0)
const touchCurrentY = ref(0)
const isSwiping = ref(false)
// Minimum swipe distance to dismiss (px) - Flexy hates hardcoded values!
const SWIPE_THRESHOLD = 50

const positionClasses: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

const arrowClasses: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 -mt-1',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
  left: 'left-full top-1/2 -translate-y-1/2 -ml-1',
  right: 'right-full top-1/2 -translate-y-1/2 -mr-1',
}

/**
 * Calculates the optimal tooltip position based on viewport boundaries.
 * Prevents tooltips from being cut off at viewport edges by flipping position
 * when collision is detected.
 * Now with position memory and smooth transitions!
 */
const lastSuccessfulPosition = ref<TooltipPosition | null>(null)
const previousPosition = ref<TooltipPosition>(props.position)

const calculateOptimalPosition = () => {
  if (!tooltipRef.value || !triggerRef.value) return
  if (typeof window === 'undefined') return

  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const padding = uiConfig.tooltip.viewportPadding // Flexy hates hardcoded values!

  // Define collision checks for each position
  const collisionChecks: Record<TooltipPosition, () => boolean> = {
    top: () => tooltipRect.top < padding,
    bottom: () => tooltipRect.bottom > viewportHeight - padding,
    left: () => tooltipRect.left < padding,
    right: () => tooltipRect.right > viewportWidth - padding,
  }

  // Define fallback positions when collision occurs
  const fallbackPositions: Record<TooltipPosition, TooltipPosition> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  }

  // Use last successful position if available for consistency
  const preferredPosition = lastSuccessfulPosition.value || props.position

  if (collisionChecks[preferredPosition]()) {
    // Store current position before changing
    previousPosition.value = adjustedPosition.value

    // Try fallback position
    const fallback = fallbackPositions[preferredPosition]

    // Trigger position transition animation
    if (adjustedPosition.value !== fallback) {
      isPositionTransitioning.value = true
      if (positionTransitionTimeout) {
        clearTimeout(positionTransitionTimeout)
      }
      positionTransitionTimeout = setTimeout(() => {
        isPositionTransitioning.value = false
      }, animationConfig.tooltip.positionTransitionMs)
    }

    adjustedPosition.value = fallback
    // Remember this successful position
    lastSuccessfulPosition.value = fallback

    // Force DOM update to recalculate tooltip position
    nextTick(() => {
      if (!tooltipRef.value) return

      const fallbackTooltipRect = tooltipRef.value.getBoundingClientRect()

      // If fallback also causes collision, try other positions
      if (
        fallbackTooltipRect.top < padding ||
        fallbackTooltipRect.bottom > viewportHeight - padding ||
        fallbackTooltipRect.left < padding ||
        fallbackTooltipRect.right > viewportWidth - padding
      ) {
        // Try remaining positions in order: top, bottom, left, right
        const allPositions: TooltipPosition[] = [
          'top',
          'bottom',
          'left',
          'right',
        ]
        for (const pos of allPositions) {
          if (pos !== preferredPosition && pos !== fallback) {
            adjustedPosition.value = pos
            // Remember this successful position
            lastSuccessfulPosition.value = pos
            break
          }
        }
      }
    })
  } else {
    if (adjustedPosition.value !== preferredPosition) {
      previousPosition.value = adjustedPosition.value
      isPositionTransitioning.value = true
      if (positionTransitionTimeout) {
        clearTimeout(positionTransitionTimeout)
      }
      positionTransitionTimeout = setTimeout(() => {
        isPositionTransitioning.value = false
      }, animationConfig.tooltip.positionTransitionMs)
    }
    adjustedPosition.value = preferredPosition
    // Remember this successful position
    lastSuccessfulPosition.value = preferredPosition
  }
}

const showTooltip = (pin = false) => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
  if (gracePeriodTimeout) {
    clearTimeout(gracePeriodTimeout)
    gracePeriodTimeout = null
  }
  showTimeout = setTimeout(() => {
    isVisible.value = true
    isPinned.value = pin

    // Calculate optimal position after tooltip is rendered
    nextTick(() => {
      calculateOptimalPosition()
    })

    // Set up auto-dismiss if enabled (only when not pinned)
    if (props.autoDismiss > 0 && !pin) {
      if (autoDismissTimeout) {
        clearTimeout(autoDismissTimeout)
      }
      autoDismissTimeout = setTimeout(() => {
        hideTooltip()
      }, props.autoDismiss)
    }
  }, props.delay)
}

const hideTooltip = (immediate = false) => {
  if (showTimeout) {
    clearTimeout(showTimeout)
    showTimeout = null
  }
  if (autoDismissTimeout) {
    clearTimeout(autoDismissTimeout)
    autoDismissTimeout = null
  }
  if (immediate) {
    isVisible.value = false
    isPinned.value = false
    return
  }
  hideTimeout = setTimeout(() => {
    // Only hide if mouse is not over trigger or tooltip (hover intent)
    if (
      !isMouseOverTrigger.value &&
      !isMouseOverTooltip.value &&
      !isPinned.value
    ) {
      isVisible.value = false
    }
  }, animationConfig.tooltip.hideDelayMs)
}

/**
 * Hide with grace period - allows moving between trigger and tooltip without flickering
 */
const hideWithGracePeriod = () => {
  if (gracePeriodTimeout) {
    clearTimeout(gracePeriodTimeout)
  }
  gracePeriodTimeout = setTimeout(() => {
    if (
      !isMouseOverTrigger.value &&
      !isMouseOverTooltip.value &&
      !isPinned.value
    ) {
      hideTooltip(true)
    }
  }, animationConfig.tooltip.gracePeriodMs)
}

const clearAllTimeouts = () => {
  if (showTimeout) {
    clearTimeout(showTimeout)
    showTimeout = null
  }
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
  if (autoDismissTimeout) {
    clearTimeout(autoDismissTimeout)
    autoDismissTimeout = null
  }
  if (positionTransitionTimeout) {
    clearTimeout(positionTransitionTimeout)
    positionTransitionTimeout = null
  }
  if (gracePeriodTimeout) {
    clearTimeout(gracePeriodTimeout)
    gracePeriodTimeout = null
  }
  if (touchTimeout) {
    clearTimeout(touchTimeout)
    touchTimeout = null
  }
}

const handleMouseEnter = () => {
  // Don't show on mouse enter if touch was recently used
  if (isTouchDevice.value) return
  isMouseOverTrigger.value = true
  showTooltip()
}

const handleMouseLeave = () => {
  isMouseOverTrigger.value = false
  hideWithGracePeriod()
}

/**
 * Handle mouse enter on tooltip - keeps tooltip open when hovering over it
 */
const handleTooltipMouseEnter = () => {
  if (isTouchDevice.value) return
  isMouseOverTooltip.value = true
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
}

/**
 * Handle mouse leave on tooltip - starts grace period to hide
 */
const handleTooltipMouseLeave = () => {
  isMouseOverTooltip.value = false
  hideWithGracePeriod()
}

const handleFocusIn = () => {
  showTooltip()
}

const handleFocusOut = () => {
  hideTooltip()
}

/**
 * Handle touch start for mobile tooltip support
 * Implements long-press to show tooltip on touch devices
 */
const handleTouchStart = (event: TouchEvent) => {
  isTouchDevice.value = true
  touchStartTime.value = Date.now()
  const touch = event.touches[0]
  touchStartPosition.value = { x: touch.clientX, y: touch.clientY }
  touchStartY.value = touch.clientY
  touchCurrentY.value = touch.clientY
  isSwiping.value = false

  // Clear any existing timeout
  if (touchTimeout) {
    clearTimeout(touchTimeout)
  }

  // Set timeout to show tooltip after long press
  touchTimeout = setTimeout(() => {
    const touchDuration = Date.now() - touchStartTime.value
    if (touchDuration >= LONG_PRESS_DURATION && !isSwiping.value) {
      showTooltip()
    }
  }, LONG_PRESS_DURATION)
}

/**
 * Handle touch move - track swipe gesture for dismissing tooltip
 */
const handleTouchMove = (event: TouchEvent) => {
  if (!isVisible.value) {
    // Track if user is swiping to prevent long-press from triggering
    const touch = event.touches[0]
    const deltaY = Math.abs(touch.clientY - touchStartY.value)
    if (deltaY > 10) {
      isSwiping.value = true
    }
    return
  }

  const touch = event.touches[0]
  touchCurrentY.value = touch.clientY
  const deltaY = touchCurrentY.value - touchStartY.value

  // Detect swipe gesture to dismiss tooltip
  if (Math.abs(deltaY) > SWIPE_THRESHOLD) {
    hideTooltip(true)
    isSwiping.value = true
  }
}

/**
 * Handle touch end - hide tooltip and reset touch state
 */
const handleTouchEnd = () => {
  const touchDuration = Date.now() - touchStartTime.value

  // Clear long-press timeout
  if (touchTimeout) {
    clearTimeout(touchTimeout)
    touchTimeout = null
  }

  // Only hide if tooltip was shown via long press and not swiping
  if (touchDuration >= LONG_PRESS_DURATION && !isSwiping.value) {
    hideTooltip()
  }

  // Reset touch device flag after a delay to re-enable mouse events
  setTimeout(() => {
    isTouchDevice.value = false
    isSwiping.value = false
  }, animationConfig.tooltip.touchResetDelayMs)
}

/**
 * Handle touch cancel - clean up state
 */
const handleTouchCancel = () => {
  if (touchTimeout) {
    clearTimeout(touchTimeout)
    touchTimeout = null
  }
  hideTooltip(true)
  isTouchDevice.value = false
  isSwiping.value = false
}

/**
 * Handle keyboard events on tooltip (Escape to close)
 */
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isVisible.value) {
    hideTooltip(true)
  }
}

/**
 * Handle keyboard events on trigger element
 * Allows pinning tooltip with Enter/Space for better accessibility
 */
const handleTriggerKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    if (isVisible.value && isPinned.value) {
      // Already pinned, unpin and hide
      hideTooltip(true)
    } else if (isVisible.value) {
      // Visible but not pinned, pin it
      isPinned.value = true
      // Clear auto-dismiss when pinned
      if (autoDismissTimeout) {
        clearTimeout(autoDismissTimeout)
        autoDismissTimeout = null
      }
    } else {
      // Not visible, show and pin
      showTooltip(true)
    }
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (!props.closeOnClickOutside || !isVisible.value) return

  const target = event.target as Node
  const isClickInsideTooltip = tooltipRef.value?.contains(target)
  const isClickInsideTrigger = triggerRef.value?.contains(target)

  if (!isClickInsideTooltip && !isClickInsideTrigger) {
    hideTooltip()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  if (props.closeOnClickOutside) {
    document.addEventListener('click', handleClickOutside, { passive: true })
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('click', handleClickOutside)
  clearAllTimeouts()
})

// Expose methods for programmatic control
defineExpose({
  show: () => showTooltip(),
  hide: () => hideTooltip(true),
  pin: () => {
    if (!isVisible.value) showTooltip()
    isPinned.value = true
    if (autoDismissTimeout) {
      clearTimeout(autoDismissTimeout)
      autoDismissTimeout = null
    }
  },
  unpin: () => {
    isPinned.value = false
    hideTooltip()
  },
})
</script>

<style scoped>
/* Tooltip trigger wrapper - ensures proper display for aria-describedby */
.tooltip-trigger-wrapper {
  display: contents;
}

/* Prevent text selection during long press on touch devices */
@media (hover: none) and (pointer: coarse) {
  .tooltip-trigger-wrapper {
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }
}

/* Position transition animation - smooth repositioning when viewport collision occurs */
.position-transitioning {
  transition: all v-bind('`${animationConfig.tooltip.positionTransitionMs}ms`')
    ease-out !important;
}

.arrow-transitioning {
  transition: all v-bind('`${animationConfig.tooltip.positionTransitionMs}ms`')
    ease-out !important;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .tooltip-enter-active,
  .tooltip-leave-active {
    transition: none;
  }

  .position-transitioning,
  .arrow-transitioning {
    transition: none !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  [role='tooltip'] {
    border: 2px solid currentColor;
  }
}
</style>
