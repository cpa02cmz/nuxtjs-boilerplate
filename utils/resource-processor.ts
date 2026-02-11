/**
 * Resource Processor
 *
 * Unified utility for processing resources with both filtering and facet counting
 * in a single pass for optimal performance.
 *
 * Architecture Principles:
 * - Single Pass: Filter and count facets simultaneously (O(n) instead of O(2n))
 * - Pure Functions: No side effects, same input always produces same output
 * - Performance: Eliminates duplicate resource iteration
 */

import type { Resource, FilterOptions } from '~/types/resource'

export interface FacetCounts {
  categories: Record<string, number>
  pricingModels: Record<string, number>
  difficultyLevels: Record<string, number>
  technologies: Record<string, number>
  tags: Record<string, number>
  benefits: Record<string, number>
}

export interface ProcessResourcesResult {
  filtered: Resource[]
  facets: FacetCounts
  totalCount: number
  filteredCount: number
}

/**
 * Check if a filter array has active values
 */
const hasActiveFilter = (
  filters: string[] | readonly string[] | undefined
): boolean => Boolean(filters && filters.length > 0)

/**
 * Match resource by category
 */
const matchesCategory = (
  resource: Resource,
  categories: string[] | readonly string[] | undefined
): boolean =>
  !hasActiveFilter(categories) ||
  (categories?.includes(resource.category) ?? false)

/**
 * Match resource by pricing model
 */
const matchesPricingModel = (
  resource: Resource,
  pricingModels: string[] | readonly string[] | undefined
): boolean =>
  !hasActiveFilter(pricingModels as string[] | undefined) ||
  (pricingModels?.includes(resource.pricingModel) ?? false)

/**
 * Match resource by difficulty level
 */
const matchesDifficultyLevel = (
  resource: Resource,
  difficultyLevels: string[] | readonly string[] | undefined
): boolean =>
  !hasActiveFilter(difficultyLevels as string[] | undefined) ||
  (difficultyLevels?.includes(resource.difficulty) ?? false)

/**
 * Match resource by technology
 */
const matchesTechnology = (
  resource: Resource,
  technologies: string[] | readonly string[] | undefined
): boolean =>
  !hasActiveFilter(technologies as string[] | undefined) ||
  resource.technology.some(tech => technologies?.includes(tech) ?? false)

/**
 * Match resource by tag
 */
const matchesTag = (
  resource: Resource,
  tags: string[] | readonly string[] | undefined
): boolean =>
  !hasActiveFilter(tags) ||
  resource.tags.some(tag => tags?.includes(tag) ?? false)

/**
 * Match resource by benefit
 */
const matchesBenefit = (
  resource: Resource,
  benefits: string[] | readonly string[] | undefined
): boolean =>
  !hasActiveFilter(benefits) ||
  (resource.benefits || []).some(
    benefit => benefits?.includes(benefit) ?? false
  )

/**
 * Increment count in facet record
 */
const incrementFacetCount = (
  facets: Record<string, number>,
  key: string
): void => {
  facets[key] = (facets[key] || 0) + 1
}

/**
 * Count all facets for a resource
 */
const countResourceFacets = (resource: Resource, facets: FacetCounts): void => {
  // Count category
  incrementFacetCount(facets.categories, resource.category)

  // Count pricing model
  incrementFacetCount(facets.pricingModels, resource.pricingModel)

  // Count difficulty level
  incrementFacetCount(facets.difficultyLevels, resource.difficulty)

  // Count technologies
  resource.technology.forEach(tech => {
    incrementFacetCount(facets.technologies, tech)
  })

  // Count tags
  resource.tags.forEach(tag => {
    incrementFacetCount(facets.tags, tag)
  })

  // Count benefits
  if (resource.benefits) {
    resource.benefits.forEach(benefit => {
      incrementFacetCount(facets.benefits, benefit)
    })
  }
}

/**
 * Check if resource matches all filter criteria
 */
