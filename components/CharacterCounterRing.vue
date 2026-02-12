<template>
  <div
    class="character-counter-ring"
    :class="{
      'character-counter-ring--warning': isWarning,
      'character-counter-ring--error': isError,
      'character-counter-ring--success': isSuccess,
    }"
    :title="tooltipText"
  >
    <!-- Progress Ring SVG -->
    <svg
      class="character-counter-ring__svg"
      viewBox="0 0 36 36"
      :width="size"
      :height="size"
      aria-hidden="true"
    >
      <!-- Background Circle -->
      <circle
        class="character-counter-ring__bg"
        cx="18"
        cy="18"
        r="16"
        fill="none"
        stroke-width="2"
      />
      <!-- Progress Circle -->
      <circle
        class="character-counter-ring__progress"
        cx="18"
        cy="18"
        r="16"
        fill="none"
        stroke-width="2"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashOffset"
        :style="progressStyle"
      />
    </svg>

    <!-- Character Count Text -->
    <span
      class="character-counter-ring__count"
      :class="{
        'character-counter-ring__count--warning': isWarning,
        'character-counter-ring__count--error': isError,
      }"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ remaining }}
    </span>

    <!-- Screen reader announcement -->
    <span class="sr-only">
      {{ announcementText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { animationConfig } from '~/configs/animation.config'

interface Props {
  /** Current character count */
  current: number
  /** Maximum allowed characters */
  max: number
  /** Size of the ring in pixels */
  size?: number
  /** Threshold percentage to trigger warning state (0-100) */
  warningThreshold?: number
  /** Threshold percentage to trigger error state (0-100) */
  errorThreshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 32,
  warningThreshold: 80,
  errorThreshold: 100,
})

// Constants
const RADIUS = 16
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// State for screen reader announcements
const lastAnnouncedPercentage = ref(0)
const announcementText = ref('')

// Computed values
const percentage = computed(() => {
  return Math.min(100, (props.current / props.max) * 100)
})

const remaining = computed(() => {
  return Math.max(0, props.max - props.current)
})

const circumference = computed(() => CIRCUMFERENCE)

const strokeDashOffset = computed(() => {
  return CIRCUMFERENCE - (percentage.value / 100) * CIRCUMFERENCE
})

const isWarning = computed(() => {
  return (
    percentage.value >= props.warningThreshold &&
    percentage.value < props.errorThreshold
  )
})

const isError = computed(() => {
  return percentage.value >= props.errorThreshold
})

const isSuccess = computed(() => {
  return percentage.value < props.warningThreshold && props.current > 0
})

const progressStyle = computed(() => ({
  transition: `stroke-dashoffset ${animationConfig.characterCounterRing.transitionDurationMs}ms ease-out`,
}))

const tooltipText = computed(() => {
  if (isError.value) {
    return `${props.current} of ${props.max} characters (limit reached)`
  }
  if (isWarning.value) {
    return `${remaining.value} characters remaining`
  }
  return `${props.current} of ${props.max} characters`
})

// Watch for significant percentage changes to announce to screen readers
watch(percentage, newPercentage => {
  const milestone = Math.floor(newPercentage / 25) * 25
  if (milestone !== lastAnnouncedPercentage.value && milestone > 0) {
    lastAnnouncedPercentage.value = milestone

    if (milestone === 100) {
      announcementText.value = `Character limit reached. ${remaining.value} characters remaining.`
    } else {
      announcementText.value = `${milestone}% of character limit used.`
    }

    // Clear announcement after screen reader has time to process
    setTimeout(() => {
      announcementText.value = ''
    }, animationConfig.characterCounterRing.announcementTimeoutMs)
  }
})
</script>

<style scoped>
.character-counter-ring {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
}

.character-counter-ring__svg {
  transform: rotate(-90deg);
}

.character-counter-ring__bg {
  stroke: #e5e7eb;
}

.character-counter-ring__progress {
  stroke: #10b981;
  stroke-linecap: round;
  transform-origin: center;
}

.character-counter-ring--warning .character-counter-ring__progress {
  stroke: #f59e0b;
}

.character-counter-ring--error .character-counter-ring__progress {
  stroke: #ef4444;
}

.character-counter-ring__count {
  position: absolute;
  font-size: 10px;
  font-weight: 600;
  color: #6b7280;
  line-height: 1;
  transition: color 300ms ease-out;
}

.character-counter-ring__count--warning {
  color: #d97706;
}

.character-counter-ring__count--error {
  color: #dc2626;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .character-counter-ring__progress {
    transition: none;
  }

  .character-counter-ring__count {
    transition: none;
  }
}
</style>
