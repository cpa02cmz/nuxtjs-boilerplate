<template>
  <div
    :class="[
      tailwind.layout.screenHeight,
      'bg-gray-50 flex flex-col items-center justify-center p-4',
    ]"
  >
    <div
      :class="[
        tailwind.containers.small,
        'w-full bg-white rounded-lg',
        tailwind.shadows.md,
        'p-8 text-center',
      ]"
    >
      <!-- Offline Icon with Idle Pulse Animation - Palette's micro-UX delight! -->
      <div
        class="mb-6 relative"
        :class="{ 'animate-icon-pulse': !isChecking && !prefersReducedMotion }"
      >
        <!-- Glow effect behind icon -->
        <div
          v-if="!prefersReducedMotion"
          class="absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <div
            class="w-20 h-20 rounded-full bg-yellow-100 opacity-0 transition-opacity duration-300"
            :class="{ 'opacity-50 animate-glow-pulse': !isChecking }"
          />
        </div>

        <svg
          :class="[
            'mx-auto h-16 w-16 text-gray-400 relative z-10 transition-all duration-300',
            isChecking ? 'text-indigo-500 animate-bounce-subtle' : '',
          ]"
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

      <!-- Title with status indicator -->
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        {{ isChecking ? 'Checking Connection...' : "You're Offline" }}
      </h1>

      <!-- Dynamic status message -->
      <p class="text-gray-600 mb-6 transition-all duration-300">
        {{ statusMessage }}
      </p>

      <!-- Retry countdown indicator -->
      <div
        v-if="retryCount > 0 && !isChecking"
        class="mb-4"
        role="status"
        aria-live="polite"
      >
        <span
          class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600"
        >
          <svg
            class="w-4 h-4 mr-2 animate-spin"
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
          Retry attempt {{ retryCount }}
        </span>
      </div>

      <div class="space-y-3">
        <!-- Check Connection Button with Loading State -->
        <button
          :class="[
            tailwind.buttons.primaryBlue,
            tailwind.focus.ringIndigo,
            'w-full flex items-center justify-center transition-all duration-200',
            isChecking
              ? 'opacity-80 cursor-wait'
              : 'hover:scale-[1.02] active:scale-[0.98]',
          ]"
          :disabled="isChecking"
          :aria-label="
            isChecking
              ? 'Checking connection, please wait'
              : 'Check if connection is restored'
          "
          @click="checkConnection"
        >
          <!-- Loading Spinner -->
          <svg
            v-if="isChecking"
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
          {{ isChecking ? 'Checking...' : 'Check Connection' }}
        </button>

        <!-- Go Home Button -->
        <button
          :class="[
            tailwind.buttons.secondary,
            tailwind.focus.ringSecondaryWithOffset,
            'w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
          ]"
          @click="goHome"
        >
          Go Home
        </button>
      </div>

      <!-- Auto-retry hint -->
      <p v-if="!isChecking" class="mt-4 text-xs text-gray-400">
        Tip: Press
        <kbd
          class="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono text-xs"
          >Space</kbd
        >
        or
        <kbd
          class="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono text-xs"
          >Enter</kbd
        >
        to retry
      </p>
    </div>

    <!-- Screen reader announcement -->
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
      {{ announcement }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { tailwindClassesConfig as tailwind } from '~/configs/tailwind-classes.config'
import { animationConfig } from '~/configs/animation.config'
import { hapticLight, hapticError, hapticSuccess } from '~/utils/hapticFeedback'

definePageMeta({
  layout: 'default',
})

// Reactive state - Palette's micro-UX enhancement!
const isChecking = ref(false)
const retryCount = ref(0)
const announcement = ref('')
const prefersReducedMotion = ref(false)

// Status message computed for better UX
const statusMessage = computed(() => {
  if (isChecking.value) {
    return 'Trying to reconnect to the internet...'
  }
  if (retryCount.value > 0) {
    return `Still offline after ${retryCount.value} ${retryCount.value === 1 ? 'attempt' : 'attempts'}. Please check your connection.`
  }
  return "It looks like you're not connected to the internet. Please check your connection and try again."
})

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function'
  ) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches

    // Listen for changes
    const handleChange = e => {
      prefersReducedMotion.value = e.matches
    }

    mediaQuery.addEventListener('change', handleChange)

    // Return cleanup function
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }
  return undefined
}

const checkConnection = async () => {
  // Guard: only run on client-side
  if (!process.client) return

  // Prevent double-clicks
  if (isChecking.value) return

  // Set loading state
  isChecking.value = true
  announcement.value = 'Checking internet connection'

  // Haptic feedback for interaction start
  hapticLight()

  // Simulate a brief delay for better UX (prevents jarring instant feedback)
  await new Promise(resolve =>
    setTimeout(resolve, animationConfig.offlineRetry.spinDurationMs)
  )

  if (navigator.onLine) {
    // Connection restored!
    hapticSuccess()
    announcement.value = 'Connection restored! Redirecting to home page.'

    // Brief delay to show success state before redirect
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = window.location.origin
      }
    }, animationConfig.offlineRetry.redirectDelayMs)
  } else {
    // Still offline
    retryCount.value++
    isChecking.value = false
    hapticError()
    announcement.value = `Still offline. Retry attempt ${retryCount.value}.`
  }
}

const goHome = () => {
  // Guard: only run on client-side
  if (!process.client) return

  hapticLight()

  // Additional guard for SSR safety
  if (typeof window !== 'undefined') {
    window.location.href = window.location.origin
  }
}

// Keyboard shortcut: Space or Enter to retry
const handleKeyDown = event => {
  if ((event.key === ' ' || event.key === 'Enter') && !isChecking.value) {
    event.preventDefault()
    checkConnection()
  }
}

// Lifecycle hooks
let cleanupReducedMotion = undefined

onMounted(() => {
  // Check initial reduced motion preference
  cleanupReducedMotion = checkReducedMotion()

  // Add keyboard listener
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  // Remove keyboard listener
  document.removeEventListener('keydown', handleKeyDown)

  // Cleanup reduced motion listener
  if (cleanupReducedMotion) {
    cleanupReducedMotion()
  }
})
</script>

<style scoped>
/* Subtle pulse animation for idle icon - draws attention without being distracting */
@keyframes icon-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

.animate-icon-pulse {
  animation: icon-pulse 3s ease-in-out infinite;
}

/* Glow pulse animation behind icon */
@keyframes glow-pulse {
  0%,
  100% {
    transform: scale(0.8);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.6;
  }
}

.animate-glow-pulse {
  animation: glow-pulse 3s ease-in-out infinite;
}

/* Subtle bounce for checking state */
@keyframes bounce-subtle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.animate-bounce-subtle {
  animation: bounce-subtle 0.6s ease-in-out infinite;
}

/* Keyboard shortcut styling */
kbd {
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .animate-icon-pulse,
  .animate-glow-pulse,
  .animate-bounce-subtle {
    animation: none;
  }
}
</style>
