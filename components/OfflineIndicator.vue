<template>
  <div>
    <!-- Offline Warning -->
    <div
      v-if="isOffline"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      class="fixed top-0 left-0 right-0 bg-yellow-100 border-b border-yellow-300 p-2 z-50 transition-all duration-300 ease-in-out"
    >
      <div class="max-w-7xl mx-auto px-4 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-yellow-600 mr-2"
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
        <span class="text-yellow-800 text-sm font-medium">You are offline. Some features may be limited.</span>
        <span class="text-yellow-800 text-sm font-medium">You are offline. Some features may be limited.</span>
        <span class="text-yellow-800 text-sm font-medium">You are offline. Some features may be limited.</span>
      </div>
    </div>

    <!-- Back Online Confirmation -->
    <div
      v-if="showBackOnline"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="fixed top-0 left-0 right-0 bg-green-100 border-b border-green-300 p-2 z-50 transition-all duration-500 ease-in-out"
    >
      <div class="max-w-7xl mx-auto px-4 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-green-600 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="text-green-800 text-sm font-medium">You're back online! All features are available.</span>
        <span class="text-green-800 text-sm font-medium">You're back online! All features are available.</span>
        <span class="text-green-800 text-sm font-medium">You're back online! All features are available.</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const isOffline = ref(false)
const showBackOnline = ref(false)
let backOnlineTimeout: ReturnType<typeof setTimeout> | null = null

// Check initial connection status
if (process.client) {
  isOffline.value = !navigator.onLine

  // Listen for online/offline events
  const handleOnline = () => {
    isOffline.value = false
    // Show "back online" confirmation
    showBackOnline.value = true
    // Auto-hide after 3 seconds
    backOnlineTimeout = setTimeout(() => {
      showBackOnline.value = false
    }, 3000)
  }

  const handleOffline = () => {
    isOffline.value = true
    // Clear any pending "back online" timeout
    if (backOnlineTimeout) {
      clearTimeout(backOnlineTimeout)
      backOnlineTimeout = null
    }
    showBackOnline.value = false
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Cleanup event listeners on component unmount
  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
    if (backOnlineTimeout) {
      clearTimeout(backOnlineTimeout)
    }
  })
}
</script>
