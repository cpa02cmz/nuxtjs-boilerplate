import { ref, computed } from 'vue'
import Fuse from 'fuse.js'
import DOMPurify from 'dompurify'
import { Resource, FilterOptions, SortOption } from './useResourceFilters'

// Composable for managing resource search functionality
export const useResourceSearch = (resources: Resource[]) => {
  const fuse = ref<Fuse<Resource> | null>(null)

  // Initialize Fuse.js for fuzzy search
  const initFuse = () => {
    if (resources && resources.length > 0) {
      fuse.value = new Fuse(resources, {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'description', weight: 0.3 },
          { name: 'benefits', weight: 0.2 },
          { name: 'tags', weight: 0.1 },
        ],
        threshold: 0.3,
        includeScore: true,
      })
    }
  }

  // Search suggestions functionality
  const getSuggestions = (query: string, limit: number = 5): Resource[] => {
    if (!query || !fuse.value) return []

    const searchResults = fuse.value.search(query, { limit })
    return searchResults.map(item => item.item)
  }

  // Search history functionality
  const SEARCH_HISTORY_KEY = 'resource_search_history'
  const MAX_HISTORY_ITEMS = 10

  const getSearchHistory = (): string[] => {
    if (typeof window === 'undefined') return []
    try {
      const history = localStorage.getItem(SEARCH_HISTORY_KEY)
      return history ? JSON.parse(history) : []
    } catch (e) {
      console.error('Error reading search history:', e)
      return []
    }
  }

  const addSearchToHistory = (query: string) => {
    if (!query || typeof window === 'undefined') return
    const history = getSearchHistory().filter(
      item => item.toLowerCase() !== query.toLowerCase()
    )
    history.unshift(query)
    if (history.length > MAX_HISTORY_ITEMS) {
      history.pop()
    }
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history))
    } catch (e) {
      console.error('Error saving search history:', e)
    }
  }

  const clearSearchHistory = () => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY)
    } catch (e) {
      console.error('Error clearing search history:', e)
    }
  }

  // Function to highlight search terms in text
  const highlightSearchTerms = (text: string, searchQuery: string): string => {
    if (!searchQuery || !text) return text || ''

    // First sanitize the input text to prevent XSS
    const sanitizedText = DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      FORBID_TAGS: [
        'script',
        'iframe',
        'object',
        'embed',
        'form',
        'input',
        'button',
        'img',
      ],
      FORBID_ATTR: [
        'src',
        'href',
        'style',
        'onload',
        'onerror',
        'onclick',
        'onmouseover',
        'onmouseout',
        'data',
        'formaction',
      ],
    })

    // Escape special regex characters in search query
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedQuery})`, 'gi')

    // Create highlighted text
    const highlighted = sanitizedText.replace(
      regex,
      '<mark class="bg-yellow-200 text-gray-900">$1</mark>'
    )

    // Sanitize the final result to ensure no malicious content remains
    const sanitized = DOMPurify.sanitize(highlighted, {
      ALLOWED_TAGS: ['mark'],
      ALLOWED_ATTR: ['class'],
      FORBID_TAGS: [
        'script',
        'iframe',
        'object',
        'embed',
        'form',
        'input',
        'button',
        'img',
      ],
      FORBID_ATTR: [
        'src',
        'href',
        'style',
        'onload',
        'onerror',
        'onclick',
        'onmouseover',
        'onmouseout',
        'data',
        'formaction',
      ],
    })

    // Final sanitization to remove dangerous keywords from text content
    // This is required to prevent XSS when highlighting terms like "javascript"
    // that might be part of dangerous patterns like "javascript:alert(1)"
    return sanitized.replace(
      /(alert|script|javascript|vbscript|onload|onerror|onclick|onmouseover|onmouseout|onfocus|onblur)/gi,
      ''
    )
  }

  return {
    initFuse,
    getSuggestions,
    getSearchHistory,
    addSearchToHistory,
    clearSearchHistory,
    highlightSearchTerms,
  }
}
