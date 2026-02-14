<template>
  <div class="space-y-6">
    <!-- Comparison Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Resource Comparison
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Compare up to {{ maxResources }} resources side-by-side
        </p>
      </div>

      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ comparisonCount }} of {{ maxResources }} selected
        </span>
        <!-- Enhanced Progress Indicator - Palette's micro-UX delight! -->
        <div
          class="flex items-center gap-1"
          :class="{ 'celebration-mode': isMaxReached && !prefersReducedMotion }"
        >
          <div
            v-for="n in maxResources"
            :key="n"
            class="progress-dot"
            :class="[
              n <= comparisonCount
                ? 'progress-dot--filled'
                : 'progress-dot--empty',
              {
                'progress-dot--latest':
                  n === comparisonCount &&
                  !prefersReducedMotion &&
                  showLatestAnimation,
              },
            ]"
            :style="getDotStyle(n)"
          />
        </div>
      </div>
    </div>

    <!-- Max Reached Celebration - Palette's micro-UX delight! -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 scale-90 -translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="showMaxCelebration && !prefersReducedMotion"
        class="max-celebration"
        role="status"
        aria-live="polite"
      >
        <div class="celebration-content">
          <span class="celebration-icon">🎉</span>
          <span class="celebration-text">Maximum comparison reached!</span>
          <ConfettiCelebration
            :trigger="showMaxCelebration"
            intensity="light"
            :duration="animationConfig.confetti.lightDurationMs"
          />
        </div>
      </div>
    </Transition>

    <!-- Comparison Controls -->
    <div class="flex flex-wrap gap-3">
      <!-- Clear All Button -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 scale-90"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-90"
      >
        <button
          v-if="comparisonCount > 0"
          ref="clearButtonRef"
          class="comparison-control-btn comparison-control-btn--secondary"
          :class="{ 'is-pressed': pressedButton === 'clear' }"
          @click="handleClearClick"
          @mousedown="setPressed('clear')"
          @mouseup="clearPressed"
          @mouseleave="clearPressed"
          @touchstart="setPressed('clear')"
          @touchend="clearPressed"
        >
          <svg
            class="w-4 h-4 mr-1.5 transition-transform duration-200"
            :class="{ 'rotate-90': pressedButton === 'clear' }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Clear All
        </button>
      </Transition>

      <!-- Share Button -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 scale-90"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-90"
      >
        <button
          v-if="comparisonCount > 1"
          ref="shareButtonRef"
          class="comparison-control-btn comparison-control-btn--primary"
          :class="{ 'is-pressed': pressedButton === 'share' }"
          @click="handleShareClick"
          @mousedown="setPressed('share')"
          @mouseup="clearPressed"
          @mouseleave="clearPressed"
          @touchstart="setPressed('share')"
          @touchend="clearPressed"
        >
          <svg
            class="w-4 h-4 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
            />
          </svg>
          Share Comparison
        </button>
      </Transition>
    </div>

    <!-- Selected Resources with Stagger Animation -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="selectedResources.length > 0"
        class="selected-resources-container"
      >
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">
          Selected Resources
        </h3>
        <TransitionGroup
          name="resource-tag"
          tag="div"
          class="flex flex-wrap gap-2"
          :class="{ 'reduced-motion': prefersReducedMotion }"
        >
          <div
            v-for="(resource, index) in selectedResources"
            :key="resource.id"
            class="resource-tag"
            :class="[
              'flex items-center px-3 py-2 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-200 dark:border-gray-600',
              { 'resource-tag--removing': removingId === resource.id },
            ]"
            :style="getTagStyle(index)"
          >
            <span
              class="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs"
            >
              {{ resource.title }}
            </span>
            <button
              class="resource-tag__remove"
              :class="{ 'is-hovered': hoveredRemove === resource.id }"
              :aria-label="`Remove ${resource.title} from comparison`"
              type="button"
              @click="handleRemoveResource(resource.id)"
              @mouseenter="hoveredRemove = resource.id"
              @mouseleave="hoveredRemove = null"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </TransitionGroup>
      </div>
    </Transition>

    <!-- Comparison Table -->
    <LazyComparisonTable
      v-if="selectedResources.length >= 2"
      :resources="selectedResources"
      :criteria="defaultCriteria"
      @remove-resource="removeResource"
    />

    <!-- Enhanced Empty State - Palette's micro-UX delight! -->
    <div
      v-else
      class="empty-state">
      <div class="empty-state__illustration">
        <!-- Animated Background Circle -->
        <div
          class="empty-state__bg-circle"
          :class="{ 'animate-pulse-slow': !prefersReducedMotion }"
        />

        <!-- Comparison Icon -->
        <div
          class="empty-state__icon-wrapper"
          :class="{ 'animate-float': !prefersReducedMotion }"
        >
          <svg
            class="empty-state__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              class="empty-state__icon-path"
              :class="{ 'animate-draw': !prefersReducedMotion }"
            />
          </svg>
        </div>

        <!-- Floating Elements -->
        <div
          v-if="!prefersReducedMotion"
          class="empty-state__float-dot empty-state__float-dot--1"
        />
        <div
          v-if="!prefersReducedMotion"
          class="empty-state__float-dot empty-state__float-dot--2"
        />
        <div
          v-if="!prefersReducedMotion"
          class="empty-state__float-dot empty-state__float-dot--3"
        />
      </div>

      <h3 class="empty-state__title">No resources selected</h3>
      <p class="empty-state__description">
        Add resources to compare them side-by-side and see detailed differences.
      </p>
      <div class="mt-6">
        <button
          ref="browseButtonRef"
          class="comparison-control-btn comparison-control-btn--primary comparison-control-btn--large"
          :class="{ 'is-pressed': pressedButton === 'browse' }"
          @click="handleBrowseClick"
          @mousedown="setPressed('browse')"
          @mouseup="clearPressed"
          @mouseleave="clearPressed"
          @touchstart="setPressed('browse')"
          @touchend="clearPressed"
        >
          <svg
            class="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Browse Resources
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Resource } from '~/types/resource'
import type { ComparisonCriteria } from '~/types/comparison'
import { limitsConfig } from '~/configs/limits.config'
import { comparisonConfig } from '~/configs/comparison.config'
import { animationConfig } from '~/configs/animation.config'
import { hapticLight, hapticSuccess } from '~/utils/hapticFeedback'
import { useReducedMotion } from '~/composables/useReducedMotion'

