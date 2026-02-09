import { patternsConfig } from '~/configs/patterns.config'

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
      return patternsConfig.memoization.nullKey
    }
    if (typeof arg === 'object') {
      // For objects, use reference to avoid caching by structure
      // This is a unique identifier per object instance
      return `${patternsConfig.memoization.objectKeyPrefix}${Math.random().toString(36).substr(2, patternsConfig.memoization.cacheKeyLength)}`
    }
    if (typeof arg === 'function') {
      return patternsConfig.memoization.functionKeyPrefix
    }
    return String(arg)
  }

  // For multiple arguments, create a composite key
  return args
    .map(arg => {
      if (arg === null || arg === undefined) {
        return patternsConfig.memoization.nullKey
      }
      if (typeof arg === 'object') {
        // Use unique identifier for each object instance
        return `${patternsConfig.memoization.objectKeyPrefix}${Math.random().toString(36).substr(2, patternsConfig.memoization.cacheKeyLength)}`
      }
      if (typeof arg === 'function') {
        return patternsConfig.memoization.functionKeyPrefix
      }
      return String(arg)
    })
    .join('|')
}

export const memoize = <T extends (...args: unknown[]) => ReturnType<T>>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>()
  allCaches.add(cache)

  const defaultKeyGenerator = (...args: Parameters<T>): string => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return keyGenerator ? (keyGenerator as any)(...args) : generateArgsKey(args)
  }

  return ((...args: Parameters<T>) => {
    const key = defaultKeyGenerator(...args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

export const memoizeHighlight = (
  highlightFn: (text: string, searchQuery: string) => string
): ((text: string, searchQuery: string) => string) => {
  const cache = new Map<string, string>()
  allCaches.add(cache)

  return (_text: string, _searchQuery: string) => {
    const key = generateCacheKey(_text, _searchQuery)

    if (cache.has(key)) {
      return cache.get(key)!
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
