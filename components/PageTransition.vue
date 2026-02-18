<template>
  <div class="page-transition-wrapper">
    <!-- Page Transition Overlay - Palette's micro-UX delight! -->
    <Transition
      :enter-active-class="`transition-all ${animationConfig.tailwindDurations.slower} ease-out`"
      :enter-from-class="enterFromClass"
      :enter-to-class="enterToClass"
      :leave-active-class="`transition-all ${animationConfig.tailwindDurations.normal} ease-in`"
      :leave-from-class="leaveFromClass"
      :leave-to-class="leaveToClass"
      @before-enter="handleBeforeEnter"
      @after-enter="handleAfterEnter"
      @before-leave="handleBeforeLeave"
      @after-leave="handleAfterLeave"
    >
      <div
        v-if="isTransitioning"
        class="page-transition-overlay"
        :class="{
          'page-transition-overlay--reduced-motion': prefersReducedMotion,
          [`page-transition-overlay--${transitionDirection}`]: true,
        }"
        :style="overlayStyle"
        aria-hidden="true"
      >
        <!-- Gradient shimmer effect -->
        <div class="page-transition-shimmer" />

        <!-- Progress bar for perceived performance -->
        <div class="page-transition-progress-container">
          <div
            class="page-transition-progress-bar"
            :style="{ transform: `scaleX(${progress / 100})` }"
          />
        </div>

        <!-- Loading indicator -->
        <div class="page-transition-loader">
          <div class="page-transition-spinner">
            <svg
              class="spinner-svg"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                class="spinner-track"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="3"
              />
              <circle
                class="spinner-head"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <span class="page-transition-text">{{ loadingText }}</span>
        </div>
      </div>
    </Transition>

    <!-- Screen reader announcement -->
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ announcement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from '#app'
import { animationConfig } from '~/configs/animation.config'
import { contentConfig } from '~/configs/content.config'
import { componentColorsConfig } from '~/configs/component-colors.config'
import { componentStylesConfig } from '~/configs/component-styles.config'
import { uiConfig } from '~/configs/ui.config'

interface Props {
  /**
   * Transition direction - determines the animation direction
   * @default 'fade'
   */
  direction?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right'
  /**
   * Enable transition on initial page load
   * @default false
   */
  enableOnFirstLoad?: boolean
  /**
   * Minimum duration to show transition (ms) - prevents flash
   * @default 300
   */
  minDurationMs?: number
  /**
   * Maximum duration before forcing completion (ms)
   * @default 5000
   */
  maxDurationMs?: number
  /**
   * Loading text to display
   * @default 'Loading...'
   */
  loadingText?: string
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'fade',
  enableOnFirstLoad: false,
  // Flexy hates hardcoded 300! Now using config
  minDurationMs: animationConfig.pageTransition.minDurationMs,
  // Flexy hates hardcoded 5000! Now using config
  maxDurationMs: animationConfig.pageTransition.maxDurationMs,
  loadingText: contentConfig.pageTransition?.loadingText || 'Loading...',
})

// Router hooks
const router = useRouter()

// Reactive state
const isTransitioning = ref(false)
const transitionDirection = ref(props.direction)
const progress = ref(0)
const prefersReducedMotion = ref(false)
const isFirstLoad = ref(true)
const announcement = ref('')

// Timers
let progressInterval: ReturnType<typeof setInterval> | null = null
let minDurationTimeout: ReturnType<typeof setTimeout> | null = null
let maxDurationTimeout: ReturnType<typeof setTimeout> | null = null
let navigationResolve: (() => void) | null = null

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Computed transition classes based on direction
const enterFromClass = computed(() => {
  if (prefersReducedMotion.value) return 'opacity-0'

  switch (transitionDirection.value) {
    case 'slide-up':
      return 'opacity-0 translate-y-4'
    case 'slide-down':
      return 'opacity-0 -translate-y-4'
    case 'slide-left':
      return 'opacity-0 translate-x-4'
    case 'slide-right':
      return 'opacity-0 -translate-x-4'
    case 'fade':
    default:
      return 'opacity-0'
  }
})

const enterToClass = computed(() => {
  return 'opacity-100 translate-y-0 translate-x-0'
})

