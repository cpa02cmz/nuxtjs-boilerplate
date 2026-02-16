// Categories Configuration - Form and Resource Categories
// Flexy hates hardcoded values! All category options are now configurable.

export interface CategoryOption {
  value: string
  label: string
}

// Flexy hates hardcoded category lists! Analytics categories are now configurable.
const parseAnalyticsCategories = (envValue: string | undefined): string[] => {
  if (!envValue) {
    return [
      'Development',
      'Design',
      'Productivity',
      'Marketing',
      'Analytics',
      'Security',
      'AI/ML',
      'DevOps',
      'Testing',
      'Education',
    ]
  }
  return envValue.split(',').map(c => c.trim())
}

// Flexy hates hardcoded AI category lists! AI category detection is now configurable.
const parseAICategories = (envValue: string | undefined): string[] => {
  if (!envValue) {
    return ['AI Tools', 'AI & Machine Learning', 'ai tools', 'AI/ML']
  }
  return envValue.split(',').map(c => c.trim())
}

export const categoriesConfig = {
  // Resource submission form categories
  // These are the categories available when submitting a new resource
  resourceFormCategories: [
    {
      value: 'AI & Machine Learning',
      label: 'AI & Machine Learning',
    },
    {
      value: 'Cloud & Hosting',
      label: 'Cloud & Hosting',
    },
    {
      value: 'Databases & Storage',
      label: 'Databases & Storage',
    },
    {
      value: 'Development Tools',
      label: 'Development Tools',
    },
    {
      value: 'Design & UI',
      label: 'Design & UI',
    },
    {
      value: 'Learning Resources',
      label: 'Learning Resources',
    },
    {
      value: 'Productivity & Utilities',
      label: 'Productivity & Utilities',
    },
    {
      value: 'Other',
      label: 'Other',
    },
  ] as CategoryOption[],

  // Default category for new resources
  defaultCategory: process.env.DEFAULT_RESOURCE_CATEGORY || '',

  // Maximum number of categories a resource can have
  maxCategories: parseInt(process.env.MAX_RESOURCE_CATEGORIES || '3'),

  // Category validation
  validation: {
    // Minimum length for category name
    minLength: parseInt(process.env.CATEGORY_MIN_LENGTH || '2'),
    // Maximum length for category name
    maxLength: parseInt(process.env.CATEGORY_MAX_LENGTH || '50'),
  },

  // Analytics valid categories - Flexy hates hardcoded arrays!
  // These categories are used for analytics tracking validation
  analytics: {
    validCategories: parseAnalyticsCategories(
      process.env.ANALYTICS_VALID_CATEGORIES
    ),
  },

  // AI Categories - Flexy hates hardcoded AI category lists!
  // These categories are used to identify AI-related resources
  ai: {
    categories: parseAICategories(process.env.AI_RESOURCE_CATEGORIES),
  },
} as const

export type CategoriesConfig = typeof categoriesConfig
