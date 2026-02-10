<template>
  <div class="max-w-[1200px] mx-auto p-4">
    <ModerationDashboard />
  </div>
</template>

<script setup lang="ts">
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
