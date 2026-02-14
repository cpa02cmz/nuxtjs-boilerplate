<template>
  <div
    ref="cardRef"
    class="lazy-resource-card-wrapper"
  >
    <!-- Skeleton loader shown while not intersecting -->
    <ResourceCardSkeleton v-if="!isIntersecting && !isLoaded" />

    <!-- Actual card shown when intersecting -->
    <ResourceCard
      v-else
      v-bind="$props"
      @visited="handleVisited"
      @error="handleError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useIntersectionObserver } from '~/composables/useIntersectionObserver'
import ResourceCard from './ResourceCard.vue'
import ResourceCardSkeleton from './ResourceCardSkeleton.vue'

interface Props {
  title: string
  description: string
  benefits: string[]
  url: string
  id?: string
  category?: string
  icon?: string
  newTab?: boolean
  buttonLabel?: string
  highlightedTitle?: string
  highlightedDescription?: string
  searchQuery?: string
  similarityScore?: number
  similarityReason?: string
  status?: string
  healthScore?: number
  dateAdded?: string
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'visited', id: string): void
  (e: 'error', error: Error): void
}>()

const cardRef = ref<HTMLElement | null>(null)

const { isIntersecting, isLoaded, observe } = useIntersectionObserver({
  rootMargin: '100px', // Start loading 100px before it comes into view
  threshold: 0.1, // Trigger when 10% of the element is visible
})

onMounted(() => {
  if (cardRef.value) {
    observe(cardRef.value)
  }
})

const handleVisited = (id: string) => {
  emit('visited', id)
}

const handleError = (error: Error) => {
  emit('error', error)
}
</script>

<style scoped>
.lazy-resource-card-wrapper {
  min-height: 200px; /* Reserve space to prevent layout shift */
}
</style>
