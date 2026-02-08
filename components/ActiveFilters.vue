<template>
  <div
    v-if="hasActiveFilters"
    class="flex flex-wrap items-center gap-2 mb-4"
    role="region"
    aria-label="Active filters"
  >
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-500 font-medium">Active filters</span>
      <span
        class="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold bg-gray-200 text-gray-700 rounded-full"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ activeFilterCount }}
      </span>
    </div>

    <!-- Aria live region for filter removal announcements -->
    <div
      id="filter-announcements"
      class="sr-only"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ announcement }}
    </div>

    <TransitionGroup
      name="filter-chip"
      tag="div"
      class="flex flex-wrap items-center gap-2"
      @before-leave="handleBeforeLeave"
    >
      <!-- Search query chip -->
      <button
        v-if="searchQuery"
        key="search"
        class="filter-chip filter-chip-blue group"
        aria-label="Remove search query filter"
        @click="handleRemove('search', searchQuery, $event)"
      >
        <span class="truncate max-w-[200px]">{{ searchQuery }}</span>
        <span class="remove-icon" aria-hidden="true">
          <svg
            class="w-3.5 h-3.5 transition-transform duration-150 group-hover:rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
        <!-- Shimmer effect on hover -->
        <span class="shimmer-effect" aria-hidden="true" />
      </button>

      <!-- Category chips -->
      <button
        v-for="category in selectedCategories"
        :key="`cat-${category}`"
        class="filter-chip filter-chip-gray group"
        :aria-label="`Remove category filter: ${category}`"
        @click="handleRemove('category', category, $event)"
      >
        <span class="text-gray-500 mr-1.5">Category:</span>
        <span class="truncate max-w-[150px]">{{ category }}</span>
        <span class="remove-icon" aria-hidden="true">
          <svg
            class="w-3.5 h-3.5 transition-transform duration-150 group-hover:rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
        <span class="shimmer-effect" aria-hidden="true" />
      </button>

      <!-- Pricing model chips -->
      <button
        v-for="pricing in selectedPricingModels"
        :key="`price-${pricing}`"
        class="filter-chip filter-chip-green group"
        :aria-label="`Remove pricing filter: ${pricing}`"
        @click="handleRemove('pricing', pricing, $event)"
      >
        <span class="text-green-600 mr-1.5">Pricing:</span>
        <span class="truncate max-w-[150px]">{{ pricing }}</span>
        <span class="remove-icon" aria-hidden="true">
          <svg
            class="w-3.5 h-3.5 transition-transform duration-150 group-hover:rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
        <span class="shimmer-effect" aria-hidden="true" />
      </button>

      <!-- Difficulty chips -->
      <button
        v-for="difficulty in selectedDifficultyLevels"
        :key="`diff-${difficulty}`"
        class="filter-chip filter-chip-purple group"
        :aria-label="`Remove difficulty filter: ${difficulty}`"
        @click="handleRemove('difficulty', difficulty, $event)"
      >
        <span class="text-purple-600 mr-1.5">Difficulty:</span>
        <span class="truncate max-w-[150px]">{{ difficulty }}</span>
        <span class="remove-icon" aria-hidden="true">
          <svg
            class="w-3.5 h-3.5 transition-transform duration-150 group-hover:rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
        <span class="shimmer-effect" aria-hidden="true" />
      </button>

      <!-- Technology chips -->
      <button
        v-for="tech in selectedTechnologies"
        :key="`tech-${tech}`"
        class="filter-chip filter-chip-orange group"
        :aria-label="`Remove technology filter: ${tech}`"
        @click="handleRemove('technology', tech, $event)"
      >
        <span class="text-orange-600 mr-1.5">Tech:</span>
        <span class="truncate max-w-[150px]">{{ tech }}</span>
        <span class="remove-icon" aria-hidden="true">
          <svg
            class="w-3.5 h-3.5 transition-transform duration-150 group-hover:rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
        <span class="shimmer-effect" aria-hidden="true" />
      </button>

      <!-- Tag chips -->
      <button
        v-for="tag in selectedTags"
        :key="`tag-${tag}`"
        class="filter-chip filter-chip-pink group"
        :aria-label="`Remove tag filter: ${tag}`"
        @click="handleRemove('tag', tag, $event)"
      >
        <span class="text-pink-600 mr-1.5">Tag:</span>
        <span class="truncate max-w-[150px]">{{ tag }}</span>
        <span class="remove-icon" aria-hidden="true">
          <svg
            class="w-3.5 h-3.5 transition-transform duration-150 group-hover:rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
        <span class="shimmer-effect" aria-hidden="true" />
      </button>

      <!-- Benefit chips -->
      <button
        v-for="benefit in selectedBenefits"
        :key="`benefit-${benefit}`"
        class="filter-chip filter-chip-teal group"
        :aria-label="`Remove benefit filter: ${benefit}`"
        @click="handleRemove('benefit', benefit, $event)"
      >
        <span class="text-teal-600 mr-1.5">Benefit:</span>
        <span class="truncate max-w-[150px]">{{ benefit }}</span>
        <span class="remove-icon" aria-hidden="true">
          <svg
            class="w-3.5 h-3.5 transition-transform duration-150 group-hover:rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
        <span class="shimmer-effect" aria-hidden="true" />
      </button>

      <!-- Date range chip -->
      <button
        v-if="selectedDateRange && selectedDateRange !== 'anytime'"
        key="date"
        class="filter-chip filter-chip-indigo group"
        aria-label="Remove date filter"
        @click="handleRemove('date', selectedDateRange, $event)"
      >
        <span class="text-indigo-600 mr-1.5">Date:</span>
        <span>{{ formatDateRange(selectedDateRange) }}</span>
        <span class="remove-icon" aria-hidden="true">
          <svg
            class="w-3.5 h-3.5 transition-transform duration-150 group-hover:rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
        <span class="shimmer-effect" aria-hidden="true" />
      </button>
    </TransitionGroup>

    <!-- Clear all button with keyboard shortcut hint -->
    <button
      class="group ml-2 text-sm text-gray-500 hover:text-gray-700 underline focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 rounded px-1 transition-colors"
      aria-label="Clear all filters (press Escape to clear all)"
      @click="handleClearAll"
    >
      <span>Clear all</span>
      <kbd
        class="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded group-hover:bg-gray-200 transition-colors"
        aria-hidden="true"
        >Esc</kbd
      >
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  searchQuery?: string
  selectedCategories: string[]
  selectedPricingModels: string[]
  selectedDifficultyLevels: string[]
  selectedTechnologies: string[]
  selectedTags: string[]
  selectedBenefits: string[]
  selectedDateRange?: string
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: '',
  selectedDateRange: 'anytime',
})

