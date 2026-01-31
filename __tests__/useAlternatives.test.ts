import { describe, it, expect, beforeEach } from 'vitest'
import { useAlternativeSuggestions } from '~/composables/useAlternativeSuggestions'
import type { Resource } from '~/types/resource'

describe('useAlternativeSuggestions composable', () => {
  const mockResources: Resource[] = [
    {
      id: '1',
      title: 'Resource 1',
      description: 'Description 1',
      benefits: ['Benefit 1'],
      url: 'https://example.com/1',
      category: 'Test Category',
      pricingModel: 'Free',
      difficulty: 'Beginner',
      tags: ['tag1', 'tag2'],
      technology: ['tech1'],
      dateAdded: '2023-01-01',
      popularity: 10,
      alternatives: ['2', '3'],
    },
    {
      id: '2',
      title: 'Resource 2',
      description: 'Description 2',
      benefits: ['Benefit 2'],
      url: 'https://example.com/2',
      category: 'Test Category',
      pricingModel: 'Free',
      difficulty: 'Beginner',
      tags: ['tag1', 'tag3'],
      technology: ['tech1'],
      dateAdded: '2023-01-02',
      popularity: 8,
    },
    {
      id: '3',
      title: 'Resource 3',
      description: 'Description 3',
      benefits: ['Benefit 3'],
      url: 'https://example.com/3',
      category: 'Test Category',
      pricingModel: 'Paid',
      difficulty: 'Intermediate',
      tags: ['tag2', 'tag4'],
      technology: ['tech2'],
      dateAdded: '2023-01-03',
      popularity: 5,
    },
    {
      id: '4',
      title: 'Resource 4',
      description: 'Description 4',
      benefits: ['Benefit 4'],
      url: 'https://example.com/4',
      category: 'Different Category',
      pricingModel: 'Free',
      difficulty: 'Beginner',
      tags: ['tag5'],
      technology: ['tech3'],
      dateAdded: '2023-01-04',
      popularity: 7,
    },
  ]

  let alternatives: ReturnType<typeof useAlternativeSuggestions>

  beforeEach(() => {
    alternatives = useAlternativeSuggestions(mockResources)
  })

  it('should return alternative suggestions for a resource', () => {
    const targetResource = mockResources[0]

    const suggestions = alternatives.getAlternativesForResource(targetResource)

    // Should return resources with similarity scores
    expect(suggestions.length).toBeGreaterThan(0)
    suggestions.forEach(suggestion => {
      expect(suggestion.score).toBeGreaterThanOrEqual(0)
      expect(suggestion.score).toBeLessThanOrEqual(1)
      expect(suggestion.isAlternative).toBe(true)
    })
  })

  it('should include predefined alternatives with high scores', () => {
    const targetResource = mockResources[0] // Has alternatives: ['2', '3']

    const suggestions = alternatives.getAlternativesForResource(targetResource)

    // Should include predefined alternatives
    const predefinedSuggestion = suggestions.find(s => s.resource.id === '2')
    expect(predefinedSuggestion).toBeDefined()
    expect(predefinedSuggestion?.score).toBe(1) // Predefined get max score
    expect(predefinedSuggestion?.reason).toBe('Marked as alternative')
  })

  it('should respect max alternatives config', () => {
    const targetResource = mockResources[0]

    alternatives.updateConfig({ maxAlternatives: 2 })
    const suggestions = alternatives.getAlternativesForResource(targetResource)

    expect(suggestions.length).toBeLessThanOrEqual(2)
  })

  it('should filter by minimum similarity score', () => {
    const targetResource = mockResources[0]

    alternatives.updateConfig({ minSimilarityScore: 0.5 })
    const suggestions = alternatives.getAlternativesForResource(targetResource)

    suggestions.forEach(suggestion => {
      expect(suggestion.score).toBeGreaterThanOrEqual(0.5)
    })
  })

  it('should return config with criteria override', () => {
    const targetResource = mockResources[0]

    const suggestions = alternatives.getAlternativesWithCriteria(
      targetResource,
      {
        maxAlternatives: 1,
        minSimilarityScore: 0.8,
      }
    )

    expect(suggestions.length).toBeLessThanOrEqual(1)
  })

  it('should find resource by ID', () => {
    const resource = alternatives.getResourceById('2')
    expect(resource).toBeDefined()
    expect(resource?.id).toBe('2')
  })

  it('should return undefined for non-existent resource ID', () => {
    const resource = alternatives.getResourceById('non-existent')
    expect(resource).toBeUndefined()
  })
})
