<template>
  <Tooltip
    :content="fullDate"
    :position="tooltipPosition"
    :delay="tooltipDelay"
  >
    <span
      class="relative-time-badge"
      :class="badgeClasses"
      :aria-label="ariaLabel"
    >
      <!-- Live indicator dot - Palette's micro-UX delight! -->
      <span
        v-if="showLiveIndicator && !prefersReducedMotion"
        class="live-indicator"
        :class="{ 'live-indicator--recent': isRecent }"
        aria-hidden="true"
      />
      <span class="relative-time-text">{{ timeAgo }}</span>
    </span>
  </Tooltip>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useTimeAgo } from '~/composables/useTimeAgo'
import { animationConfig } from '~/configs/animation.config'
import { componentColorsConfig } from '~/configs/component-colors.config'

interface Props {
  /** Timestamp to display */
  timestamp: string | Date | number
  /** Tooltip position */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'
  /** Tooltip delay in ms */
  tooltipDelay?: number
  /** Show live indicator dot for recent items */
  showLiveIndicator?: boolean
  /** Threshold in seconds for "recent" (default: 300 = 5 minutes) */
  recentThresholdSec?: number
  /** Size variant */
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  tooltipPosition: 'top',
  tooltipDelay: animationConfig.tooltip.showDelayMs,
  showLiveIndicator: true,
  recentThresholdSec: 300,
  size: 'small',
})

// Use the existing useTimeAgo composable
const { timeAgo, fullDate, isRecent } = useTimeAgo(props.timestamp, {
  live: true,
  respectReducedMotion: true,
})

// Check for reduced motion preference
const prefersReducedMotion = ref(false)

onMounted(() => {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function'
  ) {
    prefersReducedMotion.value = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
  }
})

// Check if item is within recent threshold
const isWithinRecentThreshold = computed(() => {
  const date = new Date(props.timestamp)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  return seconds < props.recentThresholdSec
})

// Badge classes based on size and state
const badgeClasses = computed(() => {
  const baseClasses = [
    'inline-flex items-center gap-1.5 font-medium transition-all',
    animationConfig.cssTransitions.fastSec,
  ]

  // Size classes
  const sizeClasses = {
    small: 'text-xs px-2 py-0.5 rounded-full',
    medium: 'text-sm px-2.5 py-1 rounded-full',
    large: 'text-base px-3 py-1.5 rounded-lg',
  }
  baseClasses.push(sizeClasses[props.size])

  // State-based styling
  if (isWithinRecentThreshold.value) {
    baseClasses.push(
      'bg-blue-50 text-blue-700 border border-blue-200',
      'hover:bg-blue-100'
    )
  } else {
    baseClasses.push(
      'bg-gray-100 text-gray-600 border border-gray-200',
      'hover:bg-gray-200'
    )
  }

  return baseClasses
})

// ARIA label for accessibility
const ariaLabel = computed(() => {
  return `Posted ${timeAgo.value}. Full date: ${fullDate.value}`
})
</script>

<style scoped>
.relative-time-badge {
  cursor: help;
  position: relative;
}

/* Live indicator dot - Palette's micro-UX delight! */
.live-indicator {
  display: inline-block;
  width: 6px;
  height: 6px;
  background-color: v-bind('componentColorsConfig.liveIndicator.default');
  border-radius: 50%;
  position: relative;
}

/* Pulsing animation for live indicator */
.live-indicator--recent {
  background-color: v-bind('componentColorsConfig.liveIndicator.recent');
  animation: live-pulse
    v-bind('`${animationConfig.liveIndicator.pulseDurationSec}s`') ease-in-out
    infinite;
}

.live-indicator--recent::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid v-bind('componentColorsConfig.liveIndicator.recent');
  opacity: 0;
  animation: live-ring
    v-bind('`${animationConfig.liveIndicator.pulseDurationSec}s`') ease-out
    infinite;
}

@keyframes live-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

@keyframes live-ring {
  0% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .live-indicator--recent {
    animation: none;
  }

  .live-indicator--recent::before {
    display: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .live-indicator {
    border: 1px solid currentColor;
  }
}

.relative-time-text {
  white-space: nowrap;
}
</style>
