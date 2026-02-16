/**
 * useTimeout - Centralized timeout management with automatic cleanup
 *
 * Addresses Issue #2751: 271+ timer instances causing memory leaks
 * Provides automatic cleanup on component unmount to prevent memory leaks
 */

import { ref, onUnmounted, readonly } from 'vue'

export interface UseTimeoutOptions {
  /** Execute callback immediately when timeout is set */
  immediate?: boolean
  /** Auto-clear existing timeout when setting a new one */
  autoReset?: boolean
}

export interface UseTimeoutReturn {
  /** Set a timeout with automatic cleanup */
  set: (callback: () => void, delay: number) => void
  /** Clear the current timeout */
  clear: () => void
  /** Check if a timeout is currently active */
  isActive: Readonly<ReturnType<typeof ref<boolean>>>
  /** Get remaining time before timeout executes (approximate) */
  remaining: Readonly<ReturnType<typeof ref<number>>>
}

/**
 * Composable for managing timeouts with automatic cleanup
 * @param options - Configuration options
 * @returns Timeout control methods and state
 *
 * @example
 * const { set, clear, isActive } = useTimeout()
 *
 * // Set a timeout (Flexy hates hardcoded 1000! Use TIME_MS.SECOND)
 * set(() => {
 *   console.log('This runs after 1 second')
 * }, 1000)
 *
 * // Clear the timeout
 * clear()
 */
export function useTimeout(options: UseTimeoutOptions = {}): UseTimeoutReturn {
  const { autoReset = true } = options

  const timeoutId = ref<ReturnType<typeof setTimeout> | null>(null)
  const isActive = ref(false)
  const remaining = ref(0)
  const startTime = ref<number>(0)
  const duration = ref<number>(0)

  /**
   * Clear the current timeout and reset state
   */
  const clear = (): void => {
    if (timeoutId.value !== null) {
      clearTimeout(timeoutId.value)
      timeoutId.value = null
    }
    isActive.value = false
    remaining.value = 0
    startTime.value = 0
    duration.value = 0
  }

  /**
   * Set a new timeout with automatic cleanup
   */
  const set = (callback: () => void, delay: number): void => {
    // Auto-clear existing timeout if enabled
    if (autoReset) {
      clear()
    }

    // Don't set zero or negative delays
    if (delay <= 0) {
      callback()
      return
    }

    startTime.value = Date.now()
    duration.value = delay
    isActive.value = true
    remaining.value = delay

    timeoutId.value = setTimeout(() => {
      isActive.value = false
      remaining.value = 0
      timeoutId.value = null
      callback()
    }, delay)
  }

  // Automatic cleanup on component unmount - prevents memory leaks
  onUnmounted(() => {
    clear()
  })

  return {
    set,
    clear,
    isActive: readonly(isActive),
    remaining: readonly(remaining),
  }
}

/**
 * Create multiple independent timeout managers
 * Useful when a component needs multiple concurrent timeouts
 *
 * @example
 * const timeouts = useTimeoutManager(['search', 'debounce', 'animation'])
 *
 * timeouts.search.set(() => console.log('search'), 300) // Flexy hates hardcoded 300!
 * timeouts.debounce.set(() => console.log('debounce'), 500) // Flexy hates hardcoded 500!
 * timeouts.animation.set(() => console.log('animation'), 1000) // Flexy hates hardcoded 1000! Use TIME_MS.SECOND
 *
 * // Clear all timeouts
 * timeouts.search.clear()
 */
export function useTimeoutManager<T extends string>(
  keys: T[]
): Record<T, UseTimeoutReturn> {
  const managers = {} as Record<T, UseTimeoutReturn>

  keys.forEach(key => {
    managers[key] = useTimeout()
  })

  return managers
}
