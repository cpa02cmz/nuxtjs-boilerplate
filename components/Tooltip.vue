<template>
  <div
    ref="triggerRef"
    class="relative inline-flex"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focusin="handleFocusIn"
    @focusout="handleFocusOut"
  >
    <slot />
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isVisible"
        :id="tooltipId"
        ref="tooltipRef"
        role="tooltip"
        :class="[
          'absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg',
          'pointer-events-none whitespace-nowrap',
          positionClasses[position],
        ]"
        @keydown.esc="hideTooltip"
      >
        {{ content }}
        <div
          :class="[
            'absolute w-2 h-2 bg-gray-900 transform rotate-45',
            arrowClasses[position],
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { animationConfig } from '~/configs/animation.config'

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

// Generate unique ID for accessibility
const uniqueId = Math.random().toString(36).substring(2, 9)
const tooltipId = computed(() => `tooltip-${uniqueId}`)

const isVisible = ref(false)
const tooltipRef = ref<HTMLDivElement | null>(null)
const triggerRef = ref<HTMLDivElement | null>(null)
let showTimeout: ReturnType<typeof setTimeout> | null = null
let hideTimeout: ReturnType<typeof setTimeout> | null = null
let autoDismissTimeout: ReturnType<typeof setTimeout> | null = null

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

const showTooltip = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
  showTimeout = setTimeout(() => {
    isVisible.value = true

    // Set up auto-dismiss if enabled
    if (props.autoDismiss > 0) {
      if (autoDismissTimeout) {
        clearTimeout(autoDismissTimeout)
      }
      autoDismissTimeout = setTimeout(() => {
        hideTooltip()
      }, props.autoDismiss)
    }
  }, props.delay)
}

const hideTooltip = () => {
  if (showTimeout) {
    clearTimeout(showTimeout)
    showTimeout = null
  }
  if (autoDismissTimeout) {
    clearTimeout(autoDismissTimeout)
    autoDismissTimeout = null
  }
  hideTimeout = setTimeout(() => {
    isVisible.value = false
  }, animationConfig.tooltip.hideDelayMs)
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
}

const handleMouseEnter = () => {
  showTooltip()
}

const handleMouseLeave = () => {
  hideTooltip()
}

const handleFocusIn = () => {
  showTooltip()
}

const handleFocusOut = () => {
  hideTooltip()
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isVisible.value) {
    hideTooltip()
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
</script>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .tooltip-enter-active,
  .tooltip-leave-active {
    transition: none;
  }
}
</style>
