<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group"
  >
    <div v-if="icon" class="p-4 flex justify-center">
      <OptimizedImage
        :src="icon"
        :alt="title"
        width="64"
        height="64"
        class="w-16 h-16 object-contain"
        @error="handleImageError"
      />
    </div>
    <div class="p-6">
      <div class="flex items-center justify-between">
        <h3
          class="text-lg font-medium text-gray-900 dark:text-gray-100 truncate"
        >
          <a
            :href="url"
            :target="newTab ? '_blank' : '_self'"
            class="hover:underline"
            @click="trackResourceClick"
            rel="noopener noreferrer"
          >
            {{ highlightedTitle ? sanitizeAndHighlight(highlightedTitle, searchQuery) : title }}
          </a>
        </h3>
        <!-- Resource status badge -->
        <ResourceStatus
          v-if="status"
          :status="status"
          :health-score="healthScore"
        />
      </div>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
        {{ highlightedDescription ? sanitizeAndHighlight(highlightedDescription, searchQuery) : description }}
      </p>
      <div class="mt-3">
        <ul class="list-disc pl-5 text-sm text-gray-500 dark:text-gray-400 space-y-1 max-h-20 overflow-y-auto">
          <li v-for="(benefit, index) in benefits" :key="index">
            {{ benefit }}
          </li>
        </ul>
      </div>
      
      <!-- Similarity information (for alternative suggestions) -->
      <div v-if="similarityScore && similarityScore > 0" class="mt-3">
        <div class="flex items-center">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-600 h-2 rounded-full"
              :style="{ width: similarityScore + '%' }"
            ></div>
          </div>
          <span class="ml-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            {{ similarityScore }}% match
          </span>
        </div>
        <p v-if="similarityReason" class="mt-1 text-xs text-gray-600">
          {{ similarityReason }}
        </p>
      </div>
      
      <div class="mt-4 flex items-center justify-between">
        <a
          :href="url"
          :target="newTab ? '_blank' : '_self'"
          :class="[
            'inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
            { 'cursor-pointer': !selectedResources.includes(title) }
          ]"
          @click="trackResourceClick"
          rel="noopener noreferrer"
        >
          {{ buttonLabel }}
          <svg
            class="ml-1 -mr-1 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
        <div class="flex space-x-2">
          <BookmarkButton :resource="resourceData" />
          <ShareButton :resource="resourceData" />
          <!-- Compare button -->
          <button
            v-if="id"
            @click="addResourceToComparison"
            class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :aria-label="`Add ${title} to comparison`"
            title="Add to comparison"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fill-rule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead, useRuntimeConfig } from '#imports'
import { useResourceComparison } from '~/composables/useResourceComparison'
import OptimizedImage from '~/components/OptimizedImage.vue'
import BookmarkButton from '~/components/BookmarkButton.vue'
import ShareButton from '~/components/ShareButton.vue'
import ResourceStatus from '~/components/ResourceStatus.vue'
import { trackResourceView, trackResourceClick } from '~/utils/analytics'
import { sanitizeAndHighlight } from '~/utils/sanitize'

interface Props {
  title: string
  description: string
  benefits: readonly string[]
  url: string
  category?: string
  pricingModel?: string
  difficulty?: string
  tags?: readonly string[]
  technology?: readonly string[]
  newTab?: boolean
  buttonLabel?: string
  highlightedTitle?: string
  highlightedDescription?: string
  icon?: string
  searchQuery?: string
  similarityScore?: number
  similarityReason?: string
  status?: string
  healthScore?: number
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  buttonLabel: 'Get Free Access',
  highlightedTitle: undefined,
  highlightedDescription: undefined,
  icon: undefined,
  searchQuery: '',
  status: 'active',
  healthScore: undefined,
  id: undefined
})

const hasError = ref(false)

// Track resource view when component mounts
onMounted(() => {
  trackResourceView(props.title)
})

// Get the comparison composable
const { addResource, selectedResources } = useResourceComparison()

// Create a resource data object for sharing and bookmarking
const resourceData = computed(() => ({
  id: props.id || `${props.title}-${props.url}`, // Create a unique ID
  title: props.title,
  description: props.description,
  benefits: props.benefits,
  url: props.url,
  category: props.category,
  pricingModel: props.pricingModel,
  difficulty: props.difficulty,
  tags: props.tags || [],
  technology: props.technology || [],
  icon: props.icon
}))

// Add to comparison if not already added
const addResourceToComparison = () => {
  if (props.id && !selectedResources.value.includes(props.id)) {
    addResource(props.id)
  }
}

const handleImageError = (event: Event) => {
  hasError.value = true
  console.error('Failed to load image', event)
}
</script>

<style scoped>
.status-badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.status-pending {
  @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100;
}

.status-approved {
  @apply bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100;
}

.status-rejected {
  @apply bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100;
}

.status-deprecated {
  @apply bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100;
}
</style>