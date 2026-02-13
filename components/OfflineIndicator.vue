<template>
  <Teleport to="body">
    <!-- Offline Banner -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-full"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-full"
    >
      <div
        v-if="isOffline"
        class="fixed top-0 left-0 right-0"
        :style="{ zIndex: uiConfig.zIndex.sticky }"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div
          class="bg-amber-50 border-b border-amber-200 shadow-md"
          :class="{
            'animate-pulse-subtle': !prefersReducedMotion && !wasOffline,
          }"
        >
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <!-- Animated offline icon with connection pulse - Palette's micro-UX enhancement! -->
                <div class="relative flex-shrink-0 w-8 h-8" aria-hidden="true">
                  <!-- Connection pulse rings (shown when reconnecting) -->
                  <template v-if="isReconnecting && !prefersReducedMotion">
                    <div
                      v-for="n in pulseRingCount"
                      :key="n"
                      class="connection-pulse-ring"
                      :style="{
                        animationDelay: `${(n - 1) * pulseDelayMs}ms`,
                      }"
                    />
                  </template>
                  <!-- Icon container -->
                  <div
                    class="absolute inset-0 rounded-full bg-amber-100 flex items-center justify-center"
                    :class="{
                      'animate-icon-pulse':
                        !prefersReducedMotion && !isRetrying,
                      'animate-icon-press': isRetrying && !prefersReducedMotion,
                    }"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-amber-600"
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
                </div>
                <div>
                  <p class="text-sm font-medium text-amber-900">
                    {{ contentConfig.offline.offlineTitle }}
                  </p>
                  <p class="text-xs text-amber-700">
                    {{ contentConfig.offline.offlineSubtitle }}
                  </p>
                </div>
              </div>

              <!-- Reconnecting indicator or Retry button - Palette's micro-UX enhancement! -->
              <div class="flex items-center gap-3">
                <!-- Retry button (shown when not reconnecting) -->
                <button
                  v-if="!isReconnecting"
                  ref="retryButtonRef"
                  class="retry-button group"
                  :class="{
                    'is-retrying': isRetrying,
                    'is-success': retrySuccess,
                    'is-pressed': isButtonPressed && !prefersReducedMotion,
                  }"
                  :aria-label="contentConfig.offline.aria.retryButton"
                  :disabled="isRetrying"
                  @click="handleRetry"
                  @keydown.enter.prevent="handleRetry"
                  @keydown.space.prevent="handleRetry"
                  @mousedown="isButtonPressed = true"
                  @mouseup="isButtonPressed = false"
                  @mouseleave="isButtonPressed = false"
                  @touchstart="isButtonPressed = true"
                  @touchend="isButtonPressed = false"
                >
                  <!-- Default state: Retry icon -->
                  <svg
                    v-if="!isRetrying && !retrySuccess"
                    xmlns="http://www.w3.org/2000/svg"
                    class="retry-icon"
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
                  <!-- Retrying state: Spinner -->
                  <svg
                    v-else-if="isRetrying"
                    xmlns="http://www.w3.org/2000/svg"
                    class="retry-spinner"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <!-- Success state: Checkmark -->
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    class="retry-success-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="3"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span class="retry-text">{{ retryButtonText }}</span>
                </button>

                <!-- Reconnecting spinner -->
                <div
                  v-if="isReconnecting"
                  class="flex items-center gap-2 text-xs text-amber-700"
                >
                  <svg
                    class="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>{{ contentConfig.offline.reconnectingText }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Back Online Toast -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <div
        v-if="showBackOnline"
        class="fixed top-20 left-1/2 transform -translate-x-1/2"
        :style="{ zIndex: uiConfig.zIndex.sticky }"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          class="bg-green-50 border border-green-200 rounded-full shadow-lg px-4 py-2 flex items-center gap-2"
          :class="{ 'animate-bounce-subtle': !prefersReducedMotion }"
        >
          <div
            class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-green-600 animate-check-pop"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span class="text-sm font-medium text-green-900">
            {{ contentConfig.offline.backOnlineText }}
          </span>
        </div>
      </div>
    </Transition>

    <!-- Screen reader announcement -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ announcement }}
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { uiConfig } from '~/configs/ui.config'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'
import { easingConfig } from '~/configs/easing.config'
import { shadowsConfig } from '~/configs/shadows.config'

