<template>
  <div
    ref="skeletonRef"
    class="bg-white p-6 rounded-lg shadow border border-gray-200 skeleton-filter-sidebar skeleton-interactive"
    aria-busy="true"
    aria-label="Loading filters"
    :style="{
      '--skeleton-light-start': skeletonColors.light.start,
      '--skeleton-light-mid': skeletonColors.light.middle,
      '--skeleton-light-end': skeletonColors.light.end,
      '--skeleton-reduced-light': skeletonColors.reducedMotion.light,
      '--skeleton-checkbox-start': skeletonColors.checkbox.start,
      '--skeleton-checkbox-mid': skeletonColors.checkbox.middle,
      '--skeleton-checkbox-end': skeletonColors.checkbox.end,
      '--wave-duration': waveDuration,
      '--wave-stagger': waveStagger,
      '--hover-intensity': hoverIntensity,
      '--section-stagger': sectionStagger,
    }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Header -->
    <div
      class="flex justify-between items-center mb-4 section-header"
      :style="{ '--section-index': 0 }"
    >
      <div
        class="skeleton-shimmer skeleton-header-expand h-6 rounded w-20 skeleton-item skeleton-wave"
        :style="{ animationDelay: getStaggerDelay(0), '--wave-index': 0 }"
        aria-hidden="true"
      />
      <div
        class="skeleton-shimmer skeleton-header-expand h-5 rounded w-16 skeleton-item skeleton-wave"
        :style="{ animationDelay: getStaggerDelay(1), '--wave-index': 1 }"
        aria-hidden="true"
      />
    </div>

    <!-- Category Section -->
    <div
      class="mb-6 filter-section"
      :style="{ '--section-index': 1 }"
    >
      <div
        class="skeleton-shimmer skeleton-header-expand h-5 rounded w-24 mb-3 skeleton-item skeleton-wave"
        :style="{ animationDelay: getStaggerDelay(2), '--wave-index': 2 }"
        aria-hidden="true"
      />
      <div class="space-y-2">
        <div
          v-for="i in 5"
          :key="`category-${i}`"
          class="flex items-center filter-option"
          :style="{ '--option-index': i }"
        >
          <div
            class="skeleton-checkbox skeleton-wave rounded skeleton-item mr-2 flex-shrink-0"
            :style="{
              animationDelay: getStaggerDelay(3 + i),
              '--wave-index': 3 + i,
            }"
            aria-hidden="true"
          />
          <div
            class="skeleton-shimmer h-4 rounded skeleton-item skeleton-wave flex-1"
            :style="{
              animationDelay: getStaggerDelay(3 + i),
              '--wave-index': 3 + i,
              width: `${getRandomWidth(60, 90)}%`,
            }"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>

    <!-- Pricing Model Section -->
    <div
      class="mb-6 filter-section"
      :style="{ '--section-index': 2 }"
    >
      <div
        class="skeleton-shimmer skeleton-header-expand h-5 rounded w-32 mb-3 skeleton-item skeleton-wave"
        :style="{ animationDelay: getStaggerDelay(9), '--wave-index': 9 }"
        aria-hidden="true"
      />
      <div class="space-y-2">
        <div
          v-for="i in 3"
          :key="`pricing-${i}`"
          class="flex items-center filter-option"
          :style="{ '--option-index': i }"
        >
          <div
            class="skeleton-checkbox skeleton-wave rounded skeleton-item mr-2 flex-shrink-0"
            :style="{
              animationDelay: getStaggerDelay(10 + i),
              '--wave-index': 10 + i,
            }"
            aria-hidden="true"
          />
          <div
            class="skeleton-shimmer h-4 rounded skeleton-item skeleton-wave flex-1"
            :style="{
              animationDelay: getStaggerDelay(10 + i),
              '--wave-index': 10 + i,
              width: `${getRandomWidth(50, 80)}%`,
            }"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>

    <!-- Difficulty Section -->
    <div
      class="mb-6 filter-section"
      :style="{ '--section-index': 3 }"
    >
      <div
        class="skeleton-shimmer skeleton-header-expand h-5 rounded w-20 mb-3 skeleton-item skeleton-wave"
        :style="{ animationDelay: getStaggerDelay(14), '--wave-index': 14 }"
        aria-hidden="true"
      />
      <div class="space-y-2">
        <div
          v-for="i in 4"
          :key="`difficulty-${i}`"
          class="flex items-center filter-option"
          :style="{ '--option-index': i }"
        >
          <div
            class="skeleton-checkbox skeleton-wave rounded skeleton-item mr-2 flex-shrink-0"
            :style="{
              animationDelay: getStaggerDelay(15 + i),
              '--wave-index': 15 + i,
            }"
            aria-hidden="true"
          />
          <div
            class="skeleton-shimmer h-4 rounded skeleton-item skeleton-wave flex-1"
            :style="{
              animationDelay: getStaggerDelay(15 + i),
              '--wave-index': 15 + i,
              width: `${getRandomWidth(55, 85)}%`,
            }"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>

    <!-- Date Added Section -->
    <div
      class="mb-6 filter-section"
      :style="{ '--section-index': 4 }"
    >
      <div
        class="skeleton-shimmer skeleton-header-expand h-5 rounded w-24 mb-3 skeleton-item skeleton-wave"
        :style="{ animationDelay: getStaggerDelay(20), '--wave-index': 20 }"
        aria-hidden="true"
      />
      <div class="space-y-2">
        <div
          v-for="i in 4"
          :key="`date-${i}`"
          class="flex items-center filter-option"
          :style="{ '--option-index': i }"
        >
          <div
            class="skeleton-checkbox skeleton-wave rounded-full skeleton-item mr-2 flex-shrink-0"
            :style="{
              animationDelay: getStaggerDelay(21 + i),
              '--wave-index': 21 + i,
            }"
            aria-hidden="true"
          />
          <div
            class="skeleton-shimmer h-4 rounded skeleton-item skeleton-wave flex-1"
            :style="{
              animationDelay: getStaggerDelay(21 + i),
              '--wave-index': 21 + i,
              width: `${getRandomWidth(40, 70)}%`,
            }"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 🎨 Palette: Enhanced Filter Sidebar Skeleton with Micro-UX Delights!
