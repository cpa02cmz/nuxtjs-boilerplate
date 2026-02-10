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
        class="fixed top-0 left-0 right-0 z-[100]"
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
                <!-- Animated offline icon -->
                <div
                  class="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center"
                  :class="{ 'animate-icon-pulse': !prefersReducedMotion }"
                  aria-hidden="true"
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
                <div>
                  <p class="text-sm font-medium text-amber-900">
                    You're offline
                  </p>
                  <p class="text-xs text-amber-700">
                    Some features may be unavailable
                  </p>
                </div>
              </div>

              <!-- Reconnecting indicator -->
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
                <span>Reconnecting...</span>
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
        class="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100]"
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
          <span class="text-sm font-medium text-green-900"> Back online! </span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { uiConfig } from '~/configs/ui.config'

// Reactive state
const isOffline = ref(false)
const isReconnecting = ref(false)
const showBackOnline = ref(false)
const wasOffline = ref(false)
const prefersReducedMotion = ref(false)

// Timers
let backOnlineTimeout: ReturnType<typeof setTimeout> | null = null
let reconnectingTimeout: ReturnType<typeof setTimeout> | null = null

// Check reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Trigger haptic feedback if available
const triggerHaptic = (pattern: number | number[] = 10): void => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

// Handle going offline
const handleOffline = () => {
  isOffline.value = true
  wasOffline.value = true
  isReconnecting.value = false
  triggerHaptic([30, 50, 30]) // Alert pattern
}

// Handle coming back online
const handleOnline = () => {
  if (!isOffline.value) return // Wasn't offline, no need to show toast

  isOffline.value = false
  isReconnecting.value = false
  showBackOnline.value = true
  triggerHaptic(20) // Success pattern

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
    box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 8px rgba(217, 119, 6, 0);
  }
}

.animate-icon-pulse {
  animation: icon-pulse 2s ease-in-out infinite;
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
  animation: bounce-subtle 0.5s ease-in-out;
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

.animate-check-pop {
  animation: check-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse-subtle,
  .animate-icon-pulse,
  .animate-bounce-subtle,
  .animate-check-pop {
    animation: none !important;
  }
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

@media (prefers-reduced-motion: reduce) {
  .animate-spin {
    animation: none;
    opacity: 0.5;
  }
}
</style>
