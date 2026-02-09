<template>
  <transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="opacity-0 translate-y-8 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-4 scale-95"
  >
    <div
      v-if="showPrompt"
      role="alertdialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-description"
      class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 border border-gray-200 z-50 max-w-sm w-full mx-4 pwa-prompt"
      :class="{ 'pwa-prompt--dismissing': isDismissing }"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <!-- Animated icon container with attention pulse -->
          <div
            class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-2 pwa-prompt__icon"
            :class="{ 'pwa-prompt__icon--animate': !hasAnimated }"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-blue-600"
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
            class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-md transition-all duration-200 ease-out hover:bg-gray-100 active:scale-95"
            aria-label="Cancel app installation"
            @click="cancelInstall"
          >
            Not now
          </button>
          <button
            class="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 pwa-prompt__install-btn"
            :class="{ 'pwa-prompt__install-btn--installing': isInstalling }"
            aria-label="Install app to home screen"
            @click="installPWA"
          >
            <span class="flex items-center gap-1.5">
              <svg
                v-if="isInstalling"
                class="animate-spin h-3.5 w-3.5"
                xmlns="http://www.w3.org/2000/svg"
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
              {{ isInstalling ? 'Installing...' : 'Install' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#app'
import { ref, computed, onMounted } from 'vue'

// Storage key constants
const STORAGE_KEYS = {
  PWA_INSTALL_DISMISSED: 'pwa-install-dismissed',
} as const

interface PWAInterface {
  showInstallPrompt: boolean
  installPWA: () => void
}

const { pwa } = useNuxtApp() as unknown as { pwa: PWAInterface }

// Local state to track user dismissal - prevents prompt from reappearing immediately
const userDismissed = ref(false)
const isDismissing = ref(false)
const isInstalling = ref(false)
const hasAnimated = ref(false)

// Show prompt only if PWA wants to show it AND user hasn't dismissed it
const showPrompt = computed(
  () => pwa?.showInstallPrompt && !userDismissed.value
)

const installPWA = () => {
  isInstalling.value = true

  // Simulate brief loading state for feedback
  setTimeout(() => {
    pwa?.installPWA()
    isInstalling.value = false
  }, 300)
}

const cancelInstall = () => {
  // Trigger dismiss animation
  isDismissing.value = true

  // Wait for animation to complete before hiding
  setTimeout(() => {
    userDismissed.value = true
    // Store dismissal in session so it doesn't reappear during this session
    if (process.client) {
      sessionStorage.setItem(STORAGE_KEYS.PWA_INSTALL_DISMISSED, 'true')
    }
  }, 300)
}

// Check if user previously dismissed in this session
if (process.client) {
  const previouslyDismissed = sessionStorage.getItem(
    STORAGE_KEYS.PWA_INSTALL_DISMISSED
  )
  if (previouslyDismissed === 'true') {
    userDismissed.value = true
  }
}

// Track if animation has played to prevent re-animation
onMounted(() => {
  if (showPrompt.value && !hasAnimated.value) {
    // Small delay to ensure animation plays after mount
    setTimeout(() => {
      hasAnimated.value = true
    }, 500)
  }
})
</script>

<style scoped>
/* Enhanced shadow with gradient border effect */
.pwa-prompt {
  box-shadow:
    0 10px 40px -10px rgba(0, 0, 0, 0.15),
    0 4px 12px -2px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(59, 130, 246, 0.1);
}

/* Icon container with subtle entrance animation */
.pwa-prompt__icon {
  position: relative;
  overflow: hidden;
}

.pwa-prompt__icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba(59, 130, 246, 0.2) 0%,
    transparent 70%
  );
  opacity: 0;
  transform: scale(0);
  transition: all 0.4s ease-out;
}

.pwa-prompt__icon--animate::before {
  animation: icon-pulse 2s ease-out;
}

@keyframes icon-pulse {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
  }
  100% {
    opacity: 0;
    transform: scale(2);
  }
}

/* Install button with shimmer effect */
.pwa-prompt__install-btn {
  position: relative;
  overflow: hidden;
}

.pwa-prompt__install-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s ease;
}

.pwa-prompt__install-btn:hover::before {
  left: 100%;
}

/* Installing state */
.pwa-prompt__install-btn--installing {
  cursor: wait;
  opacity: 0.9;
}

/* Dismissing state */
.pwa-prompt--dismissing {
  animation: slide-out 0.3s ease-in forwards;
}

@keyframes slide-out {
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(20px) scale(0.95);
  }
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .pwa-prompt__icon::before,
  .pwa-prompt__icon--animate::before {
    animation: none;
  }

  .pwa-prompt__install-btn::before {
    display: none;
  }

  .pwa-prompt--dismissing {
    animation: none;
    opacity: 0;
  }
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .pwa-prompt {
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    transform: none;
    max-width: none;
  }
}

/* Dark mode support (for future) */
@media (prefers-color-scheme: dark) {
  .pwa-prompt {
    background: #1f2937;
    border-color: #374151;
    box-shadow:
      0 10px 40px -10px rgba(0, 0, 0, 0.3),
      0 4px 12px -2px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(59, 130, 246, 0.2);
  }

  .pwa-prompt__icon {
    background: linear-gradient(135deg, #1e3a8a 0%, #312e81 100%);
  }
}
</style>