// Reactive state
const isOffline = ref(false)
const isReconnecting = ref(false)
const showBackOnline = ref(false)
const wasOffline = ref(false)
const prefersReducedMotion = ref(false)
const announcement = ref('')

// Palette's micro-UX enhancement: Retry button state
const isRetrying = ref(false)
const retrySuccess = ref(false)
const isButtonPressed = ref(false)
const retryButtonRef = ref<HTMLButtonElement | null>(null)

// Timers
let backOnlineTimeout: ReturnType<typeof setTimeout> | null = null
let reconnectingTimeout: ReturnType<typeof setTimeout> | null = null
let retryTimeout: ReturnType<typeof setTimeout> | null = null
let retrySuccessTimeout: ReturnType<typeof setTimeout> | null = null

// Connection pulse config - Palette's micro-UX enhancement!
const pulseConfig = animationConfig.offlineConnectionPulse
const pulseRingCount = computed(() => pulseConfig.ringCount)
const pulseDelayMs = computed(() => pulseConfig.delayMs)

// Retry button text based on state
const retryButtonText = computed(() => {
  if (retrySuccess.value) {
    return contentConfig.offline.retrySuccess
  }
  if (isRetrying.value) {
    return contentConfig.offline.retryingButton
  }
  return contentConfig.offline.retryButton
})

// Check reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Trigger haptic feedback if available - Flexy hates hardcoded values!
const triggerHaptic = (
  pattern: number | number[] = uiConfig.haptics.patterns.light
): void => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

// Announce to screen readers
const announce = (message: string): void => {
  announcement.value = message
  setTimeout(() => {
    announcement.value = ''
  }, uiConfig.feedback.announcementClearMs)
}

// Handle going offline
const handleOffline = () => {
  isOffline.value = true
  wasOffline.value = true
  isReconnecting.value = false
  triggerHaptic([30, 50, 30]) // Alert pattern
  announce(contentConfig.offline.aria.offlineAlert)
}

// Handle coming back online
const handleOnline = () => {
  if (!isOffline.value) return // Wasn't offline, no need to show toast

  isOffline.value = false
  isReconnecting.value = false
  showBackOnline.value = true
  triggerHaptic(20) // Success pattern
  announce(contentConfig.offline.aria.backOnlineStatus)

  // Clear any existing timeout
  if (backOnlineTimeout) {
    clearTimeout(backOnlineTimeout)
  }

  // Auto-hide the back online message
  backOnlineTimeout = setTimeout(() => {
    showBackOnline.value = false
    wasOffline.value = false
  }, uiConfig.offlineIndicator.backOnlineTimeoutMs)
}

// Palette's micro-UX enhancement: Handle manual retry
const handleRetry = async () => {
  if (isRetrying.value) return

  // Reset success state if previously successful
  retrySuccess.value = false

  // Start retrying state
  isRetrying.value = true
  isReconnecting.value = true

  // Trigger haptic feedback
  triggerHaptic([10, 20])

  // Clear existing timeouts
  if (retryTimeout) {
    clearTimeout(retryTimeout)
  }

  // Simulate connection check with configurable delay
  retryTimeout = setTimeout(() => {
    isRetrying.value = false

    // Check if we're back online
    if (navigator.onLine) {
      // Success! Show success state briefly
      retrySuccess.value = true
      triggerHaptic([20, 30, 20]) // Success pattern

      // Clear success state after delay
      if (retrySuccessTimeout) {
        clearTimeout(retrySuccessTimeout)
      }
      retrySuccessTimeout = setTimeout(() => {
        retrySuccess.value = false
        // Trigger the actual online handler
        if (navigator.onLine) {
          handleOnline()
        }
      }, animationConfig.offlineRetry.successDurationMs)
    } else {
      // Still offline
      isReconnecting.value = false
      triggerHaptic([40]) // Error pattern
      announce(contentConfig.offline.retryFailed)
    }
  }, animationConfig.offlineRetry.spinDurationMs)
}

