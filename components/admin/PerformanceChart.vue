<template>
  <div
    ref="chartContainer"
    class="performance-chart"
    :style="{ height: `${height}px` }"
    role="img"
    :aria-label="`${metricName} performance chart`"
    @mouseleave="handleMouseLeave"
  >
    <!-- SVG Chart - Palette's micro-UX: Entrance animation support -->
    <svg
      v-if="chartData.length > 0"
      ref="svgRef"
      class="chart-svg"
      :class="{
        'chart-svg--entering': isChartVisible && !prefersReducedMotion,
      }"
      :viewBox="`0 0 ${chartWidth} ${height}`"
      preserveAspectRatio="none"
      tabindex="0"
      :aria-describedby="tooltipVisible ? 'chart-tooltip' : undefined"
      @mousemove="handleMouseMove"
      @click="handleChartClick"
      @keydown="handleKeyDown"
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

      <!-- Crosshair Line (visible on hover) -->
      <line
        v-if="crosshairVisible && !prefersReducedMotion"
        class="crosshair"
        :x1="crosshairX"
        :y1="padding.top"
        :x2="crosshairX"
        :y2="height - padding.bottom"
        stroke="#9ca3af"
        stroke-width="1"
        stroke-dasharray="4 4"
        opacity="0.5"
      />

      <!-- Area Path - Palette's micro-UX: Fade in with entrance animation -->
      <path
        class="chart-area"
        :class="{
          'chart-area--entering': isChartVisible && !prefersReducedMotion,
        }"
        :d="areaPath"
        :fill="chartColor"
        fill-opacity="0.2"
      />

      <!-- Line Path - Palette's micro-UX: Draw animation on entrance -->
      <path
        class="chart-line"
        :class="{
          'chart-line--entering': isChartVisible && !prefersReducedMotion,
        }"
        :d="linePath"
        :stroke="chartColor"
        :stroke-width="svgConfig.lineStrokeWidth"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        :style="lineDrawStyle"
      />

      <!-- Data Points - Palette's micro-UX: Staggered entrance animation -->
      <g class="data-points">
        <circle
          v-for="(point, index) in chartData"
          :key="`point-${index}`"
          :cx="point.x"
          :cy="point.y"
          :r="getPointRadius(index)"
          :fill="chartColor"
          :aria-label="`Value: ${point.value} at ${point.label}`"
          tabindex="0"
          role="button"
          :aria-pressed="focusedIndex === index"
          class="data-point"
          :class="{
            'data-point--hovered': hoveredIndex === index,
            'data-point--focused': focusedIndex === index,
            'data-point--entering': isChartVisible && !prefersReducedMotion,
          }"
          :style="getPointEntranceStyle(index)"
          @mouseenter="handlePointHover(index)"
          @mouseleave="handlePointLeave"
          @focus="handlePointFocus(index)"
          @blur="handlePointBlur"
        />
      </g>
    </svg>

    <!-- Empty State -->
    <div
      v-if="chartData.length === 0"
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

    <!-- Interactive Tooltip - Palette's micro-UX delight! 🎨 -->
    <Transition
      :enter-active-class="`transition-all ${animationConfig.tailwindDurations.normal} ease-out`"
      :enter-active-class-duration="tooltipEnterDuration"
      enter-from-class="opacity-0 scale-95 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      :leave-active-class="`transition-all ${animationConfig.tailwindDurations.quick} ease-in`"
      :leave-active-class-duration="tooltipLeaveDuration"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-2"
    >
      <div
        v-if="tooltipVisible && hoveredPoint"
        id="chart-tooltip"
        role="tooltip"
        class="chart-tooltip"
        :class="{
          'chart-tooltip--left': tooltipPosition === 'left',
          'chart-tooltip--right': tooltipPosition === 'right',
          'chart-tooltip--center': tooltipPosition === 'center',
        }"
        :style="tooltipStyle"
      >
        <div class="tooltip-content">
          <div
            class="tooltip-value"
            :style="{ color: chartColor }"
          >
            {{ hoveredPoint.value.toFixed(2) }}
          </div>
          <div class="tooltip-metric">
            {{ metricName }}
          </div>
          <div class="tooltip-time">
            {{ hoveredPoint.label }}
          </div>
        </div>
        <div
          aria-hidden="true"
          class="tooltip-arrow"
        />
      </div>
    </Transition>

    <!-- Screen Reader Announcement -->
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ chartAnnouncement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { TimeSeriesDataPoint } from '~/types/performance'
import { performanceDashboardConfig } from '~/configs/performance-dashboard.config'
import { animationConfig } from '~/configs/animation.config'

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

