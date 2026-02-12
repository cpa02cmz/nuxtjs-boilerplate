<template>
  <div
    class="flex flex-col items-center justify-center py-16 px-4 text-center"
    role="status"
    aria-live="polite"
  >
    <!-- Animated Illustration -->
    <div
      class="relative w-48 h-48 mb-8"
      aria-hidden="true"
    >
      <!-- Background Circle -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full animate-pulse-slow"
      />

      <!-- Search Icon Container -->
      <div
        class="absolute inset-0 flex items-center justify-center"
        :class="{ 'animate-bounce-subtle': !reducedMotion }"
      >
        <svg
          class="w-24 h-24 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- Magnifying Glass -->
          <circle
            cx="11"
            cy="11"
            r="7"
            stroke-width="1.5"
            class="origin-center"
            :class="{ 'animate-draw': !reducedMotion }"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M21 21l-4.35-4.35"
            class="origin-bottom-left"
            :class="{ 'animate-draw-delayed': !reducedMotion }"
          />

          <!-- Decorative Elements -->
          <circle
            cx="11"
            cy="11"
            r="2"
            fill="currentColor"
            class="opacity-20"
          />
        </svg>
      </div>

      <!-- Floating Elements -->
      <div
        v-if="!reducedMotion"
        class="absolute top-4 right-4 w-3 h-3 bg-gray-300 rounded-full animate-float"
      />
      <div
        v-if="!reducedMotion"
        class="absolute bottom-8 left-6 w-2 h-2 bg-gray-300 rounded-full animate-float-delayed"
      />
    </div>

    <!-- Title -->
    <h3 class="text-2xl font-bold text-gray-900 mb-3">
      {{ title }}
    </h3>

    <!-- Description -->
    <p class="text-gray-500 max-w-md mb-8 text-lg leading-relaxed">
      {{ description }}
    </p>

    <!-- Suggestions Section -->
    <div
      v-if="suggestions.length"
      class="w-full max-w-lg mb-8"
    >
      <p
        class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4"
      >
        {{ contentConfig.search.emptyState.tryThese }}
      </p>
      <div class="flex flex-wrap justify-center gap-2">
        <button
          v-for="(suggestion, index) in suggestions"
          :key="index"
          :aria-label="`Search for ${suggestion}`"
          class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          :style="{
            animationDelay: `${index * animationConfig.emptyStateStagger.baseDelayMs}ms`,
          }"
          :class="{ 'animate-fade-in-up': !reducedMotion }"
          @click="$emit('suggestion-click', suggestion)"
        >
          <svg
            class="w-4 h-4 mr-2 text-gray-400"
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
          {{ suggestion }}
        </button>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-3">
      <button
        v-if="showReset"
        class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        @click="$emit('reset')"
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
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {{ contentConfig.emptyState.buttons.reset }}
      </button>

      <button
        v-if="showBrowseAll"
        class="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-transparent hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
        @click="$emit('browse-all')"
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
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        {{ contentConfig.emptyState.buttons.browseAll }}
      </button>
    </div>

    <!-- Tips Section -->
    <div
      v-if="showTips"
      class="mt-10 p-4 bg-gray-50 rounded-xl max-w-lg"
    >
      <div class="flex items-start">
        <svg
          class="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div class="text-left">
          <p class="text-sm font-medium text-gray-900 mb-1">
            {{ contentConfig.emptyState.tips.title }}
          </p>
          <ul class="text-sm text-gray-500 space-y-1">
            <li>• {{ contentConfig.emptyState.tips.fewerFilters }}</li>
            <li>• {{ contentConfig.emptyState.tips.synonyms }}</li>
            <li>• {{ contentConfig.emptyState.tips.spelling }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { animationConfig } from '../configs/animation.config'
import { contentConfig } from '../configs/content.config'

interface Props {
  title?: string
  description?: string
  suggestions?: string[]
  showReset?: boolean
  showBrowseAll?: boolean
  showTips?: boolean
}

withDefaults(defineProps<Props>(), {
  title: contentConfig.searchResults.noResults.title,
  description: contentConfig.searchResults.noResults.message,
  suggestions: () => [],
  showReset: true,
  showBrowseAll: true,
  showTips: true,
})

defineEmits<{
  (e: 'reset'): void
  (e: 'browse-all'): void
  (e: 'suggestion-click', suggestion: string): void
}>()

// Respect user's motion preferences
const reducedMotion = computed(() => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
})
</script>

<style scoped>
@keyframes draw {
  from {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
  }
  to {
    stroke-dasharray: 100;
    stroke-dashoffset: 0;
  }
}

@keyframes draw-delayed {
  0%,
  30% {
    stroke-dasharray: 20;
    stroke-dashoffset: 20;
    opacity: 0;
  }
  100% {
    stroke-dasharray: 20;
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.1);
  }
}

@keyframes float-delayed {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.05);
  }
}

@keyframes pulse-slow {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.02);
  }
}

@keyframes bounce-subtle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-draw {
  animation: draw v-bind('`${animationConfig.emptyState.floatDurationSec}s`')
    ease-out forwards;
}

.animate-draw-delayed {
  animation: draw-delayed
    v-bind('`${animationConfig.emptyState.floatDelaySec + 0.8}s`') ease-out
    forwards;
}

.animate-float {
  animation: float v-bind('`${animationConfig.emptyState.floatDurationSec}s`')
    ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed
    v-bind('`${animationConfig.emptyState.floatDelaySec + 3}s`') ease-in-out
    infinite;
  animation-delay: v-bind('`${animationConfig.emptyState.staggerDelayMs}ms`');
}

.animate-pulse-slow {
  animation: pulse-slow
    v-bind('`${animationConfig.emptyState.ringDurationSec}s`') ease-in-out
    infinite;
}

.animate-bounce-subtle {
  animation: bounce-subtle
    v-bind('`${animationConfig.emptyState.iconPulseDurationSec}s`') ease-in-out
    infinite;
}

.animate-fade-in-up {
  animation: fade-in-up
    v-bind('`${animationConfig.emptyState.particleDelaySec}s`') ease-out
    forwards;
  opacity: 0;
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .animate-draw,
  .animate-draw-delayed,
  .animate-float,
  .animate-float-delayed,
  .animate-pulse-slow,
  .animate-bounce-subtle,
  .animate-fade-in-up {
    animation: none;
    opacity: 1;
  }
}
</style>
