<template>
  <div
    class="resource-header p-6 border-b border-gray-200"
    :class="{ 'animations-enabled': !prefersReducedMotion }"
  >
    <!-- ARIA Live Region for Announcements -->
    <div
      class="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ announcement }}
    </div>

    <div
      class="resource-header__content flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      :class="{ 'resource-header__content--loaded': isLoaded }"
    >
      <!-- Title and Category Section -->
      <div
        class="resource-header__info"
        :class="{
          'resource-header__info--animated': !prefersReducedMotion && isLoaded,
        }"
      >
        <h1
          class="resource-header__title text-2xl font-bold text-gray-900 sm:text-3xl"
          :class="{
            'resource-header__title--entrance':
              !prefersReducedMotion && isLoaded,
          }"
        >
          {{ title }}
        </h1>
        <div class="resource-header__meta flex items-center mt-2 gap-2">
          <p
            class="resource-header__category text-gray-600"
            :class="{
              'resource-header__category--entrance':
                !prefersReducedMotion && isLoaded,
            }"
          >
            {{ category }}
          </p>
          <ResourceStatus
            v-if="status"
            :status="status"
            :health-score="healthScore"
          />
        </div>
      </div>

      <!-- Action Buttons with Micro-UX Enhancements -->
      <div
        class="resource-header__actions flex items-center gap-3 mt-4 sm:mt-0"
      >
        <!-- Magnetic Bookmark Button - Palette's delightful micro-UX! -->
        <div
          v-if="showBookmark"
          ref="bookmarkContainerRef"
          class="resource-header__bookmark-wrapper"
          @mouseenter="handleBookmarkMouseEnter"
          @mouseleave="handleBookmarkMouseLeave"
          @mousemove="handleBookmarkMouseMove"
        >
          <BookmarkButton
            :resource-id="resourceId"
            class="resource-header__bookmark"
            :style="magneticBookmarkStyle"
            :class="{
              'resource-header__bookmark--magnetic':
                isBookmarkHovering && !prefersReducedMotion,
            }"
          />
        </div>

        <!-- Visit Resource Button with Micro-UX Enhancements -->
        <a
          ref="visitButtonRef"
          :href="url"
          target="_blank"
          rel="noopener noreferrer"
          class="resource-header__button inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-800"
          :class="[
            animationConfig.tailwindDurations.normal,
            {
              'resource-header__button--hover': isHovering,
              'resource-header__button--pressed': isPressed,
            },
          ]"
          :style="magneticButtonStyle"
          aria-label="Visit external resource: {{ title }}"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
          @mousedown="handleMouseDown"
          @mouseup="handleMouseUp"
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
          @click="handleClick"
        >
          <span class="resource-header__button-text">{{
            contentConfig.resourceHeader.visitButton
          }}</span>
          <!-- Animated External Link Icon -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="resource-header__icon ml-2 h-4 w-4 transition-transform"
            :class="{
              'resource-header__icon--animated':
                !prefersReducedMotion && isHovering,
            }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { contentConfig } from '~/configs/content.config'
import { EASING } from '~/configs/easing.config'
import { hapticLight } from '~/utils/hapticFeedback'
import BookmarkButton from '~/components/BookmarkButton.vue'

interface Props {
  title: string
  category: string
  status?: string
  healthScore?: number
  url: string
  resourceId: string
  showBookmark?: boolean
}

withDefaults(defineProps<Props>(), {
  showBookmark: true,
  status: 'unknown',
  healthScore: 0,
})

// Micro-UX State Management
const isHovering = ref(false)
const isPressed = ref(false)
const isLoaded = ref(false)
const prefersReducedMotion = ref(false)
const announcement = ref('')

// Palette's micro-UX enhancement: Magnetic bookmark button state
const isBookmarkHovering = ref(false)
const bookmarkMagneticX = ref(0)
const bookmarkMagneticY = ref(0)
const bookmarkContainerRef = ref<HTMLElement | null>(null)

