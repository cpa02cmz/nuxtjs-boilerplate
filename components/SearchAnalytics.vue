<template>
  <div
    class="search-analytics bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8"
    :class="{ 'reduced-motion': prefersReducedMotion }"
  >
    <!-- ARIA Live Region for Announcements -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ announcementText }}
    </div>

    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">
        Search Analytics
      </h2>
      <div class="flex space-x-2">
        <select
          v-model="timeRange"
          class="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
          @change="handleTimeRangeChange"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>
    </div>

    <!-- Loading Skeleton State -->
    <div v-if="loading" class="space-y-8">
      <!-- Skeleton Stat Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="n in 4"
          :key="n"
          class="skeleton-card"
          :style="{ '--skeleton-index': n }"
        >
          <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <div class="flex items-center">
              <div
                class="skeleton-icon rounded-full bg-gray-200 dark:bg-gray-600"
              />
              <div class="ml-4 flex-1">
                <div class="skeleton-text skeleton-text--small w-20 mb-2" />
                <div class="skeleton-text skeleton-text--large w-16" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Skeleton Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          v-for="n in 2"
          :key="`chart-${n}`"
          class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600"
        >
          <div class="skeleton-text skeleton-text--medium w-32 mb-4" />
          <div class="h-48 flex items-end space-x-2">
            <div
              v-for="bar in 7"
              :key="bar"
              class="flex-1 skeleton-bar"
              :style="{ '--bar-index': bar }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="text-red-600 dark:text-red-400 text-center py-8"
    >
      <p class="text-lg font-medium">Error loading search analytics</p>
      <p class="mt-2">
        {{ error }}
      </p>
      <button
        class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all duration-200 transform hover:scale-105 active:scale-95"
        :class="{ 'transform-none': prefersReducedMotion }"
        @click="handleRetry"
      >
        Retry
      </button>
    </div>

    <!-- Search Analytics Overview Cards -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      <div
        v-for="(stat, index) in statCards"
        :key="stat.key"
        class="stat-card"
        :class="{
          'stat-card--animate': !prefersReducedMotion && dataLoaded,
          'stat-card--hover': !prefersReducedMotion,
        }"
        :style="{ '--card-index': index }"
      >
        <div
          class="stat-card-inner p-4 rounded-lg border transition-all duration-200"
          :class="stat.bgClass"
        >
          <div class="flex items-center">
            <div
              class="stat-icon rounded-full p-3 transition-transform duration-200"
              :class="stat.iconBgClass"
            >
              <svg
                class="h-6 w-6"
                :class="stat.iconColorClass"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="stat.iconPath"
                />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ stat.label }}
              </h3>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                <span
                  v-if="!prefersReducedMotion && dataLoaded"
                  class="stat-number"
                  >{{ animatedValues[stat.key] }}</span
                >
                <span v-else>{{ stat.value }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts and Data Sections -->
    <div
      v-if="!loading && !error"
      class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
    >
      <!-- Search Trends Chart -->
      <div
        class="chart-container bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600"
        :class="{
          'chart-container--animate': !prefersReducedMotion && dataLoaded,
        }"
      >
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Search Trends
        </h3>
        <div
          v-if="!searchAnalytics?.data?.searchTrends?.length"
          class="h-64 flex items-center justify-center"
        >
          <p class="text-gray-500 dark:text-gray-400">
            No search trend data available
          </p>
        </div>
        <div v-else class="h-64">
          <div class="flex items-end h-48 space-x-1">
            <div
              v-for="(day, index) in searchAnalytics.data.searchTrends"
              :key="index"
              class="flex flex-col items-center flex-1 min-w-0"
            >
              <div class="w-full flex justify-center relative group">
                <div
                  class="chart-bar w-3/4 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                  :class="{
                    'chart-bar--animate': !prefersReducedMotion && dataLoaded,
                  }"
                  :style="{
                    height: `${(day.count / maxSearchCount) * 100}%`,
                    '--bar-index': index,
                  }"
                  :title="`${day.date}: ${day.count} searches`"
                />
                <!-- Tooltip on hover -->
                <div
                  class="chart-tooltip absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
                >
                  {{ day.count }} searches
                </div>
              </div>
              <span
                class="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate w-full text-center"
              >
                {{ formatDate(day.date) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Popular Searches -->
      <div
        class="chart-container bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600"
        :class="{
          'chart-container--animate': !prefersReducedMotion && dataLoaded,
        }"
      >
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Popular Searches
        </h3>
        <div
          v-if="!searchAnalytics?.data?.popularSearches?.length"
          class="text-gray-500 dark:text-gray-400 text-center py-8"
        >
          No popular search data available
        </div>
        <ul v-else class="space-y-3 max-h-64 overflow-y-auto">
          <li
            v-for="(search, index) in searchAnalytics.data.popularSearches"
            :key="search.query"
            class="popular-search-item flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500"
            :class="{
              'popular-search-item--animate':
                !prefersReducedMotion && dataLoaded,
              'hover:transform hover:translate-x-1': !prefersReducedMotion,
            }"
            :style="{ '--item-index': index }"
          >
            <div class="flex items-center">
              <span class="text-gray-500 dark:text-gray-400 font-medium w-6"
                >#{{ index + 1 }}</span
              >
              <span
                class="ml-2 font-medium truncate max-w-xs text-gray-900 dark:text-white"
                >{{ search.query }}</span
              >
            </div>
            <span class="text-gray-700 dark:text-gray-300 font-medium">{{
              search.count
            }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Additional Search Analytics Sections -->
    <div
      v-if="!loading && !error"
      class="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      <!-- Zero-Result Queries -->
      <div
        class="chart-container bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600"
        :class="{
          'chart-container--animate': !prefersReducedMotion && dataLoaded,
        }"
      >
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Zero-Result Queries
        </h3>
        <div
          v-if="!searchAnalytics?.data?.zeroResultQueries?.length"
          class="text-gray-500 dark:text-gray-400 text-center py-8"
        >
          No zero-result query data available
        </div>
        <ul v-else class="space-y-2 max-h-64 overflow-y-auto">
          <li
            v-for="(query, index) in searchAnalytics.data.zeroResultQueries"
            :key="query.query"
            class="zero-result-item flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200"
            :class="{
              'zero-result-item--animate': !prefersReducedMotion && dataLoaded,
            }"
            :style="{ '--item-index': index }"
          >
            <div class="flex items-center">
              <span class="text-gray-500 dark:text-gray-400 w-6"
                >#{{ index + 1 }}</span
              >
              <span class="text-gray-700 dark:text-gray-300 ml-2">{{
                query.query
              }}</span>
            </div>
            <span class="font-medium text-gray-900 dark:text-white">{{
              query.count
            }}</span>
          </li>
        </ul>
      </div>

      <!-- Search Performance -->
      <div
        class="chart-container bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600"
        :class="{
          'chart-container--animate': !prefersReducedMotion && dataLoaded,
        }"
      >
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Search Performance
        </h3>
        <div
          v-if="!searchAnalytics?.data?.performanceMetrics"
          class="text-gray-500 dark:text-gray-400 text-center py-8"
        >
          No performance data available
        </div>
        <div v-else class="space-y-3">
          <div class="grid grid-cols-2 gap-4">
            <div
              class="performance-metric bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md"
              :class="{
                'hover:transform hover:scale-105': !prefersReducedMotion,
              }"
            >
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Fast Searches (&lt;100ms)
              </p>
              <p class="text-xl font-semibold text-green-600">
                {{ searchAnalytics.data.performanceMetrics.fastSearches }}
              </p>
            </div>
            <div
              class="performance-metric bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md"
              :class="{
                'hover:transform hover:scale-105': !prefersReducedMotion,
              }"
            >
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Medium Searches (100-500ms)
              </p>
              <p class="text-xl font-semibold text-yellow-600">
                {{ searchAnalytics.data.performanceMetrics.mediumSearches }}
              </p>
            </div>
          </div>
          <div
            class="performance-metric bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md"
            :class="{
              'hover:transform hover:scale-105': !prefersReducedMotion,
            }"
          >
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Slow Searches (&gt;500ms)
            </p>
            <p class="text-xl font-semibold text-red-600">
              {{ searchAnalytics.data.performanceMetrics.slowSearches }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useSearchAnalytics } from '~/composables/useSearchAnalytics'
