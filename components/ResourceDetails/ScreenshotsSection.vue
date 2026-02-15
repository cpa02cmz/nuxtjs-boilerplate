<template>
  <div class="mb-8 screenshots-section">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">
      {{ contentConfig.resourceDetails.screenshots.title }}
    </h2>

    <!-- Screenshots Grid with Staggered Entrance -->
    <TransitionGroup
      tag="div"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      :enter-active-class="`transition-all ${tailwindDurations.slower} ease-out`"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      :leave-active-class="`transition-all ${tailwindDurations.moderate} ease-in`"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-for="(screenshot, index) in screenshots"
        :key="index"
        class="screenshot-item group relative overflow-hidden rounded-lg border border-gray-200 cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
        :class="{
          'is-loading': !loadedImages.has(index),
          'is-loaded': loadedImages.has(index),
          'is-focused': focusedIndex === index,
        }"
        :style="getStaggeredStyle(index)"
        tabindex="0"
        role="button"
        :aria-label="`View screenshot ${index + 1} of ${screenshots.length} for ${title}`"
        @click="openLightbox(index)"
        @keydown="handleKeydown($event, index)"
        @mouseenter="hoveredIndex = index"
        @mouseleave="hoveredIndex = null"
        @focus="focusedIndex = index"
        @blur="focusedIndex = null"
      >
        <!-- Palette's micro-UX: Shimmer loading effect -->
        <div
          v-if="!loadedImages.has(index)"
          class="shimmer-loader"
          aria-hidden="true"
        >
          <div class="shimmer-line" />
          <div class="shimmer-line shimmer-line--short" />
        </div>

        <!-- Palette's micro-UX: Hover overlay with zoom icon -->
        <div
          v-if="loadedImages.has(index)"
          class="hover-overlay"
          :class="{
            'is-visible': hoveredIndex === index || focusedIndex === index,
          }"
          aria-hidden="true"
        >
          <div class="zoom-icon">
            <svg
              class="w-8 h-8 text-white drop-shadow-lg"
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
          </div>
          <div class="screenshot-counter">
            {{ index + 1 }} / {{ screenshots.length }}
          </div>
        </div>

        <!-- Main Image with Palette's micro-UX: Smooth zoom on hover -->
        <NuxtImg
          :src="screenshot"
          :alt="`${title} screenshot ${index + 1}`"
          class="screenshot-image w-full h-48 object-cover transition-transform duration-300 ease-out"
          :class="{
            'scale-110': hoveredIndex === index && !prefersReducedMotion,
          }"
          loading="lazy"
          format="avif"
          quality="80"
          @load="handleImageLoad(index)"
          @error="handleImageError(index, $event)"
        />
      </div>
    </TransitionGroup>

    <!-- Palette's micro-UX: Lightbox Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="lightboxOpen"
          ref="lightboxRef"
          class="lightbox fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          :aria-label="`Viewing screenshot ${activeIndex + 1} of ${screenshots.length}`"
          @click.self="closeLightbox"
          @keydown="handleLightboxKeydown"
        >
          <!-- Backdrop -->
          <div
            class="lightbox-backdrop absolute inset-0 bg-black/90 backdrop-blur-sm"
            aria-hidden="true"
          />

          <!-- Close Button -->
          <button
            ref="closeButtonRef"
            class="lightbox-close absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            :aria-label="contentConfig.resourceDetails.screenshots.closeButton"
            @click="closeLightbox"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Navigation Buttons -->
          <button
            v-if="screenshots.length > 1"
            class="lightbox-nav lightbox-nav--prev absolute left-4 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="activeIndex === 0"
            :aria-label="
              contentConfig.resourceDetails.screenshots.previousButton
            "
            @click="navigate(-1)"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
            class="lightbox-nav lightbox-nav--next absolute right-4 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="activeIndex === screenshots.length - 1"
            :aria-label="contentConfig.resourceDetails.screenshots.nextButton"
            @click="navigate(1)"
          >
            <svg
              class="w-6 h-6"
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
          </button>

          <!-- Main Image Container -->
          <div
            class="lightbox-content relative max-w-5xl max-h-[80vh] mx-4"
            :class="{ 'is-transitioning': isTransitioning }"
          >
            <!-- Palette's micro-UX: Loading spinner for large images -->
            <div
              v-if="!lightboxImageLoaded"
              class="lightbox-loader absolute inset-0 flex items-center justify-center"
            >
              <LoadingSpinner size="large" />
            </div>

            <img
              :src="screenshots[activeIndex]"
              :alt="`${title} screenshot ${activeIndex + 1}`"
              class="lightbox-image max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              :class="{ 'opacity-0': !lightboxImageLoaded }"
              @load="lightboxImageLoaded = true"
            />
          </div>

          <!-- Palette's micro-UX: Image counter and keyboard hints -->
          <div
            class="lightbox-info absolute bottom-6 left-1/2 -translate-x-1/2 text-center"
          >
            <div class="text-white/90 text-sm font-medium mb-2">
              {{ activeIndex + 1 }} / {{ screenshots.length }}
            </div>
            <div
              v-if="screenshots.length > 1"
              class="text-white/50 text-xs flex items-center gap-3"
            >
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-white/70"
                  >←</kbd
                >
                <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-white/70"
                  >→</kbd
                >
                Navigate
              </span>
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-white/70"
                  >ESC</kbd
                >
                Close
              </span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Palette's micro-UX: Screen reader announcements -->
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
      {{ screenReaderAnnouncement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { contentConfig } from '~/configs/content.config'
import { tailwindClassesConfig } from '~/configs/tailwind-classes.config'
import { animationConfig } from '~/configs/animation.config'
import LoadingSpinner from '~/components/LoadingSpinner.vue'

interface Props {
  screenshots: string[]
  title: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  imageError: [event: Event | string]
}>()

// Palette's micro-UX: State management for delightful interactions
const loadedImages = ref<Set<number>>(new Set())
const hoveredIndex = ref<number | null>(null)
const focusedIndex = ref<number | null>(null)
const lightboxOpen = ref(false)
const activeIndex = ref(0)
const lightboxImageLoaded = ref(false)
const isTransitioning = ref(false)
const prefersReducedMotion = ref(false)
const screenReaderAnnouncement = ref('')

// Refs
const lightboxRef = ref<HTMLDivElement | null>(null)
const closeButtonRef = ref<HTMLButtonElement | null>(null)

// Computed
const tailwindDurations = computed(() => tailwindClassesConfig.duration)

// Palette's micro-UX: Check for reduced motion preference
onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (lightboxOpen.value) {
    closeLightbox()
  }
})

