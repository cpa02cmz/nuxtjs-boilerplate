<template>
  <div ref="featuresContainer" class="mb-8">
    <!-- Section Title with subtle animation -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
    >
      <h2 v-if="isVisible" class="text-xl font-semibold text-gray-900 mb-4">
        {{ contentConfig.resourceDetails.sections.features }}
      </h2>
    </Transition>

    <!-- Features List with Staggered Entrance -->
    <ul
      class="space-y-2"
      role="list"
      :aria-label="contentConfig.resourceDetails.aria.featuresList"
    >
      <li
        v-for="(feature, index) in features"
        :key="index"
        ref="featureItems"
        class="feature-item flex items-start"
        :class="{
          'feature-item--visible': visibleItems.has(index),
          'feature-item--reduced-motion': prefersReducedMotion,
          'feature-item--hovering':
            hoverIndex === index && !prefersReducedMotion,
        }"
        :style="getItemStyle(index)"
        @mouseenter="handleMouseEnter(index)"
        @mouseleave="handleMouseLeave"
      >
        <!-- Animated Checkmark Icon -->
        <span
          class="feature-icon flex-shrink-0 mr-2 mt-0.5"
          :class="{
            'feature-icon--animated':
              visibleItems.has(index) && !prefersReducedMotion,
          }"
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-green-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              class="checkmark-path"
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
        </span>

        <!-- Feature Text with subtle highlight on hover -->
        <span
          class="feature-text text-gray-700"
          :class="{
            'feature-text--highlighted': hoverIndex === index,
          }"
        >
          {{ feature }}
        </span>
      </li>
    </ul>

    <!-- Screen Reader Announcement -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ announcement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { contentConfig } from '~/configs/content.config'
import { hapticLight } from '~/utils/hapticFeedback'

interface Props {
  features: string[]
}

const props = defineProps<Props>()

// Reactive state - Palette's micro-UX enhancement!
const featuresContainer = ref<HTMLElement | null>(null)
const featureItems = ref<HTMLElement[]>([])
const visibleItems = ref<Set<number>>(new Set())
const hoverIndex = ref<number | null>(null)
const isVisible = ref(false)
const prefersReducedMotion = ref(false)
const announcement = ref('')
const intersectionObserver = ref<IntersectionObserver | null>(null)

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Get item style with staggered animation delay
const getItemStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}

  return {
    '--item-index': index,
    '--stagger-delay': `${index * animationConfig.featuresSection.staggerDelayMs}ms`,
  } as Record<string, string>
}

// Handle mouse enter with haptic feedback
const handleMouseEnter = (index: number) => {
  hoverIndex.value = index
  // Palette's micro-UX delight: Haptic feedback on mobile
  hapticLight()
}

// Handle mouse leave
const handleMouseLeave = () => {
  hoverIndex.value = null
}

// Trigger staggered entrance animation
const triggerEntranceAnimation = () => {
  if (prefersReducedMotion.value) {
    // Show all items immediately for reduced motion
    props.features.forEach((_, index) => {
      visibleItems.value.add(index)
    })
    isVisible.value = true
    return
  }

  // Animate title first
  isVisible.value = true

  // Stagger animate each feature item
  props.features.forEach((feature, index) => {
    setTimeout(
      () => {
        visibleItems.value.add(index)

        // Announce for screen readers on first few items
        if (index < 3) {
          announcement.value =
            contentConfig.resourceDetails.announcements.featureRevealed.replace(
              '{feature}',
              feature
            )
          setTimeout(() => {
            announcement.value = ''
          }, animationConfig.microInteractions.announcementDelayMs)
        }
      },
      index * animationConfig.featuresSection.staggerDelayMs + 200
    ) // +200ms delay after title
  })
}

// Media query refs for cleanup
let mediaQueryRef: MediaQueryList | null = null
let handleChangeRef: ((e: MediaQueryListEvent) => void) | null = null

