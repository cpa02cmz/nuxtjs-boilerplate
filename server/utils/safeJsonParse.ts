/**
 * Safe JSON parsing utility to prevent prototype pollution attacks
 * All JSON.parse operations should use these functions instead of native JSON.parse
 */

/**
 * Prototype pollution prevention - removes dangerous keys from parsed objects
 */
const dangerousKeys = ['__proto__', 'constructor', 'prototype']

function sanitizeObject<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject) as unknown as T
  }

  const sanitized: Record<string, unknown> = {}
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    if (dangerousKeys.includes(key)) {
      continue
    }
    sanitized[key] = sanitizeObject((obj as Record<string, unknown>)[key])
  }

  return sanitized as T
}

/**
 * Safely parse JSON string with prototype pollution protection
 * @param jsonString - The JSON string to parse
 * @param defaultValue - Default value to return if parsing fails
 * @returns Parsed and sanitized object
 */
export function safeJsonParse<T>(jsonString: string, defaultValue: T): T {
  try {
    const parsed = JSON.parse(jsonString)
    return sanitizeObject(parsed)
  } catch {
    return defaultValue
  }
}

/**
 * Safely parse JSON string with validation
 * @param jsonString - The JSON string to parse
 * @param validator - Function to validate the parsed object
 * @param defaultValue - Default value to return if parsing or validation fails
 * @returns Parsed, sanitized, and validated object
 */
export function safeJsonParseWithValidation<T>(
  jsonString: string,
  validator: (obj: unknown) => obj is T,
  defaultValue: T
): T {
  try {
    const parsed = JSON.parse(jsonString)
    const sanitized = sanitizeObject(parsed)
    if (validator(sanitized)) {
      return sanitized
    }
    return defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * Type guard for array validation
 */
export function isArray<T>(
  validator: (item: unknown) => item is T
): (obj: unknown) => obj is T[] {
  return (obj: unknown): obj is T[] => {
    return Array.isArray(obj) && obj.every(validator)
  }
}

/**
 * Type guard for string validation
 */
export function isString(obj: unknown): obj is string {
  return typeof obj === 'string'
}

/**
 * Type guard for object validation
 */
export function isObject(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj)
}

/**
 * Type guard for webhook events validation
 */
export function isWebhookEvent(obj: unknown): obj is string {
  return (
    typeof obj === 'string' &&
    ['resource.created', 'resource.updated', 'resource.deleted'].includes(obj)
  )
}