// Palette's micro-UX: Handle image load with staggered delay
const handleImageLoad = (index: number) => {
  loadedImages.value.add(index)
}

const handleImageError = (index: number, event: Event | string) => {
  loadedImages.value.add(index) // Remove shimmer even on error
  emit('imageError', event)
}

// Palette's micro-UX: Generate staggered entrance styles
const getStaggeredStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}

  const delay = Math.min(
    index * animationConfig.screenshots.staggerDelayMs,
    animationConfig.screenshots.maxStaggerDelayMs
  )

  return {
    '--stagger-delay': `${delay}ms`,
    'animation-delay': `${delay}ms`,
  } as Record<string, string>
}

// Palette's micro-UX: Keyboard navigation for grid
const handleKeydown = (event: KeyboardEvent, index: number) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    openLightbox(index)
  }
}

// Palette's micro-UX: Open lightbox with focus trap
const openLightbox = (index: number) => {
  activeIndex.value = index
  lightboxOpen.value = true
  lightboxImageLoaded.value = false

  // Announce to screen readers
  screenReaderAnnouncement.value = `Opened screenshot ${index + 1} of ${props.screenshots.length}. Press Escape to close.`

  // Focus close button after animation
  nextTick(() => {
    setTimeout(() => {
      closeButtonRef.value?.focus()
    }, 100)
  })

  // Prevent body scroll
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
  }
}

// Palette's micro-UX: Close lightbox and restore focus
const closeLightbox = () => {
  lightboxOpen.value = false
  screenReaderAnnouncement.value = 'Closed screenshot viewer'

  // Restore body scroll
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }

  // Return focus to the thumbnail
  nextTick(() => {
    const thumbnails = document.querySelectorAll('.screenshot-item')
    const targetThumb = thumbnails[activeIndex.value] as HTMLElement
    targetThumb?.focus()
  })
}

// Palette's micro-UX: Navigate between images
const navigate = (direction: number) => {
  const newIndex = activeIndex.value + direction
  if (newIndex >= 0 && newIndex < props.screenshots.length) {
    isTransitioning.value = true
    lightboxImageLoaded.value = false

    setTimeout(() => {
      activeIndex.value = newIndex
      screenReaderAnnouncement.value = `Screenshot ${newIndex + 1} of ${props.screenshots.length}`
      isTransitioning.value = false
    }, animationConfig.screenshots.lightboxTransitionMs)
  }
}

