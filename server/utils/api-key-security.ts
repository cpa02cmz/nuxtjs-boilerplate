/**
 * API Key Security Utilities
 * Functions for securely handling API keys - masking, validation, etc.
 */

/**
 * Mask an API key for logging/display purposes
 * Shows only the first 4 and last 4 characters, masks the rest
 * @param apiKey - The API key to mask
 * @returns Masked API key (e.g., "ak_1a2b...x9y8")
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 12) {
    return '***'
  }

  const prefix = apiKey.slice(0, 8) // e.g., "ak_1a2b"
  const suffix = apiKey.slice(-4) // e.g., "x9y8"
  return `${prefix}...${suffix}`
}

/**
 * Check if a string looks like an API key (starts with known prefixes)
 * @param value - The string to check
 * @returns True if it looks like an API key
 */
export function isApiKey(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  const apiKeyPrefixes = ['ak_', 'sk_', 'pk_', 'api_']
  return apiKeyPrefixes.some(prefix => value.startsWith(prefix))
}

/**
 * Recursively mask all API keys in an object (for safe logging)
 * @param obj - The object to process
 * @returns New object with API keys masked
 */
export function maskApiKeysInObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj === 'string') {
    return (isApiKey(obj) ? maskApiKey(obj) : obj) as unknown as T
  }

  if (Array.isArray(obj)) {
    return obj.map(item => maskApiKeysInObject(item)) as unknown as T
  }

  if (typeof obj === 'object') {
    const masked: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      // Check if the key name suggests this is an API key field
      const isApiKeyField = /api[_-]?key|key|token|secret|password/i.test(key)

      if (isApiKeyField && typeof value === 'string') {
        masked[key] = maskApiKey(value)
      } else {
        masked[key] = maskApiKeysInObject(value)
      }
    }
    return masked as T
  }

  return obj
}

/**
 * Sanitize error messages to ensure API keys are never exposed
 * @param message - The error message to sanitize
 * @returns Sanitized message with API keys masked
 */
export function sanitizeErrorMessage(message: string): string {
  if (!message) return message

  // Match patterns that look like API keys and mask them
  const apiKeyPattern = /\b(ak_|sk_|pk_|api_)[a-zA-Z0-9]{20,}\b/g
  return message.replace(apiKeyPattern, match => maskApiKey(match))
}
