<template>
  <div v-if="error" class="error-boundary">
    <ErrorMessage
      :message="error.message || 'An unexpected error occurred'"
      :show-retry="true"
      @retry="resetError"
    />
    <div class="error-actions mt-4">
      <button class="home-button" @click="goHome">Go Home</button>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { onErrorCaptured } from 'vue'
import { errorLogger } from '~/utils/errorLogger'
import ErrorMessage from '~/components/ErrorMessage.vue'

interface ErrorInfo {
  componentStack: string
}

const error = ref<Error | null>(null)

const emit = defineEmits<{
  error: [error: Error, info: ErrorInfo]
}>()

const throwError = (err: Error, info: ErrorInfo) => {
  error.value = err
  errorLogger.log(err, 'error')
  emit('error', err, info)
}

const resetError = () => {
  error.value = null
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
  flex-direction: column;
}

.error-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1rem;
}

.home-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.home-button:hover {
  background-color: #e5e7eb;
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
