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
            style="width: 80px; height: 28px"
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

          <!-- Category Filters (for mobile) -->
          <div class="lg:hidden flex flex-wrap gap-2 mb-4 justify-center">
            <button
              v-for="category in categories"
              :key="category"
              :class="[
                'px-3 py-1 text-sm rounded-full border',
                selectedCategories.includes(category)
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50',
              ]"
              :aria-label="
                selectedCategories.includes(category)
                  ? `Remove ${category} filter`
                  : `Filter by ${category}`
              "
              :aria-pressed="selectedCategories.includes(category)"
              @click="toggleCategory(category)"
            >
              {{ category }}
            </button>
          </div>

          <!-- Resources Grid -->
          <div class="lg:w-3/4 min-h-[400px]">
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
                v-for="(resource, index) in filteredResources"
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
import { useResources } from '~/composables/useResources'
import { useUrlSync } from '~/composables/useUrlSync'
import { useHomePage } from '~/composables/useHomePage'
import { getButtonLabel } from '~/utils/resourceHelper'
import ResourceSort from '~/components/ResourceSort.vue'
import { appConfig } from '~/configs/app.config'
import { seoConfig } from '~/configs/seo.config'
import { animationConfig } from '~/configs/animation.config'
import { contentConfig } from '~/configs/content.config'

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
    'http://localhost:3000',
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

const resetAllFilters = () => {
  resetFilters()
  searchQuery.value = ''
}
</script>

<style>
/* Staggered entrance animation for resource cards */
.resource-card-wrapper {
  opacity: 0;
  animation: card-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
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
