<template>
  <div class="toast-container" :class="positionClass">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="toastClass(toast.type)"
        role="alert"
        aria-live="polite"
      >
        <div class="toast-content">
          <div class="toast-icon">
            <svg
              v-if="toast.type === 'success'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-green-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else-if="toast.type === 'error'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else-if="toast.type === 'warning'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-yellow-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-blue-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="toast-text">
            <p class="toast-title">{{ toast.title }}</p>
            <p v-if="toast.description" class="toast-description">
              {{ toast.description }}
            </p>
          </div>
        </div>
        <button
          class="toast-close"
          :aria-label="`Close ${toast.type} notification`"
          @click="removeToast(toast.id)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
}

type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center'

interface Props {
  position?: ToastPosition
  maxToasts?: number
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top-right',
  maxToasts: 5,
})

const toasts = ref<Toast[]>([])

// Position classes
const positionClass = computed(() => {
  const positionClasses: Record<ToastPosition, string> = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  }
  return positionClasses[props.position]
})

// Toast type classes
const toastClass = (type: Toast['type']) => {
  const typeClasses: Record<Toast['type'], string> = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }
  return typeClasses[type]
}

// Add a new toast
const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = `toast-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  const newToast: Toast = {
    id,
    ...toast,
  }

  // Limit the number of toasts
  if (toasts.value.length >= props.maxToasts) {
    toasts.value = toasts.value.slice(1)
  }

  toasts.value.push(newToast)

  // Auto remove toast after duration
  if (toast.duration !== 0) {
    const duration = toast.duration || 5000 // Default to 5 seconds
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }
}

// Remove a toast
const removeToast = (id: string) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

// Expose methods to parent components
defineExpose({
  addToast,
  removeToast,
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
}

.toast-container :deep(.toast) {
  pointer-events: all;
  display: flex;
  max-width: 380px;
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  background-color: white;
  animation: slideIn 0.3s ease-out;
}

.toast-content {
  display: flex;
  flex: 1;
  gap: 0.75rem;
}

.toast-icon {
  flex-shrink: 0;
}

.toast-text {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.toast-description {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: inherit;
  opacity: 0.8;
}

.toast-close {
  flex-shrink: 0;
  margin-left: 0.75rem;
  color: inherit;
  opacity: 0.7;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) translateY(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) translateY(100%);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-100%) translateX(0);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateX(0);
  }
}
</style>
