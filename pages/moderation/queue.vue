<template>
  <div class="max-w-[1200px] mx-auto p-4">
    <h1>Moderation Queue</h1>
    <ReviewQueue />
  </div>
</template>

<script setup lang="ts">
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
