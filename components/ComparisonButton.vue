<template>
  <button
    :class="['comparison-btn', { 'in-comparison': isInComparison }]"
    :disabled="disabled"
    @click="toggleComparison"
    :aria-label="ariaLabel"
    :title="ariaLabel"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="icon"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    </svg>
    <span v-if="!isInComparison">Compare</span>
    <span v-else>✓ Compared</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useResourceComparison } from '~/composables/useResourceComparison'

interface Props {
  resourceId: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

// Composables
const {
  isInComparison: checkIsInComparison,
  addResourceToComparison,
  removeResourceFromComparison,
  canAddMoreResources,
} = useResourceComparison()

// Computed properties
const isInComparison = computed(() => checkIsInComparison(props.resourceId))
const ariaLabel = computed(() =>
  isInComparison.value ? 'Remove from comparison' : 'Add to comparison'
)

// Methods
const toggleComparison = () => {
  if (isInComparison.value) {
    removeResourceFromComparison(props.resourceId)
  } else {
    if (canAddMoreResources.value) {
      addResourceToComparison(props.resourceId)
    } else {
      alert('You can only compare up to 4 resources at a time.')
    }
  }
}
</script>

<style scoped>
.comparison-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
}

.comparison-btn:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.comparison-btn:focus {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.comparison-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.comparison-btn.in-comparison {
  background-color: #d1fae5;
  border-color: #10b981;
  color: #065f46;
}

.comparison-btn.in-comparison:hover:not(:disabled) {
  background-color: #a7f3d0;
}

.icon {
  width: 1rem;
  height: 1rem;
}
</style>
