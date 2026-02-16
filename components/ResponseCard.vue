<template>
  <article
    class="response-card"
    :class="[
      cardClass,
      { 'response-card--animate': !prefersReducedMotion && shouldAnimate },
    ]"
    :style="animationStyle"
    role="region"
    :aria-label="`Response card: ${title}`"
  >
    <!-- Header with icon, title and copy button -->
    <header class="response-card__header">
      <div class="response-card__title-group">
        <!-- Palette's micro-UX enhancement: Visual type icon for quick recognition -->
        <div
          class="response-card__icon"
          :class="iconClass"
          aria-hidden="true"
        >
          <!-- Success Checkmark -->
          <svg
            v-if="type === 'success'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <!-- Error X Mark -->
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>

        <h3
          :class="titleClass"
          class="response-card__title"
        >
          {{ title }}
        </h3>
      </div>

      <!-- Palette's micro-UX enhancement: Enhanced CopyButton with success feedback -->
      <div class="response-card__actions">
        <Tooltip
          :content="copyTooltipText"
          position="top"
          :delay="animationConfig.tooltip.showDelayMs"
        >
          <button
            ref="copyButtonRef"
            class="response-card__copy-btn"
            :class="{
              'response-card__copy-btn--success': copySuccess,
              'response-card__copy-btn--pressed':
                isCopyPressed && !prefersReducedMotion,
            }"
            :aria-label="`Copy ${title.toLowerCase()} example`"
            @click="handleCopy"
            @mousedown="isCopyPressed = true"
            @mouseup="isCopyPressed = false"
            @mouseleave="isCopyPressed = false"
            @touchstart="isCopyPressed = true"
            @touchend="isCopyPressed = false"
          >
            <!-- Copy Icon -->
            <svg
              v-if="!copySuccess"
              xmlns="http://www.w3.org/2000/svg"
              class="response-card__copy-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <!-- Success Checkmark -->
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="response-card__copy-icon response-card__copy-icon--checkmark"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span class="response-card__copy-text">{{ copyButtonText }}</span>
          </button>
        </Tooltip>
      </div>
    </header>

    <!-- Code block with syntax highlighting indicator -->
    <div
      class="response-card__code-wrapper"
      :class="codeWrapperClass"
    >
      <!-- Palette's micro-UX enhancement: Code type badge -->
      <div
        class="response-card__code-badge"
        :class="codeBadgeClass"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-3 w-3 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
        {{ type === 'success' ? 'JSON' : 'Error' }}
      </div>

      <pre
        class="response-card__code"
        :class="codeClass"
      ><code>{{ code }}</code></pre>
    </div>

    <!-- Screen reader announcement for copy success -->
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ announcement }}
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Tooltip from '~/components/Tooltip.vue'
import { animationConfig } from '~/configs/animation.config'
import { contentConfig } from '~/configs/content.config'
import { hapticSuccess } from '~/utils/hapticFeedback'

interface Props {
  type: 'success' | 'error'
  code: string
  title: string
  delay?: number
  /**
   * Enable entrance animation
   * @default true
   */
  animate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  delay: 0,
  animate: true,
})

const emit = defineEmits<{
  copied: []
}>()

// Palette's micro-UX enhancement: Copy success state
const copySuccess = ref(false)
const isCopyPressed = ref(false)
const announcement = ref('')
const copyButtonRef = ref<HTMLButtonElement | null>(null)

// Check for reduced motion preference
const prefersReducedMotion = ref(false)
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Config values - Flexy hates hardcoded values!
const config = {
  copySuccessDurationMs: animationConfig.copySuccess?.tooltipDurationMs || 1500,
  announcementClearMs:
    animationConfig.microInteractions?.announcementDelayMs || 1000,
}

// Computed classes
const cardClass = computed(() => {
  return props.type === 'success'
    ? 'response-card--success'
    : 'response-card--error'
})

const titleClass = computed(() => {
  return props.type === 'success'
    ? 'response-card__title--success'
    : 'response-card__title--error'
})

