import { ref } from 'vue'

interface SearchHistoryItem {
  query: string
  timestamp: number
}

// Composable for managing search history
export const useSearchHistory = () => {
  const SEARCH_HISTORY_KEY = 'resource_search_history'
  const MAX_HISTORY_ITEMS = 10

  // Reactive state for search history
  const searchHistory = ref<SearchHistoryItem[]>([])

  const loadSearchHistory = (): SearchHistoryItem[] => {
    if (typeof window === 'undefined') return []
    try {
      const history = localStorage.getItem(SEARCH_HISTORY_KEY)
      return history ? JSON.parse(history) : []
    } catch (e) {
      // In production, we might want to use a proper error tracking service instead of console
      if (process.env.NODE_ENV === 'development') {
        console.error('Error reading search history:', e)
      }
      return []
    }
  }

  const saveSearchHistory = (history: SearchHistoryItem[]) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history))
    } catch (e) {
      // In production, we might want to use a proper error tracking service instead of console
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving search history:', e)
      }
    }
  }

  const addSearch = (query: string) => {
    if (!query || typeof query !== 'string' || query.trim() === '') return

    const newHistory = searchHistory.value.filter(
      item => item.query.toLowerCase() !== query.toLowerCase()
    )

    newHistory.unshift({
      query: query.trim(),
      timestamp: Date.now(),
    })

    if (newHistory.length > MAX_HISTORY_ITEMS) {
      newHistory.pop()
    }

    searchHistory.value = newHistory
    saveSearchHistory(newHistory)
  }

  const removeSearch = (query: string) => {
    const newHistory = searchHistory.value.filter(item => item.query !== query)
    searchHistory.value = newHistory
    saveSearchHistory(newHistory)
  }

  const clearHistory = () => {
    searchHistory.value = []
    saveSearchHistory([])
  }

  // Initialize history on composable creation
  searchHistory.value = loadSearchHistory()

  return {
    searchHistory,
    addSearch,
    removeSearch,
    clearHistory,
  }
}
