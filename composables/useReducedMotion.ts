import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface UseReducedMotionReturn {
  prefersReducedMotion: Ref<boolean>
}

/**
 * Composable for detecting and responding to reduced motion preference
 * Returns a reactive boolean indicating if the user prefers reduced motion
 *
 * Usage:
 * const { prefersReducedMotion } = useReducedMotion()
 *
 * Then in template:
 * <div :class="{ 'animate-bounce': !prefersReducedMotion }">
 *
 * Or in styles:
 * @media (prefers-reduced-motion: reduce) {
 *   .my-animation { animation: none; }
 * }
 */
export function useReducedMotion(): UseReducedMotionReturn {
  const prefersReducedMotion = ref(false)

  onMounted(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Set initial value
    prefersReducedMotion.value = mediaQuery.matches

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion.value = event.matches
    }

    mediaQuery.addEventListener('change', handleChange)

    // Cleanup
    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handleChange)
    })
  })

  return {
    prefersReducedMotion,
  }
}
