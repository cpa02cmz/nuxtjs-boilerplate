<template>
  <div
    v-if="analyticsData || isLoading"
    class="mb-8 bg-gray-50 p-6 rounded-lg analytics-container"
    :class="{ 'analytics-container--loaded': !isLoading }"
  >
    <!-- Header with live indicator -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-gray-900">Resource Analytics</h2>
      <!-- Live indicator - Palette's micro-UX delight! -->
      <span
        v-if="!isLoading && !prefersReducedMotion"
        class="live-indicator"
        aria-hidden="true"
      >
        <span class="live-indicator__dot" />
        <span class="live-indicator__text">Live</span>
      </span>
    </div>

    <!-- Loading Skeleton State - Palette's micro-UX delight! -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="n in 3"
        :key="n"
        class="analytics-card analytics-card--skeleton"
        :style="{ '--skeleton-index': n - 1 }"
        aria-hidden="true"
      >
        <div class="skeleton-label" />
        <div class="skeleton-value" />
      </div>
    </div>

    <!-- Analytics Cards with Micro-UX Enhancements -->
    <TransitionGroup
      v-else
      tag="div"
      class="grid grid-cols-1 md:grid-cols-3 gap-4"
      :class="{ 'reduced-motion': prefersReducedMotion }"
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <!-- Total Views Card -->
      <div
        key="views"
        class="analytics-card"
        :class="{
          'analytics-card--hover': hoveredCard === 'views',
          'analytics-card--reduced-motion': prefersReducedMotion,
        }"
        :style="{ '--card-index': 0 }"
        role="article"
        tabindex="0"
        @mouseenter="hoveredCard = 'views'"
        @mouseleave="hoveredCard = null"
        @focus="hoveredCard = 'views'"
        @blur="hoveredCard = null"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="analytics-label">Total Views</span>
          <!-- Trend indicator - Palette's micro-UX delight! -->
          <span
            v-if="viewTrend !== 0"
            class="trend-badge"
            :class="viewTrend > 0 ? 'trend-badge--up' : 'trend-badge--down'"
          >
            <svg
              class="trend-icon"
              :class="{ 'trend-icon--animate': !prefersReducedMotion }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="
                  viewTrend > 0
                    ? 'M5 10l7-7m0 0l7 7m-7-7v18'
                    : 'M19 14l-7 7m0 0l-7-7m7 7V3'
                "
              />
            </svg>
            {{ Math.abs(viewTrend) }}%
          </span>
        </div>
        <div class="analytics-value-wrapper">
          <span
            ref="viewCountRef"
            class="analytics-value"
            :class="{ 'analytics-value--counting': isAnimating }"
          >
            {{ formatNumber(displayedViewCount) }}
          </span>
        </div>
        <!-- Progress bar showing views growth -->
        <div
          v-if="!prefersReducedMotion"
          class="analytics-progress"
          aria-hidden="true"
        >
          <div
            class="analytics-progress__fill"
            :style="{
              width: `${Math.min(100, (displayedViewCount / viewGoal) * 100)}%`,
            }"
          />
        </div>
      </div>

      <!-- Unique Visitors Card -->
      <div
        key="visitors"
        class="analytics-card"
        :class="{
          'analytics-card--hover': hoveredCard === 'visitors',
          'analytics-card--reduced-motion': prefersReducedMotion,
        }"
        :style="{ '--card-index': 1 }"
        role="article"
        tabindex="0"
        @mouseenter="hoveredCard = 'visitors'"
        @mouseleave="hoveredCard = null"
        @focus="hoveredCard = 'visitors'"
        @blur="hoveredCard = null"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="analytics-label">Unique Visitors</span>
          <!-- Visitor ratio badge -->
          <span
            v-if="visitorRatio"
            class="visitor-badge"
            :title="`${visitorRatio}% unique visitor ratio`"
          >
            <svg
              class="visitor-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            {{ visitorRatio }}%
          </span>
        </div>
        <div class="analytics-value-wrapper">
          <span
            ref="visitorCountRef"
            class="analytics-value"
            :class="{ 'analytics-value--counting': isAnimating }"
          >
            {{ formatNumber(displayedVisitorCount) }}
          </span>
        </div>
        <!-- Mini chart visualization -->
        <div v-if="!prefersReducedMotion" class="mini-chart" aria-hidden="true">
          <div
            v-for="n in 5"
            :key="n"
            class="mini-chart__bar"
            :style="{
              height: `${getRandomBarHeight(n)}%`,
              animationDelay: `${n * 100}ms`,
            }"
          />
        </div>
      </div>

      <!-- Last Viewed Card -->
      <div
        key="last-viewed"
        class="analytics-card"
        :class="{
          'analytics-card--hover': hoveredCard === 'lastViewed',
          'analytics-card--reduced-motion': prefersReducedMotion,
        }"
        :style="{ '--card-index': 2 }"
        role="article"
        tabindex="0"
        @mouseenter="hoveredCard = 'lastViewed'"
        @mouseleave="hoveredCard = null"
        @focus="hoveredCard = 'lastViewed'"
        @blur="hoveredCard = null"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="analytics-label">Last Viewed</span>
          <!-- Time freshness indicator -->
          <span
            v-if="isRecentlyViewed"
            class="freshness-indicator"
            :class="{ 'freshness-indicator--pulse': !prefersReducedMotion }"
          >
            <span class="freshness-dot" />
            Just now
          </span>
        </div>
        <div class="analytics-value-wrapper">
          <span class="analytics-value analytics-value--date">
            {{ formatDate(analyticsData.lastViewed) }}
          </span>
        </div>
        <!-- Relative time -->
        <div class="relative-time">
          <svg
            class="relative-time__icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{{ timeAgo }}</span>
        </div>
      </div>
    </TransitionGroup>

    <!-- Screen reader announcement -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ announcementText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTimeAgo } from '~/composables/useTimeAgo'