import { animationConfig } from '~/configs/animation.config'
import { hapticLight, hapticSuccess } from '~/utils/hapticFeedback'

const {
  searchAnalytics,
  loading,
  error,
  timeRange,
  maxSearchCount,
  formatDate,
  fetchSearchAnalytics,
} = useSearchAnalytics()

// Palette's micro-UX enhancement: Track reduced motion preference
const prefersReducedMotion = ref(false)

// Palette's micro-UX enhancement: Track data loaded state for animations
const dataLoaded = ref(false)

// Palette's micro-UX enhancement: Announcement text for screen readers
const announcementText = ref('')

// Animated values for number counting effect
const animatedValues = ref<Record<string, string>>({
  totalSearches: '0',
  successRate: '0%',
  zeroResultCount: '0',
  avgResponseTime: '0ms',
})

// Timer refs for cleanup
const animationTimers: ReturnType<typeof setTimeout>[] = []

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Announce to screen readers
const announce = (message: string): void => {
  announcementText.value = message
  const timer = setTimeout(() => {
    announcementText.value = ''
  }, 3000)
  animationTimers.push(timer)
}

// Stat card definitions
const statCards = computed(() => [
  {
    key: 'totalSearches',
    label: 'Total Searches',
    value: String(searchAnalytics.value?.data?.totalSearches || 0),
    bgClass:
      'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800',
    iconBgClass: 'bg-blue-100 dark:bg-blue-800',
    iconColorClass: 'text-blue-600 dark:text-blue-400',
    iconPath: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  },
  {
    key: 'successRate',
    label: 'Success Rate',
    value: searchAnalytics.value?.data?.successRate
      ? `${searchAnalytics.value.data.successRate}%`
      : '0%',
    bgClass:
      'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800',
    iconBgClass: 'bg-green-100 dark:bg-green-800',
    iconColorClass: 'text-green-600 dark:text-green-400',
    iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    key: 'zeroResultCount',
    label: 'Zero-Result',
    value: String(searchAnalytics.value?.data?.zeroResultCount || 0),
    bgClass:
      'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800',
    iconBgClass: 'bg-yellow-100 dark:bg-yellow-800',
    iconColorClass: 'text-yellow-600 dark:text-yellow-400',
    iconPath:
      'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
  {
    key: 'avgResponseTime',
    label: 'Avg Response',
    value: searchAnalytics.value?.data?.avgResponseTime
      ? `${searchAnalytics.value.data.avgResponseTime}ms`
      : '0ms',
    bgClass:
      'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800',
    iconBgClass: 'bg-purple-100 dark:bg-purple-800',
    iconColorClass: 'text-purple-600 dark:text-purple-400',
    iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
])

// Number counting animation function
const animateNumber = (key: string, targetValue: string, duration: number) => {
  // Extract numeric value and unit
  const match = targetValue.match(/^([\d,.]+)(.*)$/)
  if (!match) {
    animatedValues.value[key] = targetValue
    return
  }

  const [, numStr, unit] = match
  const target = parseFloat(numStr.replace(/,/g, ''))
  const startTime = performance.now()

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function: easeOutQuart
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)
    const current = Math.round(target * easeOutQuart)

    animatedValues.value[key] = `${current}${unit}`

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      animatedValues.value[key] = targetValue
    }
  }

  requestAnimationFrame(animate)
}

