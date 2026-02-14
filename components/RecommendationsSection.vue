<template>
  <div class="recommendations-section">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Recommended for You
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        Resources we think you'll find valuable based on your interests
      </p>
    </div>

    <!-- Enhanced Loading State with Shimmer Skeleton - Palette's micro-UX delight! -->
    <div
      v-if="loading"
      class="recommendations-loading"
      role="status"
      aria-live="polite"
      aria-label="Loading personalized recommendations"
    >
      <div class="recommendations-skeleton-grid">
        <div
          v-for="i in 3"
          :key="`skeleton-${i}`"
          class="recommendation-skeleton-card"
          :class="{ 'animate-shimmer': !prefersReducedMotion }"
          :style="{ animationDelay: `${(i - 1) * 150}ms` }"
        >
          <div class="skeleton-header">
            <div class="skeleton-title" />
            <div class="skeleton-icon" />
          </div>
          <div class="skeleton-description">
            <div class="skeleton-line skeleton-line--long" />
            <div class="skeleton-line skeleton-line--medium" />
          </div>
          <div class="skeleton-tags">
            <div class="skeleton-tag" />
            <div class="skeleton-tag skeleton-tag--short" />
          </div>
          <div class="skeleton-footer">
            <div class="skeleton-button" />
            <div class="skeleton-button skeleton-button--small" />
          </div>
        </div>
      </div>
      <p class="sr-only">Loading personalized recommendations for you...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-red-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">
            {{ error }}
          </p>
        </div>
      </div>
    </div>

    <div v-else-if="recommendations.length === 0" class="text-center py-12">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.08-2.33M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6.03 8 6 10v1a1 1 0 001 1h3m4 0v4a1 1 0 01-1 1h-3a1 1 0 01-1-1v-4m4 0h3"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        No recommendations available
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        We couldn't find any recommendations based on your current selection.
      </p>
    </div>

    <!-- Success Celebration - Palette's micro-UX delight! -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 scale-75"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-75"
    >
      <div
        v-if="showSuccessCelebration && !prefersReducedMotion"
        class="recommendations-success"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div class="success-content">
          <svg
            class="success-icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle class="success-circle" cx="12" cy="12" r="10" />
            <path class="success-checkmark" d="M7 12l3 3 7-7" />
          </svg>
          <span class="success-text">Recommendations loaded!</span>
        </div>
        <!-- Sparkle effects -->
        <div class="sparkle-container" aria-hidden="true">
          <span
            v-for="n in 6"
            :key="n"
            class="sparkle"
            :style="{ '--sparkle-index': n }"
          />
        </div>
      </div>
    </Transition>

    <!-- Recommendations Grid with Staggered Animation -->
    <TransitionGroup
      v-if="recommendations.length > 0"
      name="recommendation-card"
      tag="div"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      :class="{ 'animations-enabled': !prefersReducedMotion }"
      appear
    >
      <LazyRecommendationCard
        v-for="(rec, index) in recommendations"
        :key="rec.resource.id"
        :resource="rec.resource"
        :explanation="rec.explanation"
        :reason="rec.reason"
        :style="getCardStyle(index)"
        @bookmark="handleBookmark"
      />
    </TransitionGroup>

    <div v-if="recommendations.length > 0" class="mt-6 flex justify-center">
      <button
        class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
        :class="{
          'animate-refresh-spin': isRefreshing && !prefersReducedMotion,
        }"
        :disabled="isRefreshing"
        @click="refreshRecommendations"
      >
        <svg
          class="mr-2 h-4 w-4"
          :class="{ 'animate-spin': isRefreshing }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {{ isRefreshing ? 'Refreshing...' : 'Refresh Recommendations' }}
      </button>
    </div>

    <!-- Screen reader announcement -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ announcementText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useRecommendationEngine } from '~/composables/useRecommendationEngine'
import { useResourceData } from '~/composables/useResourceData'
import { useBookmarks } from '~/composables/useBookmarks'
import { useUserPreferences } from '~/composables/useUserPreferences'
import { logError } from '~/utils/errorLogger'
import { UI_TIMING } from '~/server/utils/constants'
import { animationConfig } from '~/configs/animation.config'
import { uiTimingConfig } from '~/configs/ui-timing.config'
import { hapticSuccess } from '~/utils/hapticFeedback'
import type { RecommendationResult } from '~/types/recommendation'
import type { Resource } from '~/types/resource'