const iconClass = computed(() => {
  return props.type === 'success'
    ? 'response-card__icon--success'
    : 'response-card__icon--error'
})

const codeWrapperClass = computed(() => {
  return props.type === 'success'
    ? 'response-card__code-wrapper--success'
    : 'response-card__code-wrapper--error'
})

const codeBadgeClass = computed(() => {
  return props.type === 'success'
    ? 'response-card__code-badge--success'
    : 'response-card__code-badge--error'
})

const codeClass = computed(() => {
  return props.type === 'success'
    ? 'response-card__code--success'
    : 'response-card__code--error'
})

// Animation control
const shouldAnimate = computed(() => props.animate)

const animationStyle = computed(() => {
  if (prefersReducedMotion.value || !props.animate) return {}
  return {
    animationDelay: `${props.delay * 150}ms`,
  }
})

// Copy button text
const copyButtonText = computed(() => {
  return copySuccess.value
    ? (contentConfig.messages?.clipboard?.copiedButton ?? 'Copied!')
    : (contentConfig.messages?.clipboard?.copyButton ?? 'Copy')
})

const copyTooltipText = computed(() => {
  return copySuccess.value
    ? contentConfig.messages?.clipboard?.copied || 'Copied to clipboard'
    : contentConfig.messages?.clipboard?.copy || 'Copy to clipboard'
})

// Handle copy action with success feedback
const handleCopy = async () => {
  if (copySuccess.value) return

  try {
    await navigator.clipboard.writeText(props.code)

    copySuccess.value = true
    emit('copied')

    // Palette's micro-UX enhancement: Haptic feedback
    hapticSuccess()

    // Announce to screen readers
    announcement.value = `${props.title} example copied to clipboard`
    setTimeout(() => {
      announcement.value = ''
    }, config.announcementClearMs)

    // Reset after delay
    setTimeout(() => {
      copySuccess.value = false
    }, config.copySuccessDurationMs)
  } catch {
    // Silent fail - show error announcement
    announcement.value = `Failed to copy ${props.title.toLowerCase()} example`
    setTimeout(() => {
      announcement.value = ''
    }, config.announcementClearMs)
  }
}

// MediaQuery cleanup
let mediaQuery: MediaQueryList | null = null
let handleMotionChange: ((e: MediaQueryListEvent) => void) | null = null

onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  if (typeof window !== 'undefined') {
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleMotionChange)
  }
})

onUnmounted(() => {
  if (mediaQuery && handleMotionChange) {
    mediaQuery.removeEventListener('change', handleMotionChange)
  }
})
</script>

<style scoped>
/* Main card container */
.response-card {
  position: relative;
  border-radius: 0.75rem;
  padding: 1rem;
  transition: all v-bind('`${animationConfig.transition.normal.durationMs}ms`')
    ease-out;
  border: 2px solid transparent;
}

/* Palette's micro-UX enhancement: Hover lift effect */
.response-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Success variant */
.response-card--success {
  background-color: rgb(240, 253, 244);
  border-color: rgb(134, 239, 172);
}

.response-card--success:hover {
  border-color: rgb(74, 222, 128);
  box-shadow:
    0 10px 15px -3px rgba(74, 222, 128, 0.15),
    0 4px 6px -2px rgba(74, 222, 128, 0.1);
}

/* Error variant */
.response-card--error {
  background-color: rgb(254, 242, 242);
  border-color: rgb(252, 165, 165);
}

.response-card--error:hover {
  border-color: rgb(248, 113, 113);
  box-shadow:
    0 10px 15px -3px rgba(248, 113, 113, 0.15),
    0 4px 6px -2px rgba(248, 113, 113, 0.1);
}

/* Header styling */
.response-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.response-card__title-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Type icon */
.response-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.response-card__icon--success {
  background-color: rgb(220, 252, 231);
  color: rgb(22, 163, 74);
}

.response-card__icon--error {
  background-color: rgb(254, 226, 226);
  color: rgb(220, 38, 38);
}

