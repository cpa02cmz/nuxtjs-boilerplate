<template>
  <div class="error-boundary-wrapper">
    <Transition
      name="error-fade"
      @after-enter="onErrorEntered"
    >
      <div
        v-if="hasError"
        ref="errorContainer"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        class="error-boundary"
        :class="{
          'animate-error-shake': showErrorAnimation && !prefersReducedMotion,
          'animate-success-pulse':
            showSuccessAnimation && !prefersReducedMotion,
        }"
      >
        <div class="error-content">
          <div class="error-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2
            id="error-title"
            ref="errorTitle"
            class="error-title"
            tabindex="-1"
          >
            Something went wrong
          </h2>
          <p
            id="error-message"
            class="error-message"
          >
            {{ errorMessage }}
          </p>
          <div
            v-if="showDetails"
            class="error-details"
          >
            <details class="error-details-container">
              <summary class="error-details-summary">
                Error Details
              </summary>
              <pre class="error-stack">{{ errorStack }}</pre>
            </details>
          </div>
          <!-- Palette's micro-UX: Auto-retry countdown UI -->
          <div
            v-if="isAutoRetryActive && enableAutoRetry"
            class="auto-retry-container"
            @mouseenter="pauseAutoRetry"
            @mouseleave="resumeAutoRetry"
            @focusin="pauseAutoRetry"
            @focusout="resumeAutoRetry"
          >
            <!-- Countdown ring -->
            <div
              class="countdown-ring"
              :class="{ 'is-paused': isAutoRetryPaused }"
              aria-hidden="true"
            >
              <svg
                class="countdown-ring__svg"
                viewBox="0 0 40 40"
                width="40"
                height="40"
              >
                <!-- Background circle -->
                <circle
                  class="countdown-ring__bg"
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  stroke-width="3"
                />
                <!-- Progress circle -->
                <circle
                  class="countdown-ring__progress"
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  stroke-width="3"
                  :stroke-dasharray="countdownRingCircumference"
                  :stroke-dashoffset="countdownRingOffset"
                  stroke-linecap="round"
                  transform="rotate(-90 20 20)"
                />
              </svg>
              <!-- Countdown text -->
              <span class="countdown-ring__text">{{ autoRetryCountdown }}</span>
            </div>

            <!-- Auto-retry status -->
            <div class="auto-retry-status">
              <p class="auto-retry-status__text">
                {{
                  isAutoRetryPaused
                    ? contentConfig.errorBoundary.autoRetryPaused
                    : contentConfig.errorBoundary.autoRetryMessage
                }}
              </p>
              <button
                class="cancel-retry-button"
                :aria-label="contentConfig.errorBoundary.aria.cancelAutoRetry"
                @click="cancelAutoRetry"
              >
                {{ contentConfig.errorBoundary.cancelButton }}
              </button>
            </div>
          </div>

          <div class="error-actions">
            <button
              ref="retryButton"
              class="retry-button"
              :aria-label="`Retry ${fallbackComponentName || 'component'}`"
              @click="resetError"
            >
              Try Again
            </button>
            <button
              class="home-button"
              aria-label="Go to home page"
              @click="goHome"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </Transition>
    <slot v-if="!hasError" />
  </div>
</template>

<script setup lang="ts">
import {
  onErrorCaptured,
  ref,
  computed,
  nextTick,
  onMounted,
  onUnmounted,
} from 'vue'
import { logError } from '~/utils/errorLogger'
import { componentStylesConfig } from '~/configs/component-styles.config'
import { themeConfig } from '~/configs/theme.config'
import { animationConfig } from '~/configs/animation.config'
import { ROUTE_PATTERNS } from '~/configs/routes.config'
import { hapticError, hapticSuccess } from '~/utils/hapticFeedback'
import { contentConfig } from '~/configs/content.config'
import { uiTimingConfig } from '~/configs/ui-timing.config'

interface ErrorInfo {
  componentStack: string
}

interface Props {
  componentName?: string
  showDetails?: boolean
  /**
   * Enable auto-retry functionality with countdown
   * @default true
   */
  enableAutoRetry?: boolean
  /**
   * Auto-retry countdown duration in seconds
   * @default 5
   */
  autoRetryDelaySec?: number
}