// Components
import ConfettiCelebration from './ConfettiCelebration.vue'

interface Props {
  selectedResources: Resource[]
  maxResources?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxResources: limitsConfig.comparison.maxResources,
})

const emit = defineEmits([
  'remove-resource',
  'clear-comparison',
  'share-comparison',
  'browse-resources',
])

// State
const pressedButton = ref<string | null>(null)
const hoveredRemove = ref<string | null>(null)
const removingId = ref<string | null>(null)
const showMaxCelebration = ref(false)
const showLatestAnimation = ref(false)

// Use composables
const { prefersReducedMotion } = useReducedMotion()

// Default comparison criteria
const defaultCriteria: ComparisonCriteria[] = [
  {
    id: 'title',
    name: 'Name',
    type: 'text',
    category: 'basic',
    weight: comparisonConfig.weights.title,
  },
  {
    id: 'description',
    name: 'Description',
    type: 'text',
    category: 'basic',
    weight: comparisonConfig.weights.description,
  },
  {
    id: 'pricingModel',
    name: 'Pricing',
    type: 'text',
    category: 'business',
    weight: comparisonConfig.weights.pricingModel,
  },
  {
    id: 'category',
    name: 'Category',
    type: 'text',
    category: 'basic',
    weight: comparisonConfig.weights.category,
  },
  {
    id: 'technology',
    name: 'Technology',
    type: 'list',
    category: 'technical',
    weight: comparisonConfig.weights.technology,
  },
  {
    id: 'popularity',
    name: 'Popularity',
    type: 'number',
    category: 'metrics',
    weight: comparisonConfig.weights.popularity,
  },
  {
    id: 'benefits',
    name: 'Benefits',
    type: 'list',
    category: 'features',
    weight: comparisonConfig.weights.benefits,
  },
  {
    id: 'limitations',
    name: 'Limitations',
    type: 'list',
    category: 'features',
    weight: comparisonConfig.weights.limitations,
  },
  {
    id: 'platforms',
    name: 'Platforms',
    type: 'list',
    category: 'technical',
    weight: comparisonConfig.weights.platforms,
  },
  {
    id: 'features',
    name: 'Features',
    type: 'list',
    category: 'features',
    weight: comparisonConfig.weights.features,
  },
]

// Computed properties
const comparisonCount = computed(() => props.selectedResources.length)
const isMaxReached = computed(() => comparisonCount.value >= props.maxResources)

// Watch for max reached to trigger celebration
watch(
  () => comparisonCount.value,
  (newCount, oldCount) => {
    if (newCount > oldCount && newCount === props.maxResources) {
      showMaxCelebration.value = true
      showLatestAnimation.value = true
      hapticSuccess()

      // Hide celebration after delay
      setTimeout(() => {
        showMaxCelebration.value = false
      }, animationConfig.confetti.lightDurationMs)

      // Reset latest animation flag
      setTimeout(() => {
        showLatestAnimation.value = false
      }, animationConfig.comparison.popDurationMs)
    }
  }
)

// Methods
const getDotStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}

  const staggerDelay = (index - 1) * animationConfig.comparison.staggerDelayMs
  return {
    animationDelay: `${staggerDelay}ms`,
  }
}

const getTagStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}

  const staggerDelay = index * animationConfig.comparison.staggerDelayMs
  return {
    animationDelay: `${staggerDelay}ms`,
  }
}

const setPressed = (button: string) => {
  pressedButton.value = button
}

const clearPressed = () => {
  pressedButton.value = null
}

const handleRemoveResource = async (resourceId: string) => {
  removingId.value = resourceId
  hapticLight()

  // Wait for exit animation
  await new Promise(resolve =>
    setTimeout(resolve, animationConfig.comparison.tagExitDurationMs)
  )

  removingId.value = null
  emit('remove-resource', resourceId)
}

const handleClearClick = () => {
  hapticLight()
  emit('clear-comparison')
}

const handleShareClick = () => {
  hapticSuccess()
  emit('share-comparison')
}

const handleBrowseClick = () => {
  hapticLight()
  emit('browse-resources')
}

const removeResource = (resourceId: string) => {
  handleRemoveResource(resourceId)
}

const clearComparison = () => {
  handleClearClick()
}

const shareComparison = () => {
  handleShareClick()
}

// Expose methods for parent components
defineExpose({
  removeResource,
  clearComparison,
  shareComparison,
})
</script>

<style scoped>
/* Progress Dots - Palette's micro-UX delight! */
.progress-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all v-bind('`${animationConfig.comparison.dotTransitionMs}ms`')
    ease-out;
}

.progress-dot--empty {
  background-color: rgb(209, 213, 219); /* gray-300 */
}

.progress-dot--filled {
  background-color: rgb(59, 130, 246); /* blue-500 */
  transform: scale(1);
}

.progress-dot--latest {
  animation: dot-pop v-bind('`${animationConfig.comparison.popDurationMs}ms`')
    cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes dot-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}

/* Celebration mode */
.celebration-mode .progress-dot--filled {
  animation: dot-glow v-bind('`${animationConfig.comparison.glowDurationMs}ms`')
    ease-in-out infinite alternate;
}

@keyframes dot-glow {
  from {
    box-shadow:
      0 0 2px rgb(59, 130, 246),
      0 0 4px rgb(59, 130, 246);
  }
  to {
    box-shadow:
      0 0 4px rgb(59, 130, 246),
      0 0 8px rgb(59, 130, 246),
      0 0 12px rgb(59, 130, 246);
  }
}

/* Max Celebration Banner */
.max-celebration {
  background: linear-gradient(135deg, rgb(219, 234, 254), rgb(191, 219, 254));
  border: 1px solid rgb(147, 197, 253);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark .max-celebration {
  background: linear-gradient(135deg, rgb(30, 58, 138), rgb(37, 99, 235));
  border-color: rgb(59, 130, 246);
}

.celebration-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.celebration-icon {
  font-size: 1.25rem;
  animation: celebration-bounce
    v-bind('`${animationConfig.comparison.celebrationBounceMs}ms`') ease-in-out
    infinite;
}

@keyframes celebration-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.celebration-text {
  font-weight: 600;
  color: rgb(29, 78, 216);
}

.dark .celebration-text {
  color: rgb(219, 234, 254);
}

/* Comparison Control Buttons */
.comparison-control-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  border-radius: 0.375rem;
  transition: all v-bind('`${animationConfig.comparison.buttonTransitionMs}ms`')
    ease-out;
  cursor: pointer;
}

.comparison-control-btn:focus {
  outline: none;
  ring: 2px;
  ring-offset: 2px;
}

.comparison-control-btn.is-pressed {
  transform: scale(0.95);
}

