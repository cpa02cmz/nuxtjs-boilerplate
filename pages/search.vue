<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <ErrorBoundary component-name="SearchPage">
    <div class="py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h1 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {{ contentConfig.navigation.items.search }}
          </h1>
          <p class="mt-4 text-xl text-gray-500">
            {{ seoConfig.meta.description }}
          </p>
        </div>

        <!-- Search Bar -->
        <div class="mb-8">
          <LazySearchBar
            v-model="searchQuery"
            @search="handleSearch"
          />
        </div>

        <!-- Loading State -->
        <div
          v-if="loading"
          class="flex justify-center items-center py-12"
        >
          <div
            class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"
            role="status"
            aria-label="Loading search results"
          />
        </div>

        <!-- Error State -->
        <div
          v-else-if="error"
          class="text-center py-12"
        >
          <p class="text-red-600 text-lg">
            Error loading resources: {{ error }}
          </p>
        </div>

        <!-- No Results State -->
        <LazyEmptyState
          v-else-if="!filteredResources.length && !loading"
          :title="contentConfig.searchResults.noResults.title"
          :description="contentConfig.searchResults.noResults.message"
          :suggestions="contentConfig.search.suggestions.defaultSuggestions"
          show-reset
          show-browse-all
          show-tips
          @reset="resetAllFilters"
          @browse-all="handleBrowseAll"
          @suggestion-click="handleSuggestionClick"
        />

        <!-- Results with Filters -->
        <div
          v-else
          class="flex flex-col lg:flex-row gap-8"
        >
          <!-- ARIA live region for search results -->
          <div
            id="search-results-status"
            role="status"
            aria-live="polite"
            class="sr-only"
          >
            {{ filteredResources.length }} resources found for your search
          </div>

          <!-- Filters Sidebar -->
          <div class="lg:w-1/4">
            <LazyResourceFilters
              :categories="[...categories]"
              :pricing-models="[...pricingModels]"
              :difficulty-levels="[...difficultyLevels]"
              :technologies="[...technologies]"
              :tags="[...tags]"
              :benefits="[...benefits]"
              :selected-categories="[...selectedCategories]"
              :selected-pricing-models="[...selectedPricingModels]"
              :selected-difficulty-levels="[...selectedDifficultyLevels]"
              :selected-technologies="[...selectedTechnologies]"
              :selected-tags="[...selectedTags]"
              :selected-benefits="[...selectedBenefits]"
              :selected-date-range="selectedDateRange"
              :search-query="searchQuery"
              :facet-counts="facetCounts"
              :saved-searches="[...savedSearches]"
              role="region"
              aria-label="Resource filters"
              @toggle-category="enhancedToggleCategory"
              @toggle-pricing-model="enhancedTogglePricingModel"
              @toggle-difficulty-level="enhancedToggleDifficultyLevel"
              @toggle-technology="enhancedToggleTechnology"
              @toggle-tag="enhancedToggleTag"
              @toggle-benefit="enhancedToggleBenefit"
              @date-range-change="(value: string) => setDateRange(value)"
              @reset-filters="resetAllFilters"
              @use-saved-search="onUseSavedSearch"
              @remove-saved-search="onRemoveSavedSearch"
              @undo-delete="onUndoDelete"
            />

            <!-- Show popular searches when there's no active search -->
            <PopularSearches
              v-if="!searchQuery"
              class="mt-6"
              @search-select="handlePopularSearch"
            />

            <!-- Show zero-result searches when there are no results -->
            <ZeroResultSearches
              v-if="searchQuery && !filteredResources.length && !loading"
              class="mt-6"
              @search-select="handlePopularSearch"
            />
          </div>

          <!-- Results Section -->
          <div class="lg:w-3/4">
            <ResourceSort
              :selected-sort-option="sortOption"
              :total-resources="filteredResources.length"
              @update-sort-option="
                (option: string) => setSortOption(option as SortOption)
              "
            />

            <ActiveFilters
              :search-query="searchQuery"
              :selected-categories="[...selectedCategories]"
              :selected-pricing-models="[...selectedPricingModels]"
              :selected-difficulty-levels="[...selectedDifficultyLevels]"
              :selected-technologies="[...selectedTechnologies]"
              :selected-tags="[...selectedTags]"
              :selected-benefits="[...selectedBenefits]"
              :selected-date-range="selectedDateRange"
              @clear-search="searchQuery = ''"
              @toggle-category="enhancedToggleCategory"
              @toggle-pricing-model="enhancedTogglePricingModel"
              @toggle-difficulty-level="enhancedToggleDifficultyLevel"
              @toggle-technology="enhancedToggleTechnology"
              @toggle-tag="enhancedToggleTag"
              @toggle-benefit="enhancedToggleBenefit"
              @clear-date-range="selectedDateRange = 'anytime'"
              @reset-filters="resetAllFilters"
            />

            <div class="mt-6">
              <VirtualResourceList
                :items="filteredResources"
                :item-height="uiConfig.virtualList.pageItemHeight"
                :overscan="uiConfig.virtualList.pageOverscan"
              >
                <template #default="{ item: resource }">
                  <LazyResourceCard
                    :id="resource.id"
                    :key="resource.id"
                    :title="resource.title"
                    :description="resource.description"
                    :benefits="resource.benefits"
                    :url="resource.url"
                    :button-label="getButtonLabel(resource.category)"
                    :highlighted-title="
                      highlightSearchTerms(resource.title, searchQuery)
                    "
                    :highlighted-description="
                      createSearchSnippet(resource.description, searchQuery)
                    "
                    :search-query="searchQuery"
                    :date-added="resource.dateAdded"
                  />
                </template>
              </VirtualResourceList>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ErrorBoundary>
