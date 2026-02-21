import { defineEventHandler, setResponseHeader } from 'h3'
import type { Resource } from '~/types/resource'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { handleApiRouteError } from '~/server/utils/api-response'
import { RSS_CONFIG } from '~/server/utils/constants'
import { contentConfig } from '~/configs/content.config'
import { DEFAULT_DEV_URL } from '~/configs/url.config'
import { cacheManager } from '~/server/utils/enhanced-cache'
import { cacheConfig } from '~/configs/cache.config'

/**
 * GET /api/v1/rss
 *
 * Generate RSS feed of latest resources with caching
 */
export default defineEventHandler(async event => {
  try {
    await rateLimit(event)

    // Check cache first
    const cacheKey = 'rss:feed'
    const cachedRss = await cacheManager.get(cacheKey)
    if (cachedRss) {
      event.node.res?.setHeader('X-Cache', 'HIT')
      setResponseHeader(
        event,
        'Content-Type',
        'application/rss+xml; charset=utf-8'
      )
      return cachedRss
    }

    // Import resources from JSON
    const resourcesModule = await import(contentConfig.paths.resourcesData)
    let resources: Resource[] = resourcesModule.default || resourcesModule

    // Sort by date added (newest first) and limit to 50 for RSS
    resources = [...resources]
      .sort(
        (a, b) =>
          new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
      )
      .slice(0, RSS_CONFIG.MAX_ITEMS)

    // Generate RSS XML
    const rssContent = generateRssFeed(resources)

    // Cache the RSS feed
    await cacheManager.set(cacheKey, rssContent, cacheConfig.rss.ttlSeconds)

    // Set cache miss header and content type
    event.node.res?.setHeader('X-Cache', 'MISS')
    setResponseHeader(
      event,
      'Content-Type',
      'application/rss+xml; charset=utf-8'
    )

    return rssContent
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})

function generateRssFeed(resources: Resource[]): string {
  const config = useRuntimeConfig()
  const siteUrl =
    config.public.siteUrl || config.public.canonicalUrl || DEFAULT_DEV_URL
  // Flexy hates hardcoded values! Using contentConfig for RSS feed metadata
  const title = contentConfig.rss.title
  const description = contentConfig.rss.description
  const language = contentConfig.rss.language
  const date = new Date().toUTCString()

  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title><![CDATA[${title}]]></title>
    <description><![CDATA[${description}]]></description>
    <link>${siteUrl}</link>
    <lastBuildDate>${date}</lastBuildDate>
    <language>${language}</language>
  `

  for (const resource of resources) {
    rss += `
    <item>
      <title><![CDATA[${resource.title}]]></title>
      <description><![CDATA[${resource.description}]]></description>
      <link>${resource.url}</link>
      <guid>${siteUrl}/resources/${resource.id}</guid>
      <pubDate>${new Date(resource.dateAdded).toUTCString()}</pubDate>
      <category><![CDATA[${resource.category}]]></category>
    </item>
    `
  }

  rss += `
  </channel>
</rss>`

  return rss
}
