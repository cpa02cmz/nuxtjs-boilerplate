import { computed, type ComputedRef, type Ref } from 'vue'
import { useResources } from '~/composables/useResources'
import { categoriesConfig } from '~/configs/categories.config'
import type { Resource, SortOption, FilterOptions } from '~/types/resource'

// ai-agent-engineer: Return type for useAIResources composable
export interface UseAIResourcesReturn {
  /** AI-filtered resources */
  aiResources: ComputedRef<Resource[]>
  /** All filtered resources (from useResources) */
  filteredResources: ComputedRef<Resource[]>
  /** Whether there are any AI resources */
  hasAIResources: ComputedRef<boolean>
  /** Loading state */
  loading: Ref<boolean>
  /** Error state */
  error: Ref<string | null>
  /** AI categories only */
  categories: ComputedRef<string[]>
  /** Filter options */
  filterOptions: Ref<FilterOptions>
  /** Current sort option */
  sortOption: Ref<SortOption>
  /** Update search query */
  updateSearchQuery: (query: string) => void
  /** Toggle category filter */
  toggleCategory: (category: string) => void
  /** Set sort option */
  setSortOption: (option: SortOption) => void
  /** Reset all filters */
  resetFilters: () => void
}

// Flexy hates hardcoded AI categories! Now using categoriesConfig.ai.categories
function isAICategory(category: string): boolean {
  return categoriesConfig.ai.categories.some(aiCategory =>
    category.toLowerCase().includes(aiCategory.toLowerCase())
  )
}

/**
 * Composable for managing AI-related resources
 * Filters resources to only show those in AI categories
 * @returns Typed return object with AI resources and filter controls
 */
export const useAIResources = (): UseAIResourcesReturn => {
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
