import { ref } from 'vue'
import { logError } from '~/utils/errorLogger'

export interface ShareEvent {
  platform: string
  resourceId?: string
  resourceType?: string
  url: string
  timestamp: Date
  userAgent?: string
  referrer?: string
}

export interface SocialMetadata {
  title: string
  description: string
  url: string
  image?: string
  type?: string
  siteName?: string
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  twitterSite?: string
  twitterCreator?: string
}

/**
 * Track social share event
 */
export async function trackSocialShare(event: ShareEvent): Promise<void> {
  try {
    const response = await fetch('/api/v1/social/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      console.warn('Failed to track social share:', response.statusText)
    }
  } catch (error) {
    logError('Error tracking social share:', error as Error, 'trackSocialShare')
  }
}

/**
 * Generate Open Graph meta tags
 */
export function generateOpenGraphTags(metadata: SocialMetadata): string {
  const tags: string[] = []

  // Basic Open Graph tags
  tags.push(
    `<meta property="og:title" content="${escapeHtml(metadata.title)}">`
  )
  tags.push(
    `<meta property="og:description" content="${escapeHtml(metadata.description)}">`
  )
  tags.push(`<meta property="og:url" content="${metadata.url}">`)
  tags.push(`<meta property="og:type" content="${metadata.type || 'website'}">`)

  if (metadata.siteName) {
    tags.push(
      `<meta property="og:site_name" content="${escapeHtml(metadata.siteName)}">`
    )
  }

  if (metadata.image) {
    tags.push(`<meta property="og:image" content="${metadata.image}">`)
  }

  return tags.join('\n')
}

/**
 * Generate Twitter Card meta tags
 */
export function generateTwitterCardTags(metadata: SocialMetadata): string {
  const tags: string[] = []

  // Twitter Card type
  tags.push(
    `<meta name="twitter:card" content="${metadata.twitterCard || 'summary'}">`
  )
  tags.push(
    `<meta name="twitter:title" content="${escapeHtml(metadata.title)}">`
  )
  tags.push(
    `<meta name="twitter:description" content="${escapeHtml(metadata.description)}">`
  )

  if (metadata.twitterSite) {
    tags.push(`<meta name="twitter:site" content="${metadata.twitterSite}">`)
  }

  if (metadata.twitterCreator) {
    tags.push(
      `<meta name="twitter:creator" content="${metadata.twitterCreator}">`
    )
  }

  if (metadata.image) {
    tags.push(`<meta name="twitter:image" content="${metadata.image}">`)
  }

  return tags.join('\n')
}

/**
 * Generate all social media meta tags
 */
export function generateSocialMetaTags(metadata: SocialMetadata): string {
  return [
    generateOpenGraphTags(metadata),
    generateTwitterCardTags(metadata),
  ].join('\n')
}

/**
 * Get share URL for a platform
 */
export function getShareUrl(
  platform: string,
  metadata: SocialMetadata
): string {
  const url = encodeURIComponent(metadata.url)
  const title = encodeURIComponent(metadata.title)
  const description = encodeURIComponent(metadata.description)

  const urls: Record<string, string> = {
    twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    reddit: `https://www.reddit.com/submit?title=${title}&url=${url}`,
    email: `mailto:?subject=${title}&body=${description}%0A%0A${url}`,
  }

  return urls[platform] || ''
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Composable for social sharing functionality
 */
export function useSocialSharing() {
  const isSharing = ref(false)
  const lastError = ref<string | null>(null)

  /**
   * Share content to a social platform
   */
  const share = async (
    platform: string,
    metadata: SocialMetadata,
    options: { resourceId?: string; resourceType?: string } = {}
  ): Promise<boolean> => {
    isSharing.value = true
    lastError.value = null

    try {
      const shareUrl = getShareUrl(platform, metadata)

      if (!shareUrl) {
        throw new Error(`Unsupported platform: ${platform}`)
      }

      // Track the share event
      await trackSocialShare({
        platform,
        resourceId: options.resourceId,
        resourceType: options.resourceType,
        url: metadata.url,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      })

      // Open share window for web platforms
      if (platform !== 'email') {
        const width = 600
        const height = 400
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2

        window.open(
          shareUrl,
          `share-${platform}`,
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
        )
      } else {
        // For email, just open the mailto link
        window.location.href = shareUrl
      }

      return true
    } catch (error) {
      lastError.value = error instanceof Error ? error.message : 'Share failed'
      logError('Social share failed:', error as Error, 'useSocialSharing')
      return false
    } finally {
      isSharing.value = false
    }
  }

  /**
   * Copy link to clipboard
   */
  const copyLink = async (
    url: string,
    options: { resourceId?: string; resourceType?: string } = {}
  ): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(url)

      // Track copy event
      await trackSocialShare({
        platform: 'copy',
        resourceId: options.resourceId,
        resourceType: options.resourceType,
        url,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      })

      return true
    } catch (error) {
      lastError.value = error instanceof Error ? error.message : 'Copy failed'
      return false
    }
  }

  /**
   * Get social share counts (if available)
   */
  const getShareCounts = async (
    url: string
  ): Promise<Record<string, number>> => {
    try {
      const response = await fetch(
        `/api/v1/social/counts?url=${encodeURIComponent(url)}`
      )
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      logError(
        'Error fetching share counts:',
        error as Error,
        'useSocialSharing'
      )
    }
    return {}
  }

  return {
    isSharing,
    lastError,
    share,
    copyLink,
    getShareCounts,
    generateSocialMetaTags,
    getShareUrl,
  }
}
