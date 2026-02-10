import { readonly } from 'vue'
import type { Resource, FilterOptions } from '~/types/resource'
import { searchAnalyticsTracker } from '~/utils/searchAnalytics'
import { useSearchHistory } from '~/composables/useSearchHistory'
import { useSavedSearches } from '~/composables/useSavedSearches'
import { createFuseInstance } from '~/utils/fuseHelper'
import { parseQuery } from '~/utils/queryParser'
import {
  highlightSearchTerms,
  createSearchSnippet,
} from '~/utils/searchHighlighting'
import { useFacetUtils } from '~/utils/facet-utils'
import { filterByAllCriteriaWithDateRange } from '~/utils/filter-utils'
import { limitsConfig } from '~/configs/limits.config'

type FacetCounts = Record<string, number>

const MAX_CACHE_SIZE = limitsConfig.search.maxCacheSize

export const useAdvancedResourceSearch = (resources: readonly Resource[]) => {
  const { addSearchToHistory } = useSearchHistory()
  const { savedSearches, saveSearch, removeSavedSearch } = useSavedSearches()
  const { calculateAllFacetCounts: calcAllFacets } = useFacetUtils()
  const fuse = createFuseInstance(resources)

  const cachedSearchResults = new Map<string, Resource[]>()
  const searchOrder: string[] = []

  const advancedSearchResources = (
    query: string,
    filters?: FilterOptions
  ): Resource[] => {
    const startTime = performance.now()

    // 1. Perform fuzzy search or return all resources
    let results: Resource[] = []
    const cacheKey = query || '_ALL_RESOURCES_'

    if (cachedSearchResults.has(cacheKey)) {
      searchOrder.splice(searchOrder.indexOf(cacheKey), 1)
      searchOrder.push(cacheKey)
      results = [...cachedSearchResults.get(cacheKey)!]
    } else if (!query || !fuse) {
      results = [...resources]
      searchAnalyticsTracker.trackSearch(query, results, 0)
      cachedSearchResults.set(cacheKey, results)
      searchOrder.push(cacheKey)
    } else {
      const parsed = parseQuery(query)

      if (parsed.terms.length === 0) {
        results = [...resources]
        searchAnalyticsTracker.trackSearch(query, results, 0)
      } else if (parsed.operators.length > 0) {
        const firstTermResults = fuse.search(parsed.terms[0])
        results = firstTermResults.map(item => item.item)

        for (let i = 1; i < parsed.terms.length; i++) {
          const term = parsed.terms[i]
          const operator = parsed.operators[i - 1]

          const termResults = fuse.search(term)
          const termResources = termResults.map(item => item.item)

          if (operator === 'AND') {
            results = results.filter(resource =>
              termResources.some(result => result.id === resource.id)
            )
          } else if (operator === 'OR') {
            const allResults = [...results, ...termResources]
            const resultMap = new Map(allResults.map(r => [r.id, r]))
            results = Array.from(resultMap.values())
          } else if (operator === 'NOT') {
            results = results.filter(
              resource =>
                !termResources.some(result => result.id === resource.id)
            )
          }
        }
      } else {
        for (const term of parsed.terms) {
          const searchResults = fuse.search(term)
          const termResources = searchResults.map(item => item.item)
          results = [...results, ...termResources]
        }

        const resultMap = new Map(results.map(r => [r.id, r]))
        results = Array.from(resultMap.values())
      }

      // Track the original query, not individual terms
      const endTime = performance.now()
      const duration = endTime - startTime
      searchAnalyticsTracker.trackSearch(query, results, duration)

      if (cachedSearchResults.size >= MAX_CACHE_SIZE) {
        const oldestKey = searchOrder.shift()!
        cachedSearchResults.delete(oldestKey)
      }

      cachedSearchResults.set(cacheKey, results)
      searchOrder.push(cacheKey)
    }

    // 2. Apply filters if provided
    if (filters) {
      results = filterByAllCriteriaWithDateRange(results, filters)
    }

    return results
  }

  const calculateFacetCounts = (
    query: string,
    filterKey: keyof Resource
  ): FacetCounts => {
    const allResources = query ? advancedSearchResources(query) : [...resources]
    const counts: FacetCounts = {}

    allResources.forEach(resource => {
      const value = resource[filterKey] as unknown
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((item: string) => {
            counts[item] = (counts[item] || 0) + 1
          })
        } else if (typeof value === 'string') {
          counts[value] = (counts[value] || 0) + 1
        }
      }
    })

    return counts
  }

  const calculateAllFacetCounts = (
    query: string
  ): {
    category: FacetCounts
    pricingModel: FacetCounts
    difficulty: FacetCounts
    technology: FacetCounts
    tags: FacetCounts
    benefits: FacetCounts
  } => {
    const allResources = query ? advancedSearchResources(query) : [...resources]
    return calcAllFacets(allResources)
  }

  const getFacetedResults = (
    query: string,
    filters: Record<string, string[]>
  ) => {
    return advancedSearchResources(query, filters as FilterOptions)
  }

  const getAdvancedSuggestions = (
    query: string,
    limit: number = limitsConfig.search.defaultSuggestionsLimit
  ): Resource[] => {
    if (!query || !fuse) return []

    const searchResults = fuse.search(query, { limit })
    return searchResults.map(item => item.item)
  }

  const addToSearchHistory = addSearchToHistory

  const getPopularSearches = (
    limit: number = limitsConfig.search.defaultPopularSearchesLimit
  ) => {
    return searchAnalyticsTracker.getPopularSearches(limit)
  }

  const getZeroResultSearches = (
    limit: number = limitsConfig.search.defaultZeroResultLimit
  ) => {
    return searchAnalyticsTracker.getZeroResultSearches(limit)
  }

  const getRelatedSearches = (
    query: string,
    limit: number = limitsConfig.search.defaultRelatedSearchesLimit
  ) => {
    return searchAnalyticsTracker.getRelatedSearches(query, limit)
  }

  return {
    fuse: readonly(fuse),
    savedSearches,
    advancedSearchResources,
    calculateFacetCounts,
    calculateAllFacetCounts,
    getFacetedResults,
    getAdvancedSuggestions,
    highlightSearchTerms,
    createSearchSnippet,
    addToSearchHistory,
    saveSearch,
    removeSavedSearch,
    getPopularSearches,
    getZeroResultSearches,
    getRelatedSearches,
  }
}
