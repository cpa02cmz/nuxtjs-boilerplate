<template>
  <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-medium text-gray-900">
        {{ contentConfig.filters.title }}
      </h2>
      <button
        :class="[
          'text-sm transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded px-2 py-1 rounded',
          resetConfirming
            ? 'text-green-600 bg-green-50'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
        ]"
        :aria-label="
          resetConfirming
            ? contentConfig.filters.ariaLabels.resetSuccess
            : contentConfig.filters.ariaLabels.resetAll
        "
        @click="handleResetWithFeedback"
      >
        <span class="flex items-center">
          <svg
            v-if="resetConfirming"
            class="w-4 h-4 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          {{
            resetConfirming
              ? contentConfig.filters.resetSuccess
              : contentConfig.filters.resetAll
          }}
        </span>
      </button>
    </div>

    <FilterSection
      id="category"
      :label="contentConfig.filters.sectionLabels.category"
      :aria-label="contentConfig.filters.ariaLabels.category"
      :options="categories"
      :selected-options="selectedCategories"
      :show-count="true"
      :get-count-for-option="getCategoryCount"
      @toggle="toggleCategory"
    />

    <FilterSection
      id="pricing"
      :label="contentConfig.filters.sectionLabels.pricingModel"
      :aria-label="contentConfig.filters.ariaLabels.pricingModel"
      :options="pricingModels"
      :selected-options="selectedPricingModels"
      :show-count="true"
      :get-count-for-option="getPricingCount"
      @toggle="togglePricingModel"
    />

    <FilterSection
      id="difficulty"
      :label="contentConfig.filters.sectionLabels.difficulty"
      :aria-label="contentConfig.filters.ariaLabels.difficulty"
      :options="difficultyLevels"
      :selected-options="selectedDifficultyLevels"
      :show-count="true"
      :get-count-for-option="getDifficultyCount"
      @toggle="toggleDifficultyLevel"
    />

    <FilterSection
      id="technology"
      :label="contentConfig.filters.sectionLabels.technology"
      :aria-label="contentConfig.filters.ariaLabels.technology"
      :options="technologies"
      :selected-options="selectedTechnologies"
      :show-count="true"
      :get-count-for-option="getTechnologyCount"
      @toggle="toggleTechnology"
    />

    <FilterSection
      id="tags"
      :label="contentConfig.filters.sectionLabels.tags"
      :aria-label="contentConfig.filters.ariaLabels.tags"
      :options="tags"
      :selected-options="selectedTags"
      :show-count="false"
      :get-count-for-option="undefined"
      @toggle="toggleTag"
    />

    <FilterSection
      v-if="allBenefits.length > 0"
      id="benefits"
      :label="contentConfig.filters.sectionLabels.benefits"
      :aria-label="contentConfig.filters.ariaLabels.benefits"
      :options="allBenefits"
      :selected-options="selectedBenefits"
      :show-count="true"
      :get-count-for-option="getBenefitCount"
      @toggle="toggleBenefit"
    />

    <fieldset class="mb-6">
      <legend class="text-sm font-medium text-gray-900 mb-3">
        {{ contentConfig.filters.sectionLabels.dateAdded }}
      </legend>
      <div
        role="radiogroup"
        :aria-label="contentConfig.filters.ariaLabels.dateAdded"
        class="space-y-2"
      >
        <label class="flex items-center" :for="'date-anytime'">
          <input
            id="date-anytime"
            type="radio"
            name="date-filter"
            value="anytime"
            :checked="selectedDateRange === 'anytime'"
            class="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
            @change="onDateRangeChange('anytime')"
          />
          <span class="ml-2 text-sm text-gray-800">{{
            contentConfig.filters.dateRanges.any
          }}</span>
        </label>
        <label class="flex items-center" :for="'date-last-week'">
          <input
            id="date-last-week"
            type="radio"
            name="date-filter"
            value="lastWeek"
            :checked="selectedDateRange === 'lastWeek'"
            class="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
            @change="onDateRangeChange('lastWeek')"
          />
          <span class="ml-2 text-sm text-gray-800">{{
            contentConfig.filters.dateRanges.week
          }}</span>
        </label>
        <label class="flex items-center" :for="'date-last-month'">
          <input
            id="date-last-month"
            type="radio"
            name="date-filter"
            value="lastMonth"
            :checked="selectedDateRange === 'lastMonth'"
            class="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
            @change="onDateRangeChange('lastMonth')"
          />
          <span class="ml-2 text-sm text-gray-800">{{
            contentConfig.filters.dateRanges.month
          }}</span>
        </label>
        <label class="flex items-center" :for="'date-last-year'">
          <input
            id="date-last-year"
            type="radio"
            name="date-filter"
            value="lastYear"
            :checked="selectedDateRange === 'lastYear'"
            class="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
            @change="onDateRangeChange('lastYear')"
          />
          <span class="ml-2 text-sm text-gray-800">{{
            contentConfig.filters.dateRanges.year
          }}</span>
        </label>
      </div>
    </fieldset>

    <SavedSearches
      v-if="savedSearches && savedSearches.length > 0"
      :saved-searches="savedSearches"
      @use-saved-search="onUseSavedSearch"
      @remove-saved-search="onRemoveSavedSearch"
      @undo-delete="onUndoDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import SavedSearches from '~/components/SavedSearches.vue'
