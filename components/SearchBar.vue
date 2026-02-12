<template>
  <div
    class="relative w-full max-w-2xl"
    :style="{
      '--focus-ring-color': focusRingColors.color,
      '--focus-ring-opacity-start': focusRingColors.opacityStart,
      '--focus-ring-opacity-mid': focusRingColors.opacityMid,
      '--focus-ring-opacity-end': focusRingColors.opacityEnd,
      '--focus-ring-offset-small': `${focusRingColors.offsetSmall}px`,
      '--focus-ring-offset-large': `${focusRingColors.offsetLarge}px`,
      '--shortcut-success-color': shortcutSuccessColors.successColor,
      '--shortcut-success-color-alpha': shortcutSuccessColors.successColorAlpha,
      '--shortcut-default-bg': shortcutSuccessColors.defaultBgColor,
      '--shortcut-default-text': shortcutSuccessColors.defaultTextColor,
      '--shortcut-default-border': shortcutSuccessColors.defaultBorderColor,
      '--shortcut-peak-scale': shortcutSuccessColors.peakScale,
      '--shortcut-shadow-spread-start': `${shortcutSuccessColors.shadowSpreadStart}px`,
      '--shortcut-shadow-spread-mid': `${shortcutSuccessColors.shadowSpreadMid}px`,
      '--focus-pulse-duration': animationDurations.focusPulse,
      '--idle-pulse-duration': animationDurations.idlePulse,
      '--idle-pulse-iterations': animationDurations.idlePulseIterations,
      '--shortcut-success-duration': animationDurations.shortcutSuccess,
      '--search-complete-duration': animationDurations.searchComplete,
    }"
  >
    <div class="relative">
      <div
        class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
      >
        <!-- Loading spinner shown during debounce -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-75"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-75"
          mode="out-in"
        >
          <svg
            v-if="isSearching"
            key="loading"
            :class="[
              'w-5 h-5 animate-spin',
              componentColorsConfig.searchBar.loadingIcon,
            ]"
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
          <!-- Success checkmark shown briefly after search completes -->
          <svg
            v-else-if="showSearchComplete"
            key="success"
            :class="[
              'w-5 h-5 animate-search-complete',
              componentColorsConfig.searchBar.successIcon,
            ]"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <!-- Search icon shown when not searching -->
          <svg
            v-else
            key="search"
            :class="['w-5 h-5', componentColorsConfig.searchBar.defaultIcon]"
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
        </Transition>
      </div>
      <input
        id="search-input"
        ref="searchInputRef"
        type="search"
        role="combobox"
        aria-haspopup="listbox"
        :value="modelValue"
        class="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus-visible:ring-offset-2 focus-visible:ring-blue-600 hover:border-gray-400 focus:shadow-lg focus:-translate-y-0.5"
        :class="{
          'placeholder:text-gray-300': isSearching,
          'animate-focus-pulse': showFocusPulse,
        }"
        :placeholder="contentConfig.search.placeholder"
        :aria-label="contentConfig.search.ariaLabel"
        aria-describedby="search-results-info search-shortcut-hint"
        :aria-expanded="showSuggestions"
        aria-controls="search-suggestions-dropdown"
        aria-autocomplete="list"
        @input="handleInput"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
      >
      <!-- Keyboard shortcut hint with idle pulse animation -->
      <div
        v-if="!modelValue && !isFocused"
        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
      >
        <kbd
          :class="[
            'hidden sm:inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-md shadow-sm transition-all duration-200 ease-out',
            'hover:bg-gray-100 hover:border-gray-300 hover:shadow-md hover:scale-105',
            showIdlePulse && !prefersReducedMotion ? 'animate-idle-pulse' : '',
            showShortcutSuccess && !prefersReducedMotion
              ? 'animate-shortcut-success'
              : '',
          ]"
          aria-hidden="true"
          :title="contentConfig.searchExtra.tooltip.focus"
        >
          /
        </kbd>
      </div>

      <!-- Enhanced focus glow effect - Palette's micro-UX enhancement! -->
      <div
        v-if="showFocusGlow && !prefersReducedMotion"
        class="absolute inset-0 rounded-lg pointer-events-none animate-focus-glow"
        aria-hidden="true"
      />

      <transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 scale-75"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-75"
      >
        <Tooltip
          v-if="modelValue"
          :content="contentConfig.searchExtra.tooltip.clear"
          position="bottom"
          :delay="animationConfig.tooltip.showDelayMs"
        >
          <button
            ref="clearButtonRef"
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none transition-all duration-200 ease-out rounded-full p-0.5 hover:bg-gray-100 hover:rotate-90 focus:ring-2 focus:ring-blue-500 active:scale-90"
            :aria-label="contentConfig.search.clearAriaLabel"
            :aria-keyshortcuts="'Escape'"
            @click="clearSearch"
            @keydown.enter.prevent="clearSearch"
            @keydown.space.prevent="clearSearch"
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
        </Tooltip>
      </transition>
    </div>

    <!-- Search Suggestions Dropdown -->
    <ClientOnly>
      <LazySearchSuggestions
        v-if="showSuggestions"
        id="search-suggestions-dropdown"
        :suggestions="suggestions"
        :search-history="searchHistory"
        :visible="showSuggestions"
        :focused-index="activeIndex"
        :has-query="!!props.modelValue"
        :is-loading="isSearching"
        @select-suggestion="handleSuggestionSelect"
        @select-history="handleHistorySelect"
        @clear-history="handleClearHistory"
        @clear-search="clearSearch"
        @select-default-suggestion="handleDefaultSuggestionSelect"
      />
    </ClientOnly>

    <!-- ARIA live region for search results information -->
    <div
      id="search-results-info"
      role="status"
      aria-live="polite"
      class="sr-only"
    >
      <span v-if="isSearching">{{ contentConfig.searchExtra.searching }}</span>
      <span v-else>{{ contentConfig.searchExtra.autoUpdateMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, nextTick } from 'vue'
import { useResources } from '~/composables/useResources'
import { useAdvancedResourceSearch } from '~/composables/useAdvancedResourceSearch'
import { useResourceData } from '~/composables/useResourceData'
import Tooltip from '~/components/Tooltip.vue'
import { animationConfig } from '~/configs/animation.config'
import { contentConfig } from '~/configs/content.config'
import { searchConfig } from '~/configs/search.config'
import { uiConfig } from '~/configs/ui.config'
import { componentColorsConfig } from '~/configs/component-colors.config'

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
  debounceTime: searchConfig.behavior.debounceMs,
  enableAdvancedFeatures: true,
})
const emit = defineEmits<Emits>()

