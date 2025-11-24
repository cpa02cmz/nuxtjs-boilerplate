import { describe, it, expect } from 'vitest'
import { useResources } from './useResources'

describe('useResources Composable', () => {
  it('exports the composable function', () => {
    // Test that the composable can be imported and is a function
    expect(typeof useResources).toBe('function')
  })

  it('has expected return structure', () => {
    // Test that the composable has the expected structure
    const resourcesComposable = useResources()

    // Check for key properties in the returned object
    expect(resourcesComposable).toHaveProperty('resources')
    expect(resourcesComposable).toHaveProperty('filteredResources')
    expect(resourcesComposable).toHaveProperty('loading')
    expect(resourcesComposable).toHaveProperty('error')
    expect(resourcesComposable).toHaveProperty('categories')
    expect(resourcesComposable).toHaveProperty('pricingModels')
    expect(resourcesComposable).toHaveProperty('difficultyLevels')
    expect(resourcesComposable).toHaveProperty('technologies')
    expect(resourcesComposable).toHaveProperty('filterOptions')
    expect(resourcesComposable).toHaveProperty('sortOption')
    expect(resourcesComposable).toHaveProperty('updateSearchQuery')
    expect(resourcesComposable).toHaveProperty('toggleCategory')
    expect(resourcesComposable).toHaveProperty('togglePricingModel')
    expect(resourcesComposable).toHaveProperty('toggleDifficultyLevel')
    expect(resourcesComposable).toHaveProperty('toggleTechnology')
    expect(resourcesComposable).toHaveProperty('setSortOption')
    expect(resourcesComposable).toHaveProperty('resetFilters')
    expect(resourcesComposable).toHaveProperty('highlightSearchTerms')
    expect(resourcesComposable).toHaveProperty('retryResources')
    expect(resourcesComposable).toHaveProperty('getSuggestions')
    expect(resourcesComposable).toHaveProperty('getSearchHistory')
    expect(resourcesComposable).toHaveProperty('addSearchToHistory')
    expect(resourcesComposable).toHaveProperty('clearSearchHistory')
  })
})