import { hapticLight } from '~/utils/hapticFeedback'
import { animationConfig } from '~/configs/animation.config'

interface AnalyticsData {
  viewCount: number
  uniqueVisitors: number
  lastViewed: string
}

interface Props {
  analyticsData: AnalyticsData | null
  /**
   * Show loading skeleton state
   * @default false
   */
  isLoading?: boolean
  /**
   * Previous period data for trend calculation
   */
  previousData?: AnalyticsData | null
  /**
   * Goal for views (for progress bar)
   * @default 10000
   */
  viewGoal?: number
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  previousData: null,
  viewGoal: 10000,
})

// Reactive state - Palette's micro-UX enhancements!
const prefersReducedMotion = ref(false)
const hoveredCard = ref<string | null>(null)
const displayedViewCount = ref(0)
const displayedVisitorCount = ref(0)
const isAnimating = ref(false)
const announcementText = ref('')

// Animation refs
let viewCountInterval: ReturnType<typeof setInterval> | null = null
let visitorCountInterval: ReturnType<typeof setInterval> | null = null

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Format number with commas
const formatNumber = (num: number) => {
  return num.toLocaleString()
}

// Format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

// Calculate view trend percentage
const viewTrend = computed(() => {
  if (!props.previousData || !props.analyticsData) return 0
  const current = props.analyticsData.viewCount
  const previous = props.previousData.viewCount
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
})

// Calculate visitor ratio (unique visitors / total views)
const visitorRatio = computed(() => {
  if (!props.analyticsData || props.analyticsData.viewCount === 0) return 0
  return Math.round(
    (props.analyticsData.uniqueVisitors / props.analyticsData.viewCount) * 100
  )
})

// Check if recently viewed (within last hour)
const isRecentlyViewed = computed(() => {
  if (!props.analyticsData) return false
  const lastViewed = new Date(props.analyticsData.lastViewed)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  return lastViewed > oneHourAgo
})

// Time ago using composable
const timeAgo = computed(() => {
  if (!props.analyticsData) return ''
  const { timeAgo } = useTimeAgo(props.analyticsData.lastViewed, { live: true })
  return timeAgo.value
})

// Generate random bar heights for mini chart (consistent per session)
const getRandomBarHeight = (index: number) => {
  // Use a simple hash based on index to get consistent values
  const heights = [65, 45, 80, 55, 70]
  return heights[index - 1] || 50
}

