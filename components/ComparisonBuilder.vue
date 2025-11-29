<template>
  <div class="comparison-builder">
    <div class="comparison-header">
      <h2>Resource Comparison Tool</h2>
      <p>Compare up to 4 resources side-by-side to make informed decisions</p>
    </div>

    <!-- Selected Resources Bar -->
    <div class="selected-resources-bar">
      <div class="selected-resources">
        <div
          v-for="resource in selectedResources"
          :key="resource.id"
          class="selected-resource"
        >
          <div class="resource-info">
            <h4>{{ resource.title }}</h4>
            <span class="resource-category">{{ resource.category }}</span>
          </div>
          <button
            class="remove-btn"
            @click="removeResourceFromComparison(resource.id)"
            :aria-label="`Remove ${resource.title} from comparison`"
          >
            ×
          </button>
        </div>
      </div>

      <div v-if="selectedResources.length < 4" class="add-resource-section">
        <p>You can add {{ 4 - selectedResources.length }} more resource(s)</p>
      </div>
      <div v-else class="comparison-ready">
        <p>
          Ready to compare! You have {{ selectedResources.length }} resources
          selected.
        </p>
      </div>
    </div>

    <!-- Comparison Table -->
    <ComparisonTable :selectedResources="selectedResources" />

    <!-- Actions -->
    <div class="comparison-actions" v-if="selectedResources.length >= 2">
      <button
        class="action-btn primary-btn"
        @click="saveComparison()"
        :disabled="loading"
      >
        {{ loading ? 'Saving...' : 'Save Comparison' }}
      </button>

      <button
        class="action-btn secondary-btn"
        @click="shareComparison()"
        :disabled="loading"
      >
        Share Comparison
      </button>

      <button class="action-btn clear-btn" @click="clearComparison">
        Clear All
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Resource } from '~/types/resource'
import { useResourceComparison } from '~/composables/useResourceComparison'
import ComparisonTable from '~/components/ComparisonTable.vue'

const {
  selectedResources,
  loading,
  error,
  removeResourceFromComparison,
  clearComparison,
  saveComparison,
} = useResourceComparison()

// Share comparison functionality
const shareComparison = () => {
  // In a real implementation, this would generate a shareable link
  if (selectedResources.value.length < 2) {
    alert('Please select at least 2 resources to share comparison')
    return
  }

  // Copy comparison URL to clipboard
  const comparisonUrl = `${window.location.origin}/compare/${selectedResources.value.map(r => r.id).join(',')}`
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
</script>

<style scoped>
.comparison-builder {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.comparison-header {
  text-align: center;
  margin-bottom: 2rem;
}

.comparison-header h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.comparison-header p {
  color: #666;
  margin: 0;
}

.selected-resources-bar {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.selected-resources {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.selected-resource {
  display: flex;
  align-items: center;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  max-width: 300px;
}

.resource-info {
  flex: 1;
  min-width: 0;
}

.resource-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resource-category {
  font-size: 0.8rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  margin-left: 0.5rem;
  color: #999;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.remove-btn:hover {
  background-color: #f0f0f0;
  color: #d00;
}

.add-resource-section,
.comparison-ready {
  text-align: center;
  color: #666;
  font-style: italic;
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

.clear-btn {
  background-color: #f44336;
  color: white;
}

.clear-btn:hover {
  background-color: #d32f2f;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #ffcdd2;
  margin-top: 1rem;
  text-align: center;
}

@media (max-width: 768px) {
  .comparison-builder {
    padding: 0.5rem;
  }

  .selected-resource {
    max-width: 200px;
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
