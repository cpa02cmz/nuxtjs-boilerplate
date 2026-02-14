<template>
  <div
    class="client-error-boundary"
    :class="{
      'client-error-boundary--initialized': isInitialized,
      'client-error-boundary--has-error': hasError,
    }"
  >
    <!-- Loading State - Palette's micro-UX delight! -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="!isInitialized && showLoading"
        class="client-error-boundary__loading"
        role="status"
        aria-label="Initializing error boundary"
      >
        <!-- Shimmer effect for loading state -->
        <div
          v-if="!prefersReducedMotion"
          class="loading-shimmer"
          aria-hidden="true"
        >
          <div class="loading-shimmer__ring" />
        </div>
        <div
          v-else
          class="loading-simple"
          aria-hidden="true"
        >
          <div class="loading-simple__dot" />
        </div>
        <span class="sr-only">Loading...</span>
      </div>
    </Transition>

    <!-- Error State Visualization - Palette's micro-UX delight! -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-2"
    >
      <div
        v-if="hasError"
        class="error-indicator"
        :class="{ 'error-indicator--pulse': !prefersReducedMotion }"
        role="alert"
        aria-live="polite"
      >
        <!-- Animated error icon -->
        <div
          class="error-indicator__icon"
          :class="{ 'animate-error-icon': !prefersReducedMotion }"
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <span class="error-indicator__text">{{ errorMessage }}</span>

        <!-- Retry Button with spring physics - Palette's micro-UX delight! -->
        <button
          type="button"
          class="error-indicator__retry"
          :class="{
            'is-hovered': isRetryHovered,
            'is-pressed': isRetryPressed,
          }"
          :aria-label="retryLabel"
          @click="handleRetry"
          @mouseenter="isRetryHovered = true"
          @mouseleave="isRetryHovered = false"
          @mousedown="isRetryPressed = true"
          @mouseup="isRetryPressed = false"
          @keydown.enter.prevent="handleRetry"
          @keydown.space.prevent="handleRetry"
        >
          <span class="retry-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              :class="['h-4 w-4', isRetryHovered && 'rotate-180']"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </span>
          <span class="retry-text">{{ contentConfig.errors.retry }}</span>
        </button>
      </div>
    </Transition>

    <ClientOnly>
      <ErrorBoundary
        ref="errorBoundaryRef"
        :component-name="componentName"
        :show-details="showDetails"
        @error="handleError"
        @reset="handleReset"
      >
        <!-- Fade-in slot content - Palette's micro-UX delight! -->
        <Transition
          enter-active-class="transition-all duration-500 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          appear
        >
          <div
            v-show="isInitialized"
            class="client-error-boundary__content"
          >
            <slot />
          </div>
        </Transition>
      </ErrorBoundary>
    </ClientOnly>

    <!-- Screen reader announcement -->
    <div
      class="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ announcementText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import ErrorBoundary from './ErrorBoundary.vue'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'
import { hapticSuccess, hapticError } from '~/utils/hapticFeedback'

interface Props {
  componentName?: string
  showDetails?: boolean
  /**
   * Show loading state during initialization
   * @default true
   */
  showLoading?: boolean
  /**
   * Delay before marking as initialized (ms)
   * @default 300
   */
  initDelayMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  componentName: undefined,
  showDetails: false,
  showLoading: true,
  initDelayMs: 300,
})

const emit = defineEmits<{
  error: [error: Error, info: { componentStack: string }]
  reset: []
}>()

// Palette's micro-UX state management
const isInitialized = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const isRetryHovered = ref(false)
const isRetryPressed = ref(false)
const prefersReducedMotion = ref(false)
const announcementText = ref('')
const errorBoundaryRef = ref<InstanceType<typeof ErrorBoundary> | null>(null)

// Track initialization timeout
let initTimeout: ReturnType<typeof setTimeout> | null = null

// Computed retry label for accessibility
const retryLabel = computed(() => {
  return contentConfig.errors.retryAria || 'Retry loading component'
})

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Announce to screen readers - Flexy hates hardcoded values!
const announce = (message: string) => {
  announcementText.value = message
  setTimeout(() => {
    announcementText.value = ''
  }, animationConfig.microInteractions.announcementDelayMs)
}

// Handle error from ErrorBoundary with micro-UX enhancements
const handleError = (err: Error, info: { componentStack: string }) => {
  hasError.value = true
  errorMessage.value =
    contentConfig.errors.componentError || 'Component error occurred'

  // Trigger haptic feedback for mobile users
  if (!prefersReducedMotion.value) {
    hapticError()
  }

  // Announce to screen readers
  announce(`${errorMessage.value}. Press Enter to retry.`)

  // Emit to parent
  emit('error', err, info)
}

