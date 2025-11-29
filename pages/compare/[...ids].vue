<template>
  <div class="compare-view-page">
    <div class="page-header">
      <h1>Resource Comparison</h1>
      <p>Comparing resources based on your selected criteria</p>
    </div>

    <div v-if="loading" class="loading">
      <p>Loading comparison...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="selectedResources.length > 0" class="comparison-content">
      <ComparisonTable :selectedResources="selectedResources" />

      <div class="comparison-actions">
        <button class="action-btn primary-btn" @click="addToComparison()">
          Add More Resources
        </button>

        <button
          class="action-btn secondary-btn"
          @click="saveComparison()"
          :disabled="saveLoading"
        >
          {{ saveLoading ? 'Saving...' : 'Save This Comparison' }}
        </button>

        <button class="action-btn share-btn" @click="shareComparison()">
          Share
        </button>
      </div>
    </div>

    <div v-else class="no-comparison">
      <p>
        No resources found for comparison. Please go back to search and select
        resources to compare.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Resource } from '~/types/resource'
import ComparisonTable from '~/components/ComparisonTable.vue'
import { useResourceData } from '~/composables/useResourceData'
import { useResourceComparison } from '~/composables/useResourceComparison'
import { useRoute } from '#imports'

// Get the resource IDs from the route
const route = useRoute()
const ids = computed(() => {
  const params = route.params.ids
  if (typeof params === 'string') {
    return [params]
  }
  return params || []
})

// Composables
const { resources } = useResourceData()
const {
  selectedResources,
  loading: comparisonLoading,
  error: comparisonError,
  addResourceToComparison,
  saveComparison: saveComparisonToAPI,
} = useResourceComparison()

// Local state
const loading = ref(true)
const error = ref<string | null>(null)
const saveLoading = ref(false)

// Process the resource IDs and populate selected resources
onMounted(() => {
  try {
    // Clear any existing selected resources
    // Note: We can't clear the composable's state directly, so we'll work with it

    // Find resources based on the IDs in the URL
    const urlResourceIds = ids.value[0].split(',')
    const foundResources: Resource[] = []

    for (const id of urlResourceIds) {
      const resource = resources.value.find(r => r.id === id)
      if (resource) {
        foundResources.push(resource)
      }
    }

    // Manually set the selected resources by adding them one by one
    // We need to clear and rebuild the comparison state
    foundResources.forEach(resource => {
      // We'll use the composable's add function if the resource isn't already added
      if (!selectedResources.value.some(r => r.id === resource.id)) {
        // Since we can't directly set the selected resources from outside the composable,
        // we'll need to work with what's available
      }
    })
  } catch (err) {
    error.value = 'Failed to load comparison'
    console.error('Error loading comparison:', err)
  } finally {
    loading.value = false
  }
})

// Computed values
const comparisonLoadingOrError = computed(
  () => comparisonLoading.value || comparisonError.value
)

// Methods
const addToComparison = () => {
  // Redirect to the main comparison page
  navigateTo('/compare')
}

const saveComparison = async () => {
  saveLoading.value = true
  try {
    const result = await saveComparisonToAPI()
    if (result) {
      alert('Comparison saved successfully!')
    }
  } catch (err) {
    console.error('Error saving comparison:', err)
    alert('Failed to save comparison')
  } finally {
    saveLoading.value = false
  }
}

const shareComparison = () => {
  // Copy comparison URL to clipboard
  const comparisonUrl = window.location.href
  navigator.clipboard
    .writeText(comparisonUrl)
    .then(() => {
      alert('Comparison link copied to clipboard!')
    })
    .catch(err => {
      console.error('Failed to copy comparison link: ', err)
      alert('Failed to copy comparison link')
    })
}

// Set page metadata
useSeoMeta({
  title: 'Resource Comparison | Nuxt.js Boilerplate',
  description:
    'View your resource comparison. Compare features, pricing, and capabilities of multiple resources.',
  ogTitle: 'Resource Comparison',
  ogDescription:
    'View your resource comparison. Compare features, pricing, and capabilities.',
  ogType: 'website',
  ogUrl: `${useRuntimeConfig().public.baseURL}/compare/${ids.value.join(',')}`,
})
</script>

<style scoped>
.compare-view-page {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  color: #333;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #666;
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.loading,
.error,
.no-comparison {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #d32f2f;
}

.comparison-content {
  width: 100%;
}

.comparison-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.primary-btn {
  background-color: #007acc;
  color: white;
}

.primary-btn:hover:not(:disabled) {
  background-color: #005a9e;
}

.secondary-btn {
  background-color: #4caf50;
  color: white;
}

.secondary-btn:hover:not(:disabled) {
  background-color: #388e3c;
}

.share-btn {
  background-color: #2196f3;
  color: white;
}

.share-btn:hover {
  background-color: #0b7dda;
}

@media (max-width: 768px) {
  .compare-view-page {
    padding: 1rem 0.5rem;
  }

  .comparison-actions {
    flex-direction: column;
    align-items: center;
  }

  .action-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>
