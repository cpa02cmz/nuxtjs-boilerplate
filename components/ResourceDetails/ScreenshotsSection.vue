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

    <!-- 🎨 Pallete's Micro-UX Enhancement: Lightbox Modal -->
    <Teleport to="body">
      <Transition
        name="lightbox"
        @after-enter="onLightboxEnter"
        @before-leave="onLightboxLeave"
      >
        <div
          v-if="lightboxOpen"
          ref="lightboxRef"
          class="lightbox-overlay"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          :aria-label="lightboxAriaLabel"
          @click="handleOverlayClick"
          @keydown="handleLightboxKeydown"
        >
          <!-- Close Button -->
          <button
            type="button"
            class="lightbox-close"
            aria-label="Close lightbox"
            :class="{ 'is-hovered': closeButtonHovered }"
            @click="closeLightbox"
            @mouseenter="closeButtonHovered = true"
            @mouseleave="closeButtonHovered = false"
          >
            <svg
              class="close-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Navigation Arrows -->
          <button
            v-if="screenshots.length > 1"
            type="button"
            class="lightbox-nav lightbox-nav--prev"
            aria-label="Previous image"
            :class="{
              'is-hovered': navPrevHovered,
              'is-disabled': currentImageIndex === 0,
            }"
            :disabled="currentImageIndex === 0"
            @click="navigatePrev"
            @mouseenter="navPrevHovered = true"
            @mouseleave="navPrevHovered = false"
          >
            <svg
              class="nav-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            v-if="screenshots.length > 1"
            type="button"
            class="lightbox-nav lightbox-nav--next"
            aria-label="Next image"
            :class="{
              'is-hovered': navNextHovered,
              'is-disabled': currentImageIndex === screenshots.length - 1,
            }"
            :disabled="currentImageIndex === screenshots.length - 1"
            @click="navigateNext"
            @mouseenter="navNextHovered = true"
            @mouseleave="navNextHovered = false"
          >
            <svg
              class="nav-icon"
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
          </button>

          <!-- Image Container with Zoom Animation -->
          <div class="lightbox-content">
            <div
              class="lightbox-image-wrapper"
              :class="{ 'is-zooming': isZooming }"
            >
              <NuxtImg
                :src="currentLightboxImage"
                :alt="`${title} - Image ${currentImageIndex + 1} of ${screenshots.length}`"
                class="lightbox-image"
                :class="{ 'is-loaded': lightboxImageLoaded }"
                format="avif"
                quality="90"
                @load="lightboxImageLoaded = true"
                @click.stop
              />
            </div>

            <!-- Image Counter in Lightbox -->
            <div
              class="lightbox-counter"
              aria-live="polite"
            >
              {{ currentImageIndex + 1 }} / {{ screenshots.length }}
            </div>
          </div>

          <!-- Thumbnail Strip -->
          <div
            v-if="screenshots.length > 1"
            class="lightbox-thumbnails"
            role="tablist"
            aria-label="Image thumbnails"
          >
            <button
              v-for="(screenshot, index) in screenshots"
              :key="`thumb-${index}`"
              type="button"
              role="tab"
              class="lightbox-thumbnail"
              :aria-label="`Go to image ${index + 1}`"
              :aria-selected="index === currentImageIndex"
              :class="{
                'is-active': index === currentImageIndex,
                'is-hovered': hoveredThumbIndex === index,
              }"
              @click="goToImage(index)"
              @mouseenter="hoveredThumbIndex = index"
              @mouseleave="hoveredThumbIndex = null"
            >
              <NuxtImg
                :src="screenshot"
                :alt="`Thumbnail ${index + 1}`"
                class="thumbnail-image"
                format="avif"
                quality="60"
                width="80"
                height="60"
              />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { contentConfig } from '~/configs/content.config'
import { componentColorsConfig } from '~/configs/component-colors.config'
import { zIndexScale } from '~/configs/z-index.config'
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

// 🎨 Pallete's Micro-UX Enhancement: Lightbox State
const lightboxOpen = ref(false)
const currentImageIndex = ref(0)
const lightboxImageLoaded = ref(false)
const isZooming = ref(false)
const lightboxRef = ref<HTMLElement | null>(null)
const closeButtonHovered = ref(false)
const navPrevHovered = ref(false)
const navNextHovered = ref(false)
const hoveredThumbIndex = ref<number | null>(null)

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

// 🎨 Pallete's Micro-UX Enhancement: Lightbox Computed Properties
const currentLightboxImage = computed(() => {
  if (props.screenshots.length === 0) return ''
  return props.screenshots[currentImageIndex.value]
})

const lightboxAriaLabel = computed(() => {
  return `Image viewer: ${props.title} - Image ${currentImageIndex.value + 1} of ${props.screenshots.length}`
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

// 🎨 Pallete's Micro-UX Enhancement: Lightbox Methods
const openLightbox = (index: number) => {
  currentImageIndex.value = index
  lightboxOpen.value = true
  lightboxImageLoaded.value = false
  isZooming.value = true

  // Prevent body scroll when lightbox is open
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
  }

  // Focus the lightbox for keyboard navigation
  nextTick(() => {
    lightboxRef.value?.focus()
  })

  hapticLight()
  emit('imageClick', index)
}

const closeLightbox = () => {
  lightboxOpen.value = false
  isZooming.value = false

  // Restore body scroll
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
}

const navigateNext = () => {
  if (currentImageIndex.value < props.screenshots.length - 1) {
    lightboxImageLoaded.value = false
    currentImageIndex.value++
    hapticLight()
  }
}

const navigatePrev = () => {
  if (currentImageIndex.value > 0) {
    lightboxImageLoaded.value = false
    currentImageIndex.value--
    hapticLight()
  }
}

const goToImage = (index: number) => {
  if (index !== currentImageIndex.value) {
    lightboxImageLoaded.value = false
    currentImageIndex.value = index
    hapticLight()
  }
}

const handleOverlayClick = () => {
  closeLightbox()
}

const handleLightboxKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      closeLightbox()
      break
    case 'ArrowRight':
      event.preventDefault()
      navigateNext()
      break
    case 'ArrowLeft':
      event.preventDefault()
      navigatePrev()
      break
  }
}

