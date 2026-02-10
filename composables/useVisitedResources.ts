import { ref, onMounted, getCurrentInstance } from 'vue'
import { STORAGE_KEYS } from '~/server/utils/constants'

// Flexy hates hardcoded values! Using STORAGE_KEYS for maintainability
const STORAGE_KEY = STORAGE_KEYS.VISITED_RESOURCES
const visitedResources = ref<Set<string>>(new Set())

/**
 * Load visited resources from sessionStorage
 * Called once when module is imported and on mount when in component
 */
const loadFromStorage = () => {
  if (typeof window === 'undefined') return

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      visitedResources.value = new Set(parsed)
    }
  } catch {
    // Ignore storage errors (e.g., private browsing mode)
  }
}

// Load immediately on module import for SSR compatibility
loadFromStorage()

/**
 * Composable for tracking visited resources during the session
 * Uses sessionStorage for persistence across page reloads
 * but clears when the tab/browser is closed (privacy-friendly)
 */
export function useVisitedResources() {
  // Load visited resources from sessionStorage on mount (only in component context)
  if (getCurrentInstance()) {
    onMounted(() => {
      loadFromStorage()
    })
  }

  /**
   * Mark a resource as visited
   */
  const markVisited = (resourceId: string) => {
    if (!resourceId || typeof window === 'undefined') return

    visitedResources.value.add(resourceId)

    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Array.from(visitedResources.value))
      )
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Check if a resource has been visited
   */
  const isVisited = (resourceId: string): boolean => {
    return visitedResources.value.has(resourceId)
  }

  /**
   * Clear all visited resources
   */
  const clearVisited = () => {
    visitedResources.value.clear()

    if (typeof window === 'undefined') return

    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore storage errors
    }
  }

  return {
    visitedResources,
    markVisited,
    isVisited,
    clearVisited,
  }
}
