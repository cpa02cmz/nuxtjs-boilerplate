<template>
  <div
    class="metric-card"
    :class="`rating-${rating}`"
    role="region"
    :aria-label="`${name} metric card`"
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

    <div class="metric-description">{{ description }}</div>

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

    <!-- Rating Indicator -->
    <div class="rating-indicator" aria-hidden="true">
      <div
        v-for="n in 3"
        :key="n"
        class="indicator-dot"
        :class="{ active: getIndicatorLevel(n) }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name: string
  value: number
  p75: number
  p95: number
  rating: string
  description: string
}

const props = defineProps<Props>()

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
  return formatValue(props.value)
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
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
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
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e5e7eb;
  transition: background 0.2s ease;
}

.metric-card.rating-good .indicator-dot.active {
  background: #10b981;
}

.metric-card.rating-needs-improvement .indicator-dot.active {
  background: #f59e0b;
}

.metric-card.rating-poor .indicator-dot.active {
  background: #ef4444;
}

@media (prefers-reduced-motion: reduce) {
  .metric-card {
    transition: none;
  }

  .metric-card:hover {
    transform: none;
  }

  .indicator-dot {
    transition: none;
  }
}
</style>
