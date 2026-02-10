import { ref, readonly } from 'vue'
import type { FilterOptions } from '~/types/resource'
import { toggleArrayItem } from '~/utils/filter-utils'

// Composable for managing resource filters
export const useResourceFilters = () => {
  const filterOptions = ref<FilterOptions>({
    searchQuery: '',
    categories: [],
    pricingModels: [],
    difficultyLevels: [],
    technologies: [],
    tags: [],
    dateRange: 'anytime',
  })

  const updateSearchQuery = (query: string) => {
    filterOptions.value.searchQuery = query
  }

  const toggleCategory = (category: string) => {
    filterOptions.value.categories = toggleArrayItem(
      [...(filterOptions.value.categories || [])],
      category
    )
  }

  const togglePricingModel = (pricingModel: string) => {
    filterOptions.value.pricingModels = toggleArrayItem(
      [...(filterOptions.value.pricingModels || [])],
      pricingModel
    )
  }

  const toggleDifficultyLevel = (difficulty: string) => {
    filterOptions.value.difficultyLevels = toggleArrayItem(
      [...(filterOptions.value.difficultyLevels || [])],
      difficulty
    )
  }

  const toggleTechnology = (technology: string) => {
    filterOptions.value.technologies = toggleArrayItem(
      [...(filterOptions.value.technologies || [])],
      technology
    )
  }

  const toggleTag = (tag: string) => {
    filterOptions.value.tags = toggleArrayItem(
      [...(filterOptions.value.tags || [])],
      tag
    )
  }

  const setDateRange = (dateRange: string) => {
    filterOptions.value.dateRange = dateRange
  }

  const resetFilters = () => {
    filterOptions.value = {
      searchQuery: '',
      categories: [],
      pricingModels: [],
      difficultyLevels: [],
      technologies: [],
      tags: [],
      dateRange: 'anytime',
    }
  }

  return {
    filterOptions: readonly(filterOptions),
    updateSearchQuery,
    toggleCategory,
    togglePricingModel,
    toggleDifficultyLevel,
    toggleTechnology,
    toggleTag,
    setDateRange,
    resetFilters,
  }
}
