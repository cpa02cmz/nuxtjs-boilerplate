<!-- eslint-disable vue/no-v-html -->
<template>
  <article
    v-if="!hasError"
    class="bg-white p-6 rounded-lg shadow hover:shadow-lg hover:-translate-y-1 focus-within:shadow-lg focus-within:-translate-y-1 transition-all duration-200 ease-out group"
    role="article"
  >
    <div class="flex items-start">
      <div
        v-if="icon"
        class="flex-shrink-0 mr-4"
      >
        <OptimizedImage
          :src="icon"
          :alt="title"
          :width="uiConfig.images.defaultWidth"
          :height="uiConfig.images.defaultHeight"
          format="webp"
          loading="lazy"
          :quality="uiConfig.images.quality"
          img-class="w-12 h-12 rounded object-contain"
          @error="handleImageError"
        />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <h3
            id="resource-title"
            :title="title"
            class="text-lg font-medium text-gray-900 truncate"
          >
            <NuxtLink
              v-if="id"
              :to="`/resources/${id}`"
              class="hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:rounded-sm transition-colors duration-200"
              :aria-label="`View details for ${title}`"
            >
              <span
                v-if="highlightedTitle"
                v-html="sanitizedHighlightedTitle"
              />
              <!-- eslint-disable-line vue/no-v-html -->
              <span v-else>{{ title }}</span>
            </NuxtLink>
            <span v-else>
              <span
                v-if="highlightedTitle"
                v-html="sanitizedHighlightedTitle"
              />
              <!-- eslint-disable-line vue/no-v-html -->
              <span v-else>{{ title }}</span>
            </span>
          </h3>
          <!-- New badge -->
          <span
            v-if="isNew"
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm animate-new-pulse mr-2"
            role="status"
            aria-label="New resource added within the last 7 days"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3 w-3 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clip-rule="evenodd"
              />
            </svg>
            New
          </span>
          <!-- Resource status badge -->
          <ResourceStatus
            v-if="status"
            :status="status"
            :health-score="healthScore"
          />
        </div>
        <p
          id="resource-description"
          class="mt-1 text-gray-800 text-sm"
        >
          <span
            v-if="highlightedDescription"
            v-html="sanitizedHighlightedDescription"
          />
          <!-- eslint-disable-line vue/no-v-html -->
          <span v-else>{{ description }}</span>
        </p>
        <div
          class="mt-3 bg-gray-50 p-3 rounded-md"
          role="region"
          aria-label="Free tier information"
        >
          <p
            id="free-tier-label"
            class="font-medium text-gray-900 text-sm"
          >
            {{ contentConfig.resourceCard.freeTier }}
          </p>
          <ul
            class="mt-1 space-y-1 text-xs text-gray-800"
            role="list"
          >
            <li
              v-for="(benefit, index) in benefits"
              :key="index"
            >
              {{ benefit }}
            </li>
          </ul>
        </div>

        <!-- Similarity information (for alternative suggestions) -->
        <div
          v-if="similarityScore && similarityScore > 0"
          class="mt-3"
        >
          <div class="flex items-center">
            <div
              class="w-full bg-gray-200 rounded-full h-2"
              role="progressbar"
              :aria-valuenow="Math.round(similarityScore * 100)"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="`Similarity score: ${Math.round(similarityScore * 100)}%`"
            >
              <div
                class="bg-blue-600 h-2 rounded-full"
                :style="{ width: `${similarityScore * 100}%` }"
              />
            </div>
            <span class="ml-2 text-xs font-medium text-gray-700">
              {{ Math.round(similarityScore * 100) }}% match
            </span>
          </div>
          <p
            v-if="similarityReason"
            class="mt-1 text-xs text-gray-600"
          >
            {{ similarityReason }}
          </p>
        </div>

        <div class="mt-4 flex items-center justify-between">
          <a
            :href="url"
            :target="newTab ? '_blank' : '_self'"
            rel="noopener noreferrer"
            class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 hover:scale-105 active:bg-gray-950 active:scale-95 transition-all duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            :aria-label="`Visit ${title} - opens in ${newTab ? 'new tab' : 'same window'}`"
            @click="handleLinkClick"
          >
            {{ buttonLabel }}
            <span
              v-if="newTab"
              class="ml-1 text-xs"
            >{{
              contentConfig.resourceCard.newTab
            }}</span>
          </a>
          <div
            class="flex items-center space-x-2"
            role="group"
            aria-label="Resource actions"
          >
            <!-- Bookmark button -->
            <ClientOnly>
              <LazyBookmarkButton
                v-if="id"
                :resource-id="id"
                :title="title"
                :description="description"
                :url="url"
              />
            </ClientOnly>
            <!-- Share button -->
            <ClientOnly>
              <LazyShareButton
                v-if="id"
                :title="title"
                :description="description"
                :url="`${runtimeConfig.public.canonicalUrl}/resources/${id}`"
              />
            </ClientOnly>
            <!-- Quick Copy button -->
            <button
              v-if="id"
              :class="[
                'p-2 rounded-full transition-all duration-200 ease-out',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                isCopied
                  ? 'bg-green-100 text-green-600 scale-110'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100 hover:scale-110 active:scale-95 dark:text-gray-500 dark:hover:text-gray-200 dark:hover:bg-gray-800',
              ]"
              :aria-label="
                isCopied ? `Copied link to ${title}` : `Copy link to ${title}`
              "
              :title="isCopied ? 'Copied!' : 'Copy link'"
              @click="copyResourceUrl"
            >
              <svg
                v-if="!isCopied"
                xmlns="http://www.w3.org/2000/svg"
                :class="[
                  'h-5 w-5 transition-transform duration-200',
                  isCopyAnimating && 'animate-icon-pop',
                ]"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path
                  d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 animate-check-pop"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <!-- Compare button -->
            <button
              v-if="id"
              ref="compareButtonRef"
              :class="[
                'p-2 rounded-full transition-all duration-200 ease-out',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                isAddingToComparison
                  ? 'bg-blue-100 text-blue-600 scale-110'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 hover:scale-110 active:scale-95 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800',
              ]"
              :aria-label="
                isAddingToComparison
                  ? `Added ${title} to comparison`
                  : `Add ${title} to comparison`
              "
              :title="
                isAddingToComparison
                  ? 'Added to comparison'
                  : 'Add to comparison'
              "
              :aria-pressed="isAddingToComparison"
              @click="addResourceToComparison"
            >
              <svg
                v-if="!isAddingToComparison"
                xmlns="http://www.w3.org/2000/svg"
                :class="[
                  'h-5 w-5 transition-transform duration-200',
                  isCompareAnimating && 'animate-icon-pop',
                ]"
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
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 animate-check-pop"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <!-- Slot for additional actions -->
            <slot name="actions" />
          </div>
        </div>
      </div>
    </div>
  </article>

  <!-- Error state -->
  <div
    v-else
    class="bg-white p-6 rounded-lg shadow border border-red-200"
  >
    <div class="flex items-start">
      <div class="flex-shrink-0 mr-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-12 w-12 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-medium text-red-900">
          Resource Unavailable
        </h3>
        <p class="mt-1 text-red-700 text-sm">
          This resource could not be displayed due to an error.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useHead, useRuntimeConfig, useNuxtApp } from '#imports'
