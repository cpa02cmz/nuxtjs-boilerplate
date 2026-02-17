<template>
  <div
    class="performance-chart"
    :class="{
      'performance-chart--loaded': isLoaded && !prefersReducedMotion,
      'performance-chart--loading': isLoading,
      'performance-chart--empty': chartData.length === 0,
    }"
    :style="{ height: `${height}px` }"
    role="img"
    :aria-label="`${metricName} performance chart`"
    @mouseleave="handleChartMouseLeave"
  >
    <!-- Loading Skeleton State -->
    <div
      v-if="isLoading"
      class="loading-state"
      role="status"
      aria-label="Loading chart data"
    >
      <div
        class="chart-skeleton"
        :class="{ 'animate-pulse': !prefersReducedMotion }"
      >
        <!-- Skeleton grid lines -->
        <div class="skeleton-grid">
          <div
            v-for="n in 5"
            :key="`skeleton-grid-${n}`"
            class="skeleton-grid-line"
          />
        </div>
        <!-- Skeleton line -->
        <div class="skeleton-line" />
        <!-- Skeleton area -->
        <div class="skeleton-area" />
      </div>
    </div>

    <!-- SVG Chart -->
    <svg
      v-else-if="chartData.length > 0"
      ref="chartSvgRef"
      class="chart-svg"
      :class="{ 'chart-svg--entrance': isLoaded && !prefersReducedMotion }"
      :viewBox="`0 0 ${chartWidth} ${height}`"
      preserveAspectRatio="none"
    >
      <!-- Definitions for gradients -->
      <defs>
        <linearGradient
          :id="`areaGradient-${metricName}`"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop
            offset="0%"
            :stop-color="chartColor"
            stop-opacity="0.3"
          />
          <stop
            offset="100%"
            :stop-color="chartColor"
            stop-opacity="0.05"
          />
        </linearGradient>
      </defs>

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
          stroke-width="1"
          stroke-dasharray="4"
          class="grid-line"
          :style="{ '--grid-index': n }"
        />
      </g>

      <!-- Area Path -->
      <path
        class="chart-area"
        :class="{ 'chart-area--animate': isLoaded && !prefersReducedMotion }"
        :d="areaPath"
        :fill="`url(#areaGradient-${metricName})`"
      />

      <!-- Line Path with draw animation -->
      <path
        class="chart-line"
        :class="{ 'chart-line--animate': isLoaded && !prefersReducedMotion }"
        :d="linePath"
        :stroke="chartColor"
        stroke-width="2.5"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Data Points with enhanced interactions -->
      <g class="data-points">
        <circle
          v-for="(point, index) in chartData"
          :key="`point-${index}`"
          :cx="point.x"
          :cy="point.y"
          :r="hoveredPointIndex === index ? 7 : 4"
          :fill="chartColor"
          class="data-point"
          :class="{
            'data-point--hovered': hoveredPointIndex === index,
            'data-point--animate': isLoaded && !prefersReducedMotion,
          }"
          :style="{ '--point-index': index }"
          :aria-label="`Value: ${point.value} ${metricUnit} at ${point.label}`"
          role="button"
          tabindex="0"
          @mouseenter="handlePointHover(index, point)"
          @mouseleave="handlePointLeave"
          @focus="handlePointHover(index, point)"
          @blur="handlePointLeave"
          @keydown="handlePointKeydown($event, index)"
        />
      </g>

      <!-- Hover guide line -->
      <line
        v-if="hoveredPointIndex !== null && !prefersReducedMotion"
        class="hover-guide-line"
        :x1="chartData[hoveredPointIndex]?.x"
        :y1="padding.top"
        :x2="chartData[hoveredPointIndex]?.x"
        :y2="height - padding.bottom"
        :stroke="chartColor"
        stroke-width="1"
        stroke-dasharray="4"
        opacity="0.4"
      />
    </svg>

    <!-- Enhanced Empty State -->
    <div
      v-else
      class="empty-state"
      :class="{ 'empty-state--animate': !prefersReducedMotion }"
    >
      <div
        class="empty-icon-wrapper"
        :class="{ 'empty-icon--float': !prefersReducedMotion }"
      >
        <svg
          class="empty-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"
          />
        </svg>
      </div>
      <span class="empty-text">{{
        contentConfig.performanceChart.emptyState
      }}</span>
      <span class="empty-subtext">{{
        contentConfig.performanceChart.emptySubtext
      }}</span>
    </div>

    <!-- X-Axis Labels -->
    <div
      v-if="chartData.length > 0 && !isLoading"
      class="x-axis-labels"
    >
      <span
        v-for="(label, index) in xAxisLabels"
        :key="`label-${index}`"
        class="x-label"
        :class="{
          'x-label--active': hoveredPointIndex === getLabelPointIndex(index),
        }"
        :style="{ left: `${label.position}%` }"
      >
        {{ label.text }}
      </span>
    </div>

    <!-- Hover Tooltip -->
    <Transition
      :enter-active-class="`transition-all ${animationConfig.tailwindDurations.fast} ease-out`"
      enter-from-class="opacity-0 scale-95 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      :leave-active-class="`transition-all ${animationConfig.tailwindDurations.quick} ease-in`"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-2"
    >
      <div
        v-if="hoveredPoint && tooltipVisible"
        class="chart-tooltip"
        :class="{ 'chart-tooltip--visible': tooltipVisible }"
        :style="tooltipStyle"
        role="tooltip"
      >
        <div class="tooltip-header">
          <span
            class="tooltip-metric"
            :style="{ color: chartColor }"
          >{{
            metricName
          }}</span>
          <span class="tooltip-time">{{ hoveredPoint.label }}</span>
        </div>
        <div class="tooltip-value">
          <span class="value-number">{{
            formatTooltipValue(hoveredPoint.value)
          }}</span>
          <span class="value-unit">{{ metricUnit }}</span>
        </div>
        <div
          v-if="getTrend(hoveredPointIndex)"
          class="tooltip-trend"
          :class="`trend--${getTrend(hoveredPointIndex)}`"
        >
          <svg
            class="trend-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              v-if="getTrend(hoveredPointIndex) === 'up'"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
            />
          </svg>
          <span>{{ getTrendLabel(getTrend(hoveredPointIndex)) }}</span>
        </div>
      </div>
    </Transition>

    <!-- Screen reader announcement -->
    <div
      class="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ announcementText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { TimeSeriesDataPoint } from '~/types/performance'
