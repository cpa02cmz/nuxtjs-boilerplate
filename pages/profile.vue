<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Your Profile
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Manage your preferences and personalize your experience
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <UserPreferenceManager />
      </div>

      <div class="lg:col-span-1">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Your Activity
          </h3>
          <div class="space-y-4">
            <div class="activity-stat">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Resources viewed
              </p>
              <p
                class="text-2xl font-bold text-gray-900 dark:text-white activity-counter"
                :class="{
                  'activity-counter--updating': updatingStats.viewed,
                  'activity-counter--no-animation': prefersReducedMotion,
                }"
                :aria-label="`${animatedViewedCount} resources viewed`"
              >
                {{ animatedViewedCount }}
              </p>
            </div>
            <div class="activity-stat">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Resources bookmarked
              </p>
              <p
                class="text-2xl font-bold text-gray-900 dark:text-white activity-counter"
                :class="{
                  'activity-counter--updating': updatingStats.bookmarked,
                  'activity-counter--no-animation': prefersReducedMotion,
                }"
                :aria-label="`${animatedBookmarkedCount} resources bookmarked`"
              >
                {{ animatedBookmarkedCount }}
              </p>
            </div>
            <div class="activity-stat">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Categories followed
              </p>
              <p
                class="text-2xl font-bold text-gray-900 dark:text-white activity-counter"
                :class="{
                  'activity-counter--updating': updatingStats.interests,
                  'activity-counter--no-animation': prefersReducedMotion,
                }"
                :aria-label="`${animatedInterestsCount} categories followed`"
              >
                {{ animatedInterestsCount }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recommendation Settings
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-gray-700 dark:text-gray-300"
                >Personalized recommendations</span
              >
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="
                  userPrefs.getUserPreferences.value?.privacySettings
                    .allowPersonalization
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                "
              >
                {{
                  userPrefs.getUserPreferences.value?.privacySettings
                    .allowPersonalization
                    ? 'On'
                    : 'Off'
                }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-700 dark:text-gray-300"
                >Data collection</span
              >
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="
                  userPrefs.getUserPreferences.value?.privacySettings
                    .allowDataCollection
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                "
              >
                {{
                  userPrefs.getUserPreferences.value?.privacySettings
                    .allowDataCollection
                    ? 'On'
                    : 'Off'
                }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-700 dark:text-gray-300"
                >Recommendation explanations</span
              >
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="
                  userPrefs.getUserPreferences.value?.privacySettings
                    .allowRecommendationExplanations
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                "
              >
                {{
                  userPrefs.getUserPreferences.value?.privacySettings
                    .allowRecommendationExplanations
                    ? 'On'
                    : 'Off'
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted, type Ref } from 'vue'
import { useUserPreferences } from '~/composables/useUserPreferences'
import { animationConfig } from '~/configs/animation.config'

// Set page metadata
useHead({
  title: 'Your Profile - Personalize Your Experience',
  meta: [
    {
      name: 'description',
      content:
        'Manage your preferences and personalize your resource recommendations',
    },
  ],
})

const userPrefs = useUserPreferences()

// 🎨 Pallete's micro-UX enhancement: Animated counters for activity statistics
// Provides delightful visual feedback when numbers change

// Track reduced motion preference
const prefersReducedMotion = ref(false)
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Animated counter state
const animatedViewedCount = ref(0)
const animatedBookmarkedCount = ref(0)
const animatedInterestsCount = ref(0)

// Track which stats are currently updating for visual feedback
const updatingStats = ref({
  viewed: false,
  bookmarked: false,
  interests: false,
})

// Animation frame references for cleanup
let viewedAnimationFrame: number | null = null
let bookmarkedAnimationFrame: number | null = null
let interestsAnimationFrame: number | null = null

// 🎨 Pallete's micro-UX delight: Smooth number counting animation
// Animates from current value to target value with easing
const animateNumber = (
  from: number,
  to: number,
  duration: number,
  onUpdate: (value: number) => void,
  onComplete?: () => void
): number => {
  const startTime = performance.now()
  const diff = to - from

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function: easeOutQuart for smooth deceleration
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)

    onUpdate(Math.round(from + diff * easeOutQuart))

    if (progress < 1) {
      return requestAnimationFrame(step)
    } else {
      onComplete?.()
      return null
    }
  }

  return requestAnimationFrame(step)
}

// 🎨 Pallete's micro-UX enhancement: Animate counter change with visual feedback
const animateCounter = (
  currentValue: Ref<number>,
  targetValue: number,
  statKey: 'viewed' | 'bookmarked' | 'interests'
) => {
  // Skip animation if reduced motion is preferred
  if (prefersReducedMotion.value) {
    currentValue.value = targetValue
    return
  }

  // Clear existing animation
  const existingFrame =
    statKey === 'viewed'
      ? viewedAnimationFrame
      : statKey === 'bookmarked'
        ? bookmarkedAnimationFrame
        : interestsAnimationFrame

  if (existingFrame) {
    cancelAnimationFrame(existingFrame)
  }

  // Trigger visual feedback
  updatingStats.value[statKey] = true

  // Animate the number
  const fromValue = currentValue.value
  const newFrame = animateNumber(
    fromValue,
    targetValue,
    animationConfig.profileStats.countDurationMs,
    value => {
      currentValue.value = value
    },
    () => {
      // Remove visual feedback after animation completes
      setTimeout(() => {
        updatingStats.value[statKey] = false
      }, animationConfig.profileStats.highlightDurationMs)
    }
  )

  // Store reference for cleanup
  if (statKey === 'viewed') {
    viewedAnimationFrame = newFrame
  } else if (statKey === 'bookmarked') {
    bookmarkedAnimationFrame = newFrame
  } else {
    interestsAnimationFrame = newFrame
  }
}

// Watch for changes in user preferences and animate counters
watch(
  () => userPrefs.getViewedResources.value?.length || 0,
  newValue => {
    animateCounter(animatedViewedCount, newValue, 'viewed')
  },
  { immediate: false }
)

watch(
  () => userPrefs.getBookmarkedResources.value?.length || 0,
  newValue => {
    animateCounter(animatedBookmarkedCount, newValue, 'bookmarked')
  },
  { immediate: false }
)

watch(
  () => userPrefs.getUserInterests.value?.length || 0,
  newValue => {
    animateCounter(animatedInterestsCount, newValue, 'interests')
  },
  { immediate: false }
)

// Initialize user preferences and set initial values
onMounted(async () => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleChange)

    // Cleanup on unmount
    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handleChange)
    })
  }

  await userPrefs.initProfile()

  // Set initial values without animation
  animatedViewedCount.value = userPrefs.getViewedResources.value?.length || 0
  animatedBookmarkedCount.value =
    userPrefs.getBookmarkedResources.value?.length || 0
  animatedInterestsCount.value = userPrefs.getUserInterests.value?.length || 0
})

