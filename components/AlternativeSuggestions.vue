<template>
  <section
    v-if="alternatives.length > 0 || isLoading"
    class="alternative-suggestions"
    role="region"
    :aria-label="contentConfig.alternativeSuggestions.aria.regionLabel"
  >
    <!-- Header with icon and link -->
    <div class="alternative-suggestions__header">
      <div class="alternative-suggestions__title-wrapper">
        <div
          class="alternative-suggestions__icon"
          :class="{ 'animate-icon-pulse': !prefersReducedMotion && isLoading }"
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <div>
          <h2 class="alternative-suggestions__title">
            {{ contentConfig.alternativeSuggestions.title }}
          </h2>
          <p class="alternative-suggestions__subtitle">
            {{ contentConfig.alternativeSuggestions.subtitle }}
          </p>
        </div>
      </div>
      <NuxtLink
        to="/"
        class="alternative-suggestions__view-all"
      >
        <span>{{ contentConfig.similarResources.viewAll }}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 ml-1 transition-transform duration-200 group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="alternative-suggestions__loading"
      role="status"
      aria-live="polite"
    >
      <div class="alternative-suggestions__loading-grid">
        <div
          v-for="i in 3"
          :key="`skeleton-${i}`"
          class="alternative-suggestions__skeleton-card"
          :class="{ 'animate-pulse': !prefersReducedMotion }"
          :style="{ animationDelay: `${(i - 1) * 150}ms` }"
        >
          <div class="skeleton-shimmer skeleton-icon rounded-lg" />
          <div class="space-y-3">
            <div class="skeleton-shimmer h-5 rounded w-3/4" />
            <div class="skeleton-shimmer h-4 rounded w-full" />
            <div class="skeleton-shimmer h-4 rounded w-5/6" />
          </div>
          <div class="mt-4 pt-4 border-t border-gray-100">
            <div class="skeleton-shimmer h-3 rounded w-1/3" />
          </div>
        </div>
      </div>
      <p class="sr-only">
        {{ contentConfig.alternativeSuggestions.aria.loadingAnnouncement }}
      </p>
    </div>

    <!-- Alternatives Grid with Staggered Animation -->
    <TransitionGroup
      v-else
      name="alternative-card"
      tag="div"
      class="alternative-suggestions__grid"
      :class="{ 'animations-enabled': !prefersReducedMotion }"
      @before-enter="handleBeforeEnter"
      @enter="handleEnter"
    >
      <div
        v-for="(alternative, index) in alternatives"
        :key="alternative.resource.id"
        class="alternative-suggestions__card-wrapper"
        :style="getCardStyle(index)"
      >
        <LazyResourceCard
          :title="alternative.resource.title"
          :description="alternative.resource.description"
          :benefits="[...alternative.resource.benefits]"
          :url="alternative.resource.url"
          :button-label="getButtonLabel(alternative.resource.category)"
          :similarity-score="alternative.score"
          :similarity-reason="alternative.reason"
          :date-added="alternative.resource.dateAdded"
          class="alternative-suggestions__card"
        />
      </div>
    </TransitionGroup>

    <!-- Empty State -->
    <div
      v-if="!isLoading && alternatives.length === 0 && hasAttemptedLoad"
      class="alternative-suggestions__empty"
      role="status"
    >
      <div class="alternative-suggestions__empty-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      </div>
      <h3 class="alternative-suggestions__empty-title">
        {{ contentConfig.alternativeSuggestions.emptyState.title }}
      </h3>
      <p class="alternative-suggestions__empty-message">
        {{ contentConfig.alternativeSuggestions.emptyState.message }}
      </p>
      <NuxtLink
        to="/"
        class="alternative-suggestions__empty-cta"
      >
        {{ contentConfig.alternativeSuggestions.emptyState.browseAll }}
      </NuxtLink>
    </div>

    <!-- Screen reader announcements -->
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ announcementText }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue'
import { useAlternativeSuggestions } from '~/composables/useAlternativeSuggestions'
import { useResourceData } from '~/composables/useResourceData'
import type { Resource, AlternativeSuggestion } from '~/types/resource'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'

interface Props {
  resource?: Resource
}

const props = withDefaults(defineProps<Props>(), {
  resource: () => ({}) as Resource,
})

const alternatives = ref<AlternativeSuggestion[]>([])
const isLoading = ref(true)
const hasAttemptedLoad = ref(false)
const prefersReducedMotion = ref(false)
const announcementText = ref('')

const { resources } = useResourceData()
const { getAlternativesForResource } = useAlternativeSuggestions(
  resources.value
)

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Get card style with staggered delay
const getCardStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}

  const config = animationConfig.alternativeSuggestions
  const staggerDelay = Math.min(
    index * config.staggerDelayMs,
    config.maxStaggerDelayMs
  )

  return {
    '--card-index': index,
    '--stagger-delay': `${staggerDelay}ms`,
  }
}

// Handle before enter - set initial state
const handleBeforeEnter = (el: Element) => {
  const htmlEl = el as HTMLElement
  htmlEl.style.opacity = '0'
}

// Handle enter animation
const handleEnter = (el: Element, done: () => void) => {
  const htmlEl = el as HTMLElement
  const delay = parseInt(
    htmlEl.style.getPropertyValue('--stagger-delay') || '0'
  )

  setTimeout(() => {
    htmlEl.style.opacity = '1'
    done()
  }, delay)
}

// Get button label based on category
const getButtonLabel = (category: string) => {
  const categoryLabels: Record<string, string> = {
    'AI Tools': 'Try AI Tool',
    Hosting: 'Get Hosting',
    Databases: 'Connect Database',
    CDN: 'Use CDN',
    VPS: 'Get VPS',
    Analytics: 'Use Analytics',
    APIs: 'Use API',
    'Developer Tools': 'Use Tool',
    Design: 'Use Design Tool',
    Productivity: 'Boost Productivity',
  }
  return categoryLabels[category] || 'Try Alternative'
}

