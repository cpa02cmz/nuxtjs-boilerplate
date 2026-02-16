<template>
  <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
    <h3 class="text-lg font-medium text-gray-900 mb-4">
      Popular Searches
    </h3>
    <TransitionGroup
      tag="div"
      class="space-y-3"
      :enter-active-class="`transition-all ${animationConfig.tailwindDurations.slower} ease-out`"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      :leave-active-class="`transition-all ${animationConfig.tailwindDurations.standard} ease-in`"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
      :style="staggerStyles"
    >
      <button
        v-for="(search, index) in popularSearches"
        :key="search.query"
        ref="searchButtons"
        class="group w-full text-left p-3 rounded-lg transition-all duration-300 ease-out flex justify-between items-center relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
        :class="[
          hoverIndex === index
            ? 'bg-gray-50 shadow-md -translate-y-0.5'
            : 'bg-white hover:bg-gray-50 hover:shadow-sm',
          clickedIndex === index ? 'scale-98' : 'scale-100',
          loadingIndex === index ? 'cursor-wait' : 'cursor-pointer',
        ]"
        :aria-label="
          loadingIndex === index
            ? `Loading search results for ${search.query}`
            : `Search for ${search.query} (${search.count} results)`
        "
        :aria-busy="loadingIndex === index ? 'true' : 'false'"
        :disabled="loadingIndex === index"
        @click="handleClick(search.query, index, $event)"
        @mouseenter="handleMouseEnter(index)"
        @mouseleave="handleMouseLeave"
        @keydown="handleKeydown($event, index)"
      >
        <!-- Ripple effect container -->
        <span
          v-if="ripples[index]"
          class="absolute inset-0 pointer-events-none overflow-hidden rounded-lg"
          aria-hidden="true"
        >
          <span
            class="absolute rounded-full bg-gray-800 opacity-20 animate-ripple"
            :style="{
              left: `${ripples[index].x}px`,
              top: `${ripples[index].y}px`,
              width: `${ripples[index].size}px`,
              height: `${ripples[index].size}px`,
              transform: 'translate(-50%, -50%) scale(0)',
            }"
          />
        </span>

        <!-- Search query with icon -->
        <div class="flex items-center gap-2 flex-1 min-w-0 z-10">
          <!-- Trending indicator for top 3 searches -->
          <span
            v-if="index < 3"
            class="flex-shrink-0 w-2 h-2 rounded-full"
            :class="[
              index === 0
                ? 'bg-amber-400'
                : index === 1
                  ? 'bg-gray-400'
                  : 'bg-orange-400',
              { 'animate-pulse-subtle': index === 0 && !prefersReducedMotion },
            ]"
            aria-hidden="true"
          />
          <span
            class="flex-shrink-0 w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200"
            aria-hidden="true"
          >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <span
            class="text-gray-800 truncate group-hover:text-gray-900 transition-colors duration-200 font-medium"
          >{{ search.query }}</span>
        </div>

        <!-- Result count with animated background -->
        <div class="flex items-center gap-2 z-10">
          <!-- 🎨 Pallete: Loading spinner for async operations -->
          <span
            v-if="loadingIndex === index"
            class="loading-spinner"
            aria-hidden="true"
          >
            <svg
              class="w-4 h-4 text-gray-400 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
          <span
            v-else
            class="text-xs font-medium bg-gray-100 text-gray-600 rounded-full px-2.5 py-1 transition-all duration-300 group-hover:bg-gray-800 group-hover:text-white"
          >
            {{ formatCount(search.count) }}
          </span>
          <!-- Arrow indicator on hover (hidden when loading) -->
          <span
            v-if="loadingIndex !== index"
            class="text-gray-400 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
            aria-hidden="true"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </div>
      </button>
    </TransitionGroup>

    <!-- Empty state with illustration -->
    <Transition
      :enter-active-class="`transition-all ${animationConfig.tailwindDurations.slower} ease-out`"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      :leave-active-class="`transition-all ${animationConfig.tailwindDurations.standard} ease-in`"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="popularSearches.length === 0"
        class="text-center text-gray-500 py-8 flex flex-col items-center"
      >
        <div class="w-12 h-12 mb-3 text-gray-300 animate-pulse-subtle">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <p class="text-sm">
          No popular searches yet
        </p>
        <p class="text-xs text-gray-400 mt-1">
          Start exploring to see trending queries
        </p>
      </div>
    </Transition>

    <!-- Screen reader announcements -->
    <div
      class="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ announcement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAdvancedResourceSearch } from '~/composables/useAdvancedResourceSearch'
import { useResourceData } from '~/composables/useResourceData'
import { limitsConfig } from '~/configs/limits.config'
import { animationConfig } from '~/configs/animation.config'
import { triggerHaptic } from '~/utils/hapticFeedback'
import { uiTimingConfig } from '~/configs/ui-timing.config'

interface Props {
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  limit: limitsConfig.search.defaultPopularSearchesLimit,
})

const emit = defineEmits<{
  'search-select': [query: string]
}>()

const { resources } = useResourceData()
const { getPopularSearches } = useAdvancedResourceSearch(resources.value)