// Handle reset with micro-UX enhancements
const handleReset = () => {
  hasError.value = false
  errorMessage.value = ''

  // Trigger haptic feedback
  if (!prefersReducedMotion.value) {
    hapticSuccess()
  }

  // Announce to screen readers
  announce(contentConfig.errors.resetSuccess || 'Component reset successfully')

  // Emit to parent
  emit('reset')
}

// Handle retry with visual feedback
const handleRetry = () => {
  // Reset pressed state
  isRetryPressed.value = false

  // Trigger haptic feedback
  if (!prefersReducedMotion.value) {
    hapticSuccess()
  }

  // Reset error state
  handleReset()
}

// Lifecycle hooks
onMounted(() => {
  // Check reduced motion preference
  prefersReducedMotion.value = checkReducedMotion()

  // Delay initialization for smooth fade-in animation
  // Flexy hates hardcoded values! Using configurable delay
  initTimeout = setTimeout(() => {
    isInitialized.value = true
  }, props.initDelayMs)
})

onUnmounted(() => {
  // Cleanup timeout
  if (initTimeout) {
    clearTimeout(initTimeout)
  }
})
</script>

<style scoped>
/* Client Error Boundary Base Styles - Flexy hates hardcoded values! */
.client-error-boundary {
  position: relative;
  transition: all v-bind('animationConfig.cssTransitions.normalSec') ease-out;
}

/* Initialized state - smooth appearance */
.client-error-boundary--initialized {
  opacity: 1;
}

/* Error state - subtle visual indicator */
.client-error-boundary--has-error {
  border-radius: 0.375rem;
}

/* Loading State - Palette's micro-UX delight! */
.client-error-boundary__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 100px;
}

/* Shimmer loading effect */
.loading-shimmer {
  position: relative;
  width: 40px;
  height: 40px;
}

.loading-shimmer__ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #3b82f6;
  border-right-color: #3b82f6;
  animation: shimmer-spin 1s linear infinite;
}

@keyframes shimmer-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Simple loading for reduced motion */
.loading-simple {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-simple__dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #9ca3af;
  opacity: 0.6;
}

/* Error Indicator - Palette's micro-UX delight! */
.error-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #991b1b;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.error-indicator--pulse {
  animation: error-pulse 2s ease-in-out 3;
}

@keyframes error-pulse {
  0%,
  100% {
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }
  50% {
    box-shadow: 0 0 0 3px #fecaca;
  }
}

/* Animated error icon */
.error-indicator__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #ef4444;
}

.animate-error-icon {
  animation: error-icon-shake 0.5s ease-in-out;
}

@keyframes error-icon-shake {
  0%,
  100% {
    transform: rotate(0deg);
  }
  20% {
    transform: rotate(-10deg);
  }
  40% {
    transform: rotate(10deg);
  }
  60% {
    transform: rotate(-5deg);
  }
  80% {
    transform: rotate(5deg);
  }
}

.error-indicator__text {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Retry Button - Palette's micro-UX delight with spring physics! */
.error-indicator__retry {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background-color: white;
  border: 1px solid #fca5a5;
  border-radius: 0.375rem;
  color: #b91c1c;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all v-bind('animationConfig.cssTransitions.quickSec') ease-out;
  outline: none;
}

.error-indicator__retry:hover,
.error-indicator__retry.is-hovered {
  background-color: #fef2f2;
  border-color: #f87171;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-indicator__retry:active,
.error-indicator__retry.is-pressed {
  transform: scale(0.95);
  transition: transform v-bind('animationConfig.cssTransitions.ultraFastSec')
    ease-out;
}

.error-indicator__retry:focus-visible {
  outline: 2px solid #ef4444;
  outline-offset: 2px;
}

.retry-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform v-bind('animationConfig.cssTransitions.normalSec')
    ease-out;
}

.retry-icon svg {
  transition: transform v-bind('animationConfig.cssTransitions.normalSec')
    ease-out;
}

.retry-text {
  white-space: nowrap;
}

/* Content wrapper */
.client-error-boundary__content {
  will-change: opacity, transform;
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

/* Reduced motion support - Palette cares about accessibility! */
@media (prefers-reduced-motion: reduce) {
  .client-error-boundary,
  .error-indicator,
  .error-indicator__retry {
    transition: none !important;
    animation: none !important;
  }

  .loading-shimmer__ring {
    animation: none;
    opacity: 0.5;
  }

  .error-indicator--pulse {
    animation: none;
  }

  .animate-error-icon {
    animation: none;
  }

  .retry-icon svg {
    transition: none;
  }

  .error-indicator__retry:hover,
  .error-indicator__retry.is-hovered {
    transform: none;
  }

  .error-indicator__retry:active,
  .error-indicator__retry.is-pressed {
    transform: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .error-indicator {
    border-width: 2px;
  }

  .error-indicator__retry {
    border-width: 2px;
  }
}
</style>
