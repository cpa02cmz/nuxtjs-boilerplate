<template>
  <Transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="opacity-0 translate-y-8 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-4 scale-95"
    @after-leave="handleAfterLeave"
  >
    <div
      v-if="showPrompt && !isDismissing"
      ref="promptRef"
      role="alertdialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-description"
      tabindex="-1"
      :class="[
        'fixed bottom-4 left-1/2 transform -translate-x-1/2',
        'bg-white shadow-lg rounded-lg p-4 border border-gray-200',
        'z-50 max-w-sm w-full mx-4',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      ]"
      @keydown.esc="handleEscape"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <!-- App icon with subtle pulse animation when first shown -->
          <div
            :class="[
              'bg-gray-100 rounded-lg p-2',
              showIconPulse && 'animate-icon-pulse',
            ]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </div>
          <div>
            <h3
              id="pwa-install-title"
              class="font-medium text-gray-900"
            >
              Install App
            </h3>
            <p
              id="pwa-install-description"
              class="text-sm text-gray-500"
            >
              Add to your home screen
            </p>
          </div>
        </div>
        <div class="flex space-x-2">
          <button
            ref="dismissButtonRef"
            :class="[
              'px-3 py-1 text-sm text-gray-600 hover:text-gray-800',
              'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
              'transition-all duration-200 ease-out',
              'hover:bg-gray-100 rounded-md',
              isDismissing && 'opacity-50 cursor-not-allowed',
            ]"
            aria-label="Cancel app installation (press Escape to dismiss)"
            :disabled="isDismissing"
            @click="cancelInstall"
          >
            <span class="flex items-center gap-1">
              Not now
              <kbd
                class="hidden sm:inline-flex items-center px-1 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded text-gray-500"
                aria-hidden="true"
              >Esc</kbd>
            </span>
          </button>
          <button
            :class="[
              'px-3 py-1 bg-blue-600 text-white text-sm rounded-md',
              'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'transition-all duration-200 ease-out',
              'hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
              isInstalling && 'opacity-75 cursor-wait',
            ]"
            aria-label="Install app to home screen"
            :disabled="isInstalling"
            @click="installPWA"
          >
            <span class="flex items-center gap-1">
              <svg
                v-if="isInstalling"
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
              {{ isInstalling ? 'Installing...' : 'Install' }}
            </span>
          </button>
        </div>
      </div>

      <!-- Progress bar for auto-dismiss (optional feature) -->
      <div
        v-if="autoDismissDuration > 0"
        class="absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-100 ease-linear"
        :style="{ width: `${autoDismissProgress}%` }"
        aria-hidden="true"
      />
    </div>
  </Transition>

  <!-- Screen reader announcement -->
  <div
    class="sr-only"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    {{ announcement }}
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#app'
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

// Storage key constants
const STORAGE_KEYS = {
  PWA_INSTALL_DISMISSED: 'pwa-install-dismissed',
} as const

interface PWAInterface {
  showInstallPrompt: boolean
  installPWA: () => void
}

const { pwa } = useNuxtApp() as unknown as { pwa: PWAInterface }

// Local state
const userDismissed = ref(false)
const isDismissing = ref(false)
const isInstalling = ref(false)
const showIconPulse = ref(false)
const announcement = ref('')
const promptRef = ref<HTMLDivElement | null>(null)
const dismissButtonRef = ref<HTMLButtonElement | null>(null)

// Auto-dismiss feature (disabled by default, can be enabled with prop)
const autoDismissDuration = ref(0) // milliseconds, 0 = disabled
const autoDismissProgress = ref(100)
let autoDismissInterval: ReturnType<typeof setInterval> | null = null
let autoDismissTimeout: ReturnType<typeof setTimeout> | null = null

// Show prompt only if PWA wants to show it AND user hasn't dismissed it
const showPrompt = computed(
  () => pwa?.showInstallPrompt && !userDismissed.value
)