import { animationConfig } from '~/configs/animation.config'
import { contentConfig } from '~/configs/content.config'
import { hapticLight } from '~/utils/hapticFeedback'

interface Props {
  data: TimeSeriesDataPoint[]
  metricName: string
  height?: number
  /**
   * Show loading state
   * @default false
   */
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  isLoading: false,
})

// Constants
const chartWidth = 800
const padding = { top: 20, right: 30, bottom: 30, left: 50 }

// Chart Colors
const chartColors: Record<string, string> = {
  LCP: '#3b82f6',
  INP: '#10b981',
  CLS: '#f59e0b',
  FCP: '#8b5cf6',
  TTFB: '#ef4444',
}

// 🎨 Pallete's micro-UX enhancement: Reactive state
const chartSvgRef = ref<SVGElement | null>(null)
const isLoaded = ref(false)
const prefersReducedMotion = ref(false)
const hoveredPointIndex = ref<number | null>(null)
const hoveredPoint = ref<{
  x: number
  y: number
  value: number
  label: string
} | null>(null)
const tooltipVisible = ref(false)
const announcementText = ref('')

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const chartColor = computed(() => chartColors[props.metricName] || '#6b7280')

// 🎨 Pallete's micro-UX enhancement: Get metric unit
const metricUnit = computed(() => {
  switch (props.metricName) {
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

// Get line path length for animation
const linePathLength = computed(() => {
  if (chartData.value.length < 2) return 0
  let length = 0
  for (let i = 1; i < chartData.value.length; i++) {
    const dx = chartData.value[i].x - chartData.value[i - 1].x
    const dy = chartData.value[i].y - chartData.value[i - 1].y
    length += Math.sqrt(dx * dx + dy * dy)
  }
  return length
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

// Get point index for a label
const getLabelPointIndex = (labelIndex: number): number => {
  const count = Math.min(5, props.data.length)
  const step = Math.floor(props.data.length / count)
  return labelIndex * step
}

// 🎨 Pallete's micro-UX enhancement: Tooltip positioning
const tooltipStyle = computed(() => {
  if (!hoveredPoint.value || !chartSvgRef.value) return {}

  const svgRect = chartSvgRef.value.getBoundingClientRect()
  const scaleX = svgRect.width / chartWidth
  const scaleY = svgRect.height / props.height

  const x = hoveredPoint.value.x * scaleX
  const y = hoveredPoint.value.y * scaleY

  return {
    left: `${x}px`,
    top: `${y - 10}px`,
    transform: 'translate(-50%, -100%)',
  }
})

// 🎨 Pallete's micro-UX enhancement: Format tooltip value
const formatTooltipValue = (value: number): string => {
  if (props.metricName === 'CLS') {
    return value.toFixed(3)
  }
  return Math.round(value).toString()
}

// 🎨 Pallete's micro-UX enhancement: Get trend direction
const getTrend = (index: number | null): 'up' | 'down' | null => {
  if (index === null || index === 0 || chartData.value.length < 2) return null

  const current = chartData.value[index].value
  const previous = chartData.value[index - 1].value

  if (current > previous) return 'up'
  if (current < previous) return 'down'
  return null
}

// 🎨 Pallete's micro-UX enhancement: Get trend label
const getTrendLabel = (trend: 'up' | 'down' | null): string => {
  if (!trend) return ''
  // For performance metrics, lower is better (except maybe some metrics)
  const isLowerBetter = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'].includes(
    props.metricName
  )
  if (isLowerBetter) {
    return trend === 'down' ? 'Improving' : 'Declining'
  }
  return trend === 'up' ? 'Increasing' : 'Decreasing'
}

// 🎨 Pallete's micro-UX enhancement: Handle point hover
const handlePointHover = (
  index: number,
  point: { x: number; y: number; value: number; label: string }
) => {
  hoveredPointIndex.value = index
  hoveredPoint.value = point
  tooltipVisible.value = true

  // Haptic feedback for mobile users
  if (!prefersReducedMotion.value) {
    hapticLight()
  }

  // Announce to screen readers
  announcementText.value = `${props.metricName}: ${formatTooltipValue(point.value)}${metricUnit.value} at ${point.label}`
}

// 🎨 Pallete's micro-UX enhancement: Handle point leave
const handlePointLeave = () => {
  hoveredPointIndex.value = null
  hoveredPoint.value = null
  tooltipVisible.value = false
}

// 🎨 Pallete's micro-UX enhancement: Handle chart mouse leave
const handleChartMouseLeave = () => {
  hoveredPointIndex.value = null
  hoveredPoint.value = null
  tooltipVisible.value = false
}

// 🎨 Pallete's micro-UX enhancement: Handle keyboard navigation
const handlePointKeydown = (event: KeyboardEvent, currentIndex: number) => {
  switch (event.key) {
    case 'ArrowRight':
      event.preventDefault()
      if (currentIndex < chartData.value.length - 1) {
        const nextPoint = chartData.value[currentIndex + 1]
        handlePointHover(currentIndex + 1, nextPoint)
        // Focus the next point
        nextTick(() => {
          const nextElement = document.querySelector(
            `[data-point-index="${currentIndex + 1}"]`
          )
          ;(nextElement as HTMLElement)?.focus()
        })
      }
      break
    case 'ArrowLeft':
      event.preventDefault()
      if (currentIndex > 0) {
        const prevPoint = chartData.value[currentIndex - 1]
        handlePointHover(currentIndex - 1, prevPoint)
        // Focus the previous point
        nextTick(() => {
          const prevElement = document.querySelector(
            `[data-point-index="${currentIndex - 1}"]`
          )
          ;(prevElement as HTMLElement)?.focus()
        })
      }
      break
    case 'Escape':
      event.preventDefault()
      handlePointLeave()
      break
  }
}

// 🎨 Pallete's micro-UX enhancement: Lifecycle hooks
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Trigger entrance animation
  if (!props.isLoading && chartData.value.length > 0) {
    setTimeout(() => {
      isLoaded.value = true
    }, animationConfig.performanceChart.entranceDelayMs)
  }

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleChange)

    // Cleanup
    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handleChange)
    })
  }
})
</script>

