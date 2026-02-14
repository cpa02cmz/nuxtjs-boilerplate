<template>
  <div
    class="search-analytics bg-white p-6 rounded-lg shadow mb-8"
    :class="{ 'animations-enabled': !prefersReducedMotion }"
  >
    <!-- ARIA Live Region for Announcements -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ announcementText }}
    </div>

    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-900">Search Analytics</h2>
      <div class="flex space-x-2">
        <select
          v-model="timeRange"
          class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @change="handleTimeRangeChange"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>
    </div>

    <!-- Loading State with Shimmer Animation - Palette's micro-UX delight! -->
    <div v-if="loading" class="flex justify-center py-12">
      <div
        v-if="prefersReducedMotion"
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
        role="status"
        aria-label="Loading search analytics"
      />
      <div
        v-else
        class="shimmer-spinner"
        role="status"
        aria-label="Loading search analytics"
      >
        <div class="shimmer-ring" />
        <div class="shimmer-dot" />
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-red-600 text-center py-8">
      <p class="text-lg font-medium">Error loading search analytics</p>
      <p class="mt-2">
        {{ error }}
      </p>
      <button
        class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        @click="fetchSearchAnalytics"
      >
        Retry
      </button>
    </div>

    <!-- Search Analytics Overview Cards -->
    <TransitionGroup
      v-else
      name="stat-card"
      tag="div"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      :class="{ 'reduced-motion': prefersReducedMotion }"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
    >
      <!-- Total Searches Card -->
      <div
        :key="'total-searches'"
        class="stat-card bg-blue-50 p-4 rounded-lg border border-blue-100"
        :class="{
          'is-hovered': hoveredCard === 'total',
          'is-pressed': pressedCard === 'total',
        }"
        :data-index="0"
        @mouseenter="handleCardHover('total')"
        @mouseleave="handleCardLeave"
        @mousedown="handleCardPress('total')"
        @mouseup="handleCardRelease"
        @touchstart="handleCardPress('total')"
        @touchend="handleCardRelease"
      >
        <!-- Glow effect on hover -->
        <div
          v-if="hoveredCard === 'total' && !prefersReducedMotion"
          class="stat-card-glow"
          aria-hidden="true"
        />
        <div class="flex items-center relative z-10">
          <div class="rounded-full bg-blue-100 p-3 stat-icon">
            <svg
              class="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">Total Searches</h3>
            <p class="text-2xl font-semibold text-gray-900 stat-value">
              {{ animatedTotalSearches }}
            </p>
          </div>
        </div>
      </div>

      <!-- Success Rate Card with Progress Ring - Palette's micro-UX delight! -->
      <div
        :key="'success-rate'"
        class="stat-card bg-green-50 p-4 rounded-lg border border-green-100"
        :class="{
          'is-hovered': hoveredCard === 'success',
          'is-pressed': pressedCard === 'success',
        }"
        :data-index="1"
        @mouseenter="handleCardHover('success')"
        @mouseleave="handleCardLeave"
        @mousedown="handleCardPress('success')"
        @mouseup="handleCardRelease"
        @touchstart="handleCardPress('success')"
        @touchend="handleCardRelease"
      >
        <div
          v-if="hoveredCard === 'success' && !prefersReducedMotion"
          class="stat-card-glow"
          aria-hidden="true"
        />
        <div class="flex items-center relative z-10">
          <div class="stat-icon-with-progress relative">
            <!-- Progress Ring - Palette's micro-UX delight! -->
            <svg
              v-if="!prefersReducedMotion"
              class="progress-ring absolute -inset-1"
              :width="progressRingSize"
              :height="progressRingSize"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <circle
                class="progress-ring-bg"
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="#d1fae5"
                stroke-width="3"
              />
              <circle
                class="progress-ring-fill"
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="#10b981"
                stroke-width="3"
                stroke-linecap="round"
                :stroke-dasharray="progressCircumference"
                :stroke-dashoffset="progressDashOffset"
                transform="rotate(-90 24 24)"
              />
            </svg>
            <div class="rounded-full bg-green-100 p-3 stat-icon relative">
              <svg
                class="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">Success Rate</h3>
            <p class="text-2xl font-semibold text-gray-900 stat-value">
              {{ animatedSuccessRate }}%
            </p>
          </div>
        </div>
      </div>

      <!-- Zero-Result Card -->
      <div
        :key="'zero-result'"
        class="stat-card bg-yellow-50 p-4 rounded-lg border border-yellow-100"
        :class="{
          'is-hovered': hoveredCard === 'zero',
          'is-pressed': pressedCard === 'zero',
        }"
        :data-index="2"
        @mouseenter="handleCardHover('zero')"
        @mouseleave="handleCardLeave"
        @mousedown="handleCardPress('zero')"
        @mouseup="handleCardRelease"
        @touchstart="handleCardPress('zero')"
        @touchend="handleCardRelease"
      >
        <div
          v-if="hoveredCard === 'zero' && !prefersReducedMotion"
          class="stat-card-glow"
          aria-hidden="true"
        />
        <div class="flex items-center relative z-10">
          <div class="rounded-full bg-yellow-100 p-3 stat-icon">
            <svg
              class="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">Zero-Result</h3>
            <p class="text-2xl font-semibold text-gray-900 stat-value">
              {{ animatedZeroResult }}
            </p>
          </div>
        </div>
      </div>

      <!-- Avg Response Card with Pulse Indicator -->
      <div
        :key="'avg-response'"
        class="stat-card bg-purple-50 p-4 rounded-lg border border-purple-100"
        :class="{
          'is-hovered': hoveredCard === 'response',
          'is-pressed': pressedCard === 'response',
        }"
        :data-index="3"
        @mouseenter="handleCardHover('response')"
        @mouseleave="handleCardLeave"
        @mousedown="handleCardPress('response')"
        @mouseup="handleCardRelease"
        @touchstart="handleCardPress('response')"
        @touchend="handleCardRelease"
      >
        <div
          v-if="hoveredCard === 'response' && !prefersReducedMotion"
          class="stat-card-glow"
          aria-hidden="true"
        />
        <div class="flex items-center relative z-10">
          <div class="stat-icon-with-indicator relative">
            <!-- Live pulse indicator - Palette's micro-UX delight! -->
            <span
              v-if="!prefersReducedMotion && isFastResponse"
              class="live-pulse-indicator"
              aria-hidden="true"
            />
            <div class="rounded-full bg-purple-100 p-3 stat-icon">
              <svg
                class="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">Avg Response</h3>
            <p class="text-2xl font-semibold text-gray-900 stat-value">
              {{ animatedAvgResponse
              }}<span class="text-sm font-normal text-gray-500">ms</span>
            </p>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <!-- Charts and Data Sections -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Search Trends Chart -->
      <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Search Trends</h3>
        <div
          v-if="!searchAnalytics?.data?.searchTrends?.length"
          class="h-64 flex items-center justify-center"
        >
          <p class="text-gray-500">No search trend data available</p>
        </div>
        <div v-else class="h-64">
          <!-- Simple bar chart visualization with animation -->
          <div class="flex items-end h-48 space-x-1">
            <div
              v-for="(day, index) in searchAnalytics.data.searchTrends"
              :key="index"
              class="flex flex-col items-center flex-1 min-w-0"
              :style="getBarStyle(index)"
            >
              <div class="w-full flex justify-center">
                <div
                  class="w-3/4 bg-blue-500 rounded-t hover:bg-blue-600 transition-all duration-300 chart-bar"
                  :class="{
                    'animate-bar-grow': !prefersReducedMotion && !hasAnimated,
                  }"
                  :style="{
                    height: `${(day.count / maxSearchCount) * 100}%`,
                    animationDelay: `${index * 50}ms`,
                  }"
                  :title="`${day.date}: ${day.count} searches`"
                />
              </div>
              <span
                class="text-xs text-gray-500 mt-1 truncate w-full text-center"
                >{{ formatDate(day.date) }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Popular Searches -->
      <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Popular Searches</h3>
        <div
          v-if="!searchAnalytics?.data?.popularSearches?.length"
          class="text-gray-500 text-center py-8"
        >
          No popular search data available
        </div>
        <TransitionGroup
          v-else
          tag="ul"
          name="popular-search"
          class="space-y-3 max-h-64 overflow-y-auto"
          :class="{ 'reduced-motion': prefersReducedMotion }"
        >
          <li
            v-for="(search, index) in searchAnalytics.data.popularSearches"
            :key="search.query"
            class="popular-search-item flex items-center justify-between p-3 bg-white rounded-md border border-gray-200"
            :class="{
              'is-hovered': hoveredSearch === search.query,
            }"
            :style="getSearchItemStyle(index)"
            @mouseenter="handleSearchHover(search.query)"
            @mouseleave="handleSearchLeave"
          >
            <div class="flex items-center">
              <span
                class="search-rank text-gray-500 font-medium w-6"
                :class="{ 'search-rank--top': index < 3 }"
              >
                #{{ index + 1 }}
              </span>
              <span class="ml-2 font-medium truncate max-w-xs">{{
                search.query
              }}</span>
            </div>
            <span class="search-count">{{ search.count }}</span>
          </li>
        </TransitionGroup>
      </div>
    </div>

    <!-- Additional Search Analytics Sections -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Zero-Result Queries -->
      <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Zero-Result Queries
        </h3>
        <div
          v-if="!searchAnalytics?.data?.zeroResultQueries?.length"
          class="text-gray-500 text-center py-8"
        >
          No zero-result query data available
        </div>
        <ul v-else class="space-y-2 max-h-64 overflow-y-auto">
          <li
            v-for="(query, index) in searchAnalytics.data.zeroResultQueries"
            :key="query.query"
            class="flex items-center justify-between p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <div class="flex items-center">
              <span class="text-gray-500 w-6">#{{ index + 1 }}</span>
              <span class="text-gray-700 ml-2">{{ query.query }}</span>
            </div>
            <span class="font-medium">{{ query.count }}</span>
          </li>
        </ul>
      </div>

      <!-- Search Performance -->
      <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Search Performance
        </h3>
        <div
          v-if="!searchAnalytics?.data?.performanceMetrics"
          class="text-gray-500 text-center py-8"
        >
          No performance data available
        </div>
        <div v-else class="space-y-3">
          <div class="grid grid-cols-2 gap-4">
            <div
              class="performance-metric bg-white p-3 rounded border border-gray-200"
              :class="{ 'is-fast': !prefersReducedMotion }"
            >
              <p class="text-sm text-gray-500">Fast Searches (&lt;100ms)</p>
              <p class="text-xl font-semibold text-green-600 metric-value">
                {{ animatedFastSearches }}
              </p>
            </div>
            <div
              class="performance-metric bg-white p-3 rounded border border-gray-200"
              :class="{ 'is-medium': !prefersReducedMotion }"
            >
              <p class="text-sm text-gray-500">Medium Searches (100-500ms)</p>
              <p class="text-xl font-semibold text-yellow-600 metric-value">
                {{ animatedMediumSearches }}
              </p>
            </div>
          </div>
          <div
            class="performance-metric bg-white p-3 rounded border border-gray-200"
            :class="{ 'is-slow': !prefersReducedMotion }"
          >
            <p class="text-sm text-gray-500">Slow Searches (&gt;500ms)</p>
            <p class="text-xl font-semibold text-red-600 metric-value">
              {{ animatedSlowSearches }}
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
import { hapticLight } from '~/utils/hapticFeedback'

