<template>
  <div
    v-if="hasActiveFilters"
    class="flex flex-wrap items-center gap-2 mb-4"
    role="region"
    aria-label="Active filters"
  >
    <span class="text-sm text-gray-500 font-medium">Active filters:</span>

    <!-- Search query chip -->
    <button
      v-if="searchQuery"
      class="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
      aria-label="Remove search query filter"
      @click="$emit('clear-search')"
    >
      <span class="truncate max-w-[200px]">{{ searchQuery }}</span>
      <svg
        class="w-3.5 h-3.5 ml-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
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

    <!-- Category chips -->
    <button
      v-for="category in selectedCategories"
      :key="`cat-${category}`"
      class="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full border border-gray-200 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500"
      :aria-label="`Remove category filter: ${category}`"
      @click="$emit('toggle-category', category)"
    >
      <span class="text-gray-500 mr-1.5">Category:</span>
      <span class="truncate max-w-[150px]">{{ category }}</span>
      <svg
        class="w-3.5 h-3.5 ml-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
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

    <!-- Pricing model chips -->
    <button
      v-for="pricing in selectedPricingModels"
      :key="`price-${pricing}`"
      class="inline-flex items-center px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-full border border-green-200 hover:bg-green-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500"
      :aria-label="`Remove pricing filter: ${pricing}`"
      @click="$emit('toggle-pricing-model', pricing)"
    >
      <span class="text-green-600 mr-1.5">Pricing:</span>
      <span class="truncate max-w-[150px]">{{ pricing }}</span>
      <svg
        class="w-3.5 h-3.5 ml-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
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

    <!-- Difficulty chips -->
    <button
      v-for="difficulty in selectedDifficultyLevels"
      :key="`diff-${difficulty}`"
      class="inline-flex items-center px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-full border border-purple-200 hover:bg-purple-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-purple-500"
      :aria-label="`Remove difficulty filter: ${difficulty}`"
      @click="$emit('toggle-difficulty-level', difficulty)"
    >
      <span class="text-purple-600 mr-1.5">Difficulty:</span>
      <span class="truncate max-w-[150px]">{{ difficulty }}</span>
      <svg
        class="w-3.5 h-3.5 ml-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
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

    <!-- Technology chips -->
    <button
      v-for="tech in selectedTechnologies"
      :key="`tech-${tech}`"
      class="inline-flex items-center px-3 py-1.5 text-sm bg-orange-50 text-orange-700 rounded-full border border-orange-200 hover:bg-orange-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500"
      :aria-label="`Remove technology filter: ${tech}`"
      @click="$emit('toggle-technology', tech)"
    >
      <span class="text-orange-600 mr-1.5">Tech:</span>
      <span class="truncate max-w-[150px]">{{ tech }}</span>
      <svg
        class="w-3.5 h-3.5 ml-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
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

    <!-- Tag chips -->
    <button
      v-for="tag in selectedTags"
      :key="`tag-${tag}`"
      class="inline-flex items-center px-3 py-1.5 text-sm bg-pink-50 text-pink-700 rounded-full border border-pink-200 hover:bg-pink-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-pink-500"
      :aria-label="`Remove tag filter: ${tag}`"
      @click="$emit('toggle-tag', tag)"
    >
      <span class="text-pink-600 mr-1.5">Tag:</span>
      <span class="truncate max-w-[150px]">{{ tag }}</span>
      <svg
        class="w-3.5 h-3.5 ml-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
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

    <!-- Benefit chips -->
    <button
      v-for="benefit in selectedBenefits"
      :key="`benefit-${benefit}`"
      class="inline-flex items-center px-3 py-1.5 text-sm bg-teal-50 text-teal-700 rounded-full border border-teal-200 hover:bg-teal-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-teal-500"
      :aria-label="`Remove benefit filter: ${benefit}`"
      @click="$emit('toggle-benefit', benefit)"
    >
      <span class="text-teal-600 mr-1.5">Benefit:</span>
      <span class="truncate max-w-[150px]">{{ benefit }}</span>
      <svg
        class="w-3.5 h-3.5 ml-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
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

    <!-- Date range chip -->
    <button
      v-if="selectedDateRange && selectedDateRange !== 'anytime'"
      class="inline-flex items-center px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200 hover:bg-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
      aria-label="Remove date filter"
      @click="$emit('clear-date-range')"
    >
      <span class="text-indigo-600 mr-1.5">Date:</span>
      <span>{{ formatDateRange(selectedDateRange) }}</span>
      <svg
        class="w-3.5 h-3.5 ml-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
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

    <!-- Clear all button -->
    <button
      class="ml-2 text-sm text-gray-500 hover:text-gray-700 underline focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 rounded px-1"
      aria-label="Clear all filters"
      @click="$emit('reset-filters')"
    >
      Clear all
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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

defineEmits<{
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

const formatDateRange = (range: string): string => {
  const dateLabels: Record<string, string> = {
    lastWeek: 'Last week',
    lastMonth: 'Last month',
    lastYear: 'Last year',
  }
  return dateLabels[range] || range
}
</script>
