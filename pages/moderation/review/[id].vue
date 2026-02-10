<template>
  <div class="submission-review-page">
    <NuxtLink
      to="/moderation/queue"
      class="back-link"
    >
      ← Back to Queue
    </NuxtLink>
    <SubmissionReview :submission-id="submissionId" />
  </div>
</template>

<script setup lang="ts">
import { uiConfig } from '~/configs/ui.config'

const route = useRoute()
const submissionId = computed(() => route.params.id as string)

// Flexy hates hardcoded values! Using config
const containerMaxWidth = uiConfig.layout.container.maxWidth
const containerPadding = uiConfig.layout.container.padding

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

<style scoped>
.submission-review-page {
  max-width: v-bind(containerMaxWidth);
  margin: 0 auto;
  padding: v-bind(containerPadding);
}

.back-link {
  display: inline-block;
  margin-bottom: 1rem;
  color: var(--color-primary);
  text-decoration: none;
  padding: 0.5rem;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