<style scoped>
.performance-chart {
  width: 100%;
  position: relative;
}

.performance-chart--loading {
  pointer-events: none;
}

.chart-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* 🎨 Pallete's micro-UX enhancement: Grid line entrance animation */
.grid-line {
  opacity: 0;
  animation: grid-line-fade-in
    v-bind('animationConfig.performanceChart.gridEntranceDurationMs + "ms"')
    ease-out forwards;
  animation-delay: calc(var(--grid-index) * 50ms);
}

.performance-chart--loaded .grid-line {
  opacity: 1;
  animation: none;
}

@keyframes grid-line-fade-in {
  0% {
    opacity: 0;
    stroke-dashoffset: 100;
  }
  100% {
    opacity: 1;
    stroke-dashoffset: 0;
  }
}

/* 🎨 Pallete's micro-UX enhancement: Line draw animation */
.chart-line {
  transition: all v-bind('animationConfig.cssTransitions.normalSec') ease;
  stroke-dasharray: v-bind('linePathLength');
  stroke-dashoffset: v-bind('linePathLength');
}

.chart-line--animate {
  animation: draw-line
    v-bind('animationConfig.performanceChart.lineDrawDurationMs + "ms"')
    ease-out forwards;
}

@keyframes draw-line {
  0% {
    stroke-dashoffset: v-bind('linePathLength');
  }
  100% {
    stroke-dashoffset: 0;
  }
}