const matchesAllCriteria = (
  resource: Resource,
  filterOptions: FilterOptions & {
    benefits?: string[] | readonly string[]
  }
): boolean => {
  const {
    categories,
    pricingModels,
    difficultyLevels,
    technologies,
    tags,
    benefits,
  } = filterOptions

  return (
    matchesCategory(resource, categories) &&
    matchesPricingModel(resource, pricingModels) &&
    matchesDifficultyLevel(resource, difficultyLevels) &&
    matchesTechnology(resource, technologies) &&
    matchesTag(resource, tags) &&
    matchesBenefit(resource, benefits)
  )
}

/**
 * Process resources with single-pass filtering and facet counting
 *
 * @param resources - Array of resources to process
 * @param filterOptions - Filter criteria
 * @returns Object containing filtered resources and facet counts
 *
 * @example
 * ```typescript
 * const { filtered, facets, totalCount, filteredCount } = processResources(
 *   resources,
 *   { categories: ['ai'], pricingModels: ['free'] }
 * )
 * ```
 */
export const processResources = (
  resources: readonly Resource[],
  filterOptions: FilterOptions & {
    benefits?: string[] | readonly string[]
  } = {}
): ProcessResourcesResult => {
  const filtered: Resource[] = []
  const facets: FacetCounts = {
    categories: {},
    pricingModels: {},
    difficultyLevels: {},
    technologies: {},
    tags: {},
    benefits: {},
  }

  // Single pass: filter and count facets simultaneously
  for (const resource of resources) {
    // Always count facets for all resources (to show available options)
    countResourceFacets(resource, facets)

    // Add to filtered list if matches criteria
    if (matchesAllCriteria(resource, filterOptions)) {
      filtered.push(resource)
    }
  }

  return {
    filtered,
    facets,
    totalCount: resources.length,
    filteredCount: filtered.length,
  }
}

/**
 * Process resources with search query filtering
 *
 * @param resources - Array of resources to process
 * @param filterOptions - Filter criteria
 * @param searchQuery - Search query string
 * @param searchFields - Fields to search in (default: ['title', 'description', 'tags'])
 * @returns Object containing filtered resources and facet counts
 */
export const processResourcesWithSearch = (
  resources: readonly Resource[],
  filterOptions: FilterOptions & {
    benefits?: string[] | readonly string[]
  } = {},
  searchQuery?: string,
  searchFields: ('title' | 'description' | 'tags' | 'category')[] = [
    'title',
    'description',
    'tags',
  ]
): ProcessResourcesResult => {
  const normalizedQuery = searchQuery?.toLowerCase().trim()

  const filtered: Resource[] = []
  const facets: FacetCounts = {
    categories: {},
    pricingModels: {},
    difficultyLevels: {},
    technologies: {},
    tags: {},
    benefits: {},
  }

  // Single pass: filter and count facets simultaneously
  for (const resource of resources) {
    // Always count facets for all resources
    countResourceFacets(resource, facets)

    // Check if matches filter criteria
    const matchesFilters = matchesAllCriteria(resource, filterOptions)

    // Check if matches search query
    let matchesSearch = true
    if (normalizedQuery) {
      matchesSearch = searchFields.some(field => {
        const value = resource[field]
        if (field === 'tags' && Array.isArray(value)) {
          return value.some((item: string) =>
            item.toLowerCase().includes(normalizedQuery)
          )
        }
        if (typeof value === 'string') {
          return value.toLowerCase().includes(normalizedQuery)
        }
        return false
      })
    }

    // Add to filtered list if matches both filter and search
    if (matchesFilters && matchesSearch) {
      filtered.push(resource)
    }
  }

  return {
    filtered,
    facets,
    totalCount: resources.length,
    filteredCount: filtered.length,
  }
}

/**
 * Re-export filter utility functions for backward compatibility
 */
export {
  hasActiveFilter,
  matchesCategory,
  matchesPricingModel,
  matchesDifficultyLevel,
  matchesTechnology,
  matchesTag,
  matchesBenefit,
  matchesAllCriteria as filterByAllCriteria,
}
