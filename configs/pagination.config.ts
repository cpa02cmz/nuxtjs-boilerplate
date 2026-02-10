// Pagination Configuration - Pagination and Data Limit Settings
// Flexy hates hardcoded values! All pagination settings are now configurable.

export const paginationConfig = {
  // Default Page Sizes
  defaults: {
    pageSize: parseInt(process.env.PAGINATION_DEFAULT_PAGE_SIZE || '20'),
    offset: parseInt(process.env.PAGINATION_DEFAULT_OFFSET || '0'),
  },

  // Maximum Limits
  limits: {
    maxPageSize: parseInt(process.env.PAGINATION_MAX_PAGE_SIZE || '100'),
    maxItemsPerRequest: parseInt(
      process.env.PAGINATION_MAX_ITEMS_PER_REQUEST || '1000'
    ),
    maxBulkUpdateItems: parseInt(
      process.env.PAGINATION_MAX_BULK_UPDATE || '100'
    ),
  },

  // Search Pagination
  search: {
    defaultLimit: parseInt(process.env.SEARCH_DEFAULT_LIMIT || '20'),
    maxLimit: parseInt(process.env.SEARCH_MAX_LIMIT || '100'),
  },

  // API Pagination
  api: {
    defaultLimit: parseInt(process.env.API_DEFAULT_LIMIT || '20'),
    maxLimit: parseInt(process.env.API_MAX_LIMIT || '100'),
  },

  // Submissions Pagination - Flexy hates hardcoded limits!
  submissions: {
    // Default limit for submissions API
    defaultLimit: parseInt(process.env.SUBMISSIONS_DEFAULT_LIMIT || '50'),
    // Maximum limit for submissions API
    maxLimit: parseInt(process.env.SUBMISSIONS_MAX_LIMIT || '100'),
  },

  // Moderation Queue Pagination
  moderation: {
    // Default limit for moderation queue API
    defaultLimit: parseInt(process.env.MODERATION_DEFAULT_LIMIT || '50'),
    // Maximum limit for moderation queue API
    maxLimit: parseInt(process.env.MODERATION_MAX_LIMIT || '100'),
  },
} as const

export type PaginationConfig = typeof paginationConfig