const props = withDefaults(defineProps<Props>(), {
  componentName: undefined,
  showDetails: false,
  enableAutoRetry: true,
  autoRetryDelaySec: 5,
})

const error = ref<Error | null>(null)
const errorInfo = ref<ErrorInfo | null>(null)
const errorContainer = ref<HTMLDivElement | null>(null)
const retryButton = ref<HTMLButtonElement | null>(null)
const previousFocus = ref<HTMLElement | null>(null)

// Palette's micro-UX: Animation states for delightful feedback
const showErrorAnimation = ref(false)
const showSuccessAnimation = ref(false)
const prefersReducedMotion = ref(false)

// Palette's micro-UX: Auto-retry countdown state
const autoRetryCountdown = ref(0)
const isAutoRetryActive = ref(false)
const isAutoRetryPaused = ref(false)
let autoRetryInterval: ReturnType<typeof setInterval> | null = null
let autoRetryTimeout: ReturnType<typeof setTimeout> | null = null

// Computed properties for countdown ring
const countdownProgress = computed(() => {
  if (!isAutoRetryActive.value || autoRetryCountdown.value === 0) return 0
  return (autoRetryCountdown.value / props.autoRetryDelaySec) * 100
})

const countdownRingCircumference = computed(() => 2 * Math.PI * 18) // radius = 18
const countdownRingOffset = computed(() => {
  return countdownRingCircumference.value * (1 - countdownProgress.value / 100)
})

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const emit = defineEmits<{
  error: [error: Error, info: ErrorInfo]
  reset: []
}>()

const hasError = computed(() => error.value !== null)
const errorMessage = computed(
  () => error.value?.message || 'An unexpected error occurred'
)
const errorStack = computed(() => error.value?.stack || '')
const fallbackComponentName = computed(() => props.componentName || 'component')

/**
 * Save the currently focused element before showing error
 * Guarded for SSR - document is not available during server-side rendering
 */
const saveCurrentFocus = () => {
  if (typeof document !== 'undefined') {
    previousFocus.value = document.activeElement as HTMLElement
  }
}

/**
 * Restore focus to the previously focused element
 */
const restorePreviousFocus = () => {
  if (previousFocus.value && typeof previousFocus.value.focus === 'function') {
    nextTick(() => {
      previousFocus.value?.focus()
    })
  }
}

/**
 * Focus management when error boundary appears
 * Focuses the retry button for immediate keyboard access
 */
const onErrorEntered = () => {
  // Focus the retry button for immediate keyboard accessibility
  nextTick(() => {
    retryButton.value?.focus()
  })
}

/**
 * Start auto-retry countdown
 * Palette's micro-UX: Automatically retry after countdown to reduce user friction
 */
const startAutoRetry = () => {
  if (!props.enableAutoRetry || prefersReducedMotion.value) return

  // Clear any existing auto-retry
  stopAutoRetry()

  isAutoRetryActive.value = true
  isAutoRetryPaused.value = false
  autoRetryCountdown.value = props.autoRetryDelaySec

  // Update countdown every second
  autoRetryInterval = setInterval(() => {
    if (!isAutoRetryPaused.value) {
      autoRetryCountdown.value--
      if (autoRetryCountdown.value <= 0) {
        stopAutoRetry()
        performAutoRetry()
      }
    }
  }, uiTimingConfig.countdown.updateInterval)
}

/**
 * Stop auto-retry countdown
 */
const stopAutoRetry = () => {
  if (autoRetryInterval) {
    clearInterval(autoRetryInterval)
    autoRetryInterval = null
  }
  if (autoRetryTimeout) {
    clearTimeout(autoRetryTimeout)
    autoRetryTimeout = null
  }
  isAutoRetryActive.value = false
  isAutoRetryPaused.value = false
  autoRetryCountdown.value = 0
}

/**
 * Pause auto-retry (on hover/focus)
 */
const pauseAutoRetry = () => {
  if (isAutoRetryActive.value) {
    isAutoRetryPaused.value = true
  }
}

/**
 * Resume auto-retry (on mouseleave/blur)
 */
const resumeAutoRetry = () => {
  if (isAutoRetryActive.value) {
    isAutoRetryPaused.value = false
  }
}

