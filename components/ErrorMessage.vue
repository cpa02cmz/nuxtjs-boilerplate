<template>
  <div class="error-message-container" role="alert" aria-live="assertive">
    <div class="error-content">
      <div class="error-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-red-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <div class="error-text">
        <p class="error-message">{{ message }}</p>
        <div v-if="showRetry" class="error-actions mt-2">
          <button type="button" class="retry-button" @click="handleRetry">
            Try Again
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message: string
  showRetry?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showRetry: false,
})

const emit = defineEmits<{
  retry: []
}>()

const handleRetry = () => {
  emit('retry')
}
</script>

<style scoped>
.error-message-container {
  @apply bg-red-50 border border-red-200 rounded-md p-4;
}

.error-content {
  @apply flex items-start;
}

.error-icon {
  @apply flex-shrink-0;
}

.error-text {
  @apply ml-3;
}

.error-message {
  @apply text-sm text-red-800;
}

.error-actions {
  @apply mt-2;
}

.retry-button {
  @apply inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500;
}
</style>