// Reactive variables
const searchInputRef = ref<HTMLInputElement>()
const clearButtonRef = ref<HTMLButtonElement>()
const inputTimeout = ref<ReturnType<typeof setTimeout> | number>()
const debouncedQuery = ref('')
const suggestions = ref<
  Array<{ id: string; title: string; description: string; url: string }>
>([])
const showSuggestions = ref(false)
const searchHistory = ref<string[]>([])
const isFocused = ref(false)
const activeIndex = ref(-1)
const isSearching = ref(false)
const showFocusPulse = ref(false)
const showIdlePulse = ref(false)
const showShortcutSuccess = ref(false)
const showSearchComplete = ref(false)
const showFocusGlow = ref(false)
const prefersReducedMotion = ref(false)
let idlePulseTimeout: ReturnType<typeof setTimeout> | null = null
let shortcutSuccessTimeout: ReturnType<typeof setTimeout> | null = null
// Additional timeouts for cleanup - preventing memory leaks (Issue #1825)
let focusPulseTimeout: ReturnType<typeof setTimeout> | null = null
let focusGlowTimeout: ReturnType<typeof setTimeout> | null = null
let searchCompleteTimeout: ReturnType<typeof setTimeout> | null = null

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

  // Show searching state for immediate feedback
  isSearching.value = true
  showSearchComplete.value = false

  // Debounce the search to avoid constant updates
  if (inputTimeout.value) {
    clearTimeout(inputTimeout.value)
  }

  inputTimeout.value = setTimeout(() => {
    debouncedQuery.value = value
    updateSuggestions(value)
    emit('search', value)
    isSearching.value = false

    // Show search complete indicator for positive feedback
    // Only show when there's actual input to provide meaningful feedback
    if (value.length > 0 && !prefersReducedMotion.value) {
      showSearchComplete.value = true
      if (searchCompleteTimeout) {
        clearTimeout(searchCompleteTimeout)
      }
      searchCompleteTimeout = setTimeout(() => {
        showSearchComplete.value = false
      }, uiConfig.timing.searchCompleteDurationMs)
    }
  }, props.debounceTime)
}

