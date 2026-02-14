<template>
  <section
    class="benefits-section"
    :class="{ 'animations-enabled': !prefersReducedMotion }"
    role="region"
    :aria-label="
      contentConfig.resourceDetails?.benefitsSectionTitle ||
        'Free Tier Benefits'
    "
  >
    <!-- Section header with icon -->
    <div class="benefits-header">
      <div
        class="benefits-icon"
        :class="{ 'animate-icon-bounce': !prefersReducedMotion && isVisible }"
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 class="benefits-title">
        {{
          contentConfig.resourceDetails?.benefitsSectionTitle ||
            'Free Tier Benefits'
        }}
      </h2>
    </div>

    <!-- Benefits list with staggered animation -->
    <TransitionGroup
      tag="ul"
      class="benefits-list"
      :class="{ 'reduced-motion': prefersReducedMotion }"
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 translate-x-4 scale-95"
      enter-to-class="opacity-100 translate-x-0 scale-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 translate-x-0 scale-100"
      leave-to-class="opacity-0 -translate-x-4 scale-95"
      @before-enter="handleBeforeEnter"
      @enter="handleEnter"
    >
      <li
        v-for="(benefit, index) in benefits"
        :key="`benefit-${index}`"
        class="benefit-item"
        :class="{
          'is-hovered': hoveredIndex === index,
          'is-pressed': pressedIndex === index,
        }"
        :style="getItemStyle(index)"
        @mouseenter="handleMouseEnter(index)"
        @mouseleave="handleMouseLeave"
        @mousedown="handlePressStart(index)"
        @mouseup="handlePressEnd"
        @touchstart="handlePressStart(index)"
        @touchend="handlePressEnd"
      >
        <!-- Animated checkmark icon -->
        <div
          class="benefit-icon-wrapper"
          :class="{ 'icon-animated': !prefersReducedMotion && isVisible }"
          :style="{ animationDelay: `${index * staggerDelayMs}ms` }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="benefit-checkmark"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
              class="checkmark-path"
            />
          </svg>
        </div>

        <!-- Benefit text with highlight on hover -->
        <span
          class="benefit-text"
          :class="{ 'text-highlighted': hoveredIndex === index }"
        >
          {{ benefit }}
        </span>

        <!-- Sparkle effect on hover -->
        <span
          v-if="hoveredIndex === index && !prefersReducedMotion"
          class="sparkle-effect"
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="sparkle-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"
            />
          </svg>
        </span>
      </li>
    </TransitionGroup>

    <!-- Screen reader announcements -->
    <div
      class="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ announcementText }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'
import { EASING } from '~/configs/easing.config'
import { hapticLight } from '~/utils/hapticFeedback'

interface Props {
  benefits: string[]
}

defineProps<Props>()

// Reactive state for micro-UX
const prefersReducedMotion = ref(false)
const hoveredIndex = ref<number | null>(null)
const pressedIndex = ref<number | null>(null)
const isVisible = ref(false)
const announcementText = ref('')

// Animation timing from config - Flexy hates hardcoded values!
const staggerDelayMs = animationConfig.benefits?.staggerDelayMs || 100
const entranceDurationMs = animationConfig.benefits?.entranceDurationMs || 600
const pressDurationMs =
  animationConfig.microInteractions?.pressDurationMs || 150

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Get item style with staggered delay
const getItemStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}

  return {
    '--item-index': index,
    '--stagger-delay': `${index * staggerDelayMs}ms`,
  }
}

// Handle mouse enter with haptic feedback
const handleMouseEnter = (index: number) => {
  hoveredIndex.value = index
}

// Handle mouse leave
const handleMouseLeave = () => {
  hoveredIndex.value = null
  pressedIndex.value = null
}

// Handle press start
const handlePressStart = (index: number) => {
  if (prefersReducedMotion.value) return
  pressedIndex.value = index
}

// Handle press end
const handlePressEnd = () => {
  pressedIndex.value = null
}

