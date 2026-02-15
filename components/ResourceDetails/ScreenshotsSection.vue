<template>
  <div class="mb-8">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">
      {{ contentConfig.resourceDetails.sections.screenshots || 'Screenshots' }}
    </h2>

    <!-- Screenshots Grid with Staggered Animation -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="(screenshot, index) in screenshots"
        :key="index"
        class="screenshot-item"
        :class="{
          'screenshot-item--animate': !prefersReducedMotion && isVisible,
          'screenshot-item--loaded': loadedImages.has(index),
        }"
        :style="getItemStyle(index)"
      >
        <!-- Loading Skeleton -->
        <div
          v-if="!loadedImages.has(index)"
          class="screenshot-skeleton"
          :class="{ 'screenshot-skeleton--shimmer': !prefersReducedMotion }"
        >
          <div class="screenshot-skeleton__inner" />
        </div>

        <!-- Image Container with Hover Effects -->
        <div
          class="screenshot-container"
          :class="{
            'screenshot-container--hoverable': !isTouchDevice,
            'screenshot-container--pressed': pressedIndex === index,
          }"
          @mouseenter="hoveredIndex = index"
          @mouseleave="hoveredIndex = null"
          @mousedown="pressedIndex = index"
          @mouseup="pressedIndex = null"
          @touchstart="pressedIndex = index"
          @touchend="pressedIndex = null"
          @click="openLightbox(index)"
        >
          <NuxtImg
            :src="screenshot"
            :alt="`${title} screenshot ${index + 1}`"
            class="screenshot-image"
            :class="{
              'screenshot-image--zoom':
                hoveredIndex === index && !prefersReducedMotion,
              'screenshot-image--loaded': loadedImages.has(index),
            }"
            loading="lazy"
            format="webp"
            quality="80"
            @load="handleImageLoad(index)"
            @error="handleImageError(index, $event)"
          />

          <!-- Hover Overlay with View Icon -->
          <div
            v-if="hoveredIndex === index && !isTouchDevice"
            class="screenshot-overlay"
            :class="{ 'screenshot-overlay--visible': !prefersReducedMotion }"
          >
            <div class="screenshot-overlay__content">
              <svg
                class="screenshot-overlay__icon"
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
              <span class="screenshot-overlay__text">{{
                contentConfig.resourceDetails.viewScreenshot
              }}</span>
            </div>
          </div>

          <!-- Touch Device Hint -->
          <div
            v-if="isTouchDevice && loadedImages.has(index)"
            class="screenshot-touch-hint"
          >
            <svg
              class="screenshot-touch-hint__icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox Modal -->
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
          class="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Screenshot viewer"
          @click="closeLightbox"
          @keydown="handleLightboxKeydown"
        >
          <!-- Close Button -->
          <button
            class="lightbox__close"
            :aria-label="contentConfig.resourceDetails.closeLightbox"
            @click.stop="closeLightbox"
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

          <!-- Navigation Arrows -->
          <button
            v-if="screenshots.length > 1"
            class="lightbox__nav lightbox__nav--prev"
            :aria-label="contentConfig.resourceDetails.previousScreenshot"
            @click.stop="navigateLightbox(-1)"
          >
            <svg
              class="w-8 h-8"
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
            class="lightbox__nav lightbox__nav--next"
            :aria-label="contentConfig.resourceDetails.nextScreenshot"
            @click.stop="navigateLightbox(1)"
          >
            <svg
              class="w-8 h-8"
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

          <!-- Image Container -->
          <div class="lightbox__container">
            <Transition
              mode="out-in"
              :enter-active-class="`transition-all ${lightboxTransitionDuration} ease-out`"
              :enter-from-class="lightboxEnterClass"
              :enter-to-class="lightboxEnterToClass"
              :leave-active-class="`transition-all ${lightboxTransitionDuration} ease-in`"
              :leave-from-class="lightboxLeaveFromClass"
              :leave-to-class="lightboxLeaveToClass"
            >
              <NuxtImg
                :key="currentLightboxIndex"
                :src="screenshots[currentLightboxIndex]"
                :alt="`${title} screenshot ${currentLightboxIndex + 1} of ${screenshots.length}`"
                class="lightbox__image"
                format="webp"
                quality="90"
              />
            </Transition>
          </div>

          <!-- Image Counter -->
          <div class="lightbox__counter">
            {{ currentLightboxIndex + 1 }} / {{ screenshots.length }}
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Screen Reader Announcements -->
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
      {{ announcementText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { contentConfig } from '~/configs/content.config'
import { hapticLight, hapticSuccess } from '~/utils/hapticFeedback'

interface Props {
  screenshots: string[]
  title: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  imageError: [event: Event | string]
}>()

// Reactive state
const loadedImages = ref<Set<number>>(new Set())
const hoveredIndex = ref<number | null>(null)
const pressedIndex = ref<number | null>(null)
const prefersReducedMotion = ref(false)
const isTouchDevice = ref(false)
const isVisible = ref(false)
const lightboxOpen = ref(false)
const currentLightboxIndex = ref(0)
const lightboxDirection = ref(0)
const announcementText = ref('')

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

// Check if touch device
const checkTouchDevice = () => {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// Staggered animation style
const getItemStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}

  const delay = index * animationConfig.screenshots.staggerDelayMs
  return {
    '--stagger-delay': `${delay}ms`,
    animationDelay: `${delay}ms`,
  } as Record<string, string>
}

// Lightbox computed properties
const lightboxTransitionDuration = computed(() => {
  return prefersReducedMotion.value
    ? '100ms'
    : `${animationConfig.screenshots.lightboxTransitionMs}ms`
})

const lightboxEnterClass = computed(() => {
  if (prefersReducedMotion.value) return 'opacity-0'
  return lightboxDirection.value > 0
    ? 'opacity-0 translate-x-8 scale-95'
    : 'opacity-0 -translate-x-8 scale-95'
})

const lightboxEnterToClass = computed(() => {
  return 'opacity-100 translate-x-0 scale-100'
})

const lightboxLeaveFromClass = computed(() => {
  return 'opacity-100 translate-x-0 scale-100'
})

const lightboxLeaveToClass = computed(() => {
  if (prefersReducedMotion.value) return 'opacity-0'
  return lightboxDirection.value > 0
    ? 'opacity-0 -translate-x-8 scale-95'
    : 'opacity-0 translate-x-8 scale-95'
})

// Handle image load
const handleImageLoad = (index: number) => {
  loadedImages.value.add(index)
}

// Handle image error
const handleImageError = (index: number, event: Event | string) => {
  loadedImages.value.add(index) // Remove skeleton even on error
  emit('imageError', event)
}

// Open lightbox
const openLightbox = (index: number) => {
  currentLightboxIndex.value = index
  lightboxOpen.value = true
  lightboxDirection.value = 0

  // Haptic feedback
  hapticSuccess()

  // Lock body scroll
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
  }

  // Announce to screen readers
  announcementText.value = `Opened screenshot ${index + 1} of ${props.screenshots.length}. Use arrow keys to navigate, Escape to close.`
  setTimeout(() => {
    announcementText.value = ''
  }, 3000)

  // Focus management
  nextTick(() => {
    const closeButton = document.querySelector(
      '.lightbox__close'
    ) as HTMLElement
    closeButton?.focus()
  })
}

