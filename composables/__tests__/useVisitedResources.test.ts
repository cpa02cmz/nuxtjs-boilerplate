import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useVisitedResources } from '~/composables/useVisitedResources'

describe('useVisitedResources', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    if (typeof window !== 'undefined') {
      window.sessionStorage.clear()
    }
  })

  it('should mark a resource as visited', () => {
    const { markVisited, isVisited } = useVisitedResources()

    markVisited('resource-1')

    expect(isVisited('resource-1')).toBe(true)
    expect(isVisited('resource-2')).toBe(false)
  })

  it('should persist visited resources in sessionStorage', () => {
    const { markVisited } = useVisitedResources()

    markVisited('resource-1')
    markVisited('resource-2')

    const stored = window.sessionStorage.getItem('visited-resources')
    expect(stored).toBeTruthy()

    const parsed = JSON.parse(stored!)
    expect(parsed).toContain('resource-1')
    expect(parsed).toContain('resource-2')
  })

  it('should load visited resources from sessionStorage on mount', () => {
    // Pre-populate sessionStorage
    window.sessionStorage.setItem(
      'visited-resources',
      JSON.stringify(['resource-1', 'resource-2'])
    )

    const { isVisited } = useVisitedResources()

    // Resources should be loaded from storage
    expect(isVisited('resource-1')).toBe(true)
    expect(isVisited('resource-2')).toBe(true)
    expect(isVisited('resource-3')).toBe(false)
  })

  it('should clear all visited resources', () => {
    const { markVisited, clearVisited, isVisited } = useVisitedResources()

    markVisited('resource-1')
    markVisited('resource-2')

    clearVisited()

    expect(isVisited('resource-1')).toBe(false)
    expect(isVisited('resource-2')).toBe(false)
    expect(window.sessionStorage.getItem('visited-resources')).toBeNull()
  })

  it('should handle invalid resource IDs gracefully', () => {
    const { markVisited, isVisited } = useVisitedResources()

    // Should not throw with empty string
    markVisited('')
    expect(isVisited('')).toBe(false)
  })

  it('should handle sessionStorage errors gracefully', () => {
    // Mock sessionStorage to throw an error
    const originalSetItem = window.sessionStorage.setItem
    window.sessionStorage.setItem = vi.fn(() => {
      throw new Error('Storage error')
    })

    const { markVisited } = useVisitedResources()

    // Should not throw even when storage fails
    expect(() => markVisited('resource-1')).not.toThrow()

    // Restore original method
    window.sessionStorage.setItem = originalSetItem
  })
})
