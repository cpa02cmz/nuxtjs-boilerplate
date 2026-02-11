<template>
  <div class="moderation-queue-page">
    <h1>Moderation Queue</h1>
    <ReviewQueue />
  </div>
</template>

<script setup lang="ts">
import { uiConfig } from '~/configs/ui.config'

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
/* Flexy hates hardcoded values! Using configurable container width from uiConfig */
.moderation-queue-page {
  max-width: v-bind('uiConfig.containers.admin');
  margin: 0 auto;
  padding: v-bind('`${uiConfig.layout.spacing.lg}rem`');
}
</style>
