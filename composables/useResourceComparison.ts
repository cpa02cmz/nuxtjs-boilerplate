import { ref, computed, readonly } from 'vue'
import type { Resource, FilterOptions } from '~/types/resource'
import type {
  ComparisonCriteria,
  ResourceComparison,
  ComparisonView,
} from '~/types/comparison'
import { useResourceData } from '~/composables/useResourceData'

// Composable for managing resource comparisons
export const useResourceComparison = () => {
  const { resources } = useResourceData()
  const selectedResources = ref<Resource[]>([])
  const comparisonCriteria = ref<ComparisonCriteria[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

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
  const addResourceToComparison = (resourceId: string) => {
    if (selectedResources.value.length >= 4) {
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

  // Check if a resource is already in comparison
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

      const comparisonData: Partial<ResourceComparison> = {
        resources: selectedResources.value.map(r => r.id),
        criteria: comparisonCriteria.value,
        scores: {},
        isPublic: options.isPublic || false,
        slug: options.slug,
      }

      const savedComparison: ResourceComparison = await $fetch(
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
      const comparison: ResourceComparison = await $fetch(
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

  // Initialize comparison criteria when composable is created
  initComparisonCriteria()

  // Computed properties
  const canAddMoreResources = computed(() => selectedResources.value.length < 4)
  const comparisonCount = computed(() => selectedResources.value.length)

  return {
    selectedResources: readonly(selectedResources),
    comparisonCriteria: readonly(comparisonCriteria),
    loading: readonly(loading),
    error: readonly(error),
    comparisonCount,
    canAddMoreResources,
    addResourceToComparison,
    removeResourceFromComparison,
    clearComparison,
    isInComparison,
    saveComparison,
    loadComparison,
  }
}