const {
  searchAnalytics,
  loading,
  error,
  timeRange,
  maxSearchCount,
  formatDate,
  fetchSearchAnalytics,
} = useSearchAnalytics()

// Palette's micro-UX enhancement: Animation and interaction states
const prefersReducedMotion = ref(false)
const hoveredCard = ref<string | null>(null)
const pressedCard = ref<string | null>(null)
const hoveredSearch = ref<string | null>(null)
const hasAnimated = ref(false)
const announcementText = ref('')

// Animated counter values - Palette's micro-UX delight!
const animatedTotalSearches = ref(0)
const animatedSuccessRate = ref(0)
const animatedZeroResult = ref(0)
const animatedAvgResponse = ref(0)
const animatedFastSearches = ref(0)
const animatedMediumSearches = ref(0)
const animatedSlowSearches = ref(0)

// Progress ring calculations
const progressRingSize = 56
const radius = 20
const progressCircumference = 2 * Math.PI * radius
const progressDashOffset = computed(() => {
  const rate = searchAnalytics.value?.data?.successRate || 0
  return progressCircumference - (rate / 100) * progressCircumference
})

// Check if response time is fast (< 200ms)
const isFastResponse = computed(() => {
  return (searchAnalytics.value?.data?.avgResponseTime || 0) < 200
})

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Check if we're in a test environment
const isTestEnvironment = () => {
  return (
    typeof process !== 'undefined' &&
    (process.env.NODE_ENV === 'test' || process.env.VITEST !== undefined)
  )
}

