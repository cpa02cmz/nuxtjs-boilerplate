import { ref, computed, readonly } from 'vue'
import type { ResourceComparison } from '~/types/comparison'

// Composable for managing comparison history
export const useComparisonHistory = () => {
  const comparisons = ref<ResourceComparison[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Load comparison history
  const loadComparisonHistory = async (userId?: string) => {
    try {
      loading.value = true
      const queryParams = userId ? `?userId=${userId}` : ''
      const history: ResourceComparison[] = await $fetch(
        `/api/v1/comparisons${queryParams}`
      )
      comparisons.value = history
    } catch (err) {
      error.value = 'Failed to load comparison history'
      console.error('Error loading comparison history:', err)
    } finally {
      loading.value = false
    }
  }

  // Save a comparison to history
  const saveToHistory = async (comparison: ResourceComparison) => {
    try {
      loading.value = true
      const savedComparison: ResourceComparison = await $fetch(
        '/api/v1/comparisons',
        {
          method: 'POST',
          body: comparison,
        }
      )

      // Add to local history
      comparisons.value.unshift(savedComparison)
      return savedComparison
    } catch (err) {
      error.value = 'Failed to save comparison to history'
      console.error('Error saving to history:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Delete a comparison from history
  const deleteFromHistory = async (id: string) => {
    try {
      loading.value = true
      await $fetch(`/api/v1/comparisons/${id}`, {
        method: 'DELETE',
      })

      // Remove from local history
      comparisons.value = comparisons.value.filter(cmp => cmp.id !== id)
    } catch (err) {
      error.value = 'Failed to delete comparison from history'
      console.error('Error deleting from history:', err)
    } finally {
      loading.value = false
    }
  }

  // Get a specific comparison from history
  const getComparison = async (id: string) => {
    try {
      loading.value = true
      const comparison: ResourceComparison = await $fetch(
        `/api/v1/comparisons/${id}`
      )
      return comparison
    } catch (err) {
      error.value = 'Failed to get comparison'
      console.error('Error getting comparison:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Computed properties
  const historyCount = computed(() => comparisons.value.length)
  const publicComparisons = computed(() =>
    comparisons.value.filter(cmp => cmp.isPublic)
  )

  return {
    comparisons: readonly(comparisons),
    loading: readonly(loading),
    error: readonly(error),
    historyCount,
    publicComparisons,
    loadComparisonHistory,
    saveToHistory,
    deleteFromHistory,
    getComparison,
  }
}