// Animation durations
const tooltipEnterDuration = `${animationConfig.tooltip.showDelayMs}ms`
const tooltipLeaveDuration = `${animationConfig.tooltip.hideDelayMs}ms`

// Chart Colors
const chartColors: Record<string, string> = {
  LCP: '#3b82f6',
  INP: '#10b981',
  CLS: '#f59e0b',
  FCP: '#8b5cf6',
  TTFB: '#ef4444',
}

const chartColor = computed(() => chartColors[props.metricName] || '#6b7280')

// 🎨 Palette's micro-UX enhancement: Interactive state management
const hoveredIndex = ref<number | null>(null)
const focusedIndex = ref<number | null>(null)
const crosshairVisible = ref(false)
const crosshairX = ref(0)
const tooltipVisible = ref(false)
const tooltipPosition = ref<'left' | 'center' | 'right'>('center')
const chartAnnouncement = ref('')
const prefersReducedMotion = ref(false)

// 🎨 Palette's micro-UX enhancement: Chart entrance animation state
const isChartVisible = ref(false)
const lineDrawProgress = ref(0)

// Refs for DOM elements
const chartContainer = ref<HTMLElement | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)

// Check for reduced motion preference
onMounted(() => {
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }

    mediaQuery.addEventListener('change', handleChange)

    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handleChange)
    })
  }
})

// 🎨 Palette's micro-UX enhancement: Chart entrance animation
// Animates the line drawing and points fading in when data loads
watch(
  () => props.data,
  newData => {
    if (newData && newData.length > 0 && !prefersReducedMotion.value) {
      // Reset animation state
      isChartVisible.value = false
      lineDrawProgress.value = 0

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        isChartVisible.value = true

        // Animate line drawing progress from 0 to 1
        const duration = animationConfig.adminChart.entranceDurationMs || 1500
        const startTime = performance.now()

        const animateLine = (currentTime: number) => {
          const elapsed = currentTime - startTime
          const progress = Math.min(elapsed / duration, 1)

          // Ease out cubic for smooth animation
          lineDrawProgress.value = 1 - Math.pow(1 - progress, 3)

          if (progress < 1) {
            requestAnimationFrame(animateLine)
          }
        }

        requestAnimationFrame(animateLine)
        /* Flexy hates hardcoded 100! Now using configurable chart entrance delay */
      }, animationConfig.adminChart.entranceDelayMs)
    } else {
      // Skip animation for reduced motion or no data
      isChartVisible.value = true
      lineDrawProgress.value = 1
    }
  },
  { immediate: true }
)

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

// Get hovered point data
const hoveredPoint = computed(() => {
  if (hoveredIndex.value === null) return null
  return chartData.value[hoveredIndex.value]
})

