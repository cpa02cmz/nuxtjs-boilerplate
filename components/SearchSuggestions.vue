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
            'px-4 py-2 cursor-pointer hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset',
            focusedIndex === index ? 'bg-gray-100' : '',
          ]"
          @click="selectHistory(history)"
          @mouseenter="focusedIndex = index"
        >
          <div class="flex items-center">
            <svg
              :class="[uiConfig.iconSizes.suggestion, 'mr-2 text-gray-400']"
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
            <span>{{ history }}</span>
          </div>
        </li>
      </ul>
    </div>

    <!-- Search Suggestions Section -->
    <div v-if="suggestions.length > 0">
      <div
        v-if="searchHistory.length > 0"
        class="border-t border-gray-200 my-1"
      />
      <div
        class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
      >
        {{ contentConfig.search.suggestions.title }}
      </div>
      <ul>
        <li
          v-for="(suggestion, index) in suggestions"
          :key="suggestion.id"
          :data-suggestion-index="searchHistory.length + index"
          role="option"
          :aria-selected="focusedIndex === searchHistory.length + index"
          :class="[
            'px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset',
            focusedIndex === searchHistory.length + index ? 'bg-gray-100' : '',
          ]"
          @click="selectSuggestion(suggestion)"
          @mouseenter="focusedIndex = searchHistory.length + index"
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
          class="w-full px-4 py-2 text-left text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 flex items-center focus:outline-none focus:ring-2 focus:ring-gray-800"
          :aria-label="contentConfig.search.suggestions.clearHistory"
          @click="clearHistory"
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
        v-if="suggestions.length === 0 && searchHistory.length === 0 && hasQuery"
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
        <p class="text-sm text-gray-500 mb-3">
          No matching resources found
        </p>
        <button
          type="button"
          class="text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-3 py-1.5 transition-colors duration-150"
          @click="handleClearSearch"
        >
          Clear search
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import { contentConfig } from '~/configs/content.config'
import { uiConfig } from '~/configs/ui.config'

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
}

interface Emits {
  (event: 'select-suggestion', suggestion: SuggestionItem): void
  (event: 'select-history', history: string): void
  (event: 'clear-history'): void
  (event: 'navigate', direction: 'up' | 'down'): void
  (event: 'clear-search'): void
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
        behavior: 'smooth',
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