// Palette's micro-UX enhancement: Magnetic visit button state
const visitButtonRef = ref<HTMLElement | null>(null)
const visitMagneticX = ref(0)
const visitMagneticY = ref(0)
let magneticAnimationFrame: number | null = null

// Get resource header config
const config = computed(() => animationConfig.resourceHeader)

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

// Update reduced motion preference
const updateReducedMotion = () => {
  prefersReducedMotion.value = checkReducedMotion()
}

// Mouse event handlers for visit button
const handleMouseEnter = () => {
  isHovering.value = true
}

const handleMouseLeave = () => {
  isHovering.value = false
  isPressed.value = false
  // Reset magnetic position
  visitMagneticX.value = 0
  visitMagneticY.value = 0
}

const handleMouseDown = () => {
  isPressed.value = true
}

const handleMouseUp = () => {
  isPressed.value = false
}

// Touch event handlers for mobile
const handleTouchStart = () => {
  isPressed.value = true
}

const handleTouchEnd = () => {
  isPressed.value = false
}

// Click handler with haptic feedback
const handleClick = () => {
  // Trigger haptic feedback for mobile users
  hapticLight()

  // Announce to screen readers
  announcement.value = `Opening ${contentConfig.resourceHeader.visitButton} in a new tab`

  // Clear announcement after a delay - Flexy hates hardcoded values!
  setTimeout(() => {
    announcement.value = ''
  }, config.value.announcementClearDelayMs)
}

// Palette's micro-UX enhancement: Magnetic bookmark button handlers
const handleBookmarkMouseEnter = () => {
  if (prefersReducedMotion.value) return
  isBookmarkHovering.value = true
}

const handleBookmarkMouseLeave = () => {
  isBookmarkHovering.value = false
  bookmarkMagneticX.value = 0
  bookmarkMagneticY.value = 0
}

const handleBookmarkMouseMove = (event: MouseEvent) => {
  if (prefersReducedMotion.value || !bookmarkContainerRef.value) return

  const container = bookmarkContainerRef.value
  const rect = container.getBoundingClientRect()

  // Calculate container center
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  // Calculate distance from mouse to center
  const distanceX = event.clientX - centerX
  const distanceY = event.clientY - centerY
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

  // Maximum distance for magnetic effect
  const maxDistance = rect.width * 1.5

  // Apply magnetic effect when cursor is within range
  if (distance < maxDistance && distance > 0) {
    const strength =
      (1 - distance / maxDistance) * config.value.magneticStrength

    // Calculate magnetic pull toward cursor
    const pullX =
      (distanceX / distance) * config.value.magneticMaxDistancePx * strength
    const pullY =
      (distanceY / distance) * config.value.magneticMaxDistancePx * strength

    // Cancel any existing animation frame
    if (magneticAnimationFrame !== null) {
      cancelAnimationFrame(magneticAnimationFrame)
    }

    // Smooth update using requestAnimationFrame
    magneticAnimationFrame = requestAnimationFrame(() => {
      bookmarkMagneticX.value = pullX
      bookmarkMagneticY.value = pullY
    })
  } else {
    bookmarkMagneticX.value = 0
    bookmarkMagneticY.value = 0
  }
}

// Computed styles for magnetic bookmark
const magneticBookmarkStyle = computed(() => {
  if (prefersReducedMotion.value || !isBookmarkHovering.value) {
    return {}
  }

  return {
    transform: `translate(${bookmarkMagneticX.value}px, ${bookmarkMagneticY.value}px)`,
    transition: `transform ${config.value.magneticReturnDurationMs}ms ${EASING.SPRING_STANDARD}`,
  }
})

// Computed styles for visit button (subtle magnetic effect)
const magneticButtonStyle = computed(() => {
  if (prefersReducedMotion.value) {
    return {}
  }

  return {
    transform: `translate(${visitMagneticX.value}px, ${visitMagneticY.value}px)`,
    transition: `transform ${config.value.magneticReturnDurationMs}ms ${EASING.SPRING_STANDARD}`,
  }
})

