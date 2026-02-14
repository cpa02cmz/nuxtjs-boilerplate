<template>
  <div
    class="resource-status"
    :class="{ 'resource-status--celebrating': isCelebrating }"
  >
    <!-- Status Badge with Enhanced Micro-UX -->
    <Tooltip
      :content="statusDescription"
      :position="tooltipPosition"
      :delay="tooltipDelay"
    >
      <span
        ref="statusBadgeRef"
        :class="[
          'status-badge',
          statusClass,
          {
            'status-badge--pulse': shouldPulse && !prefersReducedMotion,
            'status-badge--celebrating': isCelebrating && !prefersReducedMotion,
          },
        ]"
        role="status"
        :aria-label="ariaLabel"
        tabindex="0"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @focus="handleFocus"
        @blur="handleBlur"
      >
        <!-- Status Icon - Palette's micro-UX delight! -->
        <span
          v-if="showStatusIcon"
          class="status-icon"
          aria-hidden="true"
        >
          <svg
            v-if="status === 'active'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-3 w-3"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else-if="status === 'updated'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-3 w-3"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else-if="status === 'deprecated'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-3 w-3"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else-if="status === 'discontinued'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-3 w-3"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else-if="status === 'pending'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-3 w-3"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
        {{ statusText }}
      </span>
    </Tooltip>

    <!-- Health Indicator with Celebration -->
    <Tooltip
      v-if="healthScore !== undefined"
      :content="healthTooltip"
      :position="tooltipPosition"
      :delay="tooltipDelay"
    >
      <span
        ref="healthIndicatorRef"
        :class="[
          'health-indicator',
          healthClass,
          {
            'health-indicator--celebrating':
              isCelebrating && !prefersReducedMotion,
            'health-indicator--excellent': isExcellentHealth,
          },
        ]"
        :aria-label="healthLabel"
        @mouseenter="handleHealthMouseEnter"
      >
        <svg
          v-if="healthScore >= limitsConfig.healthScore.excellent"
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else-if="healthScore >= limitsConfig.healthScore.good"
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else-if="healthScore >= limitsConfig.healthScore.fair"
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="sr-only">{{ healthText }}</span>
      </span>
    </Tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import Tooltip from './Tooltip.vue'
import { uiConfig } from '../configs/ui.config'
import { limitsConfig } from '../configs/limits.config'
import { themeConfig } from '../configs/theme.config'
import { shadowsConfig } from '../configs/shadows.config'
import { animationConfig } from '../configs/animation.config'
import { hapticLight, hapticSuccess } from '../utils/hapticFeedback'

interface Props {
  status?:
    | 'active'
    | 'deprecated'
    | 'discontinued'
    | 'updated'
    | 'pending'
    | string
  healthScore?: number
  /**
   * Show status icon alongside text
   * @default true
   */
  showStatusIcon?: boolean
  /**
   * Tooltip position
   * @default 'top'
   */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'
  /**
   * Tooltip delay in ms
   * @default from animationConfig
   */
  tooltipDelay?: number
  /**
   * Enable celebration animation for excellent health
   * @default true
   */
  enableCelebration?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  status: 'active',
  healthScore: undefined,
  showStatusIcon: true,
  tooltipPosition: 'top',
  tooltipDelay: animationConfig.tooltip.showDelayMs,
  enableCelebration: true,
})

// Reactive state - Palette's micro-UX enhancement!
const prefersReducedMotion = ref(false)
const isCelebrating = ref(false)
const hasCelebrated = ref(false)
const isHovering = ref(false)
const statusBadgeRef = ref<HTMLElement | null>(null)
const healthIndicatorRef = ref<HTMLElement | null>(null)

// Celebration timeout
let celebrationTimeout: ReturnType<typeof setTimeout> | null = null

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Determine if status should pulse (updated status gets attention)
const shouldPulse = computed(() => {
  return props.status === 'updated' || props.status === 'pending'
})