const emit = defineEmits<{
  'clear-search': []
  'toggle-category': [category: string]
  'toggle-pricing-model': [pricing: string]
  'toggle-difficulty-level': [difficulty: string]
  'toggle-technology': [tech: string]
  'toggle-tag': [tag: string]
  'toggle-benefit': [benefit: string]
  'clear-date-range': []
  'reset-filters': []
}>()

// Announcement state for screen readers
const announcement = ref('')

// Track removing chips for animation (used in future undo feature)
const _removingChips = ref<Set<string>>(new Set())

const hasActiveFilters = computed(() => {
  return (
    props.searchQuery ||
    props.selectedCategories.length > 0 ||
    props.selectedPricingModels.length > 0 ||
    props.selectedDifficultyLevels.length > 0 ||
    props.selectedTechnologies.length > 0 ||
    props.selectedTags.length > 0 ||
    props.selectedBenefits.length > 0 ||
    (props.selectedDateRange && props.selectedDateRange !== 'anytime')
  )
})

const activeFilterCount = computed(() => {
  let count = 0
  if (props.searchQuery) count++
  count += props.selectedCategories.length
  count += props.selectedPricingModels.length
  count += props.selectedDifficultyLevels.length
  count += props.selectedTechnologies.length
  count += props.selectedTags.length
  count += props.selectedBenefits.length
  if (props.selectedDateRange && props.selectedDateRange !== 'anytime') count++
  return count
})

