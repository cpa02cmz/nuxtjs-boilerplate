<template>
  <div
    class="character-counter-wrapper"
    :class="{
      'character-counter--focused': isFocused,
      'character-counter--error': isOverLimit,
      'character-counter--warning': isNearLimit && !isOverLimit,
    }"
  >
    <!-- Input Slot - allows flexible input integration with accessibility props -->
    <div class="character-counter-input-wrapper">
      <slot
        :character-count="characterCount"
        :is-near-limit="isNearLimit"
        :is-over-limit="isOverLimit"
        :input-props="inputProps"
      />
    </div>

    <!-- Visual Progress Ring Counter - Palette's micro-UX delight! -->
    <div
      v-if="showCounter"
      class="character-counter-ring"
      :class="{
        'character-counter-ring--focused': isFocused,
        'character-counter-ring--visible': characterCount > 0 || alwaysShow,
        'character-counter-ring--complete': isComplete,
      }"
      :title="counterTooltip"
    >
      <svg
        class="character-counter-ring__svg"
        :viewBox="`0 0 ${svgSize} ${svgSize}`"
        :width="ringSize"
        :height="ringSize"
        aria-hidden="true"
      >
        <!-- Background Circle -->
        <circle
          class="character-counter-ring__bg"
          :cx="centerPoint"
          :cy="centerPoint"
          :r="radius"
          fill="none"
          :stroke-width="strokeWidth"
        />
        <!-- Progress Circle -->
        <circle
          class="character-counter-ring__progress"
          :cx="centerPoint"
          :cy="centerPoint"
          :r="radius"
          fill="none"
          :stroke-width="strokeWidth"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashOffset"
          stroke-linecap="round"
          :style="progressStyle"
        />
      </svg>
      <!-- Character Count Text or Checkmark -->
      <span
        class="character-counter-ring__text"
        :class="{
          'character-counter-ring__text--warning':
            isNearLimit && !isOverLimit && !isComplete,
          'character-counter-ring__text--error': isOverLimit,
          'character-counter-ring__text--complete': isComplete,
        }"
        aria-hidden="true"
      >
        <template v-if="isComplete && !prefersReducedMotion">
          <!-- Palette's micro-UX: Checkmark icon for completion celebration -->
          <svg
            class="character-counter__checkmark"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              class="character-counter__checkmark-path"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </template>
        <template v-else>
          {{ remainingCount }}
        </template>
      </span>
    </div>

    <!-- Screen Reader Announcement -->
    <div
      :id="counterId"
      class="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ screenReaderAnnouncement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { componentColorsConfig } from '~/configs/component-colors.config'
import { validationConfig } from '~/configs/validation.config'
import { zIndexScale } from '~/configs/z-index.config'
import { uiConfig } from '~/configs/ui.config'
import { hapticLight, hapticError, hapticSuccess } from '~/utils/hapticFeedback'
import { useReducedMotion } from '~/composables/useReducedMotion'

interface Props {
  /** Current character count */
  characterCount: number
  /** Maximum allowed characters */
  maxLength: number
  /** Show the counter ring */
  showCounter?: boolean
  /** Always show counter even at 0 characters */
  alwaysShow?: boolean
  /** Threshold percentage to show warning state (0-1) */
  warningThreshold?: number
  /** Size of the counter ring in pixels */
  ringSize?: number
  /** Stroke width of the ring */
  strokeWidth?: number
  /** Whether the input is currently focused */
  isFocused?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showCounter: true,
  alwaysShow: false,
  warningThreshold: validationConfig.characterCounter.warningThreshold,
  ringSize: validationConfig.characterCounter.ringSizePx,
  strokeWidth: validationConfig.characterCounter.strokeWidthPx,
  isFocused: false,
})

// Accessibility: Check for reduced motion preference
const { prefersReducedMotion } = useReducedMotion()

