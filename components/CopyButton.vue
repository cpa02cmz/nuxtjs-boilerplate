<template>
  <div class="copy-button-wrapper">
    <button
      ref="buttonRef"
      type="button"
      :class="[
        'copy-button flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-1',
        isCopied
          ? 'bg-green-100 text-green-700 focus:ring-green-500 copied'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 focus:ring-gray-400',
      ]"
      :aria-label="isCopied ? 'Copied!' : label"
      @click="handleCopy"
      @keydown="handleKeyDown"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <!-- Copy Icon -->
      <svg
        v-if="!isCopied"
        xmlns="http://www.w3.org/2000/svg"
        class="h-3.5 w-3.5 transition-transform duration-200"
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
      <span>{{ isCopied ? 'Copied!' : 'Copy' }}</span>
    </button>

    <!-- Success Tooltip - Palette's micro-UX enhancement! -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-1 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-1 scale-95"
    >
      <div
        v-if="showTooltip && isCopied"
        class="copy-tooltip"
        role="status"
        aria-live="polite"
      >
        <div class="copy-tooltip-content">
          <svg
            class="copy-tooltip-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span class="copy-tooltip-text">Copied to clipboard!</span>
        </div>
        <div class="copy-tooltip-arrow" />
      </div>
    </Transition>

    <!-- Keyboard shortcut hint - shown on focus -->
    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <kbd
        v-if="showShortcutHint && !isCopied"
        class="shortcut-hint"
        aria-hidden="true"
      >
        Ctrl+C
      </kbd>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { hapticSuccess, hapticLight } from '~/utils/hapticFeedback'

interface Props {
  content: string
  label?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  copied: []
}>()

const isCopied = ref(false)
const showTooltip = ref(false)
const showShortcutHint = ref(false)
const buttonRef = ref<HTMLButtonElement | null>(null)
let tooltipTimeout: ReturnType<typeof setTimeout> | null = null
let resetTimeout: ReturnType<typeof setTimeout> | null = null

// Handle copy action with enhanced feedback
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.content)
    isCopied.value = true
    showTooltip.value = true
    emit('copied')

    // Haptic feedback for mobile users - Palette's micro-UX delight!
    hapticSuccess()

    // Clear any existing timeouts
    if (tooltipTimeout) clearTimeout(tooltipTimeout)
    if (resetTimeout) clearTimeout(resetTimeout)

    // Hide tooltip after 1.5 seconds
    tooltipTimeout = setTimeout(() => {
      showTooltip.value = false
    }, 1500)

    // Reset copied state after 2 seconds
    resetTimeout = setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch {
    // Silently fail - clipboard API may not be available
    hapticLight()
  }
}

// Handle keyboard shortcuts - Palette's micro-UX enhancement!
const handleKeyDown = (event: KeyboardEvent) => {
  // Allow Ctrl+C or Cmd+C to trigger copy when button is focused
  if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
    event.preventDefault()
    handleCopy()
  }
}

// Show shortcut hint on focus
const handleFocus = () => {
  showShortcutHint.value = true
}

// Hide shortcut hint on blur
const handleBlur = () => {
  showShortcutHint.value = false
}

// Cleanup timeouts on unmount
onUnmounted(() => {
  if (tooltipTimeout) clearTimeout(tooltipTimeout)
  if (resetTimeout) clearTimeout(resetTimeout)
})
</script>

<style scoped>
/* Palette's micro-UX enhancement: Copy button wrapper for positioning */
.copy-button-wrapper {
  position: relative;
  display: inline-flex;
}

/* Enhanced button styles */
.copy-button {
  position: relative;
}

/* Success pulse animation - Palette's micro-UX delight! */
.copy-button.copied {
  animation: success-pulse 0.4s ease-out;
}

@keyframes success-pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
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

/* Palette's micro-UX enhancement: Success tooltip */
.copy-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  pointer-events: none;
}

.copy-tooltip-content {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

.copy-tooltip-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.copy-tooltip-text {
  line-height: 1;
}

.copy-tooltip-arrow {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #16a34a;
}

/* Palette's micro-UX enhancement: Keyboard shortcut hint */
.shortcut-hint {
  position: absolute;
  top: -24px;
  right: 0;
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  font-size: 10px;
  font-family:
    ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo,
    monospace;
  color: #6b7280;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .copy-button.copied {
    animation: none;
  }

  .animate-check-pop {
    animation: none;
  }
}
</style>