// Transition handlers for staggered entrance
const handleBeforeEnter = (el: Element) => {
  const htmlEl = el as HTMLElement
  htmlEl.style.opacity = '0'
  htmlEl.style.transform = 'translateX(20px) scale(0.95)'
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
    htmlEl.style.transition = `all ${entranceDurationMs}ms ${EASING.SPRING_SNAPPY}`
    htmlEl.style.opacity = '1'
    htmlEl.style.transform = 'translateX(0) scale(1)'

    // Haptic feedback on first item entrance
    if (delay === 0) {
      hapticLight()
    }

    setTimeout(done, entranceDurationMs)
  }, delay)
}

// Intersection Observer for entrance animation
let observer: IntersectionObserver | null = null

onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleMotionChange)

    // Set up intersection observer for entrance animation
    const section = document.querySelector('.benefits-section')
    if (section && !prefersReducedMotion.value) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              isVisible.value = true
              observer?.disconnect()
            }
          })
        },
        { threshold: 0.2 }
      )
      observer.observe(section)
    } else {
      isVisible.value = true
    }

    // Announce to screen readers
    announcementText.value = `${contentConfig.resourceDetails?.benefitsSectionTitle || 'Benefits'} section loaded`
    setTimeout(() => {
      announcementText.value = ''
    }, 2000)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<style scoped>
/* Section container */
.benefits-section {
  margin-bottom: 2rem;
}

/* Header with icon */
.benefits-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.benefits-icon {
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.625rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.animate-icon-bounce {
  animation: icon-bounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes icon-bounce {
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.benefits-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(17, 24, 39);
  margin: 0;
}

/* Benefits list */
.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Benefit item with micro-UX hover effects */
.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border: 1px solid #bbf7d0;
  border-radius: 0.75rem;
  transition: all
    v-bind('`${animationConfig.transition?.normal?.durationMs || 300}ms`')
    v-bind('EASING.SPRING_STANDARD');
  cursor: default;
  position: relative;
  overflow: hidden;
}

/* Hover state - lift and enhance */
.benefit-item.is-hovered {
  transform: translateY(-2px) scale(1.01);
  box-shadow:
    0 4px 6px -1px rgba(16, 185, 129, 0.1),
    0 2px 4px -1px rgba(16, 185, 129, 0.06);
  border-color: #86efac;
}

/* Pressed state - scale down for tactile feedback */
.benefit-item.is-pressed {
  transform: scale(0.98) translateY(0) !important;
  transition-duration: v-bind('`${pressDurationMs}ms`');
}

/* Icon wrapper */
.benefit-icon-wrapper {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.icon-animated {
  animation: icon-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) backwards;
}

@keyframes icon-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  70% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Checkmark styling */
.benefit-checkmark {
  width: 1.25rem;
  height: 1.25rem;
  color: #10b981;
}

.checkmark-path {
  transform-origin: center;
  animation: checkmark-scale 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    backwards;
  animation-delay: inherit;
}

@keyframes checkmark-scale {
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

/* Benefit text */
.benefit-text {
  color: rgb(55, 65, 81);
  line-height: 1.5;
  font-size: 0.9375rem;
  transition: color 0.2s ease;
}

.text-highlighted {
  color: rgb(17, 24, 39);
  font-weight: 500;
}

/* Sparkle effect on hover */
.sparkle-effect {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.sparkle-icon {
  width: 1rem;
  height: 1rem;
  color: #fbbf24;
  animation: sparkle-twinkle 1s ease-in-out infinite;
}

@keyframes sparkle-twinkle {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
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

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .benefit-item,
  .benefit-text {
    transition: none;
    animation: none;
  }

  .benefit-item.is-hovered {
    transform: none;
    box-shadow: none;
    border-color: #86efac;
  }

  .benefit-icon-wrapper {
    animation: none;
  }

  .checkmark-path {
    animation: none;
  }

  .sparkle-icon {
    animation: none;
  }

  .animate-icon-bounce {
    animation: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .benefit-item {
    border-width: 2px;
  }

  .benefit-checkmark {
    stroke: currentColor;
    stroke-width: 2;
  }
}
</style>
