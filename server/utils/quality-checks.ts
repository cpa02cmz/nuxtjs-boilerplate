import type { Resource } from '~/types/resource'
import { VALID_CATEGORIES } from './constants'
import { validationConfig } from '~/configs/validation.config'
import { limitsConfig } from '~/configs/limits.config'

interface QualityCheckResult {
  id: string
  title: string
  description: string
  status: 'pass' | 'fail' | 'warn' | 'pending'
  details?: string
}

/**
 * Performs automated quality checks on a resource submission
 * Flexy hates hardcoded values - all from validationConfig!
 */
export function runQualityChecks(resource: Resource): QualityCheckResult[] {
  const checks: QualityCheckResult[] = []

  // URL validation check
  try {
    new URL(resource.url)
    checks.push({
      id: 'url-validation',
      title: 'URL Validation',
      description: 'Checks if the URL is valid and accessible',
      status: 'pass',
    })
  } catch {
    checks.push({
      id: 'url-validation',
      title: 'URL Validation',
      description: 'Checks if the URL is valid and accessible',
      status: 'fail',
      details: `URL "${resource.url}" is not valid`,
    })
  }

  // Required fields check
  const requiredFields = [
    { field: 'title', value: resource.title },
    { field: 'description', value: resource.description },
    { field: 'url', value: resource.url },
    { field: 'category', value: resource.category },
  ]

  for (const field of requiredFields) {
    if (!field.value || field.value.toString().trim().length === 0) {
      checks.push({
        id: `required-${field.field}`,
        title: `${field.field.charAt(0).toUpperCase() + field.field.slice(1)} Field`,
        description: `Checks if the ${field.field} field is provided`,
        status: 'fail',
        details: `${field.field} is required but missing`,
      })
    } else {
      checks.push({
        id: `required-${field.field}`,
        title: `${field.field.charAt(0).toUpperCase() + field.field.slice(1)} Field`,
        description: `Checks if the ${field.field} field is provided`,
        status: 'pass',
      })
    }
  }

  // Description length check - uses config instead of hardcoded value
  const descriptionMinLength = validationConfig.quality.descriptionMinLength
  if (
    resource.description &&
    resource.description.length < descriptionMinLength
  ) {
    checks.push({
      id: 'description-length',
      title: 'Description Length',
      description: 'Checks if the description is detailed enough',
      status: 'warn',
      details: `Description "${resource.description.substring(0, limitsConfig.displayLength.descriptionPreview)}..." is quite short (minimum ${descriptionMinLength} characters)`,
    })
  } else {
    checks.push({
      id: 'description-length',
      title: 'Description Length',
      description: 'Checks if the description is detailed enough',
      status: 'pass',
    })
  }

  // Spam keyword check - uses config instead of hardcoded array
  const spamKeywords = validationConfig.quality.spamKeywords
  const descriptionLower = resource.description.toLowerCase()
  const hasSpam = spamKeywords.some(keyword =>
    descriptionLower.includes(keyword.toLowerCase())
  )

  if (hasSpam) {
    checks.push({
      id: 'spam-check',
      title: 'Spam Detection',
      description: 'Checks for spam keywords in the content',
      status: 'fail',
      details: 'Spam keywords detected in description',
    })
  } else {
    checks.push({
      id: 'spam-check',
      title: 'Spam Detection',
      description: 'Checks for spam keywords in the content',
      status: 'pass',
    })
  }

  // Category validation check
  const isValidCategory = VALID_CATEGORIES.includes(resource.category as never)

  if (!isValidCategory) {
    checks.push({
      id: 'category-validation',
      title: 'Category Validation',
      description: 'Checks if the category is in the approved list',
      status: 'warn',
      details: `Category "${resource.category}" is not in the standard list`,
    })
  } else {
    checks.push({
      id: 'category-validation',
      title: 'Category Validation',
      description: 'Checks if the category is in the approved list',
      status: 'pass',
    })
  }

  // Tags validation check
  if (!resource.tags || resource.tags.length === 0) {
    checks.push({
      id: 'tags-validation',
      title: 'Tags Validation',
      description: 'Checks if resource has relevant tags',
      status: 'warn',
      details: 'Resource has no tags which may affect discoverability',
    })
  } else {
    checks.push({
      id: 'tags-validation',
      title: 'Tags Validation',
      description: 'Checks if resource has relevant tags',
      status: 'pass',
    })
  }

  return checks
}

/**
 * Calculates an overall quality score based on the quality checks
 * Flexy hates hardcoded penalties - all from validationConfig!
 */
export function calculateQualityScore(checks: QualityCheckResult[]): number {
  // Flexy hates hardcoded initial scores! Using config instead
  let score = validationConfig.quality.initialScore
  const penalties = validationConfig.quality.penalties

  for (const check of checks) {
    switch (check.status) {
      case 'fail':
        score -= penalties.fail
        break
      case 'warn':
        score -= penalties.warn
        break
      case 'pending':
        score -= penalties.pending
        break
      // 'pass' doesn't affect the score negatively
    }
  }

  // Ensure score is between min and max from config - Flexy hates hardcoded ranges!
  return Math.max(
    validationConfig.quality.minScore,
    Math.min(validationConfig.quality.maxScore, score)
  )
}