// Features wave shimmer, checkbox pulse animations, section reveals, and interactive hover states
import { ref, computed, onUnmounted } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { componentColorsConfig } from '~/configs/component-colors.config'
import { EASING } from '~/configs/easing.config'

// Animation timing configuration - Flexy hates hardcoded values!
const staggerBaseDelay = animationConfig.skeleton.staggerDelayMs
const staggerIncrement = animationConfig.skeleton.staggerIncrementMs

// Wave animation configuration - creates a flowing wave effect across all items
const waveDuration = `${animationConfig.skeleton.waveDurationSec}s`
const waveStagger = `${animationConfig.skeleton.waveStaggerSec}s`

// Section stagger for group reveals
const sectionStagger = '150ms'

// Calculate stagger delays for each item
const getStaggerDelay = (index: number): string => {
  return `${staggerBaseDelay + index * staggerIncrement}ms`
}

// Generate random width for variety (prevents repetitive visual pattern)
const getRandomWidth = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 🎨 Palette: Enhanced color configuration with checkbox-specific colors
const skeletonColors = {
  light: componentColorsConfig.skeleton.light,
  reducedMotion: componentColorsConfig.skeleton.reducedMotion,
  checkbox: {
    start: '#d1d5db',
    middle: '#e5e7eb',
    end: '#d1d5db',
  },
}

// 🎨 Palette: Interactive hover state for delightful micro-UX
const skeletonRef = ref<HTMLElement | null>(null)
const hoverIntensity = ref(0)
const isHovering = ref(false)
let hoverAnimationFrame: number | null = null

const handleMouseEnter = (): void => {
  isHovering.value = true
  animateHoverIntensity(1)
}

const handleMouseLeave = (): void => {
  isHovering.value = false
  animateHoverIntensity(0)
}