// Handle connection status check (for detecting reconnection attempts)
const handleConnectionChange = () => {
  const connection = (
    navigator as Navigator & { connection?: NetworkInformation }
  ).connection
  if (connection && 'effectiveType' in connection) {
    // Connection changed, might be reconnecting
    if (isOffline.value) {
      isReconnecting.value = true

      // Clear existing timeout
      if (reconnectingTimeout) {
        clearTimeout(reconnectingTimeout)
      }

      // Hide reconnecting indicator after a moment if still offline
      reconnectingTimeout = setTimeout(() => {
        if (isOffline.value) {
          isReconnecting.value = false
        }
      }, uiConfig.offlineIndicator.reconnectingTimeoutMs)
    }
  }
}

onMounted(() => {
  // Check initial state
  prefersReducedMotion.value = checkReducedMotion()
  isOffline.value = !navigator.onLine

  // Listen for online/offline events
  window.addEventListener('offline', handleOffline)
  window.addEventListener('online', handleOnline)

  // Listen for connection changes (if supported)
  const connection = (
    navigator as Navigator & { connection?: NetworkInformation }
  ).connection
  if (connection && 'addEventListener' in connection) {
    connection.addEventListener('change', handleConnectionChange)
  }

  // Listen for reduced motion preference changes
  if (typeof window.matchMedia !== 'function') return
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const handleMotionChange = (e: MediaQueryListEvent) => {
    prefersReducedMotion.value = e.matches
  }
  mediaQuery.addEventListener('change', handleMotionChange)
})

onUnmounted(() => {
  // Clean up event listeners
  window.removeEventListener('offline', handleOffline)
  window.removeEventListener('online', handleOnline)

  const connection = (
    navigator as Navigator & { connection?: NetworkInformation }
  ).connection
  if (connection && 'removeEventListener' in connection) {
    connection.removeEventListener('change', handleConnectionChange)
  }

  // Clear timeouts
  if (backOnlineTimeout) {
    clearTimeout(backOnlineTimeout)
  }
  if (reconnectingTimeout) {
    clearTimeout(reconnectingTimeout)
  }
  if (retryTimeout) {
    clearTimeout(retryTimeout)
  }
  if (retrySuccessTimeout) {
    clearTimeout(retrySuccessTimeout)
  }
})
</script>

<style scoped>
/* Subtle pulse animation for offline banner */
@keyframes pulse-subtle {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.95;
  }
}

.animate-pulse-subtle {
  animation: pulse-subtle 2s ease-in-out infinite;
}

/* Icon pulse animation */
@keyframes icon-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 v-bind('shadowsConfig.offlineIndicator.pulse');
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 8px rgba(217, 119, 6, 0);
  }
}

.animate-icon-pulse {
  animation: icon-pulse 2s ease-in-out infinite;
}

/* Icon press animation for retry button */
@keyframes icon-press {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(v-bind('animationConfig.offlineRetry.pressScale'));
  }
  100% {
    transform: scale(1);
  }
}

.animate-icon-press {
  animation: icon-press
    v-bind('`${animationConfig.offlineRetry.pressDurationMs}ms`') ease-in-out;
}

/* Bounce animation for back online toast */
@keyframes bounce-subtle {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-4px);
  }
}

.animate-bounce-subtle {
  animation: bounce-subtle v-bind('animationConfig.cssTransitions.slowerSec')
    ease-in-out;
}

/* Checkmark pop animation */
@keyframes check-pop {
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Flexy hates hardcoded values! Using configurable easing from easingConfig */
.animate-check-pop {
  animation: check-pop v-bind('animationConfig.cssTransitions.slowSec')
    v-bind(
      'easingConfig?.cubicBezier?.spring ?? "cubic-bezier(0.175, 0.885, 0.32, 1.275)"'
    );
}

/* Spinner animation */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Palette's micro-UX enhancement: Connection Pulse Animation */
/* Radar-like pulse rings emanating from the offline icon */
.connection-pulse-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid v-bind('pulseConfig?.color ?? "rgb(245, 158, 11)"');
  animation: connection-pulse v-bind('pulseConfig?.durationSec ?? "1.5s"')
    ease-out infinite;
  opacity: 0;
}

