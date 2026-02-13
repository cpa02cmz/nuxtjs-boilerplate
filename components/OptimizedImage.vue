<template>
  <div
    class="optimized-image-wrapper"
    :class="{
      'is-loading': !isLoaded && !hasError,
      'is-loaded': isLoaded,
      'has-error': hasError,
      'is-hovering': isHovering && enableHoverZoom,
    }"
    :aria-busy="!isLoaded && !hasError ? 'true' : 'false'"
    role="img"
    :aria-label="alt"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Enhanced Skeleton Loading State -->
    <div
      v-if="!isLoaded && !hasError"
      class="skeleton-container"
      aria-hidden="true"
    >
      <!-- Multi-layer shimmer for depth effect -->
      <div class="skeleton-layer skeleton-layer--base" />
      <div class="skeleton-layer skeleton-layer--shimmer" />
      <div class="skeleton-layer skeleton-layer--pulse" />

      <!-- Optional loading spinner for larger images -->
      <div v-if="showLoadingIndicator" class="loading-indicator">
        <svg
          class="loading-spinner"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            class="spinner-track"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="2"
            opacity="0.25"
          />
          <circle
            class="spinner-head"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-dasharray="31.416"
            stroke-dashoffset="31.416"
          />
        </svg>
      </div>
    </div>

    <!-- Error State with Retry -->
    <div
      v-else-if="hasError"
      class="error-state"
      role="alert"
      aria-live="polite"
    >
      <div class="error-content">
        <svg
          class="error-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p class="error-text">
          {{
            contentConfig.optimizedImage?.error?.title || 'Failed to load image'
          }}
        </p>
        <button
          class="retry-button"
          :aria-label="
            contentConfig.optimizedImage?.error?.retryAriaLabel ||
            'Retry loading image'
          "
          @click="handleRetry"
        >
          <svg
            class="retry-icon"
            :class="{ 'is-retrying': isRetrying }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path
              d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
            />
          </svg>
          <span>{{
            contentConfig.optimizedImage?.error?.retryButton || 'Retry'
          }}</span>
        </button>
      </div>
    </div>

    <!-- Main Image with enhanced transitions -->
    <NuxtImg
      v-show="isLoaded"
      ref="imageRef"
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :format="format"
      :loading="loading"
      :sizes="sizes"
      :quality="quality"
      :class="['optimized-image', { 'is-loaded': isLoaded }, imgClass]"
      @error="handleError"
      @load="handleLoad"
    />

    <!-- Screen reader announcements -->
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
      {{ announcement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, computed, onMounted, onUnmounted } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { contentConfig } from '~/configs/content.config'
import { hapticLight, hapticError, hapticSuccess } from '~/utils/hapticFeedback'

interface Props {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'gif'
  loading?: 'lazy' | 'eager'
  sizes?: string
  quality?: number | string
  imgClass?: string
  /** Enable hover zoom effect on loaded images */
  enableHoverZoom?: boolean
  /** Show loading indicator for images larger than threshold */
  showLoadingIndicator?: boolean
  /** Loading indicator threshold in KB */
  loadingIndicatorThreshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: undefined,
  height: undefined,
  format: undefined,
  loading: 'lazy',
  sizes: undefined,
  quality: undefined,
  imgClass: undefined,
  enableHoverZoom: true,
  showLoadingIndicator: false,
  loadingIndicatorThreshold: 100, // KB
})

const emit = defineEmits<{
  load: []
  error: [event: string | Event]
  retry: []
}>()

// State
const isLoaded = ref(false)
const hasError = ref(false)
const isHovering = ref(false)
const isRetrying = ref(false)
const announcement = ref('')
const loadStartTime = ref<number>(0)
const imageRef = useTemplateRef('imageRef')

// Track loading progress for large images
const loadProgress = ref(0)
let progressInterval: ReturnType<typeof setInterval> | null = null

// Check if user prefers reduced motion
const prefersReducedMotion = ref(false)
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Compute animation duration based on load time (faster loads = faster animations)
const entranceDuration = computed(() => {
  if (prefersReducedMotion.value) return '0ms'
  const loadTime = Date.now() - loadStartTime.value
  // Faster animations for quick loads, slower for longer waits
  if (loadTime < 200)
    return `${animationConfig.optimizedImage.fastEntranceMs}ms`
  if (loadTime < 1000)
    return `${animationConfig.optimizedImage.normalEntranceMs}ms`
  return `${animationConfig.optimizedImage.slowEntranceMs}ms`
})

