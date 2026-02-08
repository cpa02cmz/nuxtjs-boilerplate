/**
 * Search Configuration
 * All search-related settings and Fuse.js configuration
 * Flexy says: "Search algorithms should be configurable!"
 */

// Fuse.js Configuration
export const FUSE_CONFIG = {
  // Search threshold (0.0 = perfect match, 1.0 = match anything)
  threshold: 0.3,

  // Distance - maximum search distance
  distance: 100,

  // Location - where in the text to start searching (0 = beginning)
  location: 0,

  // Include score in results
  includeScore: false,

  // Include matches for highlighting
  includeMatches: true,

  // Min match character length
  minMatchCharLength: 2,

  // Should search be case-sensitive
  isCaseSensitive: false,

  // Whether to sort results by score
  shouldSort: true,

  // Tokenize the search query
  tokenize: false,

  // Match all tokens in the query
  matchAllTokens: false,

  // Find all matches, not just the first
  findAllMatches: false,

  // Keys to search in with weights
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'description', weight: 0.3 },
    { name: 'tags', weight: 0.2 },
    { name: 'category', weight: 0.1 },
  ],
} as const

// Search Suggestion Configuration
export const SUGGESTION_CONFIG = {
  // Maximum suggestions to show
  maxSuggestions: 5,

  // Maximum suggestions from history
  maxHistorySuggestions: 3,

  // Maximum suggestions from trending
  maxTrendingSuggestions: 3,

  // Maximum popular searches to store
  maxPopularSearches: 20,

  // Description truncation length
  descriptionLength: 100,

  // Scoring weights for different suggestion types
  scoring: {
    history: 0.9,
    resource: 0.7,
    category: 0.6,
    trending: 0.5,
    tag: 0.7,
  },

  // Minimum score for suggestion to be shown
  minScore: 0.3,
} as const

// Search Analytics Configuration
export const SEARCH_ANALYTICS_CONFIG = {
  // Maximum history items to store
  maxHistoryItems: 10,

  // Maximum performance history entries
  maxPerformanceHistory: 100,

  // Maximum popular searches to track
  maxPopularSearches: 50,

  // Maximum zero-result searches to track
  maxZeroResultSearches: 50,

  // Minimum query length to track
  minQueryLength: 2,
} as const

// Search Query Configuration
export const QUERY_CONFIG = {
  // Minimum query length to trigger search
  minLength: 2,

  // Maximum query length allowed
  maxLength: 200,

  // Debounce delay in ms
  debounceMs: 300,

  // Blur delay for suggestions
  blurDelayMs: 200,

  // Check interval for suggestion changes
  checkIntervalMs: 100,
} as const

// Search Results Configuration
export const RESULTS_CONFIG = {
  // Default page size
  defaultPageSize: 20,

  // Maximum page size
  maxPageSize: 100,

  // Highlight matches
  highlightMatches: true,

  // Show result scores
  showScores: false,
} as const

// Category-based Search Weights
export const CATEGORY_WEIGHTS: Record<string, number> = {
  name: 0.4,
  description: 0.3,
  tags: 0.2,
  category: 0.1,
} as const

// Export all search configs
export const SEARCH = {
  fuse: FUSE_CONFIG,
  suggestions: SUGGESTION_CONFIG,
  analytics: SEARCH_ANALYTICS_CONFIG,
  query: QUERY_CONFIG,
  results: RESULTS_CONFIG,
  categoryWeights: CATEGORY_WEIGHTS,
} as const

export default SEARCH