@keyframes connection-pulse {
  0% {
    transform: scale(1);
    opacity: v-bind('pulseConfig?.startOpacity ?? 0.6');
  }
  100% {
    transform: scale(v-bind('pulseConfig?.maxScale ?? 2'));
    opacity: v-bind('pulseConfig?.endOpacity ?? 0');
  }
}

/* Retry Button Styles - Palette's micro-UX enhancement! */
.retry-button {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgb(146, 64, 14); /* amber-800 */
  background-color: rgb(255, 251, 235); /* amber-50 */
  border: 1px solid rgb(251, 191, 36); /* amber-400 */
  border-radius: 9999px;
  cursor: pointer;
  transition: all v-bind('animationConfig.cssTransitions.normalSec') ease-out;
  outline: none;
  position: relative;
  overflow: hidden;
}

.retry-button:hover:not(:disabled) {
  background-color: rgb(254, 243, 199); /* amber-100 */
  border-color: rgb(245, 158, 11); /* amber-500 */
  transform: translateY(-1px);
  box-shadow: v-bind('shadowsConfig.offlineIndicatorComponent.default');
}

.retry-button:focus-visible {
  ring: 2px;
  ring-color: rgb(245, 158, 11); /* amber-500 */
  ring-offset: 1px;
}

.retry-button:active:not(:disabled),
.retry-button.is-pressed {
  transform: scale(v-bind('animationConfig?.offlineRetry?.pressScale ?? 0.95'));
  transition: transform
    v-bind('`${animationConfig?.offlineRetry?.pressDurationMs ?? 100}ms`')
    ease-out;
}

.retry-button:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

/* Success state */
.retry-button.is-success {
  background-color: rgb(220, 252, 231); /* green-100 */
  border-color: rgb(74, 222, 128); /* green-400 */
  color: rgb(22, 101, 52); /* green-800 */
}

/* Retry button icons */
.retry-icon {
  width: 0.875rem;
  height: 0.875rem;
  transition: transform v-bind('animationConfig.cssTransitions.standardSec')
    ease-out;
}

.retry-button:hover:not(:disabled) .retry-icon {
  transform: rotate(180deg);
}

.retry-spinner {
  width: 0.875rem;
  height: 0.875rem;
  animation: spin
    v-bind('`${animationConfig?.offlineRetry?.spinDurationMs ?? 1000}ms`')
    linear infinite;
}

/* Flexy hates hardcoded values! Using configurable easing from easingConfig */
.retry-success-icon {
  width: 0.875rem;
  height: 0.875rem;
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: draw-check
    v-bind('`${animationConfig?.offlineRetry?.successDurationMs ?? 400}ms`')
    v-bind(
      'easingConfig?.cubicBezier?.standard ?? "cubic-bezier(0.4, 0, 0.2, 1)"'
    )
    forwards;
}

@keyframes draw-check {
  to {
    stroke-dashoffset: 0;
  }
}

/* Retry button text */
.retry-text {
  white-space: nowrap;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse-subtle,
  .animate-icon-pulse,
  .animate-icon-press,
  .animate-bounce-subtle,
  .animate-check-pop {
    animation: none !important;
  }

  .connection-pulse-ring {
    animation: none !important;
    display: none;
  }

  .retry-button {
    transition: none;
  }

  .retry-button:hover:not(:disabled) .retry-icon {
    transform: none;
  }

  .retry-spinner {
    animation: none;
    opacity: 0.5;
  }

  .retry-success-icon {
    animation: none;
    stroke-dashoffset: 0;
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

/* High contrast mode support */
@media (prefers-contrast: high) {
  .retry-button {
    border-width: 2px;
  }

  .connection-pulse-ring {
    border-width: 3px;
  }
}
</style>
