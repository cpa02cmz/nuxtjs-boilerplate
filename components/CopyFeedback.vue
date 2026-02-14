<template>
  <div
    ref="triggerRef"
    class="copy-feedback-wrapper"
    @click="handleCopy"
    @keydown="handleKeyDown"
  >
    <slot />

    <!-- Copy Feedback Tooltip -->
    <Teleport to="body">
      <Transition
        :enter-active-class="`transition-all ${animationConfig.transition.normal.class} ${animationConfig.transition.easeOut}`"
        enter-from-class="opacity-0 scale-50 translate-y-2"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        :leave-active-class="`transition-all ${animationConfig.transition.fast.class} ${animationConfig.transition.easeIn}`"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-75 -translate-y-1"
      >
        <div
          v-if="showFeedback"
          class="copy-feedback-tooltip"
          :style="tooltipStyle"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div class="copy-feedback-content">
            <!-- Animated Checkmark -->
            <svg
              class="copy-feedback-checkmark"
              :class="{ 'animate-draw': showFeedback }"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                class="checkmark-path"
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span class="copy-feedback-text">{{ feedbackText }}</span>
          </div>
          <!-- Decorative arrow -->
          <div class="copy-feedback-arrow" />
        </div>
      </Transition>
    </Teleport>

    <!-- Screen reader announcement -->
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
      {{ announcementText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { easingConfig } from '~/configs/easing.config'
import { uiConfig } from '~/configs/ui.config'
import { hapticSuccess, hapticError } from '~/utils/hapticFeedback'
import { generateId } from '~/utils/generateId'

interface Props {
  /**
   * The text to copy to clipboard
   */
  textToCopy: string
  /**
   * Custom feedback message (default: "Copied!")
   */
  feedbackMessage?: string
  /**
   * Duration the feedback tooltip remains visible (ms)
   * @default from animationConfig
   */
  durationMs?: number
  /**
   * Position of the tooltip relative to the trigger
   * @default 'top'
   */
  position?: 'top' | 'bottom' | 'left' | 'right'
  /**
   * Offset from the trigger element (px)
   * @default 8
   */
  offsetPx?: number
  /**
   * Enable haptic feedback on mobile devices
   * @default true
   */
  hapticFeedback?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  feedbackMessage: 'Copied!',
  durationMs: undefined,
  position: 'top',
  offsetPx: 8,
  hapticFeedback: true,
})

const emit = defineEmits<{
  (e: 'copied', text: string): void
  (e: 'error', error: Error): void
}>()

// Get configurable duration from animationConfig - Flexy hates hardcoded values!
const feedbackDurationMs = computed(
  () =>
    props.durationMs ||
    animationConfig.copyFeedback?.durationMs ||
    animationConfig.copySuccess.tooltipDurationMs ||
    1500
)

// State
const showFeedback = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })
// Generate unique ID for accessibility - Flexy hates hardcoded ID generation!
const _uniqueId = generateId({ prefix: 'copy-feedback' })
const announcementText = ref('')
let hideTimeout: ReturnType<typeof setTimeout> | null = null

// Computed tooltip style for positioning
const tooltipStyle = computed(() => ({
  left: `${tooltipPosition.value.x}px`,
  top: `${tooltipPosition.value.y}px`,
  transform: 'translate(-50%, -100%)',
}))

const feedbackText = computed(() => props.feedbackMessage)

/**
 * Calculate tooltip position based on trigger element and preferred position
 */
const calculatePosition = async () => {
  if (!triggerRef.value) return

  await nextTick()

  const rect = triggerRef.value.getBoundingClientRect()
  const scrollX = window.scrollX || window.pageXOffset
  const scrollY = window.scrollY || window.pageYOffset

  let x = rect.left + rect.width / 2 + scrollX
  let y = rect.top + scrollY

  // Adjust based on position preference
  switch (props.position) {
    case 'top':
      y -= props.offsetPx
      break
    case 'bottom':
      y += rect.height + props.offsetPx
      break
    case 'left':
      x -= props.offsetPx
      break
    case 'right':
      x += rect.width + props.offsetPx
      break
  }

  tooltipPosition.value = { x, y }
}

/**
 * Copy text to clipboard and show feedback
 */
const handleCopy = async (event?: MouseEvent | KeyboardEvent) => {
  // Prevent default if it's a click event on a button/link
  if (event && 'preventDefault' in event) {
    event.preventDefault()
  }

  try {
    await navigator.clipboard.writeText(props.textToCopy)

    // Show success feedback
    await showCopyFeedback()

    // Trigger haptic feedback on supported devices
    if (props.hapticFeedback) {
      hapticSuccess()
    }

    emit('copied', props.textToCopy)
  } catch (err) {
    // Handle copy failure gracefully - silently fail and emit error
    if (props.hapticFeedback) {
      hapticError()
    }

    emit('error', err as Error)
  }
}

