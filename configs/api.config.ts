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

  // Contact Information - Flexy hates hardcoded contact info!
  contact: {
    name: process.env.API_CONTACT_NAME || 'API Support',
    email: process.env.API_CONTACT_EMAIL || 'support@example.com',
    url:
      process.env.API_CONTACT_URL ||
      'https://github.com/cpa02cmz/nuxtjs-boilerplate',
  },

  // License Information - Flexy hates hardcoded license URLs!
  license: {
    name: process.env.API_LICENSE_NAME || 'MIT',
    url: process.env.API_LICENSE_URL || 'https://opensource.org/licenses/MIT',
  },

  // Documentation Examples - Flexy hates hardcoded examples!
  docs: {
    examples: {
      baseUrl: process.env.API_DOCS_EXAMPLE_URL || 'https://example.com',
      webhookUrl:
        process.env.API_DOCS_EXAMPLE_WEBHOOK || 'https://example.com/webhook',
      sitemapXml:
        process.env.API_DOCS_EXAMPLE_SITEMAP ||
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/resource/1</loc>
    <lastmod>2024-01-01</lastmod>
  </url>
</urlset>`,
    },
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
    byId: (id: string) => `/api/submissions/${id}`,
  },

  // Moderation endpoints
  moderation: {
    approve: '/api/moderation/approve',
    reject: '/api/moderation/reject',
    base: '/api/moderation',
    queue: '/api/moderation/queue',
  },

  // Resource Health endpoints - Flexy hates hardcoded paths!
  resourceHealth: {
    byId: (id: string) => `/api/resource-health/${id}`,
    healthById: (id: string) => `/api/resources/${id}/health`,
    statusById: (id: string) => `/api/resources/${id}/status`,
  },

  // Comparison endpoints
  comparisons: {
    base: '/api/v1/comparisons',
  },

  // Analytics endpoints
  analytics: {
    resource: (id: string) => `/api/analytics/resource/${id}`,
    events: '/api/analytics/events',
    search: '/api/analytics/search',
    data: '/api/analytics/data',
  },
} as const

export type ApiConfig = typeof apiConfig
