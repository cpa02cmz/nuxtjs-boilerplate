import { readonly, computed } from 'vue'
import type { FuseResult, IFuseOptions } from 'fuse.js'
import type { Resource } from '~/types/resource'
import { sanitizeAndHighlight } from '~/utils/sanitize'
import { createFuseInstance } from '~/utils/fuseHelper'

const searchConfig: Partial<IFuseOptions<Resource>> = {
  keys: [
    { name: 'title', weight: 0.5 },
    { name: 'description', weight: 0.3 },
    { name: 'benefits', weight: 0.15 },
    { name: 'tags', weight: 0.05 },
  ],
  threshold: 0.3,
  includeScore: true,
  distance: 100,
}

export const useResourceSearch = (resources: readonly Resource[]) => {
  const fuse = computed(() => createFuseInstance(resources, searchConfig))

  const searchResources = (query: string): Resource[] => {
    if (!query) return [...resources]

    const fuseInstance = createFuseInstance(resources, searchConfig)
    const searchResults = fuseInstance.search(query)
    return searchResults.map((item: FuseResult<Resource>) => item.item)
  }

  const getSuggestions = (query: string, limit: number = 5): Resource[] => {
    if (!query) return []

    const fuseInstance = createFuseInstance(resources, searchConfig)
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
