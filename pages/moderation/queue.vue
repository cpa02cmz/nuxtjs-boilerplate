<template>
  <div class="moderation-queue-page">
    <h1>Moderation Queue</h1>
    <ReviewQueue />
  </div>
</template>

<script setup lang="ts">
import { uiConfig } from '~/configs/ui.config'

// Flexy hates hardcoded values! Using config
const containerMaxWidth = uiConfig.layout.container.maxWidth
const containerPadding = uiConfig.layout.container.padding

definePageMeta({
  layout: 'default',
  middleware: ['auth'], // In a real app, this would require moderation permissions
})

useHead({
  title: 'Moderation Queue - Resource Directory',
  meta: [
    { name: 'description', content: 'Review pending resource submissions' },
  ],
})
</script>

<style scoped>
.moderation-queue-page {
  max-width: v-bind(containerMaxWidth);
  margin: 0 auto;
  padding: v-bind(containerPadding);
}
</style>
