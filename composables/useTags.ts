import { ref, computed } from 'vue'
import type { Tag } from '~/types/tag'

// Sample hierarchical tag data structure for demonstration
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

export const useTags = () => {
  const tags = ref<Tag[]>(sampleTags)

  // Find a tag by ID
  const findTagById = (id: string): Tag | undefined => {
    const findInTree = (tagList: Tag[]): Tag | undefined => {
      for (const tag of tagList) {
        if (tag.id === id) {
          return tag
        }
        if (tag.children && tag.children.length > 0) {
          const found = findInTree(tag.children)
          if (found) return found
        }
      }
      return undefined
    }

    return findInTree(tags.value)
  }

  // Get all root level tags (tags without parents)
  const rootTags = computed(() => {
    return tags.value.filter(tag => !tag.parentId)
  })

  // Get all tags flattened
  const allTagsFlat = computed(() => {
    const flattenTags = (tagList: Tag[]): Tag[] => {
      let result: Tag[] = []
      for (const tag of tagList) {
        result.push(tag)
        if (tag.children && tag.children.length > 0) {
          result = result.concat(flattenTags(tag.children))
        }
      }
      return result
    }

    return flattenTags(tags.value)
  })

  // Get tags by parent ID
  const getTagsByParent = (parentId: string | null) => {
    return allTagsFlat.value.filter(tag => tag.parentId === parentId)
  }

  // Get tag path (ancestors) for a specific tag
  const getTagPath = (tagId: string): Tag[] => {
    const tag = findTagById(tagId)
    if (!tag) return []

    const path: Tag[] = [tag]
    let currentParentId = tag.parentId

    while (currentParentId) {
      const parent = findTagById(currentParentId)
      if (parent) {
        path.unshift(parent)
        currentParentId = parent.parentId
      } else {
        break
      }
    }

    return path
  }

  // Get tag name from ID (for compatibility with old string tags)
  const getTagNameFromId = (tagId: string): string => {
    const tag = findTagById(tagId)
    return tag ? tag.name : tagId
  }

  // Get tag from either ID or name
  const getTagFromValue = (value: string): Tag | undefined => {
    // First try to find by ID
    let tag = findTagById(value)
    if (tag) return tag

    // Then try to find by name or slug
    return allTagsFlat.value.find(
      t =>
        t.name.toLowerCase() === value.toLowerCase() ||
        t.slug.toLowerCase() === value.toLowerCase()
    )
  }

  // Convert tag objects to simple strings for API compatibility
  const convertTagsToStrings = (tags: (string | Tag)[]): string[] => {
    return tags.map(tag => {
      if (typeof tag === 'string') {
        return tag
      } else {
        return tag.id || tag.name
      }
    })
  }

  // Convert string tags to tag objects when possible
  const convertStringsToTags = (tags: string[]): (string | Tag)[] => {
    return tags.map(tag => {
      const tagObj = getTagFromValue(tag)
      return tagObj || tag
    })
  }

  // Add a new tag
  const addTag = (
    tag: Omit<Tag, 'createdAt' | 'updatedAt'> & {
      createdAt?: string
      updatedAt?: string
    }
  ) => {
    const now = new Date().toISOString()
    const newTag: Tag = {
      ...tag,
      createdAt: tag.createdAt || now,
      updatedAt: tag.updatedAt || now,
      children: tag.children || [],
    }

    if (newTag.parentId) {
      // Add to parent's children
      const parent = findTagById(newTag.parentId)
      if (parent) {
        if (!parent.children) parent.children = []
        parent.children.push(newTag)
      } else {
        // If parent doesn't exist, add as root tag
        tags.value.push(newTag)
      }
    } else {
      // Add as root tag
      tags.value.push(newTag)
    }
  }

  // Update a tag
  const updateTag = (
    id: string,
    updates: Partial<Omit<Tag, 'id' | 'createdAt'>>
  ) => {
    const tag = findTagById(id)
    if (tag) {
      Object.assign(tag, updates, { updatedAt: new Date().toISOString() })
    }
  }

  // Remove a tag
  const removeTag = (id: string) => {
    const tag = findTagById(id)
    if (!tag) return

    // Remove from parent's children if it has one
    if (tag.parentId) {
      const parent = findTagById(tag.parentId)
      if (parent && parent.children) {
        parent.children = parent.children.filter(child => child.id !== id)
      }
    } else {
      // Remove from root tags
      tags.value = tags.value.filter(tag => tag.id !== id)
    }
  }

  return {
    tags: tags,
    rootTags,
    allTagsFlat,
    findTagById,
    getTagsByParent,
    getTagPath,
    getTagNameFromId,
    getTagFromValue,
    convertTagsToStrings,
    convertStringsToTags,
    addTag,
    updateTag,
    removeTag,
  }
}