import { useResourceComparison } from '~/composables/useResourceComparison'
import OptimizedImage from '~/components/OptimizedImage.vue'
import ResourceStatus from '~/components/ResourceStatus.vue'
import { trackResourceView, trackResourceClick } from '~/utils/analytics'
import { sanitizeAndHighlight } from '~/utils/sanitize'
import { memoizeHighlight } from '~/utils/memoize'
import { logError } from '~/utils/errorLogger'
import { copyToClipboard } from '~/utils/clipboard'
import {
  hapticSuccess,
  hapticError,
  hapticWarning,
} from '~/utils/hapticFeedback'
import { uiConfig } from '~/configs/ui.config'
import { contentConfig } from '~/configs/content.config'
import { limitsConfig } from '~/configs/limits.config'
import { animationConfig } from '~/configs/animation.config'
import type { Resource } from '~/types/resource'

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

// Get the comparison composable
const { addResource } = useResourceComparison()

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
  category: 'unknown',
  newTab: true,
  buttonLabel: uiConfig.resourceCard.defaultButtonLabel,
  highlightedTitle: undefined,
  highlightedDescription: undefined,
  icon: undefined,
  searchQuery: '',
  status: 'active',
  healthScore: undefined,
  similarityScore: undefined,
  similarityReason: undefined,
  dateAdded: undefined,
})

const hasError = ref(false)
const isAddingToComparison = ref(false)
const isCompareAnimating = ref(false)
const compareButtonRef = ref<HTMLButtonElement | null>(null)
const isCopied = ref(false)
const isCopyAnimating = ref(false)

// Check if resource is new (added within the last 7 days)
const isNew = computed(() => {
  if (!props.dateAdded) return false

  const addedDate = new Date(props.dateAdded)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - addedDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays <= 7
})

// Memoized highlight function to prevent recomputation
const memoizedHighlight = memoizeHighlight(sanitizeAndHighlight)

// Track resource view when component mounts
onMounted(() => {
  if (props.id) {
    trackResourceView(props.id, props.title, props.category)
  }
})

// Sanitize highlighted content to prevent XSS using centralized utility with memoization
const sanitizedHighlightedTitle = computed(() => {
  if (!props.highlightedTitle) return ''
  return memoizedHighlight(
    props.highlightedTitle,
    props.searchQuery || props.highlightedTitle
  )
})

const sanitizedHighlightedDescription = computed(() => {
  if (!props.highlightedDescription) return ''
  return memoizedHighlight(
    props.highlightedDescription,
    props.searchQuery || props.highlightedDescription
  )
})

// Handle image loading errors
const handleImageError = () => {
  hasError.value = true
  logError(
    `Failed to load image for resource: ${props.title}`,
    undefined,
    'ResourceCard',
    { resourceTitle: props.title, resourceUrl: props.icon }
  )
}

