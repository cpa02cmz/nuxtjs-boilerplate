<template>
  <div class="relative w-full max-w-2xl">
    <div class="relative">
      <div
        class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
      >
        <svg
          class="w-5 h-5 text-gray-400"
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>
      <input
        id="search-input"
<<<<<<< HEAD
        ref="searchInputRef"
=======
        ref="inputRef"
>>>>>>> fdff6bd (feat: implement advanced search with real-time suggestions and search history)
        type="search"
        :value="modelValue"
        class="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
        placeholder="Search resources by name, description, tags..."
        aria-label="Search resources"
        aria-describedby="search-results-info"
        aria-owns="search-suggestions"
        aria-expanded="showSuggestions"
        role="combobox"
        autocomplete="off"
        @input="handleInput"
<<<<<<< HEAD
        @keydown="handleKeyDown"
=======
        @keydown="handleKeydown"
>>>>>>> fdff6bd (feat: implement advanced search with real-time suggestions and search history)
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <div
        v-if="modelValue"
        class="absolute inset-y-0 right-0 flex items-center pr-3"
      >
        <button
          class="text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Clear search"
          @click="clearSearch"
        >
          <svg
            class="w-5 h-5"
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
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Search Suggestions Dropdown -->
    <SearchSuggestions
<<<<<<< HEAD
      v-if="
        showSuggestions && (suggestions.length > 0 || searchHistory.length > 0)
      "
      :suggestions="suggestions"
      :search-history="searchHistory"
      :visible="showSuggestions"
      @select-suggestion="handleSuggestionSelect"
      @select-history="handleHistorySelect"
      @clear-history="handleClearHistory"
      @navigate="handleNavigate"
=======
      v-if="showSuggestions"
      id="search-suggestions"
      ref="suggestionsRef"
      :search-query="modelValue"
      :search-suggestions="suggestions"
      :search-history="searchHistory"
      @select-suggestion="handleSuggestionSelect"
      @select-history="handleHistorySelect"
      @remove-history="removeFromHistory"
      @clear-history="clearHistory"
      @keydown="handleSuggestionsKeydown"
>>>>>>> fdff6bd (feat: implement advanced search with real-time suggestions and search history)
    />

    <!-- ARIA live region for search results information -->
    <div
      id="search-results-info"
      role="status"
      aria-live="polite"
      class="sr-only"
    >
      Search results will be updated automatically
    </div>
  </div>
</template>

<script setup lang="ts">
<<<<<<< HEAD
import { ref, onMounted } from 'vue'
import SearchSuggestions from '~/components/SearchSuggestions.vue'
import { useResources } from '~/composables/useResources'
=======
import SearchSuggestions from './SearchSuggestions.vue'
import { useResources } from '~/composables/useResources'
import type { Resource } from '~/composables/useResources'
import { ref, watch, onMounted } from 'vue'
>>>>>>> fdff6bd (feat: implement advanced search with real-time suggestions and search history)

interface Props {
  modelValue: string
  debounceTime?: number
}

interface Emits {
  (event: 'update:modelValue', value: string): void
  (event: 'search', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

<<<<<<< HEAD
// Use the resources composable
const {
  getSuggestions,
  getSearchHistory,
  addSearchToHistory,
  clearSearchHistory,
} = useResources()

// Refs
const searchInputRef = ref<HTMLInputElement>()
const showSuggestions = ref(false)
const suggestions = ref<any[]>([])
const searchHistory = ref<string[]>([])
const debouncedQuery = ref('')
const inputTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

// Load search history on component mount
onMounted(() => {
  searchHistory.value = getSearchHistory()
})

// Handle input with debounce
=======
// Get resources composable
const { getSearchSuggestions, loading } = useResources()

// Refs
const inputRef = ref<HTMLInputElement | null>(null)
const suggestionsRef = ref<InstanceType<typeof SearchSuggestions> | null>(null)

// State for suggestions
const showSuggestions = ref(false)
const suggestions = ref<Resource[]>([])
const searchHistory = ref<string[]>([])

// Load search history from localStorage on component mount
onMounted(() => {
  loadSearchHistory()
})

// Watch for changes in modelValue to update suggestions
watch(
  () => props.modelValue,
  async newValue => {
    if (newValue && !loading.value) {
      suggestions.value = getSearchSuggestions(newValue, 5)
    } else {
      suggestions.value = []
    }
  }
)

// Load search history from localStorage
const loadSearchHistory = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('searchHistory')
    if (stored) {
      try {
        searchHistory.value = JSON.parse(stored)
      } catch {
        searchHistory.value = []
      }
    }
  }
}

// Save search history to localStorage
const saveSearchHistory = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
  }
}

