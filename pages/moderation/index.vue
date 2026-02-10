<template>
  <div class="moderation-page">
    <ModerationDashboard />
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
  title: 'Moderation Dashboard - Resource Directory',
  meta: [
    {
      name: 'description',
      content: 'Content moderation dashboard for resource directory',
    },
  ],
})
</script>

<style scoped>
.moderation-page {
  max-width: v-bind(containerMaxWidth);
  margin: 0 auto;
  padding: v-bind(containerPadding);
}
</style>
