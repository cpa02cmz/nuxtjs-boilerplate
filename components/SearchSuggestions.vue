<template>
  <div
    v-if="suggestions.length > 0 || searchHistory.length > 0 || hasQuery"
    :id="id"
    :class="[
      'absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 overflow-auto border border-gray-200',
      uiConfig.dropdown.maxHeight,
    ]"
    role="listbox"
    :aria-label="contentConfig.search.suggestions.title"
    @keydown="handleKeyDown"
  >
    <!-- Search History Section -->
    <div v-if="searchHistory.length > 0">
      <div
        class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
      >
        {{ contentConfig.search.suggestions.recentTitle }}
      </div>
      <ul>
        <li
          v-for="(history, index) in searchHistory"
          :key="'history-' + index"
          :data-suggestion-index="index"
          role="option"
          :aria-selected="focusedIndex === index"
          :class="[
            'suggestion-item',
            'px-4 py-2 cursor-pointer hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset',
            focusedIndex === index ? 'bg-gray-100' : '',
            getItemClass('history', index),
          ]"
          @click="selectHistoryWithFeedback(history, index)"
          @mouseenter="focusedIndex = index"
          @mousedown="handlePressStart('history', index)"
          @mouseup="handlePressEnd"
          @mouseleave="handlePressEnd"
          @touchstart="handlePressStart('history', index)"
          @touchend="handlePressEnd"
        >
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center flex-1 min-w-0">
              <svg
                :class="[
                  uiConfig.iconSizes.suggestion,
                  'mr-2 text-gray-400 flex-shrink-0',
                ]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span class="truncate">{{ history }}</span>
            </div>
            <!-- Palette's micro-UX: New indicator for recent searches from current session -->
            <span
              v-if="isRecentSearch(history)"
              class="new-indicator"
              :class="{ 'new-indicator--animated': !prefersReducedMotion() }"
              :aria-label="
                contentConfig.search.suggestions.aria.newIndicator.replace(
                  '{{term}}',
                  history
                )
              "
            >
              new
            </span>
          </div>
        </li>
      </ul>
    </div>

    <!-- Search Suggestions Section -->
    <div v-if="suggestions.length > 0 || isLoading">
      <div
        v-if="searchHistory.length > 0"
        class="border-t border-gray-200 my-1"
      />
      <div
        class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
      >
        {{ contentConfig.search.suggestions.title }}
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading && suggestions.length === 0 && hasQuery"
        class="px-4 py-6 text-center"
        role="status"
        aria-live="polite"
      >
        <svg
          class="mx-auto h-6 w-6 text-blue-500 animate-spin mb-2"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
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
        <span class="text-sm text-gray-500"> Searching resources... </span>
      </div>
      <ul>
        <li
          v-for="(suggestion, index) in suggestions"
          :key="suggestion.id"
          :data-suggestion-index="searchHistory.length + index"
          role="option"
          :aria-selected="focusedIndex === searchHistory.length + index"
          :class="[
            'suggestion-item',
            'px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset',
            focusedIndex === searchHistory.length + index ? 'bg-gray-100' : '',
            getItemClass('suggestion', index),
          ]"
          @click="selectSuggestionWithFeedback(suggestion, index)"
          @mouseenter="focusedIndex = searchHistory.length + index"
          @mousedown="handlePressStart('suggestion', index)"
          @mouseup="handlePressEnd"
          @mouseleave="handlePressEnd"
          @touchstart="handlePressStart('suggestion', index)"
          @touchend="handlePressEnd"
        >
          <svg
            :class="[
              uiConfig.iconSizes.suggestion,
              'mr-2 mt-0.5 text-gray-400 flex-shrink-0',
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <div class="flex flex-col">
            <span class="font-medium text-gray-900 truncate">{{
              suggestion.title
            }}</span>
            <span class="text-xs text-gray-500 truncate">{{
              suggestion.description
            }}</span>
          </div>
        </li>
      </ul>

      <!-- Clear History Button -->
      <div
        v-if="searchHistory.length > 0"
        class="border-t border-gray-200 mt-1"
      >
        <button
          class="suggestion-item w-full px-4 py-2 text-left text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 flex items-center focus:outline-none focus:ring-2 focus:ring-gray-800"
          :aria-label="contentConfig.search.suggestions.clearHistory"
          @click="clearHistoryWithFeedback"
          @mousedown="handlePressStart('history', -1)"
          @mouseup="handlePressEnd"
          @mouseleave="handlePressEnd"
          @touchstart="handlePressStart('history', -1)"
          @touchend="handlePressEnd"
        >
          <svg
            :class="uiConfig.iconSizes.suggestion"
            class="mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          {{ contentConfig.search.suggestions.clearHistory }}
        </button>
      </div>

      <!-- Empty State - Show when no suggestions or history but user has typed -->
      <div
        v-if="
          suggestions.length === 0 && searchHistory.length === 0 && hasQuery
        "
        class="px-4 py-6 text-center"
        role="status"
        aria-live="polite"
      >
        <svg
          class="mx-auto h-10 w-10 text-gray-300 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="text-sm text-gray-900 font-medium mb-1">
          {{ contentConfig.search.emptyState.noResultsTitle }}
        </p>
        <p class="text-xs text-gray-500 mb-4">
          {{ contentConfig.search.emptyState.noResultsSubtitle }}
        </p>

        <!-- Popular Suggestions Section -->
        <div class="mb-4">
          <p
            class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
          >
            {{ contentConfig.search.emptyState.tryThese }}
          </p>
          <div class="flex flex-wrap justify-center gap-2">
            <button
              v-for="(suggestion, index) in defaultSuggestions"
              :key="index"
              type="button"
              class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
              @click="selectDefaultSuggestion(suggestion)"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>

        <div class="flex justify-center gap-3">
          <button
            type="button"
            class="text-sm text-gray-600 hover:text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 rounded px-3 py-1.5 transition-colors duration-150"
            @click="handleClearSearch"
          >
            {{ contentConfig.search.emptyState.clearSearch }}
          </button>
          <NuxtLink
            to="/search"
            class="text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-3 py-1.5 transition-colors duration-150"
          >
            {{ contentConfig.search.emptyState.browseAll }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import { contentConfig } from '~/configs/content.config'
import { uiConfig } from '~/configs/ui.config'
import { limitsConfig } from '~/configs/limits.config'
import { animationConfig } from '~/configs/animation.config'
import { searchConfig } from '~/configs/search.config'
import { EASING } from '~/configs/easing.config'
import { NuxtLink } from '#components'
import { hapticLight } from '~/utils/hapticFeedback'

interface SuggestionItem {
  id: string
  title: string
  description: string
  url: string
}

interface Props {
  suggestions?: SuggestionItem[]
  searchHistory?: string[]
  visible: boolean
  id?: string
  focusedIndex?: number
  hasQuery?: boolean
  isLoading?: boolean
}

interface Emits {
  (event: 'select-suggestion', suggestion: SuggestionItem): void
  (event: 'select-history', history: string): void
  (event: 'clear-history'): void
  (event: 'navigate', direction: 'up' | 'down'): void
  (event: 'clear-search'): void
  (event: 'select-default-suggestion', suggestion: string): void
}
const props = withDefaults(defineProps<Props>(), {
  suggestions: () => [],
  searchHistory: () => [],
  id: undefined,
  focusedIndex: -1,
  hasQuery: false,
})
const emit = defineEmits<Emits>()

// Use internal state if prop not provided, otherwise use prop
const internalFocusedIndex = ref(-1)
const focusedIndex = computed({
  get: () =>
    props.focusedIndex >= 0 ? props.focusedIndex : internalFocusedIndex.value,
  set: val => {
    internalFocusedIndex.value = val
  },
})

// Clear the focused index when suggestions are hidden
watch(
  () => props.visible,
  visible => {
    if (!visible) {
      focusedIndex.value = -1
    }
  }
)

// Scroll focused item into view when navigating with keyboard
watch(focusedIndex, newIndex => {
  if (newIndex >= 0) {
    nextTick(() => {
      const focusedElement = document.querySelector(
        `[data-suggestion-index="${newIndex}"]`
      )
      focusedElement?.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
      })
    })
  }
})

