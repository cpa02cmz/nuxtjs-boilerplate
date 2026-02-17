<template>
  <div class="py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 🎨 Pallete's micro-UX: Title with entrance animation -->
      <div class="text-center mb-12">
        <h1
          class="text-3xl font-extrabold text-gray-900 sm:text-4xl ai-keys-title"
          :class="{
            'ai-keys-title--animated': !prefersReducedMotion && isLoaded,
          }"
        >
          Free AI API Keys
        </h1>
        <p
          class="mt-4 text-xl text-gray-500 ai-keys-subtitle"
          :class="{
            'ai-keys-subtitle--animated': !prefersReducedMotion && isLoaded,
          }"
        >
          Access powerful AI models with these free API keys and tools
        </p>
      </div>

      <!-- Search Bar -->
      <div class="mb-8">
        <LazySearchBar v-model="searchQuery" @search="handleSearch" />
      </div>

      <!-- 🎨 Pallete's micro-UX: Enhanced Loading State with skeleton cards -->
      <div v-if="loading" class="space-y-6">
        <div class="flex flex-wrap gap-2 mb-8">
          <div
            v-for="n in 4"
            :key="n"
            class="px-3 py-1 text-sm rounded-full border border-gray-200 bg-gray-100 animate-pulse"
            style="width: 80px; height: 28px"
          />
        </div>
        <div class="space-y-8">
          <ResourceCardSkeleton v-for="n in 3" :key="n" />
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600 text-lg">Error loading resources: {{ error }}</p>
      </div>

      <!-- Resources Grid -->
      <div v-else>
        <!-- 🎨 Pallete's micro-UX: Category Filters with staggered entrance and haptic feedback -->
        <div class="flex flex-wrap gap-2 mb-8">
          <button
            v-for="(category, index) in categories"
            :key="category"
            :class="[
              'category-button px-3 py-1 text-sm rounded-full border transition-all duration-200',
              selectedCategories.includes(category)
                ? 'bg-gray-800 text-white border-gray-800 category-button--selected'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 category-button--unselected',
              !prefersReducedMotion && 'category-button--animated',
            ]"
            :style="getCategoryButtonStyle(index)"
            @click="handleCategoryClick(category)"
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
          <ResourceCardLazy
            v-for="resource in aiResources"
            :id="resource.id"
            :key="resource.id"
            :title="resource.title"
            :description="resource.description"
            :benefits="resource.benefits as string[]"
            :url="resource.url"
            :button-label="getButtonLabel(resource.category)"
            :date-added="resource.dateAdded"
          />
        </div>

        <!-- 🎨 Pallete's micro-UX: Enhanced Empty State with animation -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-2"
        >
          <div
            v-if="!hasAIResources && !loading"
            class="text-center py-12 ai-keys-empty-state"
          >
            <!-- 🎨 Pallete's micro-UX: Animated illustration -->
            <div class="mb-6 relative inline-block" aria-hidden="true">
              <div
                class="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center ai-keys-empty-icon"
                :class="{
                  'ai-keys-empty-icon--animated': !prefersReducedMotion,
                }"
              >
                <svg
                  class="w-10 h-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <!-- Floating dots for visual interest -->
              <div
                v-if="!prefersReducedMotion"
                class="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full ai-keys-float-dot"
              />
              <div
                v-if="!prefersReducedMotion"
                class="absolute -bottom-1 -left-1 w-2 h-2 bg-purple-400 rounded-full ai-keys-float-dot ai-keys-float-dot--delayed"
              />
            </div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">
              No AI resources found
            </h3>
            <p class="text-gray-500 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 transition-all duration-200 ai-keys-reset-button"
              :class="{ 'ai-keys-reset-button--pressed': isResetPressed }"
              @mousedown="isResetPressed = true"
              @mouseup="isResetPressed = false"
              @mouseleave="isResetPressed = false"
              @click="handleResetFilters"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reset Filters
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- 🎨 Pallete's micro-UX: Screen reader announcement -->
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
      {{ announcement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAIResources } from '~/composables/useAIResources'
import { useUrlSync } from '~/composables/useUrlSync'
import ResourceSort from '~/components/ResourceSort.vue'
import ResourceCardSkeleton from '~/components/ResourceCardSkeleton.vue'
import { DEFAULT_DEV_URL } from '~/configs/url.config'
import { animationConfig } from '~/configs/animation.config'
import { hapticLight } from '~/utils/hapticFeedback'

definePageMeta({
  layout: 'default',
})

// 🎨 Pallete's micro-UX enhancement: Reactive state
const isLoaded = ref(false)
const prefersReducedMotion = ref(false)
const announcement = ref('')
const isResetPressed = ref(false)

const runtimeConfig = useRuntimeConfig()
useSeoMeta({
  title: 'Free AI API Keys - Free Stuff on Internet',
  ogTitle: 'Free AI API Keys - Free Stuff on Internet',
  description:
    'Access powerful AI models with these free API keys and tools. Discover OpenAI, Hugging Face, Google AI Studio, and more free AI resources.',
  ogDescription:
    'Access powerful AI models with these free API keys and tools. Discover OpenAI, Hugging Face, Google AI Studio, and more free AI resources.',
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

// 🎨 Pallete's micro-UX enhancement: Check for reduced motion preference
const checkReducedMotion = () => {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// 🎨 Pallete's micro-UX enhancement: Get category button style with stagger delay
const getCategoryButtonStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}

  return {
    '--category-index': index,
    animationDelay: `${animationConfig.aiKeys.categoryStaggerMs * index}ms`,
  }
}

// 🎨 Pallete's micro-UX enhancement: Handle category click with haptic feedback
const handleCategoryClick = (category: string) => {
  // Haptic feedback for mobile users
  hapticLight()

  // Toggle the category
  toggleCategory(category)

  // Announce to screen readers
  const isSelected = selectedCategories.value.includes(category)
  announcement.value = isSelected
    ? `${category} filter removed`
    : `${category} filter added`
  setTimeout(() => {
    announcement.value = ''
  }, animationConfig.microInteractions.announcementDelayMs)
}

const handleSearch = (query: string) => {
  updateSearchQuery(query)
}

// 🎨 Pallete's micro-UX enhancement: Handle reset with haptic feedback and animation
const handleResetFilters = () => {
  hapticLight()
  resetFilters()
  searchQuery.value = ''
  announcement.value = 'All filters have been reset'
  setTimeout(() => {
    announcement.value = ''
  }, animationConfig.microInteractions.announcementDelayMs)
}

const getButtonLabel = (category: string) => {
  switch (category.toLowerCase()) {
    case 'ai tools':
      return 'Explore AI Tools'
    case 'vps':
      return 'Get VPS'
    case 'web hosting':
      return 'Find Hosting'
    case 'databases':
      return 'Explore Databases'
    case 'cdn':
      return 'Get CDN'
    default:
      return 'Get Free Access'
  }
}

// 🎨 Pallete's micro-UX enhancement: Lifecycle hooks
onMounted(() => {
  // Check reduced motion preference
  prefersReducedMotion.value = checkReducedMotion()

  // Trigger entrance animations after a brief delay
  setTimeout(() => {
    isLoaded.value = true
  }, animationConfig.aiKeys.entranceDelayMs)
})
</script>

<style scoped>
/* 🎨 Pallete's micro-UX: AI Keys Page Enhancement Styles */

/* Title entrance animation */
.ai-keys-title {
  opacity: 1;
  transform: translateY(0);
}

.ai-keys-title--animated {
  opacity: 0;
  transform: translateY(20px);
  animation: title-enter v-bind('`${animationConfig.aiKeys.titleDurationMs}ms`')
    ease-out forwards;
  animation-delay: v-bind('`${animationConfig.aiKeys.titleDelayMs}ms`');
}

@keyframes title-enter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Subtitle entrance animation */
.ai-keys-subtitle {
  opacity: 1;
}

.ai-keys-subtitle--animated {
  opacity: 0;
  animation: fade-in v-bind('`${animationConfig.aiKeys.subtitleDurationMs}ms`')
    ease-out forwards;
  animation-delay: v-bind('`${animationConfig.aiKeys.subtitleDelayMs}ms`');
}

@keyframes fade-in {
  to {
    opacity: 1;
  }
}

/* Category button animations */
.category-button {
  position: relative;
  overflow: hidden;
  transform: translateY(0);
}

.category-button--animated {
  opacity: 0;
  transform: translateY(10px);
  animation: category-button-enter
    v-bind('`${animationConfig.aiKeys.categoryDurationMs}ms`') ease-out forwards;
  animation-delay: calc(
    var(--category-index, 0) *
      v-bind('`${animationConfig.aiKeys.categoryStaggerMs}ms`')
  );
}

@keyframes category-button-enter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Category button press effect */
.category-button:active {
  transform: scale(0.95);
}

/* Selected category pulse */
.category-button--selected {
  animation: selected-pulse
    v-bind('`${animationConfig.aiKeys.selectedPulseDurationMs}ms`') ease-out;
}

@keyframes selected-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* Empty state icon animation */
.ai-keys-empty-icon {
  opacity: 1;
}

.ai-keys-empty-icon--animated {
  animation: empty-icon-bounce
    v-bind('`${animationConfig.aiKeys.emptyIconDurationMs}ms`') ease-out;
}

@keyframes empty-icon-bounce {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Floating dots animation */
.ai-keys-float-dot {
  animation: float-dot
    v-bind('`${animationConfig.aiKeys.floatDotDurationMs}ms`') ease-in-out
    infinite;
}

.ai-keys-float-dot--delayed {
  animation-delay: v-bind('`${animationConfig.aiKeys.floatDotDelayMs}ms`');
}

@keyframes float-dot {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-8px) scale(1.2);
    opacity: 1;
  }
}

/* Reset button press effect */
.ai-keys-reset-button {
  transition: transform
    v-bind('`${animationConfig.aiKeys.buttonTransitionMs}ms`') ease-out;
}

.ai-keys-reset-button--pressed {
  transform: scale(0.95);
}

.ai-keys-reset-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ai-keys-reset-button:active {
  transform: scale(0.95);
}

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .ai-keys-title,
  .ai-keys-subtitle,
  .category-button,
  .ai-keys-empty-icon {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
  }

  .ai-keys-float-dot {
    animation: none !important;
  }

  .ai-keys-reset-button:hover {
    transform: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .category-button:focus {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  .category-button--selected {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
}
</style>
