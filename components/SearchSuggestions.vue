<template>
  <div
<<<<<<< HEAD
    v-if="suggestions.length > 0 || searchHistory.length > 0"
    class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 max-h-96 overflow-auto border border-gray-200"
    role="listbox"
    aria-label="Search suggestions"
    @keydown="handleKeyDown"
  >
    <!-- Search History Section -->
    <div v-if="searchHistory.length > 0">
      <div
        class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
      >
        Recent Searches
      </div>
      <ul>
        <li
          v-for="(history, index) in searchHistory"
          :key="'history-' + index"
          role="option"
          :aria-selected="focusedIndex === index"
          :class="[
            'px-4 py-2 cursor-pointer hover:bg-gray-100',
            focusedIndex === index ? 'bg-gray-100' : '',
          ]"
          @click="selectHistory(history)"
          @mouseenter="focusedIndex = index"
        >
          <div class="flex items-center">
            <svg
              class="w-4 h-4 mr-2 text-gray-400"
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
              ></path>
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
      ></div>
      <div
        class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
      >
        Suggestions
      </div>
      <ul>
        <li
          v-for="(suggestion, index) in suggestions"
          :key="suggestion.id"
          role="option"
          :aria-selected="focusedIndex === searchHistory.length + index"
          :class="[
            'px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-start',
            focusedIndex === searchHistory.length + index ? 'bg-gray-100' : '',
          ]"
          @click="selectSuggestion(suggestion)"
          @mouseenter="focusedIndex = searchHistory.length + index"
        >
          <svg
            class="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0"
=======
    v-if="showSuggestions"
    class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 max-h-60 overflow-auto border border-gray-200"
    role="listbox"
    aria-label="Search suggestions"
    @keydown="handleKeydown"
  >
    <!-- Search History Section -->
    <div v-if="searchHistory.length > 0 && !searchQuery" class="px-4 py-2">
      <div
        class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
      >
        Recent Searches
      </div>
      <div
        v-for="(item, index) in searchHistory"
        :key="'history-' + index"
        :class="[
          'px-3 py-2 text-sm text-gray-700 cursor-pointer flex items-center justify-between',
          index === focusedIndex ? 'bg-gray-100' : 'hover:bg-gray-50',
        ]"
        role="option"
        :aria-selected="index === focusedIndex"
        @click="selectHistoryItem(item)"
        @mouseenter="focusedIndex = index"
      >
        <div class="flex items-center">
          <svg
            class="w-4 h-4 mr-2 text-gray-400"
>>>>>>> fdff6bd (feat: implement advanced search with real-time suggestions and search history)
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
<<<<<<< HEAD
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
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
    </div>

    <!-- Clear History Button -->
    <div v-if="searchHistory.length > 0" class="border-t border-gray-200 mt-1">
      <button
        class="w-full px-4 py-2 text-left text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 flex items-center"
        @click="clearHistory"
      >
        <svg
          class="w-4 h-4 mr-2"
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
          ></path>
        </svg>
        Clear search history
=======
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          {{ item }}
        </div>
        <button
          type="button"
          class="text-gray-400 hover:text-gray-600"
          @click.stop="removeHistoryItem(item)"
          aria-label="Remove from history"
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
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
      <div
        v-if="displaySuggestions.length > 0"
        class="border-t border-gray-200 my-1"
      ></div>
    </div>

    <!-- Search Suggestions Section -->
    <div
      v-for="(suggestion, index) in displaySuggestions"
      :key="suggestion.id"
      :class="[
        'px-3 py-2 text-sm text-gray-700 cursor-pointer flex items-start',
        index + (searchQuery ? 0 : searchHistory.length) === focusedIndex
          ? 'bg-gray-100'
          : 'hover:bg-gray-50',
      ]"
      role="option"
      :aria-selected="
        index + (searchQuery ? 0 : searchHistory.length) === focusedIndex
      "
      @click="selectSuggestion(suggestion)"
      @mouseenter="
        focusedIndex = index + (searchQuery ? 0 : searchHistory.length)
      "
    >
      <svg
        class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400"
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
        ></path>
      </svg>
      <div class="flex-1 min-w-0">
        <div
          class="font-medium truncate"
          v-html="highlightMatch(suggestion.title, searchQuery)"
        ></div>
        <div
          class="text-xs text-gray-500 truncate mt-1"
          v-html="highlightMatch(suggestion.description, searchQuery)"
        ></div>
        <div class="flex flex-wrap gap-1 mt-1">
          <span
            v-for="tag in suggestion.tags.slice(0, 3)"
            :key="tag"
            class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800"
          >
            {{ tag }}
          </span>
          <span
            v-if="suggestion.tags.length > 3"
            class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800"
          >
            +{{ suggestion.tags.length - 3 }} more
          </span>
        </div>
      </div>
    </div>

    <!-- No Results Message -->
    <div
      v-if="
        displaySuggestions.length === 0 &&
        searchQuery &&
        searchHistory.length === 0
      "
      class="px-3 py-2 text-sm text-gray-500"
    >
      No resources found for "{{ searchQuery }}"
    </div>

    <!-- Clear History Button -->
    <div
      v-if="searchHistory.length > 0 && !searchQuery"
      class="border-t border-gray-200 px-3 py-2"
    >
      <button
        class="w-full text-center text-sm text-gray-500 hover:text-gray-700"
        @click="clearHistory"
      >
        Clear Search History
