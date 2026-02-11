import { ref, computed, readonly } from 'vue'
import { logError } from '~/utils/errorLogger'
import logger from '~/utils/logger'
import { TIMING } from '~/server/utils/constants'
import { uiConfig } from '~/configs/ui.config'
import type { Resource } from '~/types/resource'
import { useLoading } from './useLoading'

// Main composable for managing resource data
export const useResourceData = () => {
  const resources = ref<Resource[]>([])
  const { loadingState, withLoading } = useLoading()
  const retryCount = ref(0)
  const maxRetries = uiConfig.dataLoading.maxRetries // Flexy hates hardcoded 3! Using config now
  const lastError = ref<Error | null>(null)

  // Computed refs for backward compatibility
  // loadingState is already a readonly reactive object, not a ref
  const loading = computed(() => loadingState.loading)
  const error = computed(() => loadingState.error)

  // Initialize resources
  const initResources = async (attempt = 1) => {
    // Use withLoading for the first attempt to show loading state
    if (attempt === 1) {
      return withLoading(
        async () => {
          await fetchResources(attempt)
          return resources.value
        },
        {
          errorMessage: 'Failed to load resources',
        }
      )
    } else {
      // For retry attempts, don't show loading state
      await fetchResources(attempt)
    }
  }

  // Internal fetch logic
  const fetchResources = async (attempt = 1) => {
    try {
      // Import resources from JSON
      const resourcesModule = await import('~/data/resources.json')
      const rawData = resourcesModule.default || resourcesModule

      // Type validation to ensure data integrity
      if (!Array.isArray(rawData)) {
        throw new Error('Invalid resource data format: expected array')
      }

      // Validate each resource has required properties
      const validatedResources: Resource[] = []
      for (const item of rawData) {
        if (
          item !== null &&
          typeof item === 'object' &&
          typeof item.id === 'string' &&
          typeof item.title === 'string' &&
          typeof item.category === 'string' &&
          Array.isArray(item.tags) &&
          Array.isArray(item.technology)
        ) {
          validatedResources.push(item as Resource)
        }
      }

      if (validatedResources.length === 0 && rawData.length > 0) {
        throw new Error('Invalid resource data: no valid resources found')
      }

      resources.value = validatedResources
      lastError.value = null
      retryCount.value = 0
    } catch (err) {
      // Ensure we have a proper Error object
      const errorObj = err instanceof Error ? err : new Error(String(err))
      lastError.value = errorObj

      // Log error using our error logging service
      logError(
        `Failed to load resources (attempt ${attempt}/${maxRetries}): ${errorObj.message}`,
        errorObj,
        'useResourceData',
        { attempt, maxRetries, errorType: err?.constructor?.name }
      )

      // Log error using structured logger
      logger.error('Error loading resources:', err)

      // Retry if we haven't exceeded max retries
      if (attempt < maxRetries) {
        retryCount.value = attempt
        // Wait for a bit before retrying (exponential backoff)
        await new Promise(resolve =>
          setTimeout(resolve, TIMING.RETRY_BASE_DELAY_MS * attempt)
        )
        await fetchResources(attempt + 1)
      } else {
        throw errorObj
      }
    }
  }

  // Retry loading resources
  const retryResources = async () => {
    retryCount.value = 0
    lastError.value = null
    await initResources()
  }

  // Compute all unique values in a single pass
  const filterValues = computed(() => {
    if (!resources.value || !Array.isArray(resources.value)) {
      return {
        categories: [],
        pricingModels: [],
        difficultyLevels: [],
        technologies: [],
      }
    }

    const categoriesSet = new Set<string>()
    const pricingModelsSet = new Set<string>()
    const difficultyLevelsSet = new Set<string>()
    const technologiesSet = new Set<string>()

    resources.value.forEach(resource => {
      categoriesSet.add(resource.category)
      pricingModelsSet.add(resource.pricingModel)
      difficultyLevelsSet.add(resource.difficulty)
      resource.technology.forEach(tech => technologiesSet.add(tech))
    })

    return {
      categories: Array.from(categoriesSet),
      pricingModels: Array.from(pricingModelsSet),
      difficultyLevels: Array.from(difficultyLevelsSet),
      technologies: Array.from(technologiesSet),
    }
  })

  const categories = computed(() => filterValues.value.categories)
  const pricingModels = computed(() => filterValues.value.pricingModels)
  const difficultyLevels = computed(() => filterValues.value.difficultyLevels)
  const technologies = computed(() => filterValues.value.technologies)

  // Initialize resources when composable is created
  initResources()

  return {
    resources: readonly(resources),
    loading: readonly(loading),
    error: readonly(error),
    retryCount: readonly(retryCount),
    maxRetries,
    lastError: readonly(lastError),
    categories,
    pricingModels,
    difficultyLevels,
    technologies,
    retryResources,
  }
}
