import { computed, ref, readonly, watch } from 'vue'
import type { SortOption } from '~/types/resource'
import { useResourceData } from './useResourceData'
import { useAdvancedResourceSearch } from './useAdvancedResourceSearch'
import {
  toggleArrayItem,
  filterByAllCriteriaWithDateRange,
} from '~/utils/filter-utils'
import { useResourceSort } from './useResourceSort'
import { trackSearch, trackFilter } from '~/utils/analytics'
import { animationConfig } from '~/configs/animation.config'
import { limitsConfig } from '~/configs/limits.config'

// Extended filter options for search page
export interface SearchPageFilterOptions {
  searchQuery?: string
  categories?: string[]
  pricingModels?: string[]
  difficultyLevels?: string[]
  technologies?: string[]
  tags?: string[]
  benefits?: string[]
  dateRange?: string
}

// Orchestrator composable for search page combining filtering, search, and analytics
export const useSearchPage = () => {
  const {
    resources,
    loading,
    error,
    categories,
    pricingModels,
    difficultyLevels,
    technologies,
  } = useResourceData()

  const allTags = ref<string[]>([])
  const allBenefits = ref<string[]>([])

  // Cache for facet counts to avoid recalculation on every filter change
  const facetCountsCache = ref<Map<string, Record<string, number>>>(new Map())

  watch(
    () => resources.value,
    newResources => {
      const tagsSet = new Set<string>()
      const benefitsSet = new Set<string>()

      newResources.forEach(resource => {
        resource.tags?.forEach(tag => tagsSet.add(tag))
        resource.benefits?.forEach(benefit => benefitsSet.add(benefit))
      })

      allTags.value = Array.from(tagsSet).sort()
      allBenefits.value = Array.from(benefitsSet).sort()

      // Clear facet counts cache when resources change to ensure data consistency
      facetCountsCache.value.clear()
    },
    { immediate: true }
  )

  const filterOptions = ref<SearchPageFilterOptions>({
    searchQuery: '',
    categories: [],
    pricingModels: [],
    difficultyLevels: [],
    technologies: [],
    tags: [],
    benefits: [],
    dateRange: 'anytime',
  })

  const sortOption = ref<SortOption>('relevance')

  const advancedSearch = useAdvancedResourceSearch(resources.value)

  const { sortResources } = useResourceSort(
    computed(() => [...resources.value]),
    computed(() => sortOption.value)
  )

  const maxCacheSize = limitsConfig.search.maxCacheSize

  // Computed property for search results based on query only (not filters)
  const searchResultsByQuery = computed(() => {
    if (!resources.value.length) {
      return []
    }

    const query = filterOptions.value.searchQuery || ''
    return advancedSearch.advancedSearchResources(query)
  })

  // Computed property for filtered resources (applies filters to search results)
  const filteredResources = computed(() => {
    if (!resources.value.length) {
      return []
    }

    const query = filterOptions.value.searchQuery || ''
    // Get search results for the query (cached internally by advancedSearch)
    let results = advancedSearch.advancedSearchResources(query)

    // Apply filters separately to avoid recalculating search on every filter change
    if (results.length > 0 && hasActiveFilters(filterOptions.value)) {
      results = filterByAllCriteriaWithDateRange(results, filterOptions.value)
    }

    return sortResources(results, sortOption.value)
  })

  // Helper function to check if any filters are active
  const hasActiveFilters = (filters: SearchPageFilterOptions): boolean => {
    return !!(
      (filters.categories && filters.categories.length > 0) ||
      (filters.pricingModels && filters.pricingModels.length > 0) ||
      (filters.difficultyLevels && filters.difficultyLevels.length > 0) ||
      (filters.technologies && filters.technologies.length > 0) ||
      (filters.tags && filters.tags.length > 0) ||
      (filters.benefits && filters.benefits.length > 0) ||
      (filters.dateRange && filters.dateRange !== 'anytime')
    )
  }

  // Computed property for facet counts with caching
  const facetCounts = computed(() => {
    const query = filterOptions.value.searchQuery || ''
    const cacheKey = query

    // Check cache first
    const cached = facetCountsCache.value.get(cacheKey)
    if (cached) {
      return cached
    }

    // Calculate facet counts based on search results only (before filters)
    // Note: calculateAllFacetCounts internally calls advancedSearchResources
    const allFacets = advancedSearch.calculateAllFacetCounts(query)

    const allCounts: Record<string, number> = {}

    Object.entries(allFacets.category).forEach(([key, value]) => {
      allCounts[`category_${key}`] = value
    })

    Object.entries(allFacets.pricingModel).forEach(([key, value]) => {
      allCounts[`pricing_${key}`] = value
    })

    Object.entries(allFacets.difficulty).forEach(([key, value]) => {
      allCounts[`difficulty_${key}`] = value
    })

    Object.entries(allFacets.technology).forEach(([key, value]) => {
      allCounts[`technology_${key}`] = value
    })

    Object.entries(allFacets.tags).forEach(([key, value]) => {
      allCounts[`tag_${key}`] = value
    })

    Object.entries(allFacets.benefits).forEach(([key, value]) => {
      allCounts[`benefit_${key}`] = value
    })

    // Cache the results
    if (facetCountsCache.value.size >= maxCacheSize) {
      // Remove oldest entry (simple FIFO)
      const firstKey = facetCountsCache.value.keys().next().value
      if (firstKey !== undefined) {
        facetCountsCache.value.delete(firstKey)
      }
    }
    facetCountsCache.value.set(cacheKey, allCounts)

    return allCounts
  })

  const updateSearchQuery = (query: string) => {
    filterOptions.value.searchQuery = query
  }

  const toggleFilterOption = (
    filterKey: keyof SearchPageFilterOptions,
    item: string
  ) => {
    const currentArray = filterOptions.value[filterKey] as
      | string[]
      | string
      | undefined
    if (Array.isArray(currentArray)) {
      ;(filterOptions.value[filterKey] as string[]) = toggleArrayItem(
        currentArray,
        item
      )
    }
    trackFilter(filterKey.replace(/s$/, ''), item)
  }

  const toggleCategory = (category: string) => {
    toggleFilterOption('categories', category)
  }

  const togglePricingModel = (pricingModel: string) => {
    toggleFilterOption('pricingModels', pricingModel)
  }

  const toggleDifficultyLevel = (difficultyLevel: string) => {
    toggleFilterOption('difficultyLevels', difficultyLevel)
  }

  const toggleTechnology = (technology: string) => {
    toggleFilterOption('technologies', technology)
  }

  const toggleTag = (tag: string) => {
    toggleFilterOption('tags', tag)
  }

  const toggleBenefit = (benefit: string) => {
    toggleFilterOption('benefits', benefit)
  }

  const setDateRange = (dateRange: string) => {
    filterOptions.value.dateRange = dateRange
    trackFilter('dateRange', dateRange)
  }

  const setSortOption = (option: SortOption) => {
    sortOption.value = option
  }

  const resetFilters = () => {
    filterOptions.value = {
      searchQuery: '',
      categories: [],
      pricingModels: [],
      difficultyLevels: [],
      technologies: [],
      tags: [],
      benefits: [],
      dateRange: 'anytime',
    }
    sortOption.value = 'relevance'
  }

  const handleSearch = (query: string) => {
    updateSearchQuery(query)

    setTimeout(() => {
      trackSearch(query, filteredResources.value.length)
    }, animationConfig.analytics.trackingDelayMs)
  }

  // Clear cache when filters are reset
  const clearFacetCache = () => {
    facetCountsCache.value.clear()
  }

  return {
    filterOptions: readonly(filterOptions),
    sortOption: readonly(sortOption),
    filteredResources,
    searchResultsByQuery,
    facetCounts,
    updateSearchQuery,
    toggleCategory,
    togglePricingModel,
    toggleDifficultyLevel,
    toggleTechnology,
    toggleTag,
    toggleBenefit,
    setDateRange,
    setSortOption,
    resetFilters,
    handleSearch,
    clearFacetCache,
    savedSearches: advancedSearch.savedSearches,
    saveSearch: advancedSearch.saveSearch,
    removeSavedSearch: advancedSearch.removeSavedSearch,
    getPopularSearches: advancedSearch.getPopularSearches,
    getZeroResultSearches: advancedSearch.getZeroResultSearches,
    getRelatedSearches: advancedSearch.getRelatedSearches,
    createSearchSnippet: advancedSearch.createSearchSnippet,
    highlightSearchTerms: advancedSearch.highlightSearchTerms,
    loading,
    error,
    categories,
    pricingModels,
    difficultyLevels,
    technologies,
    tags: allTags,
    benefits: allBenefits,
  }
}
