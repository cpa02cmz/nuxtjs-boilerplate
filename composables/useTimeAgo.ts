import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { TIME } from '~/server/utils/constants'
import { timeConfig } from '~/configs/time.config'

export interface TimeAgoOptions {
  /** Update interval in milliseconds (default: auto-calculated based on age) */
  updateIntervalMs?: number
  /** Enable live updates (default: true) */
  live?: boolean
  /** Respect reduced motion preference (default: true) */
  respectReducedMotion?: boolean
}

export interface TimeAgoResult {
  /** Human-readable relative time (e.g., "2 minutes ago") */
  timeAgo: string
  /** Full formatted date for tooltips */
  fullDate: string
  /** Whether the timestamp is recent (within last minute) */
  isRecent: boolean
  /** Age in seconds */
  seconds: number
}

// Approximate milliseconds per month and year (accounting for average)
const MS_PER_MONTH = 30.44 * TIME.MS_PER_DAY // Average days per month
const MS_PER_YEAR = 365.25 * TIME.MS_PER_DAY // Account for leap years

// Default update intervals based on age - Flexy hates hardcoded values!
// Now using configurable values from timeConfig
const UPDATE_INTERVALS = {
  justNow: timeConfig.timeAgo.justNowIntervalMs,
  minute: timeConfig.timeAgo.minuteIntervalMs,
  hour: timeConfig.timeAgo.hourIntervalMs,
  day: timeConfig.timeAgo.dayIntervalMs,
  older: timeConfig.timeAgo.olderIntervalMs,
}

/**
 * Format a timestamp into a human-readable relative time string
 * Palette's micro-UX enhancement: Live-updating timestamps!
 */
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const seconds = Math.floor(
    (now.getTime() - date.getTime()) / TIME.MS_PER_SECOND
  )

  if (seconds < TIME.SECONDS_PER_MINUTE) return 'just now'
  if (seconds < TIME.SECONDS_PER_HOUR) {
    const minutes = Math.floor(seconds / TIME.SECONDS_PER_MINUTE)
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  }
  if (seconds < TIME.SECONDS_PER_DAY) {
    const hours = Math.floor(seconds / TIME.SECONDS_PER_HOUR)
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  }
  if (seconds < TIME.SECONDS_PER_WEEK) {
    const days = Math.floor(seconds / TIME.SECONDS_PER_DAY)
    return `${days} day${days !== 1 ? 's' : ''} ago`
  }

  // For weeks, months, and years, use milliseconds for more accurate calculation
  const ms = seconds * TIME.MS_PER_SECOND
  const weeks = Math.floor(ms / TIME.MS_PER_WEEK)
  if (weeks < 4) {
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
  }

  const months = Math.floor(ms / MS_PER_MONTH)
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''} ago`
  }

  const years = Math.floor(ms / MS_PER_YEAR)
  return `${years} year${years !== 1 ? 's' : ''} ago`
}

/**
 * Format a full date for tooltips
 */
function formatFullDate(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Calculate the appropriate update interval based on timestamp age
 */
function calculateUpdateInterval(seconds: number): number {
  if (seconds < TIME.SECONDS_PER_MINUTE) return UPDATE_INTERVALS.justNow
  if (seconds < TIME.SECONDS_PER_HOUR) return UPDATE_INTERVALS.minute
  if (seconds < TIME.SECONDS_PER_DAY) return UPDATE_INTERVALS.hour
  if (seconds < TIME.SECONDS_PER_WEEK) return UPDATE_INTERVALS.day
  return UPDATE_INTERVALS.older
}

/**
 * Composable for live-updating relative time display
 *
 * Palette's micro-UX enhancement: Timestamps that update automatically!
 * Makes the interface feel alive and current. Shows "just now" for recent
 * items that updates to "1 minute ago", "2 minutes ago", etc.
 *
 * Features:
 * - Auto-updates based on age (more frequent for recent items)
 * - Respects reduced motion preference
 * - Provides full date tooltip text
 * - Efficient cleanup of intervals
 *
 * @example
 * ```vue
 * <script setup>
 * const { timeAgo, fullDate, isRecent } = useTimeAgo(comment.timestamp)
 * </script>
 *
 * <template>
 *   <time :datetime="comment.timestamp" :title="fullDate">
 *     {{ timeAgo }}
 *     <span v-if="isRecent" class="live-indicator" aria-hidden="true" />
 *   </time>
 * </template>
 * ```
 */
export function useTimeAgo(
  timestamp: string | Date | number,
  options: TimeAgoOptions = {}
) {
  const { updateIntervalMs, live = true, respectReducedMotion = true } = options

  // Parse the timestamp
  const date = ref(new Date(timestamp))
  const now = ref(new Date())

  // Check for reduced motion preference
  const prefersReducedMotion = ref(false)

  // Computed values
  const seconds = computed(() => {
    return Math.floor(
      (now.value.getTime() - date.value.getTime()) / TIME.MS_PER_SECOND
    )
  })

  const timeAgoText = computed(() => formatTimeAgo(date.value))
  const fullDateText = computed(() => formatFullDate(date.value))
  const isRecent = computed(() => seconds.value < TIME.SECONDS_PER_MINUTE)

  // Result object
  const result = computed<TimeAgoResult>(() => ({
    timeAgo: timeAgoText.value,
    fullDate: fullDateText.value,
    isRecent: isRecent.value,
    seconds: seconds.value,
  }))

  // Update function
  let intervalId: ReturnType<typeof setInterval> | null = null

  const update = () => {
    now.value = new Date()
  }

  // Setup interval
  const setupInterval = () => {
    // Clear existing interval
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }

    // Skip if not live or reduced motion is preferred
    if (!live || (respectReducedMotion && prefersReducedMotion.value)) {
      return
    }

    // Calculate interval based on current age
    const interval = updateIntervalMs || calculateUpdateInterval(seconds.value)

    // Only set up interval for items less than a week old
    if (seconds.value < TIME.SECONDS_PER_WEEK) {
      intervalId = setInterval(update, interval)
    }
  }

  // Check reduced motion preference
  const checkReducedMotion = () => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return false
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  // Watch for changes in seconds to adjust interval
  let lastIntervalCalc = 0

  onMounted(() => {
    prefersReducedMotion.value = checkReducedMotion()
    setupInterval()

    // Watch for changes that might need interval adjustment
    if (live && !prefersReducedMotion.value) {
      const unwatch = watch(seconds, newSeconds => {
        const currentInterval = calculateUpdateInterval(newSeconds)
        // Only recalculate interval if the category changed significantly
        if (Math.abs(currentInterval - lastIntervalCalc) > 1000) {
          lastIntervalCalc = currentInterval
          setupInterval()
        }
      })

      // Cleanup on unmount
      onUnmounted(() => {
        unwatch()
      })
    }
  })

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  })

  return {
    timeAgo: computed(() => result.value.timeAgo),
    fullDate: computed(() => result.value.fullDate),
    isRecent: computed(() => result.value.isRecent),
    seconds: computed(() => result.value.seconds),
    // Raw ref for template binding
    result,
    // Manual update function
    update,
  }
}

/**
 * Utility function for one-time time ago formatting
 * Use this when you don't need live updates
 */
export function formatTimeAgoOnce(timestamp: string | Date | number): string {
  return formatTimeAgo(new Date(timestamp))
}
