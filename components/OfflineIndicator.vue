<template>
  <Transition
    enter-active-class="transform transition ease-out duration-300"
    enter-from-class="-translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transform transition ease-in duration-200"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-full opacity-0"
  >
    <div
      v-if="isOffline && !isDismissed"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      class="fixed top-0 left-0 right-0 bg-yellow-100 border-b border-yellow-300 p-2 z-50"
    >
      <div class="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div class="flex items-center flex-1 justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="text-yellow-800 text-sm font-medium">
            You are offline. Some features may be limited.
            <span
              v-if="lastOnlineTime"
              class="text-yellow-700 text-xs ml-1"
            >
              (Last online: {{ lastOnlineTime }})
            </span>
          </span>
        </div>
        <div class="flex items-center gap-2 ml-4">
          <button
            type="button"
            class="text-yellow-700 hover:text-yellow-900 text-sm font-medium px-2 py-1 rounded hover:bg-yellow-200 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1"
            :disabled="isChecking"
            @click="checkConnection"
          >
            <span
              v-if="isChecking"
              class="flex items-center"
            >
              <svg
                class="animate-spin h-4 w-4 mr-1"
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
              Checking...
            </span>
            <span v-else>Retry</span>
          </button>
          <button
            type="button"
            class="text-yellow-600 hover:text-yellow-800 p-1 rounded hover:bg-yellow-200 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1"
            aria-label="Dismiss offline notification"
            @click="dismiss"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onUnmounted, onMounted } from 'vue'
import { UI_TIMING } from '~/server/utils/constants'

const isOffline = ref(false)
const isDismissed = ref(false)
const isChecking = ref(false)
const lastOnlineTime = ref<string>('')

// Format the last online time in a user-friendly way
const formatLastOnline = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

// Check connection status and update UI
const checkConnection = async () => {
  if (isChecking.value) return

  isChecking.value = true

  // Try to fetch a small resource to verify connection
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(
      () => controller.abort(),
      UI_TIMING.CONNECTION_TIMEOUT_MS
    )

    await fetch('/favicon.ico', {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // If fetch succeeds, we're online
    isOffline.value = false
    isDismissed.value = false
  } catch {
    // Still offline
    isOffline.value = true
  } finally {
    isChecking.value = false
  }
}

// Dismiss the notification
const dismiss = () => {
  isDismissed.value = true
}

onMounted(() => {
  if (process.client) {
    // Check initial connection status
    isOffline.value = !navigator.onLine

    // Set initial last online time if currently offline
    if (isOffline.value) {
      const stored = localStorage.getItem('lastOnlineTime')
      if (stored) {
        lastOnlineTime.value = formatLastOnline(new Date(stored))
      }
    }

    // Listen for online/offline events
    const handleOnline = () => {
      isOffline.value = false
      isDismissed.value = false
      const now = new Date().toISOString()
      localStorage.setItem('lastOnlineTime', now)
      lastOnlineTime.value = ''
    }

    const handleOffline = () => {
      isOffline.value = true
      isDismissed.value = false
      // Store the time we went offline
      localStorage.setItem('lastOnlineTime', new Date().toISOString())
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup event listeners on component unmount
    onUnmounted(() => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    })
  }
})
</script>
