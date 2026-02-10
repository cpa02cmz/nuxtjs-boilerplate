<template>
  <div class="max-w-[1200px] mx-auto p-4">
    <NuxtLink
      to="/moderation/queue"
      class="inline-block mb-4 text-[var(--color-primary)] no-underline p-2 hover:underline"
    >
      ← Back to Queue
    </NuxtLink>
    <SubmissionReview :submission-id="submissionId" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const submissionId = computed(() => route.params.id as string)

definePageMeta({
  layout: 'default',
  middleware: ['auth'], // In a real app, this would require moderation permissions
})

useHead({
  title: 'Review Submission - Resource Directory',
  meta: [
    { name: 'description', content: 'Review and moderate resource submission' },
  ],
})
</script>