// Handle link clicks and validate URL
const handleLinkClick = (event: Event) => {
  // Track the resource click
  if (props.id) {
    trackResourceClick(props.id, props.title, props.category)
  }

  try {
    new URL(props.url)
    // URL is valid, allow click
  } catch (err) {
    event.preventDefault()
    hasError.value = true
    logError(
      `Invalid URL for resource: ${props.url}`,
      err as Error,
      'ResourceCard',
      { resourceTitle: props.title, resourceUrl: props.url, error: err }
    )
  }
}

// Get runtime config for canonical URL
const runtimeConfig = useRuntimeConfig()

// Method to add resource to comparison with UX feedback
const addResourceToComparison = () => {
  if (!props.id || isAddingToComparison.value) return

  // Create a resource object with the required properties
  const resource: Partial<Resource> = {
    id: props.id,
    title: props.title,
    description: props.description,
    benefits: props.benefits,
    url: props.url,
    category: props.category || 'unknown',
  }

  // Add the resource to comparison
  const result = addResource(resource as Resource)

  if (result.success) {
    // Show visual feedback
    isAddingToComparison.value = true
    isCompareAnimating.value = true

    // Haptic feedback for successful addition
    hapticSuccess()

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    // Navigate after brief delay to allow users to see feedback
    // Skip delay for users who prefer reduced motion
    const navigationDelay = prefersReducedMotion
      ? 0
      : animationConfig.navigation.reducedMotionDelayMs

    setTimeout(() => {
      navigateTo('/compare')
    }, navigationDelay)
  } else if (result.reason === 'limit_reached') {
    // Show toast notification when comparison limit is reached
    const { $toast } = useNuxtApp()
    $toast.warning(
      `Comparison limit reached (${limitsConfig.comparison.maxResources} resources max). Remove a resource to add another.`
    )
    // Haptic feedback for warning
    hapticWarning()
  } else if (result.reason === 'already_added') {
    // Show toast notification when resource is already in comparison
    const { $toast } = useNuxtApp()
    $toast.info(`"${props.title}" is already in your comparison`)
    // Light haptic for already added
    hapticWarning()
  }
}

// Method to copy resource URL to clipboard with visual feedback
const copyResourceUrl = async () => {
  if (!props.id || isCopied.value) return

  const resourceUrl = `${runtimeConfig.public.canonicalUrl}/resources/${props.id}`
  const result = await copyToClipboard(resourceUrl)

  if (result.success) {
    // Show visual feedback
    isCopied.value = true
    isCopyAnimating.value = true

    // Haptic feedback for successful copy
    hapticSuccess()

    // Show toast notification
    const { $toast } = useNuxtApp()
    $toast.success(`Link to "${props.title}" copied to clipboard!`)

    // Reset after delay using animationConfig
    setTimeout(() => {
      isCopied.value = false
      isCopyAnimating.value = false
    }, animationConfig.copySuccess.resetDelayMs)
  } else {
    // Show error toast
    const { $toast } = useNuxtApp()
    $toast.error('Failed to copy link. Please try again.')
    // Haptic feedback for error
    hapticError()
    logError(
      'Failed to copy resource URL to clipboard',
      new Error(result.error),
      'ResourceCard',
      { resourceId: props.id, resourceTitle: props.title }
    )
  }
}

// Add structured data for the resource
const resourceSchema = computed(() => {
  // Only create schema if there's no error
  if (hasError.value) return null

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: props.title,
    description: props.description,
    url: props.url,
  }

  if (props.icon) {
    schema.image = props.icon
  }

  schema.offers = {
    '@type': 'Offer',
    availability: 'https://schema.org/InStock',
    price: '0',
    priceCurrency: 'USD',
  }

  // Add category information
  if (props.category) {
    schema.applicationCategory = props.category
  }

  schema.operatingSystem = 'Web'

  return schema
})

// Add JSON-LD structured data to the head if no error
// Skip useHead in test environment to avoid injection issues
if (typeof useHead === 'function') {
  useHead(() => {
    if (hasError.value || !resourceSchema.value) {
      return {}
    }
    // Safely serialize JSON-LD data to prevent XSS
    const serializedSchema = JSON.stringify(resourceSchema.value)
      .replace(new RegExp('<', 'g'), '\\u003c') // Escape < to prevent script tag breaking
      .replace(new RegExp('>', 'g'), '\\u003e') // Escape > to prevent script tag breaking
      .replace(new RegExp('/', 'g'), '\\u002f') // Escape / to prevent closing script tags
    return {
      script: [
        {
          type: 'application/ld+json',
          innerHTML: serializedSchema,
        },
      ],
    }
  })
}
</script>

<style scoped>
/* Icon pop animation when clicking compare button */
.animate-icon-pop {
  animation: icon-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes icon-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Checkmark pop animation when added to comparison */
.animate-check-pop {
  animation: check-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes check-pop {
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* New badge pulse animation */
.animate-new-pulse {
  animation: new-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes new-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(1.05);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-icon-pop,
  .animate-check-pop,
  .animate-new-pulse {
    animation: none;
  }
}
</style>