// Calculate tooltip position
const tooltipStyle = computed(() => {
  if (!hoveredPoint.value) return {}

  const pointXPercent = (hoveredPoint.value.x / chartWidth) * 100

  return {
    left: `${pointXPercent}%`,
    top: `${(hoveredPoint.value.y / props.height) * 100}%`,
  }
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

// 🎨 Palette's micro-UX enhancement: Line draw animation style
const lineDrawStyle = computed(() => {
  if (prefersReducedMotion.value || lineDrawProgress.value >= 1) return {}

  // Calculate stroke-dasharray and stroke-dashoffset based on progress
  // This creates the drawing effect
  const pathLength =
    chartData.value.length > 1
      ? chartData.value.reduce((total, point, index) => {
          if (index === 0) return 0
          const prevPoint = chartData.value[index - 1]
          return (
            total +
            Math.sqrt(
              Math.pow(point.x - prevPoint.x, 2) +
                Math.pow(point.y - prevPoint.y, 2)
            )
          )
        }, 0)
      : 1000

  return {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength * (1 - lineDrawProgress.value),
  }
})

// 🎨 Palette's micro-UX enhancement: Get point entrance style with staggered delay
const getPointEntranceStyle = (index: number) => {
  if (prefersReducedMotion.value || lineDrawProgress.value >= 1) return {}

  // Calculate when this point should appear based on line drawing progress
  const pointProgress = index / (chartData.value.length - 1 || 1)
  const visibilityThreshold = pointProgress * 0.8 + 0.2 // Start showing when line is 20% past this point

  const isVisible = lineDrawProgress.value >= visibilityThreshold

  return {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'scale(1)' : 'scale(0)',
    transition: `opacity ${animationConfig.adminChart.dataPointTransitionSec}s ease-out, transform ${animationConfig.adminChart.dataPointTransitionSec}s cubic-bezier(0.175, 0.885, 0.32, 1.275)`,
  }
}

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

// Get point radius based on hover state
function getPointRadius(index: number): number {
  if (hoveredIndex.value === index || focusedIndex.value === index) {
    return svgConfig.pointHoverRadius
  }
  return svgConfig.pointRadius
}

// 🎨 Palette's micro-UX enhancement: Handle point hover
function handlePointHover(index: number) {
  hoveredIndex.value = index
  crosshairVisible.value = true
  tooltipVisible.value = true

  // Update crosshair position
  const point = chartData.value[index]
  if (point) {
    crosshairX.value = point.x

    // Determine tooltip position based on point location
    const pointXPercent = (point.x / chartWidth) * 100
    if (pointXPercent < 25) {
      tooltipPosition.value = 'left'
    } else if (pointXPercent > 75) {
      tooltipPosition.value = 'right'
    } else {
      tooltipPosition.value = 'center'
    }
  }

  // Announce to screen readers
  const pointData = chartData.value[index]
  if (pointData) {
    chartAnnouncement.value = `${props.metricName}: ${pointData.value.toFixed(2)} at ${pointData.label}`
  }
}

// Handle point mouse leave
function handlePointLeave() {
  hoveredIndex.value = null
}

// Handle mouse leave from entire chart
function handleMouseLeave() {
  hoveredIndex.value = null
  crosshairVisible.value = false
  tooltipVisible.value = false
}

// Handle mouse move over chart for crosshair
function handleMouseMove(event: MouseEvent) {
  if (!svgRef.value || prefersReducedMotion.value) return

  const svgRect = svgRef.value.getBoundingClientRect()
  const mouseX = event.clientX - svgRect.left
  const svgX = (mouseX / svgRect.width) * chartWidth

  // Find nearest data point
  let nearestIndex = 0
  let minDistance = Infinity

  chartData.value.forEach((point, index) => {
    const distance = Math.abs(point.x - svgX)
    if (distance < minDistance) {
      minDistance = distance
      nearestIndex = index
    }
  })

  // Update crosshair position
  crosshairX.value = chartData.value[nearestIndex]?.x || 0
}

// Handle point focus for accessibility
function handlePointFocus(index: number) {
  focusedIndex.value = index
  tooltipVisible.value = true

  const pointData = chartData.value[index]
  if (pointData) {
    chartAnnouncement.value = `Focused: ${props.metricName} value ${pointData.value.toFixed(2)} at ${pointData.label}`
  }
}

// Handle point blur
function handlePointBlur() {
  focusedIndex.value = null
  tooltipVisible.value = false
}

// Handle chart click
function handleChartClick() {
  // Future: could open detailed view modal
  chartAnnouncement.value = `Chart clicked. Use Tab to navigate data points.`
}

// Handle keyboard navigation
function handleKeyDown(event: KeyboardEvent) {
  if (chartData.value.length === 0) return

  const currentIndex = focusedIndex.value ?? -1
  let newIndex = currentIndex

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault()
      newIndex = Math.min(currentIndex + 1, chartData.value.length - 1)
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault()
      newIndex = Math.max(currentIndex - 1, 0)
      break
    case 'Home':
      event.preventDefault()
      newIndex = 0
      break
    case 'End':
      event.preventDefault()
      newIndex = chartData.value.length - 1
      break
    case 'Enter':
    case ' ':
      if (currentIndex >= 0) {
        event.preventDefault()
        handleChartClick()
      }
      break
  }

  if (newIndex !== currentIndex && newIndex >= 0) {
    focusedIndex.value = newIndex
    tooltipVisible.value = true

    // Update crosshair for visual feedback
    const point = chartData.value[newIndex]
    if (point) {
      crosshairX.value = point.x
      crosshairVisible.value = !prefersReducedMotion.value
    }

    const pointData = chartData.value[newIndex]
    if (pointData) {
      chartAnnouncement.value = `${props.metricName}: ${pointData.value.toFixed(2)} at ${pointData.label}`
    }
  }
}
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
  outline: none;
}

