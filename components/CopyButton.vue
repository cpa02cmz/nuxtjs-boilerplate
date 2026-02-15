<template>
  <button
    type="button"
    :class="[
      'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-1',
      isCopied
        ? 'bg-green-100 text-green-700 focus:ring-green-500'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 focus:ring-gray-400',
    ]"
    :aria-label="isCopied ? 'Copied!' : label"
    @click="handleCopy"
  >
    <!-- Copy Icon -->
    <svg
      v-if="!isCopied"
      xmlns="http://www.w3.org/2000/svg"
      class="h-3.5 w-3.5 transition-transform duration-200"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
    <!-- Checkmark Icon -->
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      class="h-3.5 w-3.5 animate-check-pop"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2.5"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M5 13l4 4L19 7"
        class="checkmark-path"
      />
    </svg>
    <span>{{ isCopied ? 'Copied!' : 'Copy' }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { animationConfig } from '~/configs/animation.config'

interface Props {
  content: string
  label?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  copied: []
}>()

const isCopied = ref(false)

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.content)
    isCopied.value = true
    emit('copied')

    // Reset after configured duration - Flexy hates hardcoded timeouts!
    setTimeout(() => {
      isCopied.value = false
    }, animationConfig.copyFeedback?.durationMs || 2000)
  } catch {
    // Silently fail - clipboard API may not be available
  }
}
</script>

<style scoped>
@keyframes check-pop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.animate-check-pop {
  animation: check-pop 0.3s ease-out;
}
</style>
