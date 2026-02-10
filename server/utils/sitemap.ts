import type { Resource } from '~/types/resource'
import {
  sitemapConfig,
  getStaticPages,
  getResourceSitemapDefaults,
} from '~/configs/sitemap.config'
import { DEFAULT_DEV_URL } from '~/configs/url.config'

export interface SitemapEntry {
  url: string
  priority: string
  changefreq: string
  lastmod?: string
}

export function getBaseUrl(): string {
  return getBaseUrlFromConfig()
}

export function getBaseUrlFromConfig(): string {
  try {
    const config = useRuntimeConfig()
    return (
      config.public.siteUrl || config.public.canonicalUrl || DEFAULT_DEV_URL
    )
  } catch {
    return DEFAULT_DEV_URL
  }
}

// Export static pages using config
export const STATIC_PAGES: SitemapEntry[] = getStaticPages(false).map(page => ({
  url: page.path,
  priority: page.priority,
  changefreq: page.changefreq,
}))

export const STATIC_PAGES_WITH_FAVORITES: SitemapEntry[] = getStaticPages(
  true
).map(page => ({
  url: page.path,
  priority: page.priority,
  changefreq: page.changefreq,
}))

export function buildSitemapUrlEntry(
  baseUrl: string,
  entry: SitemapEntry
): string {
  const lastmod = entry.lastmod
    ? `<lastmod>${entry.lastmod}</lastmod>`
    : `<lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`

  return `  <url>
    <loc>${baseUrl}${entry.url}</loc>
    <priority>${entry.priority}</priority>
    <changefreq>${entry.changefreq}</changefreq>
    ${lastmod}
  </url>`
}

export function buildResourceUrlEntry(
  baseUrl: string,
  resource: Resource
): string {
  const defaults = getResourceSitemapDefaults()
  return `  <url>
    <loc>${baseUrl}/resources/${resource.id}</loc>
    <priority>${defaults.priority}</priority>
    <changefreq>${defaults.changefreq}</changefreq>
    <lastmod>${new Date(resource.dateAdded).toISOString().split('T')[0]}</lastmod>
  </url>`
}

export function generateSitemapXML(entries: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="${sitemapConfig.namespaces.sitemap}">
${entries.join('\n')}
</urlset>`
}

export function generateSitemapErrorXML(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<error>
  <message>${sitemapConfig.error.message}</message>
</error>`
}
