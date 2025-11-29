// API endpoint to get available comparison criteria
import type { ComparisonCriteria } from '~/types/comparison'

export default defineEventHandler((): ComparisonCriteria[] => {
  // Return standardized comparison criteria as specified in the issue
  const criteria: ComparisonCriteria[] = [
    {
      id: 'pricing',
      name: 'Pricing',
      type: 'text',
      category: 'business',
    },
    {
      id: 'freeTier',
      name: 'Free Tier Limits',
      type: 'text',
      category: 'business',
    },
    {
      id: 'paidPlans',
      name: 'Paid Plans',
      type: 'text',
      category: 'business',
    },
    {
      id: 'trialPeriod',
      name: 'Trial Period',
      type: 'text',
      category: 'business',
    },
    {
      id: 'coreFeatures',
      name: 'Core Functionality',
      type: 'list',
      category: 'features',
    },
    {
      id: 'uniqueFeatures',
      name: 'Unique Features',
      type: 'list',
      category: 'features',
    },
    {
      id: 'limitations',
      name: 'Limitations',
      type: 'list',
      category: 'features',
    },
    {
      id: 'platformSupport',
      name: 'Platform Support',
      type: 'list',
      category: 'technical',
    },
    {
      id: 'apiAvailability',
      name: 'API Availability',
      type: 'boolean',
      category: 'technical',
    },
    {
      id: 'integrations',
      name: 'Integrations',
      type: 'list',
      category: 'technical',
    },
    {
      id: 'reliability',
      name: 'Reliability',
      type: 'number',
      category: 'quality',
    },
    {
      id: 'performance',
      name: 'Performance',
      type: 'number',
      category: 'quality',
    },
    {
      id: 'userExperience',
      name: 'User Experience',
      type: 'number',
      category: 'quality',
    },
    {
      id: 'documentation',
      name: 'Documentation Quality',
      type: 'number',
      category: 'community',
    },
    {
      id: 'support',
      name: 'Support',
      type: 'text',
      category: 'community',
    },
    {
      id: 'activeDevelopment',
      name: 'Active Development',
      type: 'boolean',
      category: 'community',
    },
  ]

  return criteria
})
