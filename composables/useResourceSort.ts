import { computed, type ComputedRef } from 'vue'
import type { Resource, SortOption } from '~/types/resource'
import { parseDate } from '~/utils/filter-utils'
import { SORT_OPTIONS } from '~/configs/sort.config'

// Composable for handling resource sorting
export const useResourceSort = (
  resources: ComputedRef<Resource[]>,
  sortOption: ComputedRef<SortOption>
) => {
  const sortResources = (
    resourcesToSort: Resource[],
    currentSortOption: SortOption
  ): Resource[] => {
    const result = [...resourcesToSort]

    if (currentSortOption === SORT_OPTIONS.RELEVANCE) {
      return result
    }

    result.sort((a, b) => {
      switch (currentSortOption) {
        case SORT_OPTIONS.ALPHABETICAL_ASC:
          return a.title.localeCompare(b.title)
        case SORT_OPTIONS.ALPHABETICAL_DESC:
          return b.title.localeCompare(a.title)
        case SORT_OPTIONS.POPULARITY_DESC:
          return (b.popularity || 0) - (a.popularity || 0)
        case SORT_OPTIONS.DATE_ADDED_DESC:
          return parseDate(b.dateAdded) - parseDate(a.dateAdded)
        default:
          return 0
      }
    })

    return result
  }

  const sortedResources = computed(() => {
    if (!resources.value || !resources.value.length) {
      return []
    }
    return sortResources(resources.value, sortOption.value)
  })

  return {
    sortedResources,
    sortResources,
  }
}
