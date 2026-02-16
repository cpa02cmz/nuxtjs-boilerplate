<template>
  <Transition
    :enter-active-class="`transition-all ${animationConfig.tailwindDurations.standard} ease-out`"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    :leave-active-class="`transition-all ${animationConfig.tailwindDurations.normal} ease-in`"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="relatedSearches.length > 0"
      class="related-searches"
      role="region"
      :aria-label="contentConfig.relatedSearches.aria.region"
    >
      <!-- Header with icon -->
      <div class="related-searches__header">
        <span class="related-searches__icon" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            :class="['h-4 w-4', isSearching ? 'animate-spin' : '']"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>
        <h4 class="related-searches__title">
          {{ contentConfig.relatedSearches.title }}
        </h4>
      </div>

      <!-- Search buttons with staggered animation -->
      <div
        class="related-searches__list"
        role="group"
        :aria-label="contentConfig.relatedSearches.aria.group"
      >
        <TransitionGroup
          :enter-active-class="`transition-all ${animationConfig.tailwindDurations.standard} ease-out`"
          enter-from-class="opacity-0 scale-90 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          :leave-active-class="`transition-all ${animationConfig.tailwindDurations.normal} ease-in`"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-90"
          :move-class="`transition-transform ${animationConfig.tailwindDurations.standard}`"
        >
          <button
            v-for="(search, index) in relatedSearches"
            :key="search"
            ref="searchButtons"
            class="related-searches__button"
            :class="{
              'is-hovering': hoverIndex === index && !prefersReducedMotion,
              'is-pressed': pressedIndex === index,
              'is-focused': focusedIndex === index,
              'is-loading': loadingIndex === index,
            }"
            :style="getButtonStyle(index)"
            :aria-label="
              loadingIndex === index
                ? `Loading search results for ${search}`
                : contentConfig.relatedSearches.aria.button.replace(
                    '{query}',
                    search
                  )
            "
            :aria-busy="loadingIndex === index ? 'true' : 'false'"
            :disabled="loadingIndex === index"
            @click="handleClick(search, index, $event)"
            @mouseenter="handleMouseEnter(index)"
            @mouseleave="handleMouseLeave"
            @focus="handleFocus(index)"
            @blur="handleBlur"
            @keydown="handleKeydown($event, index)"
          >
            <!-- Ripple effect -->
            <span
              v-if="ripples[index]"
              class="ripple-container"
              aria-hidden="true"
            >
              <span
                class="ripple-effect"
                :style="{
                  left: `${ripples[index].x}px`,
                  top: `${ripples[index].y}px`,
                  width: `${ripples[index].size}px`,
                  height: `${ripples[index].size}px`,
                }"
              />
            </span>

            <!-- Search icon -->
            <span class="button-icon" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>

            <!-- Search text -->
            <span class="button-text">{{ search }}</span>

            <!-- Loading spinner for active search -->
            <span
              v-if="loadingIndex === index"
              class="button-loading"
              aria-hidden="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>

            <!-- Arrow indicator on hover (hidden when loading) -->
            <span
              v-else
              class="button-arrow"
              aria-hidden="true"
              :class="{ 'is-visible': hoverIndex === index }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </button>
        </TransitionGroup>
      </div>

      <!-- Screen reader announcements -->
      <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {{ announcement }}
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAdvancedResourceSearch } from '~/composables/useAdvancedResourceSearch'
import { useResourceData } from '~/composables/useResourceData'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'
import { themeConfig } from '~/configs/theme.config'
import { shadowsConfig } from '~/configs/shadows.config'
import { zIndexScale } from '~/configs/z-index.config'
import { hapticLight } from '~/utils/hapticFeedback'
import { uiTimingConfig } from '~/configs/ui-timing.config'

interface Props {
  query: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select', search: string): void
}>()

const { resources } = useResourceData()
const { getRelatedSearches } = useAdvancedResourceSearch(resources.value)

// Reactive state - Palette's micro-UX enhancement!
const hoverIndex = ref<number | null>(null)
const pressedIndex = ref<number | null>(null)
const focusedIndex = ref<number | null>(null)
const loadingIndex = ref<number | null>(null) // 🎨 Pallete: Track loading state per button
const ripples = ref<{ [key: number]: { x: number; y: number; size: number } }>(
  {}
)
const announcement = ref('')
const searchButtons = ref<HTMLButtonElement[]>([])
const prefersReducedMotion = ref(false)
const isSearching = ref(false)

