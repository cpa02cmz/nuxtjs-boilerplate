import Fuse from 'fuse.js'
import type { FuseOptionKey, IFuseOptions } from 'fuse.js'
import type { Resource } from '~/types/resource'
import { searchConfig } from '~/configs/search.config'

/**
 * Creates Fuse.js configuration from searchConfig
 * Flexy hates hardcoded values - all config comes from searchConfig!
 */
const createFuseConfig = (
  isSuggestions: boolean = false
): IFuseOptions<Resource> => {
  const keys: FuseOptionKey<Resource>[] = [
    {
      name: 'title',
      weight: isSuggestions
        ? searchConfig.keys.name.weight *
          searchConfig.suggestionMultipliers.title
        : searchConfig.keys.name.weight,
    },
    {
      name: 'description',
      weight: isSuggestions
        ? searchConfig.keys.description.weight *
          searchConfig.suggestionMultipliers.description
        : searchConfig.keys.description.weight,
    },
    {
      name: 'benefits',
      weight: isSuggestions
        ? searchConfig.suggestionWeights.benefits
        : searchConfig.suggestionWeights.benefits *
          searchConfig.suggestionMultipliers.benefitsRegular,
    },
    {
      name: 'tags',
      weight: isSuggestions
        ? searchConfig.keys.tags.weight *
          searchConfig.suggestionMultipliers.tags
        : searchConfig.keys.tags.weight,
    },
  ]

  // Add category key for suggestions
  if (isSuggestions) {
    keys.push({
      name: 'category',
      weight: searchConfig.keys.category.weight,
    })
  }

  return {
    keys,
    threshold: searchConfig.fuse.threshold,
    includeScore: searchConfig.fuse.includeScore,
    useExtendedSearch: searchConfig.fuse.useExtendedSearch,
    distance: searchConfig.fuse.distance,
    minMatchCharLength: isSuggestions
      ? searchConfig.suggestions.minMatchCharLength
      : searchConfig.fuse.minMatchCharLength,
    includeMatches: searchConfig.fuse.includeMatches,
    findAllMatches: searchConfig.fuse.findAllMatches,
    ignoreLocation: searchConfig.fuse.ignoreLocation,
    ignoreFieldNorm: searchConfig.fuse.ignoreFieldNorm,
    fieldNormWeight: searchConfig.fuse.fieldNormWeight,
  }
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
    ? { ...createFuseConfig(false), ...config }
    : createFuseConfig(false)

  const fuse = new Fuse([...resources], finalConfig)
  fuseCache.set(resources, fuse)

  return fuse
}

export const createFuseForSuggestions = (
  resources: readonly Resource[]
): Fuse<Resource> => {
  return createFuseInstance(resources, createFuseConfig(true))
}

/**
 * Clear the Fuse cache - useful for testing or memory management
 */
export const clearFuseCache = (): void => {
  // WeakMap clears automatically when references are garbage collected
  // This is a placeholder for explicit cache management if needed in future
}
