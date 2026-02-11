/**
 * SEO Utilities
 *
 * Handles SEO metadata generation and JSON-LD structured data.
 * This utility provides consistent SEO functionality across the application.
 *
 * Architecture Principles:
 * - Single Responsibility: Only handles SEO-related operations
 * - Reusability: Can be used across multiple pages
 * - Type Safety: Strongly typed structured data
 */

import type { Resource } from '~/types/resource'
import { seoConfig } from '~/configs/seo.config'

/**
 * SEO Metadata Configuration
 */
export interface SeoConfig {
  title: string
  description: string
  url: string
  ogType?: string
  twitterCard?: string
  articlePublishedTime?: string
  articleModifiedTime?: string
}

/**
 * Generate structured data for a resource (JSON-LD format)
 * Follows Schema.org SoftwareApplication specification
 *
 * @param resource - Resource to generate structured data for
 * @returns Structured data object for JSON-LD
 */
export function generateStructuredData(
  resource: Resource
): Record<string, unknown> {
  // Flexy hates hardcoded schema URLs! Using configurable values from seoConfig
  const structuredData = {
    '@context': seoConfig.schema.context,
    '@type': seoConfig.schema.softwareApplication,
    name: resource.title,
    description: resource.description,
    url: resource.url,
    applicationCategory: resource.category,
    isBasedOn: resource.url,
    datePublished: resource.dateAdded,
    offers: {
      '@type': seoConfig.schema.offerType,
      price: seoConfig.resourceSchema.price,
      priceCurrency: seoConfig.resourceSchema.currency,
      availability: seoConfig.schema.availability.inStock,
    },
    aggregateRating: resource.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: resource.rating,
          bestRating: seoConfig.resourceSchema.ratingMin,
          worstRating: seoConfig.resourceSchema.ratingMax,
          ratingCount:
            resource.viewCount || seoConfig.resourceSchema.ratingCount,
        }
      : undefined,
    keywords: resource.tags.join(','),
    thumbnailUrl: resource.icon,
    operatingSystem: resource.platforms
      ? resource.platforms.join(', ')
      : undefined,
  }

  // Remove undefined values
  Object.keys(structuredData).forEach((key: string) => {
    if ((structuredData as Record<string, unknown>)[key] === undefined) {
      delete (structuredData as Record<string, unknown>)[key]
    }
  })

  return structuredData
}

/**
 * Sanitize JSON-LD for safe embedding in HTML
 * Escapes HTML special characters to prevent XSS
 *
 * @param json - JSON object to sanitize
 * @returns Sanitized JSON string
 */
export function sanitizeJsonLd(json: Record<string, unknown>): string {
  return JSON.stringify(json)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\//g, '\\u002f')
}

/**
 * Generate SEO metadata configuration for a resource
 *
 * @param resource - Resource to generate metadata for
 * @param currentUrl - Current page URL
 * @returns SEO configuration object
 */
export function generateResourceSeoConfig(
  resource: Resource,
  currentUrl: string
): SeoConfig {
  const { title, description } = resource

  return {
    title: `${title} - ${seoConfig.meta.title}`,
    description: `${description} - Discover this and other amazing free resources on ${seoConfig.structuredData.name}.`,
    url: currentUrl,
    ogType: seoConfig.og.type,
    twitterCard: seoConfig.twitter.card,
    articlePublishedTime: resource.dateAdded,
    articleModifiedTime: resource.dateAdded,
  }
}

/**
 * Generate complete SEO meta tags and JSON-LD structured data for a resource
 * This is a convenience function that combines metadata generation with structured data
 *
 * @param resource - Resource to generate SEO for
 * @param currentUrl - Current page URL
 * @returns Object with seoMeta and structuredData properties
 */
export function generateSeoData(resource: Resource, currentUrl: string) {
  const seoConfig = generateResourceSeoConfig(resource, currentUrl)
  const structuredData = generateStructuredData(resource)
  const safeJsonLd = sanitizeJsonLd(structuredData)

  return {
    seoMeta: {
      title: seoConfig.title,
      ogTitle: seoConfig.title,
      description: seoConfig.description,
      ogDescription: seoConfig.description,
      ogUrl: seoConfig.url,
      ogType: seoConfig.ogType,
      twitterCard: seoConfig.twitterCard,
      articlePublishedTime: seoConfig.articlePublishedTime,
      articleModifiedTime: seoConfig.articleModifiedTime,
    },
    structuredData: safeJsonLd,
  }
}