// Trigger number animations when data loads
const triggerNumberAnimations = () => {
  if (prefersReducedMotion.value) return

  const duration = animationConfig.searchAnalytics.countUpDurationMs

  statCards.value.forEach((stat, index) => {
    const timer = setTimeout(() => {
      animateNumber(stat.key, stat.value, duration)
    }, index * animationConfig.searchAnalytics.cardStaggerDelayMs)
    animationTimers.push(timer)
  })
}

// Handle time range change with haptic feedback
const handleTimeRangeChange = () => {
  if (!prefersReducedMotion.value) {
    hapticLight()
  }
  dataLoaded.value = false
  fetchSearchAnalytics()
}

// Handle retry with haptic feedback
const handleRetry = () => {
  if (!prefersReducedMotion.value) {
    hapticLight()
  }
  fetchSearchAnalytics()
}

// Watch for loading state changes
watch(
  () => loading.value,
  isLoading => {
    if (!isLoading && !error.value) {
      // Data loaded successfully
      dataLoaded.value = false

      // Small delay to allow DOM to render before animating
      const timer = setTimeout(() => {
        dataLoaded.value = true
        triggerNumberAnimations()
        announce('Search analytics data loaded')

        // Haptic feedback after animations start
        if (!prefersReducedMotion.value) {
          const hapticTimer = setTimeout(() => {
            hapticSuccess()
          }, animationConfig.searchAnalytics.hapticDelayMs)
          animationTimers.push(hapticTimer)
        }
      }, 100)
      animationTimers.push(timer)
    }
  }
)

// Initialize on mount
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleChange)
  }

  // Trigger animations if data is already loaded
  if (!loading.value && searchAnalytics.value) {
    dataLoaded.value = true
    triggerNumberAnimations()
  }
})

// Cleanup timers on unmount
onUnmounted(() => {
  animationTimers.forEach(timer => clearTimeout(timer))
})
</script>

<style scoped>
/* Skeleton Loading Styles */
.skeleton-card {
  animation: skeleton-fade-in 0.3s ease-out backwards;
  animation-delay: calc(var(--skeleton-index) * 75ms);
}

