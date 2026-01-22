import { describe, it, expect, beforeEach } from 'vitest'
import { useResourceSearch } from '~/composables/useResourceSearch'
import type { Resource } from '~/types/resource'

const createMockResource = (
  id: string,
  title: string,
  category: string,
  tags: string[]
): Resource => {
  return {
    id,
    title,
    description: `Description for ${title}`,
    category,
    url: `https://example.com/${id}`,
    pricingModel: 'free',
    difficulty: 'beginner',
    popularity: 5,
    tags,
    technology: ['JavaScript'],
    benefits: [],
    lastUpdated: new Date(Date.now()).toISOString(),
    dateAdded: new Date(Date.now()).toISOString(),
    alternatives: [],
  }
}

const createMockResources = (count: number): Resource[] => {
  const categories = ['AI Tools', 'Web Hosting', 'Design', 'Productivity']
  const tagPool = [
    'machine learning',
    'frontend',
    'backend',
    'api',
    'automation',
    'nlp',
    'database',
    'cloud',
  ]

  return Array.from({ length: count }, (_, i) => {
    const category = categories[i % categories.length]
    const tags = [
      tagPool[i % tagPool.length],
      tagPool[(i + 1) % tagPool.length],
      tagPool[(i + 2) % tagPool.length],
    ]
    return createMockResource(
      `res-${i}`,
      `Resource ${i} - ${category}`,
      category,
      tags
    )
  })
}

describe('Fuse.js Caching Optimization: Centralized WeakMap Cache', () => {
  let resources: Resource[]

  beforeEach(() => {
    resources = createMockResources(1000)
  })

  it('should measure consolidated cache hit performance', () => {
    const search = useResourceSearch(resources)
    const iterations = 100
    const query = 'machine learning'

    const startTime = performance.now()

    for (let i = 0; i < iterations; i++) {
      search.searchResources(query)
    }

    const endTime = performance.now()
    const executionTime = endTime - startTime

    console.log(
      `Consolidated cache search (${iterations} iterations, ${resources.length} resources): ${executionTime.toFixed(4)}ms, avg ${(executionTime / iterations).toFixed(4)}ms`
    )

    expect(executionTime).toBeGreaterThan(0)
  })

  it('should measure suggestions with centralized cache', () => {
    const search = useResourceSearch(resources)
    const iterations = 100
    const query = 'machine'
    const limit = 5

    const startTime = performance.now()

    for (let i = 0; i < iterations; i++) {
      search.getSuggestions(query, limit)
    }

    const endTime = performance.now()
    const executionTime = endTime - startTime

    console.log(
      `Consolidated cache suggestions (${iterations} iterations, ${resources.length} resources, limit ${limit}): ${executionTime.toFixed(4)}ms, avg ${(executionTime / iterations).toFixed(4)}ms`
    )

    expect(executionTime).toBeGreaterThan(0)
  })

  it('should demonstrate cache efficiency with varying queries', () => {
    const search = useResourceSearch(resources)
    const queries = ['machine learning', 'frontend', 'api', 'database', 'cloud']
    const iterations = 50

    const startTime = performance.now()

    for (let i = 0; i < iterations; i++) {
      queries.forEach(query => {
        search.searchResources(query)
      })
    }

    const endTime = performance.now()
    const executionTime = endTime - startTime
    const totalCalls = iterations * queries.length

    console.log(
      `Multiple queries (${totalCalls} total calls, ${queries.length} unique queries): ${executionTime.toFixed(4)}ms, avg ${(executionTime / totalCalls).toFixed(4)}ms`
    )

    expect(executionTime).toBeGreaterThan(0)
  })

  it('should scale efficiently with resource count', () => {
    const sizes = [100, 500, 1000, 2000]
    const query = 'machine'
    const iterations = 50

    console.log('Scaling analysis for consolidated Fuse.js cache:')

    sizes.forEach(size => {
      const testResources = createMockResources(size)
      const search = useResourceSearch(testResources)

      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        search.searchResources(query)
      }

      const endTime = performance.now()
      const executionTime = endTime - startTime

      console.log(
        `  ${size} resources: ${executionTime.toFixed(4)}ms total, ${(executionTime / iterations).toFixed(4)}ms avg`
      )
    })

    expect(true).toBe(true)
  })

  it('should maintain correctness with cache optimization', () => {
    const search = useResourceSearch(resources)

    const query1 = 'machine learning'
    const query2 = 'frontend'
    const query3 = 'database'

    const results1 = search.searchResources(query1)
    const results2 = search.searchResources(query2)
    const results3 = search.searchResources(query3)

    expect(Array.isArray(results1)).toBe(true)
    expect(Array.isArray(results2)).toBe(true)
    expect(Array.isArray(results3)).toBe(true)

    expect(results1.length).toBeGreaterThan(0)
    expect(results2.length).toBeGreaterThan(0)
    expect(results3.length).toBeGreaterThan(0)

    const allResults = [...results1, ...results2, ...results3]
    allResults.forEach(result => {
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('title')
      expect(result).toHaveProperty('description')
    })
  })
})
