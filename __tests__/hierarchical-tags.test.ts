import { describe, it, expect, beforeEach } from 'vitest'
import { useTags } from '~/composables/useTags'

describe('Hierarchical Tags', () => {
  let tagsComposable: ReturnType<typeof useTags>

  beforeEach(() => {
    tagsComposable = useTags()
  })

  it('should find a tag by ID', () => {
    const tag = tagsComposable.findTagById('ai')
    expect(tag).toBeDefined()
    expect(tag?.name).toBe('AI')
    expect(tag?.parentId).toBe('tech')
  })

  it('should return all root tags', () => {
    const rootTags = tagsComposable.rootTags.value
    expect(rootTags.length).toBeGreaterThan(0)
    expect(rootTags.some(tag => tag.id === 'tech')).toBe(true)
    expect(rootTags.some(tag => tag.id === 'cloud')).toBe(true)
  })

  it('should return all tags flattened', () => {
    const allTags = tagsComposable.allTagsFlat.value
    expect(allTags.length).toBeGreaterThan(0)
    expect(allTags.some(tag => tag.id === 'ml')).toBe(true)
  })

  it('should get tags by parent', () => {
    const childTags = tagsComposable.getTagsByParent('tech')
    expect(childTags.length).toBeGreaterThan(0)
    expect(childTags.some(tag => tag.id === 'ai')).toBe(true)
    expect(childTags.some(tag => tag.id === 'web')).toBe(true)
  })

  it('should get tag path for nested tags', () => {
    const path = tagsComposable.getTagPath('ml')
    expect(path.length).toBe(3) // tech -> ai -> ml
    expect(path[0].id).toBe('tech')
    expect(path[1].id).toBe('ai')
    expect(path[2].id).toBe('ml')
  })

  it('should convert tag objects to strings', () => {
    const tags = ['simple-tag', { id: 'ai', name: 'AI', slug: 'ai' } as any]
    const stringTags = tagsComposable.convertTagsToStrings(tags)
    expect(stringTags).toEqual(['simple-tag', 'ai'])
  })

  it('should convert string tags to tag objects when possible', () => {
    const stringTags = ['ai', 'non-existent-tag']
    const convertedTags = tagsComposable.convertStringsToTags(stringTags)
    expect(convertedTags.length).toBe(2)
    expect(convertedTags[0]).toHaveProperty('id', 'ai')
    expect(convertedTags[1]).toBe('non-existent-tag')
  })

  it('should add a new tag', () => {
    const initialCount = tagsComposable.allTagsFlat.value.length
    tagsComposable.addTag({
      id: 'test-tag',
      name: 'Test Tag',
      slug: 'test-tag',
      parentId: null,
      description: 'Test description',
    })
    expect(tagsComposable.allTagsFlat.value.length).toBe(initialCount + 1)
    expect(tagsComposable.findTagById('test-tag')).toBeDefined()
  })

  it('should update an existing tag', () => {
    const originalTag = tagsComposable.findTagById('ai')
    expect(originalTag?.name).toBe('AI')

    tagsComposable.updateTag('ai', { name: 'Artificial Intelligence' })
    const updatedTag = tagsComposable.findTagById('ai')
    expect(updatedTag?.name).toBe('Artificial Intelligence')
  })
})
