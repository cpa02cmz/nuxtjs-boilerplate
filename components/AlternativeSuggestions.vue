<template>
  <div v-if="alternatives.length > 0" class="mt-12">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">
      Alternative Suggestions
    </h2>
    <p class="text-gray-600 mb-6">
      Users who viewed this resource also found these alternatives useful
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AlternativeCard
        v-for="alternative in alternatives"
        :key="alternative.resource.id"
        :title="alternative.resource.title"
        :description="alternative.resource.description"
        :benefits="alternative.resource.benefits"
        :url="alternative.resource.url"
        :button-label="getButtonLabel(alternative.resource.category)"
        :rating="alternative.resource.rating"
        :popularity="alternative.resource.popularity"
        :tags="alternative.resource.tags"
        :technology="alternative.resource.technology"
        :show-bookmark="true"
        :show-similarity="true"
        :similarity-score="alternative.similarityScore"
        :similarity-factors="alternative.similarityFactors"
        @bookmark="handleBookmark(alternative.resource)"
      />
    </div>

    <!-- Show more button if there are more alternatives than displayed -->
    <div v-if="hasMoreAlternatives" class="mt-6 flex justify-center">
      <button
        class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
        @click="loadMore"
      >
        Show More Alternatives
        <svg
          class="ml-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>
  </div>
  <div v-else-if="!isLoading" class="mt-12 text-center">
    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
      No alternatives found
    </h3>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
      We couldn't find any alternatives for this resource yet.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import AlternativeCard from './AlternativeCard.vue'
import { useAlternativeSuggestions } from '~/composables/useAlternativeSuggestions'
import { useResourceData } from '~/composables/useResourceData'
import { useBookmarks } from '~/composables/useBookmarks'
import type { Resource } from '~/types/resource'
import type { AlternativeSuggestion } from '~/composables/useAlternativeSuggestions'

interface Props {
  resource: Resource
}

const props = withDefaults(defineProps<Props>(), {
  resource: () => ({} as Resource)
})

const { alternatives, isLoading, fetchAlternatives } = useAlternativeSuggestions()
const { toggleBookmark } = useBookmarks()

// Additional state for pagination
const maxDisplay = ref(6)
const displayCount = computed(() => Math.min(maxDisplay.value, alternatives.value.length))
const hasMoreAlternatives = computed(() => alternatives.value.length > maxDisplay.value)

const displayedAlternatives = computed(() => 
  alternatives.value.slice(0, displayCount.value)
)

// Update the alternatives reference to use the sliced array
const alternativesRef = computed(() => displayedAlternatives.value)

onMounted(() => {
  initAlternatives()
})

// Initialize alternatives when the resource prop changes
watch(
  () => props.resource,
  () => {
    initAlternatives()
  }
)

const initAlternatives = async () => {
  if (props.resource.id) {
    await fetchAlternatives(props.resource.id)
  }
}

const handleBookmark = (resource: Resource) => {
  toggleBookmark(resource)
}

// Get appropriate button label based on category
const getButtonLabel = (category: string) => {
  if (!category) return 'Get Free Access'
  
  const categoryMap: Record<string, string> = {
    'ai-tool': 'Try Tool',
    'ai-model': 'Use Model',
    'ai-platform': 'Access Platform',
    'ai-service': 'Use Service',
    'ai-research': 'Read Paper',
    'ai-course': 'Start Learning',
    'ai-book': 'Read Book'
  }
  
  return categoryMap[category.toLowerCase()] || 'Get Free Access'
}

const loadMore = () => {
  maxDisplay.value += 6 // Load 6 more items
}
</script>