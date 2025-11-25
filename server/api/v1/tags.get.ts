import { getQuery, setResponseStatus } from 'h3'
import { Tag } from '~/types/tag'
import { logError } from '~/utils/errorLogger'

/**
 * GET /api/v1/tags
 *
 * Retrieve hierarchical tags with optional filtering
 *
 * Query parameters:
 * - parent: Filter by parent tag ID (optional)
 * - includeChildren: Include children in response (default: true)
 */
export default defineEventHandler(async event => {
  try {
    // For now, we'll return sample hierarchical tags
    // In a real implementation, this would come from a database
    const sampleTags: Tag[] = [
      {
        id: 'tech',
        name: 'Technology',
        slug: 'technology',
        description: 'Technology-related tags',
        parentId: null,
        children: [
          {
            id: 'ai',
            name: 'AI',
            slug: 'ai',
            description: 'Artificial Intelligence',
            parentId: 'tech',
            children: [
              {
                id: 'ml',
                name: 'Machine Learning',
                slug: 'machine-learning',
                description: 'Machine Learning',
                parentId: 'ai',
                children: [],
                synonyms: ['ML'],
                aliases: ['ML'],
                metadata: { category: 'AI' },
                createdAt: '2025-01-01',
                updatedAt: '2025-01-01',
              },
              {
                id: 'nlp',
                name: 'NLP',
                slug: 'nlp',
                description: 'Natural Language Processing',
                parentId: 'ai',
                children: [],
                synonyms: ['Natural Language Processing'],
                aliases: ['NLP'],
                metadata: { category: 'AI' },
                createdAt: '2025-01-01',
                updatedAt: '2025-01-01',
              },
            ],
            synonyms: ['Artificial Intelligence'],
            aliases: ['AI'],
            metadata: { category: 'Technology' },
            createdAt: '2025-01-01',
            updatedAt: '2025-01-01',
          },
          {
            id: 'web',
            name: 'Web Development',
            slug: 'web-development',
            description: 'Web Development',
            parentId: 'tech',
            children: [
              {
                id: 'frontend',
                name: 'Frontend',
                slug: 'frontend',
                description: 'Frontend Development',
                parentId: 'web',
                children: [],
                synonyms: ['Client-side'],
                aliases: ['Frontend'],
                metadata: { category: 'Web' },
                createdAt: '2025-01-01',
                updatedAt: '2025-01-01',
              },
              {
                id: 'backend',
                name: 'Backend',
                slug: 'backend',
                description: 'Backend Development',
                parentId: 'web',
                children: [],
                synonyms: ['Server-side'],
                aliases: ['Backend'],
                metadata: { category: 'Web' },
                createdAt: '2025-01-01',
                updatedAt: '2025-01-01',
              },
            ],
            synonyms: ['Web Dev'],
            aliases: ['Web Development'],
            metadata: { category: 'Technology' },
            createdAt: '2025-01-01',
            updatedAt: '2025-01-01',
          },
        ],
        synonyms: ['Tech'],
        aliases: ['Technology'],
        metadata: { category: 'Main' },
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
      {
        id: 'cloud',
        name: 'Cloud Computing',
        slug: 'cloud-computing',
        description: 'Cloud Computing Services',
        parentId: null,
        children: [
          {
            id: 'aws',
            name: 'AWS',
            slug: 'aws',
            description: 'Amazon Web Services',
            parentId: 'cloud',
            children: [],
            synonyms: ['Amazon Web Services'],
            aliases: ['AWS'],
            metadata: { category: 'Cloud' },
            createdAt: '2025-01-01',
            updatedAt: '2025-01-01',
          },
          {
            id: 'gcp',
            name: 'GCP',
            slug: 'gcp',
            description: 'Google Cloud Platform',
            parentId: 'cloud',
            children: [],
            synonyms: ['Google Cloud Platform'],
            aliases: ['GCP'],
            metadata: { category: 'Cloud' },
            createdAt: '2025-01-01',
            updatedAt: '2025-01-01',
          },
        ],
        synonyms: ['Cloud'],
        aliases: ['Cloud Computing'],
        metadata: { category: 'Main' },
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
    ]

    // Get query parameters
    const query = getQuery(event)
    const parent = query.parent as string | undefined
    const includeChildrenParam = query.includeChildren as string | undefined
    const includeChildren = includeChildrenParam !== 'false' // Default to true

    // Filter by parent if specified
    let tagsToReturn: Tag[]
    if (parent !== undefined) {
      // Find the parent and return its children
      const findParent = (tagList: Tag[]): Tag | undefined => {
        for (const tag of tagList) {
          if (tag.id === parent) {
            return tag
          }
          if (tag.children && tag.children.length > 0) {
            const found = findParent(tag.children)
            if (found) return found
          }
        }
        return undefined
      }

      const parentTag = findParent(sampleTags)
      tagsToReturn = parentTag?.children || []
    } else {
      tagsToReturn = sampleTags
    }

    // Conditionally remove children based on includeChildren parameter
    if (!includeChildren) {
      tagsToReturn = tagsToReturn.map(tag => ({
        ...tag,
        children: [],
      }))
    }

    // Set success response
    setResponseStatus(event, 200)
    return {
      success: true,
      data: tagsToReturn,
      count: tagsToReturn.length,
    }
  } catch (error: any) {
    // Log error using our error logging service
    logError(
      `Error fetching tags: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-tags',
      {
        query: getQuery(event),
        errorType: error?.constructor?.name,
      }
    )

    // Set error response status
    setResponseStatus(event, 500)
    return {
      success: false,
      message: 'An error occurred while fetching tags',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})
