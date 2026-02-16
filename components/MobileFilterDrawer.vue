<template>
  <div class="lg:hidden">
    <!-- Mobile Filter Button with Active Count Badge - Palette's micro-UX enhancement! -->
    <button
      ref="filterButtonRef"
      type="button"
      class="mobile-filter-button inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      :class="{
        'has-filters': activeFiltersCount > 0,
        'animate-bounce-gentle': shouldBounceButton && !prefersReducedMotion,
      }"
      :aria-label="`Open filters panel. ${activeFiltersCount} filters currently active`"
      :aria-expanded="isOpen"
      aria-controls="mobile-filter-drawer"
      @click="openDrawer"
    >
      <svg
        class="w-5 h-5 text-gray-500 mobile-filter-icon"
        :class="{ 'has-active-filters': activeFiltersCount > 0 }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        />
      </svg>
      <span>Filters</span>
      <span
        v-if="activeFiltersCount > 0"
        class="filter-count-badge inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold bg-gray-800 text-white rounded-full min-w-[1.25rem]"
        :class="{
          'animate-pulse-gentle':
            !prefersReducedMotion && hasFilterCountChanged,
        }"
        aria-hidden="true"
      >
        {{ activeFiltersCount }}
      </span>
    </button>

    <!-- Mobile Filter Drawer Overlay with Edge Glow Effect -->
    <Transition
      enter-active-class="transition-opacity ease-linear"
      :enter-active-class-duration="animationConfig.cssTransitions.normalSec"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity ease-linear"
      :leave-active-class-duration="animationConfig.cssTransitions.fastSec"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden mobile-drawer-overlay"
        :class="{ 'swipe-glow': isSwiping && !prefersReducedMotion }"
        aria-hidden="true"
        @click="closeDrawer"
      />
    </Transition>

    <!-- Mobile Filter Drawer Panel with Swipe Support -->
    <Transition
      enter-active-class="transform transition"
      :enter-active-class-duration="drawerTransitionDuration"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transform transition"
      :leave-active-class-duration="drawerTransitionDuration"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
      @after-enter="onDrawerEnter"
    >
      <aside
        v-if="isOpen"
        id="mobile-filter-drawer"
        ref="drawerRef"
        class="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl z-50 lg:hidden flex flex-col mobile-drawer"
        :class="{
          'is-swiping': isSwiping,
          'respects-reduced-motion': prefersReducedMotion,
        }"
        :style="drawerStyle"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-filter-title"
        tabindex="-1"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @touchcancel="handleTouchEnd"
      >
        <!-- Magnetic Handle - Palette's micro-UX delight! -->
        <div
          ref="handleRef"
          class="drawer-handle"
          :class="{
            'is-magnetic': isHandleHovered && !prefersReducedMotion,
            'is-swiping': isSwiping && !prefersReducedMotion,
          }"
          aria-hidden="true"
          @mouseenter="isHandleHovered = true"
          @mouseleave="isHandleHovered = false"
        >
          <div
            class="drawer-handle-bar"
            :style="handleStyle"
          />
          <div
            v-if="!prefersReducedMotion && swipeProgress > 0"
            class="drawer-handle-glow"
            :style="{ opacity: swipeProgress * 0.5 }"
          />
        </div>

        <!-- Drawer Header -->
        <div
          class="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-white drawer-header"
        >
          <h2
            id="mobile-filter-title"
            class="text-lg font-semibold text-gray-900"
          >
            Filters
            <span
              v-if="activeFiltersCount > 0"
              class="ml-2 text-sm font-normal text-gray-500"
            >
              ({{ activeFiltersCount }} active)
            </span>
          </h2>
          <button
            ref="closeButtonRef"
            type="button"
            class="close-button p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500"
            :class="{ 'is-pressed': isCloseButtonPressed }"
            aria-label="Close filters panel"
            @click="closeDrawer"
            @mousedown="isCloseButtonPressed = true"
            @mouseup="isCloseButtonPressed = false"
            @touchstart="isCloseButtonPressed = true"
            @touchend="isCloseButtonPressed = false"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Drawer Content - Scrollable -->
        <div class="flex-1 overflow-y-auto px-4 py-4 drawer-content">
          <ResourceFilters
            :categories="categories"
            :pricing-models="pricingModels"
            :difficulty-levels="difficultyLevels"
            :technologies="technologies"
            :tags="tags"
            :benefits="benefits"
            :selected-categories="selectedCategories"
            :selected-pricing-models="selectedPricingModels"
            :selected-difficulty-levels="selectedDifficultyLevels"
            :selected-technologies="selectedTechnologies"
            :selected-tags="selectedTags"
            :selected-benefits="selectedBenefits"
            :selected-date-range="selectedDateRange"
            :facet-counts="facetCounts"
            :saved-searches="savedSearches"
            @toggle-category="$emit('toggle-category', $event)"
            @toggle-pricing-model="$emit('toggle-pricing-model', $event)"
            @toggle-difficulty-level="$emit('toggle-difficulty-level', $event)"
            @toggle-technology="$emit('toggle-technology', $event)"
            @toggle-tag="$emit('toggle-tag', $event)"
            @toggle-benefit="$emit('toggle-benefit', $event)"
            @date-range-change="$emit('date-range-change', $event)"
            @reset-filters="handleResetFilters"
            @use-saved-search="$emit('use-saved-search', $event)"
            @remove-saved-search="$emit('remove-saved-search', $event)"
            @undo-delete="$emit('undo-delete', $event)"
          />
        </div>

        <!-- Drawer Footer - Sticky Apply/Results Button -->
        <div
          class="border-t border-gray-200 px-4 py-4 bg-gray-50 drawer-footer"
        >
          <button
            type="button"
            class="show-results-button w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            :class="{
              'has-results': resultsCount > 0,
              'is-pressed': isResultsButtonPressed,
            }"
            @click="closeDrawer"
            @mousedown="isResultsButtonPressed = true"
            @mouseup="isResultsButtonPressed = false"
            @touchstart="isResultsButtonPressed = true"
            @touchend="isResultsButtonPressed = false"
          >
            <span class="button-text">Show {{ resultsCount }} result{{
              resultsCount === 1 ? '' : 's'
            }}</span>
            <svg
              v-if="resultsCount > 0"
              class="ml-2 w-4 h-4 arrow-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import ResourceFilters from '~/components/ResourceFilters.vue'
