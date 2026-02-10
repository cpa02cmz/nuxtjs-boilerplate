import { ref, readonly, computed } from 'vue'
import type { Resource } from '~/types/resource'
import type { SuggestionResult } from '~/types/search'
import { useSearchHistory } from '~/composables/useSearchHistory'
import { createFuseForSuggestions } from '~/utils/fuseHelper'
import { searchConfig } from '~/configs/search.config'

// Composable for managing search suggestions engine
export const useSearchSuggestions = (resources: readonly Resource[]) => {
  const { addSearchToHistory, getSearchHistory } = useSearchHistory()
  const fuse = ref(createFuseForSuggestions(resources))
  const popularSearches = ref<{ query: string; count: number }[]>([])

  // Pre-compute tag and category counts for O(1) lookups
  const tagCountsMap = computed(() => {
    const map = new Map<string, number>()
    resources.forEach(resource => {
      resource.tags?.forEach(tag => {
        map.set(tag, (map.get(tag) || 0) + 1)
      })
    })
    return map
  })

  const categoryCountsMap = computed(() => {
    const map = new Map<string, number>()
    resources.forEach(resource => {
      if (resource.category) {
        map.set(resource.category, (map.get(resource.category) || 0) + 1)
      }
    })
    return map
  })

  // Initialize Fuse.js with optimized configuration for suggestions
  const initSearch = () => {
    // Fuse instance already created by createFuseForSuggestions
  }

  // Generate suggestions based on search query
  const generateSuggestions = (
    query: string,
    limit: number = searchConfig.behavior.maxSuggestions
  ): SuggestionResult[] => {
    if (!query || !fuse.value) return []

    // Perform fuzzy search to find matching resources
    const searchResults = fuse.value.search(query, {
      limit: limit * searchConfig.suggestions.limitMultiplier,
    }) // Get more results for better ranking

    // Transform search results to suggestion format
    const suggestions: SuggestionResult[] = []

    // Add resource suggestions
    searchResults.forEach(result => {
      suggestions.push({
        text: result.item.title,
        type: 'resource',
        score: result.score
          ? 1 - result.score
          : searchConfig.suggestions.scores.default,
        resourceId: result.item.id,
        metadata: {
          description:
            result.item.description.substring(
              0,
              searchConfig.behavior.descriptionTruncateLength
            ) +
            (result.item.description.length >
            searchConfig.behavior.descriptionTruncateLength
              ? '...'
              : ''),
          category: result.item.category,
          tags: result.item.tags,
          url: result.item.url,
        },
      })
    })

    // Add tag and category suggestions based on query (O(k) where k is Fuse search results)
    const tagMatches = new Set<string>()
    const categoryMatches = new Set<string>()

    // Only scan resources matched by Fuse.js instead of ALL resources
    // This reduces O(n) to O(k) where k << n for typical searches
    searchResults.forEach(result => {
      const resource = result.item
      if (resource.tags) {
        resource.tags.forEach(tag => {
          if (
            tag.toLowerCase().includes(query.toLowerCase()) &&
            !tagMatches.has(tag)
          ) {
            tagMatches.add(tag)
            if (tagMatches.size <= limit) {
              suggestions.push({
                text: tag,
                type: 'tag',
                score: searchConfig.suggestions.scores.tagMatch,
                metadata: {
                  tag: tag,
                  count: tagCountsMap.value.get(tag) || 0,
                },
              })
            }
          }
        })
      }
      if (
        resource.category &&
        resource.category.toLowerCase().includes(query.toLowerCase()) &&
        !categoryMatches.has(resource.category)
      ) {
        categoryMatches.add(resource.category)
        suggestions.push({
          text: resource.category,
          type: 'category',
          score: searchConfig.suggestions.scores.categoryMatch,
          metadata: {
            category: resource.category,
            count: categoryCountsMap.value.get(resource.category) || 0,
          },
        })
      }
    })

    // Add popular searches if the query is empty or short
    if (query.length < searchConfig.behavior.minQueryLength + 1) {
      popularSearches.value.slice(0, limit).forEach((popular, index) => {
        suggestions.push({
          text: popular.query,
          type: 'popular',
          score:
            searchConfig.suggestions.scores.popularBase -
            index * searchConfig.suggestions.scores.popularDecrement,
          metadata: {
            count: popular.count,
            popularity: index + 1,
          },
        })
      })
    }

    // Sort suggestions by score (relevance)
    suggestions.sort((a, b) => b.score - a.score)

    // Return only the requested limit
    return suggestions.slice(0, limit)
  }

  // Get search suggestions with debouncing consideration
  const getSearchSuggestions = (
    query: string,
    limit: number = searchConfig.behavior.maxSuggestions
  ) => {
    return generateSuggestions(query, limit)
  }

  // Get popular suggestions
  const getPopularSuggestions = (
    limit: number = searchConfig.behavior.maxSuggestions
  ) => {
    return popularSearches.value.slice(0, limit).map((popular, index) => ({
      text: popular.query,
      type: 'popular' as const,
      score:
        searchConfig.suggestions.scores.popularBase -
        index * searchConfig.suggestions.scores.popularDecrement,
      metadata: {
        count: popular.count,
      },
    }))
  }

  // Get recent search history suggestions
  const getRecentSearches = (
    limit: number = searchConfig.behavior.maxSuggestions
  ) => {
    const history = getSearchHistory()
    return history.slice(0, limit).map((query, index) => ({
      text: query,
      type: 'popular' as const, // Using 'popular' type for recent searches too
      score:
        searchConfig.suggestions.scores.recentBase -
        index * searchConfig.suggestions.scores.recentDecrement,
      metadata: {},
    }))
  }

  // Add to search history (delegated to useSearchHistory composable)
  const addToSearchHistory = addSearchToHistory

  // Add to popular searches
  const addToPopularSearches = (query: string) => {
    const existingIndex = popularSearches.value.findIndex(
      p => p.query === query
    )
    if (existingIndex >= 0) {
      popularSearches.value[existingIndex].count++
      popularSearches.value.sort((a, b) => b.count - a.count)
    } else {
      popularSearches.value.push({ query, count: 1 })
      popularSearches.value.sort((a, b) => b.count - a.count)
      if (
        popularSearches.value.length > searchConfig.cache.maxPopularSearches
      ) {
        popularSearches.value = popularSearches.value.slice(
          0,
          searchConfig.cache.maxPopularSearches
        )
      }
    }
  }

  // Initialize search when composable is created
  initSearch()

  return {
    popularSearches: readonly(popularSearches),
    getSearchSuggestions,
    getPopularSuggestions,
    getRecentSearches,
    addToSearchHistory,
    addToPopularSearches,
    tagCountsMap,
    categoryCountsMap,
  }
}