// Palette's micro-UX: Lightbox keyboard navigation
const handleLightboxKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      closeLightbox()
      break
    case 'ArrowLeft':
      event.preventDefault()
      navigate(-1)
      break
    case 'ArrowRight':
      event.preventDefault()
      navigate(1)
      break
    case 'Home':
      event.preventDefault()
      if (activeIndex.value !== 0) {
        activeIndex.value = 0
        lightboxImageLoaded.value = false
        screenReaderAnnouncement.value = `First screenshot`
      }
      break
    case 'End':
      event.preventDefault()
      if (activeIndex.value !== props.screenshots.length - 1) {
        activeIndex.value = props.screenshots.length - 1
        lightboxImageLoaded.value = false
        screenReaderAnnouncement.value = `Last screenshot`
      }
      break
  }
}
</script>

<style scoped>
.screenshots-section {
  position: relative;
}

/* Palette's micro-UX: Screenshot item base styles */
.screenshot-item {
  position: relative;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  transition: all v-bind('`${tailwindDurations.standard}`') ease-out;
}

.screenshot-item:hover {
  border-color: #9ca3af;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.screenshot-item.is-focused {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Palette's micro-UX: Shimmer loading effect */
.shimmer-loader {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer
    v-bind('`${animationConfig.screenshots.shimmerDurationSec}`') ease-in-out
    infinite;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1rem;
  gap: 0.5rem;
}

.shimmer-line {
  height: 0.75rem;
  background: linear-gradient(90deg, #d1d5db 0%, #9ca3af 50%, #d1d5db 100%);
  background-size: 200% 100%;
  border-radius: 0.25rem;
  width: 80%;
  animation: shimmer
    v-bind('`${animationConfig.screenshots.shimmerDurationSec}`') ease-in-out
    infinite;
}

.shimmer-line--short {
  width: 40%;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Palette's micro-UX: Hover overlay */
.hover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.3) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity v-bind('`${tailwindDurations.standard}`') ease-out;
  z-index: 10;
}

.hover-overlay.is-visible {
  opacity: 1;
}

.zoom-icon {
  transform: scale(0.8);
  transition: transform v-bind('`${tailwindDurations.standard}`') ease-out;
}

.hover-overlay.is-visible .zoom-icon {
  transform: scale(1);
}

.screenshot-counter {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transform: translateY(0.5rem);
  opacity: 0;
  transition: all v-bind('`${tailwindDurations.standard}`') ease-out;
}

.hover-overlay.is-visible .screenshot-counter {
  transform: translateY(0);
  opacity: 1;
}

/* Palette's micro-UX: Screenshot image */
.screenshot-image {
  will-change: transform;
}

/* Palette's micro-UX: Lightbox styles */
.lightbox {
  z-index: v-bind('animationConfig.screenshots.lightboxZIndex');
}

.lightbox-backdrop {
  cursor: pointer;
}

.lightbox-content {
  z-index: 1;
}

.lightbox-content.is-transitioning {
  opacity: 0;
  transform: scale(0.95);
  transition: all
    v-bind('`${animationConfig.screenshots.lightboxTransitionMs}ms`') ease-out;
}

.lightbox-image {
  transition: opacity v-bind('`${tailwindDurations.standard}`') ease-out;
}

.lightbox-nav {
  z-index: 2;
  transform: translateY(0);
  transition: all v-bind('`${tailwindDurations.fast}`') ease-out;
}

.lightbox-nav:hover:not(:disabled) {
  transform: translateY(0) scale(1.1);
  background: rgba(255, 255, 255, 0.15);
}

.lightbox-nav:active:not(:disabled) {
  transform: translateY(0) scale(0.95);
}

.lightbox-close {
  z-index: 2;
  transform: scale(1);
  transition: all v-bind('`${tailwindDurations.fast}`') ease-out;
}

.lightbox-close:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.15);
}

.lightbox-close:active {
  transform: scale(0.95);
}

.lightbox-info {
  z-index: 2;
}

/* Palette's micro-UX: Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .screenshot-item {
    transition: none;
  }

  .shimmer-loader {
    animation: none;
    background: #f3f4f6;
  }

  .shimmer-line {
    animation: none;
    background: #d1d5db;
  }

  .hover-overlay {
    display: none;
  }

  .screenshot-image {
    transition: none;
  }

  .zoom-icon {
    transition: none;
  }

  .lightbox-content.is-transitioning {
    transition: none;
  }

  .lightbox-image {
    transition: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .screenshot-item {
    border-width: 2px;
  }

  .screenshot-item:focus-visible {
    outline: 3px solid currentColor;
    outline-offset: 3px;
  }

  .lightbox-nav,
  .lightbox-close {
    border: 2px solid currentColor;
  }
}

/* Screen reader only content */
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
