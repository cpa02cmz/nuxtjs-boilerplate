import { ref, computed, onUnmounted, getCurrentInstance } from 'vue'
import { animationConfig } from '~/configs/animation.config'

interface UsePressAndHoldOptions {
  /** Duration in ms to hold before triggering action */
  durationMs?: number
  /** Callback when hold is completed */
  onComplete: () => void
  /** Callback when hold is cancelled */
  onCancel?: () => void
  /** Whether to respect reduced motion preference */
  respectReducedMotion?: boolean
}

interface PressAndHoldState {
  /** Whether user is currently pressing */
  isPressing: boolean
  /** Current progress (0-100) */
  progress: number
  /** Whether the action was triggered */
  isComplete: boolean
}

/**
 * Composable for press and hold interactions
 * Prevents accidental actions by requiring intentional long-press
 *
 * @example
 * ```vue
 * <button
 *   @mousedown="startPress"
 *   @mouseup="endPress"
 *   @mouseleave="endPress"
 *   @touchstart="startPress"
 *   @touchend="endPress"
 * >
 *   <svg :style="progressStyle">...</svg>
 *   Delete
 * </button>
 * ```
 */
export function usePressAndHold(options: UsePressAndHoldOptions) {
  const {
    durationMs = animationConfig.pressAndHold.durationMs,
    onComplete,
    onCancel,
    respectReducedMotion = animationConfig.pressAndHold.respectReducedMotion,
  } = options

  const state = ref<PressAndHoldState>({
    isPressing: false,
    progress: 0,
    isComplete: false,
  })

  let pressTimer: ReturnType<typeof setInterval> | null = null
  let startTime: number | null = null
  // BugFixer #2800: Track timeout IDs for cleanup to prevent memory leaks
  let resetTimeoutId: ReturnType<typeof setTimeout> | null = null
  let completionResetTimeoutId: ReturnType<typeof setTimeout> | null = null

  // Check for reduced motion preference
  const checkReducedMotion = () => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    )
      return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  // Calculate progress ring style
  const progressStyle = computed(() => {
    const circumference =
      2 *
      Math.PI *
      ((animationConfig.pressAndHold.ringSize -
        animationConfig.pressAndHold.strokeWidth) /
        2)
    const offset = circumference - (state.value.progress / 100) * circumference

    return {
      '--progress-offset': `${offset}`,
      '--circumference': `${circumference}`,
      '--ring-size': `${animationConfig.pressAndHold.ringSize}px`,
      '--stroke-width': `${animationConfig.pressAndHold.strokeWidth}px`,
      '--ring-color': animationConfig.pressAndHold.ringColor,
      '--ring-bg-color': animationConfig.pressAndHold.ringBgColor,
      '--duration': `${durationMs}ms`,
    }
  })

  // Start the press interaction
  const startPress = () => {
    // Skip if reduced motion is preferred
    if (respectReducedMotion && checkReducedMotion()) {
      // For reduced motion users, trigger immediately
      onComplete()
      return
    }

    state.value.isPressing = true
    state.value.progress = 0
    state.value.isComplete = false
    startTime = Date.now()

    // Update progress every frame (60fps) - Flexy hates hardcoded 16ms!
    pressTimer = setInterval(() => {
      if (!startTime) return

      const elapsed = Date.now() - startTime
      const newProgress = Math.min(100, (elapsed / durationMs) * 100)

      state.value.progress = newProgress

      // Check if hold is complete
      if (newProgress >= 100) {
        completePress()
      }
    }, animationConfig.frameRate.fps60)
  }

  // End the press interaction (cancelled)
  const endPress = () => {
    if (!state.value.isPressing) return

    // Clear timer
    if (pressTimer) {
      clearInterval(pressTimer)
      pressTimer = null
    }

    // Only trigger cancel if not already complete
    if (!state.value.isComplete && state.value.progress > 0) {
      onCancel?.()
    }

    // Reset state with a small delay for visual feedback - Flexy hates hardcoded 150ms!
    // BugFixer #2800: Store timeout ID for cleanup
    resetTimeoutId = setTimeout(() => {
      resetTimeoutId = null
      state.value.isPressing = false
      state.value.progress = 0
    }, animationConfig.microInteractions.resetDelayMs)
  }

  // Complete the press interaction
  const completePress = () => {
    if (pressTimer) {
      clearInterval(pressTimer)
      pressTimer = null
    }

    state.value.isComplete = true
    state.value.progress = 100

    // Trigger the action
    onComplete()

    // Reset after a short delay - Flexy hates hardcoded 300ms!
    // BugFixer #2800: Store timeout ID for cleanup
    completionResetTimeoutId = setTimeout(() => {
      completionResetTimeoutId = null
      state.value.isPressing = false
      state.value.progress = 0
      state.value.isComplete = false
    }, animationConfig.microInteractions.completionResetMs)
  }

  // Cleanup on unmount - BugFixer #2800: Clear all timers to prevent memory leaks
  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (pressTimer) {
        clearInterval(pressTimer)
        pressTimer = null
      }
      if (resetTimeoutId) {
        clearTimeout(resetTimeoutId)
        resetTimeoutId = null
      }
      if (completionResetTimeoutId) {
        clearTimeout(completionResetTimeoutId)
        completionResetTimeoutId = null
      }
    })
  }

  return {
    state,
    progressStyle,
    startPress,
    endPress,
    isPressing: computed(() => state.value.isPressing),
    progress: computed(() => state.value.progress),
    isComplete: computed(() => state.value.isComplete),
  }
}

export type { UsePressAndHoldOptions, PressAndHoldState }
