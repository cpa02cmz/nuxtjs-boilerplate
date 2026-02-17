<template>
  <section
    class="screenshots-section"
    role="region"
    :aria-label="ariaLabel"
  >
    <!-- Header with screenshot count -->
    <div class="screenshots-header">
      <h2 class="screenshots-title">
        {{ contentConfig.screenshotsSection.title }}
      </h2>
      <span
        v-if="screenshots.length > 0"
        class="screenshots-count"
        :class="{ 'screenshots-count--updated': countRecentlyUpdated }"
        aria-live="polite"
      >
        {{ screenshots.length }}
        {{ screenshots.length === 1 ? 'image' : 'images' }}
      </span>
    </div>

    <!-- Loading Skeleton State - Palette's micro-UX delight! -->
    <div
      v-if="isLoading"
      class="screenshots-grid"
      role="status"
      aria-label="Loading screenshots"
    >
      <div
        v-for="i in skeletonCount"
        :key="`skeleton-${i}`"
        class="screenshot-skeleton"
        :class="{ 'animate-pulse': !prefersReducedMotion }"
        :style="getStaggeredStyle(i - 1)"
      >
        <div class="skeleton-shimmer" />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="screenshots.length === 0"
      class="screenshots-empty"
      role="status"
    >
      <svg
        class="empty-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <p class="empty-text">
        {{ contentConfig.screenshotsSection.emptyState }}
      </p>
    </div>

    <!-- Screenshots Grid with Staggered Animation -->
    <TransitionGroup
      v-else
      name="screenshot"
      tag="div"
      class="screenshots-grid"
      :class="{ 'animations-disabled': prefersReducedMotion }"
    >
      <div
        v-for="(screenshot, index) in screenshots"
        :key="screenshot"
        class="screenshot-wrapper"
        :class="{
          'is-hovered': hoveredIndex === index && !prefersReducedMotion,
          'is-focused': focusedIndex === index,
        }"
        :style="getStaggeredStyle(index)"
        @mouseenter="handleMouseEnter(index)"
        @mouseleave="handleMouseLeave"
        @focus="handleFocus(index)"
        @blur="handleBlur"
        @keydown="handleKeydown($event, index)"
      >
        <!-- Hover Overlay - Palette's micro-UX delight! -->
        <div
          v-if="hoveredIndex === index && !prefersReducedMotion"
          class="screenshot-overlay"
          aria-hidden="true"
        >
          <div class="overlay-content">
            <svg
              class="view-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
            <span class="view-text">
              {{ contentConfig.screenshotsSection.viewLabel }}
            </span>
          </div>
        </div>

        <!-- Image Counter Badge - Palette's micro-UX enhancement! -->
        <div
          class="image-counter"
          :class="{
            'image-counter--visible':
              hoveredIndex === index || focusedIndex === index,
          }"
          aria-hidden="true"
        >
          {{ index + 1 }} / {{ screenshots.length }}
        </div>

        <NuxtImg
          :src="screenshot"
          :alt="`${title} ${contentConfig.screenshotsSection.imageLabel} ${index + 1} ${contentConfig.screenshotsSection.ofLabel} ${screenshots.length}`"
          class="screenshot-image"
          :class="{ 'is-loading': loadingImages.has(index) }"
          loading="lazy"
          format="avif"
          quality="80"
          tabindex="0"
          role="img"
          @load="handleImageLoad(index)"
          @error="handleImageError(index, $event)"
          @click="handleImageClick(index)"
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
      {{ announcementText }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { contentConfig } from '~/configs/content.config'
import { componentColorsConfig } from '~/configs/component-colors.config'
import { hapticLight } from '~/utils/hapticFeedback'

interface Props {
  screenshots: string[]
  title: string
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const emit = defineEmits<{
  imageError: [event: Event | string]
  imageClick: [index: number]
}>()

// Track loading images
const loadingImages = ref<Set<number>>(new Set())
const hoveredIndex = ref<number | null>(null)
const focusedIndex = ref<number | null>(null)
const countRecentlyUpdated = ref(false)
const announcementText = ref('')

// Check for reduced motion preference
const prefersReducedMotion = ref(false)
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Initialize loading state for all images
watch(
  () => props.screenshots,
  newScreenshots => {
    loadingImages.value = new Set(newScreenshots.map((_, i) => i))
  },
  { immediate: true }
)

// Track count updates for animation
watch(
  () => props.screenshots.length,
  (newLength, oldLength) => {
    if (newLength !== oldLength && typeof oldLength !== 'undefined') {
      countRecentlyUpdated.value = true
      setTimeout(() => {
        countRecentlyUpdated.value = false
      }, animationConfig.screenshotsSection.countUpdateDurationMs)

      // Announce to screen readers
      announcementText.value = `${newLength} screenshots available`
      setTimeout(() => {
        announcementText.value = ''
      }, animationConfig.screenshotsSection.announcementClearDelayMs)
    }
  }
)

onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleChange)

    // Cleanup
    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handleChange)
    })
  }
})

