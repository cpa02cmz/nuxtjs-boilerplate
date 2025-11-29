// Define TypeScript interfaces for resource comparison functionality

export interface ComparisonCriteria {
  id: string
  name: string
  type: 'text' | 'number' | 'boolean' | 'list'
  weight?: number
  category: string
}

export interface ResourceComparison {
  id: string
  resources: string[] // Resource IDs
  criteria: ComparisonCriteria[]
  scores: Record<string, number>
  createdAt: string
  createdBy?: string
  isPublic: boolean
  slug?: string
}

export interface ComparisonView {
  resource: any // Using any to match the existing Resource type
  scores: Record<string, number>
  highlights: string[]
  missing: string[]
}
