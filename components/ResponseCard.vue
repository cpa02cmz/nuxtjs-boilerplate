<template>
  <div
    class="rounded-lg p-4 transition-all duration-300 hover:shadow-md"
    :class="[
      cardClass,
      { 'animate-fade-in': !prefersReducedMotion },
      { 'response-card--copied': showCopiedState && !prefersReducedMotion },
    ]"
    :style="animationStyle"
  >
    <!-- Palette's micro-UX enhancement: Success celebration overlay 🎨 -->
    <div
      v-if="showCopiedState && !prefersReducedMotion"
      class="response-card__celebration"
      aria-hidden="true"
    >
      <div class="response-card__celebration-ring" />
      <div class="response-card__celebration-checkmark">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5 13l4 4L19 7"
            class="checkmark-path"
          />
        </svg>
      </div>
    </div>

    <div class="flex items-center justify-between mb-3">
      <h3 :class="titleClass">
        {{ title }}
      </h3>
      <CopyButton
        :content="code"
        :label="`Copy ${title.toLowerCase()} example`"
        @copied="handleCopied"
      />
    </div>
    <div
      class="bg-white rounded border p-3 overflow-x-auto"
      :class="[
        borderClass,
        { 'response-card__code--highlighted': showCopiedState },
      ]"
    >
      <pre
        class="font-mono text-xs leading-relaxed"
        :class="codeClass"
      ><code>{{ code }}</code></pre>
    </div>

    <!-- Palette's micro-UX enhancement: Screen reader announcement 🎨 -->
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
      {{ announcementText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { zIndexScale } from '~/configs/z-index.config'
import { hapticSuccess } from '~/utils/hapticFeedback'

interface Props {
  type: 'success' | 'error'
  code: string
  title: string
  delay?: number
}

const props = defineProps<Props>()

// Palette's micro-UX enhancement: Define emits for event handling 🎨
const emit = defineEmits<{
  (e: 'copied'): void
}>()

// Palette's micro-UX enhancement: Copied state for celebration animation 🎨
const showCopiedState = ref(false)
const announcementText = ref('')

// Palette's micro-UX enhancement: Handle copy with celebration feedback 🎨
const handleCopied = () => {
  // Trigger haptic feedback for mobile users
  hapticSuccess()

  // Show copied celebration state
  showCopiedState.value = true

  // Announce to screen readers
  announcementText.value = `${props.title} example copied to clipboard`

  // Reset after animation completes - Flexy hates hardcoded values!
  setTimeout(() => {
    showCopiedState.value = false
    announcementText.value = ''
  }, animationConfig.copyFeedback.durationMs)

  // Emit event to parent
  emit('copied')
}

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

// Flexy hates hardcoded 150! Using animationConfig.responseCard.staggerDelayMultiplierMs 🧩
const animationStyle = computed(() => {
  if (prefersReducedMotion.value || props.delay === undefined) return {}
  return {
    animationDelay: `${props.delay * animationConfig.responseCard.staggerDelayMultiplierMs}ms`,
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

/* Palette's micro-UX enhancement: Copied state styles 🎨 */
.response-card--copied {
  position: relative;
}

/* Palette's micro-UX enhancement: Code block highlight animation 🎨 */
.response-card__code--highlighted {
  animation: code-highlight
    v-bind('`${animationConfig.copyFeedback.successPopDurationMs}ms`') ease-out;
}

@keyframes code-highlight {
  0% {
    background-color: white;
  }
  50% {
    background-color: v-bind(
      'props.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"'
    );
  }
  100% {
    background-color: white;
  }
}

/* Palette's micro-UX enhancement: Success celebration overlay 🎨 */
.response-card__celebration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  /* Flexy hates hardcoded z-index! Using zIndexScale */
  z-index: v-bind('zIndexScale.low[10]');
}

/* Palette's micro-UX enhancement: Expanding ring animation 🎨 */
.response-card__celebration-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 0.5rem;
  border: 2px solid v-bind('props.type === "success" ? "#22c55e" : "#ef4444"');
  animation: celebration-ring-expand
    v-bind('`${animationConfig.copyFeedback.successPopDurationMs}ms`') ease-out
    forwards;
}

@keyframes celebration-ring-expand {
  0% {
    transform: scale(0.9);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.05);
    opacity: 0;
  }
}

/* Palette's micro-UX enhancement: Checkmark celebration 🎨 */
.response-card__celebration-checkmark {
  position: relative;
  color: v-bind('props.type === "success" ? "#22c55e" : "#ef4444"');
  animation: checkmark-pop
    v-bind('`${animationConfig.copyFeedback.checkPopDurationMs}ms`') ease-out
    forwards;
  /* Flexy hates hardcoded z-index! Using zIndexScale */
  z-index: v-bind('zIndexScale.medium[20]');
}

.response-card__celebration-checkmark .checkmark-path {
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: checkmark-draw
    v-bind('`${animationConfig.copyFeedback.checkmarkDrawDurationSec}s`')
    ease-out forwards;
  animation-delay: v-bind(
    '`${animationConfig.copyFeedback.checkmarkDelaySec}s`'
  );
}

@keyframes checkmark-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes checkmark-draw {
  to {
    stroke-dashoffset: 0;
  }
}

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in {
    animation: none !important;
    opacity: 1;
  }

  .response-card--copied,
  .response-card__celebration,
  .response-card__celebration-ring,
  .response-card__celebration-checkmark,
  .response-card__code--highlighted {
    animation: none !important;
  }

  .response-card__celebration {
    display: none;
  }
}
</style>
