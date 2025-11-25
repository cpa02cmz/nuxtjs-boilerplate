// Define TypeScript interfaces for hierarchical tags
export interface Tag {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string | null
  children?: Tag[]
  synonyms?: string[]
  aliases?: string[]
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}
