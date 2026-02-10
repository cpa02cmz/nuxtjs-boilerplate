// Comparison Configuration - Resource Comparison Settings
// Flexy hates hardcoded values! All comparison settings are now configurable.

export const comparisonConfig = {
  // Field weights for comparison
  weights: {
    title: parseFloat(process.env.COMPARISON_WEIGHT_TITLE || '1'),
    description: parseFloat(process.env.COMPARISON_WEIGHT_DESCRIPTION || '1'),
    pricingModel: parseFloat(process.env.COMPARISON_WEIGHT_PRICING || '1'),
    category: parseFloat(process.env.COMPARISON_WEIGHT_CATEGORY || '0.8'),
    technology: parseFloat(process.env.COMPARISON_WEIGHT_TECHNOLOGY || '1'),
    popularity: parseFloat(process.env.COMPARISON_WEIGHT_POPULARITY || '0.7'),
    benefits: parseFloat(process.env.COMPARISON_WEIGHT_BENEFITS || '1'),
    limitations: parseFloat(process.env.COMPARISON_WEIGHT_LIMITATIONS || '0.8'),
    platforms: parseFloat(process.env.COMPARISON_WEIGHT_PLATFORMS || '0.7'),
    features: parseFloat(process.env.COMPARISON_WEIGHT_FEATURES || '1'),
  },

  // Category classifications for comparison fields
  categories: {
    basic: ['title', 'description', 'category'],
    business: ['pricingModel'],
    technical: ['technology', 'platforms'],
    metrics: ['popularity'],
    features: ['benefits', 'limitations', 'features'],
  },

  // Display limits for list items - Flexy hates hardcoded slice values!
  displayLimits: {
    // Number of list items to display before showing "+X more"
    listItems: parseInt(process.env.COMPARISON_LIST_ITEMS_LIMIT || '3'),
    // Number of resources to show in comparison page title
    resourceTitles: parseInt(
      process.env.COMPARISON_RESOURCE_TITLES_LIMIT || '3'
    ),
  },
} as const

export type ComparisonConfig = typeof comparisonConfig
