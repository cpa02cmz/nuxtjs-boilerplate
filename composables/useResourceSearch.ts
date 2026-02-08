import { readonly, computed } from 'vue'
import type { FuseResult, IFuseOptions } from 'fuse.js'
import type { Resource } from '~/types/resource'
import { sanitizeAndHighlight } from '~/utils/sanitize'
import { createFuseInstance } from '~/utils/fuseHelper'
import { searchConfig } from '~/configs/search.config'

const fuseSearchConfig: Partial<IFuseOptions<Resource>> = {
  keys: [
    { name: 'title', weight: searchConfig.keys.name.weight },
    { name: 'description', weight: searchConfig.keys.description.weight },
    { name: 'benefits', weight: searchConfig.keys.category.weight },
    { name: 'tags', weight: searchConfig.keys.tags.weight },
  ],
  threshold: searchConfig.fuse.threshold,
  includeScore: searchConfig.fuse.includeScore,
  distance: searchConfig.fuse.distance,
}

export const useResourceSearch = (resources: readonly Resource[]) => {
  const fuse = computed(() => createFuseInstance(resources, fuseSearchConfig))

  const searchResources = (query: string): Resource[] => {
    if (!query) return [...resources]

    const fuseInstance = createFuseInstance(resources, fuseSearchConfig)
    const searchResults = fuseInstance.search(query)
    return searchResults.map((item: FuseResult<Resource>) => item.item)
  }

  const getSuggestions = (
    query: string,
    limit: number = searchConfig.behavior.maxSuggestions
  ): Resource[] => {
    if (!query) return []

    const fuseInstance = createFuseInstance(resources, fuseSearchConfig)
    const searchResults = fuseInstance.search(query, { limit })
    return searchResults.map((item: FuseResult<Resource>) => item.item)
  }

  const highlightSearchTerms = (text: string, searchQuery: string): string => {
    if (!searchQuery || !text) return text || ''
    return sanitizeAndHighlight(text, searchQuery)
  }

  return {
    fuse: readonly(fuse),
    searchResources,
    getSuggestions,
    highlightSearchTerms,
  }
}
