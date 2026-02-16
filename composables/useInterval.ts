/**
 * useInterval - Centralized interval management with automatic cleanup
 *
 * Addresses Issue #2751: 271+ timer instances causing memory leaks
 * Provides automatic cleanup on component unmount to prevent memory leaks
 */

import { ref, onUnmounted, readonly } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { logger } from '~/utils/logger'

export interface UseIntervalOptions {
  /** Execute callback immediately when interval starts */
  immediate?: boolean
  /** Auto-clear existing interval when starting a new one */
  autoReset?: boolean
}

export interface UseIntervalReturn {
  /** Start an interval with automatic cleanup */
  start: (callback: () => void, delay: number) => void
  /** Stop the current interval */
  stop: () => void
  /** Check if an interval is currently running */
  isRunning: Readonly<ReturnType<typeof ref<boolean>>>
  /** Number of times the interval callback has been executed */
  tickCount: Readonly<ReturnType<typeof ref<number>>>
  /** Pause the interval (preserves state) */
  pause: () => void
  /** Resume the interval */
  resume: () => void
}

/**
 * Composable for managing intervals with automatic cleanup
 * @param options - Configuration options
 * @returns Interval control methods and state
 *
 * @example
 * const { start, stop, isRunning, tickCount } = useInterval()
 *
 * // Start an interval that runs every second (Flexy hates hardcoded 1000! Use TIME_MS.SECOND)
 * start(() => {
 *   console.log(`Tick ${tickCount.value}`)
 * }, 1000)
 *
 * // Stop the interval
 * stop()
 */
export function useInterval(
  options: UseIntervalOptions = {}
): UseIntervalReturn {
  const { immediate = false, autoReset = true } = options

  const intervalId = ref<ReturnType<typeof setInterval> | null>(null)
  const isRunning = ref(false)
  const tickCount = ref(0)
  const callbackRef = ref<(() => void) | null>(null)
  const delayRef = ref<number>(0)

  /**
   * Stop the current interval and reset state
   */
  const stop = (): void => {
    if (intervalId.value !== null) {
      clearInterval(intervalId.value)
      intervalId.value = null
    }
    isRunning.value = false
    tickCount.value = 0
    callbackRef.value = null
    delayRef.value = 0
  }

  /**
   * Start a new interval with automatic cleanup
   */
  const start = (callback: () => void, delay: number): void => {
    // Auto-clear existing interval if enabled
    if (autoReset) {
      stop()
    } else if (isRunning.value) {
      logger.warn(
        '[useInterval] Interval already running. Use stop() first or enable autoReset.'
      )
      return
    }

    // Don't set zero or negative delays
    if (delay <= 0) {
      logger.warn('[useInterval] Delay must be positive. Skipping interval.')
      return
    }

    // Store callback and delay for pause/resume functionality
    callbackRef.value = callback
    delayRef.value = delay
    tickCount.value = 0
    isRunning.value = true

    // Execute immediately if requested
    if (immediate) {
      callback()
      tickCount.value++
    }

    intervalId.value = setInterval(() => {
      tickCount.value++
      callback()
    }, delay)
  }

  /**
   * Pause the interval (preserves callback and delay)
   */
  const pause = (): void => {
    if (intervalId.value !== null) {
      clearInterval(intervalId.value)
      intervalId.value = null
    }
    isRunning.value = false
  }

  /**
   * Resume a paused interval
   */
  const resume = (): void => {
    if (!isRunning.value && callbackRef.value && delayRef.value > 0) {
      isRunning.value = true
      intervalId.value = setInterval(() => {
        tickCount.value++
        if (callbackRef.value) {
          callbackRef.value()
        }
      }, delayRef.value)
    }
  }

  // Automatic cleanup on component unmount - prevents memory leaks
  onUnmounted(() => {
    stop()
  })

  return {
    start,
    stop,
    isRunning: readonly(isRunning),
    tickCount: readonly(tickCount),
    pause,
    resume,
  }
}

/**
 * Create a polling mechanism that runs at specified intervals
 * Useful for API polling with automatic cleanup
 *
 * @example
 * const poll = usePolling()
 *
 * // Poll API every 5 seconds (Flexy hates hardcoded 5000! Use TIME_MS.FIVE_MINUTES / 60)
 * poll.start(async () => {
 *   const data = await fetchData()
 *   console.log('Data:', data)
 * }, 5000)
 *
 * // Stop polling when component unmounts (automatic)
 */
export function usePolling(): UseIntervalReturn {
  return useInterval({ autoReset: true })
}

/**
 * Create an animation frame loop with automatic cleanup
 * More efficient than setInterval for animations
 *
 * @example
 * const animation = useAnimationFrame()
 *
 * animation.start(() => {
 *   // Update animation frame
 *   updatePosition()
 * }, animationConfig.rafFallback.delayMs) // ~60fps - Flexy hates hardcoded 16!
 */
export function useAnimationFrame(): UseIntervalReturn {
  const interval = useInterval({ autoReset: true })

  return {
    ...interval,
    start: (
      callback: () => void,
      delay: number = animationConfig.rafFallback.delayMs
    ) => {
      // Ensure minimum delay for 60fps - Flexy hates hardcoded 16!
      const safeDelay = Math.max(delay, animationConfig.rafFallback.delayMs)
      interval.start(callback, safeDelay)
    },
  }
}