// Check for reduced motion preference
const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Trigger haptic feedback if available
const triggerHaptic = (pattern: number | number[] = 10): void => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

// Announce to screen readers
const announce = (message: string): void => {
  announcement.value = message
  setTimeout(() => {
    announcement.value = ''
  }, 1000)
}

// Handle escape key
const handleEscape = (event: KeyboardEvent): void => {
  if (event.key === 'Escape' && !isDismissing.value) {
    cancelInstall()
  }
}

// Install PWA with loading state
const installPWA = async (): Promise<void> => {
  if (isInstalling.value) return

  isInstalling.value = true
  triggerHaptic([20, 30, 20]) // Success pattern
  announce('Installing app...')

  try {
    await pwa?.installPWA()
    announce('App installed successfully')
  } catch {
    announce('Installation cancelled or failed')
  } finally {
    isInstalling.value = false
  }
}

// Cancel installation with smooth dismissal
const cancelInstall = (): void => {
  if (isDismissing.value) return

  // Trigger haptic feedback
  triggerHaptic(10) // Light tap

  // Start dismissal animation
  isDismissing.value = true
  announce('Installation prompt dismissed')

  // Store dismissal in session so it doesn't reappear during this session
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEYS.PWA_INSTALL_DISMISSED, 'true')
  }

  // Clear auto-dismiss timers
  clearAutoDismiss()
}

// Handle after leave animation
const handleAfterLeave = (): void => {
  userDismissed.value = true
}

// Clear auto-dismiss timers
const clearAutoDismiss = (): void => {
  if (autoDismissInterval) {
    clearInterval(autoDismissInterval)
    autoDismissInterval = null
  }
  if (autoDismissTimeout) {
    clearTimeout(autoDismissTimeout)
    autoDismissTimeout = null
  }
}

// Setup auto-dismiss (if enabled)
const setupAutoDismiss = (): void => {
  if (autoDismissDuration.value <= 0) return

  const updateInterval = 50 // Update every 50ms
  const decrement = (100 / autoDismissDuration.value) * updateInterval

  autoDismissInterval = setInterval(() => {
    autoDismissProgress.value -= decrement
    if (autoDismissProgress.value <= 0) {
      autoDismissProgress.value = 0
      clearAutoDismiss()
      cancelInstall()
    }
  }, updateInterval)
}

// Focus management - focus the dismiss button when prompt appears
onMounted(async () => {
  // Check if user previously dismissed in this session
  if (typeof sessionStorage !== 'undefined') {
    const previouslyDismissed = sessionStorage.getItem(
      STORAGE_KEYS.PWA_INSTALL_DISMISSED
    )
    if (previouslyDismissed === 'true') {
      userDismissed.value = true
    }
  }

  // Show icon pulse animation on first appearance (skip if reduced motion)
  if (showPrompt.value && !prefersReducedMotion()) {
    showIconPulse.value = true
    setTimeout(() => {
      showIconPulse.value = false
    }, 1000)
  }

  // Focus management for accessibility
  if (showPrompt.value) {
    await nextTick()
    // Small delay to allow transition to start
    setTimeout(() => {
      dismissButtonRef.value?.focus()
    }, 100)

    // Setup auto-dismiss if enabled
    setupAutoDismiss()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  clearAutoDismiss()
})
</script>

<style scoped>
/* Icon pulse animation for initial appearance */
.animate-icon-pulse {
  animation: icon-pulse 1s ease-in-out;
}

@keyframes icon-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
  }
}

/* Spinner animation for loading state */
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

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-icon-pulse {
    animation: none;
  }

  .animate-spin {
    animation: none;
    opacity: 0.5;
  }

  /* Override Vue transition classes */
  :deep(.transition-all) {
    transition: opacity 0.2s ease-out !important;
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
  div[role='alertdialog'] {
    border: 2px solid currentColor;
  }
}
</style>
