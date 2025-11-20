<template>
  <div class="py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1
          class="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl"
        >
          Free Stuff on the Internet
        </h1>
        <p class="mt-6 max-w-lg mx-auto text-xl text-gray-500">
          Discover amazing free resources available on the internet - from AI
          tools to hosting services.
        </p>
      </div>

      <!-- Search Bar -->
      <div class="mt-8 max-w-2xl mx-auto">
        <SearchBar v-model="searchQuery" @search="handleSearch" />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12 mt-16">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"
        ></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12 mt-16">
        <p class="text-red-600 text-lg">Error loading resources: {{ error }}</p>
      </div>

      <!-- Resources Grid -->
      <div v-else class="mt-16">
        <!-- Category Filters -->
        <div class="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            v-for="(category, index) in categories"
            :key="category"
            :class="[
              'px-3 py-1 text-sm rounded-full border',
              selectedCategories.includes(category)
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
            ]"
            :tabindex="0"
            @click="toggleCategory(category)"
            @keydown.enter="toggleCategory(category)"
            @keydown.space="toggleCategory(category)"
          >
            {{ category }}
          </button>
        </div>

        <!-- Advanced Filters -->
        <div class="flex flex-wrap justify-center gap-4 mb-8">
          <!-- Pricing Model Filters -->
          <div class="flex flex-wrap gap-2">
            <span class="text-sm font-medium text-gray-700 mr-2">Pricing:</span>
            <button
              v-for="(pricingModel, index) in pricingModels"
              :key="pricingModel"
              :class="[
                'px-2 py-1 text-xs rounded-full border',
                selectedPricingModels.includes(pricingModel)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
              ]"
              :tabindex="0"
              @click="togglePricingModel(pricingModel)"
              @keydown.enter="togglePricingModel(pricingModel)"
              @keydown.space="togglePricingModel(pricingModel)"
            >
              {{ pricingModel }}
            </button>
          </div>

          <!-- Difficulty Filters -->
          <div class="flex flex-wrap gap-2">
            <span class="text-sm font-medium text-gray-700 mr-2"
              >Difficulty:</span
            >
            <button
              v-for="(difficulty, index) in difficultyLevels"
              :key="difficulty"
              :class="[
                'px-2 py-1 text-xs rounded-full border',
                selectedDifficultyLevels.includes(difficulty)
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
              ]"
              :tabindex="0"
              @click="toggleDifficultyLevel(difficulty)"
              @keydown.enter="toggleDifficultyLevel(difficulty)"
              @keydown.space="toggleDifficultyLevel(difficulty)"
            >
              {{ difficulty }}
            </button>
          </div>

          <!-- Technology Filters -->
          <div class="flex flex-wrap gap-2">
            <span class="text-sm font-medium text-gray-700 mr-2">Tech:</span>
            <button
              v-for="(technology, index) in technologies"
              :key="technology"
              :class="[
                'px-2 py-1 text-xs rounded-full border',
                selectedTechnologies.includes(technology)
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
              ]"
              :tabindex="0"
              @click="toggleTechnology(technology)"
              @keydown.enter="toggleTechnology(technology)"
              @keydown.space="toggleTechnology(technology)"
            >
              {{ technology }}
            </button>
          </div>
        </div>

        <!-- Results Info -->
        <div class="flex justify-between items-center mb-6">
          <ResourceSort
            :selected-sort-option="sortOption"
            :total-resources="filteredResources.length"
            @update-sort-option="setSortOption"
          />
        </div>

        <!-- Resources Grid -->
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <ResourceCard
            v-for="resource in filteredResourcesWithHighlights"
            :key="resource.id"
            :title="resource.title"
            :description="resource.description"
            :benefits="resource.benefits"
            :url="resource.url"
            :button-label="getButtonLabel(resource.category)"
            :highlighted-title="resource.highlightedTitle"
            :highlighted-description="resource.highlightedDescription"
            :highlighted-benefits="resource.highlightedBenefits"
          />
        </div>

        <!-- No Results Message -->
        <div
          v-if="!filteredResources.length && !loading"
          class="text-center py-12"
        >
          <h3 class="text-xl font-medium text-gray-900 mb-2">
            No resources found
          </h3>
          <p class="text-gray-500 mb-6">
            Try adjusting your search or filter criteria
          </p>
          <button
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900"
            @click="resetAllFilters"
          >
            Reset Filters
          </button>
        </div>

        <!-- Trending Resources Section -->
        <div
          v-if="filteredResourcesWithHighlights.length > 0 && !loading"
          class="mt-16"
        >
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            Trending Resources
          </h2>
          <div class="grid grid-cols-1 gap-6">
            <ResourceCard
              v-for="resource in trendingResources"
              :key="resource.id"
              :title="resource.title"
              :description="resource.description"
              :benefits="resource.benefits"
              :url="resource.url"
              :button-label="getButtonLabel(resource.category)"
              :highlighted-title="resource.highlightedTitle"
              :highlighted-description="resource.highlightedDescription"
              :highlighted-benefits="resource.highlightedBenefits"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResources, type SortOption } from '~/composables/useResources'
