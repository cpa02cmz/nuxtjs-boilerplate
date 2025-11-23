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
      <details v-if="showDetails" class="error-details">
        <summary class="error-details-summary">Error Details</summary>
        <pre class="error-stack">{{ error.stack }}</pre>
      </details>
      <div class="error-actions">
        <button class="retry-button" @click="handleRetry">Try Again</button>
        <button class="home-button" @click="goHome">Go Home</button>
        <button
          v-if="error.stack"
          class="details-button"
          @click="toggleDetails"
        >
          {{ showDetails ? 'Hide Details' : 'Show Details' }}
        </button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { onErrorCaptured } from 'vue'

interface ErrorInfo {
  componentStack: string
}

const error = ref<Error | null>(null)
const showDetails = ref(false)

const emit = defineEmits<{
  error: [error: Error, info: ErrorInfo]
}>()

const throwError = (err: Error, info: ErrorInfo) => {
  error.value = err
  emit('error', err, info)

  // Log error for debugging in development
  if (process.env.NODE_ENV === 'development') {
    console.error('ErrorBoundary caught error:', err)
  }
}

const resetError = () => {
  error.value = null
  showDetails.value = false
}

const handleRetry = () => {
  resetError()
}

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

const goHome = () => {
  navigateTo('/')
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
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  margin: 1rem;
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

.error-details-summary {
  cursor: pointer;
  font-weight: bold;
  color: #374151;
  padding: 0.25rem;
}

.error-stack {
  background: #1f2937;
  color: #f9fafb;
  padding: 0.75rem;
  border-radius: 0.375rem;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
  font-size: 0.75rem;
  text-align: left;
  margin-top: 0.5rem;
}

.error-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.retry-button,
.home-button,
.details-button {
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

.retry-button:hover {
  background-color: #2563eb;
}

.home-button {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.home-button:hover {
  background-color: #e5e7eb;
}

.details-button {
  background-color: #e5e7eb;
  color: #374151;
  border: 1px solid #d1d5db;
}

.details-button:hover {
  background-color: #d1d5db;
}
</style>

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

.error-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.retry-button,
.home-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-button {
  background-color: #3b82f6;
  color: white;
  border: 1px solid #3b82f6;
}

.retry-button:hover {
  background-color: #2563eb;
}

.home-button {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.home-button:hover {
  background-color: #e5e7eb;
}
</style>