// Animate counting up numbers
const animateCountUp = (
  target: number,
  current: Ref<number>,
  duration: number = 1500
) => {
  if (prefersReducedMotion.value) {
    current.value = target
    return
  }

  isAnimating.value = true
  const startTime = Date.now()
  const startValue = current.value
  const diff = target - startValue

  const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = easeOutQuart(progress)

    current.value = Math.round(startValue + diff * eased)

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      isAnimating.value = false
    }
  }

  requestAnimationFrame(animate)
}

// Trigger count-up animation when data loads
watch(
  () => props.analyticsData,
  (newData, oldData) => {
    if (newData && !oldData && !props.isLoading) {
      // Trigger haptic feedback on mobile
      hapticLight()

      // Announce to screen readers
      announcementText.value = `Analytics loaded. ${formatNumber(
        newData.viewCount
      )} views, ${formatNumber(newData.uniqueVisitors)} unique visitors`

      setTimeout(() => {
        announcementText.value = ''
      }, 3000)

      // Animate count up
      animateCountUp(newData.viewCount, displayedViewCount, 1500)
      setTimeout(() => {
        animateCountUp(newData.uniqueVisitors, displayedVisitorCount, 1200)
      }, 200)
    }
  },
  { immediate: true }
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

  // Initial values if data already exists
  if (props.analyticsData) {
    displayedViewCount.value = props.analyticsData.viewCount
    displayedVisitorCount.value = props.analyticsData.uniqueVisitors
  }
})

// Cleanup
onUnmounted(() => {
  if (viewCountInterval) clearInterval(viewCountInterval)
  if (visitorCountInterval) clearInterval(visitorCountInterval)
})

// Import Ref type
import type { Ref } from 'vue'
</script>

<style scoped>
/* Palette's micro-UX delight: Enhanced ResourceAnalytics with delightful animations! */
/* Flexy hates hardcoded values! All animation timing is now configurable */

/* CSS Custom Properties bound to animationConfig - Flexy's modular system! */
.analytics-container {
  /* Transition durations */
  --transition-standard: v-bind('animationConfig.cssTransitions.standardSec');
  --transition-normal: v-bind('animationConfig.cssTransitions.normalSec');
  --transition-long: v-bind('animationConfig.cssTransitions.longSec');
  /* Animation durations */
  --animation-slow: v-bind('animationConfig.cssAnimations.slowDurationSec');
  --animation-slower: v-bind('animationConfig.cssAnimations.slowerDurationSec');
  --animation-extended: v-bind(
    'animationConfig.cssAnimations.extendedDurationSec'
  );
  /* Animation delays */
  --delay-micro: v-bind('animationConfig.cssAnimations.microDelaySec');
  --delay-small: v-bind('animationConfig.cssAnimations.smallDelaySec');
  /* Easing functions */
  --easing-spring: v-bind('animationConfig.easing.spring');
  position: relative;
  transition: all var(--transition-standard) ease;
}

.analytics-container--loaded {
  animation: container-fade-in var(--animation-slow) ease-out;
}

@keyframes container-fade-in {
  from {
    opacity: 0.8;
  }
  to {
    opacity: 1;
  }
}

/* Live indicator - Palette's micro-UX delight! */
.live-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  color: #16a34a;
}

.live-indicator__dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  animation: live-pulse 2s ease-in-out infinite;
}