</template>

<script setup lang="ts">
import type { SortOption } from '~/types/resource'
import { useUrlSync } from '~/composables/useUrlSync'
import { useSearchPage } from '~/composables/useSearchPage'
import ResourceSort from '~/components/ResourceSort.vue'
import VirtualResourceList from '~/components/VirtualResourceList.vue'
import PopularSearches from '~/components/PopularSearches.vue'
import ZeroResultSearches from '~/components/ZeroResultSearches.vue'
import ActiveFilters from '~/components/ActiveFilters.vue'
import { seoConfig } from '~/configs/seo.config'
import { contentConfig } from '~/configs/content.config'
import { appConfig } from '~/configs/app.config'
import { uiConfig } from '~/configs/ui.config'
import { DEFAULT_DEV_URL } from '~/configs/url.config'

definePageMeta({
  layout: 'default',
})

const runtimeConfig = useRuntimeConfig()
useSeoMeta({
  title: `${contentConfig.navigation.items.search} - ${appConfig.name}`,
  ogTitle: `${contentConfig.navigation.items.search} - ${appConfig.name}`,
  description: seoConfig.meta.description,
  ogDescription: seoConfig.meta.description,
  ogImage: seoConfig.og.image,
  ogUrl: `${runtimeConfig.public.siteUrl || runtimeConfig.public.canonicalUrl || DEFAULT_DEV_URL}/search`,
  twitterCard: seoConfig.twitter.card as
    | 'summary'
    | 'summary_large_image'
    | 'app'
    | 'player',
})

const {
  filterOptions,
  sortOption,
  filteredResources,
  facetCounts,
  updateSearchQuery,
  setSortOption,
  resetFilters,
  handleSearch,
  savedSearches,
  saveSearch,
  removeSavedSearch,
  createSearchSnippet,
  highlightSearchTerms,
  loading,
  error,
  categories,
  pricingModels,
  difficultyLevels,
  technologies,
  tags,
  benefits,
  toggleCategory,
  togglePricingModel,
  toggleDifficultyLevel,
  toggleTechnology,
  toggleTag,
  toggleBenefit,
  setDateRange,
} = useSearchPage()

useUrlSync(filterOptions, sortOption)

const searchQuery = computed({
  get: () => filterOptions.value.searchQuery || '',
  set: value => updateSearchQuery(value),
})

const selectedCategories = computed(() => filterOptions.value.categories || [])
const selectedPricingModels = computed(
  () => filterOptions.value.pricingModels || []
)
const selectedDifficultyLevels = computed(
  () => filterOptions.value.difficultyLevels || []
)
const selectedTechnologies = computed(
  () => filterOptions.value.technologies || []
)
const selectedTags = computed(() => filterOptions.value.tags || [])
const selectedBenefits = computed(() => filterOptions.value.benefits || [])
const selectedDateRange = computed({
  get: () => filterOptions.value.dateRange || 'anytime',
  set: (value: string) => setDateRange(value),
})

const enhancedToggleCategory = (category: string) => {
  toggleCategory(category)
}

const enhancedTogglePricingModel = (pricingModel: string) => {
  togglePricingModel(pricingModel)
}

const enhancedToggleDifficultyLevel = (difficultyLevel: string) => {
  toggleDifficultyLevel(difficultyLevel)
}

const enhancedToggleTechnology = (technology: string) => {
  toggleTechnology(technology)
}

const enhancedToggleTag = (tag: string) => {
  toggleTag(tag)
}

const enhancedToggleBenefit = (benefit: string) => {
  toggleBenefit(benefit)
}

const resetAllFilters = () => {
  resetFilters()
  searchQuery.value = ''
}

// Kept for RelatedSearches compatibility if used elsewhere
const _handleRelatedSearch = (query: string) => {
  searchQuery.value = query
  updateSearchQuery(query)
}

const handlePopularSearch = (query: string) => {
  searchQuery.value = query
  updateSearchQuery(query)
}

const onUseSavedSearch = (search: {
  name: string
  query: string
  createdAt: Date
}) => {
  searchQuery.value = search.query
  updateSearchQuery(search.query)
}

const onRemoveSavedSearch = (query: string) => {
  removeSavedSearch(query)
}

const onUndoDelete = (search: {
  name: string
  query: string
  createdAt: Date
}) => {
  saveSearch(search.name, search.query)
}

const handleBrowseAll = () => {
  resetAllFilters()
}

const handleSuggestionClick = (suggestion: string) => {
  searchQuery.value = suggestion
  updateSearchQuery(suggestion)
}

const getButtonLabel = (category: string) => {
  const labels = uiConfig.resourceCard.categoryButtonLabels
  const normalizedCategory = category.toLowerCase()
  return (
    labels[normalizedCategory as keyof typeof labels] ||
    uiConfig.resourceCard.defaultButtonLabel
  )
}
</script>
