<!-- eslint-disable vue/no-v-html -->
<template>
  <article
    v-if="!hasError"
    class="bg-white p-6 rounded-lg shadow hover:shadow-lg hover:-translate-y-1 focus-within:shadow-lg focus-within:-translate-y-1 border border-gray-200 hover:border-blue-300 focus-within:border-blue-300 transition-all duration-200 ease-out group"
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
              class="resource-link hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:rounded-sm transition-colors duration-200"
              :aria-label="`View details for ${title}`"
              @click="markVisited"
            >
              <span
                v-if="highlightedTitle"
                v-html="sanitizedHighlightedTitle"
              />
              <span v-else>{{ title }}</span>
            </NuxtLink>
            <span v-else>
              <span
                v-if="highlightedTitle"
                v-html="sanitizedHighlightedTitle"
              />
              <span v-else>{{ title }}</span>
            </span>
          </h3>

          <!-- Badges -->
          <div class="flex items-center">
            <span
              v-if="isNew"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm animate-new-pulse mr-2"
              role="status"
              :aria-label="`New resource added within the last ${limitsConfig.newResourceBadge.thresholdDays} days`"
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

            <span
              v-if="isResourceVisited && id"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 mr-2"
              role="status"
              aria-label="You have viewed this resource"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              Viewed
            </span>

            <ResourceStatus
              v-if="status"
              :status="status"
              :health-score="healthScore"
            />
          </div>
        </div>

        <!-- Description -->
        <p
          id="resource-description"
          class="mt-1 text-gray-800 text-sm"
        >
          <span
            v-if="highlightedDescription"
            v-html="sanitizedHighlightedDescription"
          />
          <span v-else>{{ description }}</span>
        </p>

        <!-- Free tier information -->
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

        <!-- Visit button and actions slot -->
        <div class="mt-4 flex items-center justify-between">
          <Tooltip
            :content="domainTooltip"
            position="bottom"
            :delay="animationConfig.tooltip.showDelayMs"
          >
            <a
              ref="visitButtonRef"
              :href="url"
              :target="newTab ? '_blank' : '_self'"
              rel="noopener noreferrer"
              class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 hover:scale-105 active:bg-gray-950 active:scale-95 transition-all duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 relative overflow-hidden"
              :aria-label="`Visit ${title} - opens in ${newTab ? 'new tab' : 'same window'}`"
              @click="handleLinkClickWithRipple"
            >
              {{ buttonLabel }}
              <span
                v-if="newTab"
                class="ml-1 text-xs"
              >{{
                contentConfig.resourceCard.newTab
              }}</span>
            </a>
          </Tooltip>

          <!-- Actions container with progressive disclosure -->
          <div
            class="flex items-center space-x-2 relative"
            role="group"
            aria-label="Resource actions"
          >
            <!-- Actions hint - visible on desktop when not hovered -->
            <div
              class="hidden md:flex items-center text-gray-400 text-xs transition-opacity duration-200 ease-out group-hover:opacity-0 pointer-events-none"
              aria-hidden="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="hidden lg:inline">Hover for actions</span>
            </div>

            <!-- Actions slot with progressive disclosure -->
            <div
              class="flex items-center transition-all duration-200 ease-out opacity-100 md:opacity-0 md:translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 focus-within:opacity-100 focus-within:translate-x-0"
            >
              <slot name="actions" />
            </div>
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
import { ref, computed, onMounted, type Ref } from 'vue'
import { useHead } from '#imports'
import { useRipple } from '~/composables/useRipple'
import { useResourceCardActions } from '~/composables/useResourceCardActions'
import OptimizedImage from '~/components/OptimizedImage.vue'
import ResourceStatus from '~/components/ResourceStatus.vue'
import Tooltip from '~/components/Tooltip.vue'
import { trackResourceView, trackResourceClick } from '~/utils/analytics'
import { sanitizeAndHighlight } from '~/utils/sanitize'
import { memoizeHighlight } from '~/utils/memoize'
import { logError } from '~/utils/errorLogger'
import { formatDomainTooltip } from '~/utils/resourceHelper'
import { uiConfig } from '~/configs/ui.config'
import { contentConfig } from '~/configs/content.config'
import { limitsConfig } from '~/configs/limits.config'
import { animationConfig } from '~/configs/animation.config'

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

const emit = defineEmits<{
  (e: 'visited', id: string): void
  (e: 'error', error: Error): void
}>()

const hasError = ref(false)
const visitButtonRef = ref<HTMLAnchorElement | null>(null)

// Use the resource card actions composable
const { isNew, isResourceVisited, markResourceVisited } =
  useResourceCardActions({
    id: props.id,
    title: props.title,
    description: props.description,
    benefits: props.benefits,
    url: props.url,
    category: props.category,
    dateAdded: props.dateAdded,
  })

// Initialize ripple effect
const { createRipple } = useRipple(
  visitButtonRef as Ref<HTMLButtonElement | null>,
  {
    color: 'rgba(255, 255, 255, 0.25)',
    duration: 600,
  }
)

// Compute domain tooltip
const domainTooltip = computed(() => formatDomainTooltip(props.url))

// Mark resource as visited
const markVisited = () => {
  if (props.id) {
    markResourceVisited()
    emit('visited', props.id)
  }
}

// Memoized highlight function
const memoizedHighlight = memoizeHighlight(sanitizeAndHighlight)

// Track resource view when component mounts
onMounted(() => {
  if (props.id) {
    trackResourceView(props.id, props.title, props.category || 'unknown')
  }
})

// Sanitize highlighted content
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
  const error = new Error(`Failed to load image for resource: ${props.title}`)
  logError(error.message, undefined, 'ResourceCardBase', {
    resourceTitle: props.title,
    resourceUrl: props.icon,
  })
  emit('error', error)
}

// Handle link clicks
const handleLinkClick = (event: Event) => {
  if (props.id) {
    trackResourceClick(props.id, props.title, props.category || 'unknown')
    markResourceVisited()
    emit('visited', props.id)
  }

  try {
    new URL(props.url)
  } catch (err) {
    event.preventDefault()
    hasError.value = true
    const error = new Error(`Invalid URL for resource: ${props.url}`)
    logError(error.message, err as Error, 'ResourceCardBase', {
      resourceTitle: props.title,
      resourceUrl: props.url,
    })
    emit('error', error)
  }
}

// Handle link click with ripple effect
const handleLinkClickWithRipple = (event: MouseEvent) => {
  createRipple(event)
  handleLinkClick(event)
}

// Add structured data for the resource
const resourceSchema = computed(() => {
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

  if (props.category) {
    schema.applicationCategory = props.category
  }

  schema.operatingSystem = 'Web'

  return schema
})

// Add JSON-LD structured data to the head
if (typeof useHead === 'function') {
  useHead(() => {
    if (hasError.value || !resourceSchema.value) {
      return {}
    }

    const serializedSchema = JSON.stringify(resourceSchema.value)
      .replace(new RegExp('<', 'g'), '\\u003c')
      .replace(new RegExp('>', 'g'), '\\u003e')
      .replace(new RegExp('/', 'g'), '\\u002f')

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

/* Visited resource link state */
.resource-link {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.resource-link:visited {
  color: #6b7280;
}

.resource-link:visited::after {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-left: 6px;
  background-color: #9ca3af;
  border-radius: 50%;
  opacity: 0.6;
  flex-shrink: 0;
}

.resource-link:hover:visited {
  color: #4b5563;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-new-pulse {
    animation: none;
  }
}
</style>
