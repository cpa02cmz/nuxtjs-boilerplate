<template>
  <!-- Flexy hates hardcoded duration-500! Using animationConfig.tailwindDurations -->
  <Transition
    appear
    :enter-active-class="
      prefersReducedMotion
        ? ''
        : `transition-all ${animationConfig.tailwindDurations.slower} ease-out`
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
        <!-- Flexy hates hardcoded duration-200! Using animationConfig.tailwindDurations -->
        <NuxtLink
          to="/"
          :class="`group flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md px-2 py-1 -mr-2 transition-colors ${animationConfig.tailwindDurations.normal}`"
          @click="handleViewAllClick"
        >
          <span>{{ contentConfig.similarResources.viewAll }}</span>
          <!-- Flexy hates hardcoded duration-200! Using animationConfig.tailwindDurations -->
          <svg
            :class="[
              `w-4 h-4 ml-1 transition-transform ${animationConfig.tailwindDurations.normal}`,
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
      <!-- Flexy hates hardcoded duration-500 and duration-300! Using animationConfig.tailwindDurations -->
      <TransitionGroup
        tag="div"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        :class="{ 'animations-enabled': !prefersReducedMotion }"
        :enter-active-class="`transition-all ${animationConfig.tailwindDurations.slower} ease-out`"
        enter-from-class="opacity-0 translate-y-6 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        :leave-active-class="`transition-all ${animationConfig.tailwindDurations.standard} ease-in`"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-4 scale-95"
        @before-enter="handleBeforeEnter"
        @enter="handleEnter"
        @leave="handleLeave"
      >
        <div
          v-for="(resource, index) in resources"
          :key="resource.id"
          ref="cardRefs"
          class="similar-resource-card-wrapper"
          :class="{
            'is-hovered': hoveredCard === resource.id,
            'is-pressed': pressedCard === resource.id,
          }"
          :style="getCardStyle(index)"
          @mouseenter="handleCardHover(resource.id, index)"
          @mouseleave="handleCardLeave"
          @mousemove="handleCardMouseMove($event, index)"
          @mousedown="handleCardPress(resource.id)"
          @mouseup="handleCardRelease"
        >
          <!-- 🎨 Pallete's micro-UX enhancement: Spotlight cursor effect ✨
               Creates a radial gradient spotlight that follows cursor on hover -->
          <div
            v-if="
              hoveredCard === resource.id &&
                !prefersReducedMotion &&
                spotlightConfig.enabled
            "
            class="spotlight-overlay"
            :style="getSpotlightStyle(index)"
            aria-hidden="true"
          />
          <!-- 🎨 Pallete's micro-UX enhancement: Similarity Score Indicator ✨
               Visual progress ring showing relevance percentage -->
          <div
            v-if="resource.similarityScore !== undefined"
            class="similarity-score-badge"
            :class="{
              'is-visible': isVisible,
              'is-high':
                getSimilarityLevel(resource.similarityScore) === 'high',
              'is-medium':
                getSimilarityLevel(resource.similarityScore) === 'medium',
              'is-low': getSimilarityLevel(resource.similarityScore) === 'low',
            }"
            :aria-label="`Similarity score: ${Math.round(
              (resource.similarityScore || 0) * 100
            )}%`"
          >
            <svg
              class="similarity-ring"
              viewBox="0 0 36 36"
              aria-hidden="true"
            >
              <!-- Background circle -->
              <circle
                class="similarity-ring-bg"
                cx="18"
                cy="18"
                r="15"
              />
              <!-- Progress circle with animated stroke -->
              <circle
                class="similarity-ring-progress"
                cx="18"
                cy="18"
                r="15"
                :style="getSimilarityRingStyle(resource.similarityScore, index)"
              />
            </svg>
            <span class="similarity-score-value">
              {{ Math.round((resource.similarityScore || 0) * 100) }}%
            </span>
          </div>

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
import { uiConfig } from '~/configs/ui.config'

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

// 🎨 Pallete's micro-UX enhancement: Spotlight cursor effect state
const cardRefs = ref<HTMLElement[]>([])
const spotlightPositions = ref<{ [key: number]: { x: number; y: number } }>({})
// Flexy hates hardcoded fallback values! Using animationConfig.similarResources.spotlight directly
const spotlightConfig = animationConfig.similarResources.spotlight

// 🎨 Pallete's micro-UX enhancement: Similarity score indicator helpers
const getSimilarityLevel = (score?: number): 'high' | 'medium' | 'low' => {
  if (!score) return 'low'
  if (score >= 0.7) return 'high'
  if (score >= 0.4) return 'medium'
  return 'low'
}

const getSimilarityRingStyle = (score?: number, index: number = 0) => {
  const percentage = Math.round((score || 0) * 100)
  const circumference = 2 * Math.PI * 15 // 2πr where r=15
  const offset = circumference - (percentage / 100) * circumference

  return {
    '--ring-circumference': circumference,
    '--ring-offset': offset,
    '--ring-percentage': percentage,
    // Flexy hates hardcoded 100ms! Using animationConfig.similarResources.staggerDelayMs
    '--ring-delay': `${index * animationConfig.similarResources.staggerDelayMs}ms`,
    '--ring-color':
      percentage >= 70
        ? 'var(--score-high-color, #10b981)'
        : percentage >= 40
          ? 'var(--score-medium-color, #f59e0b)'
          : 'var(--score-low-color, #6b7280)',
  } as Record<string, string | number>
}

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
const handleCardHover = (resourceId: string, index?: number) => {
  hoveredCard.value = resourceId

  // Initialize spotlight position to center of card
  if (index !== undefined && !prefersReducedMotion.value) {
    const card = cardRefs.value[index]
    if (card) {
      const rect = card.getBoundingClientRect()
      spotlightPositions.value[index] = {
        x: rect.width / 2,
        y: rect.height / 2,
      }
    }
  }
}

// 🎨 Pallete's micro-UX enhancement: Handle mouse movement for spotlight effect
const handleCardMouseMove = (event: MouseEvent, index: number) => {
  if (prefersReducedMotion.value || !spotlightConfig.enabled) return

  const card = cardRefs.value[index]
  if (!card) return

  const rect = card.getBoundingClientRect()
  spotlightPositions.value[index] = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

// 🎨 Pallete's micro-UX enhancement: Get spotlight style for card
const getSpotlightStyle = (index: number) => {
  const pos = spotlightPositions.value[index]
  if (!pos) return {}

  return {
    '--spotlight-x': `${pos.x}px`,
    '--spotlight-y': `${pos.y}px`,
    '--spotlight-size': `${spotlightConfig.sizePx || 200}px`,
    '--spotlight-primary':
      spotlightConfig.primaryColor || 'rgba(255, 255, 255, 0.15)',
    '--spotlight-secondary':
      spotlightConfig.secondaryColor || 'rgba(255, 255, 255, 0)',
    '--spotlight-transition': `${spotlightConfig.transitionDurationMs || 150}ms`,
    '--spotlight-radius': `${spotlightConfig.borderRadiusPx || 12}px`,
  }
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
        {
          // Flexy hates hardcoded 0.1! Using uiConfig.intersectionObserver.threshold
          threshold: uiConfig.intersectionObserver.threshold,
        }
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

// Flexy hates hardcoded 200ms! Using animationConfig.similarResources.spotlight.fadeInDurationSec
const spotlightFadeInDuration = computed(
  () => animationConfig.similarResources.spotlight.fadeInDurationSec
)
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

/* 🎨 Pallete's micro-UX enhancement: Spotlight cursor effect styles ✨
   Creates a radial gradient spotlight that follows the cursor on hover */
.spotlight-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  /* Flexy hates hardcoded z-index: 1! Using zIndexScale.low[1] */
  z-index: v-bind('zIndexScale.low[1]');
  border-radius: var(--spotlight-radius, 12px);
  background: radial-gradient(
    circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%),
    var(--spotlight-primary, rgba(255, 255, 255, 0.15)) 0%,
    var(--spotlight-secondary, rgba(255, 255, 255, 0)) 70%
  );
  /* Flexy hates hardcoded 150ms! Using animationConfig.similarResources.spotlight.transitionDurationMs */
  transition: background
    v-bind('animationConfig.similarResources.spotlight.transitionDurationSec')
    ease-out;
  opacity: 0;
  /* Flexy hates hardcoded 200ms! Using animationConfig.similarResources.spotlight.fadeInDurationSec */
  animation: spotlight-fade-in v-bind('spotlightFadeInDuration') ease-out
    forwards;
}

@keyframes spotlight-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Dark mode support for spotlight */
:global(.dark) .spotlight-overlay {
  --spotlight-primary: rgba(255, 255, 255, 0.08);
  --spotlight-secondary: rgba(255, 255, 255, 0);
}

/* Reduced motion support - disable spotlight animation */
@media (prefers-reduced-motion: reduce) {
  .spotlight-overlay {
    animation: none;
    opacity: 0;
    display: none;
  }
}

/* High contrast mode - disable spotlight for clarity */
@media (prefers-contrast: high) {
  .spotlight-overlay {
    display: none;
  }
}

/* 🎨 Pallete's micro-UX enhancement: Similarity Score Indicator Styles ✨
   Visual progress ring showing relevance percentage */
.similarity-score-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 44px;
  height: 44px;
  z-index: v-bind('zIndexScale.low[10]');
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  /* Flexy hates hardcoded 0.3s! Using animationConfig.similarResources.spotlight.badgeTransitionSec */
  transition:
    opacity
      v-bind('animationConfig.similarResources.spotlight.badgeTransitionSec')
      ease-out,
    transform
      v-bind('animationConfig.similarResources.spotlight.badgeTransitionSec')
      v-bind('EASING.SPRING_STANDARD');
}

.similarity-score-badge.is-visible {
  opacity: 1;
  transform: scale(1);
}

/* Score ring SVG */
.similarity-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg); /* Start from top */
}

/* Background ring */
.similarity-ring-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.3);
  stroke-width: 3;
}

/* Progress ring with animated stroke */
.similarity-ring-progress {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  stroke: var(--ring-color, #6b7280);
  stroke-dasharray: var(--ring-circumference, 94);
  stroke-dashoffset: var(--ring-circumference, 94);
  /* Flexy hates hardcoded 1s! Using animationConfig.similarResources.ring.transitionSec */
  transition: stroke-dashoffset
    v-bind('animationConfig.similarResources.ring.transitionSec')
    v-bind('EASING.SPRING_STANDARD');
  /* Flexy hates hardcoded 1.2s! Using animationConfig.similarResources.spotlight.ringFillDurationSec */
  animation: ring-fill
    v-bind(
      'animationConfig.similarResources.spotlight.ringFillDurationSec + "s"'
    )
    v-bind('EASING.SPRING_STANDARD') forwards;
  animation-delay: calc(
    var(--ring-delay, 0ms) +
      v-bind('animationConfig.similarResources.spotlight.ringDelaySec + "s"')
  );
}

/* Ring fill animation */
@keyframes ring-fill {
  from {
    stroke-dashoffset: var(--ring-circumference, 94);
  }
  to {
    stroke-dashoffset: var(--ring-offset, 47);
  }
}

/* Score value text */
.similarity-score-value {
  position: relative;
  /* Flexy hates hardcoded z-index: 1! Using zIndexScale.low[1] */
  z-index: v-bind('zIndexScale.low[1]');
  font-size: 11px;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  line-height: 1;
}

/* Score level color variants */
.similarity-score-badge.is-high {
  --score-high-color: #10b981;
}

.similarity-score-badge.is-medium {
  --score-medium-color: #f59e0b;
}

.similarity-score-badge.is-low {
  --score-low-color: #6b7280;
}

/* Hover state - subtle pulse */
.similar-resource-card-wrapper:hover .similarity-score-badge {
  transform: scale(1.05);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .similarity-score-badge {
    opacity: 1;
    transform: scale(1);
    transition: none;
  }

  .similarity-ring-progress {
    animation: none;
    stroke-dashoffset: var(--ring-offset, 47);
  }

  .similar-resource-card-wrapper:hover .similarity-score-badge {
    transform: scale(1);
  }
}

/* High contrast mode adjustments */
@media (prefers-contrast: high) {
  .similarity-ring-bg {
    stroke: rgba(255, 255, 255, 0.5);
  }

  .similarity-score-value {
    text-shadow: none;
    -webkit-text-stroke: 0.5px rgba(0, 0, 0, 0.5);
  }
}
</style>
