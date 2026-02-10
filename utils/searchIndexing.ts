import Fuse from 'fuse.js'
import type { Resource } from '~/types/resource'
import { searchConfig } from '~/configs/search.config'
import { limitsConfig } from '~/configs/limits.config'
import { thresholdsConfig } from '~/configs/thresholds.config'

// Define search index structure
interface SearchIndex {
  resources: Fuse<Resource>
  tags: Set<string>
  categories: Set<string>
  popularSearches: Map<string, number>
}

// Flexy hates hardcoded values! Using configurable thresholds.
const MAX_POPULAR_SEARCHES = thresholdsConfig.searchIndex.maxPopularSearches
const POPULAR_SEARCHES_TRIM_THRESHOLD =
  thresholdsConfig.searchIndex.trimThreshold

// Search index manager utility
class SearchIndexManager {
  private index: SearchIndex | null = null
  private resources: Resource[] = []

  // Initialize the search index with resources
  initialize(resources: Resource[]) {
    this.resources = resources

    // Create Fuse.js index for resources
    const fuseIndex = new Fuse(resources, {
      keys: [
        { name: 'title', weight: searchConfig.suggestionWeights.name },
        {
          name: 'description',
          weight: searchConfig.suggestionWeights.description,
        },
        { name: 'benefits', weight: searchConfig.keys.tags.weight },
        { name: 'tags', weight: searchConfig.keys.category.weight },
      ],
      threshold: searchConfig.suggestions.threshold,
      includeScore: searchConfig.fuse.includeScore,
      useExtendedSearch: searchConfig.fuse.useExtendedSearch,
      minMatchCharLength: searchConfig.suggestions.minMatchCharLength,
    })

    // Extract unique tags and categories
    const tags = new Set<string>()
    const categories = new Set<string>()

    resources.forEach(resource => {
      if (resource.tags) {
        resource.tags.forEach(tag => tags.add(tag))
      }
      if (resource.category) {
        categories.add(resource.category)
      }
    })

    // Initialize popular searches map
    const popularSearches = new Map<string, number>()

    this.index = {
      resources: fuseIndex,
      tags,
      categories,
      popularSearches,
    }
  }

  // Get the search index (initialize if not already done)
  getIndex(resources?: Resource[]): SearchIndex {
    if (!this.index || (resources && resources !== this.resources)) {
      if (resources) {
        this.initialize(resources)
      } else {
        throw new Error(
          'Search index not initialized and no resources provided'
        )
      }
    }
    if (!this.index) {
      throw new Error('Search index initialization failed')
    }
    return this.index
  }

  // Update the index when resources change
  updateResources(resources: Resource[]) {
    this.initialize(resources)
  }

  // Add a single resource to the index
  addResource(resource: Resource) {
    if (!this.index) {
      throw new Error('Search index not initialized')
    }

    // Note: Fuse.js doesn't have a direct add method, so we reinitialize
    this.resources.push(resource)

    // Update tags and categories
    if (resource.tags) {
      resource.tags.forEach(tag => this.index!.tags.add(tag))
    }
    if (resource.category) {
      this.index!.categories.add(resource.category)
    }

    // Rebuild the fuse index
    this.index.resources = new Fuse(this.resources, {
      keys: [
        { name: 'title', weight: searchConfig.suggestionWeights.name },
        {
          name: 'description',
          weight: searchConfig.suggestionWeights.description,
        },
        { name: 'benefits', weight: searchConfig.keys.tags.weight },
        { name: 'tags', weight: searchConfig.keys.category.weight },
      ],
      threshold: searchConfig.suggestions.threshold,
      includeScore: searchConfig.fuse.includeScore,
      useExtendedSearch: searchConfig.fuse.useExtendedSearch,
      minMatchCharLength: searchConfig.suggestions.minMatchCharLength,
    })
  }

  // Remove a resource from the index
  removeResource(resourceId: string) {
    if (!this.index) {
      throw new Error('Search index not initialized')
    }

    // Filter out the resource
    this.resources = this.resources.filter(
      resource => resource.id !== resourceId
    )

    // Rebuild the fuse index
    this.index.resources = new Fuse(this.resources, {
      keys: [
        { name: 'title', weight: searchConfig.suggestionWeights.name },
        {
          name: 'description',
          weight: searchConfig.suggestionWeights.description,
        },
        { name: 'benefits', weight: searchConfig.keys.tags.weight },
        { name: 'tags', weight: searchConfig.keys.category.weight },
      ],
      threshold: searchConfig.suggestions.threshold,
      includeScore: searchConfig.fuse.includeScore,
      useExtendedSearch: searchConfig.fuse.useExtendedSearch,
      minMatchCharLength: searchConfig.suggestions.minMatchCharLength,
    })

    // Rebuild tags and categories
    const tags = new Set<string>()
    const categories = new Set<string>()

    this.resources.forEach(resource => {
      if (resource.tags) {
        resource.tags.forEach(tag => tags.add(tag))
      }
      if (resource.category) {
        categories.add(resource.category)
      }
    })

    this.index.tags = tags
    this.index.categories = categories
  }

  // Get all available tags
  getTags(): string[] {
    if (!this.index) {
      throw new Error('Search index not initialized')
    }
    return Array.from(this.index.tags)
  }

  // Get all available categories
  getCategories(): string[] {
    if (!this.index) {
      throw new Error('Search index not initialized')
    }
    return Array.from(this.index.categories)
  }

  // Track a search query for popularity
  // FIXED: Added size limits and query normalization to prevent unbounded growth
  trackSearchQuery(query: string) {
    if (!this.index) {
      throw new Error('Search index not initialized')
    }

    // Normalize query: trim whitespace and convert to lowercase
    // This prevents storing duplicates like "API", "api", " api "
    const normalizedQuery = query.trim().toLowerCase()

    // Skip empty queries
    if (!normalizedQuery) {
      return
    }

    const currentCount = this.index.popularSearches.get(normalizedQuery) || 0
    this.index.popularSearches.set(normalizedQuery, currentCount + 1)

    // FIXED: Trim the map if it exceeds the threshold to prevent memory leaks
    if (this.index.popularSearches.size > POPULAR_SEARCHES_TRIM_THRESHOLD) {
      this.trimPopularSearches()
    }
  }

  /**
   * Trim popular searches to MAX_POPULAR_SEARCHES by removing least popular entries
   * This prevents unbounded memory growth
   */
  private trimPopularSearches(): void {
    if (!this.index) return

    const entries = Array.from(this.index.popularSearches.entries())

    // Sort by count (ascending) to find least popular
    entries.sort((a, b) => a[1] - b[1])

    // Calculate how many to remove
    const removeCount = entries.length - MAX_POPULAR_SEARCHES

    // Remove least popular entries
    for (let i = 0; i < removeCount; i++) {
      this.index.popularSearches.delete(entries[i][0])
    }
  }

  // Get popular searches
  getPopularSearches(
    limit: number = limitsConfig.analytics.defaultPopularLimit
  ): { query: string; count: number }[] {
    if (!this.index) {
      throw new Error('Search index not initialized')
    }

    // Convert map to array and sort by count
    const popularSearches = Array.from(this.index.popularSearches.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)

    return popularSearches.slice(0, limit)
  }
}

// Create a singleton instance
const searchIndexManager = new SearchIndexManager()

export { searchIndexManager, SearchIndexManager }