// Animate number counter - Palette's micro-UX delight!
const animateValue = (
  target: number,
  duration: number,
  setter: (val: number) => void,
  _suffix: string = ''
) => {
  // Skip animation for reduced motion or test environments
  if (prefersReducedMotion.value || isTestEnvironment()) {
    setter(target)
    return
  }

  const start = 0
  const startTime = performance.now()

  const updateValue = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3)
    const current = Math.floor(start + (target - start) * easeOut)

    setter(current)

    if (progress < 1) {
      requestAnimationFrame(updateValue)
    }
  }

  requestAnimationFrame(updateValue)
}

// Trigger all counter animations
const animateAllCounters = () => {
  const duration = animationConfig.counter?.durationMs || 1500

  animateValue(
    searchAnalytics.value?.data?.totalSearches || 0,
    duration,
    val => (animatedTotalSearches.value = val)
  )

  animateValue(
    searchAnalytics.value?.data?.successRate || 0,
    duration,
    val => (animatedSuccessRate.value = val)
  )

  animateValue(
    searchAnalytics.value?.data?.zeroResultCount || 0,
    duration,
    val => (animatedZeroResult.value = val)
  )

  animateValue(
    searchAnalytics.value?.data?.avgResponseTime || 0,
    duration,
    val => (animatedAvgResponse.value = val)
  )

  animateValue(
    searchAnalytics.value?.data?.performanceMetrics?.fastSearches || 0,
    duration,
    val => (animatedFastSearches.value = val)
  )

  animateValue(
    searchAnalytics.value?.data?.performanceMetrics?.mediumSearches || 0,
    duration,
    val => (animatedMediumSearches.value = val)
  )

  animateValue(
    searchAnalytics.value?.data?.performanceMetrics?.slowSearches || 0,
    duration,
    val => (animatedSlowSearches.value = val)
  )
}

