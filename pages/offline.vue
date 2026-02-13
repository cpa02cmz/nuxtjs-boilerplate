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
      <div class="mb-6">
        <svg
          class="mx-auto h-16 w-16 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">You're Offline</h1>
      <p class="text-gray-600 mb-6">
        It looks like you're not connected to the internet. Please check your
        connection and try again.
      </p>
      <div class="space-y-3">
        <button
          :class="[
            tailwind.buttons.primaryBlue,
            tailwind.focus.ringIndigo,
            'w-full',
          ]"
          @click="checkConnection"
        >
          Check Connection
        </button>
        <button
          :class="[
            tailwind.buttons.secondary,
            tailwind.focus.ringSecondaryWithOffset,
            'w-full',
          ]"
          @click="goHome"
        >
          Go Home
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { tailwindClassesConfig as tailwind } from '~/configs/tailwind-classes.config'

definePageMeta({
  layout: 'default',
})

const checkConnection = () => {
  // Guard: only run on client-side
  if (!process.client) return

  if (navigator.onLine) {
    window.location.href = window.location.origin
  } else {
    alert('You are still offline. Please check your internet connection.')
  }
}

const goHome = () => {
  // Guard: only run on client-side
  if (!process.client) return

  window.location.href = window.location.origin
}
</script>
