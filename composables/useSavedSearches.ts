import { ref, readonly } from 'vue'
import type { SavedSearch } from '~/types/search'

const SAVED_SEARCHES_KEY = 'resource_saved_searches'
const MAX_SAVED_SEARCHES = 20

export const useSavedSearches = () => {
  const savedSearches = ref<SavedSearch[]>([])

  const loadSavedSearches = (): SavedSearch[] => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(SAVED_SEARCHES_KEY)
      const loaded = stored ? JSON.parse(stored) : []
      savedSearches.value = loaded
      return loaded
    } catch (e) {
      console.error('Error loading saved searches:', e)
      savedSearches.value = []
      return []
    }
  }

  const saveSearch = (name: string, query: string) => {
    const existingIndex = savedSearches.value.findIndex(s => s.query === query)

    if (existingIndex >= 0) {
      savedSearches.value[existingIndex] = {
        ...savedSearches.value[existingIndex],
        name,
        createdAt: new Date(),
      }
    } else {
      savedSearches.value.unshift({
        name,
        query,
        createdAt: new Date(),
      })
    }

    if (savedSearches.value.length > MAX_SAVED_SEARCHES) {
      savedSearches.value = savedSearches.value.slice(0, MAX_SAVED_SEARCHES)
    }

    persistSavedSearches()
    emitSavedSearchEvent('saved-search-updated', { query, name })
  }

  const removeSavedSearch = (query: string) => {
    const removedSearch = savedSearches.value.find(s => s.query === query)
    savedSearches.value = savedSearches.value.filter(s => s.query !== query)
    persistSavedSearches()

    if (removedSearch) {
      emitSavedSearchEvent('saved-search-removed', {
        query,
        name: removedSearch.name,
      })
    }
  }

  const getSavedSearches = (): SavedSearch[] => {
    return [...savedSearches.value]
  }

  const persistSavedSearches = () => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(
        SAVED_SEARCHES_KEY,
        JSON.stringify(savedSearches.value)
      )
    } catch (e) {
      console.error('Error saving searches:', e)
    }
  }

  const emitSavedSearchEvent = (
    eventType: string,
    detail: { query: string; name: string }
  ) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(eventType, { detail }))
    }
  }

  loadSavedSearches()

  return {
    savedSearches: readonly(savedSearches),
    saveSearch,
    removeSavedSearch,
    getSavedSearches,
  }
}
