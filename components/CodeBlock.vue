<template>
  <div
    ref="codeBlockRef"
    class="relative group"
    :class="{
      'animate-slide-in': !prefersReducedMotion,
      'is-focused': isFocused,
    }"
    :style="animationStyle"
    tabindex="0"
    role="region"
    :aria-label="`Code block: ${label}`"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @focus="isFocused = true"
    @blur="isFocused = false"
    @keydown="handleKeyDown"
  >
    <div
      :class="[
        `bg-gray-900 rounded-lg overflow-hidden shadow-md transition-shadow ${animationConfig.tailwindDurations.standard} group-hover:shadow-lg`,
        { 'ring-2 ring-blue-500 ring-offset-2': isFocused },
      ]"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700"
      >
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-red-500" aria-hidden="true" />
          <span class="w-3 h-3 rounded-full bg-yellow-500" aria-hidden="true" />
          <span class="w-3 h-3 rounded-full bg-green-500" aria-hidden="true" />
          <span class="ml-2 text-xs text-gray-400 font-mono">{{ label }}</span>
        </div>

        <!-- Copy Button with Keyboard Shortcut Hint -->
        <div class="flex items-center gap-2">
          <!-- Keyboard Shortcut Hint - Palette's micro-UX delight!
               Flexy hates hardcoded values! Using animationConfig.tailwindDurations -->
          <Transition
            :enter-active-class="`transition-all ${animationConfig.tailwindDurations.normal} ease-out`"
            enter-from-class="opacity-0 scale-95 translate-x-2"
            enter-to-class="opacity-100 scale-100 translate-x-0"
            :leave-active-class="`transition-all ${animationConfig.tailwindDurations.quick} ease-in`"
            leave-from-class="opacity-100 scale-100 translate-x-0"
            leave-to-class="opacity-0 scale-95 translate-x-2"
          >
            <kbd
              v-if="showShortcutHint && !prefersReducedMotion"
              class="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-400 bg-gray-700 rounded border border-gray-600"
              aria-hidden="true"
            >
              <span>{{ modifierKey }}</span>
              <span class="text-gray-500">+</span>
              <span>C</span>
            </kbd>
          </Transition>

          <CopyButton
            :content="code"
            :label="`Copy ${label} code`"
            @copied="handleCopied"
          />
        </div>
      </div>

      <!-- Code Content with Focus Indicator -->
      <div class="p-4 overflow-x-auto">
        <pre
          class="font-mono text-sm text-gray-100 leading-relaxed"
          :class="{ 'select-all': isFocused }"
        ><code>{{ code }}</code></pre>
      </div>

      <!-- Keyboard Shortcut Toast - Palette's micro-UX delight!
           Flexy hates hardcoded values! Using animationConfig.tailwindDurations -->
      <Transition
        :enter-active-class="`transition-all ${animationConfig.tailwindDurations.standard} ease-out`"
        enter-from-class="opacity-0 translate-y-2 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        :leave-active-class="`transition-all ${animationConfig.tailwindDurations.normal} ease-in`"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-2 scale-95"
      >
        <div
          v-if="showShortcutToast && !prefersReducedMotion"
          class="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10"
          role="status"
          aria-live="polite"
        >
          <div
            class="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Press {{ modifierKey }} + C to copy</span>
          </div>
        </div>
      </Transition>

      <!-- Screen Reader Announcement -->
      <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
        {{ announcement }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { hapticLight, hapticSuccess } from '~/utils/hapticFeedback'

interface Props {
  code: string
  label?: string
  delay?: number
  /** Show keyboard shortcut hint on hover */
  showKeyboardHint?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Code',
  delay: undefined,
  showKeyboardHint: true,
})

const emit = defineEmits<{
  copied: []
}>()

// Palette's micro-UX enhancement: Track interaction state
const codeBlockRef = ref<HTMLElement | null>(null)
const isHovered = ref(false)
const isFocused = ref(false)
const showShortcutHint = ref(false)
const showShortcutToast = ref(false)
const announcement = ref('')
let shortcutHintTimeout: ReturnType<typeof setTimeout> | null = null
let shortcutToastTimeout: ReturnType<typeof setTimeout> | null = null