// Add search term to history
const addToHistory = (term: string) => {
  if (!term.trim()) return

  // Remove if already exists to avoid duplicates
  const index = searchHistory.value.indexOf(term)
  if (index !== -1) {
    searchHistory.value.splice(index, 1)
  }

  // Add to beginning of array
  searchHistory.value.unshift(term)

  // Limit to 10 items
  if (searchHistory.value.length > 10) {
    searchHistory.value = searchHistory.value.slice(0, 10)
  }

  saveSearchHistory()
}

// Remove item from history
const removeFromHistory = (term: string) => {
  const index = searchHistory.value.indexOf(term)
  if (index !== -1) {
    searchHistory.value.splice(index, 1)
    saveSearchHistory()
  }
}

// Clear all history
const clearHistory = () => {
  searchHistory.value = []
  saveSearchHistory()
}

// Handle input with debouncing
let inputTimeout: NodeJS.Timeout | null = null
>>>>>>> fdff6bd (feat: implement advanced search with real-time suggestions and search history)
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value

<<<<<<< HEAD
  // Update the model value immediately
  emit('update:modelValue', value)

  // Debounce the search to avoid constant updates
  if (inputTimeout.value) {
    clearTimeout(inputTimeout.value)
  }

  inputTimeout.value = setTimeout(() => {
    debouncedQuery.value = value
    updateSuggestions(value)
    emit('search', value)
  }, props.debounceTime || 300)
}

// Update suggestions based on input
const updateSuggestions = (query: string) => {
  if (query && query.length > 1) {
    // Get search suggestions
    suggestions.value = getSuggestions(query, 5).map((resource: any) => ({
      id: resource.id,
      title: resource.title,
      description:
        resource.description.substring(0, 100) +
        (resource.description.length > 100 ? '...' : ''),
      url: resource.url,
    }))
  } else {
    suggestions.value = []
  }
=======
  emit('update:modelValue', value)

  // Debounce the search to avoid excessive updates
  if (inputTimeout) {
    clearTimeout(inputTimeout)
  }

  inputTimeout = setTimeout(() => {
    emit('search', value)
    if (value.trim()) {
      showSuggestions.value = true
    } else {
      showSuggestions.value = false
    }
  }, 300)
}

// Handle keydown events for keyboard navigation
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    showSuggestions.value = false
  }
}

// Handle keydown events from suggestions
const handleSuggestionsKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    // Add current input to history when enter is pressed
    if (props.modelValue.trim()) {
      addToHistory(props.modelValue.trim())
    }
  }
}

// Handle focus on input
const handleFocus = () => {
  if (props.modelValue) {
    showSuggestions.value = true
  } else {
    // Show history when there's no search query
    showSuggestions.value = searchHistory.value.length > 0
  }
}

// Handle blur to hide suggestions with a delay to allow click events
const handleBlur = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

// Handle suggestion selection
const handleSuggestionSelect = (suggestion: Resource) => {
  emit('update:modelValue', suggestion.title)
  emit('search', suggestion.title)
  addToHistory(suggestion.title)
  showSuggestions.value = false
}

// Handle history selection
const handleHistorySelect = (item: string) => {
  emit('update:modelValue', item)
  emit('search', item)
  addToHistory(item)
  showSuggestions.value = false
>>>>>>> fdff6bd (feat: implement advanced search with real-time suggestions and search history)
}

const clearSearch = () => {
  emit('update:modelValue', '')
  emit('search', '')
<<<<<<< HEAD
  suggestions.value = []
=======
>>>>>>> fdff6bd (feat: implement advanced search with real-time suggestions and search history)
  showSuggestions.value = false
}

const handleFocus = () => {
  // Update search history when input is focused
  searchHistory.value = getSearchHistory()
  showSuggestions.value = true
}

const handleBlur = () => {
  // Use a timeout to allow for click events on suggestions
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    showSuggestions.value = false
  } else if (event.key === 'Enter') {
    if (props.modelValue) {
      addSearchToHistory(props.modelValue)
    }
  }
}

const handleSuggestionSelect = (suggestion: any) => {
  emit('update:modelValue', suggestion.title)
  emit('search', suggestion.title)
  addSearchToHistory(suggestion.title)
  showSuggestions.value = false
}

const handleHistorySelect = (history: string) => {
  emit('update:modelValue', history)
  emit('search', history)
  showSuggestions.value = false
}

const handleClearHistory = () => {
  clearSearchHistory()
  searchHistory.value = []
}

const handleNavigate = (direction: 'up' | 'down') => {
  // This is handled by the SearchSuggestions component
  // but we can add additional logic here if needed
}

// Expose focus method to parent components
defineExpose({
  focus: () => searchInputRef.value?.focus(),
})
</script>