// Computed
const ariaLabel = computed(() => {
  return `${contentConfig.screenshotsSection.title}: ${props.title}`
})

const skeletonCount = computed(() => {
  // Show 3 skeleton items while loading
  return 3
})

// Get staggered animation style - Palette's micro-UX delight!
const getStaggeredStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}

  const config = animationConfig.screenshotsSection
  const delay = Math.min(
    index * config.staggerDelayMs,
    config.maxStaggerDelayMs
  )

  return {
    '--stagger-delay': `${delay}ms`,
    'animation-delay': `${delay}ms`,
  } as Record<string, string>
}

// Event handlers
const handleImageLoad = (index: number) => {
  loadingImages.value.delete(index)
}

const handleImageError = (index: number, event: Event | string) => {
  loadingImages.value.delete(index)
  emit('imageError', event)
}

const handleImageClick = (index: number) => {
  hapticLight()
  emit('imageClick', index)
}

const handleMouseEnter = (index: number) => {
  hoveredIndex.value = index
}

const handleMouseLeave = () => {
  hoveredIndex.value = null
}

const handleFocus = (index: number) => {
  focusedIndex.value = index
}

const handleBlur = () => {
  focusedIndex.value = null
}

// Keyboard navigation - Palette's micro-UX accessibility enhancement!
const handleKeydown = (event: KeyboardEvent, index: number) => {
  switch (event.key) {
    case 'ArrowRight':
      event.preventDefault()
      if (index < props.screenshots.length - 1) {
        const nextElement = document.querySelector(
          `[data-screenshot-index="${index + 1}"]`
        )
        ;(nextElement as HTMLElement)?.focus()
      }
      break
    case 'ArrowLeft':
      event.preventDefault()
      if (index > 0) {
        const prevElement = document.querySelector(
          `[data-screenshot-index="${index - 1}"]`
        )
        ;(prevElement as HTMLElement)?.focus()
      }
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      handleImageClick(index)
      break
  }
}
</script>

<style scoped>
.screenshots-section {
  margin-bottom: 2rem;
}

.screenshots-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.screenshots-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(17, 24, 39); /* gray-900 */
}

.screenshots-count {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(107, 114, 128); /* gray-500 */
  padding: 0.25rem 0.75rem;
  background-color: rgb(243, 244, 246); /* gray-100 */
  border-radius: 9999px;
  transition: all v-bind('animationConfig.cssTransitions.fastSec') ease-out;
}

.screenshots-count--updated {
  animation: count-update-pulse
    v-bind('`${animationConfig.screenshotsSection.countUpdateDurationMs}ms`')
    ease-out;
}

@keyframes count-update-pulse {
  0% {
    transform: scale(1);
    background-color: rgb(243, 244, 246);
  }
  50% {
    transform: scale(1.1);
    background-color: rgb(219, 234, 254); /* blue-100 */
    color: rgb(37, 99, 235); /* blue-600 */
  }
  100% {
    transform: scale(1);
    background-color: rgb(243, 244, 246);
  }
}

.screenshots-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
}

@media (min-width: 640px) {
  .screenshots-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .screenshots-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Palette's micro-UX: Screenshot card with hover effects */
.screenshot-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 0.5rem;
  border: 1px solid rgb(229, 231, 235); /* gray-200 */
  background-color: white;
  cursor: pointer;
  transition: all v-bind('animationConfig.cssTransitions.normalSec') ease-out;
  opacity: 0;
  animation: screenshot-enter
    v-bind('animationConfig.screenshotsSection.entranceDurationSec') ease-out
    forwards;
  animation-delay: var(--stagger-delay, 0ms);
}