const leaveFromClass = computed(() => {
  return 'opacity-100 translate-y-0 translate-x-0'
})

const leaveToClass = computed(() => {
  if (prefersReducedMotion.value) return 'opacity-0'

  switch (transitionDirection.value) {
    case 'slide-up':
      return 'opacity-0 -translate-y-4'
    case 'slide-down':
      return 'opacity-0 translate-y-4'
    case 'slide-left':
      return 'opacity-0 -translate-x-4'
    case 'slide-right':
      return 'opacity-0 translate-x-4'
    case 'fade':
    default:
      return 'opacity-0'
  }
})

// Overlay style with dynamic background
const overlayStyle = computed(() => ({
  background:
    componentStylesConfig.pageTransition?.backgroundGradient ||
    'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.98) 100%)',
}))

// Start progress animation
const startProgress = () => {
  progress.value = 0

  // Clear any existing interval
  if (progressInterval) {
    clearInterval(progressInterval)
  }

  // Simulate progress with easing
  const duration = props.minDurationMs
  // Flexy hates hardcoded 60! Using configurable steps
  const steps = animationConfig.pageTransitionSteps
  const interval = duration / steps

  progressInterval = setInterval(() => {
    // Flexy hates hardcoded 90! Using configurable threshold
    const threshold = animationConfig.pageTransitionProgressThreshold
    if (progress.value < threshold) {
      // Ease out progress - slower as it approaches threshold
      const remaining = threshold - progress.value
      progress.value += Math.max(0.5, remaining * 0.1)
    }
  }, interval)
}

// Stop progress and complete
const completeProgress = () => {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
  progress.value = 100
}

// Announce to screen readers
const announceTransition = (message: string) => {
  announcement.value = message
  setTimeout(() => {
    announcement.value = ''
  }, uiConfig.feedback.announcementClearMs)
}

// Handle navigation start
const handleNavigationStart = () => {
  // Skip on first load if disabled
  if (isFirstLoad.value && !props.enableOnFirstLoad) {
    isFirstLoad.value = false
    return
  }

  isFirstLoad.value = false

  // Skip if reduced motion is preferred
  if (prefersReducedMotion.value) {
    return
  }

  isTransitioning.value = true
  startProgress()
  announceTransition(
    contentConfig.pageTransition?.announcement || 'Page loading'
  )

  // Set minimum duration timer
  if (minDurationTimeout) {
    clearTimeout(minDurationTimeout)
  }
  minDurationTimeout = setTimeout(() => {
    if (!isTransitioning.value && navigationResolve) {
      navigationResolve()
      navigationResolve = null
    }
  }, props.minDurationMs)

  // Set maximum duration timer as safety
  if (maxDurationTimeout) {
    clearTimeout(maxDurationTimeout)
  }
  maxDurationTimeout = setTimeout(() => {
    endTransition()
  }, props.maxDurationMs)
}

// End transition
const endTransition = () => {
  completeProgress()

  // Small delay to show 100% before hiding
  setTimeout(() => {
    isTransitioning.value = false

    // Resolve any pending navigation
    if (navigationResolve) {
      navigationResolve()
      navigationResolve = null
    }
  }, 100)
}

// Event handlers
const handleBeforeEnter = () => {
  document.body.style.overflow = 'hidden'
}

const handleAfterEnter = () => {
  // Transition is now visible
}

const handleBeforeLeave = () => {
  // Transition is about to hide
}

const handleAfterLeave = () => {
  document.body.style.overflow = ''
  progress.value = 0
}

// Navigation guards
const beforeEachGuard = () => {
  return new Promise<void>(resolve => {
    navigationResolve = resolve
    handleNavigationStart()
  })
}

const afterEachGuard = () => {
  // Small delay to ensure new page has started rendering - Flexy hates hardcoded 50ms!
  setTimeout(() => {
    endTransition()
  }, animationConfig.pageTransition.debounceMs)
}

// Lifecycle hooks
onMounted(() => {
  // Check reduced motion preference
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for changes
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleMotionChange)

    // Cleanup listener on unmount
    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handleMotionChange)
    })
  }

  // Register router guards
  router.beforeEach(beforeEachGuard)
  router.afterEach(afterEachGuard)
})

