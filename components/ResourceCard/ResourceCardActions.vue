<template>
  <div
    class="flex items-center space-x-2"
    role="group"
    :aria-label="`Actions for ${title}`"
  >
    <!-- Copied tooltip - appears at click position for delightful micro-UX feedback -->
    <Transition
      :enter-active-class="transitionEnterNormal"
      enter-from-class="opacity-0 scale-75 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      :leave-active-class="transitionLeaveFast"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-75 -translate-y-1"
    >
      <div
        v-if="showCopiedTooltip"
        class="copied-tooltip fixed z-50 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none whitespace-nowrap"
        :style="copiedTooltipStyle"
        role="status"
        aria-live="polite"
      >
        <span class="flex items-center gap-1.5">
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          Copied!
        </span>
        <!-- Arrow pointing down -->
        <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5">
          <div class="w-2 h-2 bg-gray-900 transform rotate-45" />
        </div>
      </div>
    </Transition>

    <!-- Bookmark button -->
    <ClientOnly>
      <LazyBookmarkButton
        v-if="id"
        :resource-id="id"
        :title="title"
        :description="description"
        :url="url"
      />
    </ClientOnly>

    <!-- Share button -->
    <ClientOnly>
      <LazyShareButton
        v-if="id"
        :title="title"
        :description="description"
        :url="shareUrl"
      />
    </ClientOnly>

    <!-- Quick Copy button with inline feedback and magnetic effect -->
    <div class="flex items-center">
      <button
        v-if="id"
        ref="copyButtonRef"
        :class="[
          // WCAG 2.5.5: Minimum touch target size 44x44px
          `p-2.5 min-w-[44px] min-h-[44px] rounded-full transition-all ${transitionClasses.normal} ease-out magnetic-button`,
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          isCopied
            ? 'bg-green-100 text-green-600 scale-110'
            : isCopyError
              ? 'bg-red-100 text-red-600 scale-110'
              : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100 hover:scale-110 active:scale-95 dark:text-gray-500 dark:hover:text-gray-200 dark:hover:bg-gray-800',
          { 'is-magnetic': isCopyMagnetic && !prefersReducedMotion },
        ]"
        :aria-label="copyButtonAriaLabel"
        :title="copyButtonTitle"
        :style="copyButtonStyle"
        @click="copyResourceUrl($event)"
        @mousemove="handleCopyMouseMove"
        @mouseleave="handleCopyMouseLeave"
      >
        <svg
          v-if="isCopyError"
          xmlns="http://www.w3.org/2000/svg"
          :class="['h-5 w-5', isCopyAnimating && 'animate-shake']"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else-if="isCopied"
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 animate-check-pop"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          :class="[
            `h-5 w-5 transition-transform ${transitionClasses.normal}`,
            isCopyAnimating && 'animate-icon-pop',
          ]"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path
            d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"
          />
        </svg>
      </button>

      <!-- Inline feedback label -->
      <transition
        :enter-active-class="transitionEnterNormal"
        enter-from-class="opacity-0 -translate-x-2"
        enter-to-class="opacity-100 translate-x-0"
        :leave-active-class="transitionLeaveFast"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 -translate-x-2"
      >
        <span
          v-if="isCopied"
          class="ml-1 text-xs font-medium text-green-600 whitespace-nowrap"
          aria-hidden="true"
        >
          Copied!
        </span>
        <span
          v-else-if="isCopyError"
          class="ml-1 text-xs font-medium text-red-600 whitespace-nowrap"
          aria-hidden="true"
        >
          Failed
        </span>
      </transition>
    </div>

    <!-- Copy announcement for screen readers -->
    <div
      :id="`copy-announcement-${id}`"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ copyStatus }}
    </div>

    <!-- Compare button with inline feedback and magnetic effect -->
    <div class="flex items-center">
      <button
        v-if="id"
        ref="compareButtonRef"
        :class="[
          `p-2 rounded-full transition-all ${transitionClasses.normal} ease-out magnetic-button`,
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          isAddingToComparison
            ? 'bg-blue-100 text-blue-600 scale-110'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 hover:scale-110 active:scale-95 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800',
          { 'is-magnetic': isCompareMagnetic && !prefersReducedMotion },
        ]"
        :aria-label="compareButtonAriaLabel"
        :title="compareButtonTitle"
        :aria-pressed="isAddingToComparison"
        :style="compareButtonStyle"
        @click="addResourceToComparison"
        @mousemove="handleCompareMouseMove"
        @mouseleave="handleCompareMouseLeave"
      >
        <svg
          v-if="!isAddingToComparison"
          xmlns="http://www.w3.org/2000/svg"
          :class="[
            `h-5 w-5 transition-transform ${transitionClasses.normal}`,
            isCompareAnimating && 'animate-icon-pop',
          ]"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path
            fill-rule="evenodd"
            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 animate-check-pop"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <!-- Inline feedback label -->
      <Transition
        :enter-active-class="transitionEnterNormal"
        enter-from-class="opacity-0 -translate-x-2"
        enter-to-class="opacity-100 translate-x-0"
        :leave-active-class="transitionLeaveFast"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 -translate-x-2"
      >
        <span
          v-if="showCompareFeedback"
          class="ml-1 text-xs font-medium text-blue-600 whitespace-nowrap"
          aria-hidden="true"
        >
          Added!
        </span>
      </Transition>
    </div>

    <!-- Slot for additional actions -->
    <slot name="extra-actions" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useResourceCardActions } from '~/composables/useResourceCardActions'
