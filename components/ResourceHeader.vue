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
      class="resource-header__content flex flex-col sm:flex-row justify-between items-start sm:items-center"
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

      <!-- Visit Resource Button with Micro-UX Enhancements -->
      <div class="resource-header__actions mt-4 sm:mt-0">
        <a
          :href="url"
          target="_blank"
          rel="noopener noreferrer"
          class="resource-header__button inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-800"
          :class="{
            'resource-header__button--hover': isHovering,
            'resource-header__button--pressed': isPressed,
          }"
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
            class="resource-header__icon ml-2 h-4 w-4 transition-transform duration-200"
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
import { ref, onMounted, onUnmounted } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { contentConfig } from '~/configs/content.config'
import { hapticLight } from '~/utils/hapticFeedback'

interface Props {
  title: string
  category: string
  status?: string
  healthScore?: number
  url: string
}

defineProps<Props>()

// Micro-UX State Management
const isHovering = ref(false)
const isPressed = ref(false)
const isLoaded = ref(false)
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

// Update reduced motion preference
const updateReducedMotion = () => {
  prefersReducedMotion.value = checkReducedMotion()
}

// Mouse event handlers
const handleMouseEnter = () => {
  isHovering.value = true
}

const handleMouseLeave = () => {
  isHovering.value = false
  isPressed.value = false
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

  // Clear announcement after a delay
  setTimeout(() => {
    announcement.value = ''
  }, 1000)
}

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
  }, animationConfig.similarResources.staggerDelayMs)
})

onUnmounted(() => {
  // Clean up event listener
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.removeEventListener('change', updateReducedMotion)
  }
})
</script>

<style scoped>
/* Entrance Animations */
.resource-header__title--entrance {
  animation: titleEntrance
    v-bind('`${animationConfig.similarResources.entranceDurationMs}ms`')
    ease-out forwards;
}

.resource-header__category--entrance {
  animation: categoryEntrance
    v-bind('`${animationConfig.similarResources.entranceDurationMs}ms`')
    ease-out forwards;
  animation-delay: v-bind(
    '`${animationConfig.similarResources.staggerDelayMs}ms`'
  );
  opacity: 0;
}

/* Title Entrance Animation */
@keyframes titleEntrance {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Category Entrance Animation */
@keyframes categoryEntrance {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Button Micro-Interactions */
.resource-header__button {
  position: relative;
  overflow: hidden;
  transform: translateY(0);
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.resource-header__button--hover {
  background-color: rgb(17, 24, 39); /* gray-900 */
  transform: translateY(-1px);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.resource-header__button--pressed {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* Icon Animation - Diagonal movement on hover */
.resource-header__icon--animated {
  animation: iconDiagonalMove 0.3s ease-out forwards;
}

@keyframes iconDiagonalMove {
  0% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(2px, -2px);
  }
  100% {
    transform: translate(1px, -1px);
  }
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
}

/* Focus styles for accessibility */
.resource-header__button:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px white,
    0 0 0 4px rgb(31, 41, 55);
}
</style>
