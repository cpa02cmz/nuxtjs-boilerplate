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
          :class="[
            'h-4 w-4 ml-1 transition-transform group-hover:translate-x-1',
            animationConfig.tailwindDurations.normal,
          ]"
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
        <LazyLoadResourceCard
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
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import { useAlternativeSuggestions } from '~/composables/useAlternativeSuggestions'
import { useResourceData } from '~/composables/useResourceData'
import type { Resource, AlternativeSuggestion } from '~/types/resource'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'
import { EASING } from '~/configs/easing.config'
import { componentColorsConfig } from '~/configs/component-colors.config'
import { getButtonLabel } from '~/utils/resourceHelper'
import { uiTimingConfig } from '~/configs/ui-timing.config'

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
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
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
  await new Promise(resolve =>
    setTimeout(resolve, animationConfig.alternativeSuggestions.loadingDelayMs)
  )

  try {
    alternatives.value = getAlternativesForResource(props.resource)
    hasAttemptedLoad.value = true

    // Announce to screen readers
    if (alternatives.value.length > 0) {
      announcementText.value = `${alternatives.value.length} alternative suggestions loaded`
      setTimeout(() => {
        announcementText.value = ''
      }, uiTimingConfig.alternatives.announcementClearDelay)
    }
  } catch {
    alternatives.value = []
    hasAttemptedLoad.value = true
  } finally {
    isLoading.value = false
  }
}

// Media query refs for cleanup
let mediaQueryRef: MediaQueryList | null = null
let handleMotionChangeRef: ((e: MediaQueryListEvent) => void) | null = null

// Initialize on component mount
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes
  mediaQueryRef = window.matchMedia('(prefers-reduced-motion: reduce)')
  handleMotionChangeRef = (e: MediaQueryListEvent) => {
    prefersReducedMotion.value = e.matches
  }
  mediaQueryRef.addEventListener('change', handleMotionChangeRef)

  initAlternatives()
})

// Cleanup on unmount
onUnmounted(() => {
  if (mediaQueryRef && handleMotionChangeRef) {
    mediaQueryRef.removeEventListener('change', handleMotionChangeRef)
    mediaQueryRef = null
    handleMotionChangeRef = null
  }
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
  background: linear-gradient(
    135deg,
    v-bind('componentColorsConfig.alternativeSuggestions.icon.gradientStart') 0%,
    v-bind('componentColorsConfig.alternativeSuggestions.icon.gradientEnd') 100%
  );
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px
    v-bind('componentColorsConfig.alternativeSuggestions.icon.shadow');
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
    box-shadow: 0 4px 6px -1px
      v-bind('componentColorsConfig.alternativeSuggestions.icon.shadow');
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 8px 12px -2px
      v-bind('componentColorsConfig.alternativeSuggestions.icon.shadowHover');
  }
}

.alternative-suggestions__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: v-bind('componentColorsConfig.alternativeSuggestions.title');
  line-height: 1.2;
}

.alternative-suggestions__subtitle {
  font-size: 0.875rem;
  color: v-bind('componentColorsConfig.alternativeSuggestions.subtitle');
  margin-top: 0.25rem;
}

.alternative-suggestions__view-all {
  display: inline-flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: v-bind('componentColorsConfig.alternativeSuggestions.link.default');
  text-decoration: none;
  transition: color v-bind('animationConfig.cssTransitions.normalSec') ease;
}

.alternative-suggestions__view-all:hover {
  color: v-bind('componentColorsConfig.alternativeSuggestions.link.hover');
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
  background: v-bind(
    'componentColorsConfig.alternativeSuggestions.card.background'
  );
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid
    v-bind('componentColorsConfig.alternativeSuggestions.card.border');
  box-shadow: 0 1px 3px 0
    rgba(
      v-bind('componentColorsConfig.alternativeSuggestions.card.shadow'),
      0.1
    );
}

.skeleton-icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    v-bind(
        'componentColorsConfig.alternativeSuggestions.skeleton.gradientStart'
      )
      0%,
    v-bind(
        'componentColorsConfig.alternativeSuggestions.skeleton.gradientMiddle'
      )
      25%,
    v-bind(
        'componentColorsConfig.alternativeSuggestions.skeleton.gradientStart'
      )
      50%,
    v-bind(
        'componentColorsConfig.alternativeSuggestions.skeleton.gradientMiddle'
      )
      75%,
    v-bind(
        'componentColorsConfig.alternativeSuggestions.skeleton.gradientStart'
      )
      100%
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
      v-bind('EASING.SPRING_SNAPPY');
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
    v-bind('EASING.SPRING_SNAPPY');
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
    v-bind('EASING.SPRING_SNAPPY');
}

/* Empty State */
.alternative-suggestions__empty {
  text-align: center;
  padding: 3rem 1.5rem;
  background: linear-gradient(
    135deg,
    v-bind(
        'componentColorsConfig.alternativeSuggestions.emptyState.backgroundStart'
      )
      0%,
    v-bind(
        'componentColorsConfig.alternativeSuggestions.emptyState.backgroundEnd'
      )
      100%
  );
  border-radius: 1rem;
  border: 2px dashed
    v-bind('componentColorsConfig.alternativeSuggestions.emptyState.border');
}

.alternative-suggestions__empty-icon {
  color: v-bind('componentColorsConfig.alternativeSuggestions.emptyState.icon');
  margin-bottom: 1rem;
}

.alternative-suggestions__empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: v-bind(
    'componentColorsConfig.alternativeSuggestions.emptyState.title'
  );
  margin-bottom: 0.5rem;
}

.alternative-suggestions__empty-message {
  font-size: 0.875rem;
  color: v-bind(
    'componentColorsConfig.alternativeSuggestions.emptyState.message'
  );
  margin-bottom: 1.5rem;
  max-width: 24rem;
  margin-left: auto;
  margin-right: auto;
}

.alternative-suggestions__empty-cta {
  display: inline-flex;
  align-items: center;
  padding: 0.625rem 1.25rem;
  background-color: v-bind(
    'componentColorsConfig.alternativeSuggestions.emptyState.ctaBg'
  );
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
  background-color: v-bind(
    'componentColorsConfig.alternativeSuggestions.emptyState.ctaHover'
  );
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
