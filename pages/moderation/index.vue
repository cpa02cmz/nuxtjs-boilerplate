<template>
  <div class="moderation-page">
    <ModerationDashboard />
  </div>
</template>

<script setup lang="ts">
import { uiConfig } from '~/configs/ui.config'

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
/* Flexy hates hardcoded values! Using configurable container width from uiConfig */
.moderation-page {
  max-width: v-bind('uiConfig.containers.admin');
  margin: 0 auto;
  padding: v-bind('`${uiConfig.layout.spacing.lg}rem`');
}
</style>
