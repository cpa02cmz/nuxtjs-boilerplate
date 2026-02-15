<template>
  <Transition
    :enter-active-class="`transition-all ${animationConfig.tailwindDurations.normal} ease-out`"
    enter-from-class="opacity-0 scale-75"
    enter-to-class="opacity-100 scale-100"
    :leave-active-class="`transition-all ${animationConfig.tailwindDurations.quick} ease-in`"
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

      <!-- Sound Wave Mode - Palette's micro-UX enhancement for voice input! 🎨 -->
      <span
        v-if="mode === 'soundwave'"
        class="soundwave-container relative z-10"
        :style="{ height: `${soundwaveHeight}px` }"
      >
        <span
          v-for="n in soundwaveBars"
          :key="n"
          class="soundwave-bar rounded-full"
          :class="color"
          :style="{
            width: `${soundwaveBarWidth}px`,
            animationDelay: `${(n - 1) * soundwaveStaggerDelay}ms`,
            '--bar-index': n,
          }"
        />
      </span>

      <!-- Animated typing dots with spring physics -->
      <span v-else class="flex items-center gap-0.5 relative z-10">
        <!-- Flexy hates hardcoded 3! Using config instead -->
        <span
          v-for="n in animationConfig.typingIndicator.dotCount"
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
import { componentColorsConfig } from '~/configs/component-colors.config'
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
  /**
   * Display mode - 'dots' for typing, 'soundwave' for voice/audio input
   * @default 'dots'
   */
  mode?: 'dots' | 'soundwave'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'right',
  color: 'bg-blue-500',
  dotSize: 6,
  hapticFeedback: true,
  mode: 'dots',
})

// Check for reduced motion preference
const prefersReducedMotion = ref(false)
const hasTriggeredHaptic = ref(false)

const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Get config values
const staggerDelay = computed(
  () => animationConfig.typingIndicator.staggerDelayMs
)
const dotSize = computed(() => props.dotSize)

// Calculate glow ring size based on dot size
const glowRingSize = computed(() => props.dotSize * 5)

// Palette's micro-UX enhancement: Sound wave configuration
const soundwaveConfig = computed(
  () => animationConfig.typingIndicator.soundwave
)
const soundwaveBars = computed(() => soundwaveConfig.value.barCount)
const soundwaveBarWidth = computed(() => soundwaveConfig.value.barWidthPx)
const soundwaveHeight = computed(() => soundwaveConfig.value.heightPx)
const soundwaveStaggerDelay = computed(
  () => soundwaveConfig.value.staggerDelayMs
)

// Flexy hates hardcoded rgba! Using configurable color values
const shadowColorDefault = computed(
  () => componentColorsConfig.shadows.light.default
)
const blueColor = computed(() => componentColorsConfig.common.blue[500])
const greenColor = computed(() => componentColorsConfig.common.green[500])
const amberColor = computed(() => componentColorsConfig.common.amber[500])
const redColor = computed(() => componentColorsConfig.common.red[500])

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
   Creates a subtle pulsing glow around the typing indicator
   Flexy hates hardcoded rgba - now using configurable colors! */
.typing-glow-ring {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(v-bind('blueColor'), 0.15) 0%,
    rgba(v-bind('blueColor'), 0.05) 40%,
    transparent 70%
  );
  animation: glow-pulse
    v-bind(
      'animationConfig?.typingIndicator?.glowPulseDurationSec + "s" || "2s"'
    )
    ease-in-out infinite;
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

/* Enhanced typing dots with spring physics animation - Flexy hates hardcoded rgba! */
.typing-dot {
  animation: typing-bounce
    v-bind(
      '`${(animationConfig?.typingIndicator?.bounceDurationMs || 600) * 2.33 / 1000}s`'
    )
    ease-in-out infinite;
  will-change: transform;
  box-shadow: 0 2px 4px rgba(v-bind('shadowColorDefault'), 0.1);
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

/* Color variations for the glow effect - Flexy hates hardcoded rgba values! */
/* Blue glow - using configurable RGB values */
.bg-blue-500 ~ .typing-glow-ring {
  background: radial-gradient(
    circle,
    rgba(v-bind('blueColor'), 0.15) 0%,
    rgba(v-bind('blueColor'), 0.05) 40%,
    transparent 70%
  );
}

/* Green glow - using configurable RGB values */
.bg-green-500 ~ .typing-glow-ring {
  background: radial-gradient(
    circle,
    rgba(v-bind('greenColor'), 0.15) 0%,
    rgba(v-bind('greenColor'), 0.05) 40%,
    transparent 70%
  );
}

/* Amber glow - using configurable RGB values */
.bg-amber-500 ~ .typing-glow-ring {
  background: radial-gradient(
    circle,
    rgba(v-bind('amberColor'), 0.15) 0%,
    rgba(v-bind('amberColor'), 0.05) 40%,
    transparent 70%
  );
}

/* Red glow - using configurable RGB values */
.bg-red-500 ~ .typing-glow-ring {
  background: radial-gradient(
    circle,
    rgba(v-bind('redColor'), 0.15) 0%,
    rgba(v-bind('redColor'), 0.05) 40%,
    transparent 70%
  );
}

/* Palette's micro-UX enhancement: Sound Wave Animation 🎨
   Animated bars for voice/audio input feedback */
.soundwave-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: v-bind('soundwaveConfig.gapPx + "px"');
}

.soundwave-bar {
  height: 100%;
  animation: soundwave-pulse v-bind('soundwaveConfig.durationSec + "s"')
    ease-in-out infinite;
  animation-delay: calc(
    var(--bar-index) * v-bind('soundwaveConfig.staggerDelaySec + "s"')
  );
  transform-origin: center;
  will-change: transform, opacity;
}

@keyframes soundwave-pulse {
  0%,
  100% {
    transform: scaleY(v-bind('soundwaveConfig.minScale'));
    opacity: v-bind('soundwaveConfig.minOpacity');
  }
  50% {
    transform: scaleY(v-bind('soundwaveConfig.maxScale'));
    opacity: v-bind('soundwaveConfig.maxOpacity');
  }
}

/* Enhanced sound wave with color-specific glow effects */
.soundwave-bar.bg-blue-500 {
  box-shadow: 0 0 v-bind('soundwaveConfig.glowBlurPx + "px"')
    rgba(v-bind('blueColor'), v-bind('soundwaveConfig.glowOpacity'));
}

.soundwave-bar.bg-green-500 {
  box-shadow: 0 0 v-bind('soundwaveConfig.glowBlurPx + "px"')
    rgba(v-bind('greenColor'), v-bind('soundwaveConfig.glowOpacity'));
}

.soundwave-bar.bg-amber-500 {
  box-shadow: 0 0 v-bind('soundwaveConfig.glowBlurPx + "px"')
    rgba(v-bind('amberColor'), v-bind('soundwaveConfig.glowOpacity'));
}

.soundwave-bar.bg-red-500 {
  box-shadow: 0 0 v-bind('soundwaveConfig.glowBlurPx + "px"')
    rgba(v-bind('redColor'), v-bind('soundwaveConfig.glowOpacity'));
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

  /* Palette cares about accessibility: Disable sound wave animation for reduced motion */
  .soundwave-bar {
    animation: none;
    opacity: v-bind('soundwaveConfig.reducedMotionOpacity');
    transform: scaleY(v-bind('soundwaveConfig.reducedMotionScale'));
  }
}
</style>
