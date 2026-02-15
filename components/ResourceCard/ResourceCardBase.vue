<!-- eslint-disable vue/no-v-html -->
<template>
  <article
    v-if="!hasError"
    ref="cardRef"
    :class="[
      `bg-white p-6 rounded-lg shadow hover:shadow-lg hover:-translate-y-1 focus-within:shadow-lg focus-within:-translate-y-1 border border-gray-200 hover:border-blue-300 focus-within:border-blue-300 transition-all ${transitionClasses.card} ease-out group card-shine-container card-3d-tilt`,
      {
        'is-tilting': isTilting && !prefersReducedMotion,
      },
    ]"
    :style="tiltStyle"
    role="article"
    @mouseenter="handleMouseEnter"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
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
          format="avif"
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
              :class="`resource-link hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:rounded-sm transition-colors ${transitionClasses.normal}`"
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

            <!-- Viewed Badge with Palette's micro-UX delight! -->
            <!-- Delightful entrance animation with haptic feedback -->
            <Transition
              :enter-active-class="`transition-all ${animationConfig.tailwindDurations.standard} ease-out`"
              enter-from-class="opacity-0 scale-50 -translate-y-2"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              :leave-active-class="`transition-all ${animationConfig.tailwindDurations.normal} ease-in`"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-75"
              @after-enter="handleViewedBadgeEntered"
            >
              <span
                v-if="isResourceVisited && id"
                :class="[
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 mr-2',
                  'viewed-badge',
                  {
                    'viewed-badge--animate':
                      showViewedAnimation && !prefersReducedMotion,
                  },
                ]"
                role="status"
                aria-label="You have viewed this resource"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  :class="[
                    'h-3 w-3 mr-1',
                    'viewed-badge__icon',
                    {
                      'viewed-badge__icon--bounce':
                        showViewedAnimation && !prefersReducedMotion,
                    },
                  ]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="viewed-badge__text">Viewed</span>
              </span>
            </Transition>

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
              :class="[
                `inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 hover:scale-105 active:bg-gray-950 active:scale-95 transition-all ${transitionClasses.fast} ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 relative overflow-hidden disabled:opacity-75 disabled:cursor-not-allowed magnetic-button`,
                { 'pointer-events-none': isNavigating },
              ]"
              :style="magneticTransformStyle"
              :aria-label="
                isNavigating
                  ? `Opening ${title}...`
                  : `Visit ${title} - opens in ${newTab ? 'new tab' : 'same window'}`
              "
              :aria-busy="isNavigating"
              @click="handleLinkClickWithRipple"
            >
              <!-- Loading Spinner -->
              <svg
                v-if="isNavigating"
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {{ visitButtonText }}
              <span
                v-if="newTab && !isNavigating"
                class="ml-1.5 inline-flex items-center"
                aria-hidden="true"
              >
                <!-- External link indicator - Palette's micro-UX touch! -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  :class="`h-3.5 w-3.5 opacity-70 group-hover:opacity-100 transition-opacity ${transitionClasses.normal}`"
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
          </Tooltip>

          <!-- Actions container with progressive disclosure -->
          <div
            class="flex items-center space-x-2 relative"
            role="group"
            aria-label="Resource actions"
          >
            <!-- Actions hint - visible on desktop when not hovered -->
            <div
              :class="`hidden md:flex items-center text-gray-600 text-xs transition-opacity ${transitionClasses.normal} ease-out group-hover:opacity-0 pointer-events-none`"
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
              :class="`flex items-center transition-all ${transitionClasses.normal} ease-out opacity-100 md:opacity-0 md:translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 focus-within:opacity-100 focus-within:translate-x-0`"
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
import { ref, computed, onMounted, onUnmounted, watch, type Ref } from 'vue'
import { useHead } from '#imports'
import { useRipple } from '~/composables/useRipple'
import { useMagneticButton } from '~/composables/useMagneticButton'
import { useResourceCardActions } from '~/composables/useResourceCardActions'
import OptimizedImage from '~/components/OptimizedImage.vue'
import ResourceStatus from '~/components/ResourceStatus.vue'
import Tooltip from '~/components/Tooltip.vue'
import { trackResourceView, trackResourceClick } from '~/utils/analytics'
import { sanitizeAndHighlight } from '~/utils/sanitize'
import { memoizeHighlight } from '~/utils/memoize'
import { logError } from '~/utils/errorLogger'
import { formatDomainTooltip } from '~/utils/resourceHelper'
import { hapticSuccess } from '~/utils/hapticFeedback'
import { uiConfig } from '~/configs/ui.config'
import { contentConfig } from '~/configs/content.config'
import { limitsConfig } from '~/configs/limits.config'
import { animationConfig } from '~/configs/animation.config'
import { EASING } from '~/configs/easing.config'
import { componentColorsConfig } from '~/configs/component-colors.config'
import { seoConfig } from '~/configs/seo.config'
import { zIndexConfig, zIndexScale } from '~/configs/z-index.config'

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
const isNavigating = ref(false)

