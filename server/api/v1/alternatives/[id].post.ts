import { logError } from '~/utils/errorLogger'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { executeTransaction } from '~/server/utils/db'
import { databaseConfig } from '~/configs/database.config'
import {
  sendBadRequestError,
  sendNotFoundError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { defineEventHandler, getRouterParam, readBody } from 'h3'

export default defineEventHandler(async event => {
  try {
    // Apply rate limiting
    await rateLimit(event)

    const resourceId = getRouterParam(event, 'id')

    if (!resourceId) {
      return sendBadRequestError(event, 'Resource ID is required')
    }

    // Parse request body
    const body = await readBody(event)
    const { alternativeId, action = 'add' } = body

    if (!alternativeId) {
      return sendBadRequestError(event, 'Alternative resource ID is required')
    }

    // Execute all database operations within a transaction to prevent race conditions
    const result = await executeTransaction(
      async tx => {
        // Validate both resources exist in database (with implicit lock in transaction)
        const resource = await tx.resource.findUnique({
          where: { id: resourceId },
        })
        const alternativeResource = await tx.resource.findUnique({
          where: { id: alternativeId },
        })

        if (!resource || !alternativeResource) {
          throw new Error('Resource or alternative resource not found')
        }

        // Parse existing alternatives
        let currentAlternatives: string[] = resource.alternatives
          ? JSON.parse(resource.alternatives)
          : []

        if (action === 'add') {
          // Add alternative relationship (both ways)
          if (!currentAlternatives.includes(alternativeId)) {
            currentAlternatives.push(alternativeId)

            // Update resource with new alternatives
            await tx.resource.update({
              where: { id: resourceId },
              data: {
                alternatives: JSON.stringify(currentAlternatives),
              },
            })

            // Also add reverse relationship
            const reverseAlternatives: string[] =
              alternativeResource.alternatives
                ? JSON.parse(alternativeResource.alternatives)
                : []
            if (!reverseAlternatives.includes(resourceId)) {
              reverseAlternatives.push(resourceId)
              await tx.resource.update({
                where: { id: alternativeId },
                data: {
                  alternatives: JSON.stringify(reverseAlternatives),
                },
              })
            }
          }
        } else if (action === 'remove') {
          // Remove alternative relationship (both ways)
          currentAlternatives = currentAlternatives.filter(
            id => id !== alternativeId
          )

          // Update resource
          await tx.resource.update({
            where: { id: resourceId },
            data: {
              alternatives: JSON.stringify(currentAlternatives),
            },
          })

          // Also remove reverse relationship
          let reverseAlternatives: string[] = alternativeResource.alternatives
            ? JSON.parse(alternativeResource.alternatives)
            : []
          reverseAlternatives = reverseAlternatives.filter(
            id => id !== resourceId
          )
          await tx.resource.update({
            where: { id: alternativeId },
            data: {
              alternatives: JSON.stringify(reverseAlternatives),
            },
          })
        } else {
          throw new Error('Invalid action. Use "add" or "remove".')
        }

        return {
          resourceId,
          alternativeId,
          action,
          alternatives: currentAlternatives,
        }
      },
      {
        timeout: databaseConfig.transaction.timeoutMs,
        maxRetries: databaseConfig.transaction.maxRetries,
        isolationLevel: 'Serializable', // Prevent phantom reads and lost updates
      },
      'manageAlternatives'
    )

    return sendSuccessResponse(event, result)
  } catch (error) {
    // Handle specific error types from transaction
    if (error instanceof Error) {
      if (error.message === 'Resource or alternative resource not found') {
        return sendNotFoundError(event, 'Resource or alternative resource')
      }
      if (error.message === 'Invalid action. Use "add" or "remove".') {
        return sendBadRequestError(
          event,
          'Invalid action. Use "add" or "remove".'
        )
      }
    }

    // Log error using our error logging service
    logError(
      `Error managing alternative relationship for resource ${getRouterParam(event, 'id')}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-alternatives-post',
      {
        resourceId: getRouterParam(event, 'id'),
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      }
    )

    return handleApiRouteError(event, error)
  }
})
