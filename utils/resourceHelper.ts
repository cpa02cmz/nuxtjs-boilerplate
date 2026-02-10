import { uiConfig } from '~/configs/ui.config'

/**
 * Extract domain from URL with error handling
 * Returns clean domain (e.g., "github.com" from "https://github.com/user/repo")
 */
export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url)
    // Remove 'www.' prefix if present for cleaner display
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    // Return empty string for invalid URLs
    return ''
  }
}

/**
 * Format domain for display in tooltip
 * Adds visual indicator for external link
 */
export const formatDomainTooltip = (url: string): string => {
  const domain = extractDomain(url)
  if (!domain) return 'Visit external link'
  return `Visit ${domain} ↗`
}

/**
 * Get button label for a resource based on its category
 * Flexy hates hardcoded values - uses uiConfig now!
 */
export const getButtonLabel = (category: string): string => {
  const normalizedCategory = category.toLowerCase()
  const categoryLabels = uiConfig.resourceCard.categoryButtonLabels

  // Use type-safe access with fallback
  if (normalizedCategory === 'ai tools' && categoryLabels['ai tools']) {
    return categoryLabels['ai tools']
  }
  if (normalizedCategory === 'web hosting' && categoryLabels['web hosting']) {
    return categoryLabels['web hosting']
  }
  if (normalizedCategory === 'databases' && categoryLabels.databases) {
    return categoryLabels.databases
  }
  if (normalizedCategory === 'vps' && categoryLabels.vps) {
    return categoryLabels.vps
  }
  if (normalizedCategory === 'cdn' && categoryLabels.cdn) {
    return categoryLabels.cdn
  }

  // Default label from config
  return uiConfig.resourceCard.defaultButtonLabel
}
