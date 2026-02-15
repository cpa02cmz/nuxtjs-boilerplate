<template>
  <div class="error-message-container">
    <!-- Undo Button - Appears after dismissal with countdown -->
    <Transition
      :enter-active-class="`transition-all ${animationConfig.tailwindDurations.standard} ease-out`"
      enter-from-class="opacity-0 -translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      :leave-active-class="`transition-all ${animationConfig.tailwindDurations.normal} ease-in`"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-2 scale-95"
    >
      <button
        v-if="showUndo && dismissible"
        class="error-message__undo"
        :aria-label="`Undo dismissal of ${variant} message. Press Control Z to restore`"
        @click="undoDismiss"
      >
        <span class="flex items-center gap-1.5">
          <svg
            class="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>
          Undo
        </span>
        <kbd
          class="hidden sm:inline-flex items-center ml-2 px-1.5 py-0.5 text-xs bg-white/50 border border-current/20 rounded"
          aria-hidden="true"
          >Ctrl+Z</kbd
        >
        <!-- Progress bar for undo window -->
        <span
          class="error-message__undo-progress"
          :class="undoProgressColorClass"
          :style="{ width: `${undoProgress}%` }"
          aria-hidden="true"
        />
      </button>
    </Transition>

    <!-- Aria live region for announcements -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ announcement }}
    </div>

    <Transition
      :enter-active-class="`transition-all ${animationConfig.tailwindDurations.standard} ease-out`"
      enter-from-class="opacity-0 -translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      :leave-active-class="`transition-all ${animationConfig.tailwindDurations.normal} ease-in`"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-2 scale-95"
    >
      <div
        v-if="isVisible && message"
        class="error-message"
        :class="[
          `error-message--${variant}`,
          { 'error-message--dismissible': dismissible },
        ]"
        :role="
          variant === 'error' || variant === 'warning' ? 'alert' : 'status'
        "
        :aria-live="variant === 'error' ? 'assertive' : 'polite'"
        @mouseenter="pauseDismiss"
        @mouseleave="resumeDismiss"
        @focusin="pauseDismiss"
        @focusout="resumeDismiss"
      >
        <!-- Icon with subtle pulse animation -->
        <div
          class="error-message__icon"
          :class="{ 'error-message__icon--pulse': !prefersReducedMotion }"
        >
          <svg
            v-if="variant === 'error'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else-if="variant === 'warning'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else-if="variant === 'success'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
        </div>

        <!-- Content area -->
        <div class="error-message__content">
          <p class="error-message__text">
            {{ message }}
          </p>
          <div v-if="action" class="error-message__action">
            <button
              type="button"
              class="error-message__action-button"
              :aria-label="action.label"
              @click="handleActionClick"
            >
              {{ action.label }}
            </button>
          </div>
        </div>

        <!-- Dismiss button -->
        <button
          v-if="dismissible"
          type="button"
          class="error-message__dismiss"
          :aria-label="`Dismiss ${variant} message`"
          @click="dismiss"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        <!-- Auto-dismiss progress bar -->
        <div
          v-if="autoDismiss > 0"
          class="error-message__progress"
          aria-hidden="true"
        >
          <div
            class="error-message__progress-bar"
            :class="{ 'error-message__progress-bar--paused': isPaused }"
            :style="progressBarStyle"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { themeConfig } from '../configs/theme.config'
import { uiConfig } from '../configs/ui.config'
import { componentStylesConfig } from '../configs/component-styles.config'
import { animationConfig } from '../configs/animation.config'
import { PROGRESS } from '~/server/utils/constants'

interface Action {
  label: string
  handler: () => void
}

interface Props {
  message?: string | null
  variant?: 'error' | 'warning' | 'success'
  action?: Action
  /**
   * Allow users to dismiss the message
   * @default false
   */
  dismissible?: boolean
  /**
   * Auto-dismiss duration in milliseconds (0 to disable)
   * @default 0
   */
  autoDismiss?: number
  /**
   * Callback when message is dismissed
   */
  onDismiss?: () => void
  /**
   * Enable undo functionality after dismissal
   * @default true
   */
  enableUndo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  message: null,
  variant: 'error',
  action: undefined,
  dismissible: false,
  autoDismiss: 0,
  onDismiss: undefined,
  enableUndo: true,
})

