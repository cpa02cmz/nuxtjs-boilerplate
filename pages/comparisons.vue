<template>
  <div class="comparisons-page">
    <div class="page-header">
      <h1>My Comparisons</h1>
      <p>View and manage your saved resource comparisons</p>
    </div>

    <div v-if="loading" class="loading">
      <p>Loading your comparisons...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <div v-else class="comparisons-content">
      <div v-if="historyCount > 0" class="comparisons-list">
        <div
          v-for="comparison in comparisons"
          :key="comparison.id"
          class="comparison-item"
        >
          <div class="comparison-header">
            <h3>Comparison #{{ comparison.id.substring(0, 8) }}</h3>
            <div class="comparison-meta">
              <span>{{ formatDate(comparison.createdAt) }}</span>
              <span class="visibility">
                {{ comparison.isPublic ? 'Public' : 'Private' }}
              </span>
            </div>
          </div>

          <div class="comparison-resources">
            <p>
              <strong>Resources:</strong> {{ comparison.resources.join(', ') }}
            </p>
          </div>

          <div class="comparison-actions">
            <NuxtLink
              :to="`/compare/${comparison.resources.join(',')}`"
              class="view-btn"
            >
              View Comparison
            </NuxtLink>

            <button
              class="delete-btn"
              @click="deleteComparison(comparison.id)"
              :disabled="deleteLoading"
            >
              {{ deleteLoading ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>

      <div v-else class="no-comparisons">
        <p>You haven't saved any comparisons yet.</p>
        <NuxtLink to="/compare" class="create-link">
          Create your first comparison
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useComparisonHistory } from '~/composables/useComparisonHistory'

// Composables
const {
  comparisons,
  loading,
  error,
  historyCount,
  loadComparisonHistory,
  deleteFromHistory,
} = useComparisonHistory()

// Local state
const deleteLoading = ref(false)

// Load comparison history on mount
onMounted(() => {
  loadComparisonHistory()
})

// Methods
const deleteComparison = async (id: string) => {
  if (!confirm('Are you sure you want to delete this comparison?')) {
    return
  }

  deleteLoading.value = true
  try {
    await deleteFromHistory(id)
    // The composable updates the state automatically
  } catch (err) {
    console.error('Error deleting comparison:', err)
    alert('Failed to delete comparison')
  } finally {
    deleteLoading.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Set page metadata
useSeoMeta({
  title: 'My Comparisons | Nuxt.js Boilerplate',
  description:
    'View and manage your saved resource comparisons. Track your decision-making process.',
  ogTitle: 'My Comparisons',
  ogDescription: 'View and manage your saved resource comparisons.',
  ogType: 'website',
  ogUrl: `${useRuntimeConfig().public.baseURL}/comparisons`,
})
</script>

<style scoped>
.comparisons-page {
  padding: 2rem 1rem;
  max-width: 1000px;
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
.no-comparisons {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #d32f2f;
}

.comparisons-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comparison-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  background-color: white;
}

.comparison-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.comparison-header h3 {
  margin: 0;
  color: #333;
}

.comparison-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.9rem;
  color: #666;
}

.visibility {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.comparison-resources {
  margin-bottom: 1rem;
}

.comparison-resources p {
  margin: 0.5rem 0;
  color: #555;
}

.comparison-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.view-btn,
.delete-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  text-align: center;
  transition: background-color 0.2s;
}

.view-btn {
  background-color: #007acc;
  color: white;
}

.view-btn:hover {
  background-color: #005a9e;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delete-btn:hover:not(:disabled) {
  background-color: #d32f2f;
}

.create-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #007acc;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
}

.create-link:hover {
  background-color: #005a9e;
}

@media (max-width: 768px) {
  .comparisons-page {
    padding: 1rem 0.5rem;
  }

  .comparison-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .comparison-actions {
    flex-direction: column;
  }

  .view-btn,
  .delete-btn {
    width: 100%;
  }
}
</style>
