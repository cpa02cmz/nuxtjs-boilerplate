import { describe, it, expect } from 'vitest'
import {
  processResources,
  processResourcesWithSearch,
  hasActiveFilter,
  matchesCategory,
  matchesTechnology,
  matchesTag,
} from '~/utils/resource-processor'
import type { Resource } from '~/types/resource'

describe('resource-processor', () => {
  const mockResources: Resource[] = [
    {
      id: '1',
      title: 'Resource 1',
      description: 'Description 1',
      url: 'https://example.com/1',
      category: 'ai',
      pricingModel: 'free',
      difficulty: 'beginner',
      technology: ['javascript', 'vue'],
      tags: ['frontend', 'framework'],
      benefits: ['easy', 'fast'],
      dateAdded: '2024-01-01',
      popularity: 100,
    },
    {
      id: '2',
      title: 'Resource 2',
      description: 'Description 2',
      url: 'https://example.com/2',
      category: 'tool',
      pricingModel: 'paid',
      difficulty: 'advanced',
      technology: ['python', 'django'],
      tags: ['backend', 'framework'],
      benefits: ['powerful', 'scalable'],
      dateAdded: '2024-01-02',
      popularity: 80,
    },
    {
      id: '3',
      title: 'Resource 3',
      description: 'Description 3',
      url: 'https://example.com/3',
      category: 'ai',
      pricingModel: 'freemium',
      difficulty: 'intermediate',
      technology: ['javascript', 'react'],
      tags: ['frontend', 'library'],
      benefits: ['flexible'],
      dateAdded: '2024-01-03',
      popularity: 90,
    },
  ] as unknown as Resource[]

  describe('processResources', () => {
    it('should return all resources with no filters', () => {
      const result = processResources(mockResources)

      expect(result.filtered).toHaveLength(3)
      expect(result.totalCount).toBe(3)
      expect(result.filteredCount).toBe(3)
    })

    it('should filter by category', () => {
      const result = processResources(mockResources, { categories: ['ai'] })

      expect(result.filtered).toHaveLength(2)
      expect(result.filtered.every(r => r.category === 'ai')).toBe(true)
    })

    it('should filter by pricing model', () => {
      const result = processResources(mockResources, {
        pricingModels: ['free'],
      })

      expect(result.filtered).toHaveLength(1)
      expect(result.filtered[0].pricingModel).toBe('free')
    })

    it('should filter by multiple criteria', () => {
      const result = processResources(mockResources, {
        categories: ['ai'],
        pricingModels: ['free', 'freemium'],
      })

      expect(result.filtered).toHaveLength(2)
    })

    it('should count facets for all resources', () => {
      const result = processResources(mockResources, { categories: ['ai'] })

      // Facets should count ALL resources, not just filtered ones
      expect(result.facets.categories.ai).toBe(2)
      expect(result.facets.categories.tool).toBe(1)
      expect(result.facets.pricingModels.free).toBe(1)
      expect(result.facets.pricingModels.paid).toBe(1)
      expect(result.facets.pricingModels.freemium).toBe(1)
    })

    it('should count technologies array correctly', () => {
      const result = processResources(mockResources)

      expect(result.facets.technologies.javascript).toBe(2)
      expect(result.facets.technologies.vue).toBe(1)
      expect(result.facets.technologies.python).toBe(1)
      expect(result.facets.technologies.react).toBe(1)
    })

    it('should count tags array correctly', () => {
      const result = processResources(mockResources)

      expect(result.facets.tags.frontend).toBe(2)
      expect(result.facets.tags.backend).toBe(1)
      expect(result.facets.tags.framework).toBe(2)
    })

    it('should return empty array when no matches', () => {
      const result = processResources(mockResources, {
        categories: ['nonexistent'],
      })

      expect(result.filtered).toHaveLength(0)
      expect(result.filteredCount).toBe(0)
    })
  })

  describe('processResourcesWithSearch', () => {
    it('should search in title', () => {
      const result = processResourcesWithSearch(mockResources, {}, 'Resource 1')

      expect(result.filtered).toHaveLength(1)
      expect(result.filtered[0].title).toBe('Resource 1')
    })

    it('should search in description', () => {
      const result = processResourcesWithSearch(
        mockResources,
        {},
        'Description'
      )

      expect(result.filtered).toHaveLength(3)
    })

    it('should search in tags', () => {
      const result = processResourcesWithSearch(mockResources, {}, 'framework')

      expect(result.filtered).toHaveLength(2)
    })

    it('should combine filter and search', () => {
      // First test searching in title
      const result = processResourcesWithSearch(
        mockResources,
        { categories: ['ai'] },
        'Resource'
      )

      expect(result.filtered).toHaveLength(2)
    })

    it('should be case insensitive', () => {
      const result = processResourcesWithSearch(mockResources, {}, 'RESOURCE')

      expect(result.filtered).toHaveLength(3)
    })

    it('should return all resources with empty search query', () => {
      const result = processResourcesWithSearch(mockResources, {}, '')

      expect(result.filtered).toHaveLength(3)
    })

    it('should still count facets when searching', () => {
      const result = processResourcesWithSearch(mockResources, {}, 'frontend')

      expect(result.filtered).toHaveLength(2)
      // Facets should still count all 3 resources
      expect(result.facets.categories.ai).toBe(2)
      expect(result.facets.categories.tool).toBe(1)
    })
  })

  describe('filter matching functions', () => {
    const resource = mockResources[0]

    describe('hasActiveFilter', () => {
      it('should return false for empty array', () => {
        expect(hasActiveFilter([])).toBe(false)
      })

      it('should return false for undefined', () => {
        expect(hasActiveFilter(undefined)).toBe(false)
      })

      it('should return true for non-empty array', () => {
        expect(hasActiveFilter(['test'])).toBe(true)
      })
    })

    describe('matchesCategory', () => {
      it('should match when no filter active', () => {
        expect(matchesCategory(resource, undefined)).toBe(true)
        expect(matchesCategory(resource, [])).toBe(true)
      })

      it('should match when category in filter', () => {
        expect(matchesCategory(resource, ['ai'])).toBe(true)
      })

      it('should not match when category not in filter', () => {
        expect(matchesCategory(resource, ['tool'])).toBe(false)
      })
    })

    describe('matchesTechnology', () => {
      it('should match when technology in filter', () => {
        expect(matchesTechnology(resource, ['javascript'])).toBe(true)
      })

      it('should match when any technology in filter', () => {
        expect(matchesTechnology(resource, ['vue', 'react'])).toBe(true)
      })

      it('should not match when no technology in filter', () => {
        expect(matchesTechnology(resource, ['python'])).toBe(false)
      })
    })

    describe('matchesTag', () => {
      it('should match when tag in filter', () => {
        expect(matchesTag(resource, ['frontend'])).toBe(true)
      })

      it('should not match when tag not in filter', () => {
        expect(matchesTag(resource, ['backend'])).toBe(false)
      })
    })
  })
})
