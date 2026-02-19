import { memoizeConfig } from '~/configs/memoize.config'
import { limitsConfig } from '~/configs/limits.config'

/**
 * Generate a cryptographically secure random ID using Web Crypto API
 * Works in both browser and Node.js environments
 */
const generateSecureId = (): string => {
  // Use Web Crypto API available in both browser and Node.js
  const array = new Uint8Array(memoizeConfig.id.length)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    // Fallback for environments without crypto (shouldn't happen in modern browsers/Node)
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(
        Math.random() * limitsConfig.displayLength.randomByteMax
      )
    }
  }

  // Convert to hex string and format as UUID-like
  const hex = Array.from(array, byte =>
    byte.toString(16).padStart(2, '0')
  ).join('')
  const { uuidSlices } = limitsConfig.displayLength
  return `${hex.slice(0, uuidSlices.section1)}-${hex.slice(uuidSlices.section1, uuidSlices.section2)}-${hex.slice(uuidSlices.section2, uuidSlices.section3)}-${hex.slice(uuidSlices.section3, uuidSlices.section4)}-${hex.slice(uuidSlices.section4, uuidSlices.section5)}`
}

const generateCacheKey = (text: string, searchQuery: string): string => {
  return `${text}:${searchQuery}`
}

// Store all caches for clearing
const allCaches: Set<Map<string, unknown>> = new Set()

// Helper to generate cache key for arguments
const generateArgsKey = (args: unknown[]): string => {
  if (args.length === 1) {
    const arg = args[0]
    if (arg === null || arg === undefined) {
      return memoizeConfig.keys.nullKey
    }
    if (typeof arg === 'object') {
      // For objects, use reference to avoid caching by structure
      // This is a unique identifier per object instance
      // FIXED: Use cryptographically secure random ID instead of Math.random()
      return `${memoizeConfig.keys.objectPrefix}${generateSecureId()}`
    }
    if (typeof arg === 'function') {
      return memoizeConfig.keys.functionKey
    }
    return String(arg)
  }

  // For multiple arguments, create a composite key
  return args
    .map(arg => {
      if (arg === null || arg === undefined) {
        return memoizeConfig.keys.nullKey
      }
      if (typeof arg === 'object') {
        // Use unique identifier for each object instance
        // FIXED: Use cryptographically secure random ID instead of Math.random()
        return `${memoizeConfig.keys.objectPrefix}${generateSecureId()}`
      }
      if (typeof arg === 'function') {
        return memoizeConfig.keys.functionKey
      }
      return String(arg)
    })
    .join(memoizeConfig.keys.separator)
}

export const memoize = <T extends (...args: unknown[]) => ReturnType<T>>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>()
  allCaches.add(cache)

  const defaultKeyGenerator = (...args: Parameters<T>): string => {
    return keyGenerator ? keyGenerator(...args) : generateArgsKey(args)
  }

  return ((...args: Parameters<T>) => {
    const key = defaultKeyGenerator(...args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    // Prevent unbounded cache growth - remove oldest entries if cache is full
    if (cache.size >= memoizeConfig.cache.maxSize) {
      // Flexy uses configurable eviction percentage!
      const keysToRemove = Math.floor(
        memoizeConfig.cache.maxSize * memoizeConfig.cache.trimRatio
      )
      let removed = 0
      for (const k of cache.keys()) {
        if (removed >= keysToRemove) break
        cache.delete(k)
        removed++
      }
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

export const memoizeHighlight = <T = string>(
  highlightFn: (text: string, searchQuery: string) => T
): ((text: string, searchQuery: string) => T) => {
  const cache = new Map<string, T>()
  allCaches.add(cache)

  return (_text: string, _searchQuery: string) => {
    const key = generateCacheKey(_text, _searchQuery)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    // Prevent unbounded cache growth - remove oldest entries if cache is full
    if (cache.size >= memoizeConfig.cache.maxSize) {
      // Flexy uses configurable eviction percentage!
      const keysToRemove = Math.floor(
        memoizeConfig.cache.maxSize * memoizeConfig.cache.trimRatio
      )
      let removed = 0
      for (const k of cache.keys()) {
        if (removed >= keysToRemove) break
        cache.delete(k)
        removed++
      }
    }

    const result = highlightFn(_text, _searchQuery)
    cache.set(key, result)
    return result
  }
}

export const clearMemoCache = (): void => {
  allCaches.forEach(cache => cache.clear())
  allCaches.clear()
}