import FilterSection from '~/components/FilterSection.vue'
import { triggerHaptic } from '~/utils/hapticFeedback'
import { uiConfig } from '~/configs/ui.config'
import { contentConfig } from '~/configs/content.config'

interface FacetCounts {
  [key: string]: number
}

interface Props {
  categories: readonly string[]
  pricingModels: readonly string[]
  difficultyLevels: readonly string[]
  technologies: readonly string[]
  tags: readonly string[]
  benefits?: readonly string[]
  selectedCategories: readonly string[]
  selectedPricingModels: readonly string[]
  selectedDifficultyLevels: readonly string[]
  selectedTechnologies: readonly string[]
  selectedTags: readonly string[]
  selectedBenefits?: readonly string[]
  selectedDateRange?: string
  searchQuery?: string
  facetCounts?: FacetCounts
  savedSearches?: Array<{ name: string; query: string; createdAt: Date }>
}

interface Emits {
  (event: 'toggle-category', category: string): void
  (event: 'toggle-pricing-model', pricingModel: string): void
  (event: 'toggle-difficulty-level', difficulty: string): void
  (event: 'toggle-technology', technology: string): void
  (event: 'toggle-tag', tag: string): void
  (event: 'toggle-benefit', benefit: string): void
  (event: 'date-range-change', dateRange: string): void
  (event: 'reset-filters'): void
  (
    event: 'use-saved-search',
    search: { name: string; query: string; createdAt: Date }
  ): void
  (event: 'remove-saved-search', query: string): void
  (
    event: 'undo-delete',
    search: { name: string; query: string; createdAt: Date }
  ): void
}

const props = withDefaults(defineProps<Props>(), {
  benefits: () => [],
  searchQuery: '',
  facetCounts: () => ({}),
  selectedBenefits: () => [],
  selectedDateRange: 'anytime',
  savedSearches: () => [],
})

const emit = defineEmits<Emits>()

const resetConfirming = ref(false)
let resetTimeout: ReturnType<typeof setTimeout> | null = null

const handleResetWithFeedback = () => {
  // Flexy hates hardcoded values! Using haptic utility instead
  triggerHaptic('medium')

  onResetFilters()

  resetConfirming.value = true

  if (resetTimeout) {
    clearTimeout(resetTimeout)
  }

  // Flexy hates hardcoded values! Using configurable delay from uiConfig
  resetTimeout = setTimeout(() => {
    resetConfirming.value = false
  }, uiConfig.feedback.resetConfirmationMs)
}

const toggleCategory = (category: string) => {
  emit('toggle-category', category)
}

const togglePricingModel = (pricingModel: string) => {
  emit('toggle-pricing-model', pricingModel)
}

const toggleDifficultyLevel = (difficulty: string) => {
  emit('toggle-difficulty-level', difficulty)
}

const toggleTechnology = (technology: string) => {
  emit('toggle-technology', technology)
}

const toggleTag = (tag: string) => {
  emit('toggle-tag', tag)
}

const toggleBenefit = (benefit: string) => {
  emit('toggle-benefit', benefit)
}

const onDateRangeChange = (dateRange: string) => {
  emit('date-range-change', dateRange)
}

const onResetFilters = () => {
  emit('reset-filters')
}

const allBenefits = computed(() => {
  const uniqueBenefits = new Set<string>()
  Object.keys(props.facetCounts || {}).forEach(key => {
    if (key.startsWith('benefits_')) {
      const benefit = key.replace('benefits_', '')
      uniqueBenefits.add(benefit)
    }
  })
  return Array.from(uniqueBenefits)
})

const getCategoryCount = (option: string): number => {
  if (!props.facetCounts) return 0
  return props.facetCounts[`category_${option}`] || 0
}

const getPricingCount = (option: string): number => {
  if (!props.facetCounts) return 0
  return props.facetCounts[`pricing_${option}`] || 0
}

const getDifficultyCount = (option: string): number => {
  if (!props.facetCounts) return 0
  return props.facetCounts[`difficulty_${option}`] || 0
}

const getTechnologyCount = (option: string): number => {
  if (!props.facetCounts) return 0
  return props.facetCounts[`technology_${option}`] || 0
}

const getBenefitCount = (option: string): number => {
  if (!props.facetCounts) return 0
  return props.facetCounts[`benefits_${option}`] || 0
}

const onUseSavedSearch = (search: {
  name: string
  query: string
  createdAt: Date
}) => {
  emit('use-saved-search', search)
}

const onRemoveSavedSearch = (query: string) => {
  emit('remove-saved-search', query)
}

const onUndoDelete = (search: {
  name: string
  query: string
  createdAt: Date
}) => {
  emit('undo-delete', search)
}

// Cleanup timeout on unmount to prevent memory leaks
onUnmounted(() => {
  if (resetTimeout) {
    clearTimeout(resetTimeout)
  }
})
</script>
