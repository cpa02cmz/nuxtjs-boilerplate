import type { ZodError, ZodType } from 'zod'
import type { H3Event } from 'h3'
import { readBody, getQuery } from 'h3'
import { sendBadRequestError } from './api-response'
import { contentConfig } from '../../configs/content.config'

export function validateRequest<T>(
  schema: ZodType<T>,
  data: unknown,
  event?: H3Event
): T {
  const result = schema.safeParse(data)

  if (!result.success) {
    if (event) {
      const errors = (result.error as ZodError).issues.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }))

      sendBadRequestError(event, contentConfig.errors.validation.failed, {
        errors,
      })
    }

    throw new Error(contentConfig.errors.validation.failed)
  }

  return result.data
}

export async function validateRequestBody<T>(
  schema: ZodType<T>,
  event: H3Event
): Promise<T> {
  try {
    const body = await readBody(event)
    return validateRequest(schema, body, event)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === contentConfig.errors.validation.failed
    ) {
      throw error
    }
    throw new Error(contentConfig.errors.validation.readBody)
  }
}

export function validateQueryParams<T>(schema: ZodType<T>, event: H3Event): T {
  const query = getQuery(event)
  return validateRequest(schema, query, event)
}

/**
 * Safely parses an integer from a string with fallback value.
 * Returns fallback if the string cannot be parsed as a valid integer.
 *
 * @param value - The string to parse
 * @param fallback - The default value if parsing fails
 * @param options - Optional constraints (min, max)
 * @returns Parsed integer or fallback value
 */
export function safeParseInt(
  value: string | undefined | null,
  fallback: number,
  options?: { min?: number; max?: number }
): number {
  if (value === undefined || value === null || value === '') {
    return fallback
  }

  const parsed = parseInt(value, 10)

  if (Number.isNaN(parsed)) {
    return fallback
  }

  if (options?.min !== undefined && parsed < options.min) {
    return options.min
  }

  if (options?.max !== undefined && parsed > options.max) {
    return options.max
  }

  return parsed
}