import { triggerHaptic } from '~/utils/hapticFeedback'
import { animationConfig } from '~/configs/animation.config'
import { EASING, easingConfig } from '~/configs/easing.config'

interface FacetCounts {
  [key: string]: number
}

interface SavedSearch {
  name: string
  query: string
  createdAt: Date
}

interface Props {
  categories: readonly string[]
  pricingModels: readonly string[]
  difficultyLevels: readonly string[]
  technologies: readonly string[]
  tags: readonly string[]
  benefits?: readonly string[]
  selectedCategories: readonly string[]
  selectedPricingModels: readonly string[]
  selectedDifficultyLevels: readonly string[]
  selectedTechnologies: readonly string[]
  selectedTags: readonly string[]
  selectedBenefits?: readonly string[]
  selectedDateRange?: string
  resultsCount: number
  facetCounts?: FacetCounts
  savedSearches?: SavedSearch[]
}

const props = withDefaults(defineProps<Props>(), {
  benefits: () => [],
  selectedBenefits: () => [],
  selectedDateRange: 'anytime',
  facetCounts: () => ({}),
  savedSearches: () => [],
})

const emit = defineEmits<{
  (event: 'toggle-category', category: string): void
  (event: 'toggle-pricing-model', pricingModel: string): void
  (event: 'toggle-difficulty-level', difficulty: string): void
  (event: 'toggle-technology', technology: string): void
  (event: 'toggle-tag', tag: string): void
  (event: 'toggle-benefit', benefit: string): void
  (event: 'date-range-change', dateRange: string): void
  (event: 'reset-filters'): void
  (event: 'use-saved-search', search: SavedSearch): void
  (event: 'remove-saved-search', query: string): void
  (event: 'undo-delete', search: SavedSearch): void
}>()

