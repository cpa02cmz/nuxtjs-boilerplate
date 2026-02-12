<template>
  <div class="py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          {{ contentConfig.aiKeysPage.title }}
        </h1>
        <p class="mt-4 text-xl text-gray-500">
          {{ contentConfig.aiKeysPage.subtitle }}
        </p>
      </div>

      <!-- Search Bar -->
      <div class="mb-8">
        <LazySearchBar
          v-model="searchQuery"
          @search="handleSearch"
        />
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex justify-center items-center py-12"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"
          role="status"
          :aria-label="contentConfig.aiKeysPage.loading.ariaLabel"
        />
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="text-center py-12"
      >
        <p class="text-red-600 text-lg">
          Error loading resources: {{ error }}
        </p>
      </div>

      <!-- Resources Grid -->
      <div v-else>
        <!-- Category Filters -->
        <div class="flex flex-wrap gap-2 mb-8">
          <button
            v-for="category in categories"
            :key="category"
            :class="[
              'px-3 py-1 text-sm rounded-full border',
              selectedCategories.includes(category)
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
            ]"
            @click="toggleCategory(category)"
          >
            {{ category }}
          </button>
        </div>

        <!-- Results Info -->
        <div class="flex justify-between items-center mb-6">
          <ResourceSort
            :selected-sort-option="sortOption"
            :total-resources="filteredResources.length"
            @update-sort-option="setSortOption"
          />
        </div>

        <!-- AI Resources Only -->
        <div class="space-y-8">
          <LazyResourceCard
            v-for="resource in aiResources"
            :id="resource.id"
            :key="resource.id"
            :title="resource.title"
            :description="resource.description"
            :benefits="resource.benefits"
            :url="resource.url"
            :button-label="getButtonLabel(resource.category)"
            :date-added="resource.dateAdded"
          />
        </div>

        <!-- No Results Message -->
        <div
          v-if="!hasAIResources && !loading"
          class="text-center py-12"
        >
          <h3 class="text-xl font-medium text-gray-900 mb-2">
            {{ contentConfig.aiKeysPage.emptyState.title }}
          </h3>
          <p class="text-gray-500 mb-6">
            {{ contentConfig.aiKeysPage.emptyState.description }}
          </p>
          <button
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900"
            @click="resetAllFilters"
          >
            {{ contentConfig.aiKeysPage.emptyState.resetButton }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAIResources } from '~/composables/useAIResources'
import { useUrlSync } from '~/composables/useUrlSync'
import ResourceSort from '~/components/ResourceSort.vue'
import { DEFAULT_DEV_URL } from '~/configs/url.config'
import { contentConfig } from '~/configs/content.config'

definePageMeta({
  layout: 'default',
})

const runtimeConfig = useRuntimeConfig()
useSeoMeta({
  title: contentConfig.aiKeysPage.seo.title,
  ogTitle: contentConfig.aiKeysPage.seo.title,
  description: contentConfig.aiKeysPage.seo.description,
  ogDescription: contentConfig.aiKeysPage.seo.description,
  ogImage: '/og-image.jpg',
  ogUrl: `${runtimeConfig.public.siteUrl || runtimeConfig.public.canonicalUrl || DEFAULT_DEV_URL}/ai-keys`,
  twitterCard: 'summary_large_image',
})

const {
  aiResources,
  filteredResources,
  hasAIResources,
  loading,
  error,
  categories,
  filterOptions,
  sortOption,
  updateSearchQuery,
  toggleCategory,
  setSortOption,
  resetFilters,
} = useAIResources()

useUrlSync(filterOptions, sortOption)

const searchQuery = computed({
  get: () => filterOptions.value.searchQuery || '',
  set: value => updateSearchQuery(value),
})

const selectedCategories = computed(() => filterOptions.value.categories || [])

const handleSearch = (query: string) => {
  updateSearchQuery(query)
}

const resetAllFilters = () => {
  resetFilters()
  searchQuery.value = ''
}

// Flexy hates hardcoded button labels! Use config instead
const getButtonLabel = (category: string) => {
  const labels = contentConfig.aiKeysPage.buttonLabels
  switch (category.toLowerCase()) {
    case 'ai tools':
      return labels.exploreAITools
    case 'vps':
      return labels.getVPS
    case 'web hosting':
      return labels.findHosting
    case 'databases':
      return labels.exploreDatabases
    case 'cdn':
      return labels.getCDN
    default:
      return labels.default
  }
}
</script>
