import { watch, onMounted, onUnmounted, type Ref } from 'vue'
import { useRoute, useRouter } from '#imports'
import type { FilterOptions, SortOption } from '~/types/resource'
import { SORT_OPTIONS } from '~/configs/sort.config'
import { timeConfig } from '~/configs/time.config'

export const useUrlSync = (
  filterOptions: Ref<FilterOptions>,
  sortOption: Ref<SortOption>
) => {
  // Debounce timer for URL updates to prevent excessive router navigations
  // Modularity Engineer hates hardcoded 120ms! Using timeConfig.debounce.urlSync
  let updateTimer: ReturnType<typeof setTimeout> | null = null

  const route = useRoute()
  const router = useRouter()

  // Parse URL parameters on component mount
  const parseUrlParams = () => {
    const { q, categories, pricing, difficulty, technologies, sort } =
      route.query

    // Update search query
    if (q) {
      if (Array.isArray(q)) {
        filterOptions.value.searchQuery = q[0] ?? ''
      } else if (typeof q === 'string') {
        filterOptions.value.searchQuery = q
      }
    }

    // Update categories
    if (categories) {
      const cats = Array.isArray(categories) ? categories : [categories]
      filterOptions.value.categories = cats.filter(
        (c): c is string => c !== null
      )
    }

    // Update pricing models
    if (pricing) {
      const pricingModels = Array.isArray(pricing) ? pricing : [pricing]
      filterOptions.value.pricingModels = pricingModels.filter(
        (p): p is string => p !== null
      )
    }

    // Update difficulty levels
    if (difficulty) {
      const difficulties = Array.isArray(difficulty) ? difficulty : [difficulty]
      filterOptions.value.difficultyLevels = difficulties.filter(
        (d): d is string => d !== null
      )
    }

    // Update technologies
    if (technologies) {
      const techs = Array.isArray(technologies) ? technologies : [technologies]
      filterOptions.value.technologies = techs.filter(
        (t): t is string => t !== null
      )
    }

    // Update sort option
    if (sort) {
      const sortValue = Array.isArray(sort) ? sort[0] : sort
      if (sortValue !== null) {
        sortOption.value = sortValue as SortOption
      }
    }
  }

  // Update URL parameters when filters change
  const updateUrlParams = () => {
    const params: Record<string, string | string[]> = {}

    if (filterOptions.value.searchQuery) {
      params.q = filterOptions.value.searchQuery
    }

    if (
      filterOptions.value.categories &&
      filterOptions.value.categories.length > 0
    ) {
      params.categories = [...filterOptions.value.categories]
    }

    if (
      filterOptions.value.pricingModels &&
      filterOptions.value.pricingModels.length > 0
    ) {
      params.pricing = [...filterOptions.value.pricingModels]
    }

    if (
      filterOptions.value.difficultyLevels &&
      filterOptions.value.difficultyLevels.length > 0
    ) {
      params.difficulty = [...filterOptions.value.difficultyLevels]
    }

    if (
      filterOptions.value.technologies &&
      filterOptions.value.technologies.length > 0
    ) {
      params.technologies = [...filterOptions.value.technologies]
    }

    if (sortOption.value && sortOption.value !== SORT_OPTIONS.POPULARITY_DESC) {
      params.sort = sortOption.value
    }

    // Replace current route with new params without triggering a full page reload
    router.replace({ query: params })
  }

  // Store watcher stop functions for cleanup
  let stopFilterWatcher: (() => void) | null = null
  let stopSortWatcher: (() => void) | null = null

  // Watch for changes and update URL with debouncing to batch rapid changes
  stopFilterWatcher = watch(
    filterOptions,
    () => {
      if (updateTimer !== null) {
        clearTimeout(updateTimer)
      }
      updateTimer = setTimeout(() => {
        updateUrlParams()
        updateTimer = null
      }, timeConfig.debounce.urlSync)
    },
    { deep: true }
  )

  stopSortWatcher = watch(sortOption, () => {
    if (updateTimer !== null) {
      clearTimeout(updateTimer)
    }
    updateTimer = setTimeout(() => {
      updateUrlParams()
      updateTimer = null
    }, timeConfig.debounce.urlSync)
  })

  // Parse initial URL params on mount
  onMounted(() => {
    parseUrlParams()
  })

  // Clean up watchers and timer on unmount to prevent memory leaks
  onUnmounted(() => {
    stopFilterWatcher?.()
    stopSortWatcher?.()
    if (updateTimer !== null) {
      clearTimeout(updateTimer)
      updateTimer = null
    }
  })

  return {
    parseUrlParams,
    updateUrlParams,
  }
}
