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
        'flex items-center justify-center',
        position === 'left' ? 'left-3' : 'right-3',
      ]"
      aria-hidden="true"
    >
      <!-- Glow Ring Effect - Palette's micro-UX delight! -->
      <span
        class="typing-glow-ring"
        :style="{
          width: `${glowRingSize}px`,
          height: `${glowRingSize}px`,
        }"
      />

      <!-- Animated typing dots with spring physics -->
      <span class="flex items-center gap-0.5 relative z-10">
        <span
          v-for="n in 3"
          :key="n"
          :class="['typing-dot rounded-full', color]"
          :style="{
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            animationDelay: `${(n - 1) * staggerDelay}ms`,
          }"
        />
      </span>
    </span>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { hapticLight } from '~/utils/hapticFeedback'

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
  /**
   * Enable haptic feedback when typing starts
   * @default true
   */
  hapticFeedback?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  position: 'right',
  color: 'bg-blue-500',
  dotSize: 6,
  hapticFeedback: true,
})

// Check for reduced motion preference
const prefersReducedMotion = ref(false)
const hasTriggeredHaptic = ref(false)

const checkReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Get config values
const staggerDelay = computed(
  () => animationConfig.typingIndicator.staggerDelayMs
)
const dotSize = computed(() => props.dotSize)

// Calculate glow ring size based on dot size
const glowRingSize = computed(() => props.dotSize * 5)

// Trigger haptic feedback when typing starts
watch(
  () => props.isVisible,
  newValue => {
    if (newValue && props.hapticFeedback && !hasTriggeredHaptic.value) {
      hapticLight()
      hasTriggeredHaptic.value = true
    } else if (!newValue) {
      hasTriggeredHaptic.value = false
    }
  }
)

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

<style scoped>
/* Palette's micro-UX enhancement: Glow Ring Effect
   Creates a subtle pulsing glow around the typing indicator */
.typing-glow-ring {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(59, 130, 246, 0.15) 0%,
    rgba(59, 130, 246, 0.05) 40%,
    transparent 70%
  );
  animation: glow-pulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes glow-pulse {
  0%,
  100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* Enhanced typing dots with spring physics animation */
.typing-dot {
  animation: typing-bounce 1.4s ease-in-out infinite;
  will-change: transform;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@keyframes typing-bounce {
  0%,
  80%,
  100% {
    transform: translateY(0) scale(1);
  }
  40% {
    transform: translateY(-4px) scale(1.15);
  }
}

/* Color variations for the glow effect */
.bg-blue-500 ~ .typing-glow-ring {
  background: radial-gradient(
    circle,
    rgba(59, 130, 246, 0.15) 0%,
    rgba(59, 130, 246, 0.05) 40%,
    transparent 70%
  );
}

.bg-green-500 ~ .typing-glow-ring {
  background: radial-gradient(
    circle,
    rgba(34, 197, 94, 0.15) 0%,
    rgba(34, 197, 94, 0.05) 40%,
    transparent 70%
  );
}

.bg-amber-500 ~ .typing-glow-ring {
  background: radial-gradient(
    circle,
    rgba(245, 158, 11, 0.15) 0%,
    rgba(245, 158, 11, 0.05) 40%,
    transparent 70%
  );
}

.bg-red-500 ~ .typing-glow-ring {
  background: radial-gradient(
    circle,
    rgba(239, 68, 68, 0.15) 0%,
    rgba(239, 68, 68, 0.05) 40%,
    transparent 70%
  );
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .typing-glow-ring {
    animation: none;
    opacity: 0.3;
    transform: scale(1);
  }

  .typing-dot {
    animation: none;
    opacity: 0.6;
  }
}
</style>
