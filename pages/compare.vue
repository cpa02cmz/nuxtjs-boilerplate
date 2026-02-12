<template>
  <ClientErrorBoundary component-name="ComparePage">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Confetti celebration when reaching max comparison limit -->
      <ConfettiCelebration
        ref="confettiRef"
        intensity="heavy"
      />
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ contentConfig.comparePage.title }}
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          {{ contentConfig.comparePage.subtitle }}
        </p>
      </div>

      <ComparisonBuilder
        :selected-resources="selectedResources"
        :max-resources="maxResources"
        @remove-resource="removeResource"
        @clear-comparison="clearComparison"
        @share-comparison="shareComparison"
        @browse-resources="browseResources"
      />
    </div>
  </ClientErrorBoundary>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useResourceComparison } from '~/composables/useResourceComparison'
import { useNuxtApp } from '#app'
import logger from '~/utils/logger'
import ComparisonBuilder from '~/components/ComparisonBuilder.vue'
import ConfettiCelebration from '~/components/ConfettiCelebration.vue'
import { limitsConfig } from '~/configs/limits.config'
import { animationConfig } from '~/configs/animation.config'
import { ROUTE_PATTERNS } from '~/configs/routes.config'
import { contentConfig } from '~/configs/content.config'

// Use the comparison composable
const { selectedResources, removeResource, clearComparison } =
  useResourceComparison()

const confettiRef = ref<InstanceType<typeof ConfettiCelebration> | null>(null)
const hasCelebratedMaxComparison = ref(false)

// Use config for max resources - Flexy hates hardcoded values!
const maxResources = limitsConfig.comparison.maxResources

// Watch for reaching maximum comparison limit
watch(
  () => selectedResources.value.length,
  newCount => {
    if (newCount === maxResources && !hasCelebratedMaxComparison.value) {
      // Trigger confetti celebration when reaching max - Palette's delightful touch!
      setTimeout(() => {
        confettiRef.value?.celebrate()
      }, animationConfig.confetti.comparisonDelayMs)
      hasCelebratedMaxComparison.value = true
    } else if (newCount < maxResources) {
      // Reset celebration flag when below max
      hasCelebratedMaxComparison.value = false
    }
  }
)

// Page metadata - Flexy hates hardcoded SEO!
useSeoMeta({
  title: contentConfig.comparePage.seo.title,
  description: contentConfig.comparePage.seo.description,
  ogTitle: contentConfig.comparePage.title,
  ogDescription: contentConfig.comparePage.seo.description,
  ogType: 'website',
  ogUrl: ROUTE_PATTERNS.pages.compare,
})

// Methods
const shareComparison = () => {
  // Guard: only run on client-side
  if (!process.client) return

  // Create a shareable URL with the selected resources
  const resourceIds = selectedResources.value.map(r => r.id).join(',')
  const shareUrl = `${window.location.origin}/compare/${resourceIds}`

  // Copy to clipboard
  navigator.clipboard
    .writeText(shareUrl)
    .then(() => {
      // Show success notification using the toast client plugin
      const nuxtApp = useNuxtApp()
      nuxtApp.$toast.success(contentConfig.toast.comparison.copied.title)
    })
    .catch(err => {
      logger.error('Failed to copy URL: ', err)
    })
}

const browseResources = () => {
  // Navigate to search page - Flexy hates hardcoded routes!
  navigateTo(ROUTE_PATTERNS.pages.search)
}
</script>
