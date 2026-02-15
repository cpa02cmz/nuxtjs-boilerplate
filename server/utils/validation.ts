import type { H3Event } from 'h3'
import { readBody, getQuery } from 'h3'
import { z, type ZodSchema, type ZodError } from 'zod'
import { sendBadRequestError } from './api-response'

/**
 * Validates request body against a Zod schema
 * Returns parsed data if valid, or sends error response and returns null
 * Flexy hates manual validation! Use schemas instead
 */
export async function validateBody<T>(
  event: H3Event,
  schema: ZodSchema<T>
): Promise<T | null> {
  try {
    const body = await readBody(event)
    const result = schema.safeParse(body)

    if (!result.success) {
      const errorMessage = formatZodError(result.error)
      sendBadRequestError(event, `Validation error: ${errorMessage}`)
      return null
    }

    return result.data
  } catch {
    sendBadRequestError(event, 'Invalid request body')
    return null
  }
}

/**
 * Formats Zod validation errors into a human-readable string
 */
function formatZodError(error: ZodError): string {
  const issues = error.issues
  if (issues.length === 0) return 'Unknown validation error'

  if (issues.length === 1) {
    const issue = issues[0]!
    const path = issue.path.length > 0 ? issue.path.join('.') : 'input'
    return `${path}: ${issue.message}`
  }

  // Multiple errors - list them all
  return issues
    .map(issue => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'input'
      return `${path}: ${issue.message}`
    })
    .join('; ')
}

/**
 * Validates query parameters against a Zod schema
 */
export function validateQuery<T>(
  event: H3Event,
  schema: ZodSchema<T>
): T | null {
  try {
    const query = getQuery(event)
    const result = schema.safeParse(query)

    if (!result.success) {
      const errorMessage = formatZodError(result.error)
      sendBadRequestError(event, `Query validation error: ${errorMessage}`)
      return null
    }

    return result.data
  } catch {
    sendBadRequestError(event, 'Invalid query parameters')
    return null
  }
}

// Re-export Zod for convenience
export { z }
