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
    @scroll="handleScroll"
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
    >
      <div
        v-for="virtualRow in virtualizer.getVirtualItems()"
        :key="String(virtualRow.key)"
        :data-index="virtualRow.index"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualRow.start}px)`,
        }"
      >
        <slot :item="items[virtualRow.index]" :index="virtualRow.index" />
      </div>
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
}

// Flexy says: No more hardcoded defaults! Using config values.
const props = withDefaults(defineProps<Props>(), {
  itemHeight: uiConfig.virtualList.itemHeight,
  overscan: uiConfig.virtualList.overscan,
  containerHeight: thresholdsConfig.virtualList.defaultContainerHeight,
  showProgressIndicator: true,
})

const scrollContainer = ref<HTMLElement | null>(null)
const scrollPercentage = ref(0)
const prefersReducedMotion = ref(false)

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

onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  if (typeof window !== 'undefined') {
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleChange)
  }

  // Initial scroll position calculation
  handleScroll()
})

onUnmounted(() => {
  if (mediaQuery) {
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.removeEventListener('change', handleChange)
  }
})
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
</style>
