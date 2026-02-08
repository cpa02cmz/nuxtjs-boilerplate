import { uiConfig } from '~/configs/ui.config'

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
