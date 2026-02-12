import { computed, ref, readonly, watch } from 'vue'
import type { SortOption } from '~/types/resource'
import { useResourceData } from './useResourceData'
import { useAdvancedResourceSearch } from './useAdvancedResourceSearch'
import { toggleArrayItem } from '~/utils/filter-utils'
import { useResourceSort } from './useResourceSort'
import { trackSearch, trackFilter } from '~/utils/analytics'
import { animationConfig } from '~/configs/animation.config'

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

  const filteredResources = computed(() => {
    if (!resources.value.length) {
      return []
    }

    const query = filterOptions.value.searchQuery || ''
    const result = advancedSearch.advancedSearchResources(
      query,
      filterOptions.value
    )

    return sortResources(result, sortOption.value)
  })

  const facetCounts = computed(() => {
    const query = filterOptions.value.searchQuery || ''
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

  return {
    filterOptions: readonly(filterOptions),
    sortOption: readonly(sortOption),
    filteredResources,
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