// Check if health is excellent (triggers celebration)
const isExcellentHealth = computed(() => {
  return (
    props.healthScore !== undefined &&
    props.healthScore >= limitsConfig.healthScore.excellent
  )
})

// Enhanced aria label
const ariaLabel = computed(() => {
  const baseLabel = statusTitle.value
  if (props.healthScore !== undefined) {
    return `${baseLabel}. Health score: ${props.healthScore}%`
  }
  return baseLabel
})

// Status description for tooltip
const statusDescription = computed(() => {
  return `${statusTitle.value}${shouldPulse.value ? ' (Recently changed)' : ''}`
})

// Health tooltip
const healthTooltip = computed(() => {
  if (props.healthScore === undefined) return 'Health status unknown'
  return `${healthText.value} (${props.healthScore}%)`
})

// Handle mouse enter with haptic feedback
const handleMouseEnter = () => {
  isHovering.value = true
  if (!prefersReducedMotion.value) {
    hapticLight()
  }
}

const handleMouseLeave = () => {
  isHovering.value = false
}

const handleFocus = () => {
  isHovering.value = true
}

const handleBlur = () => {
  isHovering.value = false
}

const handleHealthMouseEnter = () => {
  if (!prefersReducedMotion.value && isExcellentHealth.value) {
    hapticSuccess()
  }
}

// Trigger celebration for excellent health
const triggerCelebration = () => {
  if (
    !props.enableCelebration ||
    !isExcellentHealth.value ||
    hasCelebrated.value ||
    prefersReducedMotion.value
  ) {
    return
  }

  // Clear any existing timeout
  if (celebrationTimeout) {
    clearTimeout(celebrationTimeout)
  }

  // Trigger celebration
  isCelebrating.value = true
  hasCelebrated.value = true
  hapticSuccess()

  // End celebration after animation
  celebrationTimeout = setTimeout(() => {
    isCelebrating.value = false
  }, animationConfig.resourceStatus.celebrationDurationMs)
}

// Watch for health score changes
watch(
  () => props.healthScore,
  (newScore, oldScore) => {
    if (newScore !== undefined && newScore !== oldScore) {
      // Reset celebration if health drops below excellent
      if (!isExcellentHealth.value) {
        hasCelebrated.value = false
      } else if (!hasCelebrated.value) {
        // Trigger celebration when health becomes excellent
        triggerCelebration()
      }
    }
  },
  { immediate: true }
)

// Lifecycle hooks
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleChange)

    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handleChange)
      if (celebrationTimeout) {
        clearTimeout(celebrationTimeout)
      }
    })
  }

  // Trigger celebration on mount if health is already excellent
  triggerCelebration()
})

const statusClass = computed(() => {
  switch (props.status) {
    case 'active':
      return 'status-active'
    case 'deprecated':
      return 'status-deprecated'
    case 'discontinued':
      return 'status-discontinued'
    case 'updated':
      return 'status-updated'
    case 'pending':
      return 'status-pending'
    default:
      return 'status-unknown'
  }
})

const statusText = computed(() => {
  switch (props.status) {
    case 'active':
      return uiConfig.resourceStatus.labels.active
    case 'deprecated':
      return uiConfig.resourceStatus.labels.deprecated
    case 'discontinued':
      return uiConfig.resourceStatus.labels.discontinued
    case 'updated':
      return uiConfig.resourceStatus.labels.updated
    case 'pending':
      return uiConfig.resourceStatus.labels.pending
    default:
      return uiConfig.resourceStatus.labels.unknown
  }
})

const statusTitle = computed(() => {
  switch (props.status) {
    case 'active':
      return uiConfig.resourceStatus.descriptions.active
    case 'deprecated':
      return uiConfig.resourceStatus.descriptions.deprecated
    case 'discontinued':
      return uiConfig.resourceStatus.descriptions.discontinued
    case 'updated':
      return uiConfig.resourceStatus.descriptions.updated
    case 'pending':
      return uiConfig.resourceStatus.descriptions.pending
    default:
      return uiConfig.resourceStatus.descriptions.unknown
  }
})

