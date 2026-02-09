import { computed } from 'vue'
import type { Resource } from '~/types/resource'
import { homepageConfig } from '~/configs/homepage.config'

export const useHomePage = (resources: Resource[]) => {
  const trendingResources = computed(() => {
    if (!resources || resources.length === 0) return []

    return [...resources]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, homepageConfig.resources.trendingLimit)
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
      .slice(0, homepageConfig.resources.relatedLimit)
  }

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
