// Define TypeScript interfaces for resources
export interface Resource {
  id: string
  title: string
  description: string
  benefits: readonly string[]
  url: string
  category: string
  pricingModel: string
  difficulty: string
  tags: readonly string[]
  technology: readonly string[]
  dateAdded: string
  popularity: number
  icon?: string
  healthStatus?: {
    status: 'healthy' | 'broken' | 'redirected' | 'slow' | 'unknown'
    lastChecked: string
    statusCode?: number
    responseTime?: number
    redirectUrl?: string
  }
}

export interface FilterOptions {
  searchQuery?: string
  categories?: string[]
  pricingModels?: string[]
  difficultyLevels?: string[]
  technologies?: string[]
}

export type SortOption =
  | 'alphabetical-asc'
  | 'alphabetical-desc'
  | 'popularity-desc'
  | 'date-added-desc'
