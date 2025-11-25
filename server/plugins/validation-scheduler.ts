import { defineNitroPlugin } from 'nitropack/runtime'
import { Resource } from '~/types/resource'
import { validateUrlsConcurrently } from '../utils/urlValidator'
import { logError, logInfo } from '~/utils/errorLogger'

// In-memory storage for resource health status
// In production, you might want to use a database for persistence
const resourceHealthStatus: Map<string, any> = new Map()

// Configuration for validation schedule
const VALIDATION_INTERVAL = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
const CONCURRENCY_LIMIT = 5 // Number of concurrent validations

export default defineNitroPlugin(nitroApp => {
  // Initialize validation on startup
  initializeValidation()

  // Set up periodic validation
  const intervalId = setInterval(async () => {
    await validateAllResources()
  }, VALIDATION_INTERVAL)

  // Clean up on shutdown
  process.on('SIGINT', () => {
    clearInterval(intervalId)
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    clearInterval(intervalId)
    process.exit(0)
  })
})

/**
 * Initialize validation on startup
 */
async function initializeValidation() {
  try {
    logInfo(
      'Initializing resource validation...',
      undefined,
      'validation-scheduler'
    )
    await validateAllResources()
  } catch (error: any) {
    logError(
      'Failed to initialize validation',
      error as Error,
      'validation-scheduler',
      {
        errorType: error?.constructor?.name,
        errorMessage: error?.message,
      }
    )
  }
}

/**
 * Validate all resources in the database
 */
async function validateAllResources() {
  try {
    // Import resources from JSON
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Extract URLs to validate
    const urls = resources.map(resource => ({
      id: resource.id,
      url: resource.url,
    }))

    logInfo(
      `Validating ${urls.length} resource URLs...`,
      undefined,
      'validation-scheduler',
      {
        urlCount: urls.length,
      }
    )

    // Validate all URLs concurrently
    const results = await validateUrlsConcurrently(
      urls.map(u => u.url),
      CONCURRENCY_LIMIT
    )

    // Update health status for each resource
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const resource = resources.find(r => r.url === result.url)

      if (resource) {
        // Store health status in memory
        resourceHealthStatus.set(resource.id, result.health)
      }
    }

    logInfo(
      `Completed validation for ${results.length} resources`,
      undefined,
      'validation-scheduler',
      {
        validatedCount: results.length,
      }
    )
  } catch (error: any) {
    logError(
      'Resource validation failed',
      error as Error,
      'validation-scheduler',
      {
        errorType: error?.constructor?.name,
        errorMessage: error?.message,
      }
    )
  }
}

/**
 * Get health status for a specific resource
 */
export function getResourceHealthStatus(resourceId: string) {
  return resourceHealthStatus.get(resourceId)
}

/**
 * Update health status for a specific resource
 */
export function updateResourceHealthStatus(resourceId: string, health: any) {
  resourceHealthStatus.set(resourceId, health)
}
