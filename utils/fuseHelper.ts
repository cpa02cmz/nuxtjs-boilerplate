import Fuse from 'fuse.js'
import type { IFuseOptions } from 'fuse.js'
import type { Resource } from '~/types/resource'
import { FUSE_CONFIG } from '~/configs/search.config'

/**
 * Default Fuse.js configuration
 * Uses values from centralized search config
 */
const DEFAULT_FUSE_CONFIG: IFuseOptions<Resource> = {
  keys: [
    { name: 'title', weight: FUSE_CONFIG.keys[0].weight },
    { name: 'description', weight: FUSE_CONFIG.keys[1].weight },
    { name: 'benefits', weight: FUSE_CONFIG.keys[2].weight },
    { name: 'tags', weight: FUSE_CONFIG.keys[3].weight },
  ],
  threshold: FUSE_CONFIG.threshold,
  includeScore: FUSE_CONFIG.includeScore,
  useExtendedSearch: true,
}

/**
 * Fuse.js configuration optimized for suggestions
 */
const FUSE_CONFIG_FOR_SUGGESTIONS: IFuseOptions<Resource> = {
  ...DEFAULT_FUSE_CONFIG,
  minMatchCharLength: 1,
  keys: [
    { name: 'title', weight: 0.35 },
    { name: 'description', weight: 0.25 },
    { name: 'benefits', weight: 0.15 },
    { name: 'tags', weight: 0.1 },
    { name: 'category', weight: 0.15 },
  ],
}

const fuseCache = new WeakMap<readonly Resource[], Fuse<Resource>>()

export const createFuseInstance = (
  resources: readonly Resource[],
  config?: Partial<IFuseOptions<Resource>>
): Fuse<Resource> => {
  if (fuseCache.has(resources)) {
    return fuseCache.get(resources)!
  }

  const finalConfig = config
    ? { ...DEFAULT_FUSE_CONFIG, ...config }
    : DEFAULT_FUSE_CONFIG

  const fuse = new Fuse([...resources], finalConfig)
  fuseCache.set(resources, fuse)

  return fuse
}

export const createFuseForSuggestions = (
  resources: readonly Resource[]
): Fuse<Resource> => {
  return createFuseInstance(resources, FUSE_CONFIG_FOR_SUGGESTIONS)
}
