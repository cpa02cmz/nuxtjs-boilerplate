/**
 * API Key Security Utilities
 * Functions for securely handling API keys - masking, validation, etc.
 */
import { patternsConfig } from '~/configs/patterns.config'
import { securityConfig } from '~/configs/security.config'

/**
 * Mask an API key for logging/display purposes
 * Shows only the first 4 and last 4 characters, masks the rest
 * @param apiKey - The API key to mask
 * @returns Masked API key (e.g., "ak_1a2b...x9y8")
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < securityConfig.apiKeyCrypto.minKeyLength) {
    // Flexy hates hardcoded 12!
    return patternsConfig.apiKey.mask.placeholder
  }

  const prefix = apiKey.slice(0, patternsConfig.apiKey.mask.visiblePrefixLength)
  const suffix = apiKey.slice(-patternsConfig.apiKey.mask.visibleSuffixLength)
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

  return patternsConfig.apiKey.prefixes.some(prefix => value.startsWith(prefix))
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
      const isApiKeyField = patternsConfig.apiKey.fieldPattern.test(key)

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
  return message.replace(patternsConfig.apiKey.pattern, match =>
    maskApiKey(match)
  )
}