// Reactive state
const isVisible = ref(true)
const isPaused = ref(false)
const prefersReducedMotion = ref(false)
const showUndo = ref(false)
const undoProgress = ref(PROGRESS.MAX_PERCENT)
const announcement = ref('')
let dismissTimeout: ReturnType<typeof setTimeout> | null = null
let undoTimeout: ReturnType<typeof setTimeout> | null = null
let undoProgressInterval: ReturnType<typeof setInterval> | null = null
let remainingTime = props.autoDismiss
let startTime: number | null = null

// Undo configuration - Flexy hates hardcoded values!
const UNDO_DURATION_MS = uiConfig.undo.durationMs
const UNDO_PROGRESS_INTERVAL_MS = uiConfig.undo.progressIntervalMs

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Progress bar animation duration
const progressBarStyle = computed(() => ({
  animationDuration: `${props.autoDismiss}ms`,
}))

// Undo progress bar color - transitions from amber to red as time runs out
const undoProgressColorClass = computed(() => {
  if (undoProgress.value > 60) {
    return 'bg-amber-400'
  } else if (undoProgress.value > 30) {
    return 'bg-amber-500'
  } else if (undoProgress.value > 10) {
    return 'bg-orange-500'
  } else {
    return 'bg-red-500'
  }
})

// Clear undo timers
const clearUndoTimers = () => {
  if (undoTimeout) {
    clearTimeout(undoTimeout)
    undoTimeout = null
  }
  if (undoProgressInterval) {
    clearInterval(undoProgressInterval)
    undoProgressInterval = null
  }
}

// Start undo countdown
const startUndoCountdown = () => {
  undoProgress.value = 100

  // Start progress interval
  undoProgressInterval = setInterval(() => {
    undoProgress.value -= 100 / (UNDO_DURATION_MS / UNDO_PROGRESS_INTERVAL_MS)
    if (undoProgress.value <= 0) {
      undoProgress.value = 0
      clearUndoTimers()
    }
  }, UNDO_PROGRESS_INTERVAL_MS)

  // Set timeout to hide undo button
  undoTimeout = setTimeout(() => {
    showUndo.value = false
    clearUndoTimers()
  }, UNDO_DURATION_MS)
}

// Dismiss the message
const dismiss = () => {
  isVisible.value = false
  clearDismissTimeout()

  // Show undo button if enabled
  if (props.enableUndo && props.dismissible) {
    showUndo.value = true
    startUndoCountdown()

    // Announce to screen readers
    announcement.value = `${props.variant} message dismissed. Press Control Z to restore.`
    setTimeout(() => {
      announcement.value = ''
    }, uiConfig.feedback.announcementClearMs)
  }

  // Call onDismiss callback if provided
  if (props.onDismiss) {
    props.onDismiss()
  }
}

// Undo the dismissal
const undoDismiss = () => {
  clearUndoTimers()
  showUndo.value = false
  isVisible.value = true
  remainingTime = props.autoDismiss
  startAutoDismiss()

  // Announce to screen readers
  announcement.value = `${props.variant} message restored.`
  setTimeout(() => {
    announcement.value = ''
  }, uiConfig.feedback.announcementClearMs)
}

// Handle keyboard shortcut for undo (Ctrl+Z / Cmd+Z)
const handleKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && showUndo.value) {
    event.preventDefault()
    undoDismiss()
  }
}

// Handle action button click
const handleActionClick = () => {
  if (props.action?.handler) {
    props.action.handler()
  }
}

// Clear dismiss timeout
const clearDismissTimeout = () => {
  if (dismissTimeout) {
    clearTimeout(dismissTimeout)
    dismissTimeout = null
  }
}

// Start auto-dismiss timer
const startAutoDismiss = () => {
  if (props.autoDismiss <= 0) return

  startTime = Date.now()

  dismissTimeout = setTimeout(() => {
    dismiss()
  }, remainingTime)
}

