import type { Resource, QualityCheckResult } from '~/types/moderation'

/**
 * Simple URL validation function
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Performs automated quality checks on a resource submission
 */
export function performQualityCheck(
  resource: Partial<Resource>
): QualityCheckResult {
  const issues: string[] = []
  let score = 100 // Start with perfect score

  // Check for required fields
  if (!resource.title?.trim()) {
    issues.push('Title is missing')
    score -= 25
  } else if (resource.title.length < 3) {
    issues.push('Title is too short (minimum 3 characters)')
    score -= 10
  }

  if (!resource.description?.trim()) {
    issues.push('Description is missing')
    score -= 25
  } else if (resource.description.length < 10) {
    issues.push('Description is too short (minimum 10 characters)')
    score -= 10
  }

  if (!resource.url?.trim()) {
    issues.push('URL is missing')
    score -= 25
  } else if (!isValidUrl(resource.url)) {
    issues.push('URL is invalid')
    score -= 20
  }

  if (!resource.category?.trim()) {
    issues.push('Category is missing')
    score -= 15
  }

  // Check for spam indicators
  const spamKeywords = [
    'free money',
    'click here',
    'buy now',
    'limited time',
    'act fast',
  ]
  const textToCheck = `${resource.title} ${resource.description}`.toLowerCase()

  for (const keyword of spamKeywords) {
    if (textToCheck.includes(keyword)) {
      issues.push(`Potential spam detected: "${keyword}"`)
      score -= 15
    }
  }

  // Check for duplicate content (simplified check)
  // In a real implementation, this would check against existing resources
  if (resource.title && resource.title.length > 50) {
    issues.push('Title is too long (maximum 50 characters recommended)')
    score -= 5
  }

  if (resource.description && resource.description.length > 500) {
    issues.push('Description is too long (maximum 500 characters recommended)')
    score -= 5
  }

  // Normalize score to 0-100 range
  score = Math.max(0, Math.min(100, score))

  return {
    isValid: score > 30, // Consider valid if score is above 30%
    issues,
    score,
    recommendations: generateRecommendations(issues),
  }
}

/**
 * Generates recommendations based on identified issues
 */
function generateRecommendations(issues: string[]): string[] {
  const recommendations: string[] = []

  if (issues.some(issue => issue.includes('Title'))) {
    recommendations.push(
      'Make sure your title is descriptive but concise (under 50 characters)'
    )
  }

  if (issues.some(issue => issue.includes('Description'))) {
    recommendations.push(
      'Provide a detailed description that explains what the resource offers'
    )
  }

  if (issues.some(issue => issue.includes('URL'))) {
    recommendations.push(
      'Ensure the URL is valid and points to the correct resource'
    )
  }

  if (issues.some(issue => issue.includes('Category'))) {
    recommendations.push('Select an appropriate category for your resource')
  }

  if (issues.some(issue => issue.includes('spam'))) {
    recommendations.push('Avoid using marketing language or spam-like phrases')
  }

  return recommendations
}

/**
 * Checks if a resource submission is a duplicate of existing resources
 */
export function checkForDuplicates(
  resource: Partial<Resource>,
  existingResources: Resource[]
): boolean {
  if (!resource.title) return false

  // Simple duplicate check based on title similarity
  const titleLower = resource.title.toLowerCase().trim()

  return existingResources.some(existing => {
    const existingTitleLower = existing.title.toLowerCase().trim()
    // Check for exact match or very similar titles
    return (
      existingTitleLower === titleLower ||
      calculateSimilarity(existingTitleLower, titleLower) > 0.8
    )
  })
}

/**
 * Calculates string similarity using a simple algorithm
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1

  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1

  // Simple character-based similarity
  const distance = editDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

/**
 * Calculates edit distance between two strings
 */
function editDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1)
    .fill(0)
    .map(() => Array(str1.length + 1).fill(0))

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }

  return matrix[str2.length][str1.length]
}