>>>>>>> fdff6bd (feat: implement advanced search with real-time suggestions and search history)
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
<<<<<<< HEAD
import { ref, watch } from 'vue'

interface SuggestionItem {
  id: string
  title: string
  description: string
  url: string
}

interface Props {
  suggestions: SuggestionItem[]
  searchHistory: string[]
  visible: boolean
}

interface Emits {
  (event: 'select-suggestion', suggestion: SuggestionItem): void
  (event: 'select-history', history: string): void
  (event: 'clear-history'): void
  (event: 'navigate', direction: 'up' | 'down'): void
=======
import { computed, ref, watch } from 'vue'
import type { Resource } from '~/composables/useResources'

interface Props {
  searchQuery: string
  searchSuggestions: Resource[]
  searchHistory: string[]
}

interface Emits {
  (event: 'select-suggestion', suggestion: Resource): void
  (event: 'select-history', item: string): void
  (event: 'remove-history', item: string): void
  (event: 'clear-history'): void
  (event: 'keydown', e: KeyboardEvent): void
>>>>>>> fdff6bd (feat: implement advanced search with real-time suggestions and search history)
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const focusedIndex = ref(-1)

<<<<<<< HEAD
// Clear the focused index when suggestions are hidden
watch(
  () => props.visible,
  visible => {
    if (!visible) {
      focusedIndex.value = -1
    }
  }
)

const selectSuggestion = (suggestion: SuggestionItem) => {
  emit('select-suggestion', suggestion)
}

const selectHistory = (history: string) => {
  emit('select-history', history)
=======
// Reset focused index when suggestions change
watch(
  () => [props.searchSuggestions, props.searchHistory, props.searchQuery],
  () => {
    focusedIndex.value = -1
  }
)

// Combine history and suggestions for keyboard navigation
const displaySuggestions = computed(() => {
  // Only show suggestions when there's a search query
  if (props.searchQuery) {
    return props.searchSuggestions
  }
  return []
})

const showSuggestions = computed(() => {
  return (
    (props.searchQuery || props.searchHistory.length > 0) &&
    (props.searchSuggestions.length > 0 ||
      props.searchHistory.length > 0 ||
      props.searchQuery)
  )
})

// Highlight matching text in search results
const highlightMatch = (
  text: string,
  query: string,
  returnHtml: boolean = true
) => {
  if (!query || !text) return text
  const regex = new RegExp(`(${query})`, 'gi')
  const highlighted = text.replace(
    regex,
    '<mark class="bg-yellow-200 text-gray-900">$1</mark>'
  )
  return returnHtml ? highlighted : text // If not returning HTML, return original text
}

const selectSuggestion = (suggestion: Resource) => {
  emit('select-suggestion', suggestion)
  focusedIndex.value = -1
}

const selectHistoryItem = (item: string) => {
  emit('select-history', item)
  focusedIndex.value = -1
}

const removeHistoryItem = (item: string) => {
  emit('remove-history', item)
>>>>>>> fdff6bd (feat: implement advanced search with real-time suggestions and search history)
}

const clearHistory = () => {
  emit('clear-history')
}

<<<<<<< HEAD
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
=======
const handleKeydown = (e: KeyboardEvent) => {
  emit('keydown', e)

  const totalItems =
    (props.searchQuery ? props.searchSuggestions.length : 0) +
    (!props.searchQuery ? props.searchHistory.length : 0)

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      focusedIndex.value = Math.min(focusedIndex.value + 1, totalItems - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      focusedIndex.value = Math.max(focusedIndex.value - 1, -1)
      break
    case 'Enter':
      e.preventDefault()
      if (focusedIndex.value >= 0) {
        if (props.searchQuery) {
          // If showing search suggestions
          if (focusedIndex.value < props.searchSuggestions.length) {
            selectSuggestion(props.searchSuggestions[focusedIndex.value])
          } else {
            // This shouldn't happen, but just in case
            const historyIndex =
              focusedIndex.value - props.searchSuggestions.length
            if (historyIndex < props.searchHistory.length) {
              selectHistoryItem(props.searchHistory[historyIndex])
            }
          }
        } else {
          // If showing history items only
          if (focusedIndex.value < props.searchHistory.length) {
            selectHistoryItem(props.searchHistory[focusedIndex.value])
          }
        }
      }
      break
    case 'Escape':
      e.preventDefault()
      focusedIndex.value = -1
      break
>>>>>>> fdff6bd (feat: implement advanced search with real-time suggestions and search history)
  }
}
</script>
