<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <div
      class="flex-grow flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
    >
      <div class="max-w-md w-full space-y-8 text-center">
        <div>
          <div
            class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-10 w-10 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="icons.error"
              />
            </svg>
          </div>
          <h1 class="mt-6 text-3xl font-extrabold text-gray-900">
            {{
              error.statusCode === 404
                ? content.error.notFound.title
                : content.error.generic.title
            }}
          </h1>
          <p class="mt-2 text-gray-600">
            {{
              error.statusCode === 404
                ? content.error.notFound.message
                : content.error.generic.message
            }}
          </p>
        </div>

        <div class="mt-8 space-y-4">
          <details
            v-if="error.message"
            class="text-left inline-block"
          >
            <summary class="text-sm text-gray-500 cursor-pointer">
              {{ content.error.details }}
            </summary>
            <p class="text-sm text-gray-500 mt-2 bg-gray-100 p-2 rounded">
              {{ error.message }}
            </p>
          </details>

          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              class="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
              :aria-label="`Go back to previous page, error code ${error.statusCode}`"
              @click="handleRetry"
            >
              {{ content.error.goBack }}
            </button>
            <NuxtLink
              to="/"
              class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
              aria-label="Go to home page"
            >
              {{ content.error.goHome }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Flexy hates hardcoded values! Using config imports instead.
import { contentConfig } from '~/configs/content.config'
import { iconsConfig } from '~/configs/icons.config'

const content = contentConfig
const icons = iconsConfig.svg

const props = defineProps<{ statusCode?: number; message?: string }>()

const error = computed(() => ({
  statusCode: props.statusCode || 500,
  message: props.message || 'An error occurred',
}))

const handleRetry = () => {
  if (process.client) {
    window.history.back()
  }
}
</script>
