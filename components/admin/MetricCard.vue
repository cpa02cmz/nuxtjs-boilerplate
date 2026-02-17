<template>
  <div
    class="metric-card"
    :class="[
      `rating-${rating}`,
      {
        'metric-card--visible': isVisible || prefersReducedMotion,
        'metric-card--hovered': isHovered && !prefersReducedMotion,
        'metric-card--rating-changed': isRatingChanged && !prefersReducedMotion,
      },
    ]"
    :style="entranceStyle"
    role="region"
    :aria-label="`${name} metric card`"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="metric-header">
      <span class="metric-name">{{ name }}</span>
      <span
        class="metric-rating-badge"
        :class="`badge-${rating}`"
        :aria-label="`Rating: ${rating}`"
      >
        {{ ratingText }}
      </span>
    </div>

    <div class="metric-value-section">
      <span class="metric-value">{{ formattedValue }}</span>
      <span class="metric-unit">{{ unit }}</span>
    </div>

    <div class="metric-description">
      {{ description }}
    </div>

    <div class="metric-percentiles">
      <div class="percentile">
        <span class="percentile-label">p75</span>
        <span class="percentile-value">{{ formatValue(p75) }}</span>
      </div>
      <div class="percentile">
        <span class="percentile-label">p95</span>
        <span class="percentile-value">{{ formatValue(p95) }}</span>
      </div>
    </div>

    <!-- 🎨 Pallete's micro-UX enhancement: Rating Indicator with pulse animation -->
    <div
      class="rating-indicator"
      :class="{
        'rating-indicator--pulse': isRatingChanged && !prefersReducedMotion,
      }"
      aria-hidden="true"
    >
      <div
        v-for="n in 3"
        :key="n"
        class="indicator-dot"
        :class="{
          active: getIndicatorLevel(n),
          'indicator-dot--pulse':
            getIndicatorLevel(n) && isRatingChanged && !prefersReducedMotion,
        }"
        :style="{ '--dot-index': n }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { hapticLight } from '~/utils/hapticFeedback'

interface Props {
  name: string
  value: number
  p75: number
  p95: number
  rating: string
  description: string
  /**
   * 🎨 Pallete's micro-UX: Index for staggered entrance animations
   * Determines the delay before this card animates in
   * @default 0
   */
  index?: number
}

const props = withDefaults(defineProps<Props>(), {
  index: 0,
})

// 🎨 Pallete's micro-UX enhancement: Animation state
const isVisible = ref(false)
const prefersReducedMotion = ref(false)
const isHovered = ref(false)
const previousRating = ref(props.rating)
const isRatingChanged = ref(false)
const displayValue = ref(props.value)

// 🎨 Pallete's micro-UX enhancement: Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// 🎨 Pallete's micro-UX enhancement: Calculate entrance delay
const entranceDelay = computed(() => {
  if (prefersReducedMotion.value) return 0
  const delay = Math.min(
    props.index * animationConfig.metricCard.staggerDelayMs,
    animationConfig.metricCard.maxStaggerDelayMs
  )
  return delay
})

// 🎨 Pallete's micro-UX enhancement: Entrance style
const entranceStyle = computed(() => {
  if (prefersReducedMotion.value) return {}
  return {
    '--entrance-delay': `${entranceDelay.value}ms`,
  }
})

// Computed
const ratingText = computed(() => {
  const texts: Record<string, string> = {
    good: 'Good',
    'needs-improvement': 'Needs Improvement',
    poor: 'Poor',
  }
  return texts[props.rating] || props.rating
})

const formattedValue = computed(() => {
  return formatValue(displayValue.value)
})

const unit = computed(() => {
  switch (props.name) {
    case 'LCP':
    case 'INP':
    case 'FCP':
    case 'TTFB':
      return 'ms'
    case 'CLS':
      return ''
    default:
      return ''
  }
})

// 🎨 Pallete's micro-UX enhancement: Handle hover with haptic
const handleMouseEnter = () => {
  isHovered.value = true
  if (!prefersReducedMotion.value) {
    hapticLight()
  }
}

const handleMouseLeave = () => {
  isHovered.value = false
}

// Methods
function formatValue(val: number): string {
  if (val === 0) return '-'

  switch (props.name) {
    case 'CLS':
      return val.toFixed(3)
    default:
      return Math.round(val).toString()
  }
}

function getIndicatorLevel(level: number): boolean {
  const levels: Record<string, number> = {
    good: 1,
    'needs-improvement': 2,
    poor: 3,
  }
  return level <= (levels[props.rating] || 1)
}

// 🎨 Pallete's micro-UX enhancement: Watch for rating changes
watch(
  () => props.rating,
  (newRating, oldRating) => {
    if (newRating !== oldRating && isVisible.value) {
      isRatingChanged.value = true
      setTimeout(() => {
        isRatingChanged.value = false
      }, animationConfig.metricCard.ratingChangeDurationMs)
    }
    previousRating.value = newRating
  }
)