// Palette's 3D Card Tilt Micro-UX Enhancement!
// Adds subtle parallax effect based on mouse position for premium feel
const cardRef = ref<HTMLElement | null>(null)
const isTilting = ref(false)
const tiltX = ref(0)
const tiltY = ref(0)
const prefersReducedMotion = ref(false)

// Media query refs for cleanup (Issue #2333 - Memory leak fix)
const reducedMotionMediaQuery = ref<MediaQueryList | null>(null)
const reducedMotionHandler = ref<((e: MediaQueryListEvent) => void) | null>(
  null
)

// Palette's Viewed Badge Micro-UX Enhancement!
// Tracks when to show the entrance animation for delightful feedback
const showViewedAnimation = ref(false)
const hasAnimatedViewedBadge = ref(false)

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Calculate tilt based on mouse position
const calculateTilt = (event: MouseEvent) => {
  if (!cardRef.value || prefersReducedMotion.value) return

  const rect = cardRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  // Calculate mouse position relative to card center (-1 to 1)
  const mouseX = (event.clientX - centerX) / (rect.width / 2)
  const mouseY = (event.clientY - centerY) / (rect.height / 2)

  // Apply tilt configuration values - Flexy hates hardcoded values!
  const maxTiltX = animationConfig.card3dTilt.maxTiltXPx
  const maxTiltY = animationConfig.card3dTilt.maxTiltYPx

  // Invert Y axis so tilting up feels natural
  tiltX.value = mouseY * maxTiltX
  tiltY.value = -mouseX * maxTiltY
}

// Handle mouse enter - start tilting
const handleMouseEnter = () => {
  if (prefersReducedMotion.value) return
  isTilting.value = true
}

// Handle mouse move - update tilt
const handleMouseMove = (event: MouseEvent) => {
  if (!isTilting.value || prefersReducedMotion.value) return
  calculateTilt(event)
}

// Handle mouse leave - reset tilt
const handleMouseLeave = () => {
  isTilting.value = false
  tiltX.value = 0
  tiltY.value = 0
}

// Palette's Viewed Badge Micro-UX Enhancement!
// Handles the entrance animation completion with haptic feedback
const handleViewedBadgeEntered = () => {
  // Only animate once per component instance
  if (hasAnimatedViewedBadge.value) return

  hasAnimatedViewedBadge.value = true
  showViewedAnimation.value = true

  // Trigger haptic feedback for mobile users - delightful touch!
  hapticSuccess()

  // Reset animation flag after animation completes
  setTimeout(() => {
    showViewedAnimation.value = false
  }, animationConfig.viewedBadge?.animationDurationMs || 600)
}

// Computed tilt style for dynamic CSS transforms
const tiltStyle = computed(() => {
  if (
    prefersReducedMotion.value ||
    (!isTilting.value && tiltX.value === 0 && tiltY.value === 0)
  ) {
    return {}
  }

  const config = animationConfig.card3dTilt

  return {
    transform: `
      perspective(${config.perspectivePx}px)
      rotateX(${tiltX.value}deg)
      rotateY(${tiltY.value}deg)
      translateZ(${isTilting.value ? config.hoverLiftPx : 0}px)
      scale(${isTilting.value ? config.hoverScale : 1})
    `,
    transition: isTilting.value
      ? `transform ${animationConfig.cssTransitions.fastSec} ease-out`
      : `transform ${config.resetDurationSec}s ${EASING.MATERIAL_STANDARD}`,
    transformStyle: 'preserve-3d' as const,
  }
})

