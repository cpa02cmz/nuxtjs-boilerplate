<template>
  <Transition
    appear
    :enter-active-class="
      prefersReducedMotion ? '' : 'transition-all duration-500 ease-out'
    "
    :enter-from-class="prefersReducedMotion ? '' : 'opacity-0 translate-y-4'"
    :enter-to-class="prefersReducedMotion ? '' : 'opacity-100 translate-y-0'"
  >
    <section
      v-if="resources && resources.length > 0"
      ref="sectionRef"
      class="similar-resources mt-12"
      :class="{ 'animations-enabled': !prefersReducedMotion }"
      role="region"
      :aria-label="contentConfig.similarResources.title"
    >
      <!-- Header with View All link -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">
          {{ contentConfig.similarResources.title }}
        </h2>
        <NuxtLink
          to="/"
          class="group flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md px-2 py-1 -mr-2 transition-colors duration-200"
          @click="handleViewAllClick"
        >
          <span>{{ contentConfig.similarResources.viewAll }}</span>
          <svg
            :class="[
              'w-4 h-4 ml-1 transition-transform duration-200',
              'group-hover:translate-x-1',
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </NuxtLink>
      </div>

      <!-- Resource Cards Grid with Staggered Entrance -->
      <TransitionGroup
        tag="div"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        :class="{ 'animations-enabled': !prefersReducedMotion }"
        enter-active-class="transition-all duration-500 ease-out"
        enter-from-class="opacity-0 translate-y-6 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-4 scale-95"
        @before-enter="handleBeforeEnter"
        @enter="handleEnter"
        @leave="handleLeave"
      >
        <div
          v-for="(resource, index) in resources"
          :key="resource.id"
          class="similar-resource-card-wrapper"
          :class="{
            'is-hovered': hoveredCard === resource.id,
            'is-pressed': pressedCard === resource.id,
          }"
          :style="getCardStyle(index)"
          @mouseenter="handleCardHover(resource.id)"
          @mouseleave="handleCardLeave"
          @mousedown="handleCardPress(resource.id)"
          @mouseup="handleCardRelease"
        >
          <ResourceCardLazy
            :title="resource.title"
            :description="resource.description"
            :benefits="[...resource.benefits]"
            :url="resource.url"
            :button-label="getButtonLabel(resource.category)"
            :date-added="resource.dateAdded"
            class="similar-resource-card"
          />
        </div>
      </TransitionGroup>

      <!-- Screen reader announcement -->
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        class="sr-only"
      >
        {{ announcement }}
      </div>
    </section>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Resource } from '~/composables/useResources'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'
import { zIndexScale } from '~/configs/z-index.config'
import { EASING } from '~/configs/easing.config'
import { hapticLight } from '~/utils/hapticFeedback'
import { uiTimingConfig } from '~/configs/ui-timing.config'

interface Props {
  resources: Resource[]
}

defineProps<Props>()

// Reactive state for micro-UX
const prefersReducedMotion = ref(false)
const hoveredCard = ref<string | null>(null)
const pressedCard = ref<string | null>(null)
const announcement = ref('')
const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Get card style with staggered delay
const getCardStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}

  const config = animationConfig.similarResources
  const staggerDelay = Math.min(
    index * config.staggerDelayMs,
    config.maxStaggerDelayMs
  )

  return {
    '--card-index': index,
    '--stagger-delay': `${staggerDelay}ms`,
  }
}

// Handle card hover
const handleCardHover = (resourceId: string) => {
  hoveredCard.value = resourceId
}

// Handle card leave
const handleCardLeave = () => {
  hoveredCard.value = null
  pressedCard.value = null
}

// Handle card press (mouse/touch down)
const handleCardPress = (resourceId: string) => {
  if (prefersReducedMotion.value) return
  pressedCard.value = resourceId
}

// Handle card release (mouse/touch up)
const handleCardRelease = () => {
  pressedCard.value = null
}

// Handle View All click with haptic feedback
const handleViewAllClick = () => {
  // Trigger haptic feedback
  hapticLight()

  // Announce to screen readers
  announcement.value = 'Navigating to view all resources'
  setTimeout(() => {
    announcement.value = ''
  }, uiTimingConfig.accessibility.announcementDuration)
}

// Transition handlers
const handleBeforeEnter = (el: Element) => {
  const htmlEl = el as HTMLElement
  htmlEl.style.opacity = '0'
  htmlEl.style.transform = 'translateY(24px) scale(0.95)'
}

const handleEnter = (el: Element, done: () => void) => {
  const htmlEl = el as HTMLElement
  const delay = parseInt(
    htmlEl.style.getPropertyValue('--stagger-delay') || '0'
  )

  if (prefersReducedMotion.value) {
    htmlEl.style.opacity = '1'
    htmlEl.style.transform = 'none'
    done()
    return
  }

  setTimeout(() => {
    htmlEl.style.transition = `all ${animationConfig.similarResources.entranceDurationSec} ${EASING.SPRING_SNAPPY}`
    htmlEl.style.opacity = '1'
    htmlEl.style.transform = 'translateY(0) scale(1)'

    setTimeout(done, animationConfig.similarResources.entranceDurationMs)
  }, delay)
}

