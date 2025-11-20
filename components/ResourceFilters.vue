<template>
  <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium text-gray-900">Filters</h3>
      <button
        @click="onResetFilters"
        class="text-sm text-gray-600 hover:text-gray-900"
      >
        Reset all
      </button>
    </div>

    <!-- Category Filter -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Category</h4>
      <div class="space-y-2 max-h-40 overflow-y-auto">
        <label
          v-for="category in categories"
          :key="category"
          class="flex items-center"
        >
          <input
            type="checkbox"
            :value="category"
            :checked="selectedCategories.includes(category)"
            @change="toggleCategory(category)"
            class="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
          />
          <span class="ml-2 text-sm text-gray-700">{{ category }}</span>
        </label>
      </div>
    </div>

    <!-- Pricing Model Filter -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Pricing Model</h4>
      <div class="space-y-2 max-h-40 overflow-y-auto">
        <label
          v-for="pricingModel in pricingModels"
          :key="pricingModel"
          class="flex items-center"
        >
          <input
            type="checkbox"
            :value="pricingModel"
            :checked="selectedPricingModels.includes(pricingModel)"
            @change="togglePricingModel(pricingModel)"
            class="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
          />
          <span class="ml-2 text-sm text-gray-700">{{ pricingModel }}</span>
        </label>
      </div>
    </div>

    <!-- Difficulty Level Filter -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Difficulty</h4>
      <div class="space-y-2 max-h-40 overflow-y-auto">
        <label
          v-for="difficulty in difficultyLevels"
          :key="difficulty"
          class="flex items-center"
        >
          <input
            type="checkbox"
            :value="difficulty"
            :checked="selectedDifficultyLevels.includes(difficulty)"
            @change="toggleDifficultyLevel(difficulty)"
            class="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
          />
          <span class="ml-2 text-sm text-gray-700">{{ difficulty }}</span>
        </label>
      </div>
    </div>

    <!-- Technology Filter -->
    <div>
      <h4 class="text-sm font-medium text-gray-900 mb-3">Technology</h4>
      <div class="space-y-2 max-h-40 overflow-y-auto">
        <label
          v-for="technology in technologies"
          :key="technology"
          class="flex items-center"
        >
          <input
            type="checkbox"
            :value="technology"
            :checked="selectedTechnologies.includes(technology)"
            @change="toggleTechnology(technology)"
            class="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
          />
          <span class="ml-2 text-sm text-gray-700">{{ technology }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  categories: string[]
  pricingModels: string[]
  difficultyLevels: string[]
  technologies: string[]
  selectedCategories: string[]
  selectedPricingModels: string[]
  selectedDifficultyLevels: string[]
  selectedTechnologies: string[]
}

interface Emits {
  (e: 'toggle-category', category: string): void
  (e: 'toggle-pricing-model', pricingModel: string): void
  (e: 'toggle-difficulty-level', difficulty: string): void
  (e: 'toggle-technology', technology: string): void
  (e: 'reset-filters'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toggleCategory = (category: string) => {
  emit('toggle-category', category)
}

const togglePricingModel = (pricingModel: string) => {
  emit('toggle-pricing-model', pricingModel)
}

const toggleDifficultyLevel = (difficulty: string) => {
  emit('toggle-difficulty-level', difficulty)
}

const toggleTechnology = (technology: string) => {
  emit('toggle-technology', technology)
}

const onResetFilters = () => {
  emit('reset-filters')
}
</script>
