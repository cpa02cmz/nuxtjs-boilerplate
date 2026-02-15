import { getRouterParam, readBody } from 'h3'
import { randomUUID } from 'node:crypto'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { prisma } from '~/server/utils/db'
import {
  sendSuccessResponse,
  sendBadRequestError,
  sendNotFoundError,
  sendUnauthorizedError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { userConfig } from '~/configs/user.config'

interface StatusChangeRecord {
  id: string
  fromStatus: string
  toStatus: string
  reason: string
  changedBy: string
  changedAt: string
  notes: string
}

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)
    const resourceId = getRouterParam(event, 'id') ?? ''
    const { status, reason, notes } = await readBody(event)

    // Get resource from database
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    })

    if (!resource) {
      return sendNotFoundError(event, 'Resource', resourceId)
    }

    // Validate status value
    const validStatuses = [
      'active',
      'deprecated',
      'discontinued',
      'updated',
      'pending',
    ]
    if (!validStatuses.includes(status)) {
      return sendBadRequestError(
        event,
        `Invalid status value. Valid options: ${validStatuses.join(', ')}`
      )
    }

    // Authentication check - verify auth context is valid
    if (!event.context.auth?.userId) {
      return sendUnauthorizedError(event, 'Authentication required')
    }

    // Get current user or default to system user
    const userId = event.context.auth.userId ?? userConfig.defaults.systemId

    // Create status change record with cryptographically secure ID
    const statusChange: StatusChangeRecord = {
      id: randomUUID(),
      fromStatus: resource.status ?? 'active',
      toStatus: status,
      reason: reason ?? 'Status updated manually',
      changedBy: userId,
      changedAt: new Date().toISOString(),
      notes: notes ?? '',
    }

    // Parse existing history or create new array
    const existingHistory: StatusChangeRecord[] = resource.statusHistory
      ? JSON.parse(resource.statusHistory)
      : []
    existingHistory.push(statusChange)

    // Update resource in database with new status and history
    const updatedResource = await prisma.resource.update({
      where: { id: resourceId },
      data: {
        status,
        statusHistory: JSON.stringify(existingHistory),
      },
    })

    return sendSuccessResponse(event, {
      resource: {
        id: updatedResource.id,
        status: updatedResource.status,
        statusHistory: existingHistory,
      },
      statusChange,
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