const onLightboxEnter = () => {
  // Animation complete callback
  isZooming.value = false
}

const onLightboxLeave = () => {
  // Reset state when lightbox closes
  currentImageIndex.value = 0
}

// Update handleImageClick to open lightbox
const handleImageClick = (index: number) => {
  openLightbox(index)
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

// Flexy hates hardcoded values! Lightbox zoom duration from config
const lightboxZoomDuration = computed(() => {
  return animationConfig.lightbox.zoomInDurationSec
})
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
  /* Flexy hates hardcoded z-index! Using zIndexScale */
  z-index: v-bind('zIndexScale.low[10]');
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
  /* Flexy hates hardcoded z-index! Using zIndexScale */
  z-index: v-bind('zIndexScale.medium[20]');
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

/* 🎨 Pallete's Micro-UX Enhancement: Lightbox Styles */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
  backdrop-filter: blur(8px);
}

.lightbox-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Flexy hates hardcoded 0.3s! Using animationConfig.cssTransitions.standardSec */
  transition: all v-bind('animationConfig.cssTransitions.standardSec')
    cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 10;
}

.lightbox-close:hover,
.lightbox-close.is-hovered {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.close-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Flexy hates hardcoded 0.3s! Using animationConfig.cssTransitions.standardSec */
  transition: all v-bind('animationConfig.cssTransitions.standardSec')
    cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 10;
}

.lightbox-nav--prev {
  left: 1.5rem;
}

.lightbox-nav--next {
  right: 1.5rem;
}

.lightbox-nav:hover:not(:disabled),
.lightbox-nav.is-hovered:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.lightbox-nav:disabled,
.lightbox-nav.is-disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.lightbox-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 90vw;
  max-height: 85vh;
}

.lightbox-image-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  max-height: 70vh;
  overflow: hidden;
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  /* Flexy hates hardcoded 0.4s! Using animationConfig.lightbox.zoomInDurationSec */
  transition: transform v-bind('lightboxZoomDuration')
    cubic-bezier(0.34, 1.56, 0.64, 1);
}

.lightbox-image-wrapper.is-zooming {
  /* Flexy hates hardcoded 0.4s! Using animationConfig.lightbox.zoomInDurationSec */
  animation: lightbox-zoom-in v-bind('lightboxZoomDuration')
    cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.lightbox-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  opacity: 0;
  transform: scale(0.9);
  /* Flexy hates hardcoded 0.4s! Using animationConfig.lightbox.zoomInDurationSec */
  transition: all v-bind('lightboxZoomDuration')
    cubic-bezier(0.34, 1.56, 0.64, 1);
}

.lightbox-image.is-loaded {
  opacity: 1;
  transform: scale(1);
}

@keyframes lightbox-zoom-in {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.lightbox-counter {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 9999px;
  backdrop-filter: blur(4px);
}

.lightbox-thumbnails {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 0.75rem;
  backdrop-filter: blur(8px);
  max-width: 100%;
  overflow-x: auto;
}

.lightbox-thumbnail {
  flex-shrink: 0;
  width: 5rem;
  height: 3.75rem;
  border-radius: 0.375rem;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  /* Flexy hates hardcoded 0.2s! Using animationConfig.cssTransitions.normalSec */
  transition: all v-bind('animationConfig.cssTransitions.normalSec') ease-out;
  background: rgba(255, 255, 255, 0.1);
  padding: 0;
}

.lightbox-thumbnail:hover,
.lightbox-thumbnail.is-hovered {
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.lightbox-thumbnail.is-active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.6;
  /* Flexy hates hardcoded 0.2s! Using animationConfig.cssTransitions.normalSec */
  transition: opacity v-bind('animationConfig.cssTransitions.normalSec')
    ease-out;
}

.lightbox-thumbnail.is-active .thumbnail-image,
.lightbox-thumbnail:hover .thumbnail-image {
  opacity: 1;
}

/* Lightbox Transitions */
/* Flexy hates hardcoded 0.3s! Using animationConfig.cssTransitions.standardSec */
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity v-bind('animationConfig.cssTransitions.standardSec')
    ease-out;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

/* Reduced Motion Support for Lightbox */
@media (prefers-reduced-motion: reduce) {
  .lightbox-close,
  .lightbox-nav,
  .lightbox-image-wrapper,
  .lightbox-image,
  .lightbox-thumbnail {
    transition: none !important;
    animation: none !important;
  }

  .lightbox-image {
    opacity: 1;
    transform: none;
  }
}

/* Mobile Responsive Lightbox */
@media (max-width: 768px) {
  .lightbox-overlay {
    padding: 1rem;
  }

  .lightbox-close {
    top: 1rem;
    right: 1rem;
    width: 2.5rem;
    height: 2.5rem;
  }

  .lightbox-nav {
    width: 2.5rem;
    height: 2.5rem;
  }

  .lightbox-nav--prev {
    left: 0.5rem;
  }

  .lightbox-nav--next {
    right: 0.5rem;
  }

  .lightbox-thumbnails {
    padding: 0.5rem;
  }

  .lightbox-thumbnail {
    width: 3.5rem;
    height: 2.625rem;
  }
}
</style>
