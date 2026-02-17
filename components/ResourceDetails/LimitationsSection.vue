<template>
  <section
    class="limitations-section"
    role="region"
    :aria-labelledby="sectionId"
  >
    <!-- Section Header with Icon -->
    <div class="limitations-section__header">
      <div
        class="limitations-section__icon"
        :class="{
          'animate-icon-pulse': !prefersReducedMotion && hasLimitations,
        }"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <h2 :id="sectionId" class="limitations-section__title">
        {{ contentConfig.resourceDetails.sections.limitations }}
      </h2>
    </div>

    <!-- Limitations List with Staggered Animation -->
    <TransitionGroup
      name="limitation-item"
      tag="ul"
      class="limitations-section__list"
      :class="{ 'animations-enabled': !prefersReducedMotion }"
      @before-enter="handleBeforeEnter"
      @enter="handleEnter"
    >
      <li
        v-for="(limitation, index) in limitations"
        :key="`limitation-${index}`"
        class="limitations-section__item"
        :style="getItemStyle(index)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="limitations-section__bullet"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="limitations-section__text">{{ limitation }}</span>
      </li>
    </TransitionGroup>

    <!-- Screen Reader Announcement -->
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
      {{ announcementText }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'
import { EASING } from '~/configs/easing.config'
import { limitsConfig } from '~/configs/limits.config'
import { componentColorsConfig } from '~/configs/component-colors.config'

interface Props {
  limitations: string[]
}

const props = defineProps<Props>()

// Generate unique section ID for accessibility
// Flexy hates hardcoded 9! Using limitsConfig.displayLength.sectionIdLength
const sectionId = `limitations-section-${Math.random().toString(36).substring(2, limitsConfig.displayLength.sectionIdLength)}`

// Track reduced motion preference
const prefersReducedMotion = ref(false)
const announcementText = ref('')

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Computed property to check if we have limitations
const hasLimitations = computed(() => props.limitations.length > 0)

// Get item style with staggered delay for entrance animation
const getItemStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}

  const staggerDelay = Math.min(
    index * animationConfig.limitations.staggerDelayMs,
    animationConfig.limitations.maxStaggerDelayMs
  )

  return {
    '--item-index': index,
    '--stagger-delay': `${staggerDelay}ms`,
  }
}

// Handle before enter - set initial state
const handleBeforeEnter = (el: Element) => {
  const htmlEl = el as HTMLElement
  htmlEl.style.opacity = '0'
  htmlEl.style.transform = 'translateX(-20px)'
}

// Handle enter animation
const handleEnter = (el: Element, done: () => void) => {
  const htmlEl = el as HTMLElement
  const delay = parseInt(
    htmlEl.style.getPropertyValue('--stagger-delay') || '0'
  )

  setTimeout(() => {
    htmlEl.style.opacity = '1'
    htmlEl.style.transform = 'translateX(0)'
    done()
  }, delay)
}

// Announce limitations count to screen readers
const announceLimitations = () => {
  if (props.limitations.length > 0) {
    const count = props.limitations.length
    announcementText.value = `${count} limitation${count !== 1 ? 's' : ''} listed`
    setTimeout(() => {
      announcementText.value = ''
    }, animationConfig.limitations.announcementClearDelayMs)
  }
}

// Media query refs for cleanup
let mediaQueryRef: MediaQueryList | null = null
let handleMotionChangeRef: ((e: MediaQueryListEvent) => void) | null = null

// Initialize on mount
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes
  mediaQueryRef = window.matchMedia('(prefers-reduced-motion: reduce)')
  handleMotionChangeRef = (e: MediaQueryListEvent) => {
    prefersReducedMotion.value = e.matches
  }
  mediaQueryRef.addEventListener('change', handleMotionChangeRef)

  // Announce limitations after a short delay to allow screen readers to catch up
  // Flexy hates hardcoded 500! Using config value
  setTimeout(announceLimitations, animationConfig.limitations.announceDelayMs)
})

// Cleanup on unmount
onUnmounted(() => {
  if (mediaQueryRef && handleMotionChangeRef) {
    mediaQueryRef.removeEventListener('change', handleMotionChangeRef)
    mediaQueryRef = null
    handleMotionChangeRef = null
  }
})

// Watch for changes in limitations and re-announce
watch(
  () => props.limitations.length,
  () => {
    announceLimitations()
  }
)
</script>

<style scoped>
/* 🎨 Pallete's micro-UX enhancement: Limitations Section Styles */

.limitations-section {
  margin-bottom: 2rem;
}

.limitations-section__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.limitations-section__icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: linear-gradient(
    135deg,
    v-bind('componentColorsConfig.limitations.icon.gradientStart') 0%,
    v-bind('componentColorsConfig.limitations.icon.gradientEnd') 100%
  );
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px -1px
    v-bind('componentColorsConfig.limitations.icon.shadow');
}

/* Icon pulse animation for visual interest */
.animate-icon-pulse {
  animation: icon-pulse
    v-bind('animationConfig.limitations.iconPulseDurationSec + "s"') ease-in-out
    infinite;
}

@keyframes icon-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 2px 4px -1px
      v-bind('componentColorsConfig.limitations.icon.shadow');
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 4px 8px -2px
      v-bind('componentColorsConfig.limitations.icon.shadowHover');
  }
}

.limitations-section__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: v-bind('componentColorsConfig.limitations.title');
  line-height: 1.4;
}

.limitations-section__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.limitations-section__item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: v-bind('componentColorsConfig.limitations.item.background');
  border-radius: 0.5rem;
  border-left: 3px solid
    v-bind('componentColorsConfig.limitations.item.borderColor');
  transition: all v-bind('animationConfig.limitations.itemTransitionSec + "s"')
    ease-out;
}

.limitations-section__item:hover {
  background-color: v-bind(
    'componentColorsConfig.limitations.item.hoverBackground'
  );
  transform: translateX(4px);
  box-shadow: 0 2px 4px -1px
    v-bind('componentColorsConfig.limitations.item.hoverShadow');
}

.limitations-section__bullet {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  color: v-bind('componentColorsConfig.limitations.bullet');
  margin-top: 0.125rem;
}

.limitations-section__text {
  color: v-bind('componentColorsConfig.limitations.text');
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Vue Transition Group Animations */
.limitation-item-enter-active,
.limitation-item-leave-active {
  transition: all
    v-bind('animationConfig.limitations.entranceDurationSec + "s"')
    v-bind('EASING.SPRING_SNAPPY');
}

.limitation-item-enter-from,
.limitation-item-leave-to {
  opacity: 0;
  transform: translateX(-20px);
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
  .animate-icon-pulse {
    animation: none;
  }

  .limitations-section__item {
    transition: none;
  }

  .limitations-section__item:hover {
    transform: none;
  }

  .limitation-item-enter-active,
  .limitation-item-leave-active {
    transition: opacity
      v-bind('animationConfig.limitations.reducedMotionTransitionSec + "s"')
      ease-out;
  }

  .limitation-item-enter-from,
  .limitation-item-leave-to {
    transform: none;
  }
}
</style>
