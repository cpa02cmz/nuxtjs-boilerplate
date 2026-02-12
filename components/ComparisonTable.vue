<template>
  <div
    v-if="resources && resources.length >= 2"
    class="overflow-x-auto"
  >
    <table
      class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
      :aria-label="`Comparison of ${resources.length} resources`"
    >
      <thead class="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            {{ contentConfig.comparison.headers.criteria }}
          </th>
          <th
            v-for="(resource, index) in resources"
            :key="`header-${index}`"
            scope="col"
            class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            <div class="flex flex-col items-center">
              <div class="font-bold text-sm">
                {{ resource.title }}
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-500">
                {{ resource.category }}
              </div>
              <Transition
                enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition-all duration-150 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
                mode="out-in"
              >
                <div
                  v-if="confirmingRemove === resource.id"
                  key="confirmation"
                  class="mt-1 flex flex-col items-center space-y-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-2 py-1"
                  role="alert"
                  aria-live="polite"
                >
                  <span
                    class="text-xs text-red-700 dark:text-red-400 font-medium"
                  >
                    {{ contentConfig.comparison.actions.removeConfirm }}
                  </span>
                  <div class="flex space-x-1">
                    <button
                      class="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 px-1.5 py-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 transition-colors"
                      @click="cancelRemove"
                    >
                      {{ contentConfig.comparison.actions.cancel }}
                    </button>
                    <button
                      class="text-xs text-red-700 dark:text-red-400 font-medium px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 transition-colors"
                      @click="confirmRemove(resource.id)"
                    >
                      {{ contentConfig.comparison.actions.yes }}
                    </button>
                  </div>
                </div>
                <button
                  v-else
                  key="remove-button"
                  class="mt-1 text-red-500 hover:text-red-700 text-xs flex items-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:rounded"
                  :aria-label="`Remove ${resource.title} from comparison`"
                  @click="requestRemove(resource.id)"
                >
                  <svg
                    class="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  {{ contentConfig.comparison.actions.remove }}
                </button>
              </Transition>
            </div>
          </th>
        </tr>
      </thead>
      <tbody
        class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700"
      >
        <tr
          v-for="criterion in criteria"
          :key="criterion.id"
          class="hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <td
            class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
          >
            {{ criterion.name }}
          </td>
          <td
            v-for="(resource, index) in resources"
            :key="`data-${index}-${criterion.id}`"
            class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 text-center"
          >
            <div class="flex justify-center">
              <LazyComparisonValue
                :value="getResourceValue(resource, criterion.id)"
                :type="criterion.type"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div
    v-else
    class="text-center py-8 text-gray-500 dark:text-gray-400"
  >
    <svg
      class="mx-auto h-12 w-12 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
    <h3 class="mt-2 text-sm font-medium">
      {{ contentConfig.comparison.emptyState.title }}
    </h3>
    <p class="mt-1 text-sm">
      {{ contentConfig.comparison.emptyState.description }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Resource } from '~/types/resource'
import type { ComparisonCriteria } from '~/types/comparison'
import { contentConfig } from '~/configs/content.config'

interface Props {
  resources?: Resource[]
  criteria?: ComparisonCriteria[]
}

defineProps<Props>()
const emit = defineEmits(['remove-resource'])

// Track which resource is being confirmed for removal
const confirmingRemove = ref<string | null>(null)

const requestRemove = (resourceId: string) => {
  confirmingRemove.value = resourceId
}

const cancelRemove = () => {
  confirmingRemove.value = null
}

const confirmRemove = (resourceId: string) => {
  emit('remove-resource', resourceId)
  confirmingRemove.value = null
}

const getResourceValue = (resource: Resource, field: string) => {
  // Handle nested properties
  if (field.includes('.')) {
    const parts = field.split('.')
    let value: unknown = resource
    for (const part of parts) {
      value = (value as Record<string, unknown>)[part]
      if (value === undefined) break
    }
    return value as string | number | boolean
  }

  // Handle direct properties
  return (resource as unknown as Record<string, unknown>)[field] as
    | string
    | number
    | boolean
}
</script>
