<template>
  <div
    class="toast-container"
    :style="{
      top: toastPosition.top,
      right: toastPosition.right,
      zIndex: toastPosition.zIndex,
      maxWidth: toastPosition.maxWidth,
    }"
  >
    <transition-group
      name="toast"
      tag="div"
      class="toast-wrapper"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast--${toast.type}`"
        role="alert"
        :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
        @mouseenter="pauseToast(toast.id)"
        @mouseleave="resumeToast(toast.id)"
        @focusin="pauseToast(toast.id)"
        @focusout="resumeToast(toast.id)"
      >
        <div class="toast__icon">
          <svg
            v-if="toast.type === 'success'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              :d="iconsConfig.svg.filled.success"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else-if="toast.type === 'error'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              :d="iconsConfig.svg.filled.error"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else-if="toast.type === 'warning'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              :d="iconsConfig.svg.filled.warning"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              :d="iconsConfig.svg.filled.info"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="toast__content">
          <p class="toast__message">
            {{ toast.message }}
          </p>
          <p
            v-if="toast.description"
            class="toast__description"
          >
            {{ toast.description }}
          </p>
        </div>
        <button
          type="button"
          class="toast__close"
          :aria-label="`Dismiss ${toast.type} notification`"
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
              :d="iconsConfig.svg.filled.close"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <!-- Progress bar showing remaining time -->
        <div
          class="toast__progress"
          :class="{ 'toast__progress--paused': pausedToastIds.has(toast.id) }"
          :style="{
            animationDuration: `${toast.duration || (toast.type === 'error' ? TOAST_DURATION.ERROR : TOAST_DURATION.SUCCESS)}ms`,
          }"
        />
      </div>
    </transition-group>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { TOAST_DURATION, UI_TIMING } from '~/server/utils/constants'
import { uiConfig } from '~/configs/ui.config'
import { iconsConfig } from '~/configs/icons.config'
import { generateId } from '~/utils/generateId'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  description?: string
  duration?: number
}

const toasts = ref<Toast[]>([])
const pausedToastIds = ref<Set<string>>(new Set())

// Flexy hates hardcoded values! Use config for all styling
const toastStyles = computed(() => uiConfig.toastStyles)

const toastPosition = {
  top: `${uiConfig.toast.position.top}px`,
  right: `${uiConfig.toast.position.right}px`,
  maxWidth: `${uiConfig.toast.position.maxWidth}px`,
  minWidth: `${uiConfig.toast.position.minWidth}px`,
  zIndex: uiConfig.zIndex.toast,
}

const addToast = (toast: Omit<Toast, 'id'>) => {
  // Flexy hates hardcoded ID generation! Use centralized utility
  const id = generateId({ prefix: 'toast' })
  const newToast = { id, ...toast }
  toasts.value.push(newToast)

  // Auto remove toast after duration (respects pause state)
  const duration =
    toast.duration ||
    (toast.type === 'error' ? TOAST_DURATION.ERROR : TOAST_DURATION.SUCCESS)
  if (duration > 0) {
    const startTime = Date.now()
    const checkAndRemove = () => {
      if (!toasts.value.find(t => t.id === id)) return // Already removed

      if (pausedToastIds.value.has(id)) {
        // Toast is paused, check again
        setTimeout(checkAndRemove, UI_TIMING.TOAST_CHECK_INTERVAL_MS)
      } else if (Date.now() - startTime >= duration) {
        removeToast(id)
      } else {
        // Not yet expired, check again
        setTimeout(
          checkAndRemove,
          Math.min(
            UI_TIMING.TOAST_CHECK_INTERVAL_MS,
            duration - (Date.now() - startTime)
          )
        )
      }
    }
    setTimeout(checkAndRemove, duration)
  }
}

const pauseToast = (id: string) => {
  pausedToastIds.value.add(id)
}

const resumeToast = (id: string) => {
  pausedToastIds.value.delete(id)
}

const removeToast = (id: string) => {
  toasts.value = toasts.value.filter(toast => toast.id !== id)
}

// Palette's micro-UX enhancement: Dismiss all toasts at once
const dismissAllToasts = () => {
  toasts.value = []
}

// Handle global Escape key to dismiss all visible toasts
const handleGlobalEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && toasts.value.length > 0) {
    dismissAllToasts()
  }
}

// Expose methods to parent components
defineExpose({
  addToast,
  removeToast,
  pauseToast,
  resumeToast,
  dismissAllToasts,
})

// Set up global keyboard listener for Escape key
onMounted(() => {
  document.addEventListener('keydown', handleGlobalEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalEscape)
})
</script>

<style scoped>
/* Flexy hates hardcoded values! Using config-bound CSS custom properties */
.toast-container {
  position: fixed;
  top: v-bind('toastPosition.top');
  right: v-bind('toastPosition.right');
  z-index: v-bind('toastPosition.zIndex');
  max-width: v-bind('toastPosition.maxWidth');
  width: 100%;
}

.toast-wrapper {
  display: flex;
  flex-direction: column;
  gap: v-bind('toastStyles.gap');
}

.toast {
  display: flex;
  align-items: flex-start;
  padding: v-bind('toastStyles.padding');
  border-radius: v-bind('toastStyles.borderRadius');
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  min-width: v-bind('toastStyles.minWidth');
  max-width: 100%;
  animation: slideIn v-bind('toastStyles.animationDuration') ease-out;
  position: relative;
  overflow: hidden;
}

.toast--success {
  background-color: v-bind('toastStyles.colors.success.bg');
  border-left: v-bind('toastStyles.borderLeftWidth') solid
    v-bind('toastStyles.colors.success.border');
  color: v-bind('toastStyles.colors.success.text');
}

.toast--error {
  background-color: v-bind('toastStyles.colors.error.bg');
  border-left: v-bind('toastStyles.borderLeftWidth') solid
    v-bind('toastStyles.colors.error.border');
  color: v-bind('toastStyles.colors.error.text');
}

.toast--warning {
  background-color: v-bind('toastStyles.colors.warning.bg');
  border-left: v-bind('toastStyles.borderLeftWidth') solid
    v-bind('toastStyles.colors.warning.border');
  color: v-bind('toastStyles.colors.warning.text');
}

.toast--info {
  background-color: v-bind('toastStyles.colors.info.bg');
  border-left: v-bind('toastStyles.borderLeftWidth') solid
    v-bind('toastStyles.colors.info.border');
  color: v-bind('toastStyles.colors.info.text');
}

.toast__icon {
  margin-right: v-bind('toastStyles.icon.marginRight');
  flex-shrink: 0;
  margin-top: v-bind('toastStyles.icon.marginTop');
}

.toast__content {
  flex: 1;
  min-width: 0;
}

.toast__message {
  font-weight: v-bind('toastStyles.message.fontWeight');
  font-size: v-bind('toastStyles.message.fontSize');
  line-height: v-bind('toastStyles.message.lineHeight');
}

.toast__description {
  font-size: v-bind('toastStyles.description.fontSize');
  line-height: v-bind('toastStyles.description.lineHeight');
  margin-top: v-bind('toastStyles.description.marginTop');
  opacity: v-bind('toastStyles.description.opacity');
}

.toast__close {
  margin-left: v-bind('toastStyles.close.marginLeft');
  flex-shrink: 0;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: v-bind('toastStyles.close.padding');
  border-radius: v-bind('toastStyles.close.borderRadius');
  opacity: v-bind('toastStyles.close.opacity');
  transition: opacity 0.2s;
}

.toast__close:hover {
  opacity: v-bind('toastStyles.close.hoverOpacity');
}

/* Progress bar showing remaining time */
.toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: v-bind('toastStyles.progress.height');
  background: currentColor;
  opacity: v-bind('toastStyles.progress.opacity');
  animation: progress linear forwards;
  border-bottom-left-radius: v-bind('toastStyles.borderRadius');
}

.toast__progress--paused {
  animation-play-state: paused;
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .toast__progress {
    animation: none;
    width: 100%;
    opacity: 0.15;
  }

  .toast {
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .toast-enter-active,
  .toast-leave-active {
    transition: opacity 0.2s ease;
  }

  .toast-enter-from,
  .toast-leave-to {
    transform: none;
    opacity: 0;
  }
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

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Flexy removed duplicate progress bar styles - already defined above using config values */
</style>