interface Props {
  currentResource?: Resource
  currentCategory?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentResource: undefined,
  currentCategory: '',
})

const { resources } = useResourceData()
const { addBookmark } = useBookmarks()
const loading = ref(true)
const isRefreshing = ref(false)
const error = ref<string | null>(null)
const recommendations = ref<RecommendationResult[]>([])
const prefersReducedMotion = ref(false)
const showSuccessCelebration = ref(false)
const announcementText = ref('')

// Get animation config
const animConfig = computed(() => animationConfig.recommendations)

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Get staggered card style
const getCardStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}

  const delay = index * animConfig.value.staggerDelayMs
  return {
    '--card-enter-delay': `${delay}ms`,
  } as Record<string, string>
}

// Show success celebration
const triggerSuccessCelebration = () => {
  if (prefersReducedMotion.value || recommendations.value.length === 0) return

  showSuccessCelebration.value = true

  // Trigger haptic feedback
  setTimeout(() => {
    hapticSuccess()
  }, animConfig.value.hapticDelayMs)

  // Hide celebration after duration
  setTimeout(() => {
    showSuccessCelebration.value = false
  }, animConfig.value.successDurationMs)
}

// Announce to screen readers
const announceRecommendations = () => {
  const count = recommendations.value.length
  announcementText.value = `Found ${count} personalized recommendation${count !== 1 ? 's' : ''} for you.`

  setTimeout(() => {
    announcementText.value = ''
  }, uiTimingConfig.recommendations.announcementClearDelay)
}

// Initialize recommendation engine
const initRecommendations = async () => {
  try {
    loading.value = true
    error.value = null
    showSuccessCelebration.value = false

    // Wait for resources to be loaded
    if (!resources.value || resources.value.length === 0) {
      await new Promise(resolve =>
        setTimeout(resolve, UI_TIMING.SUGGESTION_CHECK_INTERVAL_MS)
      )
    }

    if (resources.value && resources.value.length > 0) {
      // Get user preferences for personalized recommendations
      const userPrefs = useUserPreferences()
      await userPrefs.initProfile()

      const engine = useRecommendationEngine(resources.value, {
        userPreferences: {
          interests: userPrefs.getUserInterests.value,
          viewedResources: userPrefs.getViewedResources.value,
          bookmarkedResources: userPrefs.getBookmarkedResources.value,
          skillLevel: userPrefs.getUserSkillLevel.value,
        },
      })

      // Use personalized recommendations if user preferences are available
      if (userPrefs.getUserInterests.value.length > 0) {
        recommendations.value = engine.getPersonalizedRecommendations(
          props.currentResource,
          props.currentCategory
        )
      } else {
        recommendations.value = engine.getDiverseRecommendations(
          props.currentResource,
          props.currentCategory
        )
      }

      // Trigger success celebration
      if (!isRefreshing.value) {
        triggerSuccessCelebration()
        announceRecommendations()
      }
    }
  } catch (err) {
    error.value = 'Failed to load recommendations'
    logError(
      'Error loading recommendations:',
      err as Error,
      'RecommendationsSection'
    )
  } finally {
    loading.value = false
    isRefreshing.value = false
  }
}

const refreshRecommendations = () => {
  isRefreshing.value = true
  initRecommendations()
}

const handleBookmark = (resource: Resource) => {
  addBookmark(resource)
}

// Initialize on component mount
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for changes in reduced motion preference
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleChange)
  }

  initRecommendations()
})

// Watch for changes in current resource or category
watch(
  () => [props.currentResource, props.currentCategory],
  () => {
    initRecommendations()
  }
)
</script>

<style scoped>
.recommendations-section {
  @apply p-4;
}

/* Enhanced Loading Skeleton - Palette's micro-UX delight! */
.recommendations-loading {
  @apply py-8;
}

.recommendations-skeleton-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.recommendation-skeleton-card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700;
  @apply overflow-hidden relative;
}

