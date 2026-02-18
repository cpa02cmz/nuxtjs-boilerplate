<template>
  <div
    ref="scrollContainer"
    class="virtual-scroll-container overflow-y-auto relative"
    :style="{
      height: containerHeight,
      '--scrollbar-thumb': scrollbarColors.thumb,
      '--scrollbar-track': scrollbarColors.track,
      '--scrollbar-thumb-hover': scrollbarColors.thumbHover,
    }"
    @scroll.passive="handleScroll"
  >
    <!-- Scroll Progress Indicator - Palette's micro-UX enhancement! -->
    <div
      v-if="showProgressIndicator"
      class="scroll-progress-container"
      :class="{
        'scroll-progress-container--reduced-motion': prefersReducedMotion,
      }"
      aria-hidden="true"
    >
      <div
        class="scroll-progress-bar"
        :class="{
          'scroll-progress-bar--with-glow':
            scrollProgressConfig.showGlow && !prefersReducedMotion,
        }"
        :style="{
          width: `${scrollPercentage}%`,
          '--progress-glow-color': scrollProgressConfig.glowColor,
          '--progress-glow-blur': `${scrollProgressConfig.glowBlurPx}px`,
        }"
      />
    </div>

    <div
      ref="scrollContent"
      :style="{
        height: `${totalHeight}px`,
        position: 'relative',
      }"
      role="listbox"
      :aria-label="ariaLabel"
      tabindex="0"
      @keydown="handleKeyDown"
    >
      <TransitionGroup
        name="list-item"
        tag="div"
        class="w-full h-full"
      >
        <div
          v-for="virtualRow in virtualizer.getVirtualItems()"
          :key="String(virtualRow.key)"
          :data-index="virtualRow.index"
          :tabindex="focusedIndex === virtualRow.index ? 0 : -1"
          role="option"
          :aria-posinset="virtualRow.index + 1"
          :aria-setsize="items.length"
          :aria-selected="focusedIndex === virtualRow.index"
          class="virtual-list-item"
          :class="{
            'virtual-list-item--animated':
              !prefersReducedMotion && isListLoaded,
            'virtual-list-item--focused': focusedIndex === virtualRow.index,
          }"
          :style="{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualRow.start}px)`,
            '--item-index': virtualRow.index % 10,
          }"
          @focus="handleItemFocus(virtualRow.index)"
        >
          <slot
            :item="items[virtualRow.index]"
            :index="virtualRow.index"
            :is-focused="focusedIndex === virtualRow.index"
          />
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { uiConfig } from '../configs/ui.config'
import { thresholdsConfig } from '../configs/thresholds.config'
import { componentColorsConfig } from '../configs/component-colors.config'
import { animationConfig } from '../configs/animation.config'
import { zIndexScale } from '../configs/z-index.config'
import { uiTimingConfig } from '../configs/ui-timing.config'

interface Props {
  items: T[]
  itemHeight?: number
  overscan?: number
  containerHeight?: string
  /**
   * Whether to show the scroll progress indicator
   * @default true
   */
  showProgressIndicator?: boolean
  /**
   * Accessible label for the listbox
   * @default 'Resource list'
   */
  ariaLabel?: string
}

// Flexy says: No more hardcoded defaults! Using config values.
const props = withDefaults(defineProps<Props>(), {
  itemHeight: uiConfig.virtualList.itemHeight,
  overscan: uiConfig.virtualList.overscan,
  containerHeight: thresholdsConfig.virtualList.defaultContainerHeight,
  showProgressIndicator: true,
  ariaLabel: 'Resource list',
})

const scrollContainer = ref<HTMLElement | null>(null)
const scrollContent = ref<HTMLElement | null>(null)
const scrollPercentage = ref(0)
const prefersReducedMotion = ref(false)
const isListLoaded = ref(false)
const focusedIndex = ref(0)

const totalHeight = computed(() => props.items.length * props.itemHeight)