// Close lightbox
const closeLightbox = () => {
  lightboxOpen.value = false

  // Unlock body scroll
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }

  // Announce to screen readers
  announcementText.value = 'Screenshot viewer closed'
  setTimeout(() => {
    announcementText.value = ''
  }, 1000)
}

// Navigate lightbox
const navigateLightbox = (direction: number) => {
  lightboxDirection.value = direction
  const newIndex = currentLightboxIndex.value + direction

  if (newIndex >= 0 && newIndex < props.screenshots.length) {
    currentLightboxIndex.value = newIndex

    // Haptic feedback
    hapticLight()

    // Announce to screen readers
    announcementText.value = `Screenshot ${newIndex + 1} of ${props.screenshots.length}`
    setTimeout(() => {
      announcementText.value = ''
    }, 1000)
  }
}

// Handle lightbox keyboard navigation
const handleLightboxKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      closeLightbox()
      break
    case 'ArrowLeft':
      event.preventDefault()
      navigateLightbox(-1)
      break
    case 'ArrowRight':
      event.preventDefault()
      navigateLightbox(1)
      break
  }
}

// Intersection Observer for entrance animation
let observer: IntersectionObserver | null = null

onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()
  isTouchDevice.value = checkTouchDevice()

  // Set up intersection observer for entrance animation
  if (typeof window !== 'undefined' && !prefersReducedMotion.value) {
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

    const container = document.querySelector('.screenshot-item')
    if (container) {
      observer.observe(container)
    } else {
      // Fallback: show immediately if observer fails
      isVisible.value = true
    }
  } else {
    isVisible.value = true
  }

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleMotionChange)

    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handleMotionChange)
      observer?.disconnect()

      // Ensure body scroll is unlocked
      if (typeof document !== 'undefined') {
        document.body.style.overflow = ''
      }
    })
  }
})
</script>

