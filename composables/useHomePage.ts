import { computed } from 'vue'
import type { Resource } from '~/types/resource'
import { homepageConfig } from '~/configs/homepage.config'

/**
 * UseHomePage Return Type
 */
export interface UseHomePageReturn {
  /** Computed list of trending resources sorted by popularity */
  trendingResources: ReturnType<typeof computed<Resource[]>>
  /** Get related resources in the same category */
  getRelatedResources: (
    currentResource: Resource | undefined,
    allResources: Resource[]
  ) => Resource[]
  /** Get trending resources sorted by popularity */
  getTrendingResources: (allResources: Resource[]) => Resource[]
}

/**
 * Composable for homepage resource management
 *
 * Provides utilities for managing homepage resource displays including
 * trending resources, related resources, and resource sorting.
 *
 * @param resources - Array of resources to process
 * @returns Object containing trendingResources computed property and helper functions
 *
 * @example
 * ```ts
 * const { trendingResources, getRelatedResources } = useHomePage(resources)
 *
 * // Get trending resources reactively
 * const trending = trendingResources.value
 *
 * // Get related resources for a specific resource
 * const related = getRelatedResources(currentResource, allResources)
 * ```
 */
export const useHomePage = (resources: Resource[]): UseHomePageReturn => {
  /**
   * Computed list of trending resources
   * Sorted by popularity in descending order
   */
  const trendingResources = computed(() => {
    if (!resources || resources.length === 0) return []

    return [...resources]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, homepageConfig.resources.trendingLimit)
  })

  /**
   * Get related resources in the same category
   *
   * @param currentResource - The resource to find related items for
   * @param allResources - Array of all available resources
   * @returns Array of related resources in the same category, excluding the current resource
   */
  const getRelatedResources = (
    currentResource: Resource | undefined,
    allResources: Resource[]
  ): Resource[] => {
    if (!currentResource?.category) return []

    return allResources
      .filter(
        resource =>
          resource.category === currentResource.category &&
          resource.id !== currentResource.id
      )
      .slice(0, homepageConfig.resources.relatedLimit)
  }

  /**
   * Get trending resources sorted by popularity
   *
   * @param allResources - Array of all available resources
   * @returns Array of trending resources sorted by popularity
   */
  const getTrendingResources = (allResources: Resource[]): Resource[] => {
    return [...allResources]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, homepageConfig.resources.trendingLimit)
  }

  return {
    trendingResources,
    getRelatedResources,
    getTrendingResources,
  }
}
