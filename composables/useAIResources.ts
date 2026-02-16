import { computed } from 'vue'
import { useResources } from '~/composables/useResources'
import { categoriesConfig } from '~/configs/categories.config'

// Flexy hates hardcoded AI categories! Now using categoriesConfig.ai.categories
function isAICategory(category: string): boolean {
  return categoriesConfig.ai.categories.some(aiCategory =>
    category.toLowerCase().includes(aiCategory.toLowerCase())
  )
}

export const useAIResources = () => {
  const {
    filteredResources,
    loading,
    error,
    categories,
    filterOptions,
    sortOption,
    updateSearchQuery,
    toggleCategory,
    setSortOption,
    resetFilters,
  } = useResources()

  const aiResources = computed(() => {
    return filteredResources.value.filter(resource =>
      isAICategory(resource.category)
    )
  })

  const allCategories = computed(() => {
    return categories.value.filter(category => isAICategory(category))
  })

  const hasAIResources = computed(() => {
    return aiResources.value.length > 0
  })

  return {
    aiResources,
    filteredResources,
    hasAIResources,
    loading,
    error,
    categories: allCategories,
    filterOptions,
    sortOption,
    updateSearchQuery,
    toggleCategory,
    setSortOption,
    resetFilters,
  }
}