// Pause auto-dismiss on hover/focus
const pauseDismiss = () => {
  if (props.autoDismiss <= 0 || !dismissTimeout) return

  isPaused.value = true
  clearDismissTimeout()

  if (startTime) {
    remainingTime -= Date.now() - startTime
  }
}

// Resume auto-dismiss
const resumeDismiss = () => {
  if (props.autoDismiss <= 0 || remainingTime <= 0) return

  isPaused.value = false
  startAutoDismiss()
}

// Watch for message changes to reset visibility
watch(
  () => props.message,
  newMessage => {
    if (newMessage) {
      isVisible.value = true
      remainingTime = props.autoDismiss
      startAutoDismiss()
    }
  },
  { immediate: true }
)

// Watch for autoDismiss changes
watch(
  () => props.autoDismiss,
  newAutoDismiss => {
    clearDismissTimeout()
    remainingTime = newAutoDismiss
    if (newAutoDismiss > 0 && isVisible.value) {
      startAutoDismiss()
    }
  }
)

// Lifecycle hooks
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()
  startAutoDismiss()

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleChange)

    // Add keyboard shortcut listener for undo
    document.addEventListener('keydown', handleKeydown)

    // Cleanup
    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handleChange)
      document.removeEventListener('keydown', handleKeydown)
      clearDismissTimeout()
      clearUndoTimers()
    })
  }
})

onUnmounted(() => {
  clearDismissTimeout()
  clearUndoTimers()
})
</script>

<style scoped>
.error-message-container {
  position: v-bind('componentStylesConfig.errorMessage.containerPosition');
}

.error-message {
  padding: v-bind('componentStylesConfig.errorMessage.padding');
  border-radius: v-bind('componentStylesConfig.errorMessage.borderRadius');
  display: flex;
  gap: v-bind('componentStylesConfig.errorMessage.gap');
  position: v-bind('componentStylesConfig.errorMessage.position');
  overflow: v-bind('componentStylesConfig.errorMessage.overflow');
}

/* Undo Button Styles - Palette's micro-UX enhancement */
.error-message__undo {
  position: v-bind('componentStylesConfig.errorMessage.undoPosition');
  display: v-bind('componentStylesConfig.errorMessage.undoDisplay');
  align-items: v-bind('componentStylesConfig.errorMessage.undoAlignItems');
  padding: v-bind('componentStylesConfig.errorMessage.undoPadding');
  margin-bottom: v-bind('componentStylesConfig.errorMessage.undoMarginBottom');
  font-size: v-bind('componentStylesConfig.errorMessage.undoFontSize');
  font-weight: v-bind('componentStylesConfig.errorMessage.undoFontWeight');
  color: v-bind('componentStylesConfig.errorMessage.undoColor');
  background-color: v-bind('componentStylesConfig.errorMessage.undoBackground');
  border: v-bind('componentStylesConfig.errorMessage.undoBorder');
  border-radius: v-bind('componentStylesConfig.errorMessage.undoBorderRadius');
  cursor: v-bind('componentStylesConfig.errorMessage.undoCursor');
  transition: v-bind('componentStylesConfig.errorMessage.undoTransition');
  overflow: v-bind('componentStylesConfig.errorMessage.undoOverflow');
  animation: v-bind('componentStylesConfig.errorMessage.undoAnimation');
}

.error-message__undo:hover {
  background-color: v-bind(
    'componentStylesConfig.errorMessage.undoHoverBackground'
  );
  border-color: v-bind(
    'componentStylesConfig.errorMessage.undoHoverBorderColor'
  );
  transform: v-bind('componentStylesConfig.errorMessage.undoHoverTransform');
  box-shadow: v-bind('componentStylesConfig.errorMessage.undoHoverShadow');
}

.error-message__undo:focus {
  outline: none;
  box-shadow: v-bind('componentStylesConfig.errorMessage.undoFocusShadow');
}

.error-message__undo:active {
  transform: v-bind('componentStylesConfig.errorMessage.undoActiveTransform');
}