// 🎨 Pallete's micro-UX enhancement: Animate value changes
watch(
  () => props.value,
  (newValue, oldValue) => {
    if (
      newValue !== oldValue &&
      isVisible.value &&
      !prefersReducedMotion.value
    ) {
      // Simple number animation could be implemented here
      displayValue.value = newValue
    } else {
      displayValue.value = newValue
    }
  }
)

// 🎨 Pallete's micro-UX enhancement: Lifecycle hooks
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Trigger entrance animation
  setTimeout(() => {
    isVisible.value = true
  }, animationConfig.metricCard.staggerDelayMs)
})
</script>

<style scoped>
.metric-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all v-bind('animationConfig.metricCard.entranceDurationMs + "ms"')
    ease;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(
    v-bind('animationConfig.metricCard.entranceDistancePx + "px"')
  );
  transition-delay: var(--entrance-delay, 0ms);
}

.metric-card--visible {
  opacity: 1;
  transform: translateY(0);
}

/* 🎨 Pallete's micro-UX enhancement: Hover effects */
.metric-card--hovered {
  transform: translateY(
    v-bind('"-" + animationConfig.metricCard.hoverLiftPx + "px"')
  );
  box-shadow: 0 v-bind('animationConfig.metricCard.hoverShadowSpreadPx + "px"')
    v-bind('animationConfig.metricCard.hoverShadowSpreadPx * 2 + "px"') -1px
    rgba(0, 0, 0, 0.1);
}

/* 🎨 Pallete's micro-UX enhancement: Rating change flash */
.metric-card--rating-changed {
  animation: rating-flash
    v-bind('animationConfig.metricCard.ratingChangeDurationMs + "ms"') ease-out;
}

@keyframes rating-flash {
  0% {
    background: v-bind('animationConfig.metricCard.goodRatingColor + "20"');
  }
  100% {
    background: white;
  }
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.metric-card.rating-good::before {
  background: #10b981;
}

.metric-card.rating-needs-improvement::before {
  background: #f59e0b;
}

.metric-card.rating-poor::before {
  background: #ef4444;
}

.metric-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.metric-rating-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-good {
  background: #d1fae5;
  color: #065f46;
}

.badge-needs-improvement {
  background: #fef3c7;
  color: #92400e;
}

.badge-poor {
  background: #fee2e2;
  color: #991b1b;
}

.metric-value-section {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.metric-unit {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 500;
}

.metric-description {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.metric-percentiles {
  display: flex;
  gap: 1.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
}

.percentile {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.percentile-label {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}

.percentile-value {
  font-size: 1rem;
  font-weight: 600;
  color: #4b5563;
}

.rating-indicator {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.25rem;
}

.indicator-dot {
  width: v-bind('animationConfig.metricCard.indicatorDotSizePx + "px"');
  height: v-bind('animationConfig.metricCard.indicatorDotSizePx + "px"');
  border-radius: 50%;
  background: #e5e7eb;
  transition: all
    v-bind('animationConfig.metricCard.valueUpdateDurationMs + "ms"') ease;
}

/* 🎨 Pallete's micro-UX enhancement: Active indicator dots with color */
.metric-card.rating-good .indicator-dot.active {
  background: v-bind('animationConfig.metricCard.goodRatingColor');
}

.metric-card.rating-needs-improvement .indicator-dot.active {
  background: v-bind('animationConfig.metricCard.warningRatingColor');
}

.metric-card.rating-poor .indicator-dot.active {
  background: v-bind('animationConfig.metricCard.poorRatingColor');
}

/* 🎨 Pallete's micro-UX enhancement: Pulse animation on rating change */
.indicator-dot--pulse {
  animation: indicator-pulse
    v-bind('animationConfig.metricCard.pulseDurationSec') ease-in-out;
  /* Flexy hates hardcoded 100ms! Using animationConfig.metricCard.indicatorStaggerDelayMs 🧩 */
  animation-delay: calc(
    var(--dot-index) *
      v-bind('animationConfig.metricCard.indicatorStaggerDelayMs + "ms"')
  );
}

@keyframes indicator-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(v-bind('animationConfig.metricCard.pulseScale'));
    opacity: 0.8;
  }
}

/* 🎨 Pallete's micro-UX enhancement: Value update animation */
.metric-value {
  transition: transform
    v-bind('animationConfig.metricCard.valueUpdateDurationMs + "ms"') ease;
}

.metric-card--rating-changed .metric-value {
  animation: value-pop
    v-bind('animationConfig.metricCard.valueUpdateDurationMs + "ms"') ease-out;
}

@keyframes value-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(v-bind('animationConfig.metricCard.valueUpdateScale'));
  }
  100% {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .metric-card {
    transition: none;
    opacity: 1;
    transform: none;
  }

  .metric-card:hover {
    transform: none;
  }

  .metric-card--hovered {
    transform: none;
  }

  .indicator-dot {
    transition: none;
  }

  .indicator-dot--pulse {
    animation: none;
  }

  .metric-value {
    transition: none;
  }

  .metric-card--rating-changed .metric-value {
    animation: none;
  }

  .metric-card--rating-changed {
    animation: none;
  }
}
</style>
