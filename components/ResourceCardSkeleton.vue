<template>
  <article
    ref="skeletonRef"
    class="bg-white p-6 rounded-lg shadow skeleton-card skeleton-interactive"
    aria-busy="true"
    aria-label="Loading resource card"
    :style="{
      '--skeleton-light-start': skeletonColors.light.start,
      '--skeleton-light-mid': skeletonColors.light.middle,
      '--skeleton-light-end': skeletonColors.light.end,
      '--skeleton-icon-start': skeletonColors.icon.start,
      '--skeleton-icon-mid': skeletonColors.icon.middle,
      '--skeleton-icon-end': skeletonColors.icon.end,
      '--skeleton-reduced-light': skeletonColors.reducedMotion.light,
      '--skeleton-reduced-icon': skeletonColors.reducedMotion.icon,
      '--wave-duration': waveDuration,
      '--wave-stagger': waveStagger,
      '--hover-intensity': hoverIntensity,
      '--card-enter-start-translate-y': `${animationConfig.skeleton.cardEnterStartTranslateYPx}px`,
      '--card-enter-start-scale': animationConfig.skeleton.cardEnterStartScale,
      '--card-enter-mid-translate-y': `${animationConfig.skeleton.cardEnterMidTranslateYPx}px`,
      '--card-enter-mid-scale': animationConfig.skeleton.cardEnterMidScale,
    }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="flex items-start">
      <!-- Icon placeholder -->
      <div class="flex-shrink-0 mr-4">
        <div
          class="skeleton-icon skeleton-shimmer skeleton-wave rounded w-12 h-12"
          :style="{ animationDelay: getStaggerDelay(0), '--wave-index': 0 }"
          aria-hidden="true"
        />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-3">
          <!-- Title placeholder -->
          <div
            class="skeleton-shimmer h-5 rounded w-3/4 skeleton-item skeleton-wave"
            :style="{ animationDelay: getStaggerDelay(1), '--wave-index': 1 }"
            aria-hidden="true"
          />
          <!-- New badge placeholder (occasional) -->
          <div
            class="skeleton-shimmer h-5 rounded w-10 skeleton-item skeleton-wave ml-2"
            :style="{ animationDelay: getStaggerDelay(1), '--wave-index': 1 }"
            aria-hidden="true"
          />
        </div>

        <!-- Description placeholder -->
        <div
          class="skeleton-shimmer h-4 rounded w-full mb-2 skeleton-item skeleton-wave"
          :style="{ animationDelay: getStaggerDelay(2), '--wave-index': 2 }"
          aria-hidden="true"
        />
        <div
          class="skeleton-shimmer h-4 rounded w-5/6 mb-4 skeleton-item skeleton-wave"
          :style="{ animationDelay: getStaggerDelay(3), '--wave-index': 3 }"
          aria-hidden="true"
        />

        <!-- Benefits section -->
        <div class="mt-3 bg-gray-50 p-3 rounded-md">
          <div
            class="skeleton-shimmer h-4 rounded w-1/3 mb-3 skeleton-item skeleton-wave"
            :style="{ animationDelay: getStaggerDelay(4), '--wave-index': 4 }"
            aria-hidden="true"
          />
          <div class="space-y-2">
            <div
              class="skeleton-shimmer h-3 rounded w-full skeleton-item skeleton-wave"
              :style="{ animationDelay: getStaggerDelay(5), '--wave-index': 5 }"
              aria-hidden="true"
            />
            <div
              class="skeleton-shimmer h-3 rounded w-4/5 skeleton-item skeleton-wave"
              :style="{ animationDelay: getStaggerDelay(6), '--wave-index': 6 }"
              aria-hidden="true"
            />
            <div
              class="skeleton-shimmer h-3 rounded w-3/4 skeleton-item skeleton-wave"
              :style="{ animationDelay: getStaggerDelay(7), '--wave-index': 7 }"
              aria-hidden="true"
            />
          </div>
        </div>

        <!-- Button placeholder -->
        <div class="mt-4">
          <div
            class="skeleton-shimmer h-8 rounded-md w-32 skeleton-item skeleton-wave"
            :style="{ animationDelay: getStaggerDelay(8), '--wave-index': 8 }"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, onUnmounted, computed } from 'vue'
import { EASING } from '~/configs/easing.config'
import { animationConfig } from '~/configs/animation.config'

// Skeleton loading component for ResourceCard
// Enhanced with wave shimmer animation for better perceived performance
// BroCula fixed SSR issues! 🦇 All values are now SSR-safe.
// Palette enhanced with interactive hover states! 🎨
// Flexy: All cubic-bezier values now use modular EASING config! 🎯

// SSR-safe animation configuration with defaults
// During SSR, we use these defaults; on client, we could enhance
const SKELETON_CONFIG = {
  staggerDelayMs: 0,
  staggerIncrementMs: 75,
  waveDurationSec: 2,
  waveStaggerSec: 0.08,
  shimmerDurationSec: '1.5s',
  pulseDurationSec: '2s',
  cardEnterDurationSec: '0.3s',
  reducedMotionEnterDurationSec: '0.2s',
  hoverTransitionSec: '0.3s',
}

// SSR-safe color configuration with defaults
const SKELETON_COLORS = {
  light: {
    start: '#e5e7eb',
    middle: '#f3f4f6',
    end: '#e5e7eb',
  },
  icon: {
    start: '#d1d5db',
    middle: '#e5e7eb',
    end: '#d1d5db',
  },
  reducedMotion: {
    light: '#e5e7eb',
    icon: '#d1d5db',
  },
}

