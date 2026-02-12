import { ref, onUnmounted } from 'vue'

/**
 * Composable for managing focus during loading states
 * Ensures accessibility by returning focus to the triggering element
 * after loading completes
 */
export function useLoadingFocus() {
  // Store the element that triggered the loading state
  const triggerElement = ref<HTMLElement | null>(null)
  const isLoading = ref(false)

  /**
   * Save the currently focused element before starting loading
   * Call this when the user triggers a loading action (e.g., form submit, button click)
   */
  const saveTriggerElement = () => {
    if (typeof document === 'undefined') return

    // Only save if there's an active element and it's not the body
    const activeElement = document.activeElement as HTMLElement
    if (activeElement && activeElement.tagName !== 'BODY') {
      triggerElement.value = activeElement
    }
  }

  /**
   * Start the loading state and save the trigger element
   */
  const startLoading = () => {
    saveTriggerElement()
    isLoading.value = true
  }

  /**
   * Complete loading and optionally return focus to the trigger element
   * @param options Configuration for focus management
   * @param options.returnFocus Whether to return focus to the trigger element (default: true)
   * @param options.delay Delay in ms before returning focus (default: 0)
   * @param options.fallbackSelector CSS selector for fallback element if trigger is not available
   */
  const completeLoading = (
    options: {
      returnFocus?: boolean
      delay?: number
      fallbackSelector?: string
    } = {}
  ) => {
    const { returnFocus = true, delay = 0, fallbackSelector } = options

    isLoading.value = false

    if (!returnFocus) {
      triggerElement.value = null
      return
    }

    const returnFocusToElement = () => {
      if (typeof document === 'undefined') return

      // Try to focus the trigger element first
      if (triggerElement.value && document.contains(triggerElement.value)) {
        // Check if element is still focusable
        const isFocusable =
          triggerElement.value.tabIndex >= 0 ||
          ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(
            triggerElement.value.tagName
          )

        if (isFocusable) {
          triggerElement.value.focus()
        } else {
          // If not focusable, try to find a focusable child
          const focusableChild = triggerElement.value.querySelector(
            'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement
          if (focusableChild) {
            focusableChild.focus()
          }
        }
      } else if (fallbackSelector && typeof document !== 'undefined') {
        // Try fallback selector
        const fallback = document.querySelector(fallbackSelector) as HTMLElement
        if (fallback) {
          fallback.focus()
        }
      }

      // Clear the stored reference
      triggerElement.value = null
    }

    if (delay > 0) {
      setTimeout(returnFocusToElement, delay)
    } else {
      returnFocusToElement()
    }
  }

  /**
   * Cancel loading and return focus to the trigger element
   */
  const cancelLoading = () => {
    completeLoading({ returnFocus: true })
  }

  // Clean up on unmount
  onUnmounted(() => {
    triggerElement.value = null
  })

  return {
    isLoading,
    triggerElement,
    saveTriggerElement,
    startLoading,
    completeLoading,
    cancelLoading,
  }
}