const virtualizer = useVirtualizer({
  count: props.items.length,
  getScrollElement: () => scrollContainer.value,
  estimateSize: () => props.itemHeight,
  overscan: props.overscan,
})

// Flexy hates hardcoded colors! Using config values for scrollbar colors
const scrollbarColors = computed(() => ({
  thumb: componentColorsConfig.scrollbar.thumb,
  track: componentColorsConfig.scrollbar.track,
  thumbHover: componentColorsConfig.scrollbar.thumbHover,
}))

// Scroll progress configuration from animationConfig
const scrollProgressConfig = computed(() => animationConfig.scrollProgress)

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Handle scroll events to update progress
const handleScroll = () => {
  if (!scrollContainer.value) return

  const element = scrollContainer.value
  const scrollTop = element.scrollTop
  const scrollHeight = element.scrollHeight - element.clientHeight

  if (scrollHeight > 0) {
    const percentage = Math.min(
      100,
      Math.max(0, (scrollTop / scrollHeight) * 100)
    )
    scrollPercentage.value = percentage
  }
}

// Listen for reduced motion preference changes
let mediaQuery: MediaQueryList | null = null
let handleMotionChange: ((e: MediaQueryListEvent) => void) | null = null

onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  if (typeof window !== 'undefined') {
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleMotionChange)
  }

  // Initial scroll position calculation
  handleScroll()

  // Palette's micro-UX delight: Trigger staggered entrance animation
  // Small delay to ensure DOM is ready and prevent hydration mismatch
  setTimeout(() => {
    isListLoaded.value = true
  }, uiTimingConfig.virtualList.entranceDelay)
})

onUnmounted(() => {
  if (mediaQuery && handleMotionChange) {
    mediaQuery.removeEventListener('change', handleMotionChange)
    mediaQuery = null
    handleMotionChange = null
  }
})

/**
 * Keyboard navigation handlers for accessibility
 * Implements roving tabindex pattern with full keyboard support
 */
const handleKeyDown = (e: KeyboardEvent) => {
  const itemCount = props.items.length
  if (itemCount === 0) return

  let newIndex = focusedIndex.value
  let shouldPreventDefault = true

  switch (e.key) {
    case 'ArrowDown':
      newIndex = Math.min(focusedIndex.value + 1, itemCount - 1)
      break
    case 'ArrowUp':
      newIndex = Math.max(focusedIndex.value - 1, 0)
      break
    case 'PageDown':
      newIndex = Math.min(focusedIndex.value + 5, itemCount - 1)
      break
    case 'PageUp':
      newIndex = Math.max(focusedIndex.value - 5, 0)
      break
    case 'Home':
      newIndex = 0
      break
    case 'End':
      newIndex = itemCount - 1
      break
    default:
      shouldPreventDefault = false
  }

  if (shouldPreventDefault) {
    e.preventDefault()
    if (newIndex !== focusedIndex.value) {
      focusedIndex.value = newIndex
      scrollToIndex(newIndex)
      announcePosition(newIndex, itemCount)
    }
  }
}

/**
 * Handle focus on a list item
 */
const handleItemFocus = (index: number) => {
  focusedIndex.value = index
}

/**
 * Scroll to make the focused item visible
 */
const scrollToIndex = (index: number) => {
  if (!scrollContainer.value) return
  const scrollTop = index * props.itemHeight
  scrollContainer.value.scrollTo({
    top: scrollTop,
    behavior: prefersReducedMotion.value ? 'auto' : 'smooth',
  })
}

/**
 * Announce position to screen readers
 */
const announcePosition = (_index: number, _total: number) => {
  // Use aria-live region if available, or rely on aria-posinset/aria-setsize
  // The browser should announce the position automatically with these attributes
  // No console logging needed - screen readers handle the announcement
}
</script>

<style scoped>
.virtual-scroll-container {
  scrollbar-width: thin;
  /* Flexy hates hardcoded values! Using CSS custom properties from config */
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
}