const healthClass = computed(() => {
  if (props.healthScore === undefined) return 'health-unknown'
  if (props.healthScore >= limitsConfig.healthScore.excellent)
    return 'health-good'
  if (props.healthScore >= limitsConfig.healthScore.good)
    return 'health-warning'
  return 'health-bad'
})

const healthText = computed(() => {
  if (props.healthScore === undefined) return 'Health status unknown'
  if (props.healthScore >= limitsConfig.healthScore.excellent)
    return 'Health: Excellent'
  if (props.healthScore >= limitsConfig.healthScore.good) return 'Health: Good'
  if (props.healthScore >= limitsConfig.healthScore.fair) return 'Health: Fair'
  return 'Health: Poor'
})

const healthLabel = computed(() => {
  if (props.healthScore === undefined) return 'Health status unknown'
  return `Health score: ${props.healthScore}%`
})
</script>

<style scoped>
.resource-status {
  display: flex;
  align-items: center;
  gap: v-bind('`${uiConfig.layout.spacing.md}rem`');
}

.resource-status--celebrating {
  animation: status-celebration-pop
    v-bind('`${animationConfig.resourceStatus.celebrationDurationMs}ms`')
    v-bind('animationConfig.resourceStatus.celebrationEasing');
}

.status-badge {
  padding: v-bind('`${uiConfig.layout.spacing.sm}rem`')
    v-bind('`${uiConfig.layout.spacing.lg}rem`');
  border-radius: v-bind('`${uiConfig.layout.borderRadius.sm}rem`');
  font-size: v-bind('`${uiConfig.layout.fontSize.sm}rem`');
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  cursor: help;
  transition: all v-bind('animationConfig.cssTransitions.normalSec') ease;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  position: relative;
  overflow: hidden;
}

.status-badge:hover {
  transform: scale(1.05);
  box-shadow: v-bind('shadowsConfig.colors.black.opacity15');
}

.status-badge:focus {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Status Icon Styling */
.status-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
}

/* Pulse Animation for Updated/Pending Status - Palette's micro-UX delight! */
.status-badge--pulse {
  animation: status-pulse
    v-bind('`${animationConfig.resourceStatus.pulseDurationSec}s`') ease-in-out
    infinite;
}

@keyframes status-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0);
  }
}

/* Celebration Animation - Palette's micro-UX delight! */
.status-badge--celebrating {
  animation: status-celebration
    v-bind('`${animationConfig.resourceStatus.celebrationDurationMs}ms`')
    v-bind('animationConfig.resourceStatus.celebrationEasing');
}

@keyframes status-celebration {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.1) rotate(-3deg);
  }
  50% {
    transform: scale(1.15) rotate(3deg);
  }
  75% {
    transform: scale(1.05) rotate(-1deg);
  }
  100% {
    transform: scale(1) rotate(0);
  }
}

@keyframes status-celebration-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .status-badge {
    transition: none;
  }

  .status-badge:hover {
    transform: none;
    box-shadow: v-bind('shadowsConfig.colors.black.opacity10');
  }

  .status-badge--pulse,
  .status-badge--celebrating,
  .resource-status--celebrating {
    animation: none;
  }
}

.status-active {
  background-color: v-bind('themeConfig.resourceStatus.active.bg');
  color: v-bind('themeConfig.resourceStatus.active.text');
  border: 1px solid v-bind('themeConfig.resourceStatus.active.border');
}

.status-deprecated {
  background-color: v-bind('themeConfig.resourceStatus.deprecated.bg');
  color: v-bind('themeConfig.resourceStatus.deprecated.text');
  border: 1px solid v-bind('themeConfig.resourceStatus.deprecated.border');
}

.status-discontinued {
  background-color: v-bind('themeConfig.resourceStatus.discontinued.bg');
  color: v-bind('themeConfig.resourceStatus.discontinued.text');
  border: 1px solid v-bind('themeConfig.resourceStatus.discontinued.border');
}

