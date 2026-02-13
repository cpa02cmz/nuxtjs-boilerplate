<template>
  <article
    :class="`recommendation-card bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 focus-within:shadow-lg focus-within:-translate-y-1 transition-all ${transitionClasses.normal} ease-out overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 focus-within:border-blue-300 dark:focus-within:border-blue-500 card-shine-container`"
    role="article"
    tabindex="0"
  >
    <div class="p-4">
      <div class="flex justify-between items-start">
        <div class="flex-1 min-w-0">
          <h3
            class="text-lg font-semibold text-gray-900 dark:text-white truncate"
          >
            {{ resource.title }}
          </h3>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {{ resource.description }}
          </p>
        </div>
        <div
          v-if="resource.icon"
          class="ml-3 flex-shrink-0"
        >
          <OptimizedImage
            :src="resource.icon"
            :alt="resource.title"
            :width="32"
            :height="32"
            format="webp"
            loading="lazy"
            :quality="80"
            img-class="w-8 h-8 rounded object-contain"
          />
        </div>
      </div>

      <div class="mt-3 flex flex-wrap gap-1">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
        >
          {{ resource.category }}
        </span>
        <span
          v-for="tag in displayTags"
          :key="tag"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
        >
          {{ tag }}
        </span>
        <span
          v-if="hasMoreTags"
          class="text-xs text-gray-500 dark:text-gray-400"
        >
          +{{ resource.tags.length - displayLimit }}
          {{ contentConfig.similarResources.moreItemsText }}
        </span>
      </div>

      <div class="mt-3 flex items-center justify-between">
        <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <svg
            class="w-4 h-4 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fill-rule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span>{{ resource.popularity }} views</span>
        </div>
        <div
          class="text-xs px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
        >
          {{ resource.pricingModel }}
        </div>
      </div>

      <!-- Explanation/Reason display -->
      <div
        v-if="explanation || reason"
        class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-start">
          <svg
            class="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            />
          </svg>
          <p class="ml-2 text-xs text-gray-600 dark:text-gray-400 italic">
            {{ explanation || `Recommended because: ${reason}` }}
          </p>
        </div>
      </div>

      <div class="mt-4 flex space-x-2">
        <a
          :href="resource.url"
          target="_blank"
          rel="noopener noreferrer"
          :class="`group flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95 active:bg-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 transition-all ${transitionClasses.fast} ease-out relative overflow-hidden`"
          :aria-label="`View ${resource.title} - opens in new tab`"
        >
          View Resource
          <span
            class="ml-1.5 inline-flex items-center external-link-icon"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              :class="`h-3.5 w-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all ${transitionClasses.normal}`"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </span>
        </a>
        <button
          ref="bookmarkButtonRef"
          :class="`inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:scale-105 active:scale-95 active:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-all ${transitionClasses.fast} ease-out relative overflow-hidden`"
          :aria-label="`Bookmark ${resource.title}`"
          aria-pressed="false"
          @click="handleBookmarkClick"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, type Ref } from 'vue'
import type { Resource } from '~/types/resource'
import { limitsConfig } from '~/configs/limits.config'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'
import { zIndexConfig } from '~/configs/z-index.config'
import { useRipple } from '~/composables/useRipple'
import { hapticLight } from '~/utils/hapticFeedback'
import OptimizedImage from '~/components/OptimizedImage.vue'

interface Props {
  resource?: Resource
  explanation?: string
  reason?: string
}

const props = withDefaults(defineProps<Props>(), {
  resource: () => ({}) as Resource,
  explanation: undefined,
  reason: undefined,
})

// Use props to avoid eslint warning
void props.resource

const emit = defineEmits<{
  bookmark: [resource: Resource]
}>()

// Bookmark button ref for ripple effect
const bookmarkButtonRef = ref<HTMLButtonElement | null>(null)

// Initialize ripple effect on bookmark button
const { createRipple } = useRipple(
  bookmarkButtonRef as Ref<HTMLButtonElement | null>,
  {
    color: animationConfig.ripple.bookmarkColor,
    duration: animationConfig.button.feedbackDurationMs,
  }
)

// Handle bookmark click with ripple and haptic feedback
const handleBookmarkClick = (event: MouseEvent) => {
  // Create ripple effect
  createRipple(event)

  // Trigger haptic feedback
  hapticLight()

  // Emit bookmark event
  emit('bookmark', props.resource)
}

// Flexy hates hardcoded limits! Use configurable display limit
const displayLimit = limitsConfig.display.maxTagsDisplay

const displayTags = computed(() => {
  if (!props.resource?.tags) return []
  return props.resource.tags.slice(0, displayLimit)
})

// Flexy hates hardcoded values! Config-based transition classes
const transitionClasses = computed(() => ({
  fast: animationConfig.transition.fast.class,
  normal: animationConfig.transition.normal.class,
}))

const hasMoreTags = computed(() => {
  return (props.resource?.tags?.length || 0) > displayLimit
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Card Shine Effect - Palette's premium micro-UX touch! */
/* Adds a subtle moving gradient on hover for a polished, premium feel */
.card-shine-container {
  position: relative;
  overflow: hidden;
}

.card-shine-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    v-bind('`${animationConfig.cardShine.angleDegrees}deg`'),
    v-bind('animationConfig.cardShine.gradientStart'),
    v-bind('animationConfig.cardShine.gradientMiddle'),
    v-bind('animationConfig.cardShine.gradientEnd'),
    v-bind('animationConfig.cardShine.gradientStart')
  );
  transform: scaleX(v-bind('animationConfig.cardShine.scaleFactor'));
  opacity: 0;
  pointer-events: none;
  z-index: v-bind('zIndexConfig.floatingLabel');
  transition: opacity 0.3s ease;
}

.card-shine-container:hover::before {
  opacity: 1;
  animation: card-shine v-bind('`${animationConfig.cardShine.durationSec}s`')
    ease-out;
}

@keyframes card-shine {
  0% {
    left: -100%;
  }
  100% {
    left: 200%;
  }
}

/* Reduced motion support for card shine */
@media (prefers-reduced-motion: reduce) {
  .card-shine-container::before {
    display: none;
  }

  .recommendation-card {
    transition: none;
  }
}
</style>