// Watch for data changes and animate counters
watch(
  () => searchAnalytics.value,
  newVal => {
    if (newVal && !loading.value) {
      animateAllCounters()
      announcementText.value = `Search analytics updated. Total searches: ${newVal.data?.totalSearches || 0}`
      hasAnimated.value = true
    }
  },
  { immediate: true }
)

// Watch for loading state changes
watch(
  () => loading.value,
  isLoading => {
    if (!isLoading && searchAnalytics.value) {
      // Reset and re-animate when loading completes
      hasAnimated.value = false
      animateAllCounters()
    }
  }
)

// Handle card hover with haptic feedback
const handleCardHover = (card: string) => {
  hoveredCard.value = card
  if (!prefersReducedMotion.value) {
    hapticLight()
  }
}

const handleCardLeave = () => {
  hoveredCard.value = null
  pressedCard.value = null
}

// Handle card press with haptic feedback
const handleCardPress = (card: string) => {
  pressedCard.value = card
}

const handleCardRelease = () => {
  pressedCard.value = null
}

// Handle search item hover
const handleSearchHover = (query: string) => {
  hoveredSearch.value = query
}

const handleSearchLeave = () => {
  hoveredSearch.value = null
}

// Handle time range change
const handleTimeRangeChange = () => {
  hasAnimated.value = false
  fetchSearchAnalytics()
}

// Transition hooks for staggered entrance animations
const onBeforeEnter = (el: Element) => {
  const htmlEl = el as HTMLElement
  htmlEl.style.opacity = '0'
  htmlEl.style.transform = 'translateY(20px) scale(0.95)'
}

const onEnter = (el: Element, done: () => void) => {
  const htmlEl = el as HTMLElement
  const index = parseInt(htmlEl.dataset.index || '0', 10)
  const delay = index * animationConfig.searchAnalytics.barStaggerMultiplierMs

  setTimeout(() => {
    htmlEl.style.transition = `all ${animationConfig.tailwindDurations.normal} ease-out`
    htmlEl.style.opacity = '1'
    htmlEl.style.transform = 'translateY(0) scale(1)'
    setTimeout(done, animationConfig.searchAnalytics.chartTransitionMs)
  }, delay)
}

// Get bar style for chart
const getBarStyle = (index: number) => {
  if (prefersReducedMotion.value || hasAnimated.value) {
    return {}
  }
  return {
    animationDelay: `${index * animationConfig.searchAnalytics.barStaggerMultiplierMs}ms`,
  }
}

// Get search item style for staggered entrance
const getSearchItemStyle = (index: number) => {
  if (prefersReducedMotion.value) {
    return {}
  }
  return {
    '--stagger-delay': `${index * 50}ms`,
  }
}

// Media query refs for cleanup
let mediaQueryRef: MediaQueryList | null = null

// Lifecycle
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined' && window.matchMedia) {
    mediaQueryRef = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQueryRef.addEventListener('change', e => {
      prefersReducedMotion.value = e.matches
    })
  }
})

