import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSearchSuggestions } from '~/composables/useSearchSuggestions'
import type { Resource } from '~/types/resource'

// Mock $fetch for testing
vi.mock('~/composables/useSearchSuggestions', async () => {
  const actual = await vi.importActual('~/composables/useSearchSuggestions')
  return {
    ...actual,
    $fetch: vi.fn(),
  }
})

// Mock resources for testing
const mockResources: readonly Resource[] = [
  {
    id: '1',
    title: 'Test Resource',
    description: 'This is a test resource for AI tools',
    benefits: ['Benefit 1', 'Benefit 2'],
    url: 'https://example.com',
    category: 'AI Tools',
    tags: ['test', 'resource', 'ai'],
    pricing: 'Free',
    difficulty: 'Beginner',
    lastUpdated: '2023-01-01',
  },
  {
    id: '2',
    title: 'Another Resource',
    description: 'This is another test resource for web development',
    benefits: ['Benefit 3'],
    url: 'https://example2.com',
    category: 'Web Development',
    tags: ['web', 'development', 'tool'],
    pricing: 'Freemium',
    difficulty: 'Intermediate',
    lastUpdated: '2023-01-02',
  },
]

describe('useSearchSuggestions', () => {
  let searchSuggestions: ReturnType<typeof useSearchSuggestions>

  beforeEach(() => {
    // Reset the module to clear any mocks
    vi.clearAllMocks()
    searchSuggestions = useSearchSuggestions()
  })

  describe('fetchSuggestions', () => {
    it('should fetch suggestions from API when query is provided', async () => {
      // Mock the API response
      const mockApiResponse = {
        success: true,
        data: [
          {
            id: '1',
            text: 'Test Resource',
            type: 'resource',
            score: 0.1,
            metadata: {
              description: 'This is a test resource for AI tools',
              category: 'AI Tools',
              tags: ['test', 'resource', 'ai'],
            },
          },
        ],
        query: 'test',
        limit: 5,
        total: 1,
      }

      // Mock $fetch to return the mock response
      global.$fetch = vi.fn().mockResolvedValue(mockApiResponse)

      const suggestions = await searchSuggestions.fetchSuggestions('test', 5)

      expect(suggestions).toHaveLength(1)
      expect(suggestions[0].text).toBe('Test Resource')
      expect(suggestions[0].type).toBe('resource')
      expect(global.$fetch).toHaveBeenCalledWith('/api/search/suggestions', {
        params: {
          q: 'test',
          limit: '5',
        },
      })
    })

    it('should return empty array when query is empty', async () => {
      const suggestions = await searchSuggestions.fetchSuggestions('', 5)
      expect(suggestions).toEqual([])
      expect(searchSuggestions.suggestions.value).toEqual([])
    })

    it('should handle API errors gracefully', async () => {
      // Mock $fetch to return an error
      global.$fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const suggestions = await searchSuggestions.fetchSuggestions('test', 5)

      expect(suggestions).toEqual([])
      expect(searchSuggestions.error.value).toBe('Network error')
    })

    it('should set loading state correctly', async () => {
      // Create a promise that resolves later to test loading state
      let resolvePromise: (value: any) => void
      const mockPromise = new Promise(resolve => {
        resolvePromise = resolve
      })

      global.$fetch = vi.fn().mockReturnValue(mockPromise)

      const fetchPromise = searchSuggestions.fetchSuggestions('test', 5)

      // Check that loading is true during the fetch
      expect(searchSuggestions.loading.value).toBe(true)

      // Resolve the promise
      resolvePromise!({
        success: true,
        data: [],
        query: 'test',
        limit: 5,
        total: 0,
      })

      await fetchPromise

      // Check that loading is false after the fetch
      expect(searchSuggestions.loading.value).toBe(false)
    })
  })

  describe('getLocalSuggestions', () => {
    it('should return local suggestions when query is provided', () => {
      const suggestions = searchSuggestions.getLocalSuggestions(
        'test',
        mockResources,
        5
      )

      expect(suggestions).toHaveLength(1)
      expect(suggestions[0].text).toBe('Test Resource')
      expect(suggestions[0].type).toBe('resource')
    })

    it('should return empty array when query is empty', () => {
      const suggestions = searchSuggestions.getLocalSuggestions(
        '',
        mockResources,
        5
      )
      expect(suggestions).toEqual([])
    })

    it('should limit results according to the limit parameter', () => {
      // Add more mock resources to test the limit
      const manyResources: readonly Resource[] = Array.from(
        { length: 10 },
        (_, i) => ({
          id: `${i + 1}`,
          title: `Resource ${i + 1}`,
          description: `Description for resource ${i + 1}`,
          benefits: [`Benefit ${i + 1}`],
          url: `https://example${i + 1}.com`,
          category: 'Test Category',
          tags: [`tag${i + 1}`],
          pricing: 'Free',
          difficulty: 'Beginner',
          lastUpdated: '2023-01-01',
        })
      ) as readonly Resource[]

      const suggestions = searchSuggestions.getLocalSuggestions(
        'Resource',
        manyResources,
        3
      )
      expect(suggestions).toHaveLength(3)
    })
  })

  describe('getPopularSuggestions', () => {
    it('should handle API errors gracefully', async () => {
      // Mock $fetch to return an error for popular searches
      global.$fetch = vi
        .fn()
        .mockRejectedValue(new Error('Analytics API error'))

      const suggestions = await searchSuggestions.getPopularSuggestions()

      // Should return empty array on error
      expect(suggestions).toEqual([])
    })

    it('should return empty array when API returns failure', async () => {
      // Mock $fetch to return a failure response
      global.$fetch = vi.fn().mockResolvedValue({
        success: false,
        message: 'Failed to fetch popular searches',
      })

      const suggestions = await searchSuggestions.getPopularSuggestions()

      expect(suggestions).toEqual([])
    })
  })

  describe('reactive state', () => {
    it('should maintain reactive state for suggestions', async () => {
      expect(searchSuggestions.suggestions.value).toEqual([])

      // Mock API response
      global.$fetch = vi.fn().mockResolvedValue({
        success: true,
        data: [
          {
            id: '1',
            text: 'Test Resource',
            type: 'resource',
            score: 0.1,
            metadata: {},
          },
        ],
        query: 'test',
        limit: 5,
        total: 1,
      })

      await searchSuggestions.fetchSuggestions('test', 5)

      expect(searchSuggestions.suggestions.value).toHaveLength(1)
      expect(searchSuggestions.suggestions.value[0].text).toBe('Test Resource')
    })

    it('should maintain reactive state for loading', async () => {
      expect(searchSuggestions.loading.value).toBe(false)

      // Create a delayed promise to test loading state
      const mockResponse = Promise.resolve({
        success: true,
        data: [],
        query: 'test',
        limit: 5,
        total: 0,
      })

      global.$fetch = vi.fn().mockReturnValue(mockResponse)

      const fetchPromise = searchSuggestions.fetchSuggestions('test', 5)

      expect(searchSuggestions.loading.value).toBe(true)

      await fetchPromise

      expect(searchSuggestions.loading.value).toBe(false)
    })

    it('should maintain reactive state for error', async () => {
      expect(searchSuggestions.error.value).toBeNull()

      // Mock API error
      global.$fetch = vi.fn().mockRejectedValue(new Error('Test error'))

      await searchSuggestions.fetchSuggestions('test', 5)

      expect(searchSuggestions.error.value).toBe('Test error')
    })
  })
})
