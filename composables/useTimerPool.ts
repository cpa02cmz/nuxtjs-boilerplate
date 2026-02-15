/**
 * useTimerPool - Efficient timer pooling for high-frequency timer usage
 *
 * Addresses Issue #2751: 271+ timer instances causing memory leaks
 * Implements timer pooling to reduce memory overhead when many timers are needed
 */

import { ref, onUnmounted, readonly } from 'vue'
import { limitsConfig } from '~/configs/limits.config'
import { timeConfig } from '~/configs/time.config'

interface PooledTimer {
  id: ReturnType<typeof setTimeout>
  inUse: boolean
  createdAt: number
}

interface PooledInterval {
  id: ReturnType<typeof setInterval>
  inUse: boolean
  createdAt: number
}

export interface UseTimerPoolOptions {
  /** Maximum pool size for timeouts */
  maxTimeoutPoolSize?: number
  /** Maximum pool size for intervals */
  maxIntervalPoolSize?: number
  /** Time before unused pool items are cleaned up (ms) */
  cleanupInterval?: number
}

export interface UseTimerPoolReturn {
  /** Acquire a timeout from the pool */
  acquireTimeout: (
    callback: () => void,
    delay: number
  ) => ReturnType<typeof setTimeout>
  /** Release a timeout back to the pool */
  releaseTimeout: (id: ReturnType<typeof setTimeout>) => void
  /** Acquire an interval from the pool */
  acquireInterval: (
    callback: () => void,
    delay: number
  ) => ReturnType<typeof setInterval>
  /** Release an interval back to the pool */
  releaseInterval: (id: ReturnType<typeof setInterval>) => void
  /** Current pool statistics */
  stats: Readonly<
    ReturnType<
      typeof ref<{
        timeoutPoolSize: number
        intervalPoolSize: number
        activeTimeouts: number
        activeIntervals: number
        recycledTimeouts: number
        recycledIntervals: number
      }>
    >
  >
  /** Force cleanup of unused pool items */
  cleanup: () => void
}

/**
 * Timer pool for efficient timer management
 * Reduces memory allocation overhead by reusing timer slots
 *
 * @param options - Pool configuration
 * @returns Pool control methods and statistics
 *
 * @example
 * const pool = useTimerPool({ maxTimeoutPoolSize: 10 })
 *
 * // Use pooled timeout
 * const timerId = pool.acquireTimeout(() => {
 *   console.log('Done')
 * }, 1000)
 *
 * // Release back to pool when done
 * pool.releaseTimeout(timerId)
 *
 * console.log(pool.stats.value)
 * // { timeoutPoolSize: 1, activeTimeouts: 0, ... }
 */