/* Undo progress bar */
.error-message__undo-progress {
  position: v-bind('componentStylesConfig.errorMessage.undoProgressPosition');
  bottom: v-bind('componentStylesConfig.errorMessage.undoProgressBottom');
  left: v-bind('componentStylesConfig.errorMessage.undoProgressLeft');
  height: v-bind('componentStylesConfig.errorMessage.undoProgressHeight');
  transition: v-bind(
    'componentStylesConfig.errorMessage.undoProgressTransition'
  );
}

@keyframes undo-slide-in {
  0% {
    opacity: v-bind(
      'componentStylesConfig.errorMessage.undoSlideInStartOpacity'
    );
    transform: v-bind(
      'componentStylesConfig.errorMessage.undoSlideInStartTransform'
    );
  }
  50% {
    transform: v-bind(
      'componentStylesConfig.errorMessage.undoSlideInMidTransform'
    );
  }
  100% {
    opacity: v-bind('componentStylesConfig.errorMessage.undoSlideInEndOpacity');
    transform: v-bind(
      'componentStylesConfig.errorMessage.undoSlideInEndTransform'
    );
  }
}

.error-message--dismissible {
  padding-right: v-bind(
    'componentStylesConfig.errorMessage.dismissiblePaddingRight'
  );
}

.error-message--error {
  background-color: v-bind('themeConfig.errorMessage.error.bg');
  border: 1px solid v-bind('themeConfig.errorMessage.error.border');
  color: v-bind('themeConfig.errorMessage.error.text');
}

.error-message--warning {
  background-color: v-bind('themeConfig.errorMessage.warning.bg');
  border: 1px solid v-bind('themeConfig.errorMessage.warning.border');
  color: v-bind('themeConfig.errorMessage.warning.text');
}

.error-message--success {
  background-color: v-bind('themeConfig.errorMessage.success.bg');
  border: 1px solid v-bind('themeConfig.errorMessage.success.border');
  color: v-bind('themeConfig.errorMessage.success.text');
}

.error-message__icon {
  flex-shrink: v-bind('componentStylesConfig.errorMessage.iconFlexShrink');
  display: v-bind('componentStylesConfig.errorMessage.iconDisplay');
  align-items: v-bind('componentStylesConfig.errorMessage.iconAlignItems');
}

.error-message__icon--pulse {
  animation: icon-pulse
    v-bind('componentStylesConfig.errorMessage.iconPulseDuration') ease-in-out
    infinite;
}

@keyframes icon-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(
      v-bind('componentStylesConfig.errorMessage.iconPulseScale')
    );
    opacity: v-bind('componentStylesConfig.errorMessage.iconPulseOpacity');
  }
}

.error-message__content {
  flex: v-bind('componentStylesConfig.errorMessage.contentFlex');
  min-width: v-bind('componentStylesConfig.errorMessage.contentMinWidth');
}

.error-message__text {
  font-size: v-bind('componentStylesConfig.errorMessage.textFontSize');
  line-height: v-bind('componentStylesConfig.errorMessage.textLineHeight');
}

.error-message__action {
  margin-top: v-bind('componentStylesConfig.errorMessage.actionMarginTop');
}

.error-message__action-button {
  font-size: v-bind('componentStylesConfig.errorMessage.actionButtonFontSize');
  font-weight: v-bind(
    'componentStylesConfig.errorMessage.actionButtonFontWeight'
  );
  background-color: v-bind(
    'componentStylesConfig.errorMessage.actionButtonBackground'
  );
  border: v-bind('componentStylesConfig.errorMessage.actionButtonBorder');
  color: inherit;
  text-decoration: underline;
  cursor: pointer;
  padding: v-bind('componentStylesConfig.errorMessage.actionButtonPadding');
  border-radius: v-bind(
    'componentStylesConfig.errorMessage.actionButtonBorderRadius'
  );
  transition: v-bind(
    'componentStylesConfig.errorMessage.actionButtonTransition'
  );
  margin: v-bind('componentStylesConfig.errorMessage.actionButtonMargin');
}

.error-message__action-button:hover {
  background-color: v-bind(
    'componentStylesConfig.errorMessage.actionButtonHoverBg'
  );
  text-decoration: none;
}

