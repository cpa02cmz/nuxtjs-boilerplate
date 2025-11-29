<template>
  <div class="comparison-card">
    <div class="card-header">
      <h3>Compare Resources</h3>
      <div class="comparison-count">
        {{ comparisonCount }}
        {{ comparisonCount === 1 ? 'resource' : 'resources' }} selected
      </div>
    </div>

    <div class="comparison-resources">
      <div
        v-for="resource in selectedResources"
        :key="resource.id"
        class="resource-preview"
      >
        <h4>{{ resource.title }}</h4>
        <p class="resource-description">
          {{ resource.description.substring(0, 100) }}...
        </p>
        <div class="resource-meta">
          <span class="category">{{ resource.category }}</span>
          <span class="pricing">{{ resource.pricingModel }}</span>
        </div>
      </div>

      <div v-if="selectedResources.length === 0" class="no-resources">
        <p>No resources selected for comparison</p>
      </div>
    </div>

    <div class="card-actions">
      <button
        class="compare-btn"
        :class="{ disabled: comparisonCount < 2 }"
        @click="$emit('openComparison')"
      >
        Compare {{ comparisonCount > 0 ? `(${comparisonCount})` : '' }}
      </button>

      <button
        class="clear-btn"
        v-if="comparisonCount > 0"
        @click="$emit('clearComparison')"
      >
        Clear
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Resource } from '~/types/resource'
import { computed } from 'vue'

interface Props {
  selectedResources: Resource[]
}

const props = defineProps<Props>()

interface Emits {
  (e: 'openComparison'): void
  (e: 'clearComparison'): void
}

defineEmits<Emits>()

const comparisonCount = computed(() => props.selectedResources.length)
</script>

<style scoped>
.comparison-card {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.card-header h3 {
  margin: 0;
  color: #333;
}

.comparison-count {
  font-size: 0.9rem;
  color: #666;
}

.comparison-resources {
  margin-bottom: 1.5rem;
}

.resource-preview {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.resource-preview:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.resource-preview h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1rem;
}

.resource-description {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.resource-meta {
  display: flex;
  gap: 1rem;
}

.category,
.pricing {
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background-color: #f5f5f5;
  color: #666;
}

.no-resources {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 1rem 0;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.compare-btn,
.clear-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.compare-btn {
  background-color: #007acc;
  color: white;
  flex: 1;
}

.compare-btn:hover:not(.disabled) {
  background-color: #005a9e;
}

.compare-btn.disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.clear-btn {
  background-color: #f44336;
  color: white;
}

.clear-btn:hover {
  background-color: #d32f2f;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .card-actions {
    flex-direction: column;
  }
}
</style>
