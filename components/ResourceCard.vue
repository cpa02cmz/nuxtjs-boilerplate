<!-- eslint-disable vue/no-v-html -->
<template>
  <ResourceCardBase
    :id="id"
    :title="title"
    :description="description"
    :benefits="benefits"
    :url="url"
    :category="category"
    :icon="icon"
    :new-tab="newTab"
    :button-label="buttonLabel"
    :highlighted-title="highlightedTitle"
    :highlighted-description="highlightedDescription"
    :search-query="searchQuery"
    :similarity-score="similarityScore"
    :similarity-reason="similarityReason"
    :status="status"
    :health-score="healthScore"
    :date-added="dateAdded"
    @visited="handleVisited"
    @error="handleError"
  >
    <template #actions>
      <ResourceCardActions
        :id="id"
        :title="title"
        :description="description"
        :url="url"
        :category="category"
        :benefits="benefits"
        :date-added="dateAdded"
      />
    </template>
  </ResourceCardBase>
</template>

<script setup lang="ts">
import ResourceCardBase from './ResourceCard/ResourceCardBase.vue'
import ResourceCardActions from './ResourceCard/ResourceCardActions.vue'
import { uiConfig } from '~/configs/ui.config'

interface Props {
  title: string
  description: string
  benefits: readonly string[]
  url: string
  id?: string
  category?: string
  icon?: string
  newTab?: boolean
  buttonLabel?: string
  highlightedTitle?: string
  highlightedDescription?: string
  searchQuery?: string
  similarityScore?: number
  similarityReason?: string
  status?: string
  healthScore?: number
  dateAdded?: string
}

withDefaults(defineProps<Props>(), {
  id: undefined,
  category: 'unknown',
  newTab: true,
  buttonLabel: uiConfig.resourceCard.defaultButtonLabel,
  highlightedTitle: undefined,
  highlightedDescription: undefined,
  icon: undefined,
  searchQuery: '',
  status: 'active',
  healthScore: undefined,
  similarityScore: undefined,
  similarityReason: undefined,
  dateAdded: undefined,
})

const emit = defineEmits<{
  (e: 'visited', id: string): void
  (e: 'error', error: Error): void
}>()

const handleVisited = (id: string) => {
  emit('visited', id)
}

const handleError = (error: Error) => {
  emit('error', error)
}
</script>