/**
 * Show the copy feedback tooltip with animation
 */
const showCopyFeedback = async () => {
  // Clear any existing timeout
  if (hideTimeout) {
    clearTimeout(hideTimeout)
  }

  // Calculate position before showing
  await calculatePosition()

  // Show feedback
  showFeedback.value = true

  // Announce to screen readers
  announcementText.value = `${props.feedbackMessage} ${props.textToCopy}`

  // Clear announcement after screen reader has time to process - Flexy hates hardcoded 1000ms!
  setTimeout(() => {
    announcementText.value = ''
  }, animationConfig.microInteractions.announcementDelayMs)

  // Hide after duration
  hideTimeout = setTimeout(() => {
    showFeedback.value = false
  }, feedbackDurationMs.value)
}

/**
 * Handle keyboard interactions for accessibility
 */
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleCopy(event)
  }
}

// Expose method for programmatic triggering
defineExpose({
  copy: handleCopy,
})
</script>

<style scoped>
.copy-feedback-wrapper {
  display: inline-flex;
  cursor: pointer;
}

.copy-feedback-tooltip {
  position: fixed;
  z-index: v-bind('uiConfig.zIndex.toast');
  pointer-events: none;
}

.copy-feedback-content {
  display: inline-flex;
  align-items: center;
  gap: v-bind('`${animationConfig.pixels?.tooltipGap || 6}px`');
  padding: v-bind(
    '`${animationConfig.copyFeedback?.styles?.paddingY || 6}px ${animationConfig.copyFeedback?.styles?.paddingX || 12}px`'
  );
  /* Flexy hates hardcoded hex codes! Using configurable gradient colors */
  background: linear-gradient(
    135deg,
    v-bind('animationConfig.gradients?.emerald?.start') 0%,
    v-bind('animationConfig.gradients?.emerald?.end') 100%
  );
  border-radius: v-bind(
    '`${animationConfig.copyFeedback?.styles?.borderRadius || 6}px`'
  );
  box-shadow:
    0 v-bind('`${animationConfig.copyFeedback?.styles?.shadow?.y || 4}px`')
      v-bind('`${animationConfig.copyFeedback?.styles?.shadow?.blur || 6}px`')
      v-bind(
        '`${animationConfig.copyFeedback?.styles?.shadow?.spread || -1}px`'
      )
      v-bind('animationConfig.shadows?.light?.md'),
    0 10px 15px -3px v-bind('animationConfig.shadows?.light?.md');
  font-size: v-bind(
    '`${animationConfig.copyFeedback?.styles?.fontSize || 12}px`'
  );
  font-weight: 600;
  color: white;
  white-space: nowrap;
  /* Flexy hates hardcoded values! Using configurable easing from easingConfig */
  animation: feedback-pop
    v-bind(
      '`${animationConfig?.copyFeedback?.styles?.animationDuration ?? 0.3}s`'
    )
    v-bind(
      'easingConfig?.cubicBezier?.spring ?? "cubic-bezier(0.175, 0.885, 0.32, 1.275)"'
    );
}

.copy-feedback-checkmark {
  /* Flexy hates hardcoded pixel values! Using configurable sizes */
  width: v-bind('`${animationConfig.pixels?.checkmarkSize || 16}px`');
  height: v-bind('`${animationConfig.pixels?.checkmarkSize || 16}px`');
  flex-shrink: 0;
}

.checkmark-path {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
}

.animate-draw .checkmark-path {
  animation: draw-checkmark
    v-bind(
      '`${animationConfig.copyFeedback?.checkmarkDrawDurationSec || 0.18}s`'
    )
    ease-out forwards;
  animation-delay: v-bind(
    '`${animationConfig.copyFeedback?.checkmarkDelaySec || 0.06}s`'
  );
}

.copy-feedback-arrow {
  position: absolute;
  /* Flexy hates hardcoded pixel values! */
  bottom: v-bind('`-${animationConfig.pixels?.arrowOffset || 4}px`');
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: v-bind('`${animationConfig.copyFeedback?.styles?.arrowSize || 8}px`');
  height: v-bind('`${animationConfig.copyFeedback?.styles?.arrowSize || 8}px`');
  /* Flexy hates hardcoded hex codes! Using configurable gradient colors */
  background: v-bind('animationConfig.gradients?.emerald?.end');
  border-radius: v-bind('`${animationConfig.borderRadius?.xs || 1}px`');
}

/* Animations */
@keyframes feedback-pop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes draw-checkmark {
  to {
    stroke-dashoffset: 0;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .copy-feedback-content {
    animation: none;
  }

  .checkmark-path {
    stroke-dashoffset: 0;
  }

  .animate-draw .checkmark-path {
    animation: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .copy-feedback-content {
    border: 2px solid currentColor;
  }
}
</style>
