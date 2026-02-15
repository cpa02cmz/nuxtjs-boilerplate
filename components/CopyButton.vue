<template>
  <div class="copy-button-wrapper">
    <button
      type="button"
      :class="[
        'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-1 relative overflow-hidden',
        isCopied
          ? 'bg-green-100 text-green-700 focus:ring-green-500'
          : copyError
            ? 'bg-red-100 text-red-700 focus:ring-red-500'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 focus:ring-gray-400',
        isLoading && 'opacity-75 cursor-wait',
      ]"
      :aria-label="ariaLabelText"
      :disabled="isLoading"
      @click="handleCopy"
      @keydown="handleKeyDown"
      @mouseenter="showShortcutHint = true"
      @mouseleave="showShortcutHint = false"
    >
      <!-- Loading Spinner -->
      <svg
        v-if="isLoading"
        xmlns="http://www.w3.org/2000/svg"
        class="h-3.5 w-3.5 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <!-- Copy Icon -->
      <svg
        v-else-if="!isCopied && !copyError"
        xmlns="http://www.w3.org/2000/svg"
        class="h-3.5 w-3.5 transition-transform duration-200"
        :class="{ 'group-hover:scale-110': true }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
      <!-- Error Icon -->
      <svg
        v-else-if="copyError"
        xmlns="http://www.w3.org/2000/svg"
        class="h-3.5 w-3.5 animate-shake"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <!-- Checkmark Icon -->
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="h-3.5 w-3.5 animate-check-pop"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2.5"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M5 13l4 4L19 7"
          class="checkmark-path"
        />
      </svg>
      <span>{{ buttonText }}</span>
    </button>

    <!-- Keyboard Shortcut Hint - Palette's micro-UX delight! -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-1 scale-95"
    >
      <div
        v-if="showShortcutHint && !isCopied && !copyError && !isLoading"
        class="shortcut-hint"
        role="tooltip"
        aria-hidden="true"
      >
        <kbd class="shortcut-key">{{ isMac ? '⌘' : 'Ctrl' }}</kbd>
        <span class="shortcut-plus">+</span>
        <kbd class="shortcut-key">C</kbd>
      </div>
    </Transition>

    <!-- Screen reader announcement -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ announcementText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { hapticSuccess, hapticError } from '~/utils/hapticFeedback'
import { animationConfig } from '~/configs/animation.config'

interface Props {
  content: string
  label?: string
  /**
   * Enable haptic feedback on mobile devices
   * @default true
   */
  hapticFeedback?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Copy',
  hapticFeedback: true,
})

const emit = defineEmits<{
  copied: []
}>()

const isCopied = ref(false)
const isLoading = ref(false)
const copyError = ref(false)
const showShortcutHint = ref(false)

// Check if user is on macOS for proper keyboard shortcut display
const isMac = ref(false)
onMounted(() => {
  if (typeof window !== 'undefined') {
    isMac.value = navigator.platform.toUpperCase().includes('MAC')
  }
})

const handleCopy = async () => {
  if (isLoading.value) return

  isLoading.value = true
  copyError.value = false

  try {
    await navigator.clipboard.writeText(props.content)
    isCopied.value = true
    isLoading.value = false

    // Trigger haptic feedback for successful copy
    if (props.hapticFeedback) {
      hapticSuccess()
    }

    emit('copied')

    // Reset after configured duration - Flexy hates hardcoded values!
    setTimeout(() => {
      isCopied.value = false
    }, animationConfig.copyFeedback?.durationMs || 2000)
  } catch {
    isLoading.value = false
    copyError.value = true

    // Trigger error haptic feedback
    if (props.hapticFeedback) {
      hapticError()
    }

    // Reset error state after delay
    setTimeout(() => {
      copyError.value = false
    }, animationConfig.copyFeedback?.durationMs || 2000)
  }
}

// Handle keyboard shortcut (Ctrl+C / Cmd+C) for copy
const handleKeyDown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
    // Show shortcut hint briefly
    showShortcutHint.value = true
    setTimeout(() => {
      showShortcutHint.value = false
    }, 1500)
  }
}

// Computed button text based on state
const buttonText = computed(() => {
  if (isLoading.value) return 'Copying...'
  if (copyError.value) return 'Failed'
  if (isCopied.value) return 'Copied!'
  return props.label
})

// Computed aria-label for accessibility
const ariaLabelText = computed(() => {
  if (isLoading.value) return 'Copying to clipboard...'
  if (copyError.value) return 'Failed to copy. Click to try again'
  if (isCopied.value) return 'Copied to clipboard!'
  return `Copy "${props.label}" to clipboard`
})

// Computed announcement text for screen readers
const announcementText = computed(() => {
  if (isCopied.value) return 'Content copied to clipboard successfully'
  if (copyError.value) return 'Failed to copy content. Please try again'
  return ''
})
</script>

<style scoped>
/* Wrapper for positioning context */
.copy-button-wrapper {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

/* Spinner animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Checkmark pop animation */
@keyframes check-pop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.animate-check-pop {
  animation: check-pop 0.3s ease-out;
}

/* Shake animation for error state */
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-2px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(2px);
  }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

/* Checkmark path draw animation */
.checkmark-path {
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: draw-check 0.3s ease-out forwards;
}

@keyframes draw-check {
  to {
    stroke-dashoffset: 0;
  }
}

/* Keyboard Shortcut Hint - Palette's micro-UX enhancement! */
.shortcut-hint {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  background: rgba(31, 41, 55, 0.95);
  border-radius: 6px;
  font-size: 11px;
  color: white;
  white-space: nowrap;
  z-index: 50;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  pointer-events: none;
}

.shortcut-hint::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 4px solid rgba(31, 41, 55, 0.95);
}

.shortcut-key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  padding: 2px 4px;
  font-family:
    ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 10px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
}

.shortcut-plus {
  opacity: 0.7;
  font-weight: 500;
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-spin,
  .animate-check-pop,
  .animate-shake,
  .checkmark-path {
    animation: none;
  }

  .checkmark-path {
    stroke-dashoffset: 0;
  }

  .shortcut-hint {
    transition: opacity 0.1s ease-out;
  }
}
</style>
