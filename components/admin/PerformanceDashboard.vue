<template>
  <div class="performance-dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <h1 class="dashboard-title">
        <span class="title-icon" aria-hidden="true">📊</span>
        Performance Dashboard
        <!-- 🎨 Pallete's micro-UX enhancement: Live data indicator -->
        <span
          v-if="isAutoRefreshActive && !prefersReducedMotion"
          class="live-indicator"
          aria-hidden="true"
        >
          <span class="live-indicator__pulse" />
          <span class="live-indicator__text">LIVE</span>
        </span>
      </h1>
      <div class="dashboard-controls">
        <!-- Time Range Selector -->
        <div class="time-range-selector" role="group" aria-label="Time range">
          <button
            v-for="range in timeRanges"
            :key="range.hours"
            class="range-button"
            :class="{ active: selectedRange === range.hours }"
            :aria-pressed="selectedRange === range.hours"
            @click="setTimeRange(range.hours)"
          >
            {{ range.label }}
          </button>
        </div>

        <!-- Refresh Button -->
        <button
          class="refresh-button"
          :class="{ loading: isLoading }"
          :disabled="isLoading"
          :aria-label="isLoading ? 'Refreshing data' : 'Refresh data'"
          @click="refreshData"
        >
          <span
            class="refresh-icon"
            :class="{ spinning: isLoading }"
            aria-hidden="true"
            >🔄</span
          >
          <span class="refresh-text">{{
            isLoading ? 'Loading...' : 'Refresh'
          }}</span>
        </button>

        <!-- 🎨 Pallete's micro-UX enhancement: Success celebration animation -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-50"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-500 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-150"
        >
          <div
            v-if="showSuccessCelebration && !prefersReducedMotion"
            class="success-celebration"
            aria-hidden="true"
          >
            <div class="celebration-ring" />
            <svg
              class="celebration-checkmark"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 13l4 4L19 7"
                class="checkmark-path"
              />
            </svg>
          </div>
        </Transition>
      </div>
    </header>

    <!-- Last Updated -->
    <div v-if="lastUpdated" class="last-updated" aria-live="polite">
      Last updated: {{ formatLastUpdated(lastUpdated) }}
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message" role="alert">
      <span class="error-icon" aria-hidden="true">⚠️</span>
      {{ error }}
      <button class="retry-button" @click="refreshData">Retry</button>
    </div>

    <!-- Web Vitals Summary -->
    <section class="web-vitals-section" aria-labelledby="web-vitals-heading">
      <h2 id="web-vitals-heading" class="section-title">Core Web Vitals</h2>
      <div class="metrics-grid">
        <MetricCard
          v-for="metric in webVitalsList"
          :key="metric.name"
          :name="metric.name"
          :value="metric.value"
          :p75="metric.p75"
          :p95="metric.p95"
          :rating="metric.rating"
          :description="metric.description"
        />
      </div>
    </section>

    <!-- Performance Trends -->
    <section class="trends-section" aria-labelledby="trends-heading">
      <h2 id="trends-heading" class="section-title">Performance Trends</h2>
      <div class="charts-grid">
        <div
          v-for="metricName in chartMetrics"
          :key="metricName"
          class="chart-container"
        >
          <h3 class="chart-title">{{ metricName }} Over Time</h3>
          <PerformanceChart
            :data="timeSeries[metricName] || []"
            :metric-name="metricName"
            :height="300"
          />
        </div>
      </div>
    </section>

    <!-- API Performance -->
    <section class="api-section" aria-labelledby="api-heading">
      <h2 id="api-heading" class="section-title">API Performance</h2>
      <div class="api-metrics">
        <div class="api-metric-card">
          <span class="api-metric-label">Avg Response Time</span>
          <span class="api-metric-value"
            >{{ apiPerformance.avgResponseTime }}ms</span
          >
        </div>
        <div class="api-metric-card">
          <span class="api-metric-label">P95 Response Time</span>
          <span class="api-metric-value"
            >{{ apiPerformance.p95ResponseTime }}ms</span
          >
        </div>
        <div class="api-metric-card">
          <span class="api-metric-label">Error Rate</span>
          <span class="api-metric-value"
            >{{ (apiPerformance.errorRate * 100).toFixed(2) }}%</span
          >
        </div>
        <div class="api-metric-card">
          <span class="api-metric-label">Total Requests</span>
          <span class="api-metric-value">{{
            apiPerformance.totalRequests.toLocaleString()
          }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MetricCard from './MetricCard.vue'
import PerformanceChart from './PerformanceChart.vue'
import { performanceDashboardConfig } from '~/configs/performance-dashboard.config'
import { layoutConfig } from '~/configs/layout.config'
import type { PerformanceDashboardData } from '~/types/performance'
import logger from '~/utils/logger'
// 🎨 Pallete's micro-UX enhancement: Haptic feedback for success celebration
import { hapticSuccess } from '~/utils/hapticFeedback'
import { animationConfig } from '~/configs/animation.config'

// State
const data = ref<PerformanceDashboardData | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const selectedRange = ref(
  performanceDashboardConfig.dashboard.defaultTimeRangeHours
)
const refreshInterval = ref<ReturnType<typeof setInterval> | null>(null)

// 🎨 Pallete's micro-UX enhancement: Success celebration state
const showSuccessCelebration = ref(false)
const prefersReducedMotion = ref(false)
const celebrationTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
// 🎨 Pallete's micro-UX enhancement: Live data indicator state
const isAutoRefreshActive = ref(false)

// Computed
const timeRanges = computed(
  () => performanceDashboardConfig.dashboard.timeRanges
)

const webVitalsList = computed(() => {
  if (!data.value?.webVitals) return []

  const descriptions: Record<string, string> = {
    LCP: 'Largest Contentful Paint',
    INP: 'Interaction to Next Paint',
    CLS: 'Cumulative Layout Shift',
    FCP: 'First Contentful Paint',
    TTFB: 'Time to First Byte',
  }

  return Object.entries(data.value.webVitals).map(([name, stats]) => ({
    name,
    value: stats.avg,
    p75: stats.p75,
    p95: stats.p95,
    rating: stats.rating,
    description: descriptions[name] || name,
  }))
})

const timeSeries = computed(() => data.value?.timeSeries || {})

const chartMetrics = computed(() => ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'])

const apiPerformance = computed(
  () =>
    data.value?.apiPerformance || {
      avgResponseTime: 0,
      p95ResponseTime: 0,
      errorRate: 0,
      totalRequests: 0,
    }
)

const lastUpdated = computed(() => data.value?.lastUpdated)

// 🎨 Pallete's micro-UX enhancement: Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// 🎨 Pallete's micro-UX enhancement: Trigger success celebration
const triggerSuccessCelebration = () => {
  if (prefersReducedMotion.value) return

  // Clear any existing celebration timeout
  if (celebrationTimeout.value) {
    clearTimeout(celebrationTimeout.value)
  }

  // Show celebration
  showSuccessCelebration.value = true

  // Haptic feedback for mobile users
  hapticSuccess()

  // Hide celebration after animation completes
  celebrationTimeout.value = setTimeout(() => {
    showSuccessCelebration.value = false
  }, animationConfig.performanceDashboard.celebrationDurationMs)
}

// Methods
async function fetchData() {
  if (isLoading.value) return

  isLoading.value = true
  error.value = null

  try {
    const response = await fetch(
      `/api/v1/performance/metrics?range=${selectedRange.value}`
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    data.value = await response.json()

    // 🎨 Pallete's micro-UX enhancement: Celebrate successful data fetch
    triggerSuccessCelebration()
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch data'
    error.value = message
    logger.error('Failed to fetch performance data:', err)
  } finally {
    isLoading.value = false
  }
}

function refreshData() {
  fetchData()
}

function setTimeRange(hours: number) {
  selectedRange.value = hours
  fetchData()
}

function formatLastUpdated(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString()
}

function startAutoRefresh() {
  const intervalMs =
    performanceDashboardConfig.dashboard.refreshIntervalSec * 1000
  refreshInterval.value = setInterval(fetchData, intervalMs)
  // 🎨 Pallete's micro-UX enhancement: Set live indicator state
  isAutoRefreshActive.value = true
}

function stopAutoRefresh() {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
  // 🎨 Pallete's micro-UX enhancement: Clear live indicator state
  isAutoRefreshActive.value = false
}

// Lifecycle
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()
  fetchData()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
  // 🎨 Pallete's micro-UX enhancement: Cleanup celebration timeout
  if (celebrationTimeout.value) {
    clearTimeout(celebrationTimeout.value)
  }
})
</script>

<style scoped>
.performance-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-icon {
  font-size: 1.75rem;
}

.dashboard-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.time-range-selector {
  display: flex;
  background: #f3f4f6;
  border-radius: 0.5rem;
  padding: 0.25rem;
  gap: 0.25rem;
}

.range-button {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s ease;
}

.range-button:hover {
  background: #e5e7eb;
  color: #374151;
}

.range-button.active {
  background: #3b82f6;
  color: white;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s ease;
}

.refresh-button:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon {
  display: inline-block;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.last-updated {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626;
}

.retry-button {
  margin-left: auto;
  padding: 0.375rem 0.75rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
}

.retry-button:hover {
  background: #b91c1c;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.web-vitals-section {
  margin-bottom: 2.5rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.trends-section {
  margin-bottom: 2.5rem;
}

.charts-grid {
  display: grid;
  /* Flexy hates hardcoded 400px! Using layoutConfig.performanceDashboard.chartsGridMinWidthPx */
  grid-template-columns: repeat(
    auto-fit,
    minmax(
      v-bind('layoutConfig.performanceDashboard.chartsGridMinWidthPx + "px"'),
      1fr
    )
  );
  gap: v-bind('layoutConfig.performanceDashboard.chartsGridGap + "rem"');
}

.chart-container {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.api-section {
  margin-bottom: 2.5rem;
}

.api-metrics {
  display: grid;
  /* Flexy hates hardcoded 200px! Using layoutConfig.performanceDashboard.apiMetricsGridMinWidthPx */
  grid-template-columns: repeat(
    auto-fit,
    minmax(
      v-bind(
        'layoutConfig.performanceDashboard.apiMetricsGridMinWidthPx + "px"'
      ),
      1fr
    )
  );
  gap: v-bind('layoutConfig.performanceDashboard.apiMetricsGridGap + "rem"');
}

.api-metric-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.api-metric-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.api-metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

/* 🎨 Pallete's micro-UX enhancement: Success celebration styles */
.success-celebration {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.celebration-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid #10b981;
  animation: celebration-ring-pulse
    v-bind('animationConfig.performanceDashboard.celebrationDurationMs + "ms"')
    ease-out forwards;
}

@keyframes celebration-ring-pulse {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.celebration-checkmark {
  position: relative;
  width: 16px;
  height: 16px;
  color: #10b981;
  z-index: 1;
  animation: checkmark-pop
    v-bind('animationConfig.performanceDashboard.checkmarkPopDurationMs + "ms"')
    ease-out forwards;
}

.checkmark-path {
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: checkmark-draw
    v-bind(
      'animationConfig.performanceDashboard.checkmarkDrawDurationSec + "s"'
    )
    ease-out forwards;
  animation-delay: v-bind(
    'animationConfig.performanceDashboard.checkmarkDelaySec + "s"'
  );
}

@keyframes checkmark-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes checkmark-draw {
  to {
    stroke-dashoffset: 0;
  }
}

/* 🎨 Pallete's micro-UX enhancement: Live data indicator styles */
.live-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-left: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 700;
  color: white;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 4px -1px rgba(16, 185, 129, 0.3);
  /* Flexy hates hardcoded 300ms! Using animationConfig.liveIndicator.fadeInDurationMs */
  animation: live-indicator-fade-in
    v-bind('animationConfig.liveIndicator.fadeInDurationSec') ease-out;
}

@keyframes live-indicator-fade-in {
  0% {
    opacity: 0;
    transform: scale(0.8) translateX(-4px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateX(0);
  }
}

.live-indicator__pulse {
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  position: relative;
}

.live-indicator__pulse::before {
  content: '';
  position: absolute;
  inset: -4px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  animation: live-pulse-ring 2s ease-out infinite;
}

.live-indicator__pulse::after {
  content: '';
  position: absolute;
  inset: 0;
  background: white;
  border-radius: 50%;
  animation: live-pulse-dot 2s ease-out infinite;
}

@keyframes live-pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

@keyframes live-pulse-dot {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(0.9);
    opacity: 0.8;
  }
}

.live-indicator__text {
  font-size: 0.625rem;
  font-weight: 700;
}

@media (max-width: 768px) {
  .performance-dashboard {
    padding: 1rem;
  }

  .dashboard-title {
    font-size: 1.5rem;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .refresh-icon.spinning {
    animation: none;
  }

  .range-button,
  .refresh-button {
    transition: none;
  }

  /* 🎨 Pallete's micro-UX enhancement: Disable celebration animations */
  .celebration-ring,
  .celebration-checkmark,
  .checkmark-path {
    animation: none !important;
  }

  .celebration-checkmark {
    opacity: 1;
    transform: scale(1);
  }

  .checkmark-path {
    stroke-dashoffset: 0;
  }

  /* 🎨 Pallete's micro-UX enhancement: Disable live indicator animations */
  .live-indicator {
    animation: none;
  }

  .live-indicator__pulse::before,
  .live-indicator__pulse::after {
    animation: none;
  }

  .live-indicator__pulse::before {
    opacity: 0.5;
    transform: scale(1.5);
  }
}
</style>