.skeleton-icon {
  width: 3rem;
  height: 3rem;
  position: relative;
  overflow: hidden;
}

.skeleton-icon::after,
.skeleton-text::after,
.skeleton-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: skeleton-shimmer
    v-bind('animationConfig.searchAnalytics.skeletonShimmerDurationMs + "ms"')
    infinite;
}

.skeleton-text {
  height: 0.875rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  position: relative;
  overflow: hidden;
}

.skeleton-text--small {
  height: 0.75rem;
}

.skeleton-text--large {
  height: 1.5rem;
  width: 4rem;
}

.skeleton-text--medium {
  height: 1rem;
}

.skeleton-bar {
  background: #d1d5db;
  border-radius: 0.25rem 0.25rem 0 0;
  position: relative;
  overflow: hidden;
  animation: skeleton-bar-grow 0.4s ease-out backwards;
  animation-delay: calc(var(--bar-index) * 50ms);
}

@keyframes skeleton-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes skeleton-shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes skeleton-bar-grow {
  from {
    height: 0;
  }
}

/* Dark mode skeleton adjustments */
@media (prefers-color-scheme: dark) {
  .skeleton-text {
    background: #4b5563;
  }
  .skeleton-bar {
    background: #6b7280;
  }
}

/* Stat Card Entrance Animations */
.stat-card--animate {
  animation: stat-card-entrance
    v-bind('animationConfig.searchAnalytics.cardEntranceDurationMs + "ms"')
    ease-out backwards;
  animation-delay: calc(
    var(--card-index) *
      v-bind('animationConfig.searchAnalytics.cardStaggerDelayMs + "ms"')
  );
}

@keyframes stat-card-entrance {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  60% {
    transform: translateY(-4px) scale(1.01);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Stat Card Hover Effects */
.stat-card--hover .stat-card-inner {
  transition: all
    v-bind('animationConfig.searchAnalytics.cardHoverTransitionMs + "ms"')
    ease-out;
}

.stat-card--hover:hover .stat-card-inner {
  transform: translateY(-4px);
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

.stat-card--hover:hover .stat-icon {
  transform: scale(v-bind('animationConfig.searchAnalytics.iconBounceScale'));
}

/* Chart Container Animation */
.chart-container--animate {
  animation: chart-fade-in 0.5s ease-out backwards;
  animation-delay: 0.4s;
}

@keyframes chart-fade-in {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Chart Bar Animation */
.chart-bar--animate {
  animation: bar-grow
    v-bind('animationConfig.searchAnalytics.chartBarDurationMs + "ms"') ease-out
    backwards;
  animation-delay: calc(
    var(--bar-index) *
      v-bind('animationConfig.searchAnalytics.chartBarStaggerMs + "ms"') + 500ms
  );
}

@keyframes bar-grow {
  from {
    height: 0;
  }
}

/* Popular Search Item Animation */
.popular-search-item--animate {
  animation: item-slide-in 0.4s ease-out backwards;
  animation-delay: calc(var(--item-index) * 75ms + 600ms);
}

@keyframes item-slide-in {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Zero Result Item Animation */
.zero-result-item--animate {
  animation: item-fade-in 0.3s ease-out backwards;
  animation-delay: calc(var(--item-index) * 50ms + 700ms);
}

@keyframes item-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Chart Tooltip */
.chart-tooltip {
  z-index: 10;
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

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .skeleton-card,
  .skeleton-bar,
  .stat-card--animate,
  .chart-container--animate,
  .chart-bar--animate,
  .popular-search-item--animate,
  .zero-result-item--animate {
    animation: none !important;
  }

  .skeleton-icon::after,
  .skeleton-text::after,
  .skeleton-bar::after {
    display: none;
  }

  .stat-card--hover:hover .stat-card-inner,
  .stat-card--hover:hover .stat-icon {
    transform: none !important;
  }

  * {
    transition-duration: 0.01ms !important;
  }
}

/* Parent reduced motion class */
.reduced-motion .skeleton-card,
.reduced-motion .skeleton-bar,
.reduced-motion .stat-card--animate,
.reduced-motion .chart-container--animate,
.reduced-motion .chart-bar--animate,
.reduced-motion .popular-search-item--animate,
.reduced-motion .zero-result-item--animate {
  animation: none !important;
}

.reduced-motion .skeleton-icon::after,
.reduced-motion .skeleton-text::after,
.reduced-motion .skeleton-bar::after {
  display: none;
}

.reduced-motion .stat-card--hover:hover .stat-card-inner,
.reduced-motion .stat-card--hover:hover .stat-icon {
  transform: none !important;
}
</style>