import { animationConfig } from '~/configs/animation.config'
import { easingConfig } from '~/configs/easing.config'

interface Props {
  id?: string
  title: string
  description: string
  url: string
  category?: string
  benefits: string[]
  dateAdded?: string
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
  category: 'unknown',
  dateAdded: undefined,
})

// Use the resource card actions composable
const {
  isAddingToComparison,
  isCompareAnimating,
  showCompareFeedback,
  isCopied,
  isCopyError,
  isCopyAnimating,
  copyStatus,
  showCopiedTooltip,
  copiedTooltipPosition,
  addResourceToComparison,
  copyResourceUrl,
} = useResourceCardActions({
  id: props.id,
  title: props.title,
  description: props.description,
  benefits: props.benefits,
  url: props.url,
  category: props.category,
  dateAdded: props.dateAdded,
})

// Computed style for the copied tooltip position - appears at click location
const copiedTooltipStyle = computed(() => ({
  left: `${copiedTooltipPosition.value.x}px`,
  top: `${copiedTooltipPosition.value.y - 40}px`, // Position above the click
  transform: 'translateX(-50%)',
}))

// Compute share URL
const shareUrl = computed(() => {
  if (!props.id) return props.url
  return `${window?.location?.origin || ''}/resources/${props.id}`
})

// Computed aria-labels and titles for accessibility
const copyButtonAriaLabel = computed(() => {
  if (isCopied.value) return `Copied link to ${props.title}`
  if (isCopyError.value)
    return `Failed to copy link to ${props.title}. Click to try again`
  return `Copy link to ${props.title}`
})

const copyButtonTitle = computed(() => {
  if (isCopied.value) return 'Copied!'
  if (isCopyError.value) return 'Failed to copy. Try again'
  return 'Copy link'
})

const compareButtonAriaLabel = computed(() => {
  return isAddingToComparison.value
    ? `Added ${props.title} to comparison`
    : `Add ${props.title} to comparison`
})

const compareButtonTitle = computed(() => {
  return isAddingToComparison.value
    ? 'Added to comparison'
    : 'Add to comparison'
})

// Flexy hates hardcoded values! Config-based transition classes
const transitionClasses = computed(() => ({
  fast: animationConfig.transition.fast.class,
  normal: animationConfig.transition.normal.class,
}))

// Transition class bindings for Vue Transition components
const transitionEnterNormal = computed(
  () => `transition-all ${transitionClasses.value.normal} ease-out`
)
const transitionLeaveFast = computed(
  () => `transition-all ${transitionClasses.value.fast} ease-in`
)

