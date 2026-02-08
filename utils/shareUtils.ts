/**
 * Utility functions for social sharing
 */
import { socialConfig } from '../configs/social.config'

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

  const { urls } = socialConfig

  return {
    twitter: `${urls.twitter.baseUrl}?text=${encodeURIComponent(title)}&url=${encodedBaseUrl}&hashtags=${urls.twitter.params.hashtags}`,
    facebook: `${urls.facebook.baseUrl}?u=${encodedBaseUrl}&quote=${encodedTitleAndDescription}`,
    linkedin: `${urls.linkedin.baseUrl}?url=${encodedBaseUrl}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description || '')}`,
    reddit: `${urls.reddit.baseUrl}?url=${encodedBaseUrl}&title=${encodeURIComponent(title)}`,
    email: `${urls.email.protocol}?subject=${encodeURIComponent(title)}&body=Check out this resource: ${baseUrl}%0D%0A%0D%0A${encodeURIComponent(description || '')}`,
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
  const { utm, urls } = socialConfig
  const encodedBaseUrl = encodeURIComponent(
    addUTMParams(
      baseUrl,
      utm.defaults.source,
      utm.defaults.medium,
      utm.defaults.campaign
    )
  )
  const encodedTitleAndDescription = encodeURIComponent(
    `${title} - ${description || ''}`
  )

  return {
    twitter: `${urls.twitter.baseUrl}?text=${encodeURIComponent(title)}&url=${encodedBaseUrl}&hashtags=${urls.twitter.params.hashtags}`,
    facebook: `${urls.facebook.baseUrl}?u=${encodedBaseUrl}&quote=${encodedTitleAndDescription}`,
    linkedin: `${urls.linkedin.baseUrl}?url=${encodedBaseUrl}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description || '')}`,
    reddit: `${urls.reddit.baseUrl}?url=${encodedBaseUrl}&title=${encodeURIComponent(title)}`,
    email: `${urls.email.protocol}?subject=${encodeURIComponent(title)}&body=Check out this resource: ${baseUrl}%0D%0A%0D%0A${encodeURIComponent(description || '')}`,
  }
}