// Cleanup animation frames on unmount
onUnmounted(() => {
  if (viewedAnimationFrame) cancelAnimationFrame(viewedAnimationFrame)
  if (bookmarkedAnimationFrame) cancelAnimationFrame(bookmarkedAnimationFrame)
  if (interestsAnimationFrame) cancelAnimationFrame(interestsAnimationFrame)
})
</script>

<style scoped>
/* 🎨 Pallete's micro-UX enhancement: Activity counter animations */

.activity-stat {
  position: relative;
}

.activity-counter {
  display: inline-block;
  transition: all v-bind('animationConfig.cssTransitions.fastSec') ease-out;
  font-variant-numeric: tabular-nums;
}

/* Visual feedback when counter is updating */
.activity-counter--updating {
  color: v-bind('animationConfig.profileStats.updatingColor');
  transform: scale(v-bind('animationConfig.profileStats.updateScale'));
  text-shadow: 0 0 v-bind('animationConfig.profileStats.glowSpread')
    v-bind('animationConfig.profileStats.glowColor');
}

/* Subtle pulse animation for active updates */
@keyframes counter-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(v-bind('animationConfig.profileStats.pulseScale'));
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .activity-counter {
    transition: none;
  }

  .activity-counter--updating {
    transform: none;
    text-shadow: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .activity-counter--updating {
    text-shadow: none;
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
}
</style>