const relatedSearches = computed(() => {
  if (!props.query || props.query.length < 2) return []
  return getRelatedSearches(props.query)
})

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Get button style with staggered animation
const getButtonStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}

  return {
    '--stagger-index': String(index),
    animationDelay: `${index * animationConfig.relatedSearches.staggerDelayMs}ms`,
  } as Record<string, string>
}

// Handle click with ripple and haptic feedback
const handleClick = (search: string, index: number, event: MouseEvent) => {
  // 🎨 Pallete: Set loading state for immediate visual feedback
  loadingIndex.value = index

  // Create ripple effect
  const button = event.currentTarget as HTMLButtonElement
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height) * 2

  ripples.value[index] = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    size,
  }

  // Press feedback
  pressedIndex.value = index
  setTimeout(() => {
    pressedIndex.value = null
  }, animationConfig.microInteractions.pressDurationMs)

  // Haptic feedback
  hapticLight()

  // Announce for screen readers with loading state
  announcement.value =
    contentConfig.relatedSearches.announcement.searching.replace(
      '{query}',
      search
    )
  setTimeout(() => {
    announcement.value = ''
  }, animationConfig.microInteractions.announcementDelayMs)

  // Remove ripple after animation
  setTimeout(() => {
    delete ripples.value[index]
  }, animationConfig.ripple.durationMs)

  // Show searching state
  isSearching.value = true

  // 🎨 Pallete: Reset loading state after search duration
  setTimeout(() => {
    loadingIndex.value = null
    isSearching.value = false
  }, uiTimingConfig.relatedSearches.searchDuration)

  emit('select', search)
}

// Hover handlers
const handleMouseEnter = (index: number) => {
  hoverIndex.value = index
}

const handleMouseLeave = () => {
  hoverIndex.value = null
}

// Focus handlers
const handleFocus = (index: number) => {
  focusedIndex.value = index
}

const handleBlur = () => {
  focusedIndex.value = null
}

// Enhanced keyboard navigation
const handleKeydown = (event: KeyboardEvent, currentIndex: number) => {
  const buttons = searchButtons.value.filter(Boolean)
  if (!buttons.length) return

  switch (event.key) {
    case 'ArrowRight':
      event.preventDefault()
      if (currentIndex < buttons.length - 1) {
        buttons[currentIndex + 1]?.focus()
      }
      break
    case 'ArrowLeft':
      event.preventDefault()
      if (currentIndex > 0) {
        buttons[currentIndex - 1]?.focus()
      }
      break
    case 'Home':
      event.preventDefault()
      buttons[0]?.focus()
      break
    case 'End':
      event.preventDefault()
      buttons[buttons.length - 1]?.focus()
      break
  }
}

// Lifecycle
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleChange)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.removeEventListener('change', () => {})
  }
})
</script>

<style scoped>
/* Container styles */
.related-searches {
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(
    135deg,
    v-bind('themeConfig.relatedSearches.gradientStart') 0%,
    v-bind('themeConfig.relatedSearches.gradientEnd') 100%
  );
  border-radius: v-bind('animationConfig.borderRadius.lg');
  border: 1px solid v-bind('themeConfig.relatedSearches.borderColor');
  box-shadow: v-bind('shadowsConfig.relatedSearches.default');
  animation: container-entrance
    v-bind('animationConfig.relatedSearches.containerEntranceSec') ease-out;
}

