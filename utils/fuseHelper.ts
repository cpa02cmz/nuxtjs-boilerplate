import Fuse from 'fuse.js'
import type { FuseIndex, FuseOptions } from 'fuse.js'
import type { Resource } from '~/types/resource'

const DEFAULT_FUSE_CONFIG: FuseOptions<Resource> = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'description', weight: 0.3 },
    { name: 'benefits', weight: 0.2 },
    { name: 'tags', weight: 0.1 },
  ],
  threshold: 0.3,
  includeScore: true,
  useExtendedSearch: true,
}

const FUSE_CONFIG_FOR_SUGGESTIONS: FuseOptions<Resource> = {
  ...DEFAULT_FUSE_CONFIG,
  minMatchCharLength: 1,
}

const fuseCache = new WeakMap<readonly Resource[], Fuse<Resource>>()

export const createFuseInstance = (
  resources: readonly Resource[],
  config?: Partial<FuseOptions<Resource>>
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
