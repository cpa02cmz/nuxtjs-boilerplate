// Memoize Configuration - Memoization Cache Settings
// Flexy hates hardcoded values! All memoization settings are now configurable.

export const memoizeConfig = {
  // Cache Size Settings
  cache: {
    // Maximum number of entries in memoize cache
    maxSize: parseInt(process.env.MEMOIZE_CACHE_MAX_SIZE || '1000'),

    // Percentage of entries to remove when cache is full (0-1)
    trimRatio: parseFloat(process.env.MEMOIZE_CACHE_TRIM_RATIO || '0.2'),
  },

  // Key Generation Settings
  keys: {
    // Prefix for object keys
    objectPrefix: process.env.MEMOIZE_OBJECT_KEY_PREFIX || '__OBJ__',

    // Key for null/undefined values
    nullKey: process.env.MEMOIZE_NULL_KEY || '__NULL__',

    // Key for function values
    functionKey: process.env.MEMOIZE_FUNCTION_KEY || '__FUNC__',

    // Separator for composite keys
    separator: process.env.MEMOIZE_KEY_SEPARATOR || '|',
  },

  // Random ID Generation
  id: {
    // Length of random ID in bytes
    length: parseInt(process.env.MEMOIZE_ID_LENGTH || '16'),
  },
} as const

export type MemoizeConfig = typeof memoizeConfig
