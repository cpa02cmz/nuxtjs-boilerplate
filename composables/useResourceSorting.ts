import { computed, Ref } from 'vue'
import { Resource, FilterOptions, SortOption } from './useResourceFilters'

// Composable for managing resource filtering and sorting
export const useResourceSorting = (
  resources: Ref<Resource[]>,
  filterOptions: Ref<FilterOptions>,
  sortOption: Ref<SortOption>
) => {
  // Filter and search resources
  const filteredResources = computed(() => {
    if (!resources.value.length) {
      return []
    }

    let result: Resource[] = []

    // Apply category filter
    if (
      filterOptions.value.categories &&
      filterOptions.value.categories.length > 0
    ) {
      result = resources.value.filter(resource =>
        filterOptions.value.categories!.includes(resource.category)
      )
    } else {
      result = [...resources.value]
    }

    // Apply pricing model filter
    if (
      filterOptions.value.pricingModels &&
      filterOptions.value.pricingModels.length > 0
    ) {
      result = result.filter(resource =>
        filterOptions.value.pricingModels!.includes(resource.pricingModel)
      )
    }

    // Apply difficulty level filter
    if (
      filterOptions.value.difficultyLevels &&
      filterOptions.value.difficultyLevels.length > 0
    ) {
      result = result.filter(resource =>
        filterOptions.value.difficultyLevels!.includes(resource.difficulty)
      )
    }

    // Apply technology filter
    if (
      filterOptions.value.technologies &&
      filterOptions.value.technologies.length > 0
    ) {
      result = result.filter(resource =>
        resource.technology.some(tech =>
          filterOptions.value.technologies!.includes(tech)
        )
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption.value) {
        case 'alphabetical-asc':
          return a.title.localeCompare(b.title)
        case 'alphabetical-desc':
          return b.title.localeCompare(a.title)
        case 'popularity-desc':
          return b.popularity - a.popularity
        case 'date-added-desc':
          return (
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
          )
        default:
          return 0
      }
    })

    return result
  })

  return {
    filteredResources,
  }
}