.skeleton-header {
  @apply flex justify-between items-start mb-4;
}

.skeleton-title {
  @apply h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4;
}

.skeleton-icon {
  @apply h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded ml-3 flex-shrink-0;
}

.skeleton-description {
  @apply space-y-2 mb-4;
}

.skeleton-line {
  @apply h-4 bg-gray-200 dark:bg-gray-700 rounded;
}

.skeleton-line--long {
  @apply w-full;
}

.skeleton-line--medium {
  @apply w-5/6;
}

.skeleton-tags {
  @apply flex gap-2 mb-4;
}

.skeleton-tag {
  @apply h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20;
}

.skeleton-tag--short {
  @apply w-16;
}

.skeleton-footer {
  @apply flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700;
}

.skeleton-button {
  @apply h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1;
}

.skeleton-button--small {
  @apply w-12 flex-none;
}

/* Shimmer Animation */
@keyframes shimmer-sweep {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer::after {
  content: '';
  @apply absolute inset-0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: shimmer-sweep v-bind('`${animConfig.shimmerDurationSec}s`')
    ease-in-out infinite;
}

/* Success Celebration - Palette's micro-UX delight! */
.recommendations-success {
  @apply fixed top-4 right-4 z-50;
}

.success-content {
  @apply inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg;
  animation: success-pop-in v-bind('`${animConfig.successDurationMs}ms`')
    cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes success-pop-in {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(-20px);
  }
  60% {
    transform: scale(1.05) translateY(2px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.success-icon {
  @apply w-5 h-5 flex-shrink-0;
}

.success-circle {
  fill: rgba(255, 255, 255, 0.2);
  animation: circle-scale 0.3s ease-out 0.1s both;
}

.success-checkmark {
  stroke: white;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: checkmark-draw 0.3s ease-out 0.2s forwards;
}

@keyframes circle-scale {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
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

.success-text {
  @apply font-medium text-sm;
}

/* Sparkle Effects */
.sparkle-container {
  @apply absolute inset-0 pointer-events-none;
}

.sparkle {
  @apply absolute w-2 h-2 bg-yellow-300 rounded-full;
  top: 50%;
  left: 50%;
  opacity: 0;
  animation: sparkle-burst
    v-bind('animationConfig.recommendations.sparkleBurst.durationSec') ease-out
    forwards;
  animation-delay: calc(
    var(--sparkle-index) *
      v-bind('animationConfig.recommendations.sparkleBurst.staggerDelaySec')
  );
  --angle: calc(var(--sparkle-index) * 60deg);
}

@keyframes sparkle-burst {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-30px)
      scale(0);
  }
}

/* Staggered Card Entrance Animation */
.recommendation-card-enter-active {
  transition: all v-bind('animConfig.entranceDurationSec')
    cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-delay: var(--card-enter-delay, 0ms);
}

.recommendation-card-enter-from {
  opacity: 0;
  transform: translateY(v-bind('`${animConfig.entranceDistancePx}px`'))
    scale(v-bind('animConfig.entranceStartScale'));
}

.recommendation-card-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Move animation for grid reordering */
.recommendation-card-move {
  transition: transform v-bind('animConfig.entranceDurationSec')
    cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Refresh button spin animation */
@keyframes refresh-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-refresh-spin svg {
  animation: refresh-spin 0.5s ease-out;
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .animate-shimmer::after {
    display: none;
  }

  .recommendation-skeleton-card {
    @apply opacity-70;
  }

  .recommendations-success,
  .success-content {
    animation: none;
  }

  .success-checkmark {
    stroke-dashoffset: 0;
  }

  .sparkle {
    display: none;
  }

  .recommendation-card-enter-active,
  .recommendation-card-move {
    transition: opacity
      v-bind('animationConfig.recommendations.cardTransition.durationSec')
      ease-out;
  }

  .recommendation-card-enter-from {
    opacity: 0;
    transform: none;
  }

  .animate-refresh-spin svg {
    animation: none;
  }
}

/* Screen reader only */
.sr-only {
  @apply absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0;
  clip: rect(0, 0, 0, 0);
}
</style>