// Check for reduced motion preference
const prefersReducedMotion = computed(() => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

// Detect platform for modifier key display
const isMac = computed(() => {
  if (typeof navigator === 'undefined') return false
  return navigator.platform.toLowerCase().includes('mac')
})

const modifierKey = computed(() => (isMac.value ? '⌘' : 'Ctrl'))

// Flexy hates hardcoded 100! Using animationConfig.codeBlock.staggerDelayMultiplierMs 🧩
const animationStyle = computed(() => {
  if (prefersReducedMotion.value || props.delay === undefined) return {}
  return {
    animationDelay: `${props.delay * animationConfig.codeBlock.staggerDelayMultiplierMs}ms`,
  }
})

// Palette's micro-UX enhancement: Show shortcut hint after delay
const showShortcutHintWithDelay = () => {
  if (!props.showKeyboardHint || prefersReducedMotion.value) return

  // Clear existing timeout
  if (shortcutHintTimeout) {
    clearTimeout(shortcutHintTimeout)
  }

  // Show hint after delay (prevents flashing on quick mouse passes)
  shortcutHintTimeout = setTimeout(() => {
    showShortcutHint.value = true
  }, animationConfig.codeBlock.shortcutHintDelayMs)
}

const hideShortcutHint = () => {
  if (shortcutHintTimeout) {
    clearTimeout(shortcutHintTimeout)
    shortcutHintTimeout = null
  }
  showShortcutHint.value = false
}

// Show keyboard shortcut toast
const showKeyboardShortcutToast = () => {
  if (prefersReducedMotion.value) return

  showShortcutToast.value = true

  if (shortcutToastTimeout) {
    clearTimeout(shortcutToastTimeout)
  }

  shortcutToastTimeout = setTimeout(() => {
    showShortcutToast.value = false
  }, animationConfig.codeBlock.shortcutToastDurationMs)
}

// Handle copy action
const handleCopied = () => {
  emit('copied')
  announcement.value = `Code copied to clipboard`
  hapticSuccess()

  // Clear announcement after delay - Flexy hates hardcoded 1000!
  setTimeout(() => {
    announcement.value = ''
  }, animationConfig.microInteractions.announcementDelayMs)
}

// Palette's micro-UX enhancement: Keyboard shortcut support
const handleKeyDown = (event: KeyboardEvent) => {
  // Cmd+C (Mac) or Ctrl+C (Windows/Linux) to copy
  if ((event.metaKey || event.ctrlKey) && event.key === 'c') {
    // Only handle if no text is selected (to allow normal copy behavior)
    const selection = window.getSelection()
    if (!selection || selection.toString().trim() === '') {
      event.preventDefault()
      copyToClipboard()
    }
  }

  // Show shortcut toast on first focus with Tab key
  if (event.key === 'Tab' && !event.shiftKey && isFocused.value) {
    showKeyboardShortcutToast()
  }
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    handleCopied()
  } catch {
    // Fallback: Announce failure
    announcement.value = 'Failed to copy code. Please use the copy button.'
    hapticLight()
  }
}

// Watch hover state to show/hide shortcut hint
watch(isHovered, newValue => {
  if (newValue) {
    showShortcutHintWithDelay()
  } else {
    hideShortcutHint()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (shortcutHintTimeout) {
    clearTimeout(shortcutHintTimeout)
  }
  if (shortcutToastTimeout) {
    clearTimeout(shortcutToastTimeout)
  }
})
</script>

<style scoped>
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in {
  opacity: 0;
  animation: slide-in 0.4s ease-out forwards;
}

/* Focus styles */
.is-focused pre {
  user-select: all;
}

/* Keyboard shortcut kbd styling */
kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
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

@media (prefers-reduced-motion: reduce) {
  .animate-slide-in {
    animation: none !important;
    opacity: 1;
  }
}
</style>
