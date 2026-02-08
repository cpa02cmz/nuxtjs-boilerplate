// Search Configuration - Fuse.js and Search Behavior Settings
// Flexy hates hardcoded values! All search settings are now configurable.

export const searchConfig = {
  // Fuse.js Options
  fuse: {
    threshold: parseFloat(process.env.SEARCH_FUSE_THRESHOLD || '0.3'),
    distance: parseInt(process.env.SEARCH_FUSE_DISTANCE || '100'),
    includeScore: process.env.SEARCH_FUSE_INCLUDE_SCORE !== 'false',
    includeMatches: process.env.SEARCH_FUSE_INCLUDE_MATCHES !== 'false',
    minMatchCharLength: parseInt(process.env.SEARCH_MIN_MATCH_LENGTH || '2'),
    findAllMatches: process.env.SEARCH_FIND_ALL_MATCHES === 'true',
    ignoreLocation: process.env.SEARCH_IGNORE_LOCATION !== 'false',
    useExtendedSearch: process.env.SEARCH_USE_EXTENDED_SEARCH === 'true',
    ignoreFieldNorm: process.env.SEARCH_IGNORE_FIELD_NORM === 'true',
    fieldNormWeight: parseFloat(process.env.SEARCH_FIELD_NORM_WEIGHT || '1'),
  },

  // Search Keys and Weights
  keys: {
    name: {
      weight: parseFloat(process.env.SEARCH_WEIGHT_NAME || '0.35'),
      name: 'name',
    },
    description: {
      weight: parseFloat(process.env.SEARCH_WEIGHT_DESCRIPTION || '0.25'),
      name: 'description',
    },
    tags: {
      weight: parseFloat(process.env.SEARCH_WEIGHT_TAGS || '0.25'),
      name: 'tags',
    },
    category: {
      weight: parseFloat(process.env.SEARCH_WEIGHT_CATEGORY || '0.15'),
      name: 'category',
    },
  },

  // Search Behavior
  behavior: {
    debounceMs: parseInt(process.env.SEARCH_DEBOUNCE_MS || '300'),
    blurDelayMs: parseInt(process.env.SEARCH_BLUR_DELAY_MS || '200'),
    minQueryLength: parseInt(process.env.SEARCH_MIN_QUERY_LENGTH || '2'),
    maxSuggestions: parseInt(process.env.SEARCH_MAX_SUGGESTIONS || '5'),
    maxHistoryItems: parseInt(process.env.SEARCH_MAX_HISTORY_ITEMS || '10'),
    maxSnippetLength: parseInt(process.env.SEARCH_MAX_SNIPPET_LENGTH || '160'),
    descriptionTruncateLength: parseInt(
      process.env.SEARCH_DESCRIPTION_TRUNCATE || '100'
    ),
  },

  // Cache Settings
  cache: {
    maxPopularSearches: parseInt(process.env.SEARCH_CACHE_MAX_POPULAR || '50'),
    maxZeroResultSearches: parseInt(process.env.SEARCH_CACHE_MAX_ZERO || '50'),
    maxPerformanceHistory: parseInt(process.env.SEARCH_CACHE_MAX_PERF || '100'),
  },
} as const

export type SearchConfig = typeof searchConfig