// Animation timing configuration
const staggerBaseDelay = SKELETON_CONFIG.staggerDelayMs
const staggerIncrement = SKELETON_CONFIG.staggerIncrementMs

// Wave animation configuration - creates a flowing wave effect across all items
const waveDuration = `${SKELETON_CONFIG.waveDurationSec}s`
const waveStagger = `${SKELETON_CONFIG.waveStaggerSec}s`

// Calculate stagger delays for each item
const getStaggerDelay = (index: number): string => {
  return `${staggerBaseDelay + index * staggerIncrement}ms`
}

// Skeleton colors
const skeletonColors = SKELETON_COLORS

// CSS duration values
const shimmerDurationSec = SKELETON_CONFIG.shimmerDurationSec
const pulseDurationSec = SKELETON_CONFIG.pulseDurationSec
const cardEnterDurationSec = SKELETON_CONFIG.cardEnterDurationSec
const reducedMotionEnterDurationSec =
  SKELETON_CONFIG.reducedMotionEnterDurationSec

// 🎯 Flexy: Modular easing values from config - no more hardcoded cubic-bezier!
const easingValues = computed(() => ({
  materialStandard: EASING.MATERIAL_STANDARD,
  materialSharp: EASING.MATERIAL_SHARP,
  springSnappy: EASING.SPRING_SNAPPY,
}))

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
</script>

<style scoped>
/* 🎨 Palette: Interactive skeleton card with hover response */
.skeleton-interactive {
  transition:
    transform var(--hover-transition) v-bind('easingValues.materialStandard'),
    box-shadow var(--hover-transition) v-bind('easingValues.materialStandard');
  cursor: progress;
  --hover-transition: v-bind('animationConfig.cssTransitions.hoverSec');
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
    shimmer v-bind('shimmerDurationSec') ease-in-out infinite,
    breathe v-bind('animationConfig.cssAnimations.longDurationSec') ease-in-out
      infinite;
  transition: filter v-bind('animationConfig.cssTransitions.standardSec') ease;
}

/* 🎨 Palette: Hover glow effect on shimmer elements */
.skeleton-interactive:hover .skeleton-shimmer {
  filter: brightness(1.05) saturate(1.1);
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

.skeleton-icon {
  background: linear-gradient(
    90deg,
    var(--skeleton-icon-start) 0%,
    var(--skeleton-icon-mid) 25%,
    var(--skeleton-icon-end) 50%,
    var(--skeleton-icon-mid) 75%,
    var(--skeleton-icon-start) 100%
  );
  background-size: 200% 100%;
  animation:
    shimmer v-bind('shimmerDurationSec') ease-in-out infinite,
    breathe v-bind('animationConfig.cssAnimations.longDurationSec') ease-in-out
      infinite,
    icon-pulse 4s ease-in-out infinite;
  transition: transform v-bind('animationConfig.cssTransitions.slowSec')
    v-bind('easingValues.springSnappy');
}

/* 🎨 Palette: Icon hover interaction */
.skeleton-interactive:hover .skeleton-icon {
  transform: scale(1.08);
}

/* Icon-specific subtle pulse */
@keyframes icon-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(209, 213, 219, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(209, 213, 219, 0);
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

/* Pulse animation for reduced motion fallback */
.skeleton-pulse {
  animation: pulse v-bind('pulseDurationSec')
    v-bind('easingValues.materialSharp') infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 🎨 Palette: Enhanced card entrance with spring physics */
.skeleton-card {
  animation: springFadeIn v-bind('cardEnterDurationSec')
    v-bind('easingValues.springSnappy');
}

@keyframes springFadeIn {
  0% {
    opacity: 0;
    transform: translateY(var(--card-enter-start-translate-y))
      scale(var(--card-enter-start-scale));
    filter: blur(2px);
  }
  60% {
    opacity: 1;
    transform: translateY(var(--card-enter-mid-translate-y))
      scale(var(--card-enter-mid-scale));
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

/* Wave shimmer effect - coordinates multiple items for a flowing wave pattern */
/* This creates a more cohesive and polished loading experience */
.skeleton-wave {
  animation:
    shimmer v-bind('shimmerDurationSec') ease-in-out infinite,
    wave-pulse var(--wave-duration) ease-in-out infinite,
    breathe 3s ease-in-out infinite;
  animation-delay:
    calc(var(--wave-index) * var(--wave-stagger)),
    calc(var(--wave-index) * var(--wave-stagger)),
    calc(var(--wave-index) * 0.1s);
  transition:
    transform 0.3s v-bind('easingValues.materialStandard'),
    opacity 0.3s ease;
}

/* 🎨 Palette: Staggered hover effect for wave items */
.skeleton-interactive:hover .skeleton-wave {
  animation-duration:
    calc(v-bind('shimmerDurationSec') * 0.8), calc(var(--wave-duration) * 0.8);
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

/* Reduced motion support - accessibility first */
@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer,
  .skeleton-icon,
  .skeleton-wave {
    animation: none;
    background: var(--skeleton-reduced-light);
    transition: none;
  }

  .skeleton-icon {
    background: var(--skeleton-reduced-icon);
  }

  .skeleton-card {
    animation: simpleFadeIn v-bind('reducedMotionEnterDurationSec') ease-out;
    transform: none !important;
    box-shadow: none !important;
  }

  .skeleton-interactive:hover {
    transform: none !important;
    box-shadow: none !important;
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

  .skeleton-icon {
    background: #595959;
    animation: highContrastPulse 2s ease-in-out infinite;
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
