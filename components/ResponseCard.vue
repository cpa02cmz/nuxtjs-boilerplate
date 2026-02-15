<template>
  <div
    class="rounded-lg p-4 transition-all duration-300 hover:shadow-md"
    :class="[cardClass, { 'animate-fade-in': !prefersReducedMotion }]"
    :style="animationStyle"
  >
    <div class="flex items-center justify-between mb-3">
      <h3 :class="titleClass">
        {{ title }}
      </h3>
      <CopyButton
        :content="code"
        :label="`Copy ${title.toLowerCase()} example`"
        @copied="$emit('copied')"
      />
    </div>
    <div
      class="bg-white rounded border p-3 overflow-x-auto"
      :class="borderClass"
    >
      <pre
        class="font-mono text-xs leading-relaxed"
        :class="codeClass"
      ><code>{{ code }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { animationConfig } from '~/configs/animation.config'

interface Props {
  type: 'success' | 'error'
  code: string
  title: string
  delay?: number
}

const props = defineProps<Props>()
defineEmits<{
  copied: []
}>()

const cardClass = computed(() => {
  return props.type === 'success'
    ? 'bg-green-50 border border-green-200 hover:border-green-300'
    : 'bg-red-50 border border-red-200 hover:border-red-300'
})

const titleClass = computed(() => {
  return props.type === 'success'
    ? 'font-medium text-green-800'
    : 'font-medium text-red-800'
})

const borderClass = computed(() => {
  return props.type === 'success' ? 'border-green-200' : 'border-red-200'
})

const codeClass = computed(() => {
  return props.type === 'success' ? 'text-green-900' : 'text-red-900'
})

const prefersReducedMotion = computed(() => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

const animationStyle = computed(() => {
  if (prefersReducedMotion.value || props.delay === undefined) return {}
  return {
    // Flexy hates hardcoded 150! Using config instead
    animationDelay: `${props.delay * animationConfig.staggerDelayMultipliers.standardMs}ms`,
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