// Reactive state
const hoverIndex = ref<number | null>(null)
const clickedIndex = ref<number | null>(null)
const loadingIndex = ref<number | null>(null) // 🎨 Pallete: Loading state for async operations
const ripples = ref<{ [key: number]: { x: number; y: number; size: number } }>(
  {}
)
const announcement = ref('')
const searchButtons = ref<HTMLButtonElement[]>([])
const prefersReducedMotion = ref(false)

const popularSearches = computed(() => {
  return getPopularSearches(props.limit)
})

// Staggered animation styles
const staggerStyles = computed(() => ({
  '--stagger-delay': `${animationConfig.popularSearches.staggerDelayMs}ms`,
}))

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = mediaQuery.matches
}

// Format large counts (e.g., 1200 -> 1.2k)
const formatCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

// Handle click with ripple effect and loading state
const handleClick = (query: string, index: number, event: MouseEvent) => {
  const button = event.currentTarget as HTMLButtonElement
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height) * 1.5

  ripples.value[index] = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    size,
  }

  // 🎨 Pallete: Set loading state to provide visual feedback during async operation
  loadingIndex.value = index

  // Click feedback animation
  clickedIndex.value = index
  setTimeout(() => {
    clickedIndex.value = null
  }, uiTimingConfig.clickFeedback.resetDelay)

  // Haptic feedback - BroCula fix: Use triggerHaptic to check user interaction
  if (!prefersReducedMotion.value) {
    triggerHaptic('light')
  }

  // 🎨 Pallete: Enhanced screen reader announcement with loading state
  announcement.value = `Loading search results for ${query}`

  // Remove ripple after animation
  setTimeout(() => {
    delete ripples.value[index]
  }, uiTimingConfig.ripple.removalDelay)

  emit('search-select', query)
}

// Hover handlers
const handleMouseEnter = (index: number) => {
  hoverIndex.value = index
}

const handleMouseLeave = () => {
  hoverIndex.value = null
}

// Enhanced keyboard navigation
const handleKeydown = (event: KeyboardEvent, currentIndex: number) => {
  const buttons = searchButtons.value
  if (!buttons.length) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (currentIndex < buttons.length - 1) {
        buttons[currentIndex + 1]?.focus()
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (currentIndex > 0) {
        buttons[currentIndex - 1]?.focus()
      }
      break
    case 'Home':
      event.preventDefault()
      buttons[0]?.focus()
      break
    case 'End':
      event.preventDefault()
      buttons[buttons.length - 1]?.focus()
      break
  }
}

// 🎨 Pallete: Reset loading state after async operation completes
const resetLoadingState = () => {
  loadingIndex.value = null
}

// Lifecycle
onMounted(() => {
  checkReducedMotion()

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', checkReducedMotion)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.removeEventListener('change', checkReducedMotion)
  }
})

// 🎨 Pallete: Expose methods for parent component
// This allows parent to reset loading state after search completes
defineExpose({
  resetLoadingState,
})
</script>

<style scoped>
/* Staggered entrance animation - Flexy hates hardcoded values! Using config now. */
.space-y-3 > * {
  animation: stagger-entrance
    v-bind('animationConfig.popularSearches.entranceDurationSec') ease-out
    backwards;
  animation-delay: calc(
    var(
        --stagger-delay,
        v-bind('`${animationConfig.popularSearches.staggerDelayMs}ms`')
      ) *
      var(--index, 0)
  );
}

.space-y-3 > *:nth-child(1) {
  --index: 0;
}
.space-y-3 > *:nth-child(2) {
  --index: 1;
}
.space-y-3 > *:nth-child(3) {
  --index: 2;
}
.space-y-3 > *:nth-child(4) {
  --index: 3;
}
.space-y-3 > *:nth-child(5) {
  --index: 4;
}
.space-y-3 > *:nth-child(6) {
  --index: 5;
}
.space-y-3 > *:nth-child(7) {
  --index: 6;
}
.space-y-3 > *:nth-child(8) {
  --index: 7;
}
.space-y-3 > *:nth-child(9) {
  --index: 8;
}
.space-y-3 > *:nth-child(10) {
  --index: 9;
}

@keyframes stagger-entrance {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Ripple animation */
@keyframes ripple {
  to {
    transform: translate(-50%, -50%) scale(4);
    opacity: 0;
  }
}

.animate-ripple {
  animation: ripple
    v-bind('`${animationConfig.popularSearches.rippleDurationMs}ms`') ease-out
    forwards;
}

/* Subtle pulse for trending indicator */
@keyframes pulse-subtle {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.animate-pulse-subtle {
  animation: pulse-subtle
    v-bind('`${animationConfig.popularSearches.trendingPulseDurationSec}s`')
    ease-in-out infinite;
}

/* Scale 98 for click feedback */
.scale-98 {
  transform: scale(0.98);
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

/* 🎨 Pallete: Loading spinner animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Loading spinner container */
.loading-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

/* Cursor styles */
.cursor-wait {
  cursor: wait;
}

.cursor-pointer {
  cursor: pointer;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .space-y-3 > * {
    animation: none;
  }

  .animate-pulse-subtle {
    animation: none;
    opacity: 1;
  }

  .animate-ripple {
    animation: none;
    opacity: 0;
  }

  .animate-spin {
    animation: none;
    opacity: 0.5;
  }

  .group {
    transition: none;
  }
}
</style>
