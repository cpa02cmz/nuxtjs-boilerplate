/**
 * Utility functions for social sharing
 */
import { contentConfig } from '~/configs/content.config'

/**
 * Add UTM parameters to a URL
 */
export const addUTMParams = (
  url: string,
  source: string,
  medium: string,
  campaign: string,
  term?: string,
  content?: string
): string => {
  try {
    const urlObj = new URL(url)
    urlObj.searchParams.set('utm_source', source)
    urlObj.searchParams.set('utm_medium', medium)
    urlObj.searchParams.set('utm_campaign', campaign)

    if (term) urlObj.searchParams.set('utm_term', term)
    if (content) urlObj.searchParams.set('utm_content', content)

    return urlObj.toString()
  } catch {
    // If URL parsing fails, return the original URL
    return url
  }
}

/**
 * Generate social media share URLs with UTM parameters
 */
export const generateShareUrls = (
  baseUrl: string,
  title: string,
  description?: string
) => {
  const encodedBaseUrl = encodeURIComponent(baseUrl)
  const encodedTitleAndDescription = encodeURIComponent(
    `${title} - ${description || ''}`
  )

  const { platforms, hashtags } = contentConfig.socialShare

  return {
    twitter: `${platforms.twitter}?text=${encodeURIComponent(title)}&url=${encodedBaseUrl}&hashtags=${hashtags}`,
    facebook: `${platforms.facebook}?u=${encodedBaseUrl}&quote=${encodedTitleAndDescription}`,
    linkedin: `${platforms.linkedin}?url=${encodedBaseUrl}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description || '')}`,
    reddit: `${platforms.reddit}?url=${encodedBaseUrl}&title=${encodeURIComponent(title)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=Check out this resource: ${baseUrl}%0D%0A%0D%0A${encodeURIComponent(description || '')}`,
  }
}

/**
 * Generate resource-specific share URLs with UTM parameters
 */
export const generateResourceShareUrls = (
  baseUrl: string,
  title: string,
  description?: string
) => {
  const { utm, platforms, hashtags } = contentConfig.socialShare

  const encodedBaseUrl = encodeURIComponent(
    addUTMParams(baseUrl, utm.source, utm.medium, utm.campaign)
  )
  const encodedTitleAndDescription = encodeURIComponent(
    `${title} - ${description || ''}`
  )

  return {
    twitter: `${platforms.twitter}?text=${encodeURIComponent(title)}&url=${encodedBaseUrl}&hashtags=${hashtags}`,
    facebook: `${platforms.facebook}?u=${encodedBaseUrl}&quote=${encodedTitleAndDescription}`,
    linkedin: `${platforms.linkedin}?url=${encodedBaseUrl}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description || '')}`,
    reddit: `${platforms.reddit}?url=${encodedBaseUrl}&title=${encodeURIComponent(title)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=Check out this resource: ${baseUrl}%0D%0A%0D%0A${encodeURIComponent(description || '')}`,
  }
}
