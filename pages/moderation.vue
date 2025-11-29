<template>
  <div class="moderation-page">
    <ModerationDashboard />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth'], // In a real implementation, require moderator role
})

useHead({
  title: 'Moderation Dashboard',
  meta: [
    {
      name: 'description',
      content: 'Content moderation and approval workflow system',
    },
  ],
})
</script>

<style scoped>
.moderation-page {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