// Core refs
const isOpen = ref(false)
const drawerRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLButtonElement | null>(null)
const filterButtonRef = ref<HTMLButtonElement | null>(null)
const handleRef = ref<HTMLElement | null>(null)
let previouslyFocusedElement: HTMLElement | null = null

// Palette's micro-UX enhancement: Animation and interaction states
const prefersReducedMotion = ref(false)
const isHandleHovered = ref(false)
const isCloseButtonPressed = ref(false)
const isResultsButtonPressed = ref(false)
const shouldBounceButton = ref(false)
const hasFilterCountChanged = ref(false)
const previousFilterCount = ref(0)

// Swipe gesture state - Palette's micro-UX delight!
const isSwiping = ref(false)
const swipeStartX = ref(0)
const swipeCurrentX = ref(0)
const swipeVelocity = ref(0)

// Computed swipe progress (derived from swipe position)
const swipeProgress = computed(() => {
  if (!isSwiping.value) return 0
  const translateX = Math.max(0, swipeCurrentX.value - swipeStartX.value)
  return Math.min(translateX / window.innerWidth, 1)
})
let swipeStartTime = 0
let lastSwipeX = 0
let lastSwipeTime = 0
let rafId: number | null = null

// Drawer style for swipe transform
const drawerStyle = computed(() => {
  if (!isSwiping.value || prefersReducedMotion.value) return {}

  const translateX = Math.max(0, swipeCurrentX.value - swipeStartX.value)

  // Apply spring-like resistance - Flexy hates hardcoded 0.8! Using config instead
  const resistance = animationConfig.mobileFilterDrawer.swipeResistance
  const effectiveTranslate = translateX * resistance

  return {
    transform: `translateX(${effectiveTranslate}px)`,
    transition: 'none',
  }
})

// Magnetic handle style
const handleStyle = computed(() => {
  if (!isHandleHovered.value || prefersReducedMotion.value || isSwiping.value) {
    return {}
  }

  const config = animationConfig.mobileFilterDrawer
  const strength = config.magneticStrength
  const maxDisplacement = config.magneticMaxDisplacementPx

  // Calculate magnetic pull based on hover position
  const pullX = maxDisplacement * strength

  return {
    transform: `translateX(${pullX}px)`,
    transition: `transform ${config.springReturnDurationMs}ms ${config.springEasing}`,
  }
})

// Transition duration based on state
const drawerTransitionDuration = computed(() => {
  if (prefersReducedMotion.value) {
    return animationConfig.cssTransitions.fastSec
  }
  return isSwiping.value ? '0ms' : animationConfig.cssTransitions.normalSec
})

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

// Active filters count
const activeFiltersCount = computed(() => {
  let count = 0
  count += props.selectedCategories.length
  count += props.selectedPricingModels.length
  count += props.selectedDifficultyLevels.length
  count += props.selectedTechnologies.length
  count += props.selectedTags.length
  count += props.selectedBenefits?.length || 0
  if (props.selectedDateRange && props.selectedDateRange !== 'anytime') {
    count += 1
  }
  return count
})

// Watch for filter count changes to trigger button bounce
watch(activeFiltersCount, (newCount, oldCount) => {
  if (newCount !== oldCount && !prefersReducedMotion.value) {
    hasFilterCountChanged.value = true

    // Trigger bounce animation
    shouldBounceButton.value = true
    setTimeout(() => {
      shouldBounceButton.value = false
    }, animationConfig.mobileFilterDrawer.filterButtonPulseMs)

    // Reset pulse animation - Flexy hates hardcoded values!
    setTimeout(() => {
      hasFilterCountChanged.value = false
    }, animationConfig.mobileFilterDrawer.filterCountResetDelayMs)

    // Haptic feedback - BroCula fix: Using haptic type instead of custom pattern
    triggerHaptic('light')
  }
  previousFilterCount.value = newCount
})

