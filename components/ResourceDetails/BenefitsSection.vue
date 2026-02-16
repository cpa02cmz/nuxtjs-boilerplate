<template>
  <div class="mb-8">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">Free Tier Benefits</h2>
    <ul
      ref="benefitsList"
      class="space-y-2"
      role="list"
      aria-label="Free tier benefits list"
    >
      <li
        v-for="(benefit, index) in benefits"
        :key="index"
        class="flex items-start benefit-item"
        :class="{
          'animate-fade-in-up': !prefersReducedMotion && isVisible,
          'is-visible': isVisible,
        }"
        :style="{
          animationDelay: `${index * staggerDelayMs}ms`,
        }"
        @mouseenter="handleMouseEnter(index)"
        @mouseleave="handleMouseLeave"
      >
        <!-- Animated Checkmark Icon - Palette's micro-UX delight! -->
        <span
          class="benefit-icon-wrapper flex-shrink-0 mr-2 mt-0.5"
          :class="{
            'is-hovered': hoveredIndex === index && !prefersReducedMotion,
          }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-green-500 benefit-icon"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
              class="checkmark-path"
              :class="{
                'animate-draw-check': !prefersReducedMotion && isVisible,
              }"
              :style="{
                animationDelay: `${index * staggerDelayMs + checkmarkDelayMs}ms`,
              }"
            />
          </svg>
        </span>
        <span
          class="text-gray-700 benefit-text"
          :class="{
            'is-hovered': hoveredIndex === index,
          }"
        >
          {{ benefit }}
        </span>
      </li>
    </ul>

    <!-- Screen reader announcement for hover feedback -->
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
      {{ hoverAnnouncement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { animationConfig } from '~/configs/animation.config'

interface Props {
  benefits: string[]
}

defineProps<Props>()

// Pallete's micro-UX enhancement: Track visibility and hover states
const isVisible = ref(false)
const hoveredIndex = ref<number | null>(null)
const benefitsList = ref<HTMLElement | null>(null)
const prefersReducedMotion = ref(false)
const hoverAnnouncement = ref('')

// Flexy hates hardcoded values! Using configurable animation timings
const staggerDelayMs = animationConfig.benefitsSection.staggerDelayMs
const checkmarkDelayMs = animationConfig.benefitsSection.checkmarkDelayMs

// Check for reduced motion preference for accessibility
const checkReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Pallete's micro-UX enhancement: Handle hover with subtle feedback
const handleMouseEnter = (index: number) => {
  hoveredIndex.value = index
}

const handleMouseLeave = () => {
  hoveredIndex.value = null
}

// Trigger entrance animation on mount
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Small delay to ensure smooth animation
  setTimeout(() => {
    isVisible.value = true
  }, 50)
})
</script>

<style scoped>
/* Base styles */
.benefit-item {
  opacity: 0;
  transform: translateY(10px);
  transition: all
    v-bind('animationConfig.benefitsSection.transitionDurationMs + "ms"')
    ease-out;
}

.benefit-item.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Fade-in-up animation for staggered entrance */
.animate-fade-in-up {
  animation: fade-in-up
    v-bind('animationConfig.benefitsSection.entranceDurationMs + "ms"') ease-out
    forwards;
  opacity: 0;
}

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Checkmark path drawing animation - Palette's micro-UX delight! */
.checkmark-path {
  stroke-dasharray: 30;
  stroke-dashoffset: 0;
}

.animate-draw-check {
  animation: draw-check
    v-bind('animationConfig.benefitsSection.checkmarkDrawMs + "ms"') ease-out
    forwards;
}

@keyframes draw-check {
  0% {
    stroke-dashoffset: 30;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

/* Hover effects - Palette's micro-UX delight! */
.benefit-icon-wrapper {
  transition: transform
    v-bind('animationConfig.benefitsSection.hoverDurationMs + "ms"') ease-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.benefit-icon-wrapper.is-hovered {
  transform: scale(1.2) rotate(-5deg);
}

.benefit-icon {
  transition: filter
    v-bind('animationConfig.benefitsSection.hoverDurationMs + "ms"') ease-out;
}

.benefit-icon-wrapper.is-hovered .benefit-icon {
  filter: drop-shadow(0 2px 4px rgba(34, 197, 94, 0.3));
}

.benefit-text {
  transition: color
    v-bind('animationConfig.benefitsSection.hoverDurationMs + "ms"') ease-out;
}

.benefit-text.is-hovered {
  color: #111827; /* gray-900 */
}

/* Reduced motion support - Accessibility first! */
@media (prefers-reduced-motion: reduce) {
  .benefit-item,
  .benefit-item.is-visible {
    opacity: 1;
    transform: none;
    animation: none;
  }

  .animate-fade-in-up {
    animation: none;
    opacity: 1;
  }

  .animate-draw-check {
    animation: none;
  }

  .benefit-icon-wrapper.is-hovered {
    transform: none;
  }

  .benefit-icon-wrapper,
  .benefit-icon,
  .benefit-text {
    transition: none;
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
</style>
