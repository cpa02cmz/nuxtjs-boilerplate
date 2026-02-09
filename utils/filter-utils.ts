/**
 * Filter Utilities
 *
 * Pure utility functions for filtering and manipulating resource data.
 * These functions do not use Vue reactivity - they are pure functions.
 *
 * Architecture Principles:
 * - Pure Functions: No side effects, same input always produces same output
 * - Single Responsibility: Each function has one clear purpose
 * - Reusability: Can be used across composables, components, and server code
 */

import type { Resource, FilterOptions } from '~/types/resource'
import { TIME_MS } from '~/configs/time.config'

/**
 * Check if a filter array has active values
 */
export const hasActiveFilter = (
  filters: string[] | readonly string[] | undefined
): boolean => Boolean(filters && filters.length > 0)

/**
 * Match resource by category
 */
export const matchesCategory = (
  resource: Resource,
  categories: string[] | readonly string[] | undefined
): boolean =>
  !hasActiveFilter(categories) ||
  (categories?.includes(resource.category) ?? false)

/**
 * Match resource by pricing model
 */
export const matchesPricingModel = (
  resource: Resource,
  pricingModels: string[] | readonly string[] | undefined
): boolean =>
  !hasActiveFilter(pricingModels as string[] | undefined) ||
  (pricingModels?.includes(resource.pricingModel) ?? false)

/**
 * Match resource by difficulty level
 */
export const matchesDifficultyLevel = (
  resource: Resource,
  difficultyLevels: string[] | readonly string[] | undefined
): boolean =>
  !hasActiveFilter(difficultyLevels as string[] | undefined) ||
  (difficultyLevels?.includes(resource.difficulty) ?? false)

/**
 * Match resource by technology
 */
export const matchesTechnology = (
  resource: Resource,
  technologies: string[] | readonly string[] | undefined
): boolean =>
  !hasActiveFilter(technologies as string[] | undefined) ||
  resource.technology.some(tech => technologies?.includes(tech) ?? false)

/**
 * Match resource by tag
 */
export const matchesTag = (
  resource: Resource,
  tags: string[] | readonly string[] | undefined
): boolean =>
  !hasActiveFilter(tags) ||
  resource.tags.some(tag => tags?.includes(tag) ?? false)

/**
 * Match resource by benefit
 */
export const matchesBenefit = (
  resource: Resource,
  benefits: string[] | readonly string[] | undefined
): boolean =>
  !hasActiveFilter(benefits) ||
  (resource.benefits || []).some(
    benefit => benefits?.includes(benefit) ?? false
  )

/**
 * Filter resources by all criteria (without date range or benefits)
 */
export const filterByAllCriteria = (
  resources: readonly Resource[],
  filterOptions: FilterOptions
): Resource[] => {
  const { categories, pricingModels, difficultyLevels, technologies, tags } =
    filterOptions

  return resources.filter(
    resource =>
      matchesCategory(resource, categories) &&
      matchesPricingModel(resource, pricingModels) &&
      matchesDifficultyLevel(resource, difficultyLevels) &&
      matchesTechnology(resource, technologies) &&
      matchesTag(resource, tags)
  )
}

/**
 * Parse date string to timestamp
 */
export const parseDate = (dateString: string): number => {
  if (!dateString) return 0
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? 0 : date.getTime()
}

/**
 * Match resource by date range
 */
export const matchesDateRange = (
  resource: Resource,
  dateRange: string | undefined
): boolean => {
  if (!dateRange || dateRange === 'anytime') return true

  const now = new Date()
  const resourceDate = new Date(resource.dateAdded || now)
  const timeDiff = now.getTime() - resourceDate.getTime()
  // Flexy hates hardcoded time calculations! Using TIME_MS constants
  const daysDiff = timeDiff / TIME_MS.DAY

  switch (dateRange) {
    case 'lastWeek':
      return daysDiff <= 7
    case 'lastMonth':
      return daysDiff <= 30
    case 'lastYear':
      return daysDiff <= 365
    default:
      return true
  }
}

/**
 * Filter resources by all criteria (including date range and benefits)
 */
export const filterByAllCriteriaWithDateRange = (
  resources: readonly Resource[],
  filterOptions: FilterOptions & {
    dateRange?: string
    benefits?: string[] | readonly string[]
  }
): Resource[] => {
  const {
    categories,
    pricingModels,
    difficultyLevels,
    technologies,
    tags,
    benefits,
    dateRange,
  } = filterOptions

  return resources.filter(
    resource =>
      matchesCategory(resource, categories) &&
      matchesPricingModel(resource, pricingModels) &&
      matchesDifficultyLevel(resource, difficultyLevels) &&
      matchesTechnology(resource, technologies) &&
      matchesTag(resource, tags) &&
      matchesBenefit(resource, benefits) &&
      matchesDateRange(resource, dateRange)
  )
}

/**
 * Toggle an item in an array (add if not present, remove if present)
 * Used for filter toggle functionality
 */
export const toggleArrayItem = (
  currentArray: string[],
  item: string
): string[] => {
  const newArray = [...currentArray]
  const index = newArray.indexOf(item)
  if (index > -1) {
    newArray.splice(index, 1)
  } else {
    newArray.push(item)
  }
  return newArray
}