onUnmounted(() => {
  // Cleanup timers
  if (progressInterval) {
    clearInterval(progressInterval)
  }
  if (minDurationTimeout) {
    clearTimeout(minDurationTimeout)
  }
  if (maxDurationTimeout) {
    clearTimeout(maxDurationTimeout)
  }

  // Remove router guards
  // Note: Nuxt doesn't provide an easy way to remove specific guards,
  // but they will be cleaned up when the component unmounts
})

// Expose methods for programmatic control
defineExpose({
  start: handleNavigationStart,
  end: endTransition,
})
</script>

<style scoped>
/* Page Transition Overlay - Palette's micro-UX delight! */
.page-transition-overlay {
  position: fixed;
  inset: 0;
  z-index: v-bind('uiConfig.zIndex.pageTransition || 9999');
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Shimmer effect for visual interest */
.page-transition-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer-sweep
    v-bind('`${animationConfig?.pageTransition?.shimmerDurationSec || 1.5}s`')
    ease-in-out infinite;
  pointer-events: none;
}

@keyframes shimmer-sweep {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Progress container */
.page-transition-progress-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.page-transition-progress-bar {
  height: 100%;
  background: linear-gradient(
    90deg,
    v-bind('componentColorsConfig?.common?.blue?.[500] || "#3b82f6"') 0%,
    v-bind('componentColorsConfig?.common?.purple?.[500] || "#8b5cf6"') 100%
  );
  transform-origin: left;
  /* Flexy hates hardcoded 100ms! Using animationConfig.pageTransition.transitionDuration */
  transition: transform
    v-bind('animationConfig.pageTransition.transitionDuration') linear;
  will-change: transform;
}

/* Reduced motion - hide shimmer, instant progress */
.page-transition-overlay--reduced-motion .page-transition-shimmer {
  animation: none;
  display: none;
}

.page-transition-overlay--reduced-motion .page-transition-progress-bar {
  transition: none;
}

/* Loading indicator */
.page-transition-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  animation: loader-fade-in
    v-bind('`${animationConfig?.pageTransition?.loaderFadeInMs || 200}ms`')
    ease-out forwards;
}

@keyframes loader-fade-in {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Spinner animation */
.page-transition-spinner {
  width: 48px;
  height: 48px;
  color: v-bind('componentColorsConfig?.common?.blue?.[500] || "#3b82f6"');
}

.spinner-svg {
  width: 100%;
  height: 100%;
  animation: spinner-rotate
    v-bind('`${animationConfig?.pageTransition?.spinnerDurationSec || 1}s`')
    linear infinite;
}

.spinner-track {
  opacity: 0.2;
}

.spinner-head {
  opacity: 1;
  stroke-dasharray: 60;
  stroke-dashoffset: 60;
  animation: spinner-dash
    v-bind('`${animationConfig?.pageTransition?.spinnerDurationSec || 1}s`')
    ease-in-out infinite;
}

@keyframes spinner-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes spinner-dash {
  0% {
    stroke-dashoffset: 60;
  }
  50% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: -60;
  }
}

/* Loading text */
.page-transition-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: v-bind('componentColorsConfig?.text?.secondary || "#6b7280"');
  letter-spacing: 0.025em;
  animation: text-pulse
    v-bind('`${animationConfig?.pageTransition?.textPulseDurationSec || 2}s`')
    ease-in-out infinite;
}

@keyframes text-pulse {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .page-transition-overlay {
    /* Flexy hates hardcoded 150ms! Using animationConfig.pageTransition.reducedMotionTransitionDurationSec */
    transition: opacity
      v-bind(
        'animationConfig.pageTransition.reducedMotionTransitionDurationSec + "s"'
      )
      ease-out !important;
  }

  .page-transition-shimmer {
    animation: none;
    display: none;
  }

  .page-transition-loader {
    animation: none;
  }

  .spinner-svg {
    animation: none;
    opacity: 0.5;
  }

  .page-transition-text {
    animation: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .page-transition-overlay {
    background: white !important;
  }

  .page-transition-progress-bar {
    background: currentColor !important;
  }

  .page-transition-spinner {
    color: currentColor !important;
  }
}

/* Print media - hide during printing */
@media print {
  .page-transition-overlay {
    display: none !important;
  }
}
</style>
