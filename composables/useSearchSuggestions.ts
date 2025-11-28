import { ref, readonly } from 'vue'
import type { Resource } from '~/types/resource'

// Define search suggestion types
interface SuggestionResult {
  id: string
  text: string
  type: 'resource' | 'category' | 'tag' | 'popular'
  score: number
  resourceId?: string
  metadata?: Record<string, any>
}

// Composable for managing search suggestions functionality
export const useSearchSuggestions = () => {
  const suggestions = ref<SuggestionResult[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get suggestions from API
  const fetchSuggestions = async (
    query: string,
    limit: number = 5
  ): Promise<SuggestionResult[]> => {
    if (!query.trim()) {
      suggestions.value = []
      return []
    }

    loading.value = true
    error.value = null

    try {
      // Use the API endpoint we created
      const response = await $fetch(`/api/search/suggestions`, {
        params: {
          q: query,
          limit: limit.toString(),
        },
      })

      if (response.success) {
        suggestions.value = response.data
        return response.data
      } else {
        throw new Error(response.message || 'Failed to fetch suggestions')
      }
    } catch (err: any) {
      error.value =
        err.message || 'An error occurred while fetching suggestions'
      console.error('Error fetching search suggestions:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Get suggestions from local resources for client-side fallback
  const getLocalSuggestions = (
    query: string,
    resources: readonly Resource[],
    limit: number = 5
  ): SuggestionResult[] => {
    if (!query.trim()) {
      return []
    }

    // Create local search index using Fuse.js
    const Fuse = require('fuse.js')
    const fuse = new Fuse(resources, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'benefits', weight: 0.2 },
        { name: 'tags', weight: 0.1 },
      ],
      threshold: 0.3,
      includeScore: true,
    })

    // Perform search
    const results = fuse.search(query, { limit })

    // Format results as suggestions
    return results.map(item => ({
      id: item.item.id,
      text: item.item.title,
      type: 'resource',
      score: item.score || 0,
      resourceId: item.item.id,
      metadata: {
        description: item.item.description,
        category: item.item.category,
        tags: item.item.tags,
      },
    }))
  }

  // Get popular search suggestions (could be from analytics data)
  const getPopularSuggestions = async (): Promise<SuggestionResult[]> => {
    try {
      // In a real implementation, this would fetch popular searches from analytics
      // For now, we'll return a static list or fetch from a popular searches endpoint
      const response = await $fetch('/api/v1/analytics/popular-searches', {
        default: () => ({ success: true, data: [] }),
      })

      if (response.success) {
        return response.data
      } else {
        return []
      }
    } catch (err) {
      console.error('Error fetching popular suggestions:', err)
      return []
    }
  }

  return {
    suggestions: readonly(suggestions),
    loading: readonly(loading),
    error: readonly(error),
    fetchSuggestions,
    getLocalSuggestions,
    getPopularSuggestions,
  }
}
