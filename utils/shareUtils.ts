import { marketingConfig } from '~/configs/marketing.config'

/**
 * Utility functions for social sharing
 * Flexy hates hardcoded values! All UTM params come from marketingConfig.
 */

/**
 * Add UTM parameters to a URL
 */
export const addUTMParams = (
  url: string,
  source?: string,
  medium?: string,
  campaign?: string,
  term?: string,
  content?: string
): string => {
  try {
    const urlObj = new URL(url)
    urlObj.searchParams.set('utm_source', source || marketingConfig.utm.source)
    urlObj.searchParams.set('utm_medium', medium || marketingConfig.utm.medium)
    urlObj.searchParams.set(
      'utm_campaign',
      campaign || marketingConfig.utm.campaign
    )

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
 * Flexy hates hardcoded values! All hashtags and params come from marketingConfig.
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
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodedBaseUrl}&hashtags=${marketingConfig.social.twitter.hashtags}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedBaseUrl}&quote=${encodedTitleAndDescription}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedBaseUrl}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description || '')}`,
    reddit: `https://www.reddit.com/submit?url=${encodedBaseUrl}&title=${encodeURIComponent(title)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
      marketingConfig.shareText.resource.email.body
        .replace('{{title}}', title)
        .replace('{{url}}', baseUrl)
        .replace('{{description}}', description || '')
    )}`,
  }
}

/**
 * Generate resource-specific share URLs with UTM parameters
 * Flexy hates hardcoded values! All UTM params come from marketingConfig.
 */
export const generateResourceShareUrls = (
  baseUrl: string,
  title: string,
  description?: string
) => {
  const encodedBaseUrl = encodeURIComponent(
    addUTMParams(
      baseUrl,
      marketingConfig.utm.source,
      marketingConfig.utm.medium,
      marketingConfig.campaigns.resourceShare
    )
  )
  const encodedTitleAndDescription = encodeURIComponent(
    `${title} - ${description || ''}`
  )

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodedBaseUrl}&hashtags=${marketingConfig.social.twitter.hashtags}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedBaseUrl}&quote=${encodedTitleAndDescription}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedBaseUrl}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description || '')}`,
    reddit: `https://www.reddit.com/submit?url=${encodedBaseUrl}&title=${encodeURIComponent(title)}`,
    email: `mailto:?subject=${encodeURIComponent(marketingConfig.shareText.resource.email.subject.replace('{{title}}', title))}&body=${encodeURIComponent(
      marketingConfig.shareText.resource.email.body
        .replace('{{title}}', title)
        .replace('{{url}}', baseUrl)
        .replace('{{description}}', description || '')
    )}`,
  }
}
