<template>
  <Transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0 scale-75"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition-all duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-75"
  >
    <span
      v-if="isVisible && !prefersReducedMotion"
      :class="[
        'absolute top-1/2 -translate-y-1/2 pointer-events-none',
        'flex items-center gap-0.5',
        position === 'left' ? 'left-3' : 'right-3',
      ]"
      aria-hidden="true"
    >
      <!-- Animated typing dots - Palette's micro-UX delight! -->
      <span
        v-for="n in 3"
        :key="n"
        :class="['rounded-full animate-typing-bounce', color]"
        :style="{
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          animationDelay: `${(n - 1) * staggerDelay}ms`,
        }"
      />
    </span>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { animationConfig } from '~/configs/animation.config'

interface Props {
  /**
   * Whether the typing indicator is visible
   */
  isVisible: boolean
  /**
   * Position of the indicator relative to input
   * @default 'right'
   */
  position?: 'left' | 'right'
  /**
   * Color of the indicator dots
   * @default 'bg-blue-500'
   */
  color?: string
  /**
   * Size of each dot in pixels
   * @default 6
   */
  dotSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  position: 'right',
  color: 'bg-blue-500',
  dotSize: 6,
})

// Check for reduced motion preference
const prefersReducedMotion = ref(false)

const checkReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Get config values
const staggerDelay = computed(
  () => animationConfig.typingIndicator.staggerDelayMs
)
const dotSize = computed(() => props.dotSize)

// Setup and cleanup
let mediaQuery: MediaQueryList | null = null
let handleMotionChange: ((e: MediaQueryListEvent) => void) | null = null

onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for changes in reduced motion preference
  if (typeof window !== 'undefined') {
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleMotionChange)
  }
})

onUnmounted(() => {
  if (mediaQuery && handleMotionChange) {
    mediaQuery.removeEventListener('change', handleMotionChange)
  }
})
</script>
