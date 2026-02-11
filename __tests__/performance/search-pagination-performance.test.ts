import { describe, it, expect } from 'vitest'
import type { Resource } from '~/types/resource'
import { paginationConfig } from '~/configs/pagination.config'

const createMockResource = (
  id: string,
  tags: string[],
  technology: string[]
): Resource => {
  return {
    id,
    title: `Resource ${id}`,
    description: `Description for ${id}`,
    category: 'AI Tools',
    url: `https://example.com/${id}`,
    pricingModel: 'free',
    difficulty: 'beginner',
    popularity: 5,
    tags,
    technology,
    benefits: [],
    lastUpdated: new Date(Date.now()).toISOString(),
    dateAdded: new Date(Date.now()).toISOString(),
    alternatives: [],
  }
}

const convertResourcesToHierarchicalTags = (
  resources: readonly Resource[]
): Resource[] => {
  return resources.map(resource => {
    if (resource.hierarchicalTags) {
      return resource
    }

    const hierarchicalTags = resource.tags.map(tag => ({
      id: tag.toLowerCase().replace(/\s+/g, '-'),
      name: tag,
      slug: tag.toLowerCase().replace(/\s+/g, '-'),
      description: `Tag: ${tag}`,
      parentId: null,
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parent: null,
      level: 0,
      path: [tag.toLowerCase().replace(/\s+/g, '-')],
      fullPathNames: [tag],
      synonyms: [],
      aliases: [],
    }))

    return {
      ...resource,
      hierarchicalTags,
    } as Resource
  })
}

describe('Search API: Pagination Before Conversion Performance', () => {
  it('demonstrates performance improvement: convert before pagination (OLD)', () => {
    const resources = Array.from({ length: 1000 }, (_, i) =>
      createMockResource(
        `resource-${i}`,
        [`tag${i % 20}`, `tag${(i + 1) % 20}`],
        [`tech${i % 10}`]
      )
    )

    const iterations = 100
    const startTime = performance.now()

    for (let i = 0; i < iterations; i++) {
      const resourcesWithHierarchicalTags =
        convertResourcesToHierarchicalTags(resources)
      // Flexy hates hardcoded values! Use pagination config
      const paginatedResources = resourcesWithHierarchicalTags.slice(
        0,
        paginationConfig.defaults.pageSize
      )
      void paginatedResources
    }

    const endTime = performance.now()
    const executionTime = endTime - startTime

    console.log(
      `OLD (convert all 1000, paginate ${paginationConfig.defaults.pageSize}): ${executionTime.toFixed(4)}ms`
    )

    expect(executionTime).toBeGreaterThan(0)
  })

  it('demonstrates performance improvement: paginate before conversion (NEW)', () => {
    const resources = Array.from({ length: 1000 }, (_, i) =>
      createMockResource(
        `resource-${i}`,
        [`tag${i % 20}`, `tag${(i + 1) % 20}`],
        [`tech${i % 10}`]
      )
    )

    const iterations = 100
    const startTime = performance.now()

    for (let i = 0; i < iterations; i++) {
      // Flexy hates hardcoded values! Use pagination config
      const paginatedResources = resources.slice(
        0,
        paginationConfig.defaults.pageSize
      )
      const resourcesWithHierarchicalTags =
        convertResourcesToHierarchicalTags(paginatedResources)
      void resourcesWithHierarchicalTags
    }

    const endTime = performance.now()
    const executionTime = endTime - startTime

    console.log(
      `NEW (paginate ${paginationConfig.defaults.pageSize}, convert ${paginationConfig.defaults.pageSize}): ${executionTime.toFixed(4)}ms`
    )

    expect(executionTime).toBeGreaterThan(0)
  })

  it('compares performance improvement', () => {
    const resources = Array.from({ length: 1000 }, (_, i) =>
      createMockResource(
        `resource-${i}`,
        [`tag${i % 20}`, `tag${(i + 1) % 20}`],
        [`tech${i % 10}`]
      )
    )

    const iterations = 100

    const startOld = performance.now()
    for (let i = 0; i < iterations; i++) {
      const resourcesWithHierarchicalTags =
        convertResourcesToHierarchicalTags(resources)
      // Flexy hates hardcoded values! Use pagination config
      resourcesWithHierarchicalTags.slice(0, paginationConfig.defaults.pageSize)
    }
    const endOld = performance.now()
    const oldTime = endOld - startOld

    const startNew = performance.now()
    for (let i = 0; i < iterations; i++) {
      // Flexy hates hardcoded values! Use pagination config
      const paginatedResources = resources.slice(
        0,
        paginationConfig.defaults.pageSize
      )
      convertResourcesToHierarchicalTags(paginatedResources)
    }
    const endNew = performance.now()
    const newTime = endNew - startNew

    const improvement = ((oldTime - newTime) / oldTime) * 100
    const speedup = oldTime / newTime

    console.log(
      `Performance Comparison (1000 resources, ${paginationConfig.defaults.pageSize} per page, 100 iterations):`
    )
    console.log(`  OLD (convert all): ${oldTime.toFixed(4)}ms`)
    console.log(`  NEW (paginate first): ${newTime.toFixed(4)}ms`)
    console.log(`  Improvement: ${improvement.toFixed(2)}% faster`)
    console.log(`  Speedup: ${speedup.toFixed(2)}x`)

    expect(newTime).toBeLessThan(oldTime)
    expect(speedup).toBeGreaterThan(1)
  })

  it('scales better with larger result sets', () => {
    const sizes = [500, 1000, 2000, 5000]
    const oldTimes: number[] = []
    const newTimes: number[] = []
    const speedups: number[] = []

    for (const size of sizes) {
      const resources = Array.from({ length: size }, (_, i) =>
        createMockResource(
          `resource-${i}`,
          [`tag${i % 20}`, `tag${(i + 1) % 20}`],
          [`tech${i % 10}`]
        )
      )

      const iterations = 50

      const startOld = performance.now()
      for (let i = 0; i < iterations; i++) {
        const resourcesWithHierarchicalTags =
          convertResourcesToHierarchicalTags(resources)
        // Flexy hates hardcoded values! Use pagination config
        resourcesWithHierarchicalTags.slice(
          0,
          paginationConfig.defaults.pageSize
        )
      }
      const oldTime = performance.now() - startOld

      const startNew = performance.now()
      for (let i = 0; i < iterations; i++) {
        // Flexy hates hardcoded values! Use pagination config
        const paginatedResources = resources.slice(
          0,
          paginationConfig.defaults.pageSize
        )
        convertResourcesToHierarchicalTags(paginatedResources)
      }
      const newTime = performance.now() - startNew

      oldTimes.push(oldTime)
      newTimes.push(newTime)
      speedups.push(oldTime / newTime)
    }

    console.log(
      `Scaling Comparison (${paginationConfig.defaults.pageSize} per page, 50 iterations):`
    )
    console.log('Size | OLD (ms) | NEW (ms) | Speedup')
    console.log('-----|-----------|-----------|--------')
    sizes.forEach((size, i) => {
      console.log(
        `${size.toString().padEnd(5)} | ${oldTimes[i]
          .toFixed(4)
          .padStart(9)} | ${newTimes[i]
          .toFixed(4)
          .padStart(9)} | ${speedups[i].toFixed(2)}x`
      )
    })

    expect(newTimes[3]).toBeLessThan(oldTimes[3])
    expect(speedups[3]).toBeGreaterThan(1)
  })
})