// Setup intersection observer for entrance animation
const setupIntersectionObserver = () => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    // Fallback: show all items immediately
    triggerEntranceAnimation()
    return
  }

  intersectionObserver.value = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          triggerEntranceAnimation()
          // Disconnect after triggering once
          intersectionObserver.value?.disconnect()
        }
      })
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px',
    }
  )

  if (featuresContainer.value) {
    intersectionObserver.value.observe(featuresContainer.value)
  }
}

// Lifecycle
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Setup intersection observer for scroll-triggered animation
  nextTick(() => {
    setupIntersectionObserver()
  })

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined') {
    mediaQueryRef = window.matchMedia('(prefers-reduced-motion: reduce)')
    handleChangeRef = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQueryRef.addEventListener('change', handleChangeRef)
  }
})

onUnmounted(() => {
  if (intersectionObserver.value) {
    intersectionObserver.value.disconnect()
  }

  // Clean up event listeners
  if (mediaQueryRef && handleChangeRef) {
    mediaQueryRef.removeEventListener('change', handleChangeRef)
    mediaQueryRef = null
    handleChangeRef = null
  }
})
</script>

<style scoped>
/* Feature Item Base Styles */
.feature-item {
  opacity: 0;
  transform: translateY(
    v-bind('`${animationConfig.featuresSection.entranceDistancePx}px`')
  );
  transition:
    opacity v-bind('animationConfig.featuresSection.entranceDurationSec')
      ease-out,
    transform v-bind('animationConfig.featuresSection.entranceDurationSec')
      ease-out,
    background-color v-bind('animationConfig.cssTransitions.fastSec') ease-out;
  border-radius: v-bind('animationConfig.borderRadius.md');
  padding: 0.25rem 0.5rem;
  margin-left: -0.5rem;
}

/* Feature Item Visible State */
.feature-item--visible {
  opacity: 1;
  transform: translateY(0);
}

/* Feature Item Hover State - Palette's micro-UX delight! */
.feature-item:hover,
.feature-item--hovering {
  background-color: rgba(34, 197, 94, 0.05);
  transform: translateY(
      v-bind('`-${animationConfig.featuresSection.hoverLiftPx}px`')
    )
    scale(v-bind('animationConfig.featuresSection.hoverScale'));
}

/* Feature Icon Animation */
.feature-icon {
  transform: scale(0);
  transition: transform
    v-bind('animationConfig.featuresSection.checkmarkScaleMs + "ms"')
    v-bind('animationConfig.cssEasing.spring');
}

.feature-item--visible .feature-icon--animated {
  animation: icon-pop
    v-bind('animationConfig.featuresSection.checkmarkScaleMs + "ms"')
    v-bind('animationConfig.cssEasing.spring') forwards;
  animation-delay: calc(var(--stagger-delay, 0ms) + 150ms);
}

@keyframes icon-pop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(v-bind('animationConfig.featuresSection.iconPulseScale'));
  }
  100% {
    transform: scale(1);
  }
}

/* Checkmark Draw Animation */
.checkmark-path {
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
}

.feature-item--visible .feature-icon--animated .checkmark-path {
  animation: checkmark-draw
    v-bind('animationConfig.featuresSection.checkmarkDrawSec') ease-out forwards;
  animation-delay: var(--stagger-delay, 0ms);
}

@keyframes checkmark-draw {
  to {
    stroke-dashoffset: 0;
  }
}

/* Feature Text Highlight */
.feature-text {
  transition: color v-bind('animationConfig.cssTransitions.fastSec') ease-out;
}

.feature-text--highlighted {
  color: v-bind('contentConfig.colors.success || "#16a34a"');
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .feature-item {
    transition: none;
    opacity: 1;
    transform: none;
  }

  .feature-item:hover,
  .feature-item--hovering {
    transform: none;
  }

  .feature-icon {
    transform: scale(1);
  }

  .feature-icon--animated {
    animation: none;
  }

  .checkmark-path {
    stroke-dashoffset: 0;
  }
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .feature-item:hover,
  .feature-item--hovering {
    background-color: rgba(34, 197, 94, 0.1);
  }

  .feature-text--highlighted {
    color: #16a34a;
    font-weight: 500;
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