@keyframes container-entrance {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header styles */
.related-searches__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.related-searches__icon {
  color: v-bind('themeConfig.relatedSearches.iconColor');
  animation: icon-bounce v-bind('animationConfig.relatedSearches.iconBounceSec')
    ease-in-out;
}

@keyframes icon-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

.related-searches__title {
  font-size: 0.875rem;
  font-weight: 500;
  color: v-bind('themeConfig.relatedSearches.titleColor');
}

/* List container */
.related-searches__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Button styles - Palette's micro-UX enhancement! */
.related-searches__button {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: v-bind('themeConfig.relatedSearches.button.text');
  background: v-bind('themeConfig.relatedSearches.button.bg');
  border: 1px solid v-bind('themeConfig.relatedSearches.button.border');
  border-radius: v-bind('animationConfig.borderRadius.full');
  cursor: pointer;
  overflow: hidden;
  transition: all v-bind('animationConfig.cssTransitions.normalSec') ease-out;
  animation: button-entrance
    v-bind('animationConfig.relatedSearches.buttonEntranceSec') ease-out
    backwards;
  animation-delay: calc(
    var(--stagger-index, 0) *
      v-bind('`${animationConfig.relatedSearches.staggerDelayMs}ms`')
  );
}

@keyframes button-entrance {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Hover state with lift effect */
.related-searches__button:hover,
.related-searches__button.is-hovering {
  background: v-bind('themeConfig.relatedSearches.button.hoverBg');
  border-color: v-bind('themeConfig.relatedSearches.button.hoverBorder');
  color: v-bind('themeConfig.relatedSearches.button.hoverText');
  transform: translateY(-2px) scale(1.02);
  box-shadow: v-bind('shadowsConfig.relatedSearches.hover');
}

/* Pressed state */
.related-searches__button:active,
.related-searches__button.is-pressed {
  transform: translateY(0) scale(0.98);
  transition-duration: v-bind('animationConfig.cssTransitions.fastSec');
}

/* 🎨 Pallete: Loading state with visual feedback */
.related-searches__button.is-loading {
  cursor: wait;
  opacity: 0.8;
  background: v-bind('themeConfig.relatedSearches.button.loadingBg');
}

/* Disabled state */
.related-searches__button:disabled {
  cursor: wait;
  pointer-events: none;
}

/* Focused state */
.related-searches__button:focus {
  outline: none;
  box-shadow: 0 0 0 2px v-bind('themeConfig.relatedSearches.button.focusRing');
}

.related-searches__button.is-focused {
  box-shadow: 0 0 0 3px v-bind('themeConfig.relatedSearches.button.focusRing');
}

/* Button icon */
.button-icon {
  opacity: 0.6;
  transition: opacity v-bind('animationConfig.cssTransitions.fastSec') ease-out;
}

.related-searches__button:hover .button-icon,
.related-searches__button.is-hovering .button-icon {
  opacity: 1;
}

/* Button text */
.button-text {
  position: relative;
  /* Flexy hates hardcoded z-index! Using config instead. */
  z-index: v-bind('zIndexScale.low[1]');
}

/* Button arrow - appears on hover */
.button-arrow {
  opacity: 0;
  transform: translateX(-4px);
  transition: all v-bind('animationConfig.cssTransitions.normalSec') ease-out;
}

.button-arrow.is-visible {
  opacity: 1;
  transform: translateX(0);
}

/* Ripple effect container */
.ripple-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: inherit;
}

/* Ripple effect */
.ripple-effect {
  position: absolute;
  border-radius: 50%;
  background: v-bind('themeConfig.relatedSearches.rippleColor');
  opacity: 0.3;
  transform: translate(-50%, -50%) scale(0);
  animation: ripple-expand v-bind('`${animationConfig.ripple.durationMs}ms`')
    ease-out forwards;
  pointer-events: none;
}

@keyframes ripple-expand {
  to {
    transform: translate(-50%, -50%) scale(4);
    opacity: 0;
  }
}

/* Spin animation for searching state */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Loading Spinner - Flexy: using config instead of hardcoded values */
.animate-spin {
  animation: spin
    v-bind('animationConfig.optimizedImage.spinnerRotateDurationSec') linear
    infinite;
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
  .related-searches {
    animation: none;
  }

  .related-searches__icon {
    animation: none;
  }

  .related-searches__button {
    animation: none;
    transition: none;
  }

  .related-searches__button:hover,
  .related-searches__button.is-hovering {
    transform: none;
  }

  .button-arrow {
    transition: none;
    opacity: 1;
    transform: none;
  }

  .ripple-effect {
    animation: none;
    display: none;
  }

  .animate-spin {
    animation: none;
  }
}

/* 🎨 Pallete: Loading spinner styles for button feedback */
.button-loading {
  display: inline-flex;
  align-items: center;
  animation: loading-fade-in v-bind('animationConfig.cssTransitions.fastSec')
    ease-out;
}

@keyframes loading-fade-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Spin animation for loading state */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin
    v-bind('animationConfig.optimizedImage.spinnerRotateDurationSec') linear
    infinite;
}

/* Reduced motion support for loading spinner */
@media (prefers-reduced-motion: reduce) {
  .button-loading {
    animation: none;
  }

  .animate-spin {
    animation: none;
    opacity: 0.5;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .related-searches {
    border-width: 2px;
  }

  .related-searches__button {
    border-width: 2px;
  }

  .related-searches__button:focus {
    outline-width: 3px;
  }
}
</style>