// BroCula fix: Using triggerHaptic from utils which checks user interaction first

// Open drawer with haptic feedback
const openDrawer = () => {
  previouslyFocusedElement = document.activeElement as HTMLElement
  isOpen.value = true
  document.body.style.overflow = 'hidden'

  // Enhanced haptic feedback on open - BroCula fix: Using haptic type instead of custom pattern
  triggerHaptic('medium')

  nextTick(() => {
    closeButtonRef.value?.focus()
  })
}

// Close drawer with haptic feedback
const closeDrawer = () => {
  isOpen.value = false
  document.body.style.overflow = ''

  // Haptic feedback on close - BroCula fix: Using haptic type instead of custom pattern
  triggerHaptic('light')

  // Reset swipe state
  resetSwipeState()

  nextTick(() => {
    previouslyFocusedElement?.focus()
  })
}

// Reset swipe state
const resetSwipeState = () => {
  isSwiping.value = false
  swipeStartX.value = 0
  swipeCurrentX.value = 0
  swipeVelocity.value = 0

  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

// Handle touch start for swipe
const handleTouchStart = (event: TouchEvent) => {
  if (prefersReducedMotion.value) return

  const touch = event.touches[0]
  swipeStartX.value = touch.clientX
  lastSwipeX = touch.clientX
  swipeStartTime = Date.now()
  lastSwipeTime = swipeStartTime
  isSwiping.value = true
  swipeVelocity.value = 0
}

// Handle touch move for swipe
const handleTouchMove = (event: TouchEvent) => {
  if (!isSwiping.value || prefersReducedMotion.value) return

  const touch = event.touches[0]
  const currentX = touch.clientX
  const currentTime = Date.now()

  // Only allow swiping to the right (to dismiss)
  if (currentX < swipeStartX.value) {
    swipeCurrentX.value = swipeStartX.value
    return
  }

  swipeCurrentX.value = currentX

  // Calculate velocity
  const deltaX = currentX - lastSwipeX
  const deltaTime = currentTime - lastSwipeTime
  if (deltaTime > 0) {
    swipeVelocity.value = deltaX / deltaTime
  }

  lastSwipeX = currentX
  lastSwipeTime = currentTime

  // Prevent default scrolling when swiping
  if (swipeCurrentX.value > swipeStartX.value + 10) {
    // Don't prevent default - let the drawer move naturally
  }
}

// Handle touch end for swipe
const handleTouchEnd = () => {
  if (!isSwiping.value) return

  const config = animationConfig.mobileFilterDrawer
  const translateX = swipeCurrentX.value - swipeStartX.value
  const threshold = config.swipeThresholdPx
  const velocityThreshold = config.velocityThresholdPxMs

  // Determine if we should close based on distance or velocity
  const shouldClose =
    translateX > threshold || swipeVelocity.value > velocityThreshold

  if (shouldClose) {
    // Animate the drawer closed
    const animationDuration = config.springReturnDurationMs
    const startTranslate = translateX
    const startTime = Date.now()

    const animateClose = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / animationDuration, 1)

      // Ease out - Flexy hates hardcoded 3!
      const easeOut =
        1 - Math.pow(1 - progress, easingConfig.powers.easeOutCubic)
      const currentTranslate =
        startTranslate + (window.innerWidth - startTranslate) * easeOut

      if (drawerRef.value) {
        drawerRef.value.style.transform = `translateX(${currentTranslate}px)`
      }

      if (progress < 1) {
        rafId = requestAnimationFrame(animateClose)
      } else {
        closeDrawer()
      }
    }

    rafId = requestAnimationFrame(animateClose)
  } else {
    // Spring back to open position
    const animationDuration = config.springReturnDurationMs
    const startTranslate = translateX
    const startTime = Date.now()

    const animateSpring = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / animationDuration, 1)

      // Spring easing - Flexy hates hardcoded 2, 10, 0.1, 5!
      const springProgress =
        1 -
        Math.pow(
          easingConfig.powers.easeOutExpoBase,
          -easingConfig.powers.easeOutExpoMultiplier * progress
        ) *
          Math.cos(
            (progress - easingConfig.powers.springPhaseOffset) *
              easingConfig.powers.springFrequency *
              Math.PI
          )
      const currentTranslate = startTranslate * (1 - springProgress)

      if (drawerRef.value) {
        drawerRef.value.style.transform = `translateX(${currentTranslate}px)`
      }

      if (progress < 1) {
        rafId = requestAnimationFrame(animateSpring)
      } else {
        resetSwipeState()
      }
    }

    rafId = requestAnimationFrame(animateSpring)
  }
}

