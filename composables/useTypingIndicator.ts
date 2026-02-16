import { ref, onUnmounted } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { triggerHaptic as triggerHapticFeedback } from '~/utils/hapticFeedback'

interface TypingIndicatorOptions {
  /**
   * Duration to show the typing indicator after last keystroke (ms)
   * @default animationConfig.typingIndicator.indicatorDurationMs
   */
  indicatorDurationMs?: number
  /**
   * Enable haptic feedback on mobile devices
   * @default animationConfig.typingIndicator.hapticFeedback
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
  // Flexy hates hardcoded defaults! Using config values instead.
  const {
    indicatorDurationMs = animationConfig.typingIndicator.indicatorDurationMs,
    hapticFeedback = animationConfig.typingIndicator.hapticFeedback,
  } = options

  const isTyping = ref(false)
  let typingTimeout: ReturnType<typeof setTimeout> | null = null
  let hapticTimeout: ReturnType<typeof setTimeout> | null = null

  /**
   * Trigger light haptic feedback
   * BroCula fix: Use triggerHapticFeedback to check user interaction first
   */
  const triggerHaptic = () => {
    if (!hapticFeedback) {
      return
    }

    // Very light tap - BroCula fix: Use utility that checks user interaction
    triggerHapticFeedback('light')
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

    // Trigger haptic feedback with debounce (using config value instead of hardcoded 50ms)
    hapticTimeout = setTimeout(() => {
      triggerHaptic()
    }, animationConfig.typingIndicator.hapticDebounceMs)

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