.screenshot-wrapper:hover,
.screenshot-wrapper.is-hovered {
  transform: translateY(-4px) scale(1.02);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: rgb(147, 197, 253); /* blue-300 */
}

.screenshot-wrapper.is-focused {
  outline: 2px solid
    v-bind('componentColorsConfig.screenshotsSection.focusOutline');
  outline-offset: 2px;
}

@keyframes screenshot-enter {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.screenshot-image {
  width: 100%;
  height: 12rem;
  object-fit: cover;
  transition: transform v-bind('animationConfig.cssTransitions.normalSec')
    ease-out;
}

.screenshot-wrapper:hover .screenshot-image,
.screenshot-wrapper.is-hovered .screenshot-image {
  transform: scale(1.05);
}

.screenshot-image.is-loading {
  opacity: 0.5;
}

/* Palette's micro-UX: Hover overlay with view icon */
.screenshot-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    transparent 100%
  );
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 1rem;
  opacity: 0;
  animation: overlay-fade-in v-bind('animationConfig.cssTransitions.fastSec')
    ease-out forwards;
  z-index: 10;
  pointer-events: none;
}

@keyframes overlay-fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: white;
}

.view-icon {
  width: 1.5rem;
  height: 1.5rem;
  animation: icon-bounce v-bind('animationConfig.cssTransitions.normalSec')
    ease-out;
}

@keyframes icon-bounce {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.view-text {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Image counter badge - Palette's micro-UX delight! */
.image-counter {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  opacity: 0;
  transform: translateY(-10px);
  transition: all v-bind('animationConfig.cssTransitions.fastSec') ease-out;
  z-index: 20;
  backdrop-filter: blur(4px);
}

.image-counter--visible {
  opacity: 1;
  transform: translateY(0);
}

/* Skeleton loading state - Palette's micro-UX delight! */
.screenshot-skeleton {
  position: relative;
  overflow: hidden;
  border-radius: 0.5rem;
  background-color: rgb(243, 244, 246); /* gray-100 */
  height: 12rem;
  opacity: 0;
  animation: screenshot-enter
    v-bind('animationConfig.screenshotsSection.entranceDurationSec') ease-out
    forwards;
  animation-delay: var(--stagger-delay, 0ms);
}

.skeleton-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: shimmer-sweep 1.5s ease-in-out infinite;
}

@keyframes shimmer-sweep {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Empty state - Palette's micro-UX delight! */
.screenshots-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  background: linear-gradient(
    135deg,
    rgb(249, 250, 251) 0%,
    rgb(243, 244, 246) 100%
  );
  border-radius: 0.75rem;
  border: 2px dashed rgb(229, 231, 235); /* gray-200 */
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  color: rgb(156, 163, 175); /* gray-400 */
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 0.875rem;
  color: rgb(107, 114, 128); /* gray-500 */
  text-align: center;
}

/* Vue Transition Group styles */
.screenshot-enter-active,
.screenshot-leave-active {
  transition: all v-bind('animationConfig.cssTransitions.normalSec') ease-out;
}

.screenshot-enter-from,
.screenshot-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.screenshot-move {
  transition: transform v-bind('animationConfig.cssTransitions.normalSec')
    ease-out;
}

/* Reduced motion support - Palette cares about accessibility! */
@media (prefers-reduced-motion: reduce) {
  .screenshot-wrapper,
  .screenshot-image,
  .screenshot-skeleton,
  .screenshots-count,
  .image-counter {
    animation: none !important;
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }

  .screenshot-wrapper:hover,
  .screenshot-wrapper.is-hovered {
    transform: none;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .screenshot-wrapper:hover .screenshot-image,
  .screenshot-wrapper.is-hovered .screenshot-image {
    transform: none;
  }

  .screenshot-overlay {
    display: none;
  }

  .skeleton-shimmer {
    animation: none;
  }

  .screenshot-enter-active,
  .screenshot-leave-active,
  .screenshot-move {
    transition: none;
  }
}

/* Screen reader only text */
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

/* High contrast mode support */
@media (prefers-contrast: high) {
  .screenshot-wrapper {
    border: 2px solid currentColor;
  }

  .screenshot-wrapper.is-focused {
    outline: 3px solid currentColor;
    outline-offset: 3px;
  }
}
</style>