// Computed button text based on navigation state
const visitButtonText = computed(() => {
  return isNavigating.value
    ? contentConfig.resourceCard.openingLabel
    : props.buttonLabel || contentConfig.resourceCard.defaultButtonLabel
})

// 🎯 Flexy: Modular easing for new badge pulse animation
const newPulseEasing = computed(() => EASING.MATERIAL_SHARP)

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

// Watch for when resource becomes visited to trigger animation
watch(isResourceVisited, newValue => {
  if (newValue && !hasAnimatedViewedBadge.value) {
    showViewedAnimation.value = true
  }
})

// Flexy hates hardcoded values! Config-based transition classes
const transitionClasses = computed(() => ({
  fast: animationConfig.transition.fast.class,
  normal: animationConfig.transition.normal.class,
  slow: animationConfig.transition.slow.class,
  card: animationConfig.transition.normal.class,
}))

// Initialize ripple effect
// Flexy loves modularity! Using configurable animation duration from animationConfig
const { createRipple } = useRipple(
  visitButtonRef as Ref<HTMLButtonElement | null>,
  {
    color: 'rgba(255, 255, 255, 0.25)',
    duration: animationConfig.button.feedbackDurationMs,
  }
)

// Palette's Magnetic Button Micro-UX Enhancement! 🧲
// Creates a subtle "magnetic" pull effect that draws the button toward the cursor
// This adds a delightful tactile feel to the primary action button
const { transformStyle: magneticTransformStyle } = useMagneticButton({
  strength: animationConfig.magneticButton.strength,
  maxDistancePx: animationConfig.magneticButton.maxDistancePx,
  returnDurationMs: animationConfig.magneticButton.returnDurationMs,
})

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
    // Only track with category if it's provided and valid
    // Invalid categories will cause 400 errors from the analytics API
    const category = props.category || undefined
    trackResourceView(props.id, props.title, category)
  }

  // Check reduced motion preference for 3D tilt effect
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for changes to reduced motion preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    reducedMotionMediaQuery.value = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    )
    reducedMotionHandler.value = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
      if (e.matches) {
        // Reset tilt when reduced motion is enabled
        isTilting.value = false
        tiltX.value = 0
        tiltY.value = 0
      }
    }
    reducedMotionMediaQuery.value.addEventListener(
      'change',
      reducedMotionHandler.value
    )
  }
})