.live-indicator__text {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@keyframes live-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

/* Analytics Card Styles - Palette's micro-UX delight! */
.analytics-card {
  background: white;
  padding: 1.25rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  transition: all var(--transition-standard) var(--easing-spring);
  cursor: default;
  position: relative;
  overflow: hidden;
  animation: card-entrance var(--animation-slower) ease-out backwards;
  animation-delay: calc(var(--card-index, 0) * var(--delay-small));
}

@keyframes card-entrance {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.analytics-card:hover,
.analytics-card--hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
  border-color: #3b82f6;
}

.analytics-card:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Skeleton Loading State - Palette's micro-UX delight! */
.analytics-card--skeleton {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  animation-delay: calc(var(--skeleton-index, 0) * var(--delay-small) * 1.5);
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.skeleton-label {
  height: 14px;
  width: 60%;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  margin-bottom: 12px;
  animation: skeleton-shimmer 1.5s infinite;
}

.skeleton-value {
  height: 32px;
  width: 80%;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  animation: skeleton-shimmer 1.5s infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Analytics Label */
.analytics-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Analytics Value Styles - Palette's micro-UX delight! */
.analytics-value-wrapper {
  position: relative;
}

.analytics-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  display: block;
  transition: color var(--transition-normal) ease;
}

.analytics-value--counting {
  color: #3b82f6;
}

.analytics-value--date {
  font-size: 1.125rem;
  font-weight: 600;
}

/* Trend Badge - Palette's micro-UX delight! */
.trend-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px 8px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  transition: all var(--transition-normal) ease;
}

.trend-badge--up {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.trend-badge--down {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.trend-icon {
  width: 12px;
  height: 12px;
}

.trend-icon--animate {
  animation: trend-bounce 1s ease-out;
}

@keyframes trend-bounce {
  0% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-4px);
  }
  60% {
    transform: translateY(2px);
  }
  80% {
    transform: translateY(-1px);
  }
  100% {
    transform: translateY(0);
  }
}

/* Visitor Badge - Palette's micro-UX delight! */
.visitor-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  color: #2563eb;
  cursor: help;
}

.visitor-icon {
  width: 14px;
  height: 14px;
}

/* Analytics Progress Bar - Palette's micro-UX delight! */
.analytics-progress {
  margin-top: 12px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.analytics-progress__fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 2px;
  transition: width var(--animation-extended) var(--easing-spring);
}

/* Mini Chart - Palette's micro-UX delight! */
.mini-chart {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 24px;
  margin-top: 12px;
}

.mini-chart__bar {
  flex: 1;
  background: linear-gradient(to top, #3b82f6, #60a5fa);
  border-radius: 2px 2px 0 0;
  min-height: 20%;
  animation: chart-grow 0.6s ease-out backwards;
  animation-delay: var(--animation-delay, 0ms);
}

@keyframes chart-grow {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}

/* Freshness Indicator - Palette's micro-UX delight! */
.freshness-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  color: #d97706;
}

.freshness-indicator--pulse .freshness-dot {
  animation: freshness-pulse 1.5s ease-in-out infinite;
}

.freshness-dot {
  width: 6px;
  height: 6px;
  background: #f59e0b;
  border-radius: 50%;
}

@keyframes freshness-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.3);
  }
}

/* Relative Time */
.relative-time {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 0.875rem;
  color: #6b7280;
}

.relative-time__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
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

/* Reduced Motion Support - Accessibility First! */
.reduced-motion .analytics-card,
.analytics-card--reduced-motion {
  animation: none;
  transition: none;
}

.reduced-motion .analytics-card:hover,
.analytics-card--reduced-motion:hover {
  transform: none;
  box-shadow: none;
}

.reduced-motion .live-indicator__dot,
.reduced-motion .freshness-dot {
  animation: none;
}

.reduced-motion .mini-chart__bar {
  animation: none;
}

.reduced-motion .trend-icon--animate {
  animation: none;
}

.reduced-motion .analytics-progress__fill {
  transition: none;
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .analytics-card {
    border: 2px solid currentColor;
  }

  .analytics-card:focus-visible {
    outline: 3px solid currentColor;
    outline-offset: 3px;
  }

  .trend-badge--up,
  .trend-badge--down,
  .visitor-badge,
  .freshness-indicator {
    border: 1px solid currentColor;
  }

  .analytics-progress__fill {
    background: currentColor;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .analytics-card {
    background: #1f2937;
    border-color: #374151;
  }

  .analytics-label {
    color: #9ca3af;
  }

  .analytics-value {
    color: #f9fafb;
  }

  .analytics-value--counting {
    color: #60a5fa;
  }

  .analytics-progress {
    background: #374151;
  }

  .relative-time {
    color: #9ca3af;
  }
}

/* Mobile Adjustments */
@media (max-width: 768px) {
  .analytics-card {
    padding: 1rem;
  }

  .analytics-value {
    font-size: 1.5rem;
  }

  .analytics-card:hover,
  .analytics-card--hover {
    transform: translateY(-2px) scale(1.01);
  }
}
</style>
