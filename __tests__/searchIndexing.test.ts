import { describe, it, expect, beforeEach } from 'vitest'
import {
  searchIndexManager,
  createOptimizedResourceIndex,
  createSuggestionsIndex,
  optimizedSearch,
  initializeSearchIndexes,
  getSearchMetrics,
} from '~/utils/searchIndexing'
import type { Resource } from '~/types/resource'

// Mock resources for testing
const mockResources: readonly Resource[] = [
  {
    id: '1',
    title: 'Test Resource',
    description: 'This is a test resource for AI tools',
    benefits: ['Benefit 1', 'Benefit 2'],
    url: 'https://example.com',
    category: 'AI Tools',
    tags: ['test', 'resource', 'ai'],
    pricing: 'Free',
    difficulty: 'Beginner',
    lastUpdated: '2023-01-01',
  },
  {
    id: '2',
    title: 'Another Resource',
    description: 'This is another test resource for web development',
    benefits: ['Benefit 3'],
    url: 'https://example2.com',
    category: 'Web Development',
    tags: ['web', 'development', 'tool'],
    pricing: 'Freemium',
    difficulty: 'Intermediate',
    lastUpdated: '2023-01-02',
  },
  {
    id: '3',
    title: 'AI Development Tool',
    description: 'Advanced tool for AI development',
    benefits: ['Efficiency', 'Scalability'],
    url: 'https://example3.com',
    category: 'AI Tools',
    tags: ['ai', 'development', 'advanced'],
    pricing: 'Paid',
    difficulty: 'Advanced',
    lastUpdated: '2023-01-03',
  },
]

describe('searchIndexManager', () => {
  beforeEach(() => {
    // Clear all indexes before each test
    searchIndexManager.clearAll()
  })

  it('should create a new index', () => {
    const index = searchIndexManager.createIndex('test-index', mockResources)

    expect(index).toBeDefined()
    expect(index.resources).toHaveLength(3)
    expect(index.lastUpdated).toBeInstanceOf(Date)
    expect(index.stats.totalResources).toBe(3)
  })

  it('should get an existing index', () => {
    searchIndexManager.createIndex('test-index', mockResources)

    const index = searchIndexManager.getIndex('test-index')

    expect(index).toBeDefined()
    expect(index?.resources).toHaveLength(3)
  })

  it('should return null for non-existent index', () => {
    const index = searchIndexManager.getIndex('non-existent')

    expect(index).toBeNull()
  })

  it('should update an existing index', () => {
    searchIndexManager.createIndex('test-index', mockResources)

    const newResources: readonly Resource[] = [
      ...mockResources,
      {
        id: '4',
        title: 'New Resource',
        description: 'A new resource',
        benefits: ['New Benefit'],
        url: 'https://example4.com',
        category: 'New Category',
        tags: ['new'],
        pricing: 'Free',
        difficulty: 'Beginner',
        lastUpdated: '2023-01-04',
      },
    ]

    searchIndexManager.updateIndex('test-index', newResources)

    const updatedIndex = searchIndexManager.getIndex('test-index')
    expect(updatedIndex?.resources).toHaveLength(4)
    expect(updatedIndex?.stats.totalResources).toBe(4)
  })

  it('should search within an index', () => {
    searchIndexManager.createIndex('test-index', mockResources)

    const results = searchIndexManager.search('AI', 'test-index', 5)

    expect(results).toHaveLength(2) // Should find "Test Resource" and "AI Development Tool"
    expect(results.some(r => r.title.includes('AI'))).toBe(true)
  })

  it('should get suggestions from an index', () => {
    searchIndexManager.createIndex('test-index', mockResources)

    const results = searchIndexManager.getSuggestions(
      'development',
      'test-index',
      5
    )

    expect(results).toHaveLength(2) // Should find "Another Resource" and "AI Development Tool"
    expect(results.some(r => r.category.includes('Development'))).toBe(true)
  })

  it('should throw error when searching non-existent index', () => {
    expect(() => {
      searchIndexManager.search('test', 'non-existent', 5)
    }).toThrow("Search index 'non-existent' not found")
  })

  it('should get index statistics', () => {
    searchIndexManager.createIndex('test-index', mockResources)

    const stats = searchIndexManager.getStats('test-index')

    expect(stats).toBeDefined()
    expect(stats?.totalResources).toBe(3)
    expect(stats?.lastQueryTime).toBe(0) // Initially 0
  })

  it('should remove an index', () => {
    searchIndexManager.createIndex('test-index', mockResources)
    expect(searchIndexManager.getIndex('test-index')).toBeDefined()

    searchIndexManager.removeIndex('test-index')
    expect(searchIndexManager.getIndex('test-index')).toBeNull()
  })

  it('should clear all indexes', () => {
    searchIndexManager.createIndex('index-1', mockResources)
    searchIndexManager.createIndex('index-2', mockResources)

    expect(searchIndexManager.getAvailableIndexes()).toHaveLength(2)

    searchIndexManager.clearAll()
    expect(searchIndexManager.getAvailableIndexes()).toHaveLength(0)
  })

  it('should return available index names', () => {
    searchIndexManager.createIndex('index-1', mockResources)
    searchIndexManager.createIndex('index-2', mockResources)

    const names = searchIndexManager.getAvailableIndexes()
    expect(names).toContain('index-1')
    expect(names).toContain('index-2')
  })

  it('should check if index exists', () => {
    searchIndexManager.createIndex('test-index', mockResources)

    expect(searchIndexManager.hasIndex('test-index')).toBe(true)
    expect(searchIndexManager.hasIndex('non-existent')).toBe(false)
  })
})

describe('utility functions', () => {
  beforeEach(() => {
    // Clear all indexes before each test
    searchIndexManager.clearAll()
  })

  it('should create optimized resource index', () => {
    const index = createOptimizedResourceIndex(mockResources, 'optimized-test')

    expect(index).toBeDefined()
    expect(index.resources).toHaveLength(3)
    expect(searchIndexManager.getIndex('optimized-test')).toBeDefined()
  })

  it('should create suggestions index', () => {
    const index = createSuggestionsIndex(mockResources, 'suggestions-test')

    expect(index).toBeDefined()
    expect(index.resources).toHaveLength(3)
    expect(searchIndexManager.getIndex('suggestions-test')).toBeDefined()
  })

  it('should perform optimized search', () => {
    const results = optimizedSearch('AI', mockResources, 5)

    expect(results).toHaveLength(2) // Should find "Test Resource" and "AI Development Tool"
    expect(results.some(r => r.title.includes('AI'))).toBe(true)
  })

  it('should initialize search indexes', async () => {
    await initializeSearchIndexes(mockResources)

    expect(searchIndexManager.getIndex('resources')).toBeDefined()
    expect(searchIndexManager.getIndex('suggestions')).toBeDefined()
  })

  it('should get search metrics', () => {
    createOptimizedResourceIndex(mockResources, 'resources')

    const metrics = getSearchMetrics('resources')

    expect(metrics).toBeDefined()
    expect(metrics?.totalResources).toBe(3)
    expect(metrics?.lastUpdated).toBeInstanceOf(Date)
  })

  it('should return null for metrics of non-existent index', () => {
    const metrics = getSearchMetrics('non-existent')

    expect(metrics).toBeNull()
  })
})
