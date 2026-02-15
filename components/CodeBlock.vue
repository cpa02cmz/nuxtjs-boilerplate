<template>
  <div
    class="relative group"
    :class="{ 'animate-slide-in': !prefersReducedMotion }"
    :style="animationStyle"
  >
    <div
      class="bg-gray-900 rounded-lg overflow-hidden shadow-md transition-shadow duration-300 group-hover:shadow-lg"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700"
      >
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-red-500" aria-hidden="true" />
          <span class="w-3 h-3 rounded-full bg-yellow-500" aria-hidden="true" />
          <span class="w-3 h-3 rounded-full bg-green-500" aria-hidden="true" />
          <span class="ml-2 text-xs text-gray-400 font-mono">{{ label }}</span>
        </div>
        <CopyButton
          :content="code"
          :label="`Copy ${label} code`"
          @copied="$emit('copied')"
        />
      </div>
      <!-- Code Content -->
      <div class="p-4 overflow-x-auto">
        <pre
          class="font-mono text-sm text-gray-100 leading-relaxed"
        ><code>{{ code }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  code: string
  label?: string
  delay?: number
}

const props = defineProps<Props>()
defineEmits<{
  copied: []
}>()

const prefersReducedMotion = computed(() => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

const animationStyle = computed(() => {
  if (prefersReducedMotion.value || props.delay === undefined) return {}
  return {
    animationDelay: `${props.delay * 100}ms`,
  }
})
</script>

<style scoped>
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in {
  opacity: 0;
  animation: slide-in 0.4s ease-out forwards;
}

@media (prefers-reduced-motion: reduce) {
  .animate-slide-in {
    animation: none !important;
    opacity: 1;
  }
}
</style>