// Handle reset filters
const handleResetFilters = () => {
  emit('reset-filters')
}

// Handle escape key
const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeDrawer()
  }
}

// Handle focus trap
const handleFocusTrap = (event: KeyboardEvent) => {
  if (!isOpen.value || event.key !== 'Tab') return

  const focusableElements = drawerRef.value?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  if (!focusableElements || focusableElements.length === 0) return

  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[
    focusableElements.length - 1
  ] as HTMLElement

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

// Drawer enter callback
const onDrawerEnter = () => {
  // Animation completed
}

// Media query refs for cleanup
let mediaQueryRef: MediaQueryList | null = null
let handleMotionChangeRef: ((e: MediaQueryListEvent) => void) | null = null

// Lifecycle
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined') {
    mediaQueryRef = window.matchMedia('(prefers-reduced-motion: reduce)')
    handleMotionChangeRef = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQueryRef.addEventListener('change', handleMotionChangeRef)
  }

  document.addEventListener('keydown', handleEscapeKey)
  document.addEventListener('keydown', handleFocusTrap)
})

onUnmounted(() => {
  // Cleanup media query listener
  if (mediaQueryRef && handleMotionChangeRef) {
    mediaQueryRef.removeEventListener('change', handleMotionChangeRef)
    mediaQueryRef = null
    handleMotionChangeRef = null
  }

  document.removeEventListener('keydown', handleEscapeKey)
  document.removeEventListener('keydown', handleFocusTrap)
  document.body.style.overflow = ''

  // Cancel any pending animation frames
  if (rafId) {
    cancelAnimationFrame(rafId)
  }
})
</script>

<style scoped>
/* Mobile Filter Button Styles - Palette's micro-UX enhancement! */
.mobile-filter-button {
  position: relative;
  transition: all v-bind('animationConfig.cssTransitions.standardSec')
    v-bind('EASING.SPRING_STANDARD');
}

.mobile-filter-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mobile-filter-button:active {
  transform: translateY(0) scale(0.98);
}

.mobile-filter-button.has-filters {
  border-color: #374151;
}

/* Filter icon animation */
.mobile-filter-icon {
  transition: transform v-bind('animationConfig.cssTransitions.fastSec')
    ease-out;
}

.mobile-filter-button:hover .mobile-filter-icon {
  transform: rotate(15deg);
}

.mobile-filter-icon.has-active-filters {
  color: #1f2937;
}

/* Filter count badge */
.filter-count-badge {
  transition: all v-bind('animationConfig.cssTransitions.fastSec') ease-out;
}

/* Gentle bounce animation for button */
@keyframes bounce-gentle {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  25% {
    transform: translateY(-4px)
      scale(
        v-bind('animationConfig.mobileFilterDrawer.filterButtonBounceScale')
      );
  }
  50% {
    transform: translateY(0) scale(0.98);
  }
  75% {
    transform: translateY(-2px) scale(1.02);
  }
}

.animate-bounce-gentle {
  animation: bounce-gentle
    v-bind('animationConfig.mobileFilterDrawer.filterButtonPulseMs + "ms"')
    ease-out;
}

