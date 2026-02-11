<template>
  <div class="py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1
          class="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl"
        >
          {{ appConfig.name }}
        </h1>
        <p class="mt-6 max-w-lg mx-auto text-xl text-gray-600">
          {{ appConfig.description }}
        </p>
      </div>

      <!-- Search Bar -->
      <div class="mt-8 max-w-2xl mx-auto">
        <LazySearchBar
          v-model="searchQuery"
          @search="handleSearch"
        />
      </div>

      <!-- Loading State with Skeletons -->
      <div
        v-if="loading"
        class="mt-16"
      >
        <div class="flex flex-wrap gap-2 mb-8 justify-center">
          <div
            v-for="i in 5"
            :key="i"
            class="px-3 py-1 text-sm rounded-full border bg-gray-200 animate-pulse"
            :style="{
              width: `${thresholdsConfig.skeleton.chipWidthPx}px`,
              height: `${thresholdsConfig.skeleton.chipHeightPx}px`,
            }"
          />
        </div>

        <div class="flex justify-between items-center mb-6">
          <div class="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>

        <!-- Resources Grid with Skeletons -->
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <ResourceCardSkeleton
            v-for="i in 6"
            :key="`skeleton-${i}`"
          />
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="mt-16"
      >
        <ErrorMessage
          :message="errorMessage || error"
          variant="error"
          :action="{ label: 'Retry', handler: retryResources }"
        />
      </div>

      <!-- Resources Grid -->
      <div
        v-else
        class="mt-16"
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

        <!-- Filters Section -->
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Resource Filters Component -->
          <div class="lg:w-1/4">
            <LazyResourceFilters
              :categories="[...categories]"
              :pricing-models="[...pricingModels]"
              :difficulty-levels="[...difficultyLevels]"
              :technologies="[...technologies]"
              :tags="[...allTags]"
              :selected-categories="
                filterOptions.categories ? [...filterOptions.categories] : []
              "
              :selected-pricing-models="
                filterOptions.pricingModels
                  ? [...filterOptions.pricingModels]
                  : []
              "
              :selected-difficulty-levels="
                filterOptions.difficultyLevels
                  ? [...filterOptions.difficultyLevels]
                  : []
              "
              :selected-technologies="
                filterOptions.technologies
                  ? [...filterOptions.technologies]
                  : []
              "
              :selected-tags="filterOptions.tags ? [...filterOptions.tags] : []"
              @toggle-category="toggleCategory"
              @toggle-pricing-model="togglePricingModel"
              @toggle-difficulty-level="toggleDifficultyLevel"
              @toggle-technology="toggleTechnology"
              @toggle-tag="toggleTag"
              @reset-filters="resetFilters"
            />
          </div>

          <!-- Mobile Filter Drawer Button -->
          <div class="lg:hidden flex justify-center mb-4">
            <LazyMobileFilterDrawer
              :categories="[...categories]"
              :pricing-models="[...pricingModels]"
              :difficulty-levels="[...difficultyLevels]"
              :technologies="[...technologies]"
              :tags="[...allTags]"
              :selected-categories="selectedCategories"
              :selected-pricing-models="filterOptions.pricingModels || []"
              :selected-difficulty-levels="filterOptions.difficultyLevels || []"
              :selected-technologies="filterOptions.technologies || []"
              :selected-tags="filterOptions.tags || []"
              :selected-date-range="filterOptions.dateRange || 'anytime'"
              :results-count="filteredResources.length"
              @toggle-category="toggleCategory"
              @toggle-pricing-model="togglePricingModel"
              @toggle-difficulty-level="toggleDifficultyLevel"
              @toggle-technology="toggleTechnology"
              @toggle-tag="toggleTag"
              @date-range-change="handleDateRangeChange"
              @reset-filters="resetFilters"
            />
          </div>

          <!-- Resources Grid -->
          <div
            class="lg:w-3/4"
            :class="thresholdsConfig.skeleton.gridMinHeight"
          >
            <!-- Results Info -->
            <div class="flex justify-between items-center mb-6">
              <ResourceSort
                :selected-sort-option="sortOption"
                :total-resources="filteredResources.length"
                @update-sort-option="
                  (option: string) => setSortOption(option as SortOption)
                "
              />
            </div>

            <!-- Resources Grid -->
            <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="(resource, index) in paginatedResources"
                :key="resource.id"
                class="resource-card-wrapper"
                :style="{
                  animationDelay: `${Math.min(index * animationConfig.card.staggerDelayMs, animationConfig.card.maxDelayMs)}ms`,
                }"
              >
                <LazyResourceCard
                  :id="resource.id"
                  :title="resource.title"
                  :description="resource.description"
                  :benefits="[...resource.benefits]"
                  :url="resource.url"
                  :button-label="getButtonLabel(resource.category)"
                  :highlighted-title="
                    highlightSearchTerms(resource.title, searchQuery)
                  "
                  :highlighted-description="
                    highlightSearchTerms(resource.description, searchQuery)
                  "
                  :date-added="resource.dateAdded"
                />
              </div>
            </div>

            <!-- Load More Button -->
            <div
              v-if="hasMoreResources"
              class="mt-8 text-center"
            >
              <button
                class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-white"
                :disabled="isLoadingMore"
                @click="loadMoreWithFeedback"
              >
                <!-- Loading Spinner -->
                <svg
                  v-if="isLoadingMore"
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
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
                <span>{{
                  isLoadingMore
                    ? uiConfig.loadMore.loadingText
                    : uiConfig.loadMore.buttonText
                }}</span>
                <span
                  v-if="!isLoadingMore"
                  class="ml-2 text-gray-500"
                >
                  ({{ paginatedResources.length }} of
                  {{ filteredResources.length }})
                </span>
              </button>
            </div>
          </div>

          <!-- No Results Message -->
          <div
            v-if="!filteredResources.length && !loading"
            class="text-center py-12"
          >
            <h3 class="text-xl font-medium text-gray-900 mb-2">
              {{ contentConfig.searchResults.noResults.title }}
            </h3>
            <p class="text-gray-500 mb-6">
              {{ contentConfig.searchResults.noResults.message }}
            </p>
            <button
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900"
              @click="resetAllFilters"
            >
              {{ contentConfig.filters.resetAll }}
            </button>
          </div>

          <!-- Trending Resources Section -->
          <div
            v-if="filteredResources.length > 0 && !loading"
            class="mt-16"
          >
            <h2 class="text-2xl font-bold text-gray-900 mb-6">
              Trending Resources
            </h2>
            <div class="grid grid-cols-1 gap-6">
              <div
                v-for="(resource, index) in trendingResources"
                :key="resource.id"
                class="resource-card-wrapper"
                :style="{
                  animationDelay: `${Math.min(index * animationConfig.card.staggerDelayMs, animationConfig.card.maxDelayMs)}ms`,
                }"
              >
                <LazyResourceCard
                  :title="resource.title"
                  :description="resource.description"
                  :benefits="[...resource.benefits]"
                  :url="resource.url"
                  :button-label="getButtonLabel(resource.category)"
                  :highlighted-title="
                    highlightSearchTerms(resource.title, searchQuery)
                  "
                  :highlighted-description="
                    highlightSearchTerms(resource.description, searchQuery)
                  "
                  :date-added="resource.dateAdded"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Recommendations Section -->
        <div
          v-if="filteredResources.length > 0 && !loading"
          class="mt-16"
        >
          <ClientOnly>
            <LazyRecommendationsSection />
          </ClientOnly>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SortOption } from '~/types/resource'
