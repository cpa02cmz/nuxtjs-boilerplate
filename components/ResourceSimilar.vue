<template>
  <div
    v-if="resources && resources.length > 0"
    class="mt-12"
  >
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">
        {{ contentConfig.similarResources.title }}
      </h2>
      <NuxtLink
        to="/"
        class="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        {{ contentConfig.similarResources.viewAll }}
      </NuxtLink>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <LazyResourceCard
        v-for="resource in resources"
        :key="resource.id"
        :title="resource.title"
        :description="resource.description"
        :benefits="[...resource.benefits]"
        :url="resource.url"
        :button-label="getButtonLabel(resource.category)"
        :date-added="resource.dateAdded"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Resource } from '~/composables/useResources'
import { contentConfig } from '~/configs/content.config'

interface Props {
  resources: Resource[]
}

defineProps<Props>()

const getButtonLabel = (category: string) => {
  type CategoryKey = keyof typeof contentConfig.similarResources.categoryLabels
  return (
    contentConfig.similarResources.categoryLabels[category as CategoryKey] ||
    contentConfig.similarResources.defaultButtonLabel
  )
}
</script>
