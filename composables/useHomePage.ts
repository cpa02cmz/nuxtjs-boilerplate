import { computed } from 'vue'
import type { Resource } from '~/types/resource'
import { RECOMMENDATION_LIMITS } from '~/configs/recommendation.config'

export const useHomePage = (resources: Resource[]) => {
  const trendingResources = computed(() => {
    if (!resources || resources.length === 0) return []

    return [...resources]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, RECOMMENDATION_LIMITS.homeTrending)
  })

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
      .slice(0, RECOMMENDATION_LIMITS.homePopular)
  }

  const getTrendingResources = (allResources: Resource[]): Resource[] => {
    return [...allResources]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, RECOMMENDATION_LIMITS.homeTrending)
  }

  return {
    trendingResources,
    getRelatedResources,
    getTrendingResources,
  }
}