import { ref, computed, watch } from 'vue'
import { useResources } from '~/composables/useResources'
import { useUrlSync } from '~/composables/useUrlSync'
import { useHomePage } from '~/composables/useHomePage'
import { getButtonLabel } from '~/utils/resourceHelper'
import ResourceSort from '~/components/ResourceSort.vue'
import { appConfig } from '~/configs/app.config'
import { seoConfig } from '~/configs/seo.config'
import { animationConfig } from '~/configs/animation.config'
import { contentConfig } from '~/configs/content.config'
import { thresholdsConfig } from '~/configs/thresholds.config'
import { DEFAULT_DEV_URL } from '~/configs/url.config'
import { uiConfig } from '~/configs/ui.config'

definePageMeta({
  layout: 'default',
})

// Set page-specific meta tags
const runtimeConfig = useRuntimeConfig()
useSeoMeta({
  title: seoConfig.meta.title,
  ogTitle: seoConfig.meta.title,
  description: seoConfig.meta.description,
  ogDescription: seoConfig.meta.description,
  ogImage: seoConfig.og.image,
  ogUrl:
    runtimeConfig.public.siteUrl ||
    runtimeConfig.public.canonicalUrl ||
    DEFAULT_DEV_URL,
  twitterCard: seoConfig.twitter.card as
    | 'summary'
    | 'summary_large_image'
    | 'app'
    | 'player',
})

