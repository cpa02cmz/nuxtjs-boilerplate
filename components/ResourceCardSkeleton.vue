<template>
  <article
    class="bg-white p-6 rounded-lg shadow skeleton-card"
    aria-busy="true"
    aria-label="Loading resource card"
  >
    <div class="flex items-start">
      <!-- Icon placeholder -->
      <div class="flex-shrink-0 mr-4">
        <div
          class="skeleton-icon skeleton-shimmer rounded w-12 h-12"
          :style="{ animationDelay: getStaggerDelay(0) }"
          aria-hidden="true"
        />
      </div>
      <div class="flex-1 min-w-0">
        <!-- Title placeholder -->
        <div
          class="skeleton-shimmer h-5 rounded w-3/4 mb-3 skeleton-item"
          :style="{ animationDelay: getStaggerDelay(1) }"
          aria-hidden="true"
        />

        <!-- Description placeholder -->
        <div
          class="skeleton-shimmer h-4 rounded w-full mb-2 skeleton-item"
          :style="{ animationDelay: getStaggerDelay(2) }"
          aria-hidden="true"
        />
        <div
          class="skeleton-shimmer h-4 rounded w-5/6 mb-4 skeleton-item"
          :style="{ animationDelay: getStaggerDelay(3) }"
          aria-hidden="true"
        />

        <!-- Benefits section -->
        <div class="mt-3 bg-gray-50 p-3 rounded-md">
          <div
            class="skeleton-shimmer h-4 rounded w-1/3 mb-3 skeleton-item"
            :style="{ animationDelay: getStaggerDelay(4) }"
            aria-hidden="true"
          />
          <div class="space-y-2">
            <div
              class="skeleton-shimmer h-3 rounded w-full skeleton-item"
              :style="{ animationDelay: getStaggerDelay(5) }"
              aria-hidden="true"
            />
            <div
              class="skeleton-shimmer h-3 rounded w-4/5 skeleton-item"
              :style="{ animationDelay: getStaggerDelay(6) }"
              aria-hidden="true"
            />
            <div
              class="skeleton-shimmer h-3 rounded w-3/4 skeleton-item"
              :style="{ animationDelay: getStaggerDelay(7) }"
              aria-hidden="true"
            />
          </div>
        </div>

        <!-- Button placeholder -->
        <div class="mt-4">
          <div
            class="skeleton-shimmer h-8 rounded-md w-32 skeleton-item"
            :style="{ animationDelay: getStaggerDelay(8) }"
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
import { animationConfig } from '~/configs/animation.config'

// Animation timing configuration - Flexy hates hardcoded values!
const staggerBaseDelay = animationConfig.skeleton.staggerDelayMs
const staggerIncrement = animationConfig.skeleton.staggerIncrementMs

// Calculate stagger delays for each item
const getStaggerDelay = (index: number): string => {
  return `${staggerBaseDelay + index * staggerIncrement}ms`
}
</script>

<style scoped>
/* Skeleton shimmer effect with gradient */
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    #e5e7eb 0%,
    #f3f4f6 25%,
    #e5e7eb 50%,
    #f3f4f6 75%,
    #e5e7eb 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-icon {
  background: linear-gradient(
    90deg,
    #d1d5db 0%,
    #e5e7eb 25%,
    #d1d5db 50%,
    #e5e7eb 75%,
    #d1d5db 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

/* Staggered animation delays are now set via inline styles using animationConfig */
/* Flexy loves modularity! No more hardcoded animation-delay values */

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
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer,
  .skeleton-icon {
    animation: none;
    background: #e5e7eb;
  }

  .skeleton-icon {
    background: #d1d5db;
  }

  .skeleton-card {
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
