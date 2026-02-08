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
          />
        </svg>
      </div>
      <input
        id="search-input"
        ref="searchInputRef"
        type="search"
        :value="modelValue"
        class="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus-visible:ring-offset-2 focus-visible:ring-blue-600 hover:border-gray-400"
        :placeholder="contentConfig.search.placeholder"
        :aria-label="`Search resources (Press ${uiConfig.keyboard.searchShortcut} to focus)`"
        aria-describedby="search-results-info search-shortcut-hint"
        :aria-expanded="
          showSuggestions &&
          (suggestions.length > 0 || searchHistory.length > 0)
        "
        aria-controls="search-suggestions-dropdown"
        aria-autocomplete="list"
        @input="handleInput"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <!-- Keyboard shortcut hint -->
      <div
        v-if="!modelValue && !isFocused"
        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none group"
      >
        <kbd
          class="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-md shadow-sm transition-all duration-150 group-hover:bg-gray-100 group-hover:border-gray-300 group-hover:shadow"
          aria-hidden="true"
        >
          {{ uiConfig.keyboard.searchShortcut }}
        </kbd>
      </div>
      <div
        v-if="modelValue"
        class="absolute inset-y-0 right-0 flex items-center pr-3"
      >
        <button
          class="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-150 rounded-full p-0.5 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500"
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
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Search Suggestions Dropdown -->
    <ClientOnly>
      <LazySearchSuggestions
        v-if="
          showSuggestions &&
          (suggestions.length > 0 || searchHistory.length > 0)
        "
        id="search-suggestions-dropdown"
        :suggestions="suggestions"
        :search-history="searchHistory"
        :visible="showSuggestions"
        :focused-index="activeIndex"
        @select-suggestion="handleSuggestionSelect"
        @select-history="handleHistorySelect"
        @clear-history="handleClearHistory"
      />
    </ClientOnly>

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
import { ref, computed, onUnmounted } from 'vue'
import { useResources } from '~/composables/useResources'
import { useAdvancedResourceSearch } from '~/composables/useAdvancedResourceSearch'
import { useResourceData } from '~/composables/useResourceData'
import { UI_TIMING, SEARCH_CONFIG } from '~/server/utils/constants'
import { contentConfig } from '~/configs/content.config'
import { uiConfig } from '~/configs/ui.config'
import { searchConfig } from '~/configs/search.config'

interface Props {
  modelValue: string
  debounceTime?: number
  enableAdvancedFeatures?: boolean
}

interface Emits {
  (event: 'update:modelValue', value: string): void
  (event: 'search', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  debounceTime: UI_TIMING.SEARCH_DEBOUNCE_MS,
  enableAdvancedFeatures: true,
})
const emit = defineEmits<Emits>()

// Reactive variables
const searchInputRef = ref<HTMLInputElement>()
const inputTimeout = ref<ReturnType<typeof setTimeout> | number>()
const debouncedQuery = ref('')
const suggestions = ref<
  Array<{ id: string; title: string; description: string; url: string }>
>([])
const showSuggestions = ref(false)
const searchHistory = ref<string[]>([])
const isFocused = ref(false)
const activeIndex = ref(-1)

// Use the resources composable
const { resources } = useResourceData()
const { getAdvancedSuggestions, addToSearchHistory } =
  useAdvancedResourceSearch(resources.value)

// Use the basic resources composable for fallback
const { getSuggestions: getBasicSuggestions } = useResources()

// Handle input with debounce
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value

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
  }, props.debounceTime)
}

// Update suggestions based on input
const updateSuggestions = (query: string) => {
  if (query && query.length >= SEARCH_CONFIG.MIN_QUERY_LENGTH) {
    // Use advanced suggestions if enabled, otherwise use basic suggestions
    const suggestionsData = props.enableAdvancedFeatures
      ? getAdvancedSuggestions(query, SEARCH_CONFIG.MAX_SUGGESTIONS)
      : getBasicSuggestions(query, SEARCH_CONFIG.MAX_SUGGESTIONS)

    suggestions.value = suggestionsData.map(resource => ({
      id: resource.id,
      title: resource.title,
      description:
        resource.description.substring(
          0,
          searchConfig.behavior.descriptionTruncateLength
        ) +
        (resource.description.length >
        searchConfig.behavior.descriptionTruncateLength
          ? '...'
          : ''),
      url: resource.url,
    }))
  } else {
    suggestions.value = []
  }
}