.chart-svg:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 4px;
  border-radius: 4px;
}

.chart-line {
  transition: all v-bind('animationConfig.adminChart.lineTransitionSec') ease;
}

.chart-area {
  transition: all v-bind('animationConfig.adminChart.lineTransitionSec') ease;
}

.crosshair {
  pointer-events: none;
  transition: all v-bind('animationConfig.adminChart.crosshairTransitionSec')
    ease-out;
}

.data-point {
  cursor: pointer;
  transition: all v-bind('animationConfig.adminChart.dataPointTransitionSec')
    cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
}

.data-point:hover,
.data-point--hovered,
.data-point--focused {
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3));
}

.data-point:focus {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}

/* 🎨 Palette's micro-UX enhancement: Interactive Tooltip Styles */
.chart-tooltip {
  position: absolute;
  background: white;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.2),
    0 4px 10px -2px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  z-index: 50;
  transform: translate(-50%, calc(-100% - 12px));
  min-width: 120px;
  text-align: center;
}

.chart-tooltip--left {
  transform: translate(0, calc(-100% - 12px));
}

.chart-tooltip--right {
  transform: translate(-100%, calc(-100% - 12px));
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tooltip-value {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
}

.tooltip-metric {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tooltip-time {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 2px;
}

.tooltip-arrow {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid white;
}

.chart-tooltip--left .tooltip-arrow {
  left: 16px;
  transform: none;
}

.chart-tooltip--right .tooltip-arrow {
  left: auto;
  right: 16px;
  transform: none;
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

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .chart-tooltip {
    background: #1f2937;
    box-shadow:
      0 10px 25px -5px rgba(0, 0, 0, 0.4),
      0 4px 10px -2px rgba(0, 0, 0, 0.2);
  }

  .tooltip-arrow {
    border-top-color: #1f2937;
  }

  .tooltip-metric {
    color: #9ca3af;
  }

  .tooltip-time {
    color: #6b7280;
  }
}

/* 🎨 Palette's micro-UX enhancement: Chart entrance animations */
.chart-svg--entering {
  animation: chart-fade-in
    v-bind('`${animationConfig.adminChart.entranceDurationMs}ms`') ease-out;
}

@keyframes chart-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.chart-area--entering {
  animation: area-fade-in
    v-bind('`${animationConfig.adminChart.entranceDurationMs}ms`') ease-out;
}

@keyframes area-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.2;
  }
}

.chart-line--entering {
  will-change: stroke-dashoffset;
}

.data-point--entering {
  will-change: opacity, transform;
  transform-origin: center;
}

@media (prefers-reduced-motion: reduce) {
  .chart-line,
  .chart-area,
  .data-point,
  .crosshair {
    transition: none;
  }

  .chart-svg--entering,
  .chart-area--entering {
    animation: none;
    opacity: 1;
  }

  .data-point--entering {
    opacity: 1;
    transform: none;
  }
}
</style>
