/**
 * Search Configuration
 * Flexy says: Search behavior should be configurable!
 */

// Fuse.js Search Configuration
export const FUSE_CONFIG = {
  // Default configuration for resource search
  default: {
    keys: [
      { name: 'name', weight: 0.4 },
      { name: 'description', weight: 0.3 },
      { name: 'category', weight: 0.15 },
      { name: 'tags', weight: 0.1 },
      { name: 'technologies', weight: 0.05 },
    ],
    threshold: 0.3,
    distance: 100,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
    shouldSort: true,
  },

  // Configuration for search suggestions
  suggestions: {
    keys: ['name', 'category'],
    threshold: 0.4,
    distance: 50,
    includeScore: true,
    minMatchCharLength: 1,
    shouldSort: true,
    limit: 5,
  },

  // Configuration for similar resource matching
  similar: {
    keys: [
      { name: 'category', weight: 0.4 },
      { name: 'tags', weight: 0.35 },
      { name: 'technologies', weight: 0.25 },
    ],
    threshold: 0.5,
    distance: 100,
    includeScore: true,
    shouldSort: true,
  },
} as const

// Search Behavior Configuration
export const SEARCH_BEHAVIOR = {
  // Query settings
  minQueryLength: parseInt(process.env.SEARCH_MIN_QUERY_LENGTH || '2'),
  maxQueryLength: parseInt(process.env.SEARCH_MAX_QUERY_LENGTH || '100'),

  // Suggestions
  maxSuggestions: parseInt(process.env.SEARCH_MAX_SUGGESTIONS || '5'),
  suggestionDebounceMs: parseInt(
    process.env.SEARCH_SUGGESTION_DEBOUNCE || '150'
  ),

  // History
  maxHistoryItems: parseInt(process.env.SEARCH_MAX_HISTORY || '10'),

  // Debouncing
  searchDebounceMs: parseInt(process.env.SEARCH_DEBOUNCE_MS || '300'),

  // Results
  defaultLimit: parseInt(process.env.SEARCH_DEFAULT_LIMIT || '20'),
  maxLimit: parseInt(process.env.SEARCH_MAX_LIMIT || '100'),
} as const

// Search UI Configuration
export const SEARCH_UI_CONFIG = {
  // Placeholder text
  placeholder: process.env.SEARCH_PLACEHOLDER || 'Search resources...',

  // Keyboard shortcuts
  keyboardShortcut: process.env.SEARCH_KEYBOARD_SHORTCUT || '/',

  // Auto-search settings
  autoSearch: {
    enabled: process.env.SEARCH_AUTO_ENABLED !== 'false',
    minChars: parseInt(process.env.SEARCH_AUTO_MIN_CHARS || '3'),
    delayMs: parseInt(process.env.SEARCH_AUTO_DELAY || '300'),
  },
} as const

// Advanced Search Configuration
export const ADVANCED_SEARCH_CONFIG = {
  // Faceted search options
  facets: {
    category: {
      enabled: true,
      multiSelect: true,
    },
    pricingModel: {
      enabled: true,
      multiSelect: true,
    },
    skillLevel: {
      enabled: true,
      multiSelect: false,
    },
    dateRange: {
      enabled: true,
      options: ['anytime', 'today', 'week', 'month', 'year'] as const,
    },
  },

  // Sort options
  sortOptions: [
    { value: 'relevance', label: 'Relevance' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' },
  ] as const,

  // Default sort
  defaultSort: 'relevance',
} as const

// Export all search configs
export default {
  fuse: FUSE_CONFIG,
  behavior: SEARCH_BEHAVIOR,
  ui: SEARCH_UI_CONFIG,
  advanced: ADVANCED_SEARCH_CONFIG,
}