/* 🎨 Pallete's micro-UX enhancement: Area fill animation */
.chart-area {
  transition: all v-bind('animationConfig.cssTransitions.normalSec') ease;
  opacity: 0;
}

.chart-area--animate {
  animation: fade-in-area
    v-bind('animationConfig.performanceChart.areaFadeDurationMs + "ms"')
    ease-out forwards;
  animation-delay: v-bind(
    'animationConfig.performanceChart.lineDrawDurationMs / 2 + "ms"'
  );
}

@keyframes fade-in-area {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

/* 🎨 Pallete's micro-UX enhancement: Data points with staggered entrance */
.data-point {
  cursor: pointer;
  transition: all v-bind('animationConfig.cssTransitions.fastSec') ease;
  opacity: 0;
  transform-origin: center;
}

.data-point--animate {
  animation: point-pop-in
    v-bind('animationConfig.performanceChart.pointEntranceDurationMs + "ms"')
    ease-out forwards;
  animation-delay: calc(
    var(--point-index) *
      v-bind('animationConfig.performanceChart.pointStaggerMs + "ms"')
  );
}

.performance-chart--loaded .data-point {
  opacity: 1;
  animation: none;
}

.data-point:hover,
.data-point--hovered {
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3));
  stroke: white;
  stroke-width: 2px;
}

@keyframes point-pop-in {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  60% {
    transform: scale(1.3);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 🎨 Pallete's micro-UX enhancement: Hover guide line */
.hover-guide-line {
  pointer-events: none;
  animation: guide-line-fade-in v-bind('animationConfig.cssTransitions.fastSec')
    ease-out;
}

@keyframes guide-line-fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 0.4;
  }
}