// Update suggestions based on input
const updateSuggestions = (query: string) => {
  if (query && query.length >= searchConfig.behavior.minQueryLength) {
    // Use advanced suggestions if enabled, otherwise use basic suggestions
    const suggestionsData = props.enableAdvancedFeatures
      ? getAdvancedSuggestions(query, searchConfig.behavior.maxSuggestions)
      : getBasicSuggestions(query, searchConfig.behavior.maxSuggestions)

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
  isSearching.value = false

  // Return focus to search input for seamless keyboard navigation
  nextTick(() => {
    searchInputRef.value?.focus()
  })
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
  }, searchConfig.behavior.blurDelayMs)
}

// Compute total navigable items (suggestions + history)
const totalItems = computed(() => {
  return suggestions.value.length + searchHistory.value.length
})

// Flexy hates hardcoded colors! Using config values for focus ring colors
const focusRingColors = computed(() => {
  const config = componentColorsConfig.focusRing
  return {
    color: config.color,
    opacityStart: config.opacityStart,
    opacityMid: config.opacityMid,
    opacityEnd: config.opacityEnd,
    offsetSmall: config.offsetSmall,
    offsetLarge: config.offsetLarge,
  }
})

// Flexy hates hardcoded CSS keyframe colors! Using config values for shortcut success animation
const shortcutSuccessColors = computed(() => {
  const config = animationConfig.searchShortcut
  return {
    successColor: config.successColor,
    successColorAlpha: config.successColorAlpha,
    defaultBgColor: config.defaultBgColor,
    defaultTextColor: config.defaultTextColor,
    defaultBorderColor: config.defaultBorderColor,
    peakScale: config.peakScale,
    shadowSpreadStart: config.shadowSpreadStart,
    shadowSpreadMid: config.shadowSpreadMid,
  }
})

// Flexy hates hardcoded animation durations! Using config values for CSS animations
const animationDurations = computed(() => {
  return {
    focusPulse: `${animationConfig.focus.pulseDurationMs}ms`,
    idlePulse: `${animationConfig.focusGlow.durationMs}ms`,
    idlePulseIterations: '3',
    shortcutSuccess: `${animationConfig.searchShortcut.durationMs}ms`,
    searchComplete: `${animationConfig.card.enterDurationMs}ms`,
  }
})

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (showSuggestions.value) {
      // First Escape press closes suggestions
      showSuggestions.value = false
      activeIndex.value = -1
    } else if (props.modelValue) {
      // Second Escape press (or when no suggestions) clears the search
      clearSearch()
    }
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