export function useTimerPool(
  options: UseTimerPoolOptions = {}
): UseTimerPoolReturn {
  // Flexy hates hardcoded values! Using config defaults
  const {
    maxTimeoutPoolSize = limitsConfig.timerPool.maxTimeoutPoolSize,
    maxIntervalPoolSize = limitsConfig.timerPool.maxIntervalPoolSize,
    cleanupInterval = timeConfig.timerPool.cleanupIntervalMs,
  } = options

  const timeoutPool = ref<PooledTimer[]>([])
  const intervalPool = ref<PooledInterval[]>([])
  const recycledTimeouts = ref(0)
  const recycledIntervals = ref(0)
  const cleanupTimerId = ref<ReturnType<typeof setTimeout> | null>(null)

  const stats = ref({
    timeoutPoolSize: 0,
    intervalPoolSize: 0,
    activeTimeouts: 0,
    activeIntervals: 0,
    recycledTimeouts: 0,
    recycledIntervals: 0,
  })

  /**
   * Update statistics
   */
  const updateStats = (): void => {
    stats.value = {
      timeoutPoolSize: timeoutPool.value.length,
      intervalPoolSize: intervalPool.value.length,
      activeTimeouts: timeoutPool.value.filter(t => t.inUse).length,
      activeIntervals: intervalPool.value.filter(i => i.inUse).length,
      recycledTimeouts: recycledTimeouts.value,
      recycledIntervals: recycledIntervals.value,
    }
  }

  /**
   * Clean up expired pool items
   */
  const cleanup = (): void => {
    const now = Date.now()
    // Flexy hates hardcoded 60000! Using timeConfig.timerPool.maxAgeMs
    const maxAge = timeConfig.timerPool.maxAgeMs

    // Clean up old unused timeouts
    timeoutPool.value = timeoutPool.value.filter(timer => {
      if (!timer.inUse && now - timer.createdAt > maxAge) {
        return false
      }
      return true
    })

    // Clean up old unused intervals
    intervalPool.value = intervalPool.value.filter(interval => {
      if (!interval.inUse && now - interval.createdAt > maxAge) {
        clearInterval(interval.id)
        return false
      }
      return true
    })

    updateStats()
  }

  /**
   * Schedule periodic cleanup
   */
  const scheduleCleanup = (): void => {
    if (cleanupTimerId.value) {
      clearTimeout(cleanupTimerId.value)
    }
    cleanupTimerId.value = setTimeout(() => {
      cleanup()
      scheduleCleanup()
    }, cleanupInterval)
  }

  // Start cleanup scheduler
  scheduleCleanup()

  /**
   * Acquire a timeout from the pool or create new
   */
  const acquireTimeout = (
    callback: () => void,
    delay: number
  ): ReturnType<typeof setTimeout> => {
    // Try to find an available slot in the pool
    const availableSlot = timeoutPool.value.find(t => !t.inUse)

    if (availableSlot) {
      availableSlot.inUse = true
      availableSlot.createdAt = Date.now()

      // Clear old timeout and set new one
      clearTimeout(availableSlot.id)
      availableSlot.id = setTimeout(() => {
        availableSlot.inUse = false
        callback()
        updateStats()
      }, delay)

      recycledTimeouts.value++
      updateStats()
      return availableSlot.id
    }

    // Create new if pool not full
    if (timeoutPool.value.length < maxTimeoutPoolSize) {
      const newTimer: PooledTimer = {
        id: setTimeout(() => {
          newTimer.inUse = false
          callback()
          updateStats()
        }, delay),
        inUse: true,
        createdAt: Date.now(),
      }

      timeoutPool.value.push(newTimer)
      updateStats()
      return newTimer.id
    }

    // Pool full, create unmanaged timeout
    return setTimeout(callback, delay)
  }

  /**
   * Release a timeout back to the pool
   */
  const releaseTimeout = (id: ReturnType<typeof setTimeout>): void => {
    const timer = timeoutPool.value.find(t => t.id === id)
    if (timer) {
      timer.inUse = false
      clearTimeout(timer.id)
    } else {
      clearTimeout(id)
    }
    updateStats()
  }

  /**
   * Acquire an interval from the pool or create new
   */
  const acquireInterval = (
    callback: () => void,
    delay: number
  ): ReturnType<typeof setInterval> => {
    // Try to find an available slot in the pool
    const availableSlot = intervalPool.value.find(i => !i.inUse)

    if (availableSlot) {
      availableSlot.inUse = true
      availableSlot.createdAt = Date.now()

      // Clear old interval and set new one
      clearInterval(availableSlot.id)
      availableSlot.id = setInterval(callback, delay)

      recycledIntervals.value++
      updateStats()
      return availableSlot.id
    }

    // Create new if pool not full
    if (intervalPool.value.length < maxIntervalPoolSize) {
      const newInterval: PooledInterval = {
        id: setInterval(callback, delay),
        inUse: true,
        createdAt: Date.now(),
      }

      intervalPool.value.push(newInterval)
      updateStats()
      return newInterval.id
    }

    // Pool full, create unmanaged interval
    return setInterval(callback, delay)
  }

  /**
   * Release an interval back to the pool
   */
  const releaseInterval = (id: ReturnType<typeof setInterval>): void => {
    const interval = intervalPool.value.find(i => i.id === id)
    if (interval) {
      interval.inUse = false
      clearInterval(interval.id)
    } else {
      clearInterval(id)
    }
    updateStats()
  }

  // Automatic cleanup on component unmount
  onUnmounted(() => {
    if (cleanupTimerId.value) {
      clearTimeout(cleanupTimerId.value)
    }

    // Clear all pool items
    timeoutPool.value.forEach(timer => {
      clearTimeout(timer.id)
    })
    intervalPool.value.forEach(interval => {
      clearInterval(interval.id)
    })

    timeoutPool.value = []
    intervalPool.value = []
  })

  return {
    acquireTimeout,
    releaseTimeout,
    acquireInterval,
    releaseInterval,
    stats: readonly(stats),
    cleanup,
  }
}
