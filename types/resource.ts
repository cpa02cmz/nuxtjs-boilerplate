// Define TypeScript interfaces for resources
export interface Tag {
  id: string
  name: string
  parentId?: string
  synonyms?: readonly string[]
  description?: string
  children?: readonly Tag[]
}

export interface HierarchicalTag extends Tag {
  level?: number
  path?: readonly string[]
}

export interface Resource {
  id: string
  title: string
  description: string
  benefits: readonly string[]
  url: string
  category: string
  pricingModel: string
  difficulty: string
  tags: readonly (string | HierarchicalTag)[]
  technology: readonly string[]
  dateAdded: string
  popularity: number
  icon?: string
}

export interface FilterOptions {
  searchQuery?: string
  categories?: string[]
  pricingModels?: string[]
  difficultyLevels?: string[]
  technologies?: string[]
  tags?: string[]
}

export type SortOption =
  | 'alphabetical-asc'
  | 'alphabetical-desc'
  | 'popularity-desc'
  | 'date-added-desc'