const handleDefaultSuggestionSelect = (suggestion: string) => {
  emit('update:modelValue', suggestion)
  emit('search', suggestion)
  addToSearchHistory(suggestion)
  showSuggestions.value = false
  activeIndex.value = -1
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
    showToast(
      contentConfig.toast.savedSearch.added.replace('{{name}}', name),
      'success'
    )
  }

  const savedSearchUpdatedHandler: CustomEventHandler = event => {
    const { name } = (event as CustomEvent).detail
    showToast(
      contentConfig.toast.savedSearch.updated.replace('{{name}}', name),
      'success'
    )
  }

  const savedSearchRemovedHandler: CustomEventHandler = event => {
    const { name } = (event as CustomEvent).detail
    showToast(
      contentConfig.toast.savedSearch.removed.replace('{{name}}', name),
      'info'
    )
  }

  // Keyboard shortcut handler - Press "/" to focus search
  const handleSlashKey = (event: KeyboardEvent) => {
    // Only trigger if "/" is pressed and no input/textarea is focused
    if (
      event.key === '/' &&
      !isFocused.value &&
      !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)
    ) {
      event.preventDefault()
      searchInputRef.value?.focus()

      // Check for reduced motion preference
      const userPrefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      // Trigger focus pulse animation for visual feedback (skip if reduced motion)
      if (!userPrefersReducedMotion) {
        showFocusPulse.value = true
        // Tracked for cleanup - preventing memory leaks (Issue #1825)
        if (focusPulseTimeout) clearTimeout(focusPulseTimeout)
        focusPulseTimeout = setTimeout(() => {
          showFocusPulse.value = false
        }, uiConfig.timing.focusPulseDurationMs)

        // Show shortcut success glow animation for positive reinforcement
        showShortcutSuccess.value = true
        if (shortcutSuccessTimeout) {
          clearTimeout(shortcutSuccessTimeout)
        }
        shortcutSuccessTimeout = setTimeout(() => {
          showShortcutSuccess.value = false
        }, uiConfig.timing.shortcutSuccessDurationMs)

        // Trigger enhanced focus glow effect - Palette's micro-UX enhancement!
        // Tracked for cleanup - preventing memory leaks (Issue #1825)
        showFocusGlow.value = true
        if (focusGlowTimeout) clearTimeout(focusGlowTimeout)
        focusGlowTimeout = setTimeout(() => {
          showFocusGlow.value = false
        }, animationConfig.focusGlow.durationMs)
      }

      // Stop idle pulse animation when user knows the shortcut
      showIdlePulse.value = false
      if (idlePulseTimeout) {
        clearTimeout(idlePulseTimeout)
      }
    }
  }

  // Check for reduced motion preference on mount (safely for test environments)
  let mediaQuery: MediaQueryList | null = null
  let handleReducedMotionChange: ((e: MediaQueryListEvent) => void) | null =
    null

  if (typeof window !== 'undefined' && window.matchMedia) {
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches

    // Listen for changes in reduced motion preference
    handleReducedMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleReducedMotionChange)
  }

  // Start idle pulse timer after 3 seconds if user hasn't interacted
  // This helps discoverability of the "/" shortcut
  idlePulseTimeout = setTimeout(() => {
    if (!isFocused.value && !props.modelValue && !prefersReducedMotion.value) {
      showIdlePulse.value = true
    }
  }, uiConfig.timing.idlePulseDelayMs)

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
    if (mediaQuery && handleReducedMotionChange) {
      mediaQuery.removeEventListener('change', handleReducedMotionChange)
    }
    if (idlePulseTimeout) {
      clearTimeout(idlePulseTimeout)
    }
    if (shortcutSuccessTimeout) {
      clearTimeout(shortcutSuccessTimeout)
    }
    // Clean up additional timeouts - preventing memory leaks (Issue #1825)
    if (focusPulseTimeout) {
      clearTimeout(focusPulseTimeout)
    }
    if (focusGlowTimeout) {
      clearTimeout(focusGlowTimeout)
    }
    if (searchCompleteTimeout) {
      clearTimeout(searchCompleteTimeout)
    }
  })
}
</script>

<style scoped>
/* Focus pulse animation for keyboard shortcut feedback - Flexy hates hardcoded colors! */
@keyframes focus-pulse {
  0% {
    box-shadow: 0 0 0 0
      rgba(var(--focus-ring-color), var(--focus-ring-opacity-start));
  }
  50% {
    box-shadow: 0 0 0 var(--focus-ring-offset-large)
      rgba(var(--focus-ring-color), var(--focus-ring-opacity-end));
  }
  100% {
    box-shadow: 0 0 0 0
      rgba(var(--focus-ring-color), var(--focus-ring-opacity-end));
  }
}

