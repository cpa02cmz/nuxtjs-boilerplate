<template>
  <div
    :class="[
      'skeleton-loader',
      'animate-pulse',
      size === 'small'
        ? 'h-4'
        : size === 'medium'
          ? 'h-6'
          : size === 'large'
            ? 'h-8'
            : 'h-4',
      widthClass,
      rounded ? 'rounded-full' : 'rounded',
    ]"
    :style="{ width: customWidth ? customWidth : undefined }"
    role="status"
    aria-label="Loading..."
    aria-live="polite"
    aria-busy="true"
  >
    <span class="sr-only">Loading content...</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'small' | 'medium' | 'large'
  width?: 'full' | 'half' | 'quarter' | 'auto'
  customWidth?: string
  rounded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  width: 'auto',
  customWidth: undefined,
  rounded: false,
})

const widthClass = computed(() => {
  if (props.customWidth) return ''
  switch (props.width) {
    case 'full':
      return 'w-full'
    case 'half':
      return 'w-1/2'
    case 'quarter':
      return 'w-1/4'
    default:
      return ''
  }
})
</script>

<style scoped>
.skeleton-loader {
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Respect reduced motion preferences for accessibility */
@media (prefers-reduced-motion: reduce) {
  .skeleton-loader {
    animation: none;
    background: #e5e7eb;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .skeleton-loader {
    background: #d1d5db;
    border: 1px solid #9ca3af;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .skeleton-loader {
    background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
    background-size: 200% 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton-loader {
      background: #374151;
    }
  }
}
</style>