const selectSuggestion = (suggestion: SuggestionItem) => {
  emit('select-suggestion', suggestion)
}

const selectHistory = (history: string) => {
  emit('select-history', history)
}

const clearHistory = () => {
  emit('clear-history')
}

const handleClearSearch = () => {
  emit('clear-search')
}

// Palette's micro-UX delight: Track pressed items for tactile feedback animations
const pressedItem = ref<{
  type: 'history' | 'suggestion'
  index: number
} | null>(null)

// Check for reduced motion preference
const prefersReducedMotion = () => {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Handle item press start
const handlePressStart = (type: 'history' | 'suggestion', index: number) => {
  if (prefersReducedMotion()) return
  pressedItem.value = { type, index }
}

// Handle item press end
const handlePressEnd = () => {
  pressedItem.value = null
}

// Enhanced selection handlers with haptic feedback
const selectHistoryWithFeedback = (history: string, _index: number) => {
  // Trigger haptic feedback for mobile users
  hapticLight()
  selectHistory(history)
}

const selectSuggestionWithFeedback = (
  suggestion: SuggestionItem,
  _index: number
) => {
  // Trigger haptic feedback for mobile users
  hapticLight()
  selectSuggestion(suggestion)
}

const clearHistoryWithFeedback = () => {
  // Trigger haptic feedback for destructive action
  hapticLight()
  clearHistory()
}

// Get item class with press animation states
const getItemClass = (type: 'history' | 'suggestion', index: number) => {
  const isPressed =
    pressedItem.value?.type === type && pressedItem.value?.index === index
  return {
    'is-pressed': isPressed,
    'is-released': !isPressed && pressedItem.value !== null,
  }
}

// Default suggestions for empty state - Flexy hates hardcoded limits!
const defaultSuggestions = computed(() => {
  return contentConfig.search.suggestions.defaultSuggestions.slice(
    0,
    limitsConfig.search.defaultSuggestionsLimit
  )
})

// Palette's micro-UX: Track recent searches from current session
// Flexy hates hardcoded values! Using config for recent search threshold
const recentSearches = ref<Set<string>>(new Set())
const RECENT_SEARCH_THRESHOLD_MS = searchConfig.recentSearchThresholdMs

// Check if a search is recent (from current session, within last hour)
const isRecentSearch = (searchTerm: string): boolean => {
  return recentSearches.value.has(searchTerm)
}

// Watch for new searches and mark them as recent
watch(
  () => props.searchHistory,
  (newHistory, oldHistory) => {
    if (!newHistory || !oldHistory) return

    // Find new items that weren't in the old history
    const newItems = newHistory.filter(item => !oldHistory.includes(item))

    // Add new items to recent set
    newItems.forEach(item => {
      recentSearches.value.add(item)
    })

    // Clean up old entries after threshold
    setTimeout(() => {
      newItems.forEach(item => {
        recentSearches.value.delete(item)
      })
    }, RECENT_SEARCH_THRESHOLD_MS)
  },
  { deep: true }
)

const selectDefaultSuggestion = (suggestion: string) => {
  emit('select-default-suggestion', suggestion)
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    const totalItems = props.searchHistory.length + props.suggestions.length
    if (focusedIndex.value < totalItems - 1) {
      focusedIndex.value++
    } else {
      focusedIndex.value = 0
    }
    emit('navigate', 'down')
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (focusedIndex.value > 0) {
      focusedIndex.value--
    } else {
      const totalItems = props.searchHistory.length + props.suggestions.length
      focusedIndex.value = totalItems - 1
    }
    emit('navigate', 'up')
  } else if (event.key === 'Enter') {
    event.preventDefault()
    if (focusedIndex.value >= 0) {
      // Trigger haptic feedback for keyboard selection
      hapticLight()
      if (focusedIndex.value < props.searchHistory.length) {
        // It's a history item
        emit('select-history', props.searchHistory[focusedIndex.value])
      } else {
        // It's a suggestion
        const suggestionIndex = focusedIndex.value - props.searchHistory.length
        if (suggestionIndex < props.suggestions.length) {
          emit('select-suggestion', props.suggestions[suggestionIndex])
        }
      }
    }
  } else if (event.key === 'Escape') {
    focusedIndex.value = -1
  }
}
</script>

