<template>
  <article
    class="bg-white p-6 rounded-lg shadow skeleton-card"
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
    }"
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
// Skeleton loading component for ResourceCard
// Enhanced with wave shimmer animation for better perceived performance
// BroCula fixed SSR issues! 🦇 All values are now SSR-safe.

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
</script>

<style scoped>
/* Skeleton shimmer effect with gradient */
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
  animation: shimmer v-bind('shimmerDurationSec') ease-in-out infinite;
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
  animation: shimmer v-bind('shimmerDurationSec') ease-in-out infinite;
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
  animation: pulse v-bind('pulseDurationSec') cubic-bezier(0.4, 0, 0.6, 1)
    infinite;
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

/* Card entrance animation */
.skeleton-card {
  animation: fadeIn v-bind('cardEnterDurationSec') ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Wave shimmer effect - coordinates multiple items for a flowing wave pattern */
/* This creates a more cohesive and polished loading experience */
.skeleton-wave {
  animation:
    shimmer v-bind('shimmerDurationSec') ease-in-out infinite,
    wave-pulse var(--wave-duration) ease-in-out infinite;
  animation-delay:
    calc(var(--wave-index) * var(--wave-stagger)),
    calc(var(--wave-index) * var(--wave-stagger));
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

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer,
  .skeleton-icon {
    animation: none;
    background: var(--skeleton-reduced-light);
  }

  .skeleton-icon {
    background: var(--skeleton-reduced-icon);
  }

  .skeleton-wave {
    animation: none;
    background: var(--skeleton-reduced-light);
  }

  .skeleton-card {
    animation: fadeIn v-bind('reducedMotionEnterDurationSec') ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}
</style>
