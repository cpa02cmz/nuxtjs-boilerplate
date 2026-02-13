// Define TypeScript interfaces for resources
import type { HierarchicalTag } from './tag'

export interface Resource {
  id: string
  title: string
  description: string
  benefits: readonly string[]
  url: string
  category: string
  pricingModel: string
  difficulty: string
  tags: readonly string[] // Maintain backward compatibility with flat tags
  hierarchicalTags?: readonly HierarchicalTag[] // New hierarchical tags support
  technology: readonly string[]
  dateAdded: string
  lastUpdated?: string // When the resource was last updated
  popularity: number
  viewCount?: number // Number of views for analytics
  rating?: number // Average user rating
  screenshots?: readonly string[] // URLs to screenshots/images
  specifications?: Record<string, string> // Detailed specifications
  features?: readonly string[] // Additional features beyond benefits
  limitations?: readonly string[] // Known limitations
  platforms?: readonly string[] // Supported platforms
  license?: string // License type if open source
  icon?: string
  // Alternative resources
  alternatives?: readonly string[] // IDs of alternative resources
  similarityScore?: number // For alternative relationships
  // Moderation fields
  status?: 'pending' | 'approved' | 'rejected' | 'deprecated' // Default is 'approved' for existing resources
  submittedBy?: string // User ID
  reviewedBy?: string // Moderator ID
  reviewedAt?: string
  rejectionReason?: string
  qualityScore?: number
  flags?: Flag[] | readonly Flag[]
  // Extended fields (added dynamically by server)
  healthScore?: number
  migrationPath?: string
  deprecationDate?: string
  statusHistory?: readonly StatusChange[]
  updateHistory?: readonly ResourceUpdate[]
}

export interface Flag {
  id: string
  resourceId: string
  reason: string
  reportedBy: string
  createdAt: string
  resolved: boolean
}

export interface StatusChange {
  readonly id: string
  readonly fromStatus: string
  readonly toStatus: string
  readonly changedAt: string
  readonly changedBy: string
  readonly reason?: string
  readonly notes?: string
}

export interface ResourceUpdate {
  readonly id: string
  readonly version: string
  readonly updatedAt: string
  readonly changelog?: string
  readonly changes?: readonly string[]
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  joinedAt: string
  contributions?: number
  reputation?: number
}

export interface Comment {
  id: string
  userId: string
  targetType: string
  targetId: string
  content: string
  createdAt: string
  updatedAt?: string
  isEdited?: boolean
  editedAt?: string
  parentId?: string
  replies?: Comment[]
  likes?: number
}

export interface Vote {
  id: string
  userId: string
  targetType: string
  targetId: string
  voteType: 'up' | 'down'
  timestamp: string
}

export interface FilterOptions {
  searchQuery?: string
  categories?: string[] | readonly string[]
  pricingModels?: string[] | readonly string[]
  difficultyLevels?: string[] | readonly string[]
  technologies?: string[] | readonly string[]
  tags?: string[] | readonly string[]
  benefits?: string[] | readonly string[]
  dateRange?: string
}

export interface AlternativeSuggestion {
  resource: Resource
  score: number
  reason: string
  isAlternative: boolean
  similarityFactors: string[]
}

export interface AlternativeRelationship {
  id: string
  resourceId: string
  alternativeId: string
  similarityScore: number
  reason: string
  createdAt: string
}

export type SortOption =
  | 'alphabetical-asc'
  | 'alphabetical-desc'
  | 'popularity-desc'
  | 'date-added-desc'
  | 'relevance'