// ============================================================
// PALETTE'S MICRO-UX DELIGHT: Magnetic Button Effect
// ============================================================
// Buttons subtly follow the cursor with spring physics for
// delightful tactile feedback. Respects reduced motion preference.

// Check for reduced motion preference
const prefersReducedMotion = ref(false)

// BugFixer: Store references for cleanup
let mediaQueryRef: MediaQueryList | null = null
const handleMotionChange = (e: MediaQueryListEvent) => {
  prefersReducedMotion.value = e.matches
}

onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    mediaQueryRef = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQueryRef.matches

    // Listen for changes
    mediaQueryRef.addEventListener('change', handleMotionChange)
  }
})

// BugFixer: Cleanup event listener to prevent memory leak
onUnmounted(() => {
  if (mediaQueryRef) {
    mediaQueryRef.removeEventListener('change', handleMotionChange)
    mediaQueryRef = null
  }
})

// Magnetic button state for Copy button
const copyButtonRef = ref<HTMLButtonElement | null>(null)
const isCopyMagnetic = ref(false)
const copyMagneticX = ref(0)
const copyMagneticY = ref(0)

// Magnetic button state for Compare button
const compareButtonRef = ref<HTMLButtonElement | null>(null)
const isCompareMagnetic = ref(false)
const compareMagneticX = ref(0)
const compareMagneticY = ref(0)

// Magnetic effect configuration - Flexy hates hardcoded values!
// Now using configurable values from animationConfig
const magneticConfig = animationConfig.magneticButton
const MAGNETIC_STRENGTH = magneticConfig.strength // How much the button follows the cursor (0-1)
const MAGNETIC_RADIUS = magneticConfig.radiusPx // Radius in pixels where effect activates
const SPRING_STIFFNESS = magneticConfig.springStiffness // Spring physics stiffness

// Copy button magnetic handlers
const handleCopyMouseMove = (event: MouseEvent) => {
  if (!copyButtonRef.value || prefersReducedMotion.value) return

  const rect = copyButtonRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  // Calculate distance from cursor to button center
  const deltaX = event.clientX - centerX
  const deltaY = event.clientY - centerY
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

  // Only apply magnetic effect when cursor is within radius
  if (distance < MAGNETIC_RADIUS) {
    isCopyMagnetic.value = true
    // Calculate magnetic pull (stronger when closer to center)
    const pull = (1 - distance / MAGNETIC_RADIUS) * MAGNETIC_STRENGTH
    copyMagneticX.value = deltaX * pull * SPRING_STIFFNESS
    copyMagneticY.value = deltaY * pull * SPRING_STIFFNESS
  } else {
    handleCopyMouseLeave()
  }
}

const handleCopyMouseLeave = () => {
  isCopyMagnetic.value = false
  copyMagneticX.value = 0
  copyMagneticY.value = 0
}

// Compare button magnetic handlers
const handleCompareMouseMove = (event: MouseEvent) => {
  if (!compareButtonRef.value || prefersReducedMotion.value) return

  const rect = compareButtonRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  const deltaX = event.clientX - centerX
  const deltaY = event.clientY - centerY
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

  if (distance < MAGNETIC_RADIUS) {
    isCompareMagnetic.value = true
    const pull = (1 - distance / MAGNETIC_RADIUS) * MAGNETIC_STRENGTH
    compareMagneticX.value = deltaX * pull * SPRING_STIFFNESS
    compareMagneticY.value = deltaY * pull * SPRING_STIFFNESS
  } else {
    handleCompareMouseLeave()
  }
}

const handleCompareMouseLeave = () => {
  isCompareMagnetic.value = false
  compareMagneticX.value = 0
  compareMagneticY.value = 0
}

// Computed styles for magnetic transform
const copyButtonStyle = computed(() => ({
  transform: isCopyMagnetic.value
    ? `translate(${copyMagneticX.value}px, ${copyMagneticY.value}px)`
    : 'translate(0, 0)',
}))

