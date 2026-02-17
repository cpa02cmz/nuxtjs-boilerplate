<template>
  <div
    class="performance-chart"
    :style="{ height: `${height}px` }"
    role="img"
    :aria-label="`${metricName} performance chart`"
  >
    <!-- SVG Chart -->
    <svg
      v-if="chartData.length > 0"
      class="chart-svg"
      :viewBox="`0 0 ${chartWidth} ${height}`"
      preserveAspectRatio="none"
    >
      <!-- Grid Lines -->
      <g class="grid-lines">
        <line
          v-for="n in 5"
          :key="`grid-${n}`"
          :x1="0"
          :y1="(height / 5) * n"
          :x2="chartWidth"
          :y2="(height / 5) * n"
          stroke="#e5e7eb"
          :stroke-width="svgConfig.gridStrokeWidth"
          :stroke-dasharray="svgConfig.gridDashArray"
        />
      </g>

      <!-- Area Path -->
      <path
        class="chart-area"
        :d="areaPath"
        :fill="chartColor"
        fill-opacity="0.2"
      />

      <!-- Line Path -->
      <path
        class="chart-line"
        :d="linePath"
        :stroke="chartColor"
        :stroke-width="svgConfig.lineStrokeWidth"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Data Points -->
      <g class="data-points">
        <circle
          v-for="(point, index) in chartData"
          :key="`point-${index}`"
          :cx="point.x"
          :cy="point.y"
          :r="svgConfig.pointRadius"
          :fill="chartColor"
          class="data-point"
          :aria-label="`Value: ${point.value} at ${point.label}`"
        />
      </g>
    </svg>

    <!-- Empty State -->
    <div
      v-else
      class="empty-state"
    >
      <span
        class="empty-icon"
        aria-hidden="true"
      >📊</span>
      <span class="empty-text">No data available</span>
    </div>

    <!-- X-Axis Labels -->
    <div
      v-if="chartData.length > 0"
      class="x-axis-labels"
    >
      <span
        v-for="(label, index) in xAxisLabels"
        :key="`label-${index}`"
        class="x-label"
        :style="{ left: `${label.position}%` }"
      >
        {{ label.text }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TimeSeriesDataPoint } from '~/types/performance'
import { performanceDashboardConfig } from '~/configs/performance-dashboard.config'

interface Props {
  data: TimeSeriesDataPoint[]
  metricName: string
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: performanceDashboardConfig.charts.height,
})

// Flexy hates hardcoded values! Using config instead.
const chartWidth = performanceDashboardConfig.charts.dimensions.width
const padding = performanceDashboardConfig.charts.dimensions.padding
const svgConfig = performanceDashboardConfig.charts.svg

// Chart Colors
const chartColors: Record<string, string> = {
  LCP: '#3b82f6',
  INP: '#10b981',
  CLS: '#f59e0b',
  FCP: '#8b5cf6',
  TTFB: '#ef4444',
}

const chartColor = computed(() => chartColors[props.metricName] || '#6b7280')

// Filter and process data
const chartData = computed(() => {
  if (!props.data || props.data.length === 0) return []

  const values = props.data.map(d => d.value)
  const minValue = Math.min(...values) * 0.9
  const maxValue = Math.max(...values) * 1.1
  const valueRange = maxValue - minValue || 1

  return props.data.map((point, index) => {
    const x =
      padding.left +
      (index / (props.data.length - 1)) *
        (chartWidth - padding.left - padding.right)
    const y =
      props.height -
      padding.bottom -
      ((point.value - minValue) / valueRange) *
        (props.height - padding.top - padding.bottom)

    return {
      x,
      y,
      value: point.value,
      label: new Date(point.timestamp).toLocaleTimeString(),
    }
  })
})

// Line path
const linePath = computed(() => {
  if (chartData.value.length === 0) return ''

  return chartData.value.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`
    }
    return `${path} L ${point.x} ${point.y}`
  }, '')
})

// Area path (for gradient fill)
const areaPath = computed(() => {
  if (chartData.value.length === 0) return ''

  const firstPoint = chartData.value[0]
  const lastPoint = chartData.value[chartData.value.length - 1]
  const bottomY = props.height - padding.bottom

  return `${linePath.value} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z`
})

// X-axis labels
const xAxisLabels = computed(() => {
  if (chartData.value.length === 0) return []

  const count = Math.min(5, props.data.length)
  const step = Math.floor(props.data.length / count)
  const labels = []

  for (let i = 0; i < count; i++) {
    const index = i * step
    const point = props.data[index]
    if (point) {
      labels.push({
        text: new Date(point.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        position: (index / (props.data.length - 1)) * 100,
      })
    }
  }

  return labels
})
</script>

<style scoped>
.performance-chart {
  width: 100%;
  position: relative;
}

.chart-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.chart-line {
  transition: all 0.3s ease;
}

.chart-area {
  transition: all 0.3s ease;
}

.data-point {
  cursor: pointer;
  transition: all 0.2s ease;
}

.data-point:hover {
  r: v-bind('svgConfig.pointHoverRadius');
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  gap: 0.5rem;
}

.empty-icon {
  font-size: 2rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 0.875rem;
}

.x-axis-labels {
  position: relative;
  height: 30px;
  margin-top: 8px;
}

.x-label {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.75rem;
  color: #6b7280;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .chart-line,
  .chart-area,
  .data-point {
    transition: none;
  }
}
</style>