/**
 * Perform the actual auto-retry
 */
const performAutoRetry = () => {
  // Only retry if still has error
  if (hasError.value) {
    resetError()
  }
}

/**
 * Cancel auto-retry and keep error state
 */
const cancelAutoRetry = () => {
  stopAutoRetry()
  // Announce cancellation to screen readers
  announce(contentConfig.errorBoundary.autoRetryCanceled)
}

const throwError = (err: Error, info: ErrorInfo) => {
  saveCurrentFocus()
  error.value = err
  errorInfo.value = info

  // Palette's micro-UX: Trigger haptic feedback for error
  hapticError()

  // Trigger shake animation
  showErrorAnimation.value = true
  setTimeout(() => {
    showErrorAnimation.value = false
  }, animationConfig.errorBoundary.shakeDurationMs)

  // Palette's micro-UX: Start auto-retry countdown
  startAutoRetry()

  logError(`ErrorBoundary caught error: ${err.message}`, err, 'ErrorBoundary', {
    componentStack: info.componentStack,
  })
  emit('error', err, info)
}

const resetError = () => {
  // Palette's micro-UX: Stop auto-retry if user manually retries
  stopAutoRetry()

  // Palette's micro-UX: Trigger success animation and haptic feedback
  showSuccessAnimation.value = true
  hapticSuccess()

  // Clear error after animation starts
  setTimeout(() => {
    error.value = null
    errorInfo.value = null
    showSuccessAnimation.value = false
    restorePreviousFocus()
    emit('reset')
  }, animationConfig.errorBoundary.successPulseDurationMs)
}

const goHome = () => {
  // Palette's micro-UX: Stop auto-retry when navigating away
  stopAutoRetry()
  error.value = null
  errorInfo.value = null
  restorePreviousFocus()
  // Flexy hates hardcoded routes! Use ROUTE_PATTERNS
  navigateTo(ROUTE_PATTERNS.pages.home)
}

/**
 * Announce message to screen readers
 */
const announce = (message: string) => {
  // Create temporary element for announcement
  const announcementEl = document.createElement('div')
  announcementEl.setAttribute('role', 'status')
  announcementEl.setAttribute('aria-live', 'polite')
  announcementEl.setAttribute('aria-atomic', 'true')
  announcementEl.className = 'sr-only'
  announcementEl.textContent = message
  document.body.appendChild(announcementEl)
  setTimeout(() => {
    document.body.removeChild(announcementEl)
  }, 1000)
}

onErrorCaptured((err, instance, info) => {
  throwError(err, { componentStack: info })
  return false // Prevent the error from propagating further
})

// Check reduced motion preference on mount
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for changes in reduced motion preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleChange)
  }
})

// Palette's micro-UX: Clean up auto-retry on unmount
onUnmounted(() => {
  stopAutoRetry()
})
</script>

<style scoped>
/* Flexy hates hardcoded values! Using config-bound CSS custom properties */
.error-boundary {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: v-bind('componentStylesConfig.errorBoundary.minHeight');
  padding: 1rem;
}

.error-content {
  text-align: center;
  max-width: v-bind('componentStylesConfig.errorBoundary.maxWidth');
}

.error-icon {
  margin-bottom: v-bind('componentStylesConfig.errorBoundary.iconMarginBottom');
}

.error-title {
  font-size: v-bind('componentStylesConfig.errorBoundary.titleFontSize');
  font-weight: bold;
  color: v-bind('themeConfig.errorBoundary.titleColor');
  margin-bottom: v-bind(
    'componentStylesConfig.errorBoundary.titleMarginBottom'
  );
}

.error-title:focus {
  outline: 2px solid v-bind('themeConfig.focusRing');
  outline-offset: 2px;
}

.error-message {
  color: v-bind('themeConfig.errorBoundary.messageColor');
  margin-bottom: 1.5rem;
  font-size: v-bind('componentStylesConfig.errorBoundary.messageFontSize');
}

.error-actions {
  display: flex;
  gap: v-bind('componentStylesConfig.errorBoundary.buttonGap');
  justify-content: center;
}