/* 🎨 Pallete's micro-UX enhancement: Loading skeleton state */
.loading-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-skeleton {
  width: 100%;
  height: 100%;
  position: relative;
  background: rgb(249, 250, 251);
  border-radius: 0.5rem;
  overflow: hidden;
}

.skeleton-grid {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 20px 30px 30px 50px;
}

.skeleton-grid-line {
  height: 1px;
  background: rgb(229, 231, 235);
  width: 100%;
}

.skeleton-line {
  position: absolute;
  left: 50px;
  right: 30px;
  top: 20%;
  bottom: 30px;
  background: linear-gradient(
    135deg,
    transparent 30%,
    rgba(59, 130, 246, 0.1) 50%,
    transparent 70%
  );
  animation: skeleton-shimmer
    v-bind('animationConfig.skeleton.shimmerDurationSec') ease-in-out infinite;
}

.skeleton-area {
  position: absolute;
  left: 50px;
  right: 30px;
  bottom: 30px;
  height: 50%;
  background: linear-gradient(to top, rgba(59, 130, 246, 0.05), transparent);
}

@keyframes skeleton-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 🎨 Pallete's micro-UX enhancement: Enhanced empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgb(156, 163, 175);
  gap: 0.75rem;
  padding: 2rem;
  background: linear-gradient(
    135deg,
    rgb(249, 250, 251) 0%,
    rgb(243, 244, 246) 100%
  );
  border-radius: 0.5rem;
  border: 2px dashed rgb(229, 231, 235);
}

.empty-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  color: rgb(156, 163, 175);
}

.empty-icon--float {
  animation: empty-icon-float 3s ease-in-out infinite;
}

@keyframes empty-icon-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.empty-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(107, 114, 128);
}

.empty-subtext {
  font-size: 0.75rem;
  color: rgb(156, 163, 175);
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
  color: rgb(107, 114, 128);
  white-space: nowrap;
  transition: all v-bind('animationConfig.cssTransitions.fastSec') ease;
}

.x-label--active {
  color: v-bind('chartColor');
  font-weight: 600;
  transform: translateX(-50%) scale(1.1);
}

/* 🎨 Pallete's micro-UX enhancement: Hover tooltip */
.chart-tooltip {
  position: absolute;
  background: white;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid rgb(229, 231, 235);
  pointer-events: none;
  z-index: 50;
  min-width: 140px;
}

.tooltip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.tooltip-metric {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tooltip-time {
  font-size: 0.625rem;
  color: rgb(107, 114, 128);
}

.tooltip-value {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.value-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(17, 24, 39);
}

.value-unit {
  font-size: 0.75rem;
  color: rgb(107, 114, 128);
  font-weight: 500;
}

.tooltip-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
}

.tooltip-trend.trend--up {
  background: rgb(254, 226, 226);
  color: rgb(185, 28, 28);
}

.tooltip-trend.trend--down {
  background: rgb(220, 252, 231);
  color: rgb(21, 128, 61);
}

.trend-icon {
  width: 0.875rem;
  height: 0.875rem;
}

/* Screen reader only */
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

/* 🎨 Pallete's micro-UX enhancement: Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .chart-line,
  .chart-area,
  .data-point {
    transition: none;
    animation: none !important;
    opacity: 1;
    stroke-dashoffset: 0;
  }

  .grid-line {
    animation: none;
    opacity: 1;
  }

  .chart-skeleton {
    animation: none;
  }

  .skeleton-line {
    animation: none;
  }

  .empty-icon--float {
    animation: none;
  }

  .data-point:hover,
  .data-point--hovered {
    transform: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .data-point:focus {
    outline: 3px solid currentColor;
    outline-offset: 2px;
  }

  .chart-tooltip {
    border-width: 2px;
  }
}
</style>