const animateHoverIntensity = (target: number): void => {
  if (hoverAnimationFrame !== null) {
    cancelAnimationFrame(hoverAnimationFrame)
  }

  const animate = (): void => {
    const current = hoverIntensity.value
    const diff = target - current

    if (Math.abs(diff) < 0.01) {
      hoverIntensity.value = target
      return
    }

    // Smooth easing towards target
    hoverIntensity.value = current + diff * 0.15
    hoverAnimationFrame = requestAnimationFrame(animate)
  }

  hoverAnimationFrame = requestAnimationFrame(animate)
}

onUnmounted(() => {
  if (hoverAnimationFrame !== null) {
    cancelAnimationFrame(hoverAnimationFrame)
  }
})

// 🎯 Flexy: Modular easing values from config
const easingValues = computed(() => ({
  materialStandard: EASING.MATERIAL_STANDARD,
  springSnappy: EASING.SPRING_SNAPPY,
}))
</script>

<style scoped>
/* 🎨 Palette: Interactive skeleton with hover response */
.skeleton-interactive {
  transition:
    transform v-bind('animationConfig.cssTransitions.hoverSec')
      v-bind('easingValues.materialStandard'),
    box-shadow v-bind('animationConfig.cssTransitions.hoverSec')
      v-bind('easingValues.materialStandard');
  cursor: progress;
}

.skeleton-interactive:hover {
  transform: translateY(-2px) scale(1.005);
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Skeleton shimmer effect with gradient - enhanced with organic morphing */
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--skeleton-light-start) 0%,
    var(--skeleton-light-mid) 25%,
    var(--skeleton-light-end) 50%,
    var(--skeleton-light-mid) 75%,
    var(--skeleton-light-start) 100%
  );
  background-size: 200% 100%;
  animation:
    shimmer v-bind('animationConfig.skeleton.shimmerDurationSec') ease-in-out
      infinite,
    breathe v-bind('animationConfig.cssAnimations.longDurationSec') ease-in-out
      infinite;
  transition: filter v-bind('animationConfig.cssTransitions.standardSec') ease;
}

/* 🎨 Palette: Hover glow effect on shimmer elements */
.skeleton-interactive:hover .skeleton-shimmer {
  filter: brightness(1.05) saturate(1.1);
}

/* 🎨 Palette: Section header width expansion animation */
.skeleton-header-expand {
  animation:
    shimmer v-bind('animationConfig.skeleton.shimmerDurationSec') ease-in-out
      infinite,
    breathe v-bind('animationConfig.cssAnimations.longDurationSec') ease-in-out
      infinite,
    header-expand v-bind('animationConfig.cssTransitions.slowerSec')
      v-bind('easingValues.springSnappy') forwards;
  animation-delay:
    calc(var(--wave-index) * var(--wave-stagger)),
    calc(var(--wave-index) * var(--wave-stagger)),
    calc(var(--section-index) * var(--section-stagger));
}

@keyframes header-expand {
  0% {
    width: 0%;
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 1;
  }
}

/* Organic breathing animation for more natural feel */
@keyframes breathe {
  0%,
  100% {
    opacity: 0.9;
  }
  50% {
    opacity: 1;
  }
}

/* 🎨 Palette: Checkbox placeholder with pulse animation */
.skeleton-checkbox {
  width: 16px;
  height: 16px;
  background: linear-gradient(
    90deg,
    var(--skeleton-checkbox-start) 0%,
    var(--skeleton-checkbox-mid) 25%,
    var(--skeleton-checkbox-end) 50%,
    var(--skeleton-checkbox-mid) 75%,
    var(--skeleton-checkbox-start) 100%
  );
  background-size: 200% 100%;
  animation:
    shimmer v-bind('animationConfig.skeleton.shimmerDurationSec') ease-in-out
      infinite,
    checkbox-pulse 3s ease-in-out infinite,
    breathe v-bind('animationConfig.cssAnimations.longDurationSec') ease-in-out
      infinite;
  transition: transform v-bind('animationConfig.cssTransitions.fastSec')
    v-bind('easingValues.springSnappy');
}

/* 🎨 Palette: Checkbox hover interaction */
.filter-option:hover .skeleton-checkbox {
  transform: scale(1.15);
}

/* Checkbox-specific subtle pulse */
@keyframes checkbox-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(209, 213, 219, 0.4);
  }
  50% {
    box-shadow: 0 0 0 3px rgba(209, 213, 219, 0);
  }
}

