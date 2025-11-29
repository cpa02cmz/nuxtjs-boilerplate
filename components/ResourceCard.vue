<!-- eslint-disable vue/no-v-html -->
<template>
  <article
    v-if="!hasError && status !== 'rejected' && status !== 'deprecated'"
    class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-300"
    role="article"
  >
    <div class="flex items-start">
      <div v-if="icon" class="flex-shrink-0 mr-4">
        <OptimizedImage
          :src="icon"
          :alt="title"
          width="48"
          height="48"
          format="webp"
          loading="lazy"
          quality="80"
          img-class="w-12 h-12 rounded object-contain"
          @error="handleImageError"
        />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h3
            id="resource-title"
            class="text-lg font-medium text-gray-900 truncate"
          >
            <NuxtLink
              v-if="id"
              :to="`/resources/${id}`"
              class="hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded-sm"
              :aria-label="`View details for ${title}`"
            >
              <span
                v-if="highlightedTitle"
                v-html="sanitizedHighlightedTitle"
              ></span>
              <!-- eslint-disable-line vue/no-v-html -->
              <span v-else>{{ title }}</span>
            </NuxtLink>
            <span v-else>
              <span
                v-if="highlightedTitle"
                v-html="sanitizedHighlightedTitle"
              ></span>
              <!-- eslint-disable-line vue/no-v-html -->
              <span v-else>{{ title }}</span>
            </span>
          </h3>
          <!-- Moderation status indicator -->
          <span
            v-if="status && status !== 'approved'"
            class="status-badge"
            :class="`status-${status}`"
          >
            {{ status }}
          </span>
        </div>
        <p id="resource-description" class="mt-1 text-gray-800 text-sm">
          <span
            v-if="highlightedDescription"
            v-html="sanitizedHighlightedDescription"
          ></span>
          <!-- eslint-disable-line vue/no-v-html -->
          <span v-else>{{ description }}</span>
        </p>
        <div
          class="mt-3 bg-gray-50 p-3 rounded-md"
          role="region"
          aria-label="Free tier information"
        >
          <p id="free-tier-label" class="font-medium text-gray-900 text-sm">
            Free Tier:
          </p>
          <ul class="mt-1 space-y-1 text-xs text-gray-800" role="list">
            <li v-for="(benefit, index) in benefits" :key="index">
              {{ benefit }}
            </li>
          </ul>
        </div>
        <div class="mt-4 flex items-center justify-between">
          <a
            :href="url"
            :target="newTab ? '_blank' : '_self'"
            rel="noopener noreferrer"
            class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
            :aria-label="`Visit ${title} - opens in ${newTab ? 'new tab' : 'same window'}`"
            @click="handleLinkClick"
          >
            {{ buttonLabel }}
            <span v-if="newTab" class="ml-1 text-xs">(new tab)</span>
          </a>
          <div class="flex items-center space-x-2">
            <!-- Bookmark button -->
            <BookmarkButton
              v-if="id"
              :resource-id="id"
              :title="title"
              :description="description"
              :url="url"
            />
            <!-- Share button -->
            <ShareButton
              v-if="id"
              :title="title"
              :description="description"
              :url="`${runtimeConfig.public.canonicalUrl}/resources/${id}`"
            />
            <!-- Flag button for users to report content -->
            <button
              v-if="id && status === 'approved'"
              @click="flagResource"
              class="text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-1"
              aria-label="Report this resource"
              title="Report this resource"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <!-- Slot for additional actions -->
            <slot name="actions"></slot>
          </div>
        </div>
      </div>
    </div>
  </article>

  <!-- Pending status notification -->
  <article
    v-else-if="status === 'pending'"
    class="bg-blue-50 p-6 rounded-lg border border-blue-200"
    role="article"
  >
    <div class="flex items-start">
      <div class="flex-shrink-0 mr-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-medium text-blue-900">
          <span class="status-badge status-pending">Pending Review</span>
          {{ title }}
        </h3>
        <p class="mt-1 text-blue-700 text-sm">
          This resource is under review and will be available once approved by
          our moderation team.
        </p>
      </div>
    </div>
  </article>

  <!-- Error state -->
  <div v-else class="bg-white p-6 rounded-lg shadow border border-red-200">
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
        <h3 class="text-lg font-medium text-red-900">Resource Unavailable</h3>
        <p class="mt-1 text-red-700 text-sm">
          This resource could not be displayed due to an error.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useHead, useRuntimeConfig } from '#imports'
