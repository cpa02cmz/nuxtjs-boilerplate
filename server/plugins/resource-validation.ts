/**
 * Resource Validation Plugin
 * Initializes and manages scheduled validation of resource URLs
 */

import { defineNitroPlugin } from 'nitropack/runtime'
import { updateAllResourceHealth } from '../utils/resourceHealth'
import logger from '~/utils/logger'
import { timeConfig } from '~/configs/time.config'
import { contentConfig } from '~/configs/content.config'

// Extended NitroApp interface for resource validation
interface ExtendedNitroApp {
  _resourceValidationInterval?: NodeJS.Timeout
}

export default defineNitroPlugin(async nitroApp => {
  // Skip resource validation during Vercel build to prevent long build times
  if (process.env.VERCEL === '1') {
    return // Skip plugin initialization on Vercel
  }

  // Only log in development or test environments to prevent information disclosure in production
  if (process.env.NODE_ENV !== 'production') {
    logger.info('Initializing resource validation system...')
  }

  // Function to validate all resources
  const validateAllResources = async () => {
    try {
      // Import resources from JSON
      const resourcesModule = await import(contentConfig.paths.resourcesData)
      const resources = resourcesModule.default || resourcesModule

      if (Array.isArray(resources) && resources.length > 0) {
        if (process.env.NODE_ENV !== 'production') {
          logger.info(`Validating ${resources.length} resources...`)
        }
        await updateAllResourceHealth(resources)
        if (process.env.NODE_ENV !== 'production') {
          logger.info('Resource validation completed.')
        }
      } else {
        if (process.env.NODE_ENV !== 'production') {
          logger.warn('No resources found to validate.')
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
  const validationInterval = setInterval(async () => {
    try {
      if (process.env.NODE_ENV !== 'production') {
        logger.info('Starting scheduled resource validation...')
      }
      await validateAllResources()
    } catch (error) {
      logger.error('Scheduled resource validation failed:', error)
    }
  }, timeConfig.validation.resourceIntervalMs)

  // Also run validation on server start after a short delay
  setTimeout(async () => {
    try {
      await validateAllResources()
    } catch (error) {
      logger.error('Initial resource validation failed:', error)
    }
  }, timeConfig.validation.startupDelayMs)

  // Store the validation interval in nitroApp for potential cleanup
  const extendedApp = nitroApp as ExtendedNitroApp
  extendedApp._resourceValidationInterval = validationInterval

  // Add cleanup handler to clear interval on shutdown
  process.on('SIGTERM', () => {
    if (process.env.NODE_ENV !== 'production') {
      logger.info('Shutting down resource validation...')
    }
    if (extendedApp._resourceValidationInterval) {
      clearInterval(extendedApp._resourceValidationInterval)
    }
  })

  process.on('SIGINT', () => {
    if (process.env.NODE_ENV !== 'production') {
      logger.info('Shutting down resource validation...')
    }
    if (extendedApp._resourceValidationInterval) {
      clearInterval(extendedApp._resourceValidationInterval)
    }
  })
})
