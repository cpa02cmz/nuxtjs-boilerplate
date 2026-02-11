<template>
  <div
    class="bg-white p-6 rounded-lg shadow border border-gray-200 skeleton-filter-sidebar"
    aria-busy="true"
    aria-label="Loading filters"
    :style="{
      '--skeleton-light-start': skeletonColors.light.start,
      '--skeleton-light-mid': skeletonColors.light.middle,
      '--skeleton-light-end': skeletonColors.light.end,
      '--skeleton-reduced-light': skeletonColors.reducedMotion.light,
    }"
  >
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <div
        class="skeleton-shimmer h-6 rounded w-20 skeleton-item"
        :style="{ animationDelay: getStaggerDelay(0) }"
        aria-hidden="true"
      />
      <div
        class="skeleton-shimmer h-5 rounded w-16 skeleton-item"
        :style="{ animationDelay: getStaggerDelay(1) }"
        aria-hidden="true"
      />
    </div>

    <!-- Category Section -->
    <div class="mb-6">
      <div
        class="skeleton-shimmer h-5 rounded w-24 mb-3 skeleton-item"
        :style="{ animationDelay: getStaggerDelay(2) }"
        aria-hidden="true"
      />
      <div class="space-y-2">
        <div
          v-for="i in 5"
          :key="`category-${i}`"
          class="flex items-center"
        >
          <div
            class="skeleton-shimmer h-4 w-4 rounded skeleton-item mr-2 flex-shrink-0"
            :style="{ animationDelay: getStaggerDelay(3 + i) }"
            aria-hidden="true"
          />
          <div
            class="skeleton-shimmer h-4 rounded skeleton-item flex-1"
            :style="{
              animationDelay: getStaggerDelay(3 + i),
              width: `${getRandomWidth(60, 90)}%`,
            }"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>

    <!-- Pricing Model Section -->
    <div class="mb-6">
      <div
        class="skeleton-shimmer h-5 rounded w-32 mb-3 skeleton-item"
        :style="{ animationDelay: getStaggerDelay(9) }"
        aria-hidden="true"
      />
      <div class="space-y-2">
        <div
          v-for="i in 3"
          :key="`pricing-${i}`"
          class="flex items-center"
        >
          <div
            class="skeleton-shimmer h-4 w-4 rounded skeleton-item mr-2 flex-shrink-0"
            :style="{ animationDelay: getStaggerDelay(10 + i) }"
            aria-hidden="true"
          />
          <div
            class="skeleton-shimmer h-4 rounded skeleton-item flex-1"
            :style="{
              animationDelay: getStaggerDelay(10 + i),
              width: `${getRandomWidth(50, 80)}%`,
            }"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>

    <!-- Difficulty Section -->
    <div class="mb-6">
      <div
        class="skeleton-shimmer h-5 rounded w-20 mb-3 skeleton-item"
        :style="{ animationDelay: getStaggerDelay(14) }"
        aria-hidden="true"
      />
      <div class="space-y-2">
        <div
          v-for="i in 4"
          :key="`difficulty-${i}`"
          class="flex items-center"
        >
          <div
            class="skeleton-shimmer h-4 w-4 rounded skeleton-item mr-2 flex-shrink-0"
            :style="{ animationDelay: getStaggerDelay(15 + i) }"
            aria-hidden="true"
          />
          <div
            class="skeleton-shimmer h-4 rounded skeleton-item flex-1"
            :style="{
              animationDelay: getStaggerDelay(15 + i),
              width: `${getRandomWidth(55, 85)}%`,
            }"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>

    <!-- Date Added Section -->
    <div class="mb-6">
      <div
        class="skeleton-shimmer h-5 rounded w-24 mb-3 skeleton-item"
        :style="{ animationDelay: getStaggerDelay(20) }"
        aria-hidden="true"
      />
      <div class="space-y-2">
        <div
          v-for="i in 4"
          :key="`date-${i}`"
          class="flex items-center"
        >
          <div
            class="skeleton-shimmer h-4 w-4 rounded-full skeleton-item mr-2 flex-shrink-0"
            :style="{ animationDelay: getStaggerDelay(21 + i) }"
            aria-hidden="true"
          />
          <div
            class="skeleton-shimmer h-4 rounded skeleton-item flex-1"
            :style="{
              animationDelay: getStaggerDelay(21 + i),
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
// Skeleton loading component for Filter Sidebar
// Provides visual placeholder while filter categories and options load
import { animationConfig } from '~/configs/animation.config'
import { componentColorsConfig } from '~/configs/component-colors.config'

// Animation timing configuration - Flexy hates hardcoded values!
const staggerBaseDelay = animationConfig.skeleton.staggerDelayMs
const staggerIncrement = animationConfig.skeleton.staggerIncrementMs

// Calculate stagger delays for each item
const getStaggerDelay = (index: number): string => {
  return `${staggerBaseDelay + index * staggerIncrement}ms`
}

// Generate random width for variety (prevents repetitive visual pattern)
const getRandomWidth = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Flexy hates hardcoded colors! Using config values for skeleton colors
const skeletonColors = {
  light: componentColorsConfig.skeleton.light,
  reducedMotion: componentColorsConfig.skeleton.reducedMotion,
}
</script>

<style scoped>
/* Skeleton shimmer effect with gradient - Flexy hates hardcoded colors! */
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
  animation: shimmer 1.5s ease-in-out infinite;
}

/* Staggered animation delays are set via inline styles using animationConfig */
/* Flexy loves modularity! No more hardcoded animation-delay values */

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Card entrance animation */
.skeleton-filter-sidebar {
  animation: fadeIn 0.3s ease-out;
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

/* Reduced motion support - Flexy hates hardcoded colors! */
@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer {
    animation: none;
    background: var(--skeleton-reduced-light);
  }

  .skeleton-filter-sidebar {
    animation: fadeIn 0.2s ease-out;
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