// Cleanup media query listener on unmount (Issue #2333 - Memory leak fix)
onUnmounted(() => {
  if (reducedMotionMediaQuery.value && reducedMotionHandler.value) {
    reducedMotionMediaQuery.value.removeEventListener(
      'change',
      reducedMotionHandler.value
    )
    reducedMotionMediaQuery.value = null
    reducedMotionHandler.value = null
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
    // Only track with category if it's provided (undefined is better than 'unknown' which fails validation)
    const category = props.category || undefined
    trackResourceClick(props.id, props.title, category)
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
  // Prevent multiple clicks while navigating
  if (isNavigating.value) {
    event.preventDefault()
    return
  }

  // Set navigating state for immediate visual feedback
  isNavigating.value = true

  // Create ripple effect
  createRipple(event)

  // Handle the actual click
  handleLinkClick(event)

  // Reset state after delay (external navigation doesn't give us completion events)
  // Flexy hates hardcoded values! Using configurable delay from animationConfig
  setTimeout(() => {
    isNavigating.value = false
  }, animationConfig.navigation.resetDelayMs)
}

// Add structured data for the resource
const resourceSchema = computed(() => {
  if (hasError.value) return null

  // Flexy hates hardcoded schema URLs! Using configurable values from seoConfig
  const schema: Record<string, unknown> = {
    '@context': seoConfig.schema.context,
    '@type': seoConfig.schema.softwareApplication,
    name: props.title,
    description: props.description,
    url: props.url,
  }

  if (props.icon) {
    schema.image = props.icon
  }

  schema.offers = {
    '@type': seoConfig.schema.offerType,
    availability: seoConfig.schema.availability.inStock,
    price: seoConfig.resourceSchema.price,
    priceCurrency: seoConfig.resourceSchema.currency,
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
  animation: new-pulse 2s v-bind('newPulseEasing') infinite;
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

/* Visited resource link state - Flexy hates hardcoded values! */
/* Using CSS custom properties bound to config values */
.resource-link {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.resource-link:visited {
  color: v-bind('componentColorsConfig.resourceCard.visited.linkColor');
}

.resource-link:visited::after {
  content: '';
  display: inline-block;
  width: v-bind(
    '`${componentColorsConfig.resourceCard.visited.indicatorSize}px`'
  );
  height: v-bind(
    '`${componentColorsConfig.resourceCard.visited.indicatorSize}px`'
  );
  margin-left: v-bind(
    '`${componentColorsConfig.resourceCard.visited.indicatorMargin}px`'
  );
  background-color: v-bind(
    'componentColorsConfig.resourceCard.visited.indicatorColor'
  );
  border-radius: 50%;
  opacity: v-bind(
    'componentColorsConfig.resourceCard.visited.indicatorOpacity'
  );
  flex-shrink: 0;
}

.resource-link:hover:visited {
  color: v-bind('componentColorsConfig.resourceCard.visited.linkHoverColor');
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-new-pulse {
    animation: none;
  }
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
  transition: opacity v-bind('animationConfig.cssTransitions.standardSec') ease;
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
}

/* 3D Card Tilt Effect - Palette's micro-UX delight! */
.card-3d-tilt {
  will-change: transform;
  backface-visibility: hidden;
}

.card-3d-tilt.is-tilting {
  will-change: transform;
}

/* Add subtle inner glow during tilt for depth perception */
.card-3d-tilt.is-tilting::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 255, 255, 0.15) 0%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity v-bind('animationConfig.cssTransitions.standardSec') ease;
  z-index: v-bind('zIndexScale.low[5]');
}

.card-3d-tilt.is-tilting::after {
  opacity: 1;
}

/* Ensure card content stays flat during tilt */
.card-3d-tilt > * {
  transform: translateZ(0);
}

/* Enhanced shadow during tilt for depth */
.card-3d-tilt.is-tilting {
  box-shadow:
    0 20px 40px -10px rgba(0, 0, 0, 0.15),
    0 10px 20px -5px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(59, 130, 246, 0.1);
}

/* Reduced motion support for 3D tilt */
@media (prefers-reduced-motion: reduce) {
  .card-3d-tilt,
  .card-3d-tilt.is-tilting {
    transform: none !important;
    transition:
      box-shadow v-bind('animationConfig.cssTransitions.normalSec') ease,
      border-color v-bind('animationConfig.cssTransitions.normalSec') ease !important;
  }

  .card-3d-tilt::after {
    display: none;
  }
}

/* Palette's Viewed Badge Micro-UX Enhancement! */
/* Delightful entrance animation with bounce and glow effects */

.viewed-badge {
  position: relative;
  overflow: hidden;
}

.viewed-badge--animate {
  animation: viewed-badge-pop
    v-bind('(animationConfig.viewedBadge?.popDurationMs || 400) + "ms"')
    cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes viewed-badge-pop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  70% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.viewed-badge__icon--bounce {
  animation: viewed-icon-bounce
    v-bind('(animationConfig.viewedBadge?.bounceDurationMs || 500) + "ms"')
    ease-out forwards;
}

@keyframes viewed-icon-bounce {
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  40% {
    transform: scale(1.3) rotate(10deg);
  }
  60% {
    transform: scale(0.9) rotate(-5deg);
  }
  80% {
    transform: scale(1.05) rotate(2deg);
  }
  100% {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}

/* Subtle glow pulse after entrance */
.viewed-badge--animate::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: radial-gradient(
    circle,
    rgba(156, 163, 175, 0.4) 0%,
    transparent 70%
  );
  opacity: 0;
  animation: viewed-badge-glow
    v-bind('(animationConfig.viewedBadge?.glowDurationMs || 800) + "ms"')
    ease-out forwards;
  /* Flexy hates hardcoded z-index! Using config instead. */
  z-index: v-bind('zIndexScale.hidden');
  pointer-events: none;
}

@keyframes viewed-badge-glow {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  30% {
    opacity: 1;
    transform: scale(1.2);
  }
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}

/* Reduced motion support for viewed badge */
@media (prefers-reduced-motion: reduce) {
  .viewed-badge--animate,
  .viewed-badge__icon--bounce {
    animation: none;
  }

  .viewed-badge--animate::after {
    display: none;
  }
}
</style>