const compareButtonStyle = computed(() => ({
  transform: isCompareMagnetic.value
    ? `translate(${compareMagneticX.value}px, ${compareMagneticY.value}px)`
    : 'translate(0, 0)',
}))
</script>

<style scoped>
/* Icon pop animation when clicking button - Flexy hates hardcoded values! */
.animate-icon-pop {
  animation: icon-pop
    v-bind('animationConfig?.cssAnimations?.standardDurationSec ?? "0.3s"')
    v-bind(
      'easingConfig?.cubicBezier?.spring ?? "cubic-bezier(0.175, 0.885, 0.32, 1.275)"'
    );
}

@keyframes icon-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Checkmark pop animation when action completes - Flexy hates hardcoded values! */
.animate-check-pop {
  animation: check-pop
    v-bind('animationConfig?.cssAnimations?.mediumDurationSec ?? "0.4s"')
    v-bind(
      'easingConfig?.cubicBezier?.spring ?? "cubic-bezier(0.175, 0.885, 0.32, 1.275)"'
    );
}

@keyframes check-pop {
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Shake animation for error states - Flexy hates hardcoded values! */
.animate-shake {
  animation: shake
    v-bind('animationConfig?.validation?.shakeDurationSec ?? "0.5s"')
    v-bind('easingConfig?.animations?.formShake?.easing ?? "ease-in-out"') both;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-icon-pop,
  .animate-check-pop,
  .animate-shake {
    animation: none;
  }
}

/* Copied tooltip styles - Palette's micro-UX enhancement */
.copied-tooltip {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(0, 0, 0, 0.05);
}

/* Reduced motion support for copied tooltip */
@media (prefers-reduced-motion: reduce) {
  .copied-tooltip {
    transition: opacity
      v-bind('animationConfig?.cssTransitions?.ultraFastSec ?? "0.15s"')
      ease-out !important;
    transform: translateX(-50%) !important;
  }
}

/* ============================================================
   PALETTE'S MICRO-UX DELIGHT: Magnetic Button Styles
   ============================================================ */

/* Magnetic button base styles with smooth spring transition */
.magnetic-button {
  transition:
    transform v-bind('animationConfig?.cssTransitions?.fastSec ?? "0.15s"')
      v-bind(
        'easingConfig?.cubicBezier?.spring ?? "cubic-bezier(0.175, 0.885, 0.32, 1.275)"'
      ),
    background-color
      v-bind('animationConfig?.cssTransitions?.fastSec ?? "0.15s"') ease-out,
    color v-bind('animationConfig?.cssTransitions?.fastSec ?? "0.15s"') ease-out,
    box-shadow v-bind('animationConfig?.cssTransitions?.fastSec ?? "0.15s"')
      ease-out;
  will-change: transform;
}

/* Active magnetic state - subtle glow effect */
.magnetic-button.is-magnetic {
  box-shadow:
    0 4px 12px rgba(59, 130, 246, 0.15),
    0 2px 4px rgba(59, 130, 246, 0.1);
}

/* Dark mode support for magnetic glow */
@media (prefers-color-scheme: dark) {
  .magnetic-button.is-magnetic {
    box-shadow:
      0 4px 12px rgba(96, 165, 250, 0.2),
      0 2px 4px rgba(96, 165, 250, 0.15);
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .magnetic-button.is-magnetic {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
}

/* Reduced motion support - disable magnetic effect */
@media (prefers-reduced-motion: reduce) {
  .magnetic-button {
    transition:
      background-color
        v-bind('animationConfig?.cssTransitions?.fastSec ?? "0.15s"') ease-out,
      color v-bind('animationConfig?.cssTransitions?.fastSec ?? "0.15s"')
        ease-out;
    transform: none !important;
    will-change: auto;
  }

  .magnetic-button.is-magnetic {
    box-shadow: none;
  }
}

/* Ensure magnetic buttons don't interfere with touch scrolling on mobile */
@media (hover: none) and (pointer: coarse) {
  .magnetic-button {
    transform: none !important;
    will-change: auto;
  }
}
</style>
