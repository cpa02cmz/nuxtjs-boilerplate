import { ref, computed, type ComputedRef } from 'vue'
import { createStorage } from '~/utils/storage'
import { STORAGE_KEYS } from '~/server/utils/constants'
import { limitsConfig } from '~/configs/limits.config'

/**
 * UseSearchHistory Return Type
 */
export interface UseSearchHistoryReturn {
  /** Computed reference to the search history array */
  searchHistory: ComputedRef<string[]>
  /** Get the current search history from storage */
  getSearchHistory: () => string[]
  /** Add a new search query to history */
  addSearchToHistory: (query: string) => void
  /** Remove a specific search query from history */
  removeSearch: (query: string) => void
  /** Clear all search history */
  clearSearchHistory: () => void
}

export const useSearchHistory = (): UseSearchHistoryReturn => {
  const SEARCH_HISTORY_KEY = STORAGE_KEYS.SEARCH_HISTORY
  const MAX_HISTORY_ITEMS = limitsConfig.search.maxHistoryItems

  const storage = createStorage<string[]>(SEARCH_HISTORY_KEY, [])
  const searchHistory = ref<string[]>([])

  const getSearchHistory = (): string[] => {
    searchHistory.value = storage.get()
    return searchHistory.value
  }

  const addSearchToHistory = (query: string) => {
    if (!query) return

    const history = getSearchHistory().filter(
      item => item.toLowerCase() !== query.toLowerCase()
    )
    history.unshift(query)
    if (history.length > MAX_HISTORY_ITEMS) {
      history.pop()
    }
    searchHistory.value = history
    storage.set(history)
  }

  const removeSearch = (query: string) => {
    if (!query) return

    const history = getSearchHistory().filter(
      item => item.toLowerCase() !== query.toLowerCase()
    )
    searchHistory.value = history
    storage.set(history)
  }

  const clearSearchHistory = () => {
    searchHistory.value = []
    storage.remove()
  }

  return {
    searchHistory: computed(() => searchHistory.value),
    getSearchHistory,
    addSearchToHistory,
    removeSearch,
    clearSearchHistory,
  }
}
