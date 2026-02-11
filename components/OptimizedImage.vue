<template>
  <div
    class="optimized-image-wrapper"
    :class="{ 'is-loading': !isLoaded, 'has-error': hasError }"
    :aria-busy="!isLoaded && !hasError ? 'true' : 'false'"
    role="img"
    :aria-label="alt"
  >
    <div
      v-if="!isLoaded && !hasError"
      class="skeleton-placeholder"
      aria-hidden="true"
    >
      <div class="skeleton-shimmer" />
    </div>
    <NuxtImg
      ref="imageRef"
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :format="format"
      :loading="loading"
      :sizes="sizes"
      :quality="quality"
      :class="['optimized-image', { 'is-loaded': isLoaded }, imgClass]"
      @error="handleError"
      @load="handleLoad"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { animationConfig } from '~/configs/animation.config'

interface Props {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'gif'
  loading?: 'lazy' | 'eager'
  sizes?: string
  quality?: number | string
  imgClass?: string
}

defineProps<Props>()

const emit = defineEmits<{
  load: []
  error: [event: string | Event]
}>()

const isLoaded = ref(false)
const hasError = ref(false)
const imageRef = useTemplateRef('imageRef')

const handleError = (event: string | Event) => {
  hasError.value = true
  isLoaded.value = true
  emit('error', event)
}

const handleLoad = () => {
  isLoaded.value = true
  hasError.value = false
  emit('load')
}
</script>

<style scoped>
.optimized-image-wrapper {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.skeleton-placeholder {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer v-bind('animationConfig.skeleton.imageShimmerDurationSec')
    infinite;
}

/* Dark mode support for skeleton placeholder */
:global(.dark) .skeleton-placeholder {
  background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.optimized-image {
  opacity: 0;
  transition: opacity v-bind('animationConfig.skeleton.imageFadeInDurationSec')
    ease-in-out;
}

.optimized-image.is-loaded {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-placeholder {
    animation: none;
    background: #f0f0f0;
  }

  :global(.dark) .skeleton-placeholder {
    background: #374151;
  }

  .optimized-image {
    transition: none;
  }

  .optimized-image.is-loaded {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .optimized-image-wrapper.is-loading {
    animation: subtle-pulse
      v-bind('animationConfig.skeleton.subtlePulseDurationSec') ease-in-out
      infinite;
  }

  @keyframes subtle-pulse {
    0%,
    100% {
      filter: brightness(1);
    }
    50% {
      filter: brightness(0.98);
    }
  }
}
</style>