import { useUrlSync } from '~/composables/useUrlSync'
import ResourceCard from '~/components/ResourceCard.vue'
import SearchBar from '~/components/SearchBar.vue'
import ResourceSort from '~/components/ResourceSort.vue'

definePageMeta({
  layout: 'default',
})

// Set page-specific meta tags
useSeoMeta({
  title: 'Free Stuff on the Internet - Free Resources for Developers',
  ogTitle: 'Free Stuff on the Internet - Free Resources for Developers',
  description:
    'Discover amazing free resources available on the internet - from AI tools to hosting services.',
  ogDescription:
    'Discover amazing free resources available on the internet - from AI tools to hosting services.',
  ogImage: '/og-image.jpg',
  ogUrl: 'https://free-stuff-on-the-internet.vercel.app/',
  twitterCard: 'summary_large_image',
})

// Use the resources composable
const {
  filteredResourcesWithHighlights,
  loading,
  error,
  categories,
  pricingModels,
  difficultyLevels,
  technologies,
  filterOptions,
  sortOption,
  updateSearchQuery,
  toggleCategory,
  togglePricingModel,
  toggleDifficultyLevel,
  toggleTechnology,
  setSortOption,
  resetFilters,
  resources,
} = useResources()

// Compute trending resources (top 5 by popularity)
const trendingResources = computed(() => {
  if (!resources.value || resources.value.length === 0) return []

  // Get all resources sorted by popularity and apply highlighting if search is active
  const allResources = [...resources.value].sort(
    (a, b) => (b.popularity || 0) - (a.popularity || 0)
  )
  const query = filterOptions.value.searchQuery || ''

  return allResources.slice(0, 5).map(resource => {
    if (query) {
      // Apply highlighting if there's a search query
      const highlightedTitle = highlightMatches(resource.title, query)
      const highlightedDescription = highlightMatches(
        resource.description,
        query
      )
      const highlightedBenefits = resource.benefits.map(benefit =>
        highlightMatches(benefit, query)
      )

      return {
        ...resource,
        highlightedTitle,
        highlightedDescription,
        highlightedBenefits,
      }
    }

    return {
      ...resource,
      highlightedTitle: undefined,
      highlightedDescription: undefined,
      highlightedBenefits: undefined,
    }
  })
})

// Set up URL synchronization
useUrlSync(filterOptions, sortOption)

// Reactive references for filters
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

// Handle search
const handleSearch = (query: string) => {
  updateSearchQuery(query)
}

// Reset all filters
const resetAllFilters = () => {
  resetFilters()
  searchQuery.value = ''
}

// Helper function to get button label based on category
const getButtonLabel = (category: string) => {
  switch (category.toLowerCase()) {
    case 'ai tools':
      return 'Explore AI Tools'
    case 'vps':
      return 'Get VPS'
    case 'web hosting':
      return 'Find Hosting'
    case 'databases':
      return 'Explore Databases'
    case 'cdn':
      return 'Get CDN'
    default:
      return 'Get Free Access'
  }
}

// Function to highlight matching text
const highlightMatches = (text: string, query: string) => {
  if (!query || !text) return text
  try {
    // Escape special regex characters
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedQuery})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
  } catch (e) {
    console.warn('Error highlighting text:', e)
    return text
  }
}

// Function to get related resources based on category
const getRelatedResources = (currentResource: any, allResources: any[]) => {
  if (!currentResource?.category) return []

  return allResources
    .filter(
      (resource: any) =>
        resource.category === currentResource.category &&
        resource.id !== currentResource.id
    )
    .slice(0, 3) // Limit to 3 related resources
}

// Function to get trending resources (top 5 by popularity)
const getTrendingResources = (allResources: any[]) => {
  return [...allResources]
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 5)
}
</script>