<style scoped>
/* Palette's micro-UX delight: Suggestion item animations for tactile feedback */
.suggestion-item {
  transition:
    transform v-bind('animationConfig.suggestion.pressDurationMs') ms
      v-bind('EASING.SPRING_STANDARD'),
    background-color v-bind('animationConfig.suggestion.bgTransitionMs') ms
      ease-out;
  will-change: transform;
  backface-visibility: hidden;
}

/* Hover state: Subtle scale up for visual delight */
.suggestion-item:not(.is-pressed):hover {
  transform: scale(1.01) translateX(2px);
}

/* Pressed state: Scale down for tactile feedback */
.suggestion-item.is-pressed {
  transform: scale(v-bind('animationConfig.suggestion.pressScale')) !important;
  transition: transform v-bind('animationConfig.suggestion.pressDurationMs') ms
    ease-out;
}

/* Released state: Spring back animation */
.suggestion-item.is-released {
  animation: spring-back
    v-bind('animationConfig.suggestion.springBackDurationMs') ms
    v-bind('EASING.SPRING_STANDARD');
}

@keyframes spring-back {
  0% {
    transform: scale(v-bind('animationConfig.suggestion.pressScale'));
  }
  60% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

/* Reduced motion support - disable animations for accessibility */
@media (prefers-reduced-motion: reduce) {
  .suggestion-item {
    transition: background-color
      v-bind('animationConfig.cssTransitions.reducedMotionSec') ease-out;
    will-change: auto;
  }

  .suggestion-item:not(.is-pressed):hover {
    transform: none;
  }

  .suggestion-item.is-pressed {
    transform: none !important;
    opacity: 0.8;
  }

  .suggestion-item.is-released {
    animation: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .suggestion-item.is-pressed {
    outline: 2px solid currentColor;
    outline-offset: -2px;
  }
}

/* Palette's micro-UX delight: New indicator badge for recent searches */
.new-indicator {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  margin-left: 8px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #3b82f6;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 9999px;
  border: 1px solid #93c5fd;
  flex-shrink: 0;
  transition: all 0.2s ease-out;
}

/* Animated new indicator with subtle pulse */
.new-indicator--animated {
  animation: new-pulse 2s ease-in-out infinite;
}

@keyframes new-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0);
  }
}

/* Hover effect on the suggestion item enhances the new indicator */
.suggestion-item:hover .new-indicator {
  background: linear-gradient(135deg, #bfdbfe 0%, #a5d8ff 100%);
  transform: scale(1.05);
}

/* Reduced motion support for new indicator */
@media (prefers-reduced-motion: reduce) {
  .new-indicator--animated {
    animation: none;
  }

  .new-indicator {
    transition: none;
  }
}

/* High contrast mode support for new indicator */
@media (prefers-contrast: high) {
  .new-indicator {
    border: 2px solid currentColor;
    background: transparent;
  }
}
</style>
