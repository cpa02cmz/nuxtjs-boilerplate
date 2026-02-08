import {
  SOCIAL_SHARE_URLS,
  DEFAULT_HASHTAGS,
  UTM_DEFAULTS,
} from '~/constants/external'

/**
 * Utility functions for social sharing
 */

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

  return {
    twitter: `${SOCIAL_SHARE_URLS.twitter}?text=${encodeURIComponent(title)}&url=${encodedBaseUrl}&hashtags=${DEFAULT_HASHTAGS.join(',')}`,
    facebook: `${SOCIAL_SHARE_URLS.facebook}?u=${encodedBaseUrl}&quote=${encodedTitleAndDescription}`,
    linkedin: `${SOCIAL_SHARE_URLS.linkedin}?url=${encodedBaseUrl}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description || '')}`,
    reddit: `${SOCIAL_SHARE_URLS.reddit}?url=${encodedBaseUrl}&title=${encodeURIComponent(title)}`,
    email: `${SOCIAL_SHARE_URLS.email}?subject=${encodeURIComponent(title)}&body=Check out this resource: ${baseUrl}%0D%0A%0D%0A${encodeURIComponent(description || '')}`,
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
  const encodedBaseUrl = encodeURIComponent(
    addUTMParams(
      baseUrl,
      UTM_DEFAULTS.source,
      UTM_DEFAULTS.medium,
      UTM_DEFAULTS.campaign
    )
  )
  const encodedTitleAndDescription = encodeURIComponent(
    `${title} - ${description || ''}`
  )

  return {
    twitter: `${SOCIAL_SHARE_URLS.twitter}?text=${encodeURIComponent(title)}&url=${encodedBaseUrl}&hashtags=${DEFAULT_HASHTAGS.join(',')}`,
    facebook: `${SOCIAL_SHARE_URLS.facebook}?u=${encodedBaseUrl}&quote=${encodedTitleAndDescription}`,
    linkedin: `${SOCIAL_SHARE_URLS.linkedin}?url=${encodedBaseUrl}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description || '')}`,
    reddit: `${SOCIAL_SHARE_URLS.reddit}?url=${encodedBaseUrl}&title=${encodeURIComponent(title)}`,
    email: `${SOCIAL_SHARE_URLS.email}?subject=${encodeURIComponent(title)}&body=Check out this resource: ${baseUrl}%0D%0A%0D%0A${encodeURIComponent(description || '')}`,
  }
}
