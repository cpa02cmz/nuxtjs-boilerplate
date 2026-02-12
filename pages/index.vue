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
        <LazySearchBar v-model="searchQuery" @search="handleSearch" />
      </div>

      <!-- Loading State with Skeletons -->
      <div v-if="loading" class="mt-16">
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
          <ResourceCardSkeleton v-for="i in 6" :key="`skeleton-${i}`" />
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="mt-16">
        <ErrorMessage
          :message="errorMessage || error"
          variant="error"
          :action="{ label: 'Retry', handler: retryResources }"
        />
      </div>

      <!-- Resources Grid -->
      <div v-else class="mt-16">
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

            <!-- Load More Button with Progress Ring -->
            <div
              v-if="hasMoreResources || showCompletionState"
              class="mt-8 text-center"
            >
              <!-- Completion Celebration State -->
              <div
                v-if="showCompletionState"
                class="inline-flex items-center px-6 py-3 bg-green-50 text-green-700 rounded-lg animate-celebration-pulse"
                role="status"
                aria-live="polite"
              >
                <svg
                  class="w-5 h-5 mr-2 animate-check-bounce"
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
                <span class="font-medium">{{
                  uiConfig.loadMore.allLoadedText
                }}</span>
              </div>

              <!-- Load More Button with Progress Ring -->
              <button
                v-else
                ref="loadMoreButtonRef"
                class="relative inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-white group"
                :disabled="isLoadingMore"
                :aria-label="loadMoreAriaLabel"
                @click="loadMoreWithEnhancedFeedback"
              >
                <!-- Progress Ring SVG -->
                <svg
                  class="absolute inset-0 w-full h-full -rotate-90"
                  viewBox="0 0 100 100"
                  aria-hidden="true"
                >
                  <!-- Background circle -->
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="#e5e7eb"
                    stroke-width="2"
                  />
                  <!-- Progress circle -->
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    :stroke-dasharray="loadMoreProgressCircumference"
                    :stroke-dashoffset="loadMoreProgressOffset"
                    class="text-indigo-500 transition-all duration-500 ease-out"
                  />
                </svg>

                <!-- Button Content -->
                <span class="relative z-10 flex items-center">
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

                  <!-- Arrow Down Icon -->
                  <svg
                    v-else
                    class="w-5 h-5 mr-2 text-gray-500 group-hover:translate-y-0.5 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>

                  <span>{{
                    isLoadingMore
                      ? uiConfig.loadMore.loadingText
                      : uiConfig.loadMore.buttonText
                  }}</span>
                </span>

                <!-- Progress Percentage Badge -->
                <span
                  v-if="!isLoadingMore"
                  class="relative z-10 ml-3 text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"
                >
                  {{ loadMoreProgressPercentage }}%
                </span>
              </button>

              <!-- Screen reader announcement for progress -->
              <div role="status" aria-live="polite" class="sr-only">
                {{ loadMoreProgressAnnouncement }}
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
          <div v-if="filteredResources.length > 0 && !loading" class="mt-16">
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
        <div v-if="filteredResources.length > 0 && !loading" class="mt-16">
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
import { ref, computed, watch, nextTick } from 'vue'
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
import { TIME_MS } from '~/configs/time.config'
import { hapticConfig } from '~/configs/haptic.config'
import { EASING } from '~/configs/easing.config'

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
const showCompletionState = ref(false)
const loadMoreButtonRef = ref<HTMLButtonElement | null>(null)
const lastLoadedCount = ref(0)

// Computed property for paginated resources
const paginatedResources = computed(() => {
  return filteredResources.value.slice(0, displayedCount.value)
})

// Check if there are more resources to load
const hasMoreResources = computed(() => {
  return displayedCount.value < filteredResources.value.length
})

// Progress calculations for the circular progress indicator
const loadMoreProgressPercentage = computed(() => {
  if (filteredResources.value.length === 0) return 0
  return Math.round(
    (displayedCount.value / filteredResources.value.length) * 100
  )
})

const loadMoreProgressCircumference = computed(() => 2 * Math.PI * 46)

const loadMoreProgressOffset = computed(() => {
  const circumference = loadMoreProgressCircumference.value
  const percentage = loadMoreProgressPercentage.value / 100
  return circumference - percentage * circumference
})

// ARIA label for accessibility
const loadMoreAriaLabel = computed(() => {
  if (isLoadingMore.value) {
    return `Loading more resources. ${loadMoreProgressPercentage.value}% loaded`
  }
  return `Load more resources. Currently showing ${displayedCount.value} of ${filteredResources.value.length} resources (${loadMoreProgressPercentage.value}% loaded)`
})

// Screen reader announcement
const loadMoreProgressAnnouncement = computed(() => {
  if (isLoadingMore.value) {
    return `Loading more resources...`
  }
  return `${displayedCount.value} of ${filteredResources.value.length} resources loaded (${loadMoreProgressPercentage.value}%)`
})

// Load more resources with enhanced visual feedback - Palette's micro-UX delight!
const loadMoreWithEnhancedFeedback = async () => {
  if (isLoadingMore.value) return

  // Store the current count for scroll positioning
  lastLoadedCount.value = displayedCount.value

  isLoadingMore.value = true

  // Haptic feedback for mobile users - Flexy hates hardcoded values!
  if (
    hapticConfig.isEnabled('loadMore') &&
    typeof navigator !== 'undefined' &&
    navigator.vibrate
  ) {
    navigator.vibrate(hapticConfig.getPattern('light'))
  }

  // Simulate a brief loading delay for better UX (perceived performance)
  // This makes the action feel more substantial and prevents rapid double-clicks
  await new Promise(resolve =>
    setTimeout(resolve, uiConfig.loadMore.minLoadingDurationMs)
  )

  displayedCount.value += thresholdsConfig.pagination.loadMoreCount

  isLoadingMore.value = false

  // Check if we've loaded all resources
  if (displayedCount.value >= filteredResources.value.length) {
    showCompletionState.value = true

    // Hide completion state after a delay - Flexy hates hardcoded values!
    setTimeout(() => {
      showCompletionState.value = false
    }, TIME_MS.SECOND * 3)
  }

  // Scroll to the newly loaded content smoothly
  await nextTick()
  scrollToNewlyLoadedContent()
}

// Scroll to the first newly loaded resource card
const scrollToNewlyLoadedContent = () => {
  // Find all resource card wrappers
  const cards = document.querySelectorAll('.resource-card-wrapper')

  // Scroll to the first newly loaded card
  if (cards.length > lastLoadedCount.value) {
    const newCard = cards[lastLoadedCount.value]
    if (newCard) {
      newCard.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }
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
    v-bind('EASING.SPRING_STANDARD') forwards;
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

/* Load More Button - Completion Celebration Animation */
.animate-celebration-pulse {
  animation: celebration-pulse 0.6s v-bind('EASING.SPRING_STANDARD');
}

@keyframes celebration-pulse {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Checkmark bounce animation */
.animate-check-bounce {
  animation: check-bounce 0.5s v-bind('EASING.SPRING_STANDARD');
}

@keyframes check-bounce {
  0% {
    transform: scale(0) rotate(-45deg);
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0);
  }
}

/* Reduced motion support for new animations */
@media (prefers-reduced-motion: reduce) {
  .animate-celebration-pulse,
  .animate-check-bounce {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
