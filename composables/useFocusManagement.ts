/**
 * Composable for managing focus in accessible components
 */

// Comprehensive selector for all focusable elements (WCAG 2.1 compliant)
// Includes: buttons, links, form controls, tabbable elements, summary/details,
// media controls, editable content, and iframes
const FOCUSABLE_ELEMENTS_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled]), summary, details > summary, audio[controls], video[controls], [contenteditable]:not([contenteditable="false"]), iframe, object, embed'

// Explicit return type for useFocusManagement composable
export interface UseFocusManagementReturn {
  trapFocus: (element: HTMLElement | null) => (() => void) | undefined
  focusFirstElement: (container: HTMLElement | null) => void
  focusElement: (element: HTMLElement | null) => void
}

export const useFocusManagement = (): UseFocusManagementReturn => {
  /**
   * Trap focus within an element - useful for modals and dropdowns
   */
  const trapFocus = (element: HTMLElement | null) => {
    if (!element) return

    const focusableElements = element.querySelectorAll(
      FOCUSABLE_ELEMENTS_SELECTOR
    )

    if (focusableElements.length === 0) return

    const firstFocusable = focusableElements[0] as HTMLElement
    const lastFocusable = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (typeof document === 'undefined') return

      if (e.shiftKey && document.activeElement === firstFocusable) {
        // If shift-tabbing from first element, go to last
        lastFocusable.focus()
        e.preventDefault()
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        // If tabbing from last element, go to first
        firstFocusable.focus()
        e.preventDefault()
      }
    }

    // Focus the first element to start
    firstFocusable.focus()

    // Add event listener to trap focus
    element.addEventListener('keydown', handleKeyDown)

    // Return cleanup function
    return () => {
      element.removeEventListener('keydown', handleKeyDown)
    }
  }

  /**
   * Focus the first focusable element in a container
   */
  const focusFirstElement = (container: HTMLElement | null) => {
    if (!container) return

    const firstFocusable = container.querySelector(
      FOCUSABLE_ELEMENTS_SELECTOR
    ) as HTMLElement | null

    if (firstFocusable) {
      firstFocusable.focus()
    }
  }

  /**
   * Move focus to an element and scroll if needed
   */
  const focusElement = (element: HTMLElement | null) => {
    if (element) {
      element.focus({ preventScroll: false })
    }
  }

  return {
    trapFocus,
    focusFirstElement,
    focusElement,
  }
}
