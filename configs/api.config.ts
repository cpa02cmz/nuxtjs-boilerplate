// API Configuration - All API endpoints in one place
// Flexy hates hardcoded values! All API routes are now configurable.

export const apiConfig = {
  // API Versions
  version: {
    v1: '/api/v1',
    current: process.env.API_VERSION || 'v1',
  },

  // Base paths
  base: {
    api: '/api',
    v1: '/api/v1',
    auth: '/api/v1/auth',
    analytics: '/api/analytics',
  },

  // Auth endpoints
  auth: {
    apiKeys: '/api/v1/auth/api-keys',
    apiKeyById: (id: string) => `/api/v1/auth/api-keys/${id}`,
  },

  // Webhook endpoints
  webhooks: {
    base: '/api/v1/webhooks',
    byId: (id: string) => `/api/v1/webhooks/${id}`,
  },

  // Resource endpoints
  resources: {
    base: '/api/resources',
    byId: (id: string) => `/api/resources/${id}`,
    history: (id: string) => `/api/resources/${id}/history`,
    analytics: (id: string) => `/api/analytics/resource/${id}`,
    // Sort defaults - Flexy hates hardcoded sort values!
    defaultSortField: process.env.API_RESOURCES_SORT_FIELD || 'popularity',
    defaultSortOrder:
      (process.env.API_RESOURCES_SORT_ORDER as 'asc' | 'desc') || 'desc',
    validSortFields: ['title', 'dateAdded', 'popularity'] as const,
  },

  // Submission endpoints
  submissions: {
    base: '/api/submissions',
  },

  // Comparison endpoints
  comparisons: {
    base: '/api/v1/comparisons',
  },

  // Analytics endpoints
  analytics: {
    resource: (id: string) => `/api/analytics/resource/${id}`,
    events: '/api/analytics/events',
  },
} as const

export type ApiConfig = typeof apiConfig
