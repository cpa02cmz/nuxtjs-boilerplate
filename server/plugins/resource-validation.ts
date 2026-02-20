/**
 * Resource Validation Plugin
 * Initializes and manages scheduled validation of resource URLs
 */

import { defineNitroPlugin } from 'nitropack/runtime'
import { updateAllResourceHealth } from '../utils/resourceHealth'
import logger from '~/utils/logger'

export default defineNitroPlugin(async nitroApp => {
  // Skip resource validation during build to prevent long build times
  // This includes Vercel builds, local builds, and CI/CD pipelines
  const isBuildTime =
    process.env.VERCEL === '1' ||
    process.env.CI === 'true' ||
    process.env.NODE_ENV === 'production' ||
    process.env.NITRO_PRESET === 'vercel' ||
    process.env.BUILD_TIME === 'true'

  if (isBuildTime) {
    return // Skip plugin initialization during build
  }

  // Only log in development or test environments to prevent information disclosure in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('Initializing resource validation system...')
  }

  // Function to validate all resources
  const validateAllResources = async () => {
    try {
      // Import resources from JSON
      const resourcesModule = await import('~/data/resources.json')
      const resources = resourcesModule.default || resourcesModule

      if (Array.isArray(resources) && resources.length > 0) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`Validating ${resources.length} resources...`)
        }
        await updateAllResourceHealth(resources)
        if (process.env.NODE_ENV !== 'production') {
          console.log('Resource validation completed.')
        }
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('No resources found to validate.')
        }
      }
    } catch (error) {
      // Log errors using structured logging
      logger.error('Error during resource validation:', error)
    }
  }

  // Run initial validation when the plugin initializes
  await validateAllResources()

  // Set up periodic validation (every hour)
  const validationInterval = setInterval(
    async () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Starting scheduled resource validation...')
      }
      await validateAllResources()
    },
    60 * 60 * 1000
  ) // 1 hour in milliseconds

  // Also run validation on server start after a short delay
  setTimeout(async () => {
    await validateAllResources()
  }, 5000) // 5 seconds delay to allow server to fully start

  // Store the validation interval in nitroApp for potential cleanup
  ;(
    nitroApp as { _resourceValidationInterval?: NodeJS.Timeout }
  )._resourceValidationInterval = validationInterval

  // Add cleanup handler to clear interval on shutdown
  process.on('SIGTERM', () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Shutting down resource validation...')
    }
    const app = nitroApp as { _resourceValidationInterval?: NodeJS.Timeout }
    if (app._resourceValidationInterval) {
      clearInterval(app._resourceValidationInterval)
    }
  })

  process.on('SIGINT', () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Shutting down resource validation...')
    }
    const app = nitroApp as { _resourceValidationInterval?: NodeJS.Timeout }
    if (app._resourceValidationInterval) {
      clearInterval(app._resourceValidationInterval)
    }
  })
})