const handleError = (event: string | Event) => {
  hasError.value = true
  isLoaded.value = false
  isRetrying.value = false

  // Announce error to screen readers
  announcement.value =
    contentConfig.optimizedImage?.error?.announcement || 'Image failed to load'
  setTimeout(() => {
    announcement.value = ''
  }, animationConfig.microInteractions.announcementDelayMs)

  // Haptic feedback for error
  hapticError()

  emit('error', event)
}

const handleLoad = () => {
  isLoaded.value = true
  hasError.value = false
  isRetrying.value = false

  // Clear progress interval
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }

  // Announce success to screen readers (only if it took a while)
  const loadTime = Date.now() - loadStartTime.value
  if (loadTime > 1000) {
    announcement.value =
      contentConfig.optimizedImage?.loadAnnouncement || 'Image loaded'
    setTimeout(() => {
      announcement.value = ''
    }, animationConfig.microInteractions.announcementDelayMs)
  }

  // Haptic feedback for successful load (only on slower loads)
  if (loadTime > 500 && typeof navigator !== 'undefined' && navigator.vibrate) {
    hapticSuccess()
  }

  emit('load')
}

const handleRetry = () => {
  isRetrying.value = true
  hasError.value = false
  isLoaded.value = false
  loadStartTime.value = Date.now()

  // Haptic feedback for retry action
  hapticLight()

  // Force image reload by appending cache buster
  const img = imageRef.value?.$el as HTMLImageElement
  if (img) {
    const currentSrc = props.src
    const cacheBuster = `?retry=${Date.now()}`
    const separator = currentSrc.includes('?') ? '&' : '?'
    img.src = currentSrc + separator + cacheBuster
  }

  emit('retry')
}

const handleMouseEnter = () => {
  if (isLoaded.value && props.enableHoverZoom && !prefersReducedMotion.value) {
    isHovering.value = true
  }
}

const handleMouseLeave = () => {
  isHovering.value = false
}

// Simulate loading progress for better UX on slow connections
const startProgressSimulation = () => {
  if (!props.showLoadingIndicator) return

  loadProgress.value = 0
  progressInterval = setInterval(() => {
    // Slow down progress as it gets higher (simulating real loading behavior)
    const increment =
      loadProgress.value < 50 ? 5 : loadProgress.value < 80 ? 2 : 0.5
    loadProgress.value = Math.min(loadProgress.value + increment, 95)
  }, 100)
}

onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()
  loadStartTime.value = Date.now()

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleChange)

    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handleChange)
    })
  }

  // Start progress simulation if loading takes a while
  if (props.showLoadingIndicator) {
    setTimeout(() => {
      if (!isLoaded.value && !hasError.value) {
        startProgressSimulation()
      }
    }, 200)
  }
})

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
})
</script>

<style scoped>
/* Base wrapper styles */
.optimized-image-wrapper {
  position: relative;
  display: inline-block;
  overflow: hidden;
  border-radius: v-bind(
    'animationConfig.optimizedImage?.borderRadius || "4px"'
  );
  background-color: v-bind(
    'animationConfig.optimizedImage?.placeholderBg || "#f3f4f6"'
  );
}

/* Enhanced Skeleton Loading State */
.skeleton-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #e8e8e8 25%,
    #f5f5f5 50%,
    #e8e8e8 75%,
    #f0f0f0 100%
  );
  background-size: 200% 100%;
}

/* Dark mode support */
:global(.dark) .skeleton-container {
  background: linear-gradient(
    90deg,
    #374151 0%,
    #4b5563 25%,
    #374151 50%,
    #4b5563 75%,
    #374151 100%
  );
  background-size: 200% 100%;
}

.skeleton-layer {
  position: absolute;
  inset: 0;
}

.skeleton-layer--base {
  background: inherit;
}

.skeleton-layer--shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer-slide
    v-bind('animationConfig.skeleton?.imageShimmerDurationSec || "1.5s"')
    infinite;
}

