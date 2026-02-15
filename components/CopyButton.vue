<template>
  <div class="relative inline-flex">
    <Tooltip
      :content="isCopied ? copiedTooltipText : copyTooltipText"
      position="top"
      :delay="tooltipDelayMs"
    >
      <button
        ref="buttonRef"
        type="button"
        :class="[
          'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-1 relative overflow-hidden',
          isCopied
            ? 'bg-green-100 text-green-700 focus:ring-green-500'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 focus:ring-gray-400',
        ]"
        :aria-label="isCopied ? copiedAriaLabel : label"
        @click="handleCopyWithRipple"
      >
        <!-- Copy Icon -->
        <svg
          v-if="!isCopied"
          xmlns="http://www.w3.org/2000/svg"
          :class="[
            'h-3.5 w-3.5 transition-transform duration-200',
            isHovering && !prefersReducedMotion ? 'animate-icon-wiggle' : '',
          ]"
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
        <span>{{ isCopied ? copiedButtonText : copyButtonText }}</span>
      </button>
    </Tooltip>

    <!-- Screen reader live region for copy status announcement -->
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
      {{ announcementText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue'
import Tooltip from './Tooltip.vue'
import { useRipple } from '~/composables/useRipple'
import { animationConfig } from '~/configs/animation.config'
import { contentConfig } from '~/configs/content.config'
import { hapticSuccess, hapticError } from '~/utils/hapticFeedback'

interface Props {
  content: string
  label?: string
  copyText?: string
  copiedText?: string
  tooltipDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: contentConfig.copyButton.defaultLabel,
  copyText: contentConfig.copyButton.copy,
  copiedText: contentConfig.copyButton.copied,
  tooltipDelay: animationConfig.tooltip.showDelayMs,
})

const emit = defineEmits<{
  copied: []
}>()

const isCopied = ref(false)
const isHovering = ref(false)
const announcementText = ref('')
const prefersReducedMotion = ref(false)
const buttonRef = ref<HTMLButtonElement | null>(null)

// Tooltip text computed from props or config
const copyTooltipText = contentConfig.copyButton.tooltip.copy
const copiedTooltipText = contentConfig.copyButton.tooltip.copied
const copyButtonText = props.copyText
const copiedButtonText = props.copiedText
const copiedAriaLabel = contentConfig.copyButton.aria.copied
const tooltipDelayMs = props.tooltipDelay

// Initialize ripple effect for tactile feedback - Palette's micro-UX touch!
const { createRipple } = useRipple(buttonRef as Ref<HTMLButtonElement | null>, {
  color: animationConfig.ripple.successColor,
  duration: animationConfig.button.feedbackDurationMs,
})

// Check for reduced motion preference
onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches
  }
})

const handleCopyWithRipple = async (event: MouseEvent) => {
  // Create ripple effect first - Palette's micro-UX touch!
  createRipple(event)

  await handleCopy()
}

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.content)
    isCopied.value = true
    announcementText.value = contentConfig.copyButton.announcement.success
    emit('copied')

    // Haptic feedback for successful copy - Palette's micro-UX touch!
    hapticSuccess()

    // Reset after configured duration
    setTimeout(() => {
      isCopied.value = false
      announcementText.value = ''
    }, animationConfig.copyFeedback.durationMs)
  } catch {
    // Handle clipboard failure gracefully
    announcementText.value = contentConfig.copyButton.announcement.failed

    // Haptic feedback for failed copy
    hapticError()

    // Clear announcement after delay
    setTimeout(() => {
      announcementText.value = ''
    }, animationConfig.copyFeedback.durationMs)
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
  animation: check-pop
    v-bind('animationConfig.copyFeedback.checkPopDurationMs + "ms"') ease-out;
}

/* Icon wiggle animation on hover - Palette's micro-UX delight! */
@keyframes icon-wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}

.animate-icon-wiggle {
  animation: icon-wiggle
    v-bind('animationConfig.copyFeedback.iconWiggleDurationMs + "ms"')
    ease-in-out;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-check-pop,
  .animate-icon-wiggle {
    animation: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  button {
    border: 2px solid currentColor;
  }
}
</style>