/* Title styling */
.response-card__title {
  font-weight: 600;
  font-size: 1rem;
  margin: 0;
}

.response-card__title--success {
  color: rgb(21, 128, 61);
}

.response-card__title--error {
  color: rgb(185, 28, 28);
}

/* Copy button styling - Palette's micro-UX enhancement */
.response-card__copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  border: 1px solid rgb(209, 213, 219);
  background-color: white;
  color: rgb(75, 85, 99);
  cursor: pointer;
  transition: all v-bind('`${animationConfig.transition.fast.durationMs}ms`')
    ease-out;
  position: relative;
  overflow: hidden;
}

.response-card__copy-btn:hover {
  background-color: rgb(249, 250, 251);
  border-color: rgb(156, 163, 175);
  transform: translateY(-1px);
}

.response-card__copy-btn:focus-visible {
  outline: 2px solid rgb(59, 130, 246);
  outline-offset: 2px;
}

.response-card__copy-btn--pressed {
  transform: scale(0.95);
}

.response-card__copy-btn--success {
  background-color: rgb(220, 252, 231);
  border-color: rgb(134, 239, 172);
  color: rgb(22, 163, 74);
}

.response-card__copy-btn--success:hover {
  background-color: rgb(187, 247, 208);
  border-color: rgb(74, 222, 128);
}

.response-card__copy-icon {
  width: 1rem;
  height: 1rem;
  transition: transform
    v-bind('`${animationConfig.transition.fast.durationMs}ms`') ease-out;
}

/* Palette's micro-UX enhancement: Checkmark pop animation */
.response-card__copy-icon--checkmark {
  animation: checkmark-pop
    v-bind('`${animationConfig.copySuccess?.checkmarkDelaySec || 0.3}s`')
    cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes checkmark-pop {
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.3) rotate(0deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.response-card__copy-text {
  white-space: nowrap;
}

/* Code wrapper with badge */
.response-card__code-wrapper {
  position: relative;
  border-radius: 0.5rem;
  border: 1px solid;
  overflow: hidden;
}

.response-card__code-wrapper--success {
  background-color: white;
  border-color: rgb(187, 247, 208);
}

.response-card__code-wrapper--error {
  background-color: white;
  border-color: rgb(254, 202, 202);
}

/* Code type badge - Palette's micro-UX enhancement */
.response-card__code-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border-radius: 0.25rem;
  opacity: 0;
  transition: opacity
    v-bind('`${animationConfig.transition.fast.durationMs}ms`') ease-out;
  pointer-events: none;
}

.response-card:hover .response-card__code-badge {
  opacity: 1;
}

.response-card__code-badge--success {
  background-color: rgb(220, 252, 231);
  color: rgb(22, 163, 74);
}

.response-card__code-badge--error {
  background-color: rgb(254, 226, 226);
  color: rgb(220, 38, 38);
}

/* Code block */
.response-card__code {
  margin: 0;
  padding: 1rem;
  font-family:
    ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 0.75rem;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre;
  word-wrap: normal;
}

.response-card__code code {
  display: block;
}

.response-card__code--success {
  color: rgb(21, 128, 61);
}

.response-card__code--error {
  color: rgb(185, 28, 28);
}

/* Entrance animation */
.response-card--animate {
  opacity: 0;
  animation: response-card-enter
    v-bind('`${animationConfig.cssAnimations?.standardDurationSec || "0.4s"}`')
    ease-out forwards;
}

@keyframes response-card-enter {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Screen reader only */
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
  .response-card,
  .response-card__copy-btn,
  .response-card__copy-icon {
    transition: none;
    animation: none;
  }

  .response-card:hover {
    transform: none;
  }

  .response-card--animate {
    animation: none;
    opacity: 1;
  }

  .response-card__copy-icon--checkmark {
    animation: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .response-card {
    border-width: 2px;
  }

  .response-card__copy-btn {
    border-width: 2px;
  }

  .response-card__code-wrapper {
    border-width: 2px;
  }
}
</style>