.animate-focus-pulse {
  /* Flexy hates hardcoded values! Using config from animationConfig.focus.pulseDurationMs */
  animation: focus-pulse var(--focus-pulse-duration) ease-out;
}

/* Idle pulse animation for keyboard shortcut discoverability - Flexy hates hardcoded colors! */
@keyframes idle-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0
      rgba(var(--focus-ring-color), var(--focus-ring-opacity-end));
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 var(--focus-ring-offset-small)
      rgba(var(--focus-ring-color), var(--focus-ring-opacity-mid));
    transform: scale(1.1);
  }
}

.animate-idle-pulse {
  animation: idle-pulse var(--idle-pulse-duration) ease-in-out
    var(--idle-pulse-iterations);
}

/* Success glow animation when user uses keyboard shortcut */
/* Provides positive reinforcement and delightful micro-interaction */
/* Flexy loves CSS custom properties - no more hardcoded colors! */
@keyframes shortcut-success {
  0% {
    box-shadow: 0 0 0 var(--shortcut-shadow-spread-start)
      rgba(var(--shortcut-success-color-alpha));
    transform: scale(1);
    background-color: rgb(var(--shortcut-success-color));
    color: white;
    border-color: rgb(var(--shortcut-success-color));
  }
  30% {
    box-shadow: 0 0 0 var(--shortcut-shadow-spread-mid)
      rgba(var(--shortcut-success-color), 0);
    transform: scale(var(--shortcut-peak-scale));
  }
  50% {
    background-color: rgb(var(--shortcut-success-color));
    color: white;
    border-color: rgb(var(--shortcut-success-color));
  }
  100% {
    box-shadow: 0 0 0 var(--shortcut-shadow-spread-start)
      rgba(var(--shortcut-success-color), 0);
    transform: scale(1);
    background-color: rgb(var(--shortcut-default-bg));
    color: rgb(var(--shortcut-default-text));
    border-color: rgb(var(--shortcut-default-border));
  }
}

.animate-shortcut-success {
  animation: shortcut-success var(--shortcut-success-duration) ease-out forwards;
}

/* Search complete animation - provides positive feedback when search finishes */
/* Draws attention to the completion state with a satisfying pop effect */
.animate-search-complete {
  animation: search-complete var(--search-complete-duration)
    cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes search-complete {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Respect reduced motion preferences for accessibility */
@media (prefers-reduced-motion: reduce) {
  input {
    transition: none !important;
    transform: none !important;
  }

  kbd {
    transition: none !important;
    transform: none !important;
  }

  button {
    transition: none !important;
    transform: none !important;
  }

  .animate-focus-pulse,
  .animate-idle-pulse {
    animation: none !important;
  }
}

/* Enhanced focus glow animation - Palette's micro-UX enhancement!
   Provides a subtle pulsing glow effect around the search input
   when triggered via keyboard shortcut for better visibility */
.animate-focus-glow {
  animation: focus-glow-pulse v-bind('animationConfig.focusGlow.durationSec')
    ease-in-out;
  box-shadow:
    0 0 v-bind('animationConfig.focusGlow.spreadMin + "px"')
      v-bind('animationConfig.focusGlow.color'),
    0 0 v-bind('animationConfig.focusGlow.spreadMax + "px"')
      v-bind('animationConfig.focusGlow.secondaryColor');
}

@keyframes focus-glow-pulse {
  0%,
  100% {
    box-shadow: 0 0 v-bind('animationConfig.focusGlow.spreadMin + "px"')
      v-bind('animationConfig.focusGlow.color');
    opacity: 0.6;
  }
  50% {
    box-shadow:
      0 0 v-bind('animationConfig.focusGlow.spreadMax + "px"')
        v-bind('animationConfig.focusGlow.color'),
      0 0 calc(v-bind('animationConfig.focusGlow.spreadMax + "px"') * 1.5)
        v-bind('animationConfig.focusGlow.secondaryColor');
    opacity: 1;
  }
}

/* Reduced motion support for focus glow */
@media (prefers-reduced-motion: reduce) {
  .animate-focus-glow {
    animation: none !important;
    display: none !important;
  }
}
</style>
