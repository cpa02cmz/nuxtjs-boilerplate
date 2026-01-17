import type { Resource } from '~/types/resource'

type FacetCounts = Record<string, number>

const incrementCount = (counts: FacetCounts, key: string): void => {
  counts[key] = (counts[key] || 0) + 1
}

const countProperty = (
  resources: readonly Resource[],
  propertyKey: keyof Resource,
  isArray: boolean
): FacetCounts => {
  const counts: FacetCounts = {}

  resources.forEach(resource => {
    const value = resource[propertyKey]

    if (!value) return

    if (isArray && Array.isArray(value)) {
      value.forEach((item: string) => incrementCount(counts, item))
    } else if (!isArray && typeof value === 'string') {
      incrementCount(counts, value)
    }
  })

  return counts
}

const countCategory = (resources: readonly Resource[]): FacetCounts => {
  return countProperty(resources, 'category', false)
}

const countPricingModel = (resources: readonly Resource[]): FacetCounts => {
  return countProperty(resources, 'pricingModel', false)
}

const countDifficulty = (resources: readonly Resource[]): FacetCounts => {
  return countProperty(resources, 'difficulty', false)
}

const countTechnology = (resources: readonly Resource[]): FacetCounts => {
  return countProperty(resources, 'technology', true)
}

const countTags = (resources: readonly Resource[]): FacetCounts => {
  return countProperty(resources, 'tags', true)
}

const countBenefits = (resources: readonly Resource[]): FacetCounts => {
  return countProperty(resources, 'benefits', true)
}

const calculateAllFacetCounts = (
  resources: readonly Resource[]
): {
  category: FacetCounts
  pricingModel: FacetCounts
  difficulty: FacetCounts
  technology: FacetCounts
  tags: FacetCounts
  benefits: FacetCounts
} => {
  return {
    category: countCategory(resources),
    pricingModel: countPricingModel(resources),
    difficulty: countDifficulty(resources),
    technology: countTechnology(resources),
    tags: countTags(resources),
    benefits: countBenefits(resources),
  }
}

export const useFacetUtils = () => ({
  countCategory,
  countPricingModel,
  countDifficulty,
  countTechnology,
  countTags,
  countBenefits,
  calculateAllFacetCounts,
})
