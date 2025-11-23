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
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 class="mt-6 text-3xl font-extrabold text-gray-900">
            {{
              error.statusCode === 404
                ? 'Page Not Found'
                : 'Something Went Wrong'
            }}
          </h1>
          <p class="mt-2 text-gray-600">
            {{
              error.statusCode === 404
                ? 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.'
                : 'An unexpected error occurred. Please try again later.'
            }}
          </p>
        </div>

        <div class="mt-8 space-y-4">
          <p v-if="error.message" class="text-sm text-gray-500">
            Error: {{ error.message }}
          </p>

          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              class="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
              @click="handleRetry"
            >
              Go Back
            </button>
            <NuxtLink
              to="/"
              class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
            >
              Go Home
            </NuxtLink>
            <button
              v-if="showErrorDetails"
              class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
              @click="toggleErrorDetails"
            >
              {{ errorDetailsVisible ? 'Hide Details' : 'Show Details' }}
            </button>
          </div>

          <!-- Error details section -->
          <div
            v-if="showErrorDetails && errorDetailsVisible && error.stack"
            class="mt-4 p-4 bg-gray-100 rounded-md text-left text-xs text-gray-700 max-h-40 overflow-auto"
          >
            <p><strong>Stack Trace:</strong></p>
            <pre class="mt-2">{{ error.stack }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { errorLogger } from '~/utils/errorLogger'

interface ErrorProps {
  error: {
    statusCode: number
    message: string
    url: string
    stack?: string
  }
}

const props = defineProps<ErrorProps>()

// Log the error when the component is created
onMounted(() => {
  if (props.error) {
    const errorObj = new Error(props.error.message)
    errorObj.stack = props.error.stack
    errorLogger.log(errorObj, 'error', props.error.url)
  }
})

const handleRetry = () => {
  if (process.client) {
    window.history.back()
  }
}

// Clear the error so the page can render
const handleError = () => clearError({ redirect: '/' })

// Error details visibility
const errorDetailsVisible = ref(false)
const showErrorDetails = computed(
  () => process.env.NODE_ENV === 'development' && props.error?.stack
)

const toggleErrorDetails = () => {
  errorDetailsVisible.value = !errorDetailsVisible.value
}
</script>