.status-updated {
  background-color: v-bind('themeConfig.resourceStatus.updated.bg');
  color: v-bind('themeConfig.resourceStatus.updated.text');
  border: 1px solid v-bind('themeConfig.resourceStatus.updated.border');
}

.status-pending {
  background-color: v-bind('themeConfig.resourceStatus.pending.bg');
  color: v-bind('themeConfig.resourceStatus.pending.text');
  border: 1px solid v-bind('themeConfig.resourceStatus.pending.border');
}

.status-unknown {
  background-color: v-bind('themeConfig.resourceStatus.unknown.bg');
  color: v-bind('themeConfig.resourceStatus.unknown.text');
  border: 1px solid v-bind('themeConfig.resourceStatus.unknown.border');
}

.health-indicator {
  display: inline-flex;
  align-items: center;
  gap: v-bind('`${uiConfig.layout.spacing.sm}rem`');
  cursor: help;
  transition: all v-bind('animationConfig.cssTransitions.normalSec') ease;
  padding: 0.25rem;
  border-radius: v-bind('`${uiConfig.layout.borderRadius.sm}rem`');
}

.health-indicator:hover {
  transform: scale(1.1);
  background-color: rgba(0, 0, 0, 0.05);
}

.health-indicator svg {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform v-bind('animationConfig.cssTransitions.normalSec') ease;
}

.health-indicator:hover svg {
  transform: rotate(10deg);
}

/* Excellent Health Celebration - Palette's micro-UX delight! */
.health-indicator--excellent {
  position: relative;
}

.health-indicator--excellent::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid v-bind('themeConfig.healthIndicator.good');
  opacity: 0;
  animation: health-ring-pulse
    v-bind('`${animationConfig.resourceStatus.healthRingDurationSec}s`')
    ease-out infinite;
}

/* Glow Pulse Effect - Palette's micro-UX enhancement!
   Adds a soft, pulsing glow behind excellent health indicators */
.health-indicator--excellent::after {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    v-bind('themeConfig.healthIndicator.glowStart') 0%,
    v-bind('themeConfig.healthIndicator.glowEnd') 70%
  );
  opacity: 0;
  animation: health-glow-pulse
    v-bind('`${animationConfig.resourceStatus.glowPulseDurationSec}s`')
    ease-in-out infinite;
  z-index: -1;
  pointer-events: none;
}

.health-indicator--celebrating svg {
  animation: health-celebration
    v-bind('`${animationConfig.resourceStatus.celebrationDurationMs}ms`')
    v-bind('animationConfig.resourceStatus.celebrationEasing');
}

@keyframes health-ring-pulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes health-glow-pulse {
  0%,
  100% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.4;
  }
}

@keyframes health-celebration {
  0% {
    transform: scale(1) rotate(0);
  }
  25% {
    transform: scale(1.2) rotate(-10deg);
  }
  50% {
    transform: scale(1.3) rotate(10deg);
  }
  75% {
    transform: scale(1.1) rotate(-5deg);
  }
  100% {
    transform: scale(1) rotate(0);
  }
}

.health-good {
  color: v-bind('themeConfig.healthIndicator.good');
}

.health-warning {
  color: v-bind('themeConfig.healthIndicator.warning');
}

.health-bad {
  color: v-bind('themeConfig.healthIndicator.bad');
}

.health-unknown {
  color: v-bind('themeConfig.healthIndicator.unknown');
}

/* Reduced Motion Support for Health Indicator */
@media (prefers-reduced-motion: reduce) {
  .health-indicator {
    transition: none;
  }

  .health-indicator:hover {
    transform: none;
    background-color: transparent;
  }

  .health-indicator svg {
    transition: none;
  }

  .health-indicator:hover svg {
    transform: none;
  }

  .health-indicator--excellent::before,
  .health-indicator--excellent::after {
    display: none;
  }

  .health-indicator--celebrating svg {
    animation: none;
  }
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .status-badge {
    border-width: 2px;
  }

  .health-indicator--excellent::before {
    border-width: 3px;
  }
}

/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