// Use the resources composable
const {
  filteredResources,
  loading,
  error,
  errorMessage,
  categories,
  pricingModels,
  difficultyLevels,
  technologies,
  allTags,
  filterOptions,
  sortOption,
  updateSearchQuery,
  toggleCategory,
  togglePricingModel,
  toggleDifficultyLevel,
  toggleTechnology,
  toggleTag,
  setSortOption,
  setDateRange,
  resetFilters,
  resources,
  highlightSearchTerms,
  retryResources,
} = useResources()

const { trendingResources } = useHomePage([...resources.value])

useUrlSync(filterOptions, sortOption)

const searchQuery = computed({
  get: () => filterOptions.value.searchQuery || '',
  set: value => updateSearchQuery(value),
})

const selectedCategories = computed(() => filterOptions.value.categories || [])

const handleSearch = (query: string) => {
  updateSearchQuery(query)
}

const handleDateRangeChange = (dateRange: string) => {
  setDateRange(dateRange)
}

const resetAllFilters = () => {
  resetFilters()
  searchQuery.value = ''
}

// Pagination state - prevents DOM bloat with large resource collections
const displayedCount = ref(thresholdsConfig.pagination.initialCount)
const isLoadingMore = ref(false)

// Computed property for paginated resources
const paginatedResources = computed(() => {
  return filteredResources.value.slice(0, displayedCount.value)
})

// Check if there are more resources to load
const hasMoreResources = computed(() => {
  return displayedCount.value < filteredResources.value.length
})

// Load more resources with visual feedback for perceived performance
const loadMoreWithFeedback = async () => {
  if (isLoadingMore.value) return

  isLoadingMore.value = true

  // Simulate a brief loading delay for better UX (perceived performance)
  // This makes the action feel more substantial and prevents rapid double-clicks
  await new Promise(resolve =>
    setTimeout(resolve, uiConfig.loadMore.minLoadingDurationMs)
  )

  displayedCount.value += thresholdsConfig.pagination.loadMoreCount

  isLoadingMore.value = false
}

// Reset pagination when filters change
watch(
  () => filterOptions.value,
  () => {
    displayedCount.value = thresholdsConfig.pagination.initialCount
  },
  { deep: true }
)
</script>

<style>
/* Staggered entrance animation for resource cards - Spring physics for delightful UX */
/* Flexy hates hardcoded values! Using config-bound CSS custom properties */
.resource-card-wrapper {
  opacity: 0;
  /* Spring cubic-bezier: overshoots slightly for organic, playful feel */
  animation: card-enter v-bind('animationConfig.card.enterDurationMs + "ms"')
    cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  will-change: transform, opacity;
}

@keyframes card-enter {
  0% {
    opacity: 0;
    transform: translateY(
        v-bind('animationConfig.cardAnimations.enterDistancePx + "px"')
      )
      scale(v-bind('animationConfig.cardAnimations.enterScale'));
  }
  40% {
    opacity: 0.7;
    transform: translateY(
        v-bind('animationConfig.cardAnimations.hoverTranslateYPx + "px"')
      )
      scale(v-bind('animationConfig.cardAnimations.hoverScale'));
  }
  70% {
    opacity: 0.95;
    transform: translateY(
        v-bind('animationConfig.cardAnimations.activeTranslateYPx + "px"')
      )
      scale(v-bind('animationConfig.cardAnimations.activeScale'));
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Respect reduced motion preferences for accessibility */
@media (prefers-reduced-motion: reduce) {
  .resource-card-wrapper {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
