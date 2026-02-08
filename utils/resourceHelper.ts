import { BUTTON_LABELS } from '~/configs/ui-text.config'

/**
 * Get button label based on resource category
 * Uses centralized UI text configuration
 * @param category - Resource category
 * @returns Button label text
 */
export const getButtonLabel = (category: string): string => {
  const normalizedCategory = category.toLowerCase()

  // Map legacy categories to new category format
  const categoryMapping: Record<string, string> = {
    'ai tools': 'AI/ML',
    'ai/ml': 'AI/ML',
    vps: 'Cloud',
    'web hosting': 'Cloud',
    cloud: 'Cloud',
    databases: 'Development',
    cdn: 'DevOps',
    devops: 'DevOps',
    design: 'Design',
    productivity: 'Productivity',
    marketing: 'Marketing',
    security: 'Security',
  }

  const mappedCategory = categoryMapping[normalizedCategory]

  if (mappedCategory && mappedCategory in BUTTON_LABELS.explore) {
    return BUTTON_LABELS.explore[
      mappedCategory as keyof typeof BUTTON_LABELS.explore
    ]
  }

  return BUTTON_LABELS.explore.default
}
