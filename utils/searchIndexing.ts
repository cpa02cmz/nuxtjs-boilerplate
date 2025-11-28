import Fuse from 'fuse.js'
import type { Resource } from '~/types/resource'

// Define search index types
interface SearchIndex {
  fuse: Fuse<Resource>
  resources: Resource[]
  lastUpdated: Date
  stats: {
    totalResources: number
    indexedFields: string[]
    lastQueryTime: number
  }
}

// Search index manager for efficient search operations
class SearchIndexManager {
  private indexes: Map<string, SearchIndex> = new Map()
  private defaultIndexName = 'default'

  // Create or update a search index
  createIndex(
    name: string,
    resources: readonly Resource[],
    options?: Fuse.IFuseOptions<Resource>
  ): SearchIndex {
    const defaultOptions: Fuse.IFuseOptions<Resource> = {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'benefits', weight: 0.2 },
        { name: 'tags', weight: 0.1 },
      ],
      threshold: 0.3,
      includeScore: true,
      useExtendedSearch: true,
    }

    // Merge provided options with defaults
    const finalOptions = { ...defaultOptions, ...options }

    const fuse = new Fuse([...resources], finalOptions)

    const index: SearchIndex = {
      fuse,
      resources: [...resources],
      lastUpdated: new Date(),
      stats: {
        totalResources: resources.length,
        indexedFields:
          finalOptions.keys?.map(key =>
            typeof key === 'string' ? key : key.name
          ) || [],
        lastQueryTime: 0,
      },
    }

    this.indexes.set(name, index)
    return index
  }

  // Get an existing index
  getIndex(name: string = this.defaultIndexName): SearchIndex | null {
    return this.indexes.get(name) || null
  }

  // Update an existing index with new resources
  updateIndex(name: string, resources: readonly Resource[]): void {
    const existingIndex = this.indexes.get(name)
    if (existingIndex) {
      // Create a new index with updated resources
      this.createIndex(name, resources, {
        keys: existingIndex.fuse.options.keys as any,
        threshold: existingIndex.fuse.options.threshold,
        includeScore: existingIndex.fuse.options.includeScore,
        useExtendedSearch: existingIndex.fuse.options.useExtendedSearch,
      })
    }
  }

  // Search within an index
  search(
    query: string,
    indexName: string = this.defaultIndexName,
    limit?: number
  ): Resource[] {
    const index = this.indexes.get(indexName)
    if (!index) {
      throw new Error(`Search index '${indexName}' not found`)
    }

    const startTime = Date.now()

    const results = index.fuse.search(query, { limit })

    const endTime = Date.now()
    index.stats.lastQueryTime = endTime - startTime

    return results.map(item => item.item)
  }

  // Get search suggestions from an index
  getSuggestions(
    query: string,
    indexName: string = this.defaultIndexName,
    limit: number = 5
  ): Resource[] {
    const index = this.indexes.get(indexName)
    if (!index) {
      throw new Error(`Search index '${indexName}' not found`)
    }

    const startTime = Date.now()

    const results = index.fuse.search(query, { limit })

    const endTime = Date.now()
    index.stats.lastQueryTime = endTime - startTime

    return results.map(item => item.item)
  }

  // Get index statistics
  getStats(
    indexName: string = this.defaultIndexName
  ): SearchIndex['stats'] | null {
    const index = this.indexes.get(indexName)
    return index ? { ...index.stats } : null
  }

  // Remove an index
  removeIndex(name: string): void {
    this.indexes.delete(name)
  }

  // Clear all indexes
  clearAll(): void {
    this.indexes.clear()
  }

  // Get all available index names
  getAvailableIndexes(): string[] {
    return Array.from(this.indexes.keys())
  }

  // Check if an index exists
  hasIndex(name: string): boolean {
    return this.indexes.has(name)
  }
}

// Create a singleton instance of the search index manager
export const searchIndexManager = new SearchIndexManager()

// Utility function to create an optimized search index for resources
export const createOptimizedResourceIndex = (
  resources: readonly Resource[],
  indexName: string = 'resources'
): SearchIndex => {
  return searchIndexManager.createIndex(indexName, resources, {
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'description', weight: 0.3 },
      { name: 'benefits', weight: 0.2 },
      { name: 'tags', weight: 0.1 },
    ],
    threshold: 0.3,
    includeScore: true,
    useExtendedSearch: true,
    minMatchCharLength: 2,
  })
}

// Utility function to search with performance optimization
export const optimizedSearch = (
  query: string,
  resources: readonly Resource[],
  limit: number = 10
): Resource[] => {
  const indexName = `temp-${Date.now()}-${Math.random()}`

  // Create temporary index for this search
  const index = searchIndexManager.createIndex(indexName, resources)
  const results = searchIndexManager.search(query, indexName, limit)

  // Clean up temporary index
  searchIndexManager.removeIndex(indexName)

  return results
}

// Utility function to build a search index for suggestions
export const createSuggestionsIndex = (
  resources: readonly Resource[],
  indexName: string = 'suggestions'
): SearchIndex => {
  return searchIndexManager.createIndex(indexName, resources, {
    keys: [
      { name: 'title', weight: 0.5 },
      { name: 'tags', weight: 0.3 },
      { name: 'category', weight: 0.2 },
    ],
    threshold: 0.2, // More permissive for suggestions
    includeScore: true,
    minMatchCharLength: 1, // Allow single character matches for suggestions
    shouldSort: true,
  })
}

// Function to update an existing index with new resources
export const updateSearchIndex = (
  resources: readonly Resource[],
  indexName: string = 'default'
): void => {
  searchIndexManager.updateIndex(indexName, resources)
}

// Function to initialize search indexes with resources
export const initializeSearchIndexes = async (
  resources: readonly Resource[]
): Promise<void> => {
  // Create the main resources index
  createOptimizedResourceIndex(resources, 'resources')

  // Create the suggestions index
  createSuggestionsIndex(resources, 'suggestions')
}

// Function to get search performance metrics
export const getSearchMetrics = (
  indexName: string = 'resources'
): {
  avgQueryTime: number
  totalResources: number
  lastUpdated: Date | null
} | null => {
  const index = searchIndexManager.getIndex(indexName)
  if (!index) {
    return null
  }

  return {
    avgQueryTime: index.stats.lastQueryTime,
    totalResources: index.stats.totalResources,
    lastUpdated: index.lastUpdated,
  }
}
