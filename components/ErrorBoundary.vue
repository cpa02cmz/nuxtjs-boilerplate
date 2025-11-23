<template>
  <div v-if="error" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-16 w-16 text-red-500"
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
      <h2 class="error-title">Something went wrong</h2>
      <p class="error-message">
        {{ error.message || 'An unexpected error occurred' }}
      </p>
      <div v-if="showErrorDetails" class="error-details">
        <details class="error-details-container">
          <summary class="error-details-summary">Error Details</summary>
          <p class="error-stack">{{ error.stack }}</p>
          <p class="error-info">
            Component Stack: {{ errorInfo?.componentStack }}
          </p>
        </details>
      </div>
      <div class="error-actions">
        <button
          v-if="canRetry"
          class="retry-button"
          @click="handleRetry"
          :disabled="retryState.loading"
        >
          <span v-if="retryState.loading">Retrying...</span>
          <span v-else>Try Again</span>
        </button>
        <button class="home-button" @click="goHome">Go Home</button>
        <button v-if="canReport" class="report-button" @click="reportError">
          Report Issue
        </button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
import { useLoading } from '~/composables/useLoading'
import { useToast } from '~/composables/useToast'

interface ErrorInfo {
  componentStack: string
}

const props = withDefaults(
  defineProps<{
    canRetry?: boolean
    canReport?: boolean
    showErrorDetails?: boolean
  }>(),
  {
    canRetry: true,
    canReport: true,
    showErrorDetails: false,
  }
)

const error = ref<Error | null>(null)
const errorInfo = ref<ErrorInfo | null>(null)

const emit = defineEmits<{
  error: [error: Error, info: ErrorInfo]
  reset: []
}>()

const throwError = (err: Error, info: ErrorInfo) => {
  error.value = err
  errorInfo.value = info
  emit('error', err, info)
}

const resetError = () => {
  error.value = null
  errorInfo.value = null
  emit('reset')
}

const goHome = () => {
  navigateTo('/')
}

const retryState = useLoading()

const handleRetry = async () => {
  if (!retryState.loading) {
    try {
      await retryState.withLoading(async () => {
        resetError()
      })
    } catch (err) {
      // Error already handled by withLoading
    }
  }
}

const reportError = () => {
  // In a real application, this would send the error to an error tracking service
  console.error('Error reported:', error.value, errorInfo.value)
  const { showInfo } = useToast()
  showInfo(
    'Error Reported',
    'The error has been reported to our team for investigation.'
  )
}

onErrorCaptured((err, instance, info) => {
  throwError(err, { componentStack: info })
  return false // Prevent the error from propagating further
})
</script>

<style scoped>
.error-boundary {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 1rem;
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-icon {
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.error-details {
  margin: 1rem 0;
  text-align: left;
}

.error-details-container {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: #f9fafb;
}

.error-details-summary {
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem;
  margin: -0.5rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem 0.375rem 0 0;
}

.error-stack,
.error-info {
  padding: 0.5rem;
  font-family: monospace;
  font-size: 0.75rem;
  color: #6b7280;
  white-space: pre-wrap;
  overflow-x: auto;
}

.error-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.retry-button,
.home-button,
.report-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.retry-button {
  background-color: #3b82f6;
  color: white;
}

.retry-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.retry-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.home-button {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.home-button:hover {
  background-color: #e5e7eb;
}

.report-button {
  background-color: #9ca3af;
  color: white;
}

.report-button:hover {
  background-color: #6b7280;
}
</style>