<style scoped>
/* Screenshot Item Container */
.screenshot-item {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  opacity: 0;
  transform: translateY(20px);
}

.screenshot-item--animate {
  animation: screenshot-enter
    v-bind('`${animationConfig.screenshots.entranceDurationMs}ms`')
    cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--stagger-delay, 0ms);
}

.screenshot-item--loaded {
  opacity: 1;
  transform: translateY(0);
}

@keyframes screenshot-enter {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Loading Skeleton */
.screenshot-skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  border-radius: inherit;
  overflow: hidden;
}

.screenshot-skeleton--shimmer {
  animation: skeleton-shimmer
    v-bind('`${animationConfig.screenshots.shimmerDurationMs}ms`') linear
    infinite;
}

.screenshot-skeleton--shimmer {
  animation: skeleton-shimmer
    v-bind('`${animationConfig.screenshots.shimmerDurationMs}ms`') linear
    infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Screenshot Container */
.screenshot-container {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: inherit;
  transition: transform
    v-bind('`${animationConfig.screenshots.hoverDurationMs}ms`') ease-out;
}

.screenshot-container--hoverable:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

.screenshot-container--pressed {
  transform: scale(0.98);
}

/* Screenshot Image */
.screenshot-image {
  width: 100%;
  height: v-bind('`${animationConfig.screenshots.imageHeight}px`');
  object-fit: cover;
  transition: transform
    v-bind('`${animationConfig.screenshots.zoomDurationMs}ms`') ease-out;
  opacity: 0;
}

.screenshot-image--loaded {
  opacity: 1;
}

.screenshot-image--zoom {
  transform: scale(v-bind('animationConfig.screenshots.zoomScale'));
}

.screenshot-image--loaded {
  opacity: 1;
}

.screenshot-image--zoom {
  transform: scale(v-bind('animationConfig.screenshots.zoomScale || 1.1'));
}

/* Hover Overlay */
.screenshot-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.1) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity
    v-bind('`${animationConfig.screenshots.overlayDurationMs}ms`') ease-out;
}

.screenshot-overlay--visible {
  opacity: 1;
}

.screenshot-overlay__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: white;
  transform: translateY(10px);
  transition: transform
    v-bind('`${animationConfig.screenshots.overlayDurationMs}ms`')
    cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.screenshot-overlay--visible .screenshot-overlay__content {
  transform: translateY(0);
}

.screenshot-overlay__icon {
  width: 2rem;
  height: 2rem;
}

.screenshot-overlay__text {
  font-size: 0.875rem;
  font-weight: 500;
}

/* Touch Device Hint */
.screenshot-touch-hint {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  width: 2rem;
  height: 2rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0.8;
}

.screenshot-touch-hint__icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.lightbox__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 3rem;
  height: 3rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all
    v-bind('`${animationConfig.screenshots.lightboxTransitionMs}ms`') ease-out;
}

.lightbox__close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.lightbox__close:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}

.lightbox__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 3rem;
  height: 3rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all
    v-bind('`${animationConfig.screenshots.lightboxTransitionMs}ms`') ease-out;
}

.lightbox__nav:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-50%) scale(1.1);
}

.lightbox__nav:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}

.lightbox__nav--prev {
  left: 1rem;
}

.lightbox__nav--next {
  right: 1rem;
}

.lightbox__container {
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox__image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: v-bind('`${animationConfig.borderRadius.md || 6}px`');
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.lightbox__counter {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
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

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .screenshot-item,
  .screenshot-image,
  .screenshot-container,
  .screenshot-overlay,
  .screenshot-overlay__content {
    animation: none !important;
    transition: opacity 150ms ease-out !important;
    transform: none !important;
  }

  .screenshot-skeleton--shimmer {
    animation: none !important;
  }

  .screenshot-item {
    opacity: 1;
  }

  .screenshot-image {
    opacity: 1;
  }

  .screenshot-overlay {
    display: none;
  }
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .screenshot-item {
    border-width: 2px;
  }

  .lightbox__close,
  .lightbox__nav {
    border: 2px solid currentColor;
  }
}

/* Mobile Adjustments */
@media (max-width: 640px) {
  .lightbox {
    padding: 1rem;
  }

  .lightbox__nav {
    width: 2.5rem;
    height: 2.5rem;
  }

  .lightbox__nav--prev {
    left: 0.5rem;
  }

  .lightbox__nav--next {
    right: 0.5rem;
  }

  .screenshot-image {
    height: v-bind(
      '`${animationConfig.screenshots.mobileImageHeight || 160}px`'
    );
  }
}
</style>
