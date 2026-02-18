/**
 * ID Generation Utility
 * Flexy hates hardcoded values! Centralized ID generation with configurable options.
 *
 * Provides consistent, configurable ID generation across the application.
 * All ID lengths, prefixes, and generation strategies are configurable via
 * environment variables or the config object.
 */

export interface IdGenerationConfig {
  /** Default length for generated IDs (excluding prefix) */
  defaultLength: number
  /** Length for toast notification IDs */
  toastIdLength: number
  /** Length for tooltip IDs */
  tooltipIdLength: number
  /** Length for component instance IDs */
  componentIdLength: number
  /** Character set for ID generation (base36 by default) */
  charset: 'base36' | 'base62' | 'hex' | 'alphanumeric'
  /** Whether to include timestamp in ID for uniqueness */
  includeTimestamp: boolean
}

import { limitsConfig } from '~/configs/limits.config'

/**
 * Default configuration for ID generation
 * Flexy hates hardcoded values! All configurable via environment variables or limitsConfig.
 */
const defaultConfig: IdGenerationConfig = {
  defaultLength: parseInt(
    process.env.ID_GENERATION_DEFAULT_LENGTH ||
      String(limitsConfig.displayLength.uniqueIdLength)
  ),
  toastIdLength: parseInt(
    process.env.ID_GENERATION_TOAST_LENGTH ||
      String(limitsConfig.displayLength.toastIdLength)
  ),
  tooltipIdLength: parseInt(
    process.env.ID_GENERATION_TOOLTIP_LENGTH ||
      String(limitsConfig.displayLength.uniqueIdLength)
  ),
  componentIdLength: parseInt(
    process.env.ID_GENERATION_COMPONENT_LENGTH ||
      String(limitsConfig.displayLength.componentIdLength)
  ),
  charset:
    (process.env.ID_GENERATION_CHARSET as IdGenerationConfig['charset']) ||
    'base36',
  includeTimestamp: process.env.ID_GENERATION_INCLUDE_TIMESTAMP === 'true',
}

/**
 * Character sets for different ID generation strategies
 */
const charsets: Record<IdGenerationConfig['charset'], string> = {
  base36: '0123456789abcdefghijklmnopqrstuvwxyz',
  base62: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  hex: '0123456789abcdef',
  alphanumeric:
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
}

/**
 * Generate a cryptographically secure random ID
 * @param length - Length of the ID to generate
 * @param charset - Character set to use
 * @returns Generated ID string
 */
function generateRandomString(length: number, charset: string): string {
  let result = ''
  const charsetLength = charset.length

  // Use crypto.getRandomValues for cryptographically secure randomness
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const randomValues = new Uint32Array(length)
    crypto.getRandomValues(randomValues)
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charsetLength]
    }
  } else {
    throw new Error(
      'Crypto API not available. Cannot generate secure random ID.'
    )
  }

  return result
}

/**
 * Generate a unique ID with optional prefix and configurable length
 *
 * @example
 * ```ts
 * // Generate a default ID
 * const id = generateId()
 *
 * // Generate a toast ID with custom length
 * const toastId = generateId({ length: 9, prefix: 'toast' })
 *
 * // Generate a component ID with timestamp
 * const componentId = generateId({ includeTimestamp: true })
 * ```
 */
export function generateId(options?: {
  length?: number
  prefix?: string
  includeTimestamp?: boolean
  charset?: IdGenerationConfig['charset']
}): string {
  const config = defaultConfig
  const length = options?.length ?? config.defaultLength
  const charset = charsets[options?.charset ?? config.charset]
  const includeTimestamp = options?.includeTimestamp ?? config.includeTimestamp

  let id = generateRandomString(length, charset)

  // Add timestamp prefix if enabled
  if (includeTimestamp) {
    const timestamp = Date.now().toString(36)
    id = `${timestamp}_${id}`
  }

  // Add custom prefix if provided
  if (options?.prefix) {
    id = `${options.prefix}-${id}`
  }

  return id
}

/**
 * Generate an ID specifically for toast notifications
 * Uses the configured toast ID length
 */
export function generateToastId(): string {
  return generateId({
    length: defaultConfig.toastIdLength,
    prefix: 'toast',
  })
}

/**
 * Generate an ID specifically for tooltips
 * Uses the configured tooltip ID length
 */
export function generateTooltipId(): string {
  return generateId({
    length: defaultConfig.tooltipIdLength,
    prefix: 'tooltip',
  })
}

/**
 * Generate an ID specifically for component instances
 * Uses the configured component ID length
 */
export function generateComponentId(prefix?: string): string {
  return generateId({
    length: defaultConfig.componentIdLength,
    prefix,
  })
}

/**
 * Generate a short ID for simple use cases
 * Uses half the default length for brevity
 */
export function generateShortId(): string {
  return generateId({
    length: Math.max(4, Math.floor(defaultConfig.defaultLength / 2)),
  })
}

// Re-export config for external use
export { defaultConfig as idGenerationConfig }

// Default export
export default generateId

/**
 * Generate cryptographically secure unique ID
 * Uses crypto.randomUUID() for security (replaces insecure Math.random())
 * Available in Node.js 14.17+ and all modern browsers
 * @deprecated Use generateId() instead for consistency
 */
export const generateUniqueId = (): string => {
  return crypto.randomUUID()
}
