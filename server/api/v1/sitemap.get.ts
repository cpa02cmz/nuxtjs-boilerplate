import { defineEventHandler, setResponseHeader } from 'h3'
import type { Resource } from '~/types/resource'
import {
  getBaseUrlFromConfig,
  STATIC_PAGES_WITH_FAVORITES,
  buildSitemapUrlEntry,
  buildResourceUrlEntry,
  generateSitemapXML,
} from '../../utils/sitemap'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { handleApiRouteError } from '~/server/utils/api-response'
import { contentConfig } from '~/configs/content.config'
import { cacheManager } from '~/server/utils/enhanced-cache'
import { timeConfig, toSeconds } from '~/configs/time.config'

const API_ENDPOINTS = [
  { url: '/api/v1/resources', priority: '0.9', changefreq: 'daily' },
  { url: '/api/v1/categories', priority: '0.7', changefreq: 'weekly' },
  { url: '/api/v1/search', priority: '0.8', changefreq: 'daily' },
  { url: '/api/v1/export/json', priority: '0.6', changefreq: 'monthly' },
  { url: '/api/v1/export/csv', priority: '0.6', changefreq: 'monthly' },
  { url: '/api/v1/rss', priority: '0.8', changefreq: 'daily' },
] as const

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)

    // Performance: Cache sitemap for 1 hour since content rarely changes
    const cacheKey = 'sitemap:xml'
    const cachedSitemap = await cacheManager.get<string>(cacheKey)
    if (cachedSitemap) {
      setResponseHeader(event, 'Content-Type', 'application/xml')
      setResponseHeader(event, 'X-Cache', 'HIT')
      return cachedSitemap
    }

    const resourcesModule = await import(contentConfig.paths.resourcesData)
    const resources: Resource[] = resourcesModule.default || resourcesModule

    const baseUrl = getBaseUrlFromConfig()

    const entries: string[] = []

    STATIC_PAGES_WITH_FAVORITES.forEach(page => {
      entries.push(buildSitemapUrlEntry(baseUrl, page))
    })

    API_ENDPOINTS.forEach(endpoint => {
      entries.push(buildSitemapUrlEntry(baseUrl, endpoint))
    })

    resources.forEach(resource => {
      entries.push(buildResourceUrlEntry(baseUrl, resource))
    })

    const sitemapXml = generateSitemapXML(entries)

    // Cache for 1 hour (sitemap content changes infrequently)
    await cacheManager.set(
      cacheKey,
      sitemapXml,
      toSeconds(timeConfig.cache.long)
    )

    setResponseHeader(event, 'Content-Type', 'application/xml')
    setResponseHeader(event, 'X-Cache', 'MISS')
    return sitemapXml
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