:global(.dark) .skeleton-layer--shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
}

.skeleton-layer--pulse {
  animation: skeleton-pulse
    v-bind('animationConfig.skeleton?.subtlePulseDurationSec || "2s"')
    ease-in-out infinite;
}

@keyframes shimmer-slide {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* Loading Indicator Spinner */
.loading-indicator {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  color: #6b7280;
  animation: spinner-rotate
    v-bind('animationConfig.optimizedImage?.spinnerRotateDurationSec || "1s"')
    linear infinite;
}

.spinner-head {
  animation: spinner-dash
    v-bind('animationConfig.optimizedImage?.spinnerDashDurationSec || "1.5s"')
    ease-in-out infinite;
}

@keyframes spinner-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes spinner-dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

/* Error State */
.error-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  padding: 1rem;
}

:global(.dark) .error-state {
  background: linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%);
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
}

.error-icon {
  width: 40px;
  height: 40px;
  color: #ef4444;
  animation: error-icon-pulse
    v-bind('animationConfig.optimizedImage?.errorPulseDurationSec || "2s"')
    ease-in-out infinite;
}

:global(.dark) .error-icon {
  color: #fca5a5;
}

@keyframes error-icon-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.error-text {
  font-size: 0.875rem;
  color: #991b1b;
  margin: 0;
}

:global(.dark) .error-text {
  color: #fca5a5;
}

.retry-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #ef4444;
  border-radius: 0.375rem;
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all
    v-bind('animationConfig.transition?.fast?.durationMs + "ms" || "150ms"')
    ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.retry-button:hover {
  background: #fef2f2;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.retry-button:active {
  transform: translateY(0);
}

:global(.dark) .retry-button {
  background: #450a0a;
  border-color: #fca5a5;
  color: #fca5a5;
}

:global(.dark) .retry-button:hover {
  background: #7f1d1d;
}

.retry-icon {
  width: 16px;
  height: 16px;
  transition: transform
    v-bind('animationConfig.transition?.normal?.durationMs + "ms" || "200ms"')
    ease;
}

.retry-icon.is-retrying {
  animation: retry-spin
    v-bind('animationConfig.optimizedImage?.retrySpinDurationSec || "1s"')
    linear infinite;
}

@keyframes retry-spin {
  100% {
    transform: rotate(-360deg);
  }
}

/* Main Image Styles */
.optimized-image {
  opacity: 0;
  transform: scale(
    v-bind('animationConfig.optimizedImage?.entranceStartScale || "0.95"')
  );
  transition:
    opacity v-bind('entranceDuration') ease-out,
    transform v-bind('entranceDuration') cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: opacity, transform;
}

.optimized-image.is-loaded {
  opacity: 1;
  transform: scale(1);
}

/* Hover Zoom Effect */
.optimized-image-wrapper.is-loaded.is-hovering .optimized-image {
  transform: scale(
    v-bind('animationConfig.optimizedImage?.hoverZoomScale || "1.05"')
  );
  transition: transform
    v-bind('animationConfig.optimizedImage?.hoverDurationMs + "ms" || "300ms"')
    ease-out;
}

/* Hover glow effect */
.optimized-image-wrapper.is-loaded::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity
    v-bind('animationConfig.transition?.normal?.durationMs + "ms" || "200ms"')
    ease;
  pointer-events: none;
}

.optimized-image-wrapper.is-loaded.is-hovering::after {
  opacity: 1;
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

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .skeleton-container,
  .skeleton-layer--shimmer,
  .skeleton-layer--pulse,
  .loading-spinner,
  .spinner-head,
  .error-icon,
  .retry-icon.is-retrying {
    animation: none !important;
  }

  .optimized-image {
    transition: opacity v-bind('animationConfig.cssTransitions.fastSec')
      ease-out;
    transform: none !important;
  }

  .optimized-image.is-loaded {
    transform: none;
  }

  .optimized-image-wrapper.is-loaded.is-hovering .optimized-image {
    transform: none;
  }

  .retry-button:hover {
    transform: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .skeleton-container {
    background: #767676;
  }

  .error-state {
    border: 2px solid currentColor;
  }

  .retry-button {
    border-width: 2px;
  }
}
</style>