.error-message__action-button:focus-visible {
  outline: v-bind(
    'componentStylesConfig.errorMessage.actionButtonFocusOutline'
  );
  outline-offset: v-bind(
    'componentStylesConfig.errorMessage.actionButtonFocusOffset'
  );
  text-decoration: none;
  background-color: v-bind(
    'componentStylesConfig.errorMessage.actionButtonHoverBg'
  );
}

/* Dismiss button styles */
.error-message__dismiss {
  position: v-bind('componentStylesConfig.errorMessage.dismissPosition');
  top: v-bind('componentStylesConfig.errorMessage.dismissTop');
  right: v-bind('componentStylesConfig.errorMessage.dismissRight');
  padding: v-bind('componentStylesConfig.errorMessage.dismissPadding');
  background: v-bind('componentStylesConfig.errorMessage.dismissBackground');
  border: v-bind('componentStylesConfig.errorMessage.dismissBorder');
  color: inherit;
  cursor: pointer;
  border-radius: v-bind(
    'componentStylesConfig.errorMessage.dismissBorderRadius'
  );
  opacity: v-bind('componentStylesConfig.errorMessage.dismissOpacity');
  transition: v-bind('componentStylesConfig.errorMessage.dismissTransition');
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-message__dismiss:hover {
  opacity: v-bind('componentStylesConfig.errorMessage.dismissHoverOpacity');
  background-color: v-bind('componentStylesConfig.errorMessage.dismissHoverBg');
  transform: v-bind('componentStylesConfig.errorMessage.dismissHoverTransform');
}

.error-message__dismiss:focus-visible {
  outline: v-bind('componentStylesConfig.errorMessage.dismissFocusOutline');
  outline-offset: v-bind(
    'componentStylesConfig.errorMessage.dismissFocusOffset'
  );
  opacity: v-bind('componentStylesConfig.errorMessage.dismissHoverOpacity');
}

/* Progress bar for auto-dismiss */
.error-message__progress {
  position: v-bind('componentStylesConfig.errorMessage.progressPosition');
  bottom: v-bind('componentStylesConfig.errorMessage.progressBottom');
  left: v-bind('componentStylesConfig.errorMessage.progressLeft');
  right: v-bind('componentStylesConfig.errorMessage.progressRight');
  height: v-bind('componentStylesConfig.errorMessage.progressHeight');
  background-color: v-bind(
    'componentStylesConfig.errorMessage.progressBgColor'
  );
  overflow: hidden;
}

.error-message__progress-bar {
  height: v-bind('componentStylesConfig.errorMessage.progressBarHeight');
  background-color: currentColor;
  opacity: v-bind('componentStylesConfig.errorMessage.progressBarOpacity');
  animation: progress-shrink linear forwards;
  transform-origin: v-bind(
    'componentStylesConfig.errorMessage.progressBarTransformOrigin'
  );
}

.error-message__progress-bar--paused {
  animation-play-state: paused;
}

@keyframes progress-shrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .error-message__action-button,
  .error-message__dismiss,
  .error-message__undo {
    transition: none;
  }

  .error-message__dismiss:hover,
  .error-message__undo:hover {
    transform: none;
  }

  .error-message__icon--pulse {
    animation: none;
  }

  .error-message__progress-bar {
    animation: none;
    opacity: 0.15;
  }

  .error-message__undo {
    animation: none;
  }

  .error-message__undo-progress {
    transition: none;
  }
}

/* Screen reader only */
.sr-only {
  position: v-bind('componentStylesConfig.errorMessage.srOnlyPosition');
  width: v-bind('componentStylesConfig.errorMessage.srOnlyWidth');
  height: v-bind('componentStylesConfig.errorMessage.srOnlyHeight');
  padding: v-bind('componentStylesConfig.errorMessage.srOnlyPadding');
  margin: v-bind('componentStylesConfig.errorMessage.srOnlyMargin');
  overflow: v-bind('componentStylesConfig.errorMessage.srOnlyOverflow');
  clip: v-bind('componentStylesConfig.errorMessage.srOnlyClip');
  white-space: v-bind('componentStylesConfig.errorMessage.srOnlyWhiteSpace');
  border-width: v-bind('componentStylesConfig.errorMessage.srOnlyBorderWidth');
}
</style>