/* Staggered animation delays are now set via inline styles */

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 🎨 Palette: Filter section entrance with stagger */
.filter-section {
  opacity: 0;
  animation: section-enter v-bind('animationConfig.cssTransitions.slowerSec')
    v-bind('easingValues.materialStandard') forwards;
  animation-delay: calc(var(--section-index) * var(--section-stagger));
}

@keyframes section-enter {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 🎨 Palette: Filter option hover lift effect */
.filter-option {
  transition: transform v-bind('animationConfig.cssTransitions.fastSec')
    v-bind('easingValues.materialStandard');
  padding: 2px 0;
  border-radius: 4px;
}

.filter-option:hover {
  transform: translateX(4px);
}

/* Wave shimmer effect - coordinates multiple items for a flowing wave pattern */
/* This creates a more cohesive and polished loading experience */
.skeleton-wave {
  animation:
    shimmer v-bind('animationConfig.skeleton.shimmerDurationSec') ease-in-out
      infinite,
    wave-pulse var(--wave-duration) ease-in-out infinite,
    breathe 3s ease-in-out infinite;
  animation-delay:
    calc(var(--wave-index) * var(--wave-stagger)),
    calc(var(--wave-index) * var(--wave-stagger)),
    calc(
      var(--wave-index) * v-bind('animationConfig.cssAnimations.smallDelaySec')
    );
  transition:
    transform v-bind('animationConfig.cssTransitions.standardSec')
      v-bind('easingValues.materialStandard'),
    opacity v-bind('animationConfig.cssTransitions.standardSec') ease;
}

/* 🎨 Palette: Staggered hover effect for wave items */
.skeleton-interactive:hover .skeleton-wave {
  animation-duration:
    calc(v-bind('animationConfig.skeleton.shimmerDurationSec') * 0.8),
    calc(var(--wave-duration) * 0.8);
}

.skeleton-interactive:hover .skeleton-wave:nth-child(1) {
  transform: translateX(1px);
}
.skeleton-interactive:hover .skeleton-wave:nth-child(2) {
  transform: translateX(2px);
}
.skeleton-interactive:hover .skeleton-wave:nth-child(3) {
  transform: translateX(3px);
}
.skeleton-interactive:hover .skeleton-wave:nth-child(4) {
  transform: translateX(4px);
}
.skeleton-interactive:hover .skeleton-wave:nth-child(5) {
  transform: translateX(5px);
}

/* Wave pulse animation - subtle opacity and scale variation */
@keyframes wave-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(0.995);
  }
}

/* Card entrance animation */
.skeleton-filter-sidebar {
  animation: card-enter v-bind('animationConfig.skeleton.cardEnterDurationSec')
    v-bind('easingValues.springSnappy');
}

@keyframes card-enter {
  0% {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  60% {
    opacity: 1;
    transform: translateY(-2px) scale(1.005);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Reduced motion support - accessibility first */
@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer,
  .skeleton-checkbox,
  .skeleton-wave {
    animation: none;
    background: var(--skeleton-reduced-light);
    transition: none;
  }

  .skeleton-checkbox {
    background: var(--skeleton-reduced-light);
    animation: none;
  }

  .skeleton-filter-sidebar {
    animation: simpleFadeIn
      v-bind('animationConfig.skeleton.reducedMotionEnterDurationSec') ease-out;
  }

  .skeleton-interactive:hover {
    transform: none;
    box-shadow: none;
  }

  .filter-section {
    opacity: 1;
    animation: none;
  }

  .filter-option:hover {
    transform: none;
  }

  .skeleton-header-expand {
    animation: none;
    opacity: 1;
  }

  @keyframes simpleFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}

/* 🎨 Palette: High contrast mode support */
@media (prefers-contrast: high) {
  .skeleton-shimmer,
  .skeleton-wave {
    background: #767676;
    animation: highContrastPulse 2s ease-in-out infinite;
  }

  .skeleton-checkbox {
    background: #595959;
    animation: highContrastPulse 2s ease-in-out infinite;
    border: 1px solid #000;
  }

  @keyframes highContrastPulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }
}
</style>