onUnmounted(() => {
  // Cleanup media query listener
  if (mediaQueryRef) {
    mediaQueryRef.removeEventListener('change', e => {
      prefersReducedMotion.value = e.matches
    })
    mediaQueryRef = null
  }
})
</script>

<style scoped>
/* Stat Card Animations - Palette's micro-UX delight! */
.stat-card {
  position: relative;
  transition: all v-bind('animationConfig.cssTransitions.standardSec') ease-out;
  cursor: pointer;
  overflow: hidden;
}

.stat-card.is-hovered {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
}

.stat-card.is-pressed {
  transform: translateY(-2px) scale(0.98);
}

/* Glow effect on hover */
.stat-card-glow {
  position: absolute;
  inset: -2px;
  background: radial-gradient(
    circle at center,
    rgba(59, 130, 246, 0.15) 0%,
    transparent 70%
  );
  opacity: 0;
  animation: glow-pulse 2s ease-in-out infinite;
  pointer-events: none;
}

.stat-card.is-hovered .stat-card-glow {
  opacity: 1;
}

@keyframes glow-pulse {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

/* Icon animations */
.stat-icon {
  transition: transform v-bind('animationConfig.cssTransitions.standardSec')
    ease-out;
}

.stat-card.is-hovered .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

/* Progress ring animation */
.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-fill {
  transition: stroke-dashoffset v-bind('animationConfig.cssTransitions.slowSec')
    ease-out;
}

/* Live pulse indicator for fast response */
.live-pulse-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border-radius: 50%;
  animation: live-pulse 2s ease-in-out infinite;
}

.live-pulse-indicator::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid #10b981;
  opacity: 0;
  animation: live-ring 2s ease-out infinite;
}

@keyframes live-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes live-ring {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Shimmer spinner for loading - Palette's micro-UX delight! */
.shimmer-spinner {
  position: relative;
  width: 48px;
  height: 48px;
}

.shimmer-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #3b82f6;
  animation: shimmer-spin 1.5s linear infinite;
}

.shimmer-ring::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-right-color: #60a5fa;
  animation: shimmer-spin 2s linear infinite reverse;
}

.shimmer-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  border-radius: 50%;
  animation: shimmer-pulse 1.5s ease-in-out infinite;
}

@keyframes shimmer-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes shimmer-pulse {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.7;
  }
}

/* Chart bar animation */
.chart-bar {
  transform-origin: bottom;
}

.chart-bar.animate-bar-grow {
  animation: bar-grow v-bind('animationConfig.cssTransitions.slowSec') ease-out
    forwards;
  transform: scaleY(0);
}

@keyframes bar-grow {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}

/* Popular search item animations */
.popular-search-item {
  transition: all v-bind('animationConfig.cssTransitions.fastSec') ease-out;
  cursor: pointer;
}

.popular-search-item.is-hovered {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-rank {
  transition: all v-bind('animationConfig.cssTransitions.fastSec') ease-out;
}

.search-rank--top {
  color: #f59e0b;
  font-weight: 700;
}

.search-count {
  font-weight: 600;
  color: #6b7280;
  transition: all v-bind('animationConfig.cssTransitions.fastSec') ease-out;
}

.popular-search-item.is-hovered .search-count {
  color: #3b82f6;
  transform: scale(1.1);
}

/* Popular search entrance animation */
.popular-search-enter-active,
.popular-search-leave-active {
  transition: all v-bind('animationConfig.cssTransitions.normalSec') ease-out;
}

.popular-search-enter-from,
.popular-search-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Reduced motion support */
.reduced-motion .stat-card,
.reduced-motion .popular-search-item,
.reduced-motion .chart-bar {
  transition: none !important;
  animation: none !important;
}

.reduced-motion .stat-card.is-hovered {
  transform: none;
  box-shadow: none;
}

/* Performance metric animations */
.performance-metric {
  transition: all v-bind('animationConfig.cssTransitions.fastSec') ease-out;
}

.performance-metric.is-fast:hover {
  background: #f0fdf4;
  border-color: #86efac;
}

.performance-metric.is-medium:hover {
  background: #fefce8;
  border-color: #fde047;
}

.performance-metric.is-slow:hover {
  background: #fef2f2;
  border-color: #fca5a5;
}

.metric-value {
  transition: transform v-bind('animationConfig.cssTransitions.fastSec')
    ease-out;
}

.performance-metric:hover .metric-value {
  transform: scale(1.05);
}

/* Stat value counter animation */
.stat-value {
  font-variant-numeric: tabular-nums;
}
</style>
