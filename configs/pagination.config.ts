/**
 * Pagination Configuration
 * Flexy says: Pagination settings should be configurable!
 */

// Pagination Configuration
export const PAGINATION = {
  // Default page size
  DEFAULT_PAGE_SIZE: parseInt(process.env.PAGINATION_DEFAULT_SIZE || '20'),

  // Maximum page size allowed
  MAX_PAGE_SIZE: parseInt(process.env.PAGINATION_MAX_SIZE || '100'),

  // Maximum items per request
  MAX_ITEMS_PER_REQUEST: parseInt(process.env.PAGINATION_MAX_ITEMS || '1000'),

  // Default offset
  DEFAULT_OFFSET: 0,

  // Virtual list settings
  virtualList: {
    itemHeight: parseInt(process.env.VIRTUAL_LIST_ITEM_HEIGHT || '340'),
    overscan: parseInt(process.env.VIRTUAL_LIST_OVERSCAN || '3'),
  },
} as const

// RSS Feed Pagination
export const RSS_PAGINATION = {
  maxItems: parseInt(process.env.RSS_MAX_ITEMS || '50'),
  defaultLimit: parseInt(process.env.RSS_DEFAULT_LIMIT || '20'),
} as const

// Export all pagination configs
export default {
  pagination: PAGINATION,
  rss: RSS_PAGINATION,
}