// Computed values for SVG
const svgSize = computed(() => props.ringSize)
const centerPoint = computed(() => props.ringSize / 2)
const radius = computed(() => (props.ringSize - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)

// Progress calculations
const progressPercentage = computed(() => {
  return Math.min(props.characterCount / props.maxLength, 1)
})

const strokeDashOffset = computed(() => {
  return circumference.value * (1 - progressPercentage.value)
})

const remainingCount = computed(() => {
  return props.maxLength - props.characterCount
})

// State checks
const isNearLimit = computed(() => {
  return progressPercentage.value >= props.warningThreshold
})

const isOverLimit = computed(() => {
  return props.characterCount > props.maxLength
})

// Palette's micro-UX enhancement: Complete state when exactly at max length
const isComplete = computed(() => {
  return props.characterCount === props.maxLength
})

// Accessibility: Input props for aria-invalid and aria-describedby binding
const inputProps = computed(() => ({
  'aria-invalid': isOverLimit.value ? true : undefined,
  'aria-describedby':
    isOverLimit.value || isNearLimit.value
      ? `character-counter-${counterId.value}`
      : undefined,
}))

// Progress ring color based on state
const progressColor = computed(() => {
  if (isOverLimit.value) {
    return 'var(--counter-color-error, #ef4444)'
  }
  if (isComplete.value) {
    return 'var(--counter-color-success, #22c55e)'
  }
  if (isNearLimit.value) {
    return 'var(--counter-color-warning, #f59e0b)'
  }
  return 'var(--counter-color-normal, #3b82f6)'
})

// Progress ring style with dynamic color
const progressStyle = computed(() => ({
  '--progress-color': progressColor.value,
  '--progress-percentage': `${progressPercentage.value * 100}%`,
  transition: `stroke-dashoffset ${animationConfig.transition.fast.durationMs}ms ease-out`,
}))

// Tooltip text
const counterTooltip = computed(() => {
  if (isOverLimit.value) {
    return `${Math.abs(remainingCount.value)} characters over limit`
  }
  if (isComplete.value) {
    return 'Character limit reached! Great job!'
  }
  return `${remainingCount.value} characters remaining`
})

// Screen reader announcement
const screenReaderAnnouncement = computed(() => {
  if (!props.showCounter) return ''

  if (isOverLimit.value) {
    return `Character limit exceeded. You are ${Math.abs(remainingCount.value)} characters over the ${props.maxLength} character limit.`
  }
  if (isComplete.value) {
    return `Character limit reached! You've used all ${props.maxLength} characters.`
  }
  if (isNearLimit.value) {
    return `${remainingCount.value} characters remaining out of ${props.maxLength}.`
  }
  return ''
})

// Unique ID for accessibility associations
const counterId = ref(
  `character-counter-${Math.random().toString(36).substr(2, 9)}`
)

// Palette's micro-UX enhancement: Haptic feedback on state transitions
// Track previous state to trigger feedback only on transitions, not continuously
const previousState = ref<'normal' | 'warning' | 'complete' | 'error'>('normal')
const hasTriggeredWarning = ref(false)
const hasTriggeredError = ref(false)
const hasTriggeredComplete = ref(false)

// Watch for state changes and trigger haptic feedback
watch(
  [isNearLimit, isOverLimit, isComplete],
  ([newIsNearLimit, newIsOverLimit, newIsComplete]) => {
    // Skip haptic feedback if user prefers reduced motion
    if (prefersReducedMotion.value) return

    const currentState = newIsOverLimit
      ? 'error'
      : newIsComplete
        ? 'complete'
        : newIsNearLimit
          ? 'warning'
          : 'normal'

    // Trigger haptic feedback on state transitions
    if (currentState === 'error' && !hasTriggeredError.value) {
      // Strong feedback when exceeding limit
      hapticError()
      hasTriggeredError.value = true
      hasTriggeredWarning.value = true // Error includes warning state
    } else if (currentState === 'complete' && !hasTriggeredComplete.value) {
      // Success feedback when reaching exactly max characters
      hapticSuccess()
      hasTriggeredComplete.value = true
      hasTriggeredWarning.value = true
    } else if (
      currentState === 'warning' &&
      !hasTriggeredWarning.value &&
      !newIsOverLimit &&
      !newIsComplete
    ) {
      // Light feedback when approaching limit
      hapticLight()
      hasTriggeredWarning.value = true
    }

    // Reset flags when returning to normal state
    if (currentState === 'normal') {
      hasTriggeredWarning.value = false
      hasTriggeredError.value = false
      hasTriggeredComplete.value = false
    }

    previousState.value = currentState
  }
)

// Flexy hates hardcoded rgba! Using configurable shadow color
const shadowColorDefault = computed(
  () => componentColorsConfig.shadows.light.default
)
</script>

<style scoped>
.character-counter-wrapper {
  position: relative;
  display: block;
}

.character-counter-input-wrapper {
  position: relative;
}

/* Visual Progress Ring Counter */
.character-counter-ring {
  position: absolute;
  right: v-bind('validationConfig.characterCounter.positionOffsetPx + "px"');
  top: 50%;
  transform: translateY(-50%) scale(0.8);
  width: v-bind('ringSize + "px"');
  height: v-bind('ringSize + "px"');
  opacity: 0;
  transition: all v-bind('animationConfig.transition.fast.durationMs + "ms"')
    ease-out;
  pointer-events: none;
  z-index: v-bind('zIndexScale.low[10]');
}

.character-counter-ring--visible,
.character-counter-wrapper.character-counter--focused .character-counter-ring {
  opacity: 1;
  transform: translateY(-50%) scale(1);
}

.character-counter-ring--focused {
  filter: drop-shadow(0 2px 4px rgba(v-bind('shadowColorDefault'), 0.1));
}

.character-counter-ring__svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.character-counter-ring__bg {
  stroke: var(--counter-bg-color, rgba(v-bind('shadowColorDefault'), 0.1));
  transition: stroke v-bind('animationConfig.transition.fast.durationMs + "ms"')
    ease;
}

.character-counter-ring__progress {
  stroke: var(--progress-color, #3b82f6);
  transition:
    stroke-dashoffset
      v-bind('animationConfig.transition.fast.durationMs + "ms"') ease-out,
    stroke v-bind('animationConfig.transition.fast.durationMs + "ms"') ease;
}

/* Character count text inside ring */
.character-counter-ring__text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: v-bind('validationConfig.characterCounter.fontSizePx + "px"');
  font-weight: v-bind('validationConfig.characterCounter.fontWeight');
  color: var(--counter-text-color, #6b7280);
  transition: color v-bind('animationConfig.transition.fast.durationMs + "ms"')
    ease;
}

.character-counter-ring__text--warning {
  color: var(--counter-color-warning, #f59e0b);
  animation: pulse-warning
    v-bind('animationConfig.focus.pulseDurationMs + "ms"') ease-in-out infinite;
}

.character-counter-ring__text--error {
  color: var(--counter-color-error, #ef4444);
  animation: shake-error
    v-bind('animationConfig.validation.shakeDurationMs + "ms"') ease-in-out;
}

.character-counter-ring__text--complete {
  color: var(--counter-color-success, #22c55e);
}

/* Palette's micro-UX: Checkmark animation for completion celebration */
.character-counter__checkmark {
  width: 60%;
  height: 60%;
  animation: checkmark-pop
    v-bind('animationConfig.validation.successPopDurationMs + "ms"') ease-out
    forwards;
}

.character-counter__checkmark-path {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  animation: checkmark-draw
    v-bind('animationConfig.validation.successDrawDurationMs + "ms"') ease-out
    forwards;
  animation-delay: v-bind(
    'animationConfig.validation.successPopDurationMs / 2 + "ms"'
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

/* Completion celebration ring animation */
.character-counter-ring--complete {
  animation: completion-pulse
    v-bind('animationConfig.validation.completionPulseDurationMs + "ms"')
    ease-out;
}

@keyframes completion-pulse {
  0% {
    transform: translateY(-50%) scale(1);
    filter: drop-shadow(0 0 0 rgba(34, 197, 94, 0));
  }
  50% {
    transform: translateY(-50%) scale(1.15);
    filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.5));
  }
  100% {
    transform: translateY(-50%) scale(1);
    filter: drop-shadow(0 2px 4px rgba(v-bind('shadowColorDefault'), 0.1));
  }
}

/* Animations */
@keyframes pulse-warning {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

@keyframes shake-error {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
}

/* Error state styling */
.character-counter-wrapper.character-counter--error {
  --counter-color-error: v-bind(
    'uiConfig.characterCounter.colors.error || "#ef4444"'
  );
}

.character-counter-wrapper.character-counter--warning {
  --counter-color-warning: v-bind(
    'uiConfig.characterCounter.colors.warning || "#f59e0b"'
  );
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .character-counter-ring {
    transition: opacity v-bind('animationConfig.cssTransitions.fastSec') ease;
  }

  .character-counter-ring__progress {
    transition: stroke-dashoffset
      v-bind('animationConfig.cssTransitions.fastSec') ease;
  }

  .character-counter-ring__text--warning,
  .character-counter-ring__text--error,
  .character-counter-ring--complete {
    animation: none;
  }

  .character-counter__checkmark {
    animation: none;
    opacity: 1;
    transform: scale(1);
  }

  .character-counter__checkmark-path {
    animation: none;
    stroke-dashoffset: 0;
  }
}

/* Screen reader only text */
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
</style>