// Initialize alternatives with loading state
const initAlternatives = async () => {
  if (!props.resource || !props.resource.id) {
    isLoading.value = false
    hasAttemptedLoad.value = true
    return
  }

  isLoading.value = true
  hasAttemptedLoad.value = false

  // Small delay to show loading state for better UX
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 300))

  try {
    alternatives.value = getAlternativesForResource(props.resource)
    hasAttemptedLoad.value = true

    // Announce to screen readers
    if (alternatives.value.length > 0) {
      announcementText.value = `${alternatives.value.length} alternative suggestions loaded`
      setTimeout(() => {
        announcementText.value = ''
      }, 1000)
    }
  } catch {
    alternatives.value = []
    hasAttemptedLoad.value = true
  } finally {
    isLoading.value = false
  }
}

// Initialize on component mount
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const handleMotionChange = (e: MediaQueryListEvent) => {
    prefersReducedMotion.value = e.matches
  }
  mediaQuery.addEventListener('change', handleMotionChange)

  initAlternatives()
})

// Watch for changes in resource
watch(
  () => props.resource,
  () => {
    initAlternatives()
  },
  { deep: true }
)
</script>

<style scoped>
/* Alternative Suggestions Section */
.alternative-suggestions {
  margin-top: 3rem;
}

.alternative-suggestions__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.alternative-suggestions__title-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.alternative-suggestions__icon {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(251, 191, 36, 0.3);
}

.animate-icon-pulse {
  animation: icon-pulse
    v-bind(
      'animationConfig.alternativeSuggestions.loadingPulseDurationSec + "s"'
    )
    ease-in-out infinite;
}

@keyframes icon-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 4px 6px -1px rgba(251, 191, 36, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 8px 12px -2px rgba(251, 191, 36, 0.4);
  }
}

.alternative-suggestions__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.alternative-suggestions__subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.alternative-suggestions__view-all {
  display: inline-flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: #2563eb;
  text-decoration: none;
  transition: color 0.2s ease;
}

.alternative-suggestions__view-all:hover {
  color: #1d4ed8;
}

/* Loading State */
.alternative-suggestions__loading-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .alternative-suggestions__loading-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .alternative-suggestions__loading-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.alternative-suggestions__skeleton-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.skeleton-icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    #f3f4f6 0%,
    #e5e7eb 25%,
    #f3f4f6 50%,
    #e5e7eb 75%,
    #f3f4f6 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Alternatives Grid */
.alternative-suggestions__grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .alternative-suggestions__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .alternative-suggestions__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.alternative-suggestions__card-wrapper {
  opacity: 0;
  transform: translateY(
      v-bind('animationConfig.alternativeSuggestions.entranceDistancePx + "px"')
    )
    scale(v-bind('animationConfig.alternativeSuggestions.entranceStartScale'));
  transition:
    opacity v-bind('animationConfig.alternativeSuggestions.entranceDurationSec')
      ease-out,
    transform
      v-bind('animationConfig.alternativeSuggestions.entranceDurationSec')
      cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-delay: var(--stagger-delay, 0ms);
}

.alternative-suggestions__grid.animations-enabled
  .alternative-suggestions__card-wrapper {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.alternative-suggestions__card {
  height: 100%;
  transition:
    transform v-bind('animationConfig.transition.normal.durationMs + "ms"')
      ease-out,
    box-shadow v-bind('animationConfig.transition.normal.durationMs + "ms"')
      ease-out;
}

.alternative-suggestions__card:hover {
  transform: translateY(
      v-bind('animationConfig.alternativeSuggestions.hoverLiftPx + "px"')
    )
    scale(v-bind('animationConfig.alternativeSuggestions.hoverScale'));
}

/* Vue Transition Group Styles */
.alternative-card-enter-active,
.alternative-card-leave-active {
  transition: all
    v-bind('animationConfig.alternativeSuggestions.entranceDurationSec')
    cubic-bezier(0.34, 1.56, 0.64, 1);
}

.alternative-card-enter-from,
.alternative-card-leave-to {
  opacity: 0;
  transform: translateY(
      v-bind('animationConfig.alternativeSuggestions.entranceDistancePx + "px"')
    )
    scale(v-bind('animationConfig.alternativeSuggestions.entranceStartScale'));
}

.alternative-card-move {
  transition: transform
    v-bind('animationConfig.transition.slow.durationMs + "ms"')
    cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Empty State */
.alternative-suggestions__empty {
  text-align: center;
  padding: 3rem 1.5rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 1rem;
  border: 2px dashed #e5e7eb;
}

.alternative-suggestions__empty-icon {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.alternative-suggestions__empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.alternative-suggestions__empty-message {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
  max-width: 24rem;
  margin-left: auto;
  margin-right: auto;
}

.alternative-suggestions__empty-cta {
  display: inline-flex;
  align-items: center;
  padding: 0.625rem 1.25rem;
  background-color: #2563eb;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.alternative-suggestions__empty-cta:hover {
  background-color: #1d4ed8;
  transform: translateY(-1px);
}

/* Screen Reader Only */
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

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .alternative-suggestions__card-wrapper,
  .alternative-suggestions__card,
  .alternative-suggestions__view-all,
  .alternative-suggestions__empty-cta {
    transition: none;
    animation: none;
  }

  .skeleton-shimmer,
  .animate-icon-pulse {
    animation: none;
  }

  .alternative-suggestions__card-wrapper {
    opacity: 1;
    transform: none;
  }

  .alternative-card-enter-active,
  .alternative-card-leave-active,
  .alternative-card-move {
    transition: none;
  }
}
</style>
