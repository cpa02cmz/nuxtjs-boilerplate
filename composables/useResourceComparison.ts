import { ref, computed, readonly } from 'vue'
import type { Resource } from '~/types/resource'
import type { ComparisonData, ComparisonCriteria } from '~/types/comparison'
import { useResourceData } from '~/composables/useResourceData'

// Configuration for comparison system
interface ComparisonConfig {
  maxResources: number
  defaultCriteria: ComparisonCriteria[]
  similarityThreshold: number
}

// Main composable for resource comparison
export const useResourceComparison = () => {
  const { resources } = useResourceData()
  
  // State management for comparison
  const selectedResources = ref<Resource[]>([])
  const comparisonCriteria = ref<ComparisonCriteria[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const config = ref<ComparisonConfig>({
    maxResources: 4,
    similarityThreshold: 0.3,
    defaultCriteria: [
      {
        id: 'title',
        name: 'Name',
        type: 'text',
        category: 'basic',
        weight: 1,
      },
      {
        id: 'description',
        name: 'Description',
        type: 'text',
        category: 'basic',
        weight: 1,
      },
      {
        id: 'pricingModel',
        name: 'Pricing',
        type: 'text',
        category: 'business',
        weight: 1,
      },
      {
        id: 'category',
        name: 'Category',
        type: 'text',
        category: 'basic',
        weight: 0.8,
      },
      {
        id: 'technology',
        name: 'Technology',
        type: 'list',
        category: 'technical',
        weight: 1,
      },
      {
        id: 'popularity',
        name: 'Popularity',
        type: 'number',
        category: 'metrics',
        weight: 0.7,
      },
      {
        id: 'benefits',
        name: 'Benefits',
        type: 'list',
        category: 'features',
        weight: 1,
      },
      {
        id: 'limitiations',
        name: 'Limitations',
        type: 'list',
        category: 'features',
        weight: 0.8,
      },
      {
        id: 'platforms',
        name: 'Platforms',
        type: 'list',
        category: 'technical',
        weight: 0.7,
      },
      {
        id: 'features',
        name: 'Features',
        type: 'list',
        category: 'features',
        weight: 1,
      },
    ],
  })

  // Initialize comparison criteria from API
  const initComparisonCriteria = async () => {
    try {
      loading.value = true
      const criteria: ComparisonCriteria[] = await $fetch(
        '/api/v1/comparisons/criteria'
      )
      comparisonCriteria.value = criteria
    } catch (err) {
      error.value = 'Failed to load comparison criteria'
      console.error('Error loading comparison criteria:', err)
    } finally {
      loading.value = false
    }
  }

  // Add a resource to comparison
  const addResource = (resource: Resource) => {
    if (selectedResources.value.length >= config.value.maxResources) {
      error.value = 'Maximum of 4 resources can be compared'
      return false
    }

    // Check if resource is already in comparison
    if (selectedResources.value.some(r => r.id === resource.id)) {
      return false
    }

    selectedResources.value = [...selectedResources.value, resource]
    error.value = null
    return true
  }

  // Add a resource to comparison by ID
  const addResourceToComparison = (resourceId: string) => {
    if (selectedResources.value.length >= config.value.maxResources) {
      error.value = 'Maximum of 4 resources can be compared'
      return
    }

    const resource = resources.value.find(r => r.id === resourceId)
    if (resource && !selectedResources.value.some(r => r.id === resource.id)) {
      selectedResources.value.push(resource)
      error.value = null
    }
  }

  // Remove a resource from comparison
  const removeResource = (resourceId: string) => {
    selectedResources.value = selectedResources.value.filter(
      r => r.id !== resourceId
    )
  }

  // Remove a resource from comparison (alternative method)
  const removeResourceFromComparison = (resourceId: string) => {
    selectedResources.value = selectedResources.value.filter(
      r => r.id !== resourceId
    )
  }

  // Clear all selected resources
  const clearComparison = () => {
    selectedResources.value = []
    error.value = null
  }

  // Check if a resource is in the comparison
  const isInComparison = (resourceId: string) => {
    return selectedResources.value.some(r => r.id === resourceId)
  }

  // Save the current comparison
  const saveComparison = async (
    options: { isPublic?: boolean; slug?: string } = {}
  ) => {
    if (selectedResources.value.length < 2) {
      error.value = 'At least 2 resources are required for comparison'
      return null
    }

    try {
      loading.value = true

      const comparisonData: Partial<any> = {
        resources: selectedResources.value.map(r => r.id),
        criteria: comparisonCriteria.value,
        scores: {},
        isPublic: options.isPublic || false,
        slug: options.slug,
      }

      const savedComparison: any = await $fetch(
        '/api/v1/comparisons',
        {
          method: 'POST',
          body: comparisonData,
        }
      )

      return savedComparison
    } catch (err) {
      error.value = 'Failed to save comparison'
      console.error('Error saving comparison:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Get a comparison by ID
  const loadComparison = async (id: string) => {
    try {
      loading.value = true
      const comparison: any = await $fetch(
        `/api/v1/comparisons/${id}`
      )

      // Load the resources for this comparison
      const comparisonResources = resources.value.filter(r =>
        comparison.resources.includes(r.id)
      )

      selectedResources.value = comparisonResources

      return comparison
    } catch (err) {
      error.value = 'Failed to load comparison'
      console.error('Error loading comparison:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Get comparison data
  const getComparisonData = () => {
    return {
      resources: selectedResources.value,
      criteria:
        comparisonCriteria.value.length > 0
          ? comparisonCriteria.value
          : config.value.defaultCriteria,
      comparisonId: `cmp_${Date.now()}`,
    } as ComparisonData
  }

  // Set custom criteria
  const setComparisonCriteria = (criteria: ComparisonCriteria[]) => {
    comparisonCriteria.value = criteria
  }

  // Update configuration
  const updateConfig = (newConfig: Partial<ComparisonConfig>) => {
    config.value = { ...config.value, ...newConfig }
  }

  // Initialize comparison criteria when composable is created
  initComparisonCriteria()

  // Computed properties
  const isComparisonReady = computed(() => selectedResources.value.length >= 2)
  const canAddMoreResources = computed(
    () => selectedResources.value.length < config.value.maxResources
  )
  const comparisonCount = computed(() => selectedResources.value.length)

  return {
    // State
    selectedResources: readonly(selectedResources),
    comparisonCriteria: readonly(comparisonCriteria),
    loading: readonly(loading),
    error: readonly(error),
    config: readonly(config),

    // Methods
    addResource,
    removeResource,
    addResourceToComparison,
    removeResourceFromComparison,
    clearComparison,
    isInComparison,
    saveComparison,
    loadComparison,
    getComparisonData,
    setComparisonCriteria,
    updateConfig,

    // Computed
    isComparisonReady,
    canAddMoreResources,
    comparisonCount,
  }
}