.virtual-scroll-container::-webkit-scrollbar {
  width: v-bind('uiConfig.scrollbar.width');
}

.virtual-scroll-container::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
  border-radius: v-bind('uiConfig.scrollbar.borderRadius.track');
}

.virtual-scroll-container::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: v-bind('uiConfig.scrollbar.borderRadius.thumb');
}

.virtual-scroll-container::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

/* Scroll Progress Indicator - Palette's micro-UX enhancement!
   Provides visual feedback of scroll position with subtle glow */
.scroll-progress-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: v-bind('`${scrollProgressConfig.barHeightPx}px`');
  background: v-bind('scrollProgressConfig.trackColor');
  z-index: v-bind('zIndexScale.low[10]');
  pointer-events: none;
}

.scroll-progress-bar {
  height: 100%;
  background: v-bind('scrollProgressConfig.barColor');
  transition: width v-bind('`${scrollProgressConfig.transitionDurationMs}ms`')
    ease-out;
  border-radius: v-bind('scrollProgressConfig.borderRadius');
}

/* Glow effect for the progress bar - adds delightful visual feedback */
.scroll-progress-bar--with-glow {
  box-shadow:
    0 0 v-bind('`${scrollProgressConfig.glowBlurPx}px`')
      var(--progress-glow-color),
    0 0 calc(v-bind('`${scrollProgressConfig.glowBlurPx}px`') * 1.5)
      var(--progress-glow-color);
}

/* Reduced motion support - disable glow but keep the progress bar */
.scroll-progress-container--reduced-motion .scroll-progress-bar {
  transition: none;
  box-shadow: none;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .scroll-progress-bar {
    background: currentColor;
    opacity: 0.8;
  }
}

/* Palette's micro-UX enhancement: Staggered entrance animation
   Creates a delightful cascading wave effect when list items appear */
.virtual-list-item--animated {
  animation: list-item-enter
    v-bind('`${animationConfig.virtualList.entranceDurationMs}ms`')
    v-bind('animationConfig.virtualList.entranceEasing') forwards;
  animation-delay: calc(
    var(--item-index) *
      v-bind('`${animationConfig.virtualList.staggerDelayMs}ms`')
  );
  opacity: 0;
}

@keyframes list-item-enter {
  0% {
    opacity: 0;
    transform: translateY(calc(var(--translate-y, 0px) + 20px)) scale(0.95);
  }
  60% {
    opacity: 1;
    transform: translateY(calc(var(--translate-y, 0px) - 2px)) scale(1.01);
  }
  100% {
    opacity: 1;
    transform: translateY(var(--translate-y, 0px)) scale(1);
  }
}

/* Vue TransitionGroup classes for smooth item transitions */
.list-item-enter-active,
.list-item-leave-active {
  transition: all
    v-bind('`${animationConfig.virtualList.transitionDurationMs}ms`') ease-out;
}

.list-item-enter-from,
.list-item-leave-to {
  opacity: 0;
  transform: translateY(var(--translate-y, 0px)) scale(0.95);
}

.list-item-move {
  transition: transform
    v-bind('`${animationConfig.virtualList.moveDurationMs}ms`') ease-out;
}

/* Focus styles for keyboard navigation */
.virtual-list-item--focused {
  outline: 2px solid v-bind('componentColorsConfig.focusRing.color');
  outline-offset: 2px;
}

/* Ensure focus is visible */
.virtual-list-item:focus-visible {
  outline: 2px solid v-bind('componentColorsConfig.focusRing.color');
  outline-offset: 2px;
}

/* Reduced motion support - disable staggered animation */
@media (prefers-reduced-motion: reduce) {
  .virtual-list-item--animated {
    animation: none;
    opacity: 1;
    transition: opacity
      v-bind('`${animationConfig.virtualList.reducedMotionDurationMs}ms`')
      ease-out;
  }

  .list-item-enter-active,
  .list-item-leave-active,
  .list-item-move {
    transition: none;
  }
}
</style>
