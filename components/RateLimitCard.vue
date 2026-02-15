<template>
  <div
    class="bg-white rounded-lg border border-gray-200 p-4 transition-all duration-300 hover:shadow-md hover:border-gray-300"
    :class="{ 'animate-fade-in': !prefersReducedMotion }"
    :style="animationStyle"
  >
    <div class="flex items-center gap-3 mb-2">
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center"
        :class="iconBgClass"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          :class="iconColorClass"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            v-if="type === 'general'"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
          <path
            v-else-if="type === 'search'"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>
      <h4 class="font-semibold text-gray-800 capitalize">
        {{ type }}
      </h4>
    </div>
    <div class="flex items-baseline gap-1">
      <span class="text-2xl font-bold text-gray-900">{{ limit }}</span>
    </div>
    <p class="text-sm text-gray-500 mt-1">
      {{ unit }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { animationConfig } from '~/configs/animation.config'

interface Props {
  type: 'general' | 'search' | 'submission'
  limit: string
  unit: string
  delay?: number
}

const props = defineProps<Props>()

const iconBgClass = computed(() => {
  const classes = {
    general: 'bg-blue-100',
    search: 'bg-purple-100',
    submission: 'bg-orange-100',
  }
  return classes[props.type]
})

const iconColorClass = computed(() => {
  const classes = {
    general: 'text-blue-600',
    search: 'text-purple-600',
    submission: 'text-orange-600',
  }
  return classes[props.type]
})

const prefersReducedMotion = computed(() => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

const animationStyle = computed(() => {
  if (prefersReducedMotion.value || props.delay === undefined) return {}
  return {
    // Flexy hates hardcoded 100! Using config instead
    animationDelay: `${props.delay * animationConfig.staggerDelayMultipliers.fastMs}ms`,
  }
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  opacity: 0;
  animation: fade-in 0.4s ease-out forwards;
}

@media (prefers-reduced-motion: reduce) {
  .animate-fade-in {
    animation: none !important;
    opacity: 1;
  }
}
</style>
