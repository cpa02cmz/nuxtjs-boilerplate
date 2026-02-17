<template>
  <div
    ref="cardRef"
    class="lazy-resource-card-wrapper"
    :class="{
      'is-intersecting': isIntersecting,
      'is-loaded': isLoaded,
      'is-hovering': isHovering && !prefersReducedMotion,
    }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Enhanced Skeleton loader with shimmer effect -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-98"
    >
      <div v-if="!isIntersecting && !isLoaded" class="skeleton-container">
        <!-- Palette's micro-UX: Multi-layer shimmer for depth -->
        <div
          v-if="!prefersReducedMotion"
          class="shimmer-layer"
          aria-hidden="true"
        />
        <ResourceCardSkeleton />
      </div>
    </Transition>

    <!-- Actual card with entrance animation -->
    <Transition
      enter-active-class="transition-all ease-out"
      :enter-active-class-duration="entranceDuration"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      @after-enter="handleAfterEnter"
    >
      <div
        v-if="isIntersecting || isLoaded"
        class="card-container"
        :class="{ 'entrance-animation': !prefersReducedMotion && !hasAnimated }"
      >
        <ResourceCard
          v-bind="$props"
          @visited="handleVisited"
          @error="handleError"
        />
      </div>
    </Transition>

    <!-- Screen reader announcements -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ announcement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useIntersectionObserver } from '~/composables/useIntersectionObserver'
import ResourceCard from './ResourceCard.vue'
import ResourceCardSkeleton from './ResourceCardSkeleton.vue'
import { animationConfig } from '~/configs/animation.config'
import { hapticConfig } from '~/configs/haptic.config'
import { triggerHaptic } from '~/utils/hapticFeedback'
import { uiTimingConfig } from '~/configs/ui-timing.config'
import { uiConfig } from '~/configs/ui.config'

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

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'visited', id: string): void
  (e: 'error', error: Error): void
}>()

// Refs
const cardRef = ref<HTMLElement | null>(null)
const isHovering = ref(false)
const hasAnimated = ref(false)
const announcement = ref('')
const prefersReducedMotion = ref(false)

// Intersection observer for lazy loading
const { isIntersecting, isLoaded, observe } = useIntersectionObserver({
  rootMargin: '100px', // Start loading 100px before it comes into view
  // Flexy hates hardcoded 0.1! Using uiConfig.intersectionObserver.threshold
  threshold: uiConfig.intersectionObserver.threshold,
})

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Compute entrance duration based on config
const entranceDuration = computed(() => {
  return `${animationConfig.lazyResourceCard.entranceDurationMs}ms`
})

// Hover handlers - Palette's micro-UX: Track hover state for lift effect
const handleMouseEnter = () => {
  isHovering.value = true
}

const handleMouseLeave = () => {
  isHovering.value = false
}

// Handle card visited - Palette's micro-UX: Announce to screen readers
const handleVisited = (id: string) => {
  announcement.value = `Resource ${props.title || 'card'} visited`
  setTimeout(() => {
    announcement.value = ''
  }, uiTimingConfig.accessibility.announcementDuration)
  emit('visited', id)
}

// Handle error - Palette's micro-UX: Announce errors
const handleError = (error: Error) => {
  announcement.value = 'Error loading resource card'
  setTimeout(() => {
    announcement.value = ''
  }, uiTimingConfig.accessibility.announcementDuration)
  emit('error', error)
}

// After entrance animation completes
const handleAfterEnter = () => {
  hasAnimated.value = true
}

// Watch for intersection and trigger haptic feedback
watch(isIntersecting, (newValue, oldValue) => {
  // Only trigger on first intersection
  if (newValue && !oldValue && !prefersReducedMotion.value) {
    // BroCula fix: Haptic feedback when card becomes visible (checks user interaction)
    if (
      hapticConfig.features.lazyResourceCard?.enableEntranceHaptic !== false
    ) {
      triggerHaptic('light')
    }

    // Announce to screen readers
    announcement.value = 'Resource card loaded'
    setTimeout(() => {
      announcement.value = ''
    }, uiTimingConfig.accessibility.announcementDuration)
  }
})

// Media query refs for cleanup
let mediaQueryRef: MediaQueryList | null = null
let handleMotionChangeRef: ((e: MediaQueryListEvent) => void) | null = null

onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined') {
    mediaQueryRef = window.matchMedia('(prefers-reduced-motion: reduce)')
    handleMotionChangeRef = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQueryRef.addEventListener('change', handleMotionChangeRef)
  }

  if (cardRef.value) {
    observe(cardRef.value)
  }
})

onUnmounted(() => {
  // Cleanup media query listener
  if (mediaQueryRef && handleMotionChangeRef) {
    mediaQueryRef.removeEventListener('change', handleMotionChangeRef)
    mediaQueryRef = null
    handleMotionChangeRef = null
  }
})
</script>

<style scoped>
/* Base wrapper styles */
.lazy-resource-card-wrapper {
  min-height: 200px; /* Reserve space to prevent layout shift */
  position: relative;
  transition:
    transform v-bind('animationConfig.cssTransitions.normalSec') ease-out,
    box-shadow v-bind('animationConfig.cssTransitions.normalSec') ease-out;
}

/* Palette's micro-UX: Hover lift effect for loaded cards */
.lazy-resource-card-wrapper.is-loaded.is-hovering {
  transform: translateY(
      v-bind('animationConfig.lazyResourceCard.hoverLiftPx + "px"')
    )
    scale(v-bind('animationConfig.lazyResourceCard.hoverScale'));
  z-index: 10;
}

/* Skeleton container with shimmer */
.skeleton-container {
  position: relative;
  overflow: hidden;
}

/* Palette's micro-UX: Shimmer effect for skeleton loading state */
.shimmer-layer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer-sweep
    v-bind('animationConfig.lazyResourceCard.shimmerDurationSec') ease-in-out
    infinite;
  pointer-events: none;
  z-index: 1;
}

@keyframes shimmer-sweep {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Card container */
.card-container {
  will-change: transform, opacity;
}

/* Entrance animation for cards */
.entrance-animation {
  animation: card-entrance
    v-bind('animationConfig.lazyResourceCard.entranceDurationMs + "ms"')
    v-bind('animationConfig.lazyResourceCard.entranceEasing') forwards;
}

@keyframes card-entrance {
  0% {
    opacity: 0;
    transform: translateY(
        v-bind('animationConfig.lazyResourceCard.entranceDistancePx + "px"')
      )
      scale(v-bind('animationConfig.lazyResourceCard.entranceStartScale'));
  }
  60% {
    transform: translateY(-2px) scale(1.01);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Scale 98 utility for exit transitions */
.scale-98 {
  transform: scale(0.98);
}

/* Screen reader only */
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

/* Palette's micro-UX: Reduced motion support - disable animations */
@media (prefers-reduced-motion: reduce) {
  .lazy-resource-card-wrapper,
  .lazy-resource-card-wrapper.is-loaded.is-hovering,
  .card-container,
  .entrance-animation {
    transition: none !important;
    animation: none !important;
    transform: none !important;
  }

  .shimmer-layer {
    animation: none;
    display: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .lazy-resource-card-wrapper.is-loaded.is-hovering {
    outline: 2px solid currentColor;
    outline-offset: 2px;
    transform: none;
  }
}
</style>
