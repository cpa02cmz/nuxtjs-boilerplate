<!-- eslint-disable vue/no-v-html -->
<!--
  SECURITY NOTE:
  This component uses v-html directives in ResourceCardBase for rendering
  highlighted search results. All content is sanitized using sanitizeAndHighlight()
  from ~/utils/sanitize.ts which implements:
  - DOMPurify sanitization with configurable allowed tags/attributes
  - Pre-processing to remove script tags and dangerous content
  - Post-processing to remove event handlers and javascript: URLs
  - CSP headers are configured in server/plugins/security-headers.ts
  
  The sanitization configuration is defined in configs/security.config.ts
  and enforced consistently across all components using v-html.
-->
<template>
  <!--
    🎨 Pallete's micro-UX enhancement: Entrance animation wrapper
    Creates delightful cascading effect when cards appear in lists
    - Staggered animations based on card index
    - Respects reduced motion preferences
    - Smooth entrance with scale and translate effects
  -->
  <div
    ref="cardContainerRef"
    :class="[
      'resource-card-entrance',
      {
        'is-visible': isVisible || prefersReducedMotion,
        'is-animated': !prefersReducedMotion && isVisible,
      },
    ]"
    :style="entranceStyle"
  >
    <ResourceCardBase
      :id="id"
      :title="title"
      :description="description"
      :benefits="benefits"
      :url="url"
      :category="category"
      :icon="icon"
      :new-tab="newTab"
      :button-label="buttonLabel"
      :highlighted-title="highlightedTitle"
      :highlighted-description="highlightedDescription"
      :search-query="searchQuery"
      :similarity-score="similarityScore"
      :similarity-reason="similarityReason"
      :status="status"
      :health-score="healthScore"
      :date-added="dateAdded"
      @visited="handleVisited"
      @error="handleError"
    >
      <template #actions>
        <ResourceCardActions
          :id="id"
          :title="title"
          :description="description"
          :url="url"
          :category="category"
          :benefits="benefits"
          :date-added="dateAdded"
        />
      </template>
    </ResourceCardBase>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ResourceCardBase from './ResourceCard/ResourceCardBase.vue'
import ResourceCardActions from './ResourceCard/ResourceCardActions.vue'
import { uiConfig } from '~/configs/ui.config'
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
  /**
   * 🎨 Pallete's micro-UX: Index for staggered entrance animations
   * Determines the delay before this card animates in
   * @default 0
   */
  index?: number
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
  index: 0,
})

const emit = defineEmits<{
  (e: 'visited', id: string): void
  (e: 'error', error: Error): void
}>()

// 🎨 Pallete's micro-UX: Entrance animation state
const isVisible = ref(false)
const prefersReducedMotion = ref(false)
const cardContainerRef = ref<HTMLDivElement | null>(null)

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Calculate staggered delay based on index
const staggerDelayMs = computed(() => {
  const config = animationConfig.resourceCard.entrance
  const delay = props.index * config.staggerMs
  // Cap the maximum delay to prevent excessive waiting
  return Math.min(delay, config.maxStaggerMs)
})

// Entrance animation style
const entranceStyle = computed(() => {
  // If reduced motion is preferred, no animation needed
  if (prefersReducedMotion.value) {
    return {}
  }

  const config = animationConfig.resourceCard.entrance

  return {
    '--entrance-duration': `${config.durationMs}ms`,
    '--entrance-delay': `${staggerDelayMs.value}ms`,
    '--entrance-easing': config.easing,
    '--entrance-start-scale': config.startScale,
    '--entrance-start-translate': `${config.startTranslateYPx}px`,
  }
})

// Event handlers
const handleVisited = (id: string) => {
  emit('visited', id)
}

const handleError = (error: Error) => {
  emit('error', error)
}

// 🎨 Pallete's micro-UX: Intersection Observer for entrance animation
// Only animate when card comes into viewport
let intersectionObserver: IntersectionObserver | null = null

onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // If reduced motion is preferred, show immediately without animation
  if (prefersReducedMotion.value) {
    isVisible.value = true
    return
  }

  // Use IntersectionObserver to trigger animation when card enters viewport
  if (
    cardContainerRef.value &&
    typeof window !== 'undefined' &&
    'IntersectionObserver' in window
  ) {
    intersectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Add a small base delay even for the first card for smoother UX
            const baseDelay = props.index === 0 ? 50 : 0
            setTimeout(() => {
              isVisible.value = true
            }, baseDelay)
            // Disconnect after triggering to prevent re-animation
            intersectionObserver?.disconnect()
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px 0px',
      }
    )
    intersectionObserver.observe(cardContainerRef.value)
  } else {
    // Fallback: show immediately if observer not available
    isVisible.value = true
  }
})

onUnmounted(() => {
  if (intersectionObserver) {
    intersectionObserver.disconnect()
  }
})
</script>

<style scoped>
/* 🎨 Pallete's micro-UX: Entrance animation styles */
.resource-card-entrance {
  opacity: 0;
  transform: scale(var(--entrance-start-scale, 0.95))
    translateY(var(--entrance-start-translate, 20px));
  transition:
    opacity var(--entrance-duration, 400ms)
      var(--entrance-easing, cubic-bezier(0.16, 1, 0.3, 1))
      var(--entrance-delay, 0ms),
    transform var(--entrance-duration, 400ms)
      var(--entrance-easing, cubic-bezier(0.16, 1, 0.3, 1))
      var(--entrance-delay, 0ms);
  will-change: opacity, transform;
}

/* Visible state */
.resource-card-entrance.is-visible {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .resource-card-entrance {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