// Lifecycle hooks
onMounted(() => {
  // Check reduced motion preference
  updateReducedMotion()

  // Listen for changes in reduced motion preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', updateReducedMotion)
  }

  // Trigger entrance animation after a short delay
  setTimeout(() => {
    isLoaded.value = true
  }, animationConfig.resourceHeader.entranceStaggerDelayMs)
})

onUnmounted(() => {
  // Clean up event listener
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.removeEventListener('change', updateReducedMotion)
  }
  // Clean up animation frame
  if (magneticAnimationFrame !== null) {
    cancelAnimationFrame(magneticAnimationFrame)
  }
})
</script>

<style scoped>
/* Palette's micro-UX enhancement: Spring physics entrance animations */
.resource-header__title--entrance {
  animation: titleEntrance v-bind('`${config.titleEntranceDurationMs}ms`')
    v-bind('config.entranceEasing') forwards;
}

.resource-header__category--entrance {
  animation: categoryEntrance v-bind('`${config.categoryEntranceDurationMs}ms`')
    v-bind('config.entranceEasing') forwards;
  animation-delay: v-bind('`${config.entranceStaggerDelayMs}ms`');
  opacity: 0;
}

/* Title Entrance Animation with spring physics */
@keyframes titleEntrance {
  0% {
    opacity: 0;
    transform: translateY(v-bind('`${config.entranceTranslateYPx}px`'))
      scale(0.98);
  }
  60% {
    transform: translateY(-2px) scale(1.01);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Category Entrance Animation */
@keyframes categoryEntrance {
  0% {
    opacity: 0;
    transform: translateY(v-bind('`${config.entranceTranslateYPx - 4}px`'));
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Palette's micro-UX enhancement: Magnetic bookmark wrapper */
.resource-header__bookmark-wrapper {
  position: relative;
  display: inline-flex;
  padding: 4px; /* Creates larger hover target for magnetic effect */
  margin: -4px;
}

.resource-header__bookmark {
  transition: transform v-bind('`${config.magneticReturnDurationMs}ms`')
    v-bind('EASING.SPRING_STANDARD');
}

.resource-header__bookmark--magnetic {
  will-change: transform;
}

/* Button Micro-Interactions */
.resource-header__button {
  position: relative;
  overflow: hidden;
  transform: translateY(0);
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
  transition:
    transform v-bind('`${config.magneticReturnDurationMs}ms`')
      v-bind('EASING.SPRING_STANDARD'),
    box-shadow v-bind('`${config.magneticReturnDurationMs}ms`') ease-out,
    background-color v-bind('animationConfig.cssTransitions.normalSec') ease-out;
}

.resource-header__button--hover {
  background-color: rgb(17, 24, 39); /* gray-900 */
  transform: translateY(v-bind('`-${config.buttonHoverLiftPx}px`'));
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.resource-header__button--pressed {
  transform: translateY(0) scale(v-bind('config.buttonPressScale'));
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition:
    transform v-bind('animationConfig.cssTransitions.fastSec') ease-out,
    box-shadow v-bind('animationConfig.cssTransitions.fastSec') ease-out;
}

/* Icon Animation - Diagonal movement on hover */
.resource-header__icon--animated {
  animation: iconDiagonalMove v-bind('`${config.iconAnimationDurationMs}ms`')
    ease-out forwards;
}

@keyframes iconDiagonalMove {
  0% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(3px, -3px);
  }
  100% {
    transform: translate(2px, -2px);
  }
}

/* Actions container */
.resource-header__actions {
  display: flex;
  align-items: center;
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

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .resource-header__title--entrance,
  .resource-header__category--entrance {
    animation: none;
    opacity: 1;
  }

  .resource-header__button {
    transition: none;
  }

  .resource-header__icon {
    transition: none;
  }

  .resource-header__bookmark {
    transition: none;
    transform: none !important;
  }
}

/* Focus styles for accessibility */
.resource-header__button:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px white,
    0 0 0 4px rgb(31, 41, 55);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .resource-header__button {
    border: 2px solid currentColor;
  }
}
</style>