const handleLeave = (el: Element, done: () => void) => {
  const htmlEl = el as HTMLElement

  if (prefersReducedMotion.value) {
    htmlEl.style.opacity = '0'
    done()
    return
  }

  htmlEl.style.transition = `all ${animationConfig.similarResources.leaveDurationSec} ease-in`
  htmlEl.style.opacity = '0'
  htmlEl.style.transform = 'translateY(16px) scale(0.95)'

  setTimeout(done, animationConfig.similarResources.leaveDurationMs)
}

const getButtonLabel = (category: string) => {
  type CategoryKey = keyof typeof contentConfig.similarResources.categoryLabels
  return (
    contentConfig.similarResources.categoryLabels[category as CategoryKey] ||
    contentConfig.similarResources.defaultButtonLabel
  )
}

// Intersection Observer for entrance animation
let observer: IntersectionObserver | null = null
let mediaQueryRef: MediaQueryList | null = null
let handleMotionChangeRef: ((e: MediaQueryListEvent) => void) | null = null

onMounted(() => {
  // Check reduced motion preference
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined') {
    mediaQueryRef = window.matchMedia('(prefers-reduced-motion: reduce)')
    handleMotionChangeRef = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQueryRef.addEventListener('change', handleMotionChangeRef)

    // Set up intersection observer for entrance animation
    if (sectionRef.value && !prefersReducedMotion.value) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              isVisible.value = true
              observer?.disconnect()
            }
          })
        },
        { threshold: 0.1 }
      )
      observer.observe(sectionRef.value)
    } else {
      isVisible.value = true
    }
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (mediaQueryRef && handleMotionChangeRef) {
    mediaQueryRef.removeEventListener('change', handleMotionChangeRef)
    mediaQueryRef = null
    handleMotionChangeRef = null
  }
})
</script>

<style scoped>
/* Palette's micro-UX delight: Similar Resources Section Styles */

.similar-resources {
  position: relative;
}

/* Card wrapper for hover and press effects */
.similar-resource-card-wrapper {
  position: relative;
  transition:
    transform
      v-bind('animationConfig.similarResources.hoverTransitionMs + "ms"')
      v-bind('EASING.SPRING_STANDARD'),
    box-shadow
      v-bind('animationConfig.similarResources.hoverTransitionMs + "ms"')
      ease-out;
  will-change: transform;
  backface-visibility: hidden;
}

/* Hover state: Lift and enhance shadow */
.similar-resource-card-wrapper:not(.is-pressed):hover,
.similar-resource-card-wrapper.is-hovered {
  transform: translateY(
      v-bind('animationConfig.similarResources.hoverLiftPx + "px"')
    )
    scale(v-bind('animationConfig.similarResources.hoverScale'));
  /* Flexy hates hardcoded z-index! Using config instead. */
  z-index: v-bind('zIndexScale.low[10]');
}

/* Pressed state: Scale down for tactile feedback */
.similar-resource-card-wrapper.is-pressed {
  transform: scale(
    v-bind('animationConfig.similarResources.pressScale')
  ) !important;
  transition: transform
    v-bind('animationConfig.similarResources.pressTransitionMs + "ms"') ease-out;
}

/* Staggered entrance animation */
.similar-resource-card-wrapper {
  opacity: 0;
  transform: translateY(
      v-bind('animationConfig.similarResources.entranceDistancePx + "px"')
    )
    scale(v-bind('animationConfig.similarResources.entranceStartScale'));
  animation: card-entrance
    v-bind('animationConfig.similarResources.entranceDurationSec')
    v-bind('EASING.SPRING_SNAPPY') forwards;
  animation-delay: var(--stagger-delay, 0ms);
}

/* Only animate when section is visible and animations are enabled */
.animations-enabled .similar-resource-card-wrapper {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@keyframes card-entrance {
  from {
    opacity: 0;
    transform: translateY(
        v-bind('animationConfig.similarResources.entranceDistancePx + "px"')
      )
      scale(v-bind('animationConfig.similarResources.entranceStartScale'));
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* View All link hover animation */
.group:hover svg {
  animation: arrow-bounce
    v-bind('animationConfig.similarResources.arrowBounceDurationSec')
    ease-in-out;
}

@keyframes arrow-bounce {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(4px);
  }
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

/* Reduced motion support - Palette cares about accessibility! */
@media (prefers-reduced-motion: reduce) {
  .similar-resource-card-wrapper {
    transition: none;
    animation: none;
    opacity: 1;
    transform: none;
  }

  .similar-resource-card-wrapper:hover,
  .similar-resource-card-wrapper.is-hovered {
    transform: none;
  }

  .similar-resource-card-wrapper.is-pressed {
    transform: scale(0.98) !important;
  }

  .group:hover svg {
    animation: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .similar-resource-card-wrapper:focus-within {
    outline: 2px solid currentColor;
    outline-offset: 4px;
  }
}
</style>