/* Gentle pulse for badge */
@keyframes pulse-gentle {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}

.animate-pulse-gentle {
  animation: pulse-gentle 300ms ease-out 2;
}

/* Drawer overlay with edge glow */
.mobile-drawer-overlay {
  transition: opacity v-bind('animationConfig.cssTransitions.normalSec') ease;
}

.mobile-drawer-overlay.swipe-glow {
  background: radial-gradient(
    circle at 100% 50%,
    rgba(59, 130, 246, 0.1) 0%,
    rgba(0, 0, 0, 0.5) 50%
  );
}

/* Drawer container */
.mobile-drawer {
  will-change: transform;
  touch-action: pan-y;
}

.mobile-drawer.is-swiping {
  transition: none;
}

.mobile-drawer.respects-reduced-motion {
  transition: transform v-bind('animationConfig.cssTransitions.fastSec')
    ease-out !important;
}

/* Magnetic Handle - Palette's micro-UX delight! */
.drawer-handle {
  position: relative;
  padding: 12px 0;
  display: flex;
  justify-content: center;
  cursor: grab;
  touch-action: none;
}

.drawer-handle:active {
  cursor: grabbing;
}

.drawer-handle-bar {
  width: 40px;
  height: 4px;
  background: #d1d5db;
  border-radius: 2px;
  transition: all
    v-bind('animationConfig.mobileFilterDrawer.springReturnDurationMs + "ms"')
    v-bind('animationConfig.mobileFilterDrawer.springEasing');
}

.drawer-handle.is-magnetic .drawer-handle-bar {
  width: 48px;
  background: #9ca3af;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.drawer-handle.is-swiping .drawer-handle-bar {
  width: 56px;
  background: #6b7280;
}

/* Handle glow during swipe */
.drawer-handle-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 20px;
  background: radial-gradient(
    ellipse at center,
    rgba(59, 130, 246, 0.3) 0%,
    transparent 70%
  );
  border-radius: 50%;
  pointer-events: none;
  transition: opacity v-bind('animationConfig.cssTransitions.fastSec') ease;
}

/* Drawer header */
.drawer-header {
  position: relative;
}

/* Close button with press effect */
.close-button {
  transition: all v-bind('animationConfig.cssTransitions.fastSec') ease-out;
}

.close-button:hover {
  background: #f3f4f6;
  transform: rotate(90deg);
}

.close-button.is-pressed {
  transform: scale(0.9);
}

/* Drawer content */
.drawer-content {
  scroll-behavior: smooth;
}

/* Show results button */
.show-results-button {
  position: relative;
  overflow: hidden;
  transition: all v-bind('animationConfig.cssTransitions.standardSec')
    v-bind('EASING.SPRING_STANDARD');
}

.show-results-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(31, 41, 55, 0.3);
}

.show-results-button.is-pressed {
  transform: scale(0.98);
}

.show-results-button.has-results .arrow-icon {
  transition: transform v-bind('animationConfig.cssTransitions.fastSec')
    ease-out;
}

.show-results-button:hover.has-results .arrow-icon {
  transform: translateX(4px);
}

/* Button text */
.button-text {
  position: relative;
  z-index: 1;
}

/* Prevent body scroll when drawer is open */
:global(body.drawer-open) {
  overflow: hidden;
}

/* Reduced motion support - Palette cares about accessibility! */
@media (prefers-reduced-motion: reduce) {
  .mobile-filter-button,
  .mobile-filter-icon,
  .filter-count-badge,
  .drawer-handle,
  .drawer-handle-bar,
  .close-button,
  .show-results-button,
  .arrow-icon {
    transition: none !important;
    animation: none !important;
  }

  .mobile-drawer {
    transition: transform v-bind('animationConfig.cssTransitions.fastSec')
      ease-out !important;
  }

  .animate-bounce-gentle,
  .animate-pulse-gentle {
    animation: none !important;
  }
}
</style>
