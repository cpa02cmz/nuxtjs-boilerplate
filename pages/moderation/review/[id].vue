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
import { contentConfig } from '~/configs/content.config'

const route = useRoute()
const submissionId = computed(() => route.params.id as string)

definePageMeta({
  layout: 'default',
  middleware: ['auth'], // In a real app, this would require moderation permissions
})

useHead({
  title: 'Review Submission - Resource Directory',
  meta: [
    {
      name: 'description',
      content: contentConfig.moderation.review.description,
    },
  ],
})
</script>

<style scoped>
/* Flexy hates hardcoded values! Using configurable container width from uiConfig */
.submission-review-page {
  max-width: v-bind('uiConfig.containers.admin');
  margin: 0 auto;
  padding: v-bind('`${uiConfig.layout.spacing.lg}rem`');
}

.back-link {
  display: inline-block;
  margin-bottom: v-bind('`${uiConfig.layout.spacing.md}rem`');
  color: var(--color-primary);
  text-decoration: none;
  padding: v-bind('`${uiConfig.layout.spacing.sm}rem`');
}

.back-link:hover {
  text-decoration: underline;
}
</style>