const clearSearch = () => {
  emit('update:modelValue', '')
  emit('search', '')
  suggestions.value = []
  showSuggestions.value = false
  activeIndex.value = -1
}

const handleFocus = () => {
  showSuggestions.value = true
  isFocused.value = true
  activeIndex.value = -1
}

const handleBlur = () => {
  // Use a timeout to allow for click events on suggestions
  setTimeout(() => {
    showSuggestions.value = false
    isFocused.value = false
  }, UI_TIMING.SEARCH_BLUR_DELAY_MS)
}

// Compute total navigable items (suggestions + history)
const totalItems = computed(() => {
  return suggestions.value.length + searchHistory.value.length
})

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    showSuggestions.value = false
    activeIndex.value = -1
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (showSuggestions.value && totalItems.value > 0) {
      activeIndex.value = (activeIndex.value + 1) % totalItems.value
    }
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (showSuggestions.value && totalItems.value > 0) {
      activeIndex.value =
        activeIndex.value <= 0 ? totalItems.value - 1 : activeIndex.value - 1
    }
  } else if (event.key === 'Enter') {
    if (activeIndex.value >= 0 && totalItems.value > 0) {
      // Select the active item
      const suggestionCount = suggestions.value.length
      if (activeIndex.value < suggestionCount) {
        // It's a suggestion
        handleSuggestionSelect(suggestions.value[activeIndex.value])
      } else {
        // It's from history
        const historyIndex = activeIndex.value - suggestionCount
        handleHistorySelect(searchHistory.value[historyIndex])
      }
    } else if (props.modelValue) {
      addToSearchHistory(props.modelValue)
    }
    activeIndex.value = -1
  }
}

const handleSuggestionSelect = (suggestion: {
  id: string
  title: string
  description: string
  url: string
}) => {
  emit('update:modelValue', suggestion.title)
  emit('search', suggestion.title)
  addToSearchHistory(suggestion.title)
  showSuggestions.value = false
  activeIndex.value = -1
}

const handleHistorySelect = (history: string) => {
  emit('update:modelValue', history)
  emit('search', history)
  addToSearchHistory(history)
  showSuggestions.value = false
  activeIndex.value = -1
}

const handleClearHistory = () => {
  // Clear both advanced and basic search history
  // Since we're using advanced search, we'll just update our local ref
  searchHistory.value = []
}

// Expose focus method to parent components
defineExpose({
  focus: () => searchInputRef.value?.focus(),
})

// Listen for saved search events to show notifications
if (typeof window !== 'undefined') {
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    // Create a custom event to trigger toast notifications
    window.dispatchEvent(
      new CustomEvent('show-toast', {
        detail: { message, type },
      })
    )
  }

  // Define custom event handler type
  type CustomEventHandler = (event: Event) => void

  const savedSearchAddedHandler: CustomEventHandler = event => {
    const { name } = (event as CustomEvent).detail
    showToast(`Saved search "${name}" successfully!`, 'success')
  }

  const savedSearchUpdatedHandler: CustomEventHandler = event => {
    const { name } = (event as CustomEvent).detail
    showToast(`Updated saved search "${name}"!`, 'success')
  }

  const savedSearchRemovedHandler: CustomEventHandler = event => {
    const { name } = (event as CustomEvent).detail
    showToast(`Removed saved search "${name}".`, 'info')
  }

  // Keyboard shortcut handler - Press configured shortcut to focus search
  const handleSlashKey = (event: KeyboardEvent) => {
    // Only trigger if the configured shortcut is pressed and no input/textarea is focused
    if (
      event.key === uiConfig.keyboard.searchShortcut &&
      !isFocused.value &&
      !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)
    ) {
      event.preventDefault()
      searchInputRef.value?.focus()
    }
  }

  // Add event listeners
  window.addEventListener('saved-search-added', savedSearchAddedHandler)
  window.addEventListener('saved-search-updated', savedSearchUpdatedHandler)
  window.addEventListener('saved-search-removed', savedSearchRemovedHandler)
  window.addEventListener('keydown', handleSlashKey)

  // Clean up event listeners on component unmount
  onUnmounted(() => {
    window.removeEventListener('saved-search-added', savedSearchAddedHandler)
    window.removeEventListener(
      'saved-search-updated',
      savedSearchUpdatedHandler
    )
    window.removeEventListener(
      'saved-search-removed',
      savedSearchRemovedHandler
    )
    window.removeEventListener('keydown', handleSlashKey)
  })
}
</script>