const formatDateRange = (range: string): string => {
  const dateLabels: Record<string, string> = {
    lastWeek: 'Last week',
    lastMonth: 'Last month',
    lastYear: 'Last year',
  }
  return dateLabels[range] || range
}

const handleRemove = (type: string, value: string, _event: Event) => {
  // Add haptic feedback
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(10)
  }

  // Announce to screen readers
  const remainingCount = activeFilterCount.value - 1
  announcement.value = `${type} filter removed. ${remainingCount} filter${remainingCount !== 1 ? 's' : ''} active.`

  // Clear announcement after screen reader has time to read it
  setTimeout(() => {
    announcement.value = ''
  }, 1000)

  // Emit the appropriate event
  switch (type) {
    case 'search':
      emit('clear-search')
      break
    case 'category':
      emit('toggle-category', value)
      break
    case 'pricing':
      emit('toggle-pricing-model', value)
      break
    case 'difficulty':
      emit('toggle-difficulty-level', value)
      break
    case 'technology':
      emit('toggle-technology', value)
      break
    case 'tag':
      emit('toggle-tag', value)
      break
    case 'benefit':
      emit('toggle-benefit', value)
      break
    case 'date':
      emit('clear-date-range')
      break
  }
}

const handleClearAll = () => {
  // Announce to screen readers
  announcement.value = 'All filters cleared.'

  // Clear announcement after screen reader has time to read it
  setTimeout(() => {
    announcement.value = ''
  }, 1000)

  emit('reset-filters')
}

// Handle before leave to fix layout shift during transition
const handleBeforeLeave = (el: Element) => {
  const htmlEl = el as HTMLElement
  const { width, height } = htmlEl.getBoundingClientRect()
  htmlEl.style.width = `${width}px`
  htmlEl.style.height = `${height}px`
}
</script>

<style scoped>
/* Filter chip base styles */
.filter-chip {
  @apply relative inline-flex items-center px-3 py-1.5 text-sm rounded-full border transition-all duration-200 ease-out overflow-hidden;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-1;
}

/* Remove icon container */
.remove-icon {
  @apply ml-2 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity;
}

/* Shimmer effect on hover */
.shimmer-effect {
  @apply absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Color variants */
.filter-chip-blue {
  @apply bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 focus:ring-blue-500;
}

.filter-chip-gray {
  @apply bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 focus:ring-gray-500;
}

.filter-chip-green {
  @apply bg-green-50 text-green-700 border-green-200 hover:bg-green-100 focus:ring-green-500;
}

.filter-chip-purple {
  @apply bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 focus:ring-purple-500;
}

.filter-chip-orange {
  @apply bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 focus:ring-orange-500;
}

.filter-chip-pink {
  @apply bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 focus:ring-pink-500;
}

.filter-chip-teal {
  @apply bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 focus:ring-teal-500;
}

.filter-chip-indigo {
  @apply bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 focus:ring-indigo-500;
}

/* Vue Transition Group animations */
.filter-chip-enter-active,
.filter-chip-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-chip-enter-from {
  opacity: 0;
  transform: scale(0.85) translateY(-8px);
}

.filter-chip-leave-to {
  opacity: 0;
  transform: scale(0.85) translateX(-12px);
}

.filter-chip-leave-active {
  position: absolute;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .filter-chip,
  .remove-icon,
  .shimmer-effect {
    transition: none !important;
    animation: none !important;
  }

  .filter-chip-enter-active,
  .filter-chip-leave-active {
    transition: opacity 0.1s ease-out !important;
  }

  .filter-chip-enter-from,
  .filter-chip-leave-to {
    transform: none !important;
  }

  .shimmer-effect {
    display: none;
  }
}

/* Focus styles enhancement */
.filter-chip:focus-visible {
  @apply ring-2 ring-offset-1;
}

/* Active state for tactile feedback */
.filter-chip:active {
  transform: scale(0.96);
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
</style>
