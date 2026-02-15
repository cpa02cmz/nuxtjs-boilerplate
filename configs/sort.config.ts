// Sort Configuration - Centralized Sort Options
// Flexy hates hardcoded values! All sort options are now configurable.

export const SORT_OPTIONS = {
  // Alphabetical sorts (matches SortOption type in types/resource.ts)
  ALPHABETICAL_ASC: 'alphabetical-asc',
  ALPHABETICAL_DESC: 'alphabetical-desc',

  // Popularity sorts
  POPULARITY_DESC: 'popularity-desc',
  POPULARITY_ASC: 'popularity-asc',

  // Date sorts (matches SortOption type in types/resource.ts)
  DATE_ADDED_DESC: 'date-added-desc',
  DATE_DESC: 'date-desc',
  DATE_ASC: 'date-asc',
  NEWEST: 'newest',
  OLDEST: 'oldest',

  // Name/title sorts
  NAME_ASC: 'name-asc',
  NAME_DESC: 'name-desc',
  TITLE_ASC: 'title-asc',
  TITLE_DESC: 'title-desc',

  // Relevance (matches SortOption type in types/resource.ts)
  RELEVANCE: 'relevance',

  // Rating
  RATING_DESC: 'rating-desc',
  RATING_ASC: 'rating-asc',

  // Default sort directions
  ASC: 'asc',
  DESC: 'desc',
} as const

export type SortOption = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS]
export type SortDirection = typeof SORT_OPTIONS.ASC | typeof SORT_OPTIONS.DESC

// Sort configuration
export const sortConfig = {
  // Default sorts for different contexts
  defaults: {
    resources:
      process.env.SORT_DEFAULT_RESOURCES || SORT_OPTIONS.POPULARITY_DESC,
    search: process.env.SORT_DEFAULT_SEARCH || SORT_OPTIONS.RELEVANCE,
    submissions: process.env.SORT_DEFAULT_SUBMISSIONS || SORT_OPTIONS.DATE_DESC,
    bookmarks: process.env.SORT_DEFAULT_BOOKMARKS || SORT_OPTIONS.DATE_DESC,
    history: process.env.SORT_DEFAULT_HISTORY || SORT_OPTIONS.DATE_DESC,
  },

  // Valid sort fields
  fields: {
    resources: ['title', 'dateAdded', 'popularity', 'rating'] as const,
    submissions: ['date', 'status', 'title'] as const,
    bookmarks: ['date', 'title', 'popularity'] as const,
  },

  // Sort options grouped by context
  options: {
    resources: [
      SORT_OPTIONS.POPULARITY_DESC,
      SORT_OPTIONS.DATE_DESC,
      SORT_OPTIONS.DATE_ASC,
      SORT_OPTIONS.NAME_ASC,
      SORT_OPTIONS.RATING_DESC,
    ],
    search: [
      SORT_OPTIONS.RELEVANCE,
      SORT_OPTIONS.POPULARITY_DESC,
      SORT_OPTIONS.DATE_DESC,
      SORT_OPTIONS.DATE_ASC,
    ],
    submissions: [SORT_OPTIONS.DATE_DESC, SORT_OPTIONS.DATE_ASC],
  },

  // Labels for UI
  labels: {
    [SORT_OPTIONS.POPULARITY_DESC]: 'Most Popular',
    [SORT_OPTIONS.POPULARITY_ASC]: 'Least Popular',
    [SORT_OPTIONS.DATE_DESC]: 'Newest First',
    [SORT_OPTIONS.DATE_ASC]: 'Oldest First',
    [SORT_OPTIONS.NEWEST]: 'Newest',
    [SORT_OPTIONS.OLDEST]: 'Oldest',
    [SORT_OPTIONS.NAME_ASC]: 'Name A-Z',
    [SORT_OPTIONS.NAME_DESC]: 'Name Z-A',
    [SORT_OPTIONS.TITLE_ASC]: 'Title A-Z',
    [SORT_OPTIONS.TITLE_DESC]: 'Title Z-A',
    [SORT_OPTIONS.RELEVANCE]: 'Most Relevant',
    [SORT_OPTIONS.RATING_DESC]: 'Highest Rated',
    [SORT_OPTIONS.RATING_ASC]: 'Lowest Rated',
  },

  // Sort field mapping for API
  fieldMapping: {
    [SORT_OPTIONS.POPULARITY_DESC]: {
      field: 'popularity',
      order: SORT_OPTIONS.DESC,
    },
    [SORT_OPTIONS.POPULARITY_ASC]: {
      field: 'popularity',
      order: SORT_OPTIONS.ASC,
    },
    [SORT_OPTIONS.DATE_DESC]: { field: 'dateAdded', order: SORT_OPTIONS.DESC },
    [SORT_OPTIONS.DATE_ASC]: { field: 'dateAdded', order: SORT_OPTIONS.ASC },
    [SORT_OPTIONS.NAME_ASC]: { field: 'title', order: SORT_OPTIONS.ASC },
    [SORT_OPTIONS.NAME_DESC]: { field: 'title', order: SORT_OPTIONS.DESC },
    [SORT_OPTIONS.TITLE_ASC]: { field: 'title', order: SORT_OPTIONS.ASC },
    [SORT_OPTIONS.TITLE_DESC]: { field: 'title', order: SORT_OPTIONS.DESC },
    [SORT_OPTIONS.RATING_DESC]: { field: 'rating', order: SORT_OPTIONS.DESC },
    [SORT_OPTIONS.RATING_ASC]: { field: 'rating', order: SORT_OPTIONS.ASC },
  },
} as const

export type SortConfig = typeof sortConfig
