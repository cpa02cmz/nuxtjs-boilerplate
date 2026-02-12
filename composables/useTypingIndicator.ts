import { ref, onUnmounted } from 'vue'

interface TypingIndicatorOptions {
  /**
   * Duration to show the typing indicator after last keystroke (ms)
   * @default 800
   */
  indicatorDurationMs?: number
  /**
   * Enable haptic feedback on mobile devices
   * @default true
   */
  hapticFeedback?: boolean
}

/**
 * Typing Indicator Micro-UX
 *
 * Palette's delightful touch! ✨
 * Provides visual feedback when users are typing in form inputs.
 * Shows a subtle animated cursor indicator to confirm input is being registered,
 * especially helpful on slower connections or for adding a touch of responsiveness.
 *
 * Features:
 * - Animated typing cursor indicator
 * - Haptic feedback on supported devices
 * - Auto-dismiss after typing stops
 * - Reduced motion support
 * - Configurable timing
 *
 * @example
 * ```vue
 * <script setup>
 * import { useTypingIndicator } from '~/composables/useTypingIndicator'
 * import TypingIndicator from '~/components/TypingIndicator.vue'
 *
 * const { isTyping, startTyping, stopTyping } = useTypingIndicator()
 * </script>
 *
 * <template>
 *   <div class="relative">
 *     <input @input="startTyping" @blur="stopTyping" />
 *     <TypingIndicator :is-visible="isTyping" />
 *   </div>
 * </template>
 * ```
 */
export const useTypingIndicator = (options: TypingIndicatorOptions = {}) => {
  const { indicatorDurationMs = 800, hapticFeedback = true } = options

  const isTyping = ref(false)
  let typingTimeout: ReturnType<typeof setTimeout> | null = null
  let hapticTimeout: ReturnType<typeof setTimeout> | null = null

  /**
   * Trigger light haptic feedback
   */
  const triggerHaptic = () => {
    if (
      !hapticFeedback ||
      typeof navigator === 'undefined' ||
      !navigator.vibrate
    ) {
      return
    }

    // Very light tap - 5ms
    navigator.vibrate(5)
  }

  /**
   * Start typing indicator
   * Call this on input events
   */
  const startTyping = () => {
    isTyping.value = true

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    // Clear existing haptic timeout
    if (hapticTimeout) {
      clearTimeout(hapticTimeout)
    }

    // Trigger haptic feedback with debounce (max once per 100ms)
    hapticTimeout = setTimeout(() => {
      triggerHaptic()
    }, 50)

    // Auto-hide after duration
    typingTimeout = setTimeout(() => {
      isTyping.value = false
    }, indicatorDurationMs)
  }

  /**
   * Stop typing indicator immediately
   * Call this on blur or when needed
   */
  const stopTyping = () => {
    isTyping.value = false

    if (typingTimeout) {
      clearTimeout(typingTimeout)
      typingTimeout = null
    }

    if (hapticTimeout) {
      clearTimeout(hapticTimeout)
      hapticTimeout = null
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopTyping()
  })

  return {
    isTyping,
    startTyping,
    stopTyping,
  }
}

export default useTypingIndicator