import OptimizedImage from '~/components/OptimizedImage.vue'
import BookmarkButton from '~/components/BookmarkButton.vue'
import ShareButton from '~/components/ShareButton.vue'
import { trackResourceView, trackResourceClick } from '~/utils/analytics'
import { sanitizeAndHighlight } from '~/utils/sanitize'

interface Props {
  title: string
  description: string
  benefits: string[]
  url: string
  id?: string
  category?: string // Added for analytics tracking
  icon?: string
  newTab?: boolean
  buttonLabel?: string
  highlightedTitle?: string
  highlightedDescription?: string
  searchQuery?: string
  // Moderation fields
  status?: 'pending' | 'approved' | 'rejected' | 'deprecated'
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
  category: 'unknown',
  newTab: true,
  buttonLabel: 'Get Free Access',
  highlightedTitle: undefined,
  highlightedDescription: undefined,
  icon: undefined,
  searchQuery: '',
  status: 'approved', // Default to approved for backward compatibility
})

const hasError = ref(false)

// Track resource view when component mounts
onMounted(() => {
  if (props.id) {
    trackResourceView(props.id, props.title, props.category)
  }
})

// Sanitize highlighted content to prevent XSS using centralized utility
const sanitizedHighlightedTitle = computed(() => {
  if (!props.highlightedTitle) return ''
  // Use the centralized sanitization utility with the actual search query
  return sanitizeAndHighlight(
    props.highlightedTitle,
    props.searchQuery || props.highlightedTitle
  )
})

const sanitizedHighlightedDescription = computed(() => {
  if (!props.highlightedDescription) return ''
  // Use the centralized sanitization utility with the actual search query
  return sanitizeAndHighlight(
    props.highlightedDescription,
    props.searchQuery || props.highlightedDescription
  )
})

// Handle image loading errors
const handleImageError = () => {
  hasError.value = true
  // In production, we might want to use a proper error tracking service instead of console
  if (process.dev) {
    // eslint-disable-next-line no-console
    console.error(`Failed to load image for resource: ${props.title}`)
  }
}

// Handle link clicks and validate URL
const handleLinkClick = (event: Event) => {
  // Track the resource click
  if (props.id) {
    trackResourceClick(props.id, props.title, props.category)
  }

  try {
    const url = new URL(props.url)
    // URL is valid, allow the click
  } catch (err) {
    event.preventDefault()
    hasError.value = true
    // In production, we might want to use a proper error tracking service instead of console
    if (process.dev) {
      // eslint-disable-next-line no-console
      console.error(`Invalid URL for resource: ${props.url}`, err)
    }
  }
}

// Handle flagging a resource
const flagResource = async () => {
  if (!props.id) return

  try {
    // Show a simple confirmation before flagging
    if (confirm(`Are you sure you want to report this resource?`)) {
      const response = await $fetch('/api/moderation/flag', {
        method: 'PUT',
        body: {
          resourceId: props.id,
          reason: 'user-report', // Default reason for user reports
          reportedBy: 'current-user', // In real app, get from auth context
        },
      })

      if (response.success) {
        alert('Resource has been reported for review.')
      }
    }
  } catch (error) {
    console.error('Error flagging resource:', error)
    alert('Failed to report resource. Please try again.')
  }
}

// Get runtime config for canonical URL
const runtimeConfig = useRuntimeConfig()

// Add structured data for the resource
const resourceSchema = computed(() => {
  // Only create schema if there's no error and resource is approved
  if (hasError.value || props.status !== 'approved') return null

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication', // Using SoftwareApplication as most resources are web-based tools
    name: props.title,
    description: props.description,
    url: props.url,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      price: '0',
      priceCurrency: 'USD',
    },
    applicationCategory: 'http://schema.org/BusinessApplication',
    operatingSystem: 'Web',
  }
})

// Add JSON-LD structured data to the head if no error
// Skip useHead in test environment to avoid injection issues
if (typeof useHead === 'function') {
  useHead(() => {
    if (hasError.value || !resourceSchema.value) {
      return {}
    }
    return {
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(resourceSchema.value),
        },
      ],
    }
  })
}
</script>

<style scoped>
.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-pending {
  background-color: #fef3c7;
  color: #d97706;
}

.status-approved {
  background-color: #d1fae5;
  color: #065f46;
}

.status-rejected {
  background-color: #fee2e2;
  color: #b91c1c;
}

.status-deprecated {
  background-color: #e5e7eb;
  color: #374151;
}
</style>
