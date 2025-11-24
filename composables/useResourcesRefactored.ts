import { readonly, computed } from 'vue'
import Fuse from 'fuse.js'
import { useResourceData } from './useResourceData'
import { useResourceFilters } from './useResourceFilters'
import { useResourceSearch } from './useResourceSearch'
import { useResourceSorting } from './useResourceSorting'

// Main composable for managing resources - refactored version
export const useResourcesRefactored = () => {
  // Use the smaller composables
  const {
    resources,
    loading,
    error,
    retryCount,
    maxRetries,
    categories,
    pricingModels,
    difficultyLevels,
    technologies,
    retryResources,
  } = useResourceData()

  const {
    filterOptions,
    sortOption,
    updateSearchQuery,
    toggleCategory,
    togglePricingModel,
    toggleDifficultyLevel,
    toggleTechnology,
    setSortOption,
    resetFilters,
  } = useResourceFilters()

  // Initialize Fuse.js for search functionality
  const fuse = computed(() => {
    if (resources.value.length > 0) {
      return new Fuse(resources.value, {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'description', weight: 0.3 },
          { name: 'benefits', weight: 0.2 },
          { name: 'tags', weight: 0.1 },
        ],
        threshold: 0.3,
        includeScore: true,
      })
    }
    return null
  })

  // Create filtered resources with sorting but without search
  const { filteredResources } = useResourceSorting(
    resources,
    filterOptions,
    sortOption
  )

  // Enhance the filtered resources with search functionality
  const searchEnhancedResources = computed(() => {
    if (!filterOptions.value.searchQuery) {
      return filteredResources.value
    }

    // Use Fuse.js for search if available
    if (fuse.value) {
      const searchResults = fuse.value.search(filterOptions.value.searchQuery)
      return searchResults.map((item: any) => item.item)
    }

    // Fallback search if Fuse.js is not available
    return filteredResources.value.filter(
      resource =>
        resource.title
          .toLowerCase()
          .includes(filterOptions.value.searchQuery!.toLowerCase()) ||
        resource.description
          .toLowerCase()
          .includes(filterOptions.value.searchQuery!.toLowerCase())
    )
  })

  // Use the search composable functions but pass the resources
  const searchFunctions = useResourceSearch(resources.value)

  return {
    resources: readonly(resources),
    filteredResources: searchEnhancedResources,
    loading: readonly(loading),
    error: readonly(error),
    retryCount: readonly(retryCount),
    maxRetries,
    categories,
    pricingModels,
    difficultyLevels,
    technologies,
    filterOptions: readonly(filterOptions),
    sortOption: readonly(sortOption),
    updateSearchQuery,
    toggleCategory,
    togglePricingModel,
    toggleDifficultyLevel,
    toggleTechnology,
    setSortOption,
    resetFilters,
    highlightSearchTerms: searchFunctions.highlightSearchTerms,
    retryResources,
    getSuggestions: searchFunctions.getSuggestions,
    getSearchHistory: searchFunctions.getSearchHistory,
    addSearchToHistory: searchFunctions.addSearchToHistory,
    clearSearchHistory: searchFunctions.clearSearchHistory,
  }
}
