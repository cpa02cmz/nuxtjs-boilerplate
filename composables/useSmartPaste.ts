/**
 * Smart Paste Composable - Enhanced Paste UX with Visual Feedback
 * Palette's micro-UX touch! Provides delightful feedback when users paste content.
 *
 * Features:
 * - Automatic whitespace trimming
 * - Visual indicator at paste position
 * - Screen reader announcements
 * - Respects reduced motion preferences
 */

import { reactive, readonly, nextTick } from 'vue'
import { animationConfig } from '~/configs/animation.config'

export interface SmartPasteOptions {
  trimWhitespace?: boolean
  showIndicator?: boolean
  indicatorDuration?: number
  onPaste?: (value: string) => void
}

export interface SmartPasteState {
  showIndicator: boolean
  indicatorPosition: { x: number; y: number }
  indicatorMessage: string
}

export interface SmartPasteReturn {
  state: SmartPasteState
  handlePaste: (event: ClipboardEvent) => void
  dismissIndicator: () => void
}

/**
 * Creates a smart paste handler with visual feedback
 *
 * @param inputRef - Reference to the input element
 * @param options - Configuration options
 * @returns SmartPasteReturn with handler methods and state
 *
 * @example
 * ```vue
 * <script setup>
 * const inputRef = ref<HTMLInputElement>()
 * const { state, handlePaste } = useSmartPaste(inputRef, {
 *   trimWhitespace: true,
 *   showIndicator: true
 * })
 * </script>
 *
 * <template>
 *   <input
 *     ref="inputRef"
 *     @paste="handlePaste"
 *   />
 *   <!-- Paste indicator -->
 *   <div
 *     v-if="state.showIndicator"
 *     class="paste-indicator"
 *     :style="{ left: state.indicatorPosition.x + 'px', top: state.indicatorPosition.y + 'px' }"
 *   >
 *     {{ state.indicatorMessage }}
 *   </div>
 * </template>
 * ```
 */
export function useSmartPaste(
  inputRef: Ref<HTMLInputElement | HTMLTextAreaElement | null>,
  options: SmartPasteOptions = {}
): SmartPasteReturn {
  const config = {
    trimWhitespace: options.trimWhitespace ?? true,
    showIndicator: options.showIndicator ?? true,
    indicatorDuration:
      options.indicatorDuration ||
      animationConfig.smartPaste.indicatorDurationMs ||
      1200,
    onPaste: options.onPaste,
  }

  const state = reactive<SmartPasteState>({
    showIndicator: false,
    indicatorPosition: { x: 0, y: 0 },
    indicatorMessage: 'Pasted!',
  })

  let indicatorTimeout: ReturnType<typeof setTimeout> | null = null

  /**
   * Dismiss the paste indicator
   */
  const dismissIndicator = () => {
    state.showIndicator = false
    if (indicatorTimeout) {
      clearTimeout(indicatorTimeout)
      indicatorTimeout = null
    }
  }

  /**
   * Show the paste indicator at the specified position
   */
  const showPasteIndicator = (x: number, y: number, message: string) => {
    // Check for reduced motion preference
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      if (prefersReducedMotion) {
        // For reduced motion, just announce without visual indicator
        announceToScreenReader(message)
        return
      }
    }

    // Clear any existing timeout
    if (indicatorTimeout) {
      clearTimeout(indicatorTimeout)
    }

    // Update state
    state.indicatorPosition = { x, y }
    state.indicatorMessage = message
    state.showIndicator = true

    // Auto-dismiss after duration
    indicatorTimeout = setTimeout(() => {
      state.showIndicator = false
    }, config.indicatorDuration)
  }

  /**
   * Announce message to screen readers
   */
  const announceToScreenReader = (message: string) => {
    if (typeof window === 'undefined') return

    const announcement = document.createElement('div')
    announcement.setAttribute('role', 'status')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement - Flexy hates hardcoded 1000! Using config value
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, animationConfig.smartPaste.announcementTimeoutMs)
  }

  /**
   * Handle paste event with smart processing
   */
  const handlePaste = async (event: ClipboardEvent) => {
    const input = inputRef.value
    if (!input) return

    // Get pasted text
    const pastedText = event.clipboardData?.getData('text') || ''

    // Process the text (trim whitespace if enabled)
    const processedText = config.trimWhitespace ? pastedText.trim() : pastedText

    // If we modified the text, prevent default and insert manually
    if (config.trimWhitespace && processedText !== pastedText) {
      event.preventDefault()

      // Get current selection
      const start = input.selectionStart || 0
      const end = input.selectionEnd || 0
      const currentValue = input.value

      // Insert processed text at cursor position
      const newValue =
        currentValue.substring(0, start) +
        processedText +
        currentValue.substring(end)

      // Update input value
      input.value = newValue

      // Trigger input event for v-model compatibility
      input.dispatchEvent(new Event('input', { bubbles: true }))

      // Set cursor position after pasted text
      await nextTick()
      const newCursorPosition = start + processedText.length
      input.setSelectionRange(newCursorPosition, newCursorPosition)
    }

    // Show visual indicator at input position
    if (config.showIndicator) {
      const rect = input.getBoundingClientRect()

      // Position indicator above the input field
      const indicatorX = rect.left + rect.width / 2
      const indicatorY = rect.top

      const message = config.trimWhitespace ? 'Pasted & trimmed!' : 'Pasted!'

      showPasteIndicator(indicatorX, indicatorY, message)
    }

    // Call optional callback
    if (config.onPaste) {
      config.onPaste(processedText)
    }

    // Announce to screen readers
    announceToScreenReader(
      `Content pasted${config.trimWhitespace ? ' and trimmed' : ''}`
    )
  }

  return {
    state: readonly(state) as SmartPasteState,
    handlePaste,
    dismissIndicator,
  }
}

/**
 * Default styles for paste indicator
 * Add this to your global CSS or component styles
 */
// Flexy hates hardcoded CSS values! Using configurable values from animationConfig
function generateSmartPasteStyles(): string {
  const cfg = animationConfig.smartPaste
  const styles = cfg.styles

  return `
.paste-indicator {
  position: fixed;
  z-index: ${cfg.zIndex};
  pointer-events: none;
  padding: ${styles.paddingY}px ${styles.paddingX}px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-size: ${styles.fontSize}px;
  font-weight: 600;
  border-radius: ${styles.borderRadius}px;
  box-shadow:
    0 ${styles.shadow.y}px ${styles.shadow.blur}px ${styles.shadow.spread}px rgba(0, 0, 0, ${styles.shadow.opacity}),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  white-space: nowrap;
  animation: paste-indicator-pop ${styles.animationDuration}s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  transform: translate(-50%, -100%);
  margin-top: -${cfg.verticalOffset}px;
}

.paste-indicator::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: ${styles.arrowSize}px;
  height: ${styles.arrowSize}px;
  background: #059669;
  border-radius: 1px;
}

@keyframes paste-indicator-pop {
  0% {
    opacity: 0;
    transform: translate(-50%, -80%) scale(0.8);
  }
  50% {
    transform: translate(-50%, -110%) scale(${cfg.popScale});
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -100%) scale(1);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .paste-indicator {
    animation: none;
    opacity: 1;
    transform: translate(-50%, -100%);
  }
}
`
}

export const smartPasteStyles = generateSmartPasteStyles()

export default useSmartPaste