.retry-button,
.home-button {
  padding: v-bind('componentStylesConfig.errorBoundary.buttonPadding');
  border-radius: v-bind(
    'componentStylesConfig.errorBoundary.buttonBorderRadius'
  );
  font-size: v-bind('componentStylesConfig.errorBoundary.buttonFontSize');
  font-weight: 500;
  cursor: pointer;
  transition: all v-bind('animationConfig.cssTransitions.standardSec');
}

.retry-button:focus,
.home-button:focus {
  outline: 2px solid v-bind('themeConfig.focusRing');
  outline-offset: 2px;
}

.retry-button {
  background-color: v-bind('themeConfig.errorBoundary.primaryButtonBg');
  color: white;
  border: 1px solid v-bind('themeConfig.errorBoundary.primaryButtonBorder');
}

.retry-button:hover {
  background-color: v-bind('themeConfig.errorBoundary.primaryButtonHover');
}

.home-button {
  background-color: v-bind('themeConfig.errorBoundary.secondaryButtonBg');
  color: v-bind('themeConfig.errorBoundary.secondaryButtonText');
  border: 1px solid v-bind('themeConfig.errorBoundary.secondaryButtonBorder');
}

.home-button:hover {
  background-color: v-bind('themeConfig.errorBoundary.secondaryButtonHover');
}

/* Vue Transition classes */
.error-fade-enter-active,
.error-fade-leave-active {
  transition:
    opacity v-bind('animationConfig.errorBoundary.transitionDuration') ease,
    transform v-bind('animationConfig.errorBoundary.transitionDuration') ease;
}

.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Palette's micro-UX: Error shake animation - draws attention to errors */
.animate-error-shake {
  animation: error-shake
    v-bind('animationConfig.errorBoundary.shakeDurationMs + "ms"') ease-in-out;
}

@keyframes error-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

/* Palette's micro-UX: Success pulse animation - positive feedback on reset */
.animate-success-pulse {
  animation: success-pulse
    v-bind('animationConfig.errorBoundary.successPulseDurationMs + "ms"')
    ease-out;
}

@keyframes success-pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 20px rgba(34, 197, 94, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

/* Enhanced focus styles with animation */
.retry-button:focus-visible,
.home-button:focus-visible {
  animation: focus-pulse 2s ease-in-out infinite;
}

@keyframes focus-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.2);
  }
}

/* Palette's micro-UX: Auto-retry countdown styles */
.auto-retry-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.05) 0%,
    rgba(147, 197, 253, 0.05) 100%
  );
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.countdown-ring {
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.countdown-ring__svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.countdown-ring__bg {
  stroke: rgba(59, 130, 246, 0.2);
}

.countdown-ring__progress {
  stroke: #3b82f6;
  transition: stroke-dashoffset
    v-bind('animationConfig.cssAnimations.extendedDurationSec') linear;
}

.countdown-ring.is-paused .countdown-ring__progress {
  stroke: #f59e0b;
  animation: pulse-paused
    v-bind('animationConfig.cssAnimations.extraExtendedDurationSec') ease-in-out
    infinite;
}

@keyframes pulse-paused {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.countdown-ring__text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #3b82f6;
}

.countdown-ring.is-paused .countdown-ring__text {
  color: #f59e0b;
}

.auto-retry-status {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.auto-retry-status__text {
  font-size: 14px;
  color: #4b5563;
  margin: 0;
}

.cancel-retry-button {
  font-size: 12px;
  color: #6b7280;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
  transition: color v-bind('animationConfig.cssTransitions.normalSec') ease;
}

.cancel-retry-button:hover {
  color: #374151;
}

.cancel-retry-button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 2px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .error-fade-enter-active,
  .error-fade-leave-active {
    transition: opacity v-bind('animationConfig.cssTransitions.instantSec');
  }

  .error-fade-enter-from,
  .error-fade-leave-to {
    transform: none;
  }

  .retry-button,
  .home-button {
    transition: none;
  }

  .animate-error-shake,
  .animate-success-pulse,
  .retry-button:focus-visible,
  .home-button:focus-visible {
    animation: none !important;
  }

  /* Palette's micro-UX: Hide auto-retry in reduced motion mode */
  .auto-retry-container {
    display: none;
  }
}
</style>
