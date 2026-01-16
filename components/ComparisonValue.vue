<template>
  <div class="text-center">
    <template v-if="type === 'text'">
      <span
        v-if="value"
        class="text-sm"
      >{{ value }}</span>
      <span
        v-else
        class="text-gray-400 dark:text-gray-500 text-sm"
      >-</span>
    </template>

    <template v-else-if="type === 'number'">
      <span
        v-if="value !== undefined && value !== null"
        class="text-sm"
      >{{
        value
      }}</span>
      <span
        v-else
        class="text-gray-400 dark:text-gray-500 text-sm"
      >-</span>
    </template>

    <template v-else-if="type === 'boolean'">
      <span
        v-if="value === true"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
      >
        Yes
      </span>
      <span
        v-else-if="value === false"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
      >
        No
      </span>
      <span
        v-else
        class="text-gray-400 dark:text-gray-500 text-sm"
      >-</span>
    </template>

    <template v-else-if="type === 'list'">
      <div
        v-if="Array.isArray(value) && value.length > 0"
        class="flex flex-wrap justify-center gap-1"
      >
        <span
          v-for="(item, index) in displayItems"
          :key="index"
          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
        >
          {{ item }}
        </span>
        <span
          v-if="hasMoreItems"
          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
        >
          +{{ value.length - 3 }} more
        </span>
      </div>
      <span
        v-else
        class="text-gray-400 dark:text-gray-500 text-sm"
      >-</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value?: string | number | boolean | string[]
  type?: 'text' | 'number' | 'boolean' | 'list'
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
  type: 'text',
})

const displayItems = computed(() => {
  if (!Array.isArray(props.value)) return []
  return props.value.slice(0, 3)
})

const hasMoreItems = computed(() => {
  return Array.isArray(props.value) && props.value.length > 3
})
</script>
