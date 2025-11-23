<template>
  <div class="toast-container" aria-live="polite" aria-atomic="true">
    <transition-group name="toast" tag="div" class="toast-wrapper">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'toast',
          `toast-${toast.type}`,
          { 'toast-closable': toast.closable },
        ]"
        role="alert"
        :aria-label="toast.type"
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
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
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
            <p class="toast-message">{{ toast.message }}</p>
          </div>
        </div>
        <button
          v-if="toast.closable"
          type="button"
          class="toast-close"
          aria-label="Close notification"
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
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
  closable?: boolean
}

const toasts = ref<Toast[]>([])

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = Math.random().toString(36).substr(2, 9)
  const newToast = {
    id,
    duration: 5000, // Default duration of 5 seconds
    closable: true, // Default to closable
    ...toast,
  }

  toasts.value.push(newToast)

  // Auto-remove toast after duration if it's not manually closable
  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
  }
}

const removeToast = (id: string) => {
  toasts.value = toasts.value.filter(toast => toast.id !== id)
}

// Expose the addToast function to parent components
defineExpose({ addToast })
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
  width: 100%;
}

.toast-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toast {
  display: flex;
  align-items: flex-start;
  padding: 0.75rem 1rem;
  background-color: white;
  border: 1px solid;
  border-radius: 0.5rem;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  animation: slideIn 0.3s ease-out;
}

.toast-success {
  border-color: rgb(220, 252, 231);
  background-color: rgb(240, 253, 244);
}

.toast-error {
  border-color: rgb(254, 226, 226);
  background-color: rgb(254, 241, 242);
}

.toast-warning {
  border-color: rgb(254, 249, 195);
  background-color: rgb(254, 252, 232);
}

.toast-info {
  border-color: rgb(224, 242, 254);
  background-color: rgb(240, 249, 255);
}

.toast-content {
  display: flex;
  flex: 1;
  align-items: flex-start;
}

.toast-icon {
  margin-right: 0.75rem;
  margin-top: 0.125rem;
}

.toast-text {
  flex: 1;
}

.toast-message {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #374151;
}

.toast-close {
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
  flex-shrink: 0;
}

.toast-close:hover {
  color: #6b7280;
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
  position: absolute;
  width: 100%;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
