<template>
  <div class="flex flex-col sm:flex-row sm:items-center gap-4">
    <div class="text-sm text-gray-700">
      <span class="font-medium">{{ totalResources }}</span> resources found
    </div>
    <div class="flex items-center space-x-2">
      <label for="sort" class="text-sm text-gray-700">Sort by:</label>
      <select
        id="sort"
        :value="selectedSortOption"
        @change="handleChange"
        class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-800 focus:border-transparent sm:text-sm rounded-md"
      >
        <option value="popularity-desc">Most Popular</option>
        <option value="alphabetical-asc">A-Z</option>
        <option value="alphabetical-desc">Z-A</option>
        <option value="date-added-desc">Newest First</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  selectedSortOption: string
  totalResources: number
}

interface Emits {
  (e: 'update-sort-option', option: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update-sort-option', target.value)
}
</script>
