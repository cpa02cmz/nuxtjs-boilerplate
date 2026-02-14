<template>
  <div
    v-if="resources && resources.length > 0"
    class="mt-12 resource-similar"
    :class="{ 'resource-similar--reduced-motion': prefersReducedMotion }"
  >
    <!-- Header with shimmer effect - Palette's micro-UX delight! -->
    <div class="flex justify-between items-center mb-6 relative">
      <h2 class="text-2xl font-bold text-gray-900 relative">
        {{ contentConfig.similarResources.title }}
        <!-- Subtle shimmer line under heading -->
        <span
          v-if="!prefersReducedMotion"
          class="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shimmer-line"
          aria-hidden="true"
        />
      </h2>

      <!-- View All link with arrow animation - Palette's micro-UX delight! -->
      <NuxtLink
        to="/"
        class="group text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded px-1 -mr-1"
        @mouseenter="isViewAllHovered = true"
        @mouseleave="isViewAllHovered = false"
      >
        <span>{{ contentConfig.similarResources.viewAll }}</span>
        <span
          class="transition-transform duration-200 ease-out"
          :class="{ 'translate-x-1': isViewAllHovered }"
          aria-hidden="true"
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      </NuxtLink>
    </div>

    <!-- Resource cards grid with staggered entrance animation -->
    <TransitionGroup
      tag="div"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      :class="{ 'stagger-entrance': !prefersReducedMotion }"
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 translate-y-8 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
    >
      <div
        v-for="(resource, index) in resources"
        :key="resource.id"
        class="resource-card-wrapper"
        :style="getCardStyle(index)"
        :data-index="index"
      >
        <!-- Hover glow effect - Palette's micro-UX delight! -->
        <div
          v-if="hoveredCard === resource.id && !prefersReducedMotion"
          class="card-glow"
          aria-hidden="true"
        />

        <LazyResourceCard
          :title="resource.title"
          :description="resource.description"
          :benefits="[...resource.benefits]"
          :url="resource.url"
          :button-label="getButtonLabel(resource.category)"
          :date-added="resource.dateAdded"
          class="relative z-10"
          @mouseenter="hoveredCard = resource.id"
          @mouseleave="hoveredCard = null"
        />
      </div>
    </TransitionGroup>

    <!-- Screen reader announcement -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ announcement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Resource } from '~/composables/useResources'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'

interface Props {
  resources: Resource[]
}

const props = defineProps<Props>()

// Palette's micro-UX enhancement: Track hover states for delightful interactions
const isViewAllHovered = ref(false)
const hoveredCard = ref<string | null>(null)
const prefersReducedMotion = ref(false)
const announcement = ref('')

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Get card style for staggered entrance
const getCardStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}

  const config = animationConfig.similarResources || {
    staggerDelayMs: 100,
    entranceDurationMs: 500,
    entranceDistancePx: 30,
  }

  return {
    '--card-index': index,
    '--stagger-delay': `${config.staggerDelayMs}ms`,
    '--entrance-duration': `${config.entranceDurationMs}ms`,
    '--entrance-distance': `${config.entranceDistancePx || 30}px`,
  } as Record<string, string>
}

// Transition event handlers for accessibility announcements
const onBeforeEnter = (el: Element) => {
  const htmlEl = el as HTMLElement
  htmlEl.style.opacity = '0'
  htmlEl.style.transform = `translateY(${animationConfig.similarResources?.entranceDistancePx || 30}px)`
}

const onEnter = (el: Element, done: () => void) => {
  const htmlEl = el as HTMLElement
  const index = parseInt(htmlEl.getAttribute('data-index') || '0')
  const delay =
    (animationConfig.similarResources?.staggerDelayMs || 100) * index

  setTimeout(() => {
    htmlEl.style.transition = `all ${animationConfig.similarResources?.entranceDurationMs || 500}ms ease-out`
    htmlEl.style.opacity = '1'
    htmlEl.style.transform = 'translateY(0)'
    done()
  }, delay)
}

const getButtonLabel = (category: string) => {
  type CategoryKey = keyof typeof contentConfig.similarResources.categoryLabels
  return (
    contentConfig.similarResources.categoryLabels[category as CategoryKey] ||
    contentConfig.similarResources.defaultButtonLabel
  )
}

// Announce to screen readers when resources are loaded
const announceResources = () => {
  if (props.resources.length > 0) {
    announcement.value = `Showing ${props.resources.length} similar resources`
    setTimeout(() => {
      announcement.value = ''
    }, 3000)
  }
}

// Setup lifecycle hooks
let mediaQuery: MediaQueryList | null = null
let mediaQueryHandler: ((e: MediaQueryListEvent) => void) | null = null

onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined' && window.matchMedia) {
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQueryHandler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', mediaQueryHandler)
  }

  // Announce resources after a short delay
  setTimeout(announceResources, 500)
})

onUnmounted(() => {
  if (mediaQuery && mediaQueryHandler) {
    mediaQuery.removeEventListener('change', mediaQueryHandler)
  }
})
</script>

<style scoped>
/* Staggered entrance animation - Palette's micro-UX delight! */
.stagger-entrance > * {
  animation: card-stagger-entrance var(--entrance-duration, 500ms) ease-out
    backwards;
  animation-delay: calc(var(--stagger-delay, 100ms) * var(--card-index, 0));
}

@keyframes card-stagger-entrance {
  0% {
    opacity: 0;
    transform: translateY(var(--entrance-distance, 30px)) scale(0.95);
  }
  60% {
    transform: translateY(-4px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Resource card wrapper with hover effects */
.resource-card-wrapper {
  position: relative;
  transition: transform v-bind('animationConfig.cssTransitions.standardSec')
    ease-out;
}

.resource-card-wrapper:hover {
  transform: translateY(-4px);
}

/* Glow effect on hover - Palette's micro-UX delight! */
.card-glow {
  position: absolute;
  inset: -4px;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.1) 0%,
    rgba(139, 92, 246, 0.1) 100%
  );
  border-radius: 12px;
  z-index: 0;
  animation: glow-pulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes glow-pulse {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}

/* Shimmer line under heading */
.shimmer-line {
  width: 60px;
  animation: shimmer-slide 3s ease-in-out infinite;
}

@keyframes shimmer-slide {
  0%,
  100% {
    transform: translateX(0);
    opacity: 0.6;
  }
  50% {
    transform: translateX(20px);
    opacity: 1;
  }
}

/* Reduced motion support */
.resource-similar--reduced-motion .stagger-entrance > * {
  animation: none;
}

.resource-similar--reduced-motion .card-glow {
  display: none;
}

.resource-similar--reduced-motion .shimmer-line {
  animation: none;
  opacity: 0.8;
}

.resource-similar--reduced-motion .resource-card-wrapper:hover {
  transform: none;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .card-glow {
    display: none;
  }

  .resource-card-wrapper:hover {
    outline: 2px solid currentColor;
    outline-offset: 2px;
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
</style>
