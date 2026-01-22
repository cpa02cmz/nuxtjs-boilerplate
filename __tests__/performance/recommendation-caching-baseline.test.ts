import { describe, it, expect } from 'vitest'
import type { Resource } from '~/types/resource'
import { useRecommendationEngine } from '~/composables/useRecommendationEngine'

const createMockResources = (count: number): Resource[] => {
  const categories = [
    'AI Tools',
    'Hosting',
    'Development',
    'Design',
    'Productivity',
  ]
  const technologies = ['React', 'Vue', 'Node.js', 'Python', 'TypeScript']

  return Array.from({ length: count }, (_, i) => ({
    id: `res-${i}`,
    title: `Resource ${i}`,
    description: `Description for resource ${i}`,
    url: `https://example.com/resource-${i}`,
    category: categories[i % categories.length],
    pricingModel: ['Free', 'Freemium', 'Open Source'][i % 3],
    difficulty: ['Beginner', 'Intermediate', 'Advanced'][i % 3],
    technology: [technologies[i % technologies.length]],
    tags: [`tag-${i % 10}`, `tag-${(i + 1) % 10}`],
    popularity: Math.floor(Math.random() * 1000),
    dateAdded: new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    benefits: [`Benefit ${i}1`, `Benefit ${i}2`],
  }))
}

describe('Recommendation Engine Performance Baseline', () => {
  const smallDataset = createMockResources(100)
  const mediumDataset = createMockResources(500)
  const largeDataset = createMockResources(1000)

  it('measures baseline performance for getDiverseRecommendations (100 resources)', () => {
    const engine = useRecommendationEngine(smallDataset)
    const targetResource = smallDataset[0]

    const iterations = 100
    const startTime = performance.now()

    for (let i = 0; i < iterations; i++) {
      engine.getDiverseRecommendations(targetResource, targetResource.category)
    }

    const endTime = performance.now()
    const avgTime = (endTime - startTime) / iterations

    console.log(`  Baseline (100 resources): ${avgTime.toFixed(4)}ms per call`)
    expect(avgTime).toBeGreaterThan(0)
  })

  it('measures baseline performance for getDiverseRecommendations (500 resources)', () => {
    const engine = useRecommendationEngine(mediumDataset)
    const targetResource = mediumDataset[0]

    const iterations = 100
    const startTime = performance.now()

    for (let i = 0; i < iterations; i++) {
      engine.getDiverseRecommendations(targetResource, targetResource.category)
    }

    const endTime = performance.now()
    const avgTime = (endTime - startTime) / iterations

    console.log(`  Baseline (500 resources): ${avgTime.toFixed(4)}ms per call`)
    expect(avgTime).toBeGreaterThan(0)
  })

  it('measures baseline performance for getDiverseRecommendations (1000 resources)', () => {
    const engine = useRecommendationEngine(largeDataset)
    const targetResource = largeDataset[0]

    const iterations = 100
    const startTime = performance.now()

    for (let i = 0; i < iterations; i++) {
      engine.getDiverseRecommendations(targetResource, targetResource.category)
    }

    const endTime = performance.now()
    const avgTime = (endTime - startTime) / iterations

    console.log(`  Baseline (1000 resources): ${avgTime.toFixed(4)}ms per call`)
    expect(avgTime).toBeGreaterThan(0)
  })

  it('measures baseline performance for individual strategies (1000 resources)', () => {
    const engine = useRecommendationEngine(largeDataset)
    const targetResource = largeDataset[0]

    const iterations = 100

    const contentStartTime = performance.now()
    for (let i = 0; i < iterations; i++) {
      engine.getContentBasedRecommendations(targetResource)
    }
    const contentEndTime = performance.now()

    const trendingStartTime = performance.now()
    for (let i = 0; i < iterations; i++) {
      engine.getTrendingRecommendations()
    }
    const trendingEndTime = performance.now()

    const popularStartTime = performance.now()
    for (let i = 0; i < iterations; i++) {
      engine.getPopularRecommendations()
    }
    const popularEndTime = performance.now()

    const categoryStartTime = performance.now()
    for (let i = 0; i < iterations; i++) {
      engine.getCategoryBasedRecommendations(targetResource.category)
    }
    const categoryEndTime = performance.now()

    const contentAvg = (contentEndTime - contentStartTime) / iterations
    const trendingAvg = (trendingEndTime - trendingStartTime) / iterations
    const popularAvg = (popularEndTime - popularStartTime) / iterations
    const categoryAvg = (categoryEndTime - categoryStartTime) / iterations

    console.log(`  Content-based: ${contentAvg.toFixed(4)}ms per call`)
    console.log(`  Trending: ${trendingAvg.toFixed(4)}ms per call`)
    console.log(`  Popular: ${popularAvg.toFixed(4)}ms per call`)
    console.log(`  Category-based: ${categoryAvg.toFixed(4)}ms per call`)

    expect(contentAvg).toBeGreaterThan(0)
    expect(trendingAvg).toBeGreaterThan(0)
    expect(popularAvg).toBeGreaterThan(0)
    expect(categoryAvg).toBeGreaterThan(0)
  })

  it('measures baseline performance scaling behavior', () => {
    const iterations = 50

    const smallEngine = useRecommendationEngine(smallDataset)
    const smallResource = smallDataset[0]
    const smallStartTime = performance.now()
    for (let i = 0; i < iterations; i++) {
      smallEngine.getDiverseRecommendations(
        smallResource,
        smallResource.category
      )
    }
    const smallAvg = (performance.now() - smallStartTime) / iterations

    const mediumEngine = useRecommendationEngine(mediumDataset)
    const mediumResource = mediumDataset[0]
    const mediumStartTime = performance.now()
    for (let i = 0; i < iterations; i++) {
      mediumEngine.getDiverseRecommendations(
        mediumResource,
        mediumResource.category
      )
    }
    const mediumAvg = (performance.now() - mediumStartTime) / iterations

    const largeEngine = useRecommendationEngine(largeDataset)
    const largeResource = largeDataset[0]
    const largeStartTime = performance.now()
    for (let i = 0; i < iterations; i++) {
      largeEngine.getDiverseRecommendations(
        largeResource,
        largeResource.category
      )
    }
    const largeAvg = (performance.now() - largeStartTime) / iterations

    console.log('Dataset Size | Avg Time (ms) | Time Ratio')
    console.log('------------|---------------|-----------')
    console.log(`100         | ${smallAvg.toFixed(4)}    | 1.00x`)
    console.log(
      `500         | ${mediumAvg.toFixed(4)}    | ${(mediumAvg / smallAvg).toFixed(2)}x`
    )
    console.log(
      `1000        | ${largeAvg.toFixed(4)}    | ${(largeAvg / smallAvg).toFixed(2)}x`
    )

    expect(largeAvg).toBeGreaterThan(smallAvg)
  })

  it('measures baseline recommendation recall performance', () => {
    const engine = useRecommendationEngine(largeDataset)
    const targetResource = largeDataset[0]

    const iterations = 100

    const recallStartTime = performance.now()
    for (let i = 0; i < iterations; i++) {
      engine.getDiverseRecommendations(targetResource, targetResource.category)
      engine.getDiverseRecommendations(targetResource, targetResource.category)
      engine.getDiverseRecommendations(targetResource, targetResource.category)
    }
    const recallAvg = (performance.now() - recallStartTime) / (iterations * 3)

    console.log(
      `  Recall (same params 3x in row): ${recallAvg.toFixed(4)}ms per call`
    )
    console.log(`  Expected improvement with caching: >90% reduction`)

    expect(recallAvg).toBeGreaterThan(0)
  })
})