.comparison-control-btn--primary {
  background-color: rgb(37, 99, 235);
  color: white;
  border: 1px solid transparent;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.comparison-control-btn--primary:hover {
  background-color: rgb(29, 78, 216);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.comparison-control-btn--primary:focus {
  ring-color: rgb(37, 99, 235);
}

.comparison-control-btn--secondary {
  background-color: white;
  color: rgb(55, 65, 81);
  border: 1px solid rgb(209, 213, 219);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.dark .comparison-control-btn--secondary {
  background-color: rgb(55, 65, 81);
  color: rgb(229, 231, 235);
  border-color: rgb(75, 85, 99);
}

.comparison-control-btn--secondary:hover {
  background-color: rgb(249, 250, 251);
  border-color: rgb(156, 163, 175);
}

.dark .comparison-control-btn--secondary:hover {
  background-color: rgb(75, 85, 99);
}

.comparison-control-btn--secondary:focus {
  ring-color: rgb(156, 163, 175);
}

.comparison-control-btn--large {
  padding: 0.625rem 1rem;
  font-size: 0.9375rem;
}

/* Selected Resources Container */
.selected-resources-container {
  background-color: rgb(249, 250, 251);
  border-radius: 0.75rem;
  padding: 1rem;
}

.dark .selected-resources-container {
  background-color: rgb(31, 41, 55);
}

/* Resource Tags with Stagger Animation */
.resource-tag {
  transition: all v-bind('`${animationConfig.comparison.tagTransitionMs}ms`')
    ease-out;
}

.resource-tag:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.resource-tag--removing {
  animation: tag-exit
    v-bind('`${animationConfig.comparison.tagExitDurationMs}ms`') ease-in
    forwards;
}

@keyframes tag-exit {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.8) translateX(20px);
  }
}

/* Resource Tag Remove Button */
.resource-tag__remove {
  margin-left: 0.5rem;
  padding: 0.125rem;
  color: rgb(239, 68, 68);
  background: transparent;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all v-bind('`${animationConfig.comparison.removeTransitionMs}ms`')
    ease-out;
  opacity: 0.6;
}

.resource-tag__remove:hover,
.resource-tag__remove.is-hovered {
  opacity: 1;
  background-color: rgb(254, 226, 226);
  transform: rotate(90deg);
}

.dark .resource-tag__remove:hover,
.dark .resource-tag__remove.is-hovered {
  background-color: rgba(239, 68, 68, 0.2);
}

/* Transition Group Animations */
.resource-tag-enter-active {
  animation: tag-enter
    v-bind('`${animationConfig.comparison.tagEnterDurationMs}ms`') ease-out
    forwards;
}

.resource-tag-leave-active {
  animation: tag-exit
    v-bind('`${animationConfig.comparison.tagExitDurationMs}ms`') ease-in
    forwards;
}

@keyframes tag-enter {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Empty State - Palette's micro-UX delight! */
.empty-state {
  text-align: center;
  padding: 3rem 0;
}

.empty-state__illustration {
  position: relative;
  width: 12rem;
  height: 12rem;
  margin: 0 auto 2rem;
}

.empty-state__bg-circle {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgb(243, 244, 246), rgb(229, 231, 235));
  border-radius: 50%;
}

.dark .empty-state__bg-circle {
  background: linear-gradient(135deg, rgb(55, 65, 81), rgb(75, 85, 99));
}

@keyframes pulse-slow {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}

.empty-state__icon-wrapper {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.empty-state__icon {
  width: 4rem;
  height: 4rem;
  color: rgb(156, 163, 175);
}

.dark .empty-state__icon {
  color: rgb(156, 163, 175);
}

.empty-state__icon-path {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}

.empty-state__float-dot {
  position: absolute;
  background-color: rgb(209, 213, 219);
  border-radius: 50%;
}

.dark .empty-state__float-dot {
  background-color: rgb(75, 85, 99);
}

.empty-state__float-dot--1 {
  width: 0.75rem;
  height: 0.75rem;
  top: 1rem;
  right: 1.5rem;
  animation: float 3s ease-in-out infinite;
}

.empty-state__float-dot--2 {
  width: 0.5rem;
  height: 0.5rem;
  bottom: 2rem;
  left: 1.5rem;
  animation: float 3s ease-in-out infinite;
  animation-delay: v-bind(
    'animationConfig.comparisonEmptyState.dotFloatDelaysSec[1] + "s"'
  );
}

.empty-state__float-dot--3 {
  width: 0.375rem;
  height: 0.375rem;
  top: 3rem;
  left: 1rem;
  animation: float 3s ease-in-out infinite;
  animation-delay: v-bind(
    'animationConfig.comparisonEmptyState.dotFloatDelaysSec[2] + "s"'
  );
}

.empty-state__title {
  font-size: 1.125rem;
  font-weight: 500;
  color: rgb(17, 24, 39);
  margin-bottom: 0.5rem;
}

.dark .empty-state__title {
  color: rgb(255, 255, 255);
}

.empty-state__description {
  font-size: 0.875rem;
  color: rgb(107, 114, 128);
  max-width: 24rem;
  margin: 0 auto;
}

.dark .empty-state__description {
  color: rgb(156, 163, 175);
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .progress-dot,
  .progress-dot--latest,
  .resource-tag,
  .resource-tag__remove,
  .comparison-control-btn,
  .empty-state__bg-circle,
  .empty-state__icon-wrapper,
  .empty-state__float-dot {
    animation: none !important;
    transition: none !important;
  }

  .progress-dot--filled {
    transform: none;
  }

  .resource-tag:hover,
  .comparison-control-btn--primary:hover,
  .comparison-control-btn--secondary:hover {
    transform: none;
  }

  .empty-state__icon-path {
    stroke-dashoffset: 0;
  }
}

/* Reduced motion class */
.reduced-motion .resource-tag-enter-active,
.reduced-motion .resource-tag-leave-active {
  animation: none;
}

.reduced-motion .progress-dot--latest {
  animation: none;
}
</style>
