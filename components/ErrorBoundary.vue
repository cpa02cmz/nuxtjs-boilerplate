<template>
  <div class="error-boundary-wrapper">
    <Transition
      name="error-fade"
      @after-enter="onErrorEntered"
    >
      <div
        v-if="hasError"
        ref="errorContainer"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        class="error-boundary"
        :class="{ 'animate-shake': !reducedMotion && isFirstAppearance }"
      >
        <div class="error-content">
          <!-- Animated Error Illustration -->
          <div
            class="error-illustration"
            aria-hidden="true"
          >
            <!-- Background Circle with Pulse -->
            <div
              v-if="!reducedMotion"
              class="error-bg-circle"
            />

            <!-- Warning Icon Container -->
            <div
              class="error-icon-container"
              :class="{ 'animate-icon-pulse': !reducedMotion }"
            >
              <svg
                class="error-icon-svg"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <!-- Warning Triangle -->
                <path
                  class="error-triangle"
                  :class="{ 'animate-draw-triangle': !reducedMotion }"
                  d="M12 2L2 20h20L12 2z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  fill="none"
                />
                <!-- Exclamation Mark -->
                <line
                  class="error-exclamation-line"
                  :class="{ 'animate-draw-line': !reducedMotion }"
                  x1="12"
                  y1="9"
                  x2="12"
                  y2="14"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <circle
                  class="error-exclamation-dot"
                  :class="{ 'animate-draw-dot': !reducedMotion }"
                  cx="12"
                  cy="17"
                  r="1"
                  fill="currentColor"
                />
              </svg>
            </div>

            <!-- Floating Warning Elements -->
            <div
              v-if="!reducedMotion"
              class="floating-element floating-element-1"
            />
            <div
              v-if="!reducedMotion"
              class="floating-element floating-element-2"
            />
            <div
              v-if="!reducedMotion"
              class="floating-element floating-element-3"
            />
          </div>

          <h2
            id="error-title"
            ref="errorTitle"
            class="error-title"
            tabindex="-1"
          >
            Something went wrong
          </h2>
          <p
            id="error-message"
            class="error-message"
          >
            {{ errorMessage }}
          </p>
          <div
            v-if="showDetails"
            class="error-details"
          >
            <details class="error-details-container">
              <summary class="error-details-summary">
                Error Details
              </summary>
              <pre class="error-stack">{{ errorStack }}</pre>
            </details>
          </div>
          <div class="error-actions">
            <button
              ref="retryButton"
              class="retry-button"
              :aria-label="`Retry ${fallbackComponentName || 'component'}`"
              @click="resetError"
            >
              Try Again
            </button>
            <button
              class="home-button"
              aria-label="Go to home page"
              @click="goHome"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </Transition>
    <slot v-if="!hasError" />
  </div>
</template>

<script setup lang="ts">
import { onErrorCaptured, ref, computed, nextTick } from 'vue'
import { logError } from '~/utils/errorLogger'
import { componentStylesConfig } from '~/configs/component-styles.config'
import { themeConfig } from '~/configs/theme.config'
import { animationConfig } from '~/configs/animation.config'
import { ROUTE_PATTERNS } from '~/configs/routes.config'

interface ErrorInfo {
  componentStack: string
}

interface Props {
  componentName?: string
  showDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  componentName: undefined,
  showDetails: false,
})

const error = ref<Error | null>(null)
const errorInfo = ref<ErrorInfo | null>(null)
const errorContainer = ref<HTMLDivElement | null>(null)
const retryButton = ref<HTMLButtonElement | null>(null)
const previousFocus = ref<HTMLElement | null>(null)
const isFirstAppearance = ref(true)

// Respect user's motion preferences
const reducedMotion = computed(() => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

const emit = defineEmits<{
  error: [error: Error, info: ErrorInfo]
  reset: []
}>()

const hasError = computed(() => error.value !== null)
const errorMessage = computed(
  () => error.value?.message || 'An unexpected error occurred'
)
const errorStack = computed(() => error.value?.stack || '')
const fallbackComponentName = computed(() => props.componentName || 'component')

/**
 * Save the currently focused element before showing error
 * Guarded for SSR - document is not available during server-side rendering
 */
const saveCurrentFocus = () => {
  if (typeof document !== 'undefined') {
    previousFocus.value = document.activeElement as HTMLElement
  }
}

/**
 * Restore focus to the previously focused element
 */
const restorePreviousFocus = () => {
  if (previousFocus.value && typeof previousFocus.value.focus === 'function') {
    nextTick(() => {
      previousFocus.value?.focus()
    })
  }
}

/**
 * Focus management when error boundary appears
 * Focuses the retry button for immediate keyboard access
 */
const onErrorEntered = () => {
  // Focus the retry button for immediate keyboard accessibility
  nextTick(() => {
    retryButton.value?.focus()
  })
}

const throwError = (err: Error, info: ErrorInfo) => {
  saveCurrentFocus()
  error.value = err
  errorInfo.value = info
  isFirstAppearance.value = true
  logError(`ErrorBoundary caught error: ${err.message}`, err, 'ErrorBoundary', {
    componentStack: info.componentStack,
  })
  emit('error', err, info)

  // Reset first appearance after shake animation completes
  setTimeout(() => {
    isFirstAppearance.value = false
  }, animationConfig.errorBoundary.shakeDurationMs)
}

const resetError = () => {
  error.value = null
  errorInfo.value = null
  restorePreviousFocus()
  emit('reset')
}

const goHome = () => {
  error.value = null
  errorInfo.value = null
  restorePreviousFocus()
  // Flexy hates hardcoded routes! Use ROUTE_PATTERNS
  navigateTo(ROUTE_PATTERNS.pages.home)
}

onErrorCaptured((err, instance, info) => {
  throwError(err, { componentStack: info })
  return false // Prevent the error from propagating further
})
</script>

<style scoped>
/* Flexy hates hardcoded values! Using config-bound CSS custom properties */
.error-boundary {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: v-bind('componentStylesConfig.errorBoundary.minHeight');
  padding: 1rem;
}

.error-content {
  text-align: center;
  max-width: v-bind('componentStylesConfig.errorBoundary.maxWidth');
}

/* Animated Error Illustration */
.error-illustration {
  position: relative;
  width: v-bind('componentStylesConfig.errorBoundary.illustrationSize');
  height: v-bind('componentStylesConfig.errorBoundary.illustrationSize');
  margin: 0 auto v-bind('componentStylesConfig.errorBoundary.iconMarginBottom');
}

.error-bg-circle {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.1) 0%,
    rgba(239, 68, 68, 0.05) 100%
  );
  border-radius: 50%;
  animation: error-bg-pulse
    v-bind('`${animationConfig.errorBoundary.pulseDurationSec}s`') ease-in-out
    infinite;
}

.error-icon-container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-icon-svg {
  width: v-bind('componentStylesConfig.errorBoundary.iconSize');
  height: v-bind('componentStylesConfig.errorBoundary.iconSize');
  color: v-bind('themeConfig.errorBoundary.iconColor');
}

.error-triangle {
  transform-origin: center;
}

.error-exclamation-line {
  transform-origin: center;
}

.error-exclamation-dot {
  transform-origin: center;
  opacity: 0;
}

.animate-draw-triangle {
  animation: draw-triangle
    v-bind('`${animationConfig.errorBoundary.drawDurationSec}s`') ease-out
    forwards;
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
}

.animate-draw-line {
  animation: draw-line
    v-bind('`${animationConfig.errorBoundary.drawDurationSec}s`') ease-out
    forwards;
  animation-delay: v-bind('`${animationConfig.errorBoundary.drawDelaySec}s`');
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
}

.animate-draw-dot {
  animation: draw-dot
    v-bind('`${animationConfig.errorBoundary.dotDurationSec}s`') ease-out
    forwards;
  animation-delay: v-bind('`${animationConfig.errorBoundary.dotDelaySec}s`');
}

.animate-icon-pulse {
  animation: icon-pulse
    v-bind('`${animationConfig.errorBoundary.iconPulseDurationSec}s`')
    ease-in-out infinite;
  animation-delay: v-bind(
    '`${animationConfig.errorBoundary.iconPulseDelaySec}s`'
  );
}

/* Floating Warning Elements */
.floating-element {
  position: absolute;
  border-radius: 50%;
  background-color: v-bind('themeConfig.errorBoundary.floatingElementColor');
}

.floating-element-1 {
  width: v-bind('componentStylesConfig.errorBoundary.floatingElementSizeSmall');
  height: v-bind(
    'componentStylesConfig.errorBoundary.floatingElementSizeSmall'
  );
  top: 10%;
  right: 15%;
  animation: float-1
    v-bind('`${animationConfig.errorBoundary.floatDurationSec}s`') ease-in-out
    infinite;
}

.floating-element-2 {
  width: v-bind(
    'componentStylesConfig.errorBoundary.floatingElementSizeMedium'
  );
  height: v-bind(
    'componentStylesConfig.errorBoundary.floatingElementSizeMedium'
  );
  bottom: 20%;
  left: 10%;
  animation: float-2
    v-bind('`${animationConfig.errorBoundary.floatDurationSec}s`') ease-in-out
    infinite;
  animation-delay: v-bind('`${animationConfig.errorBoundary.floatDelaySec}s`');
}

.floating-element-3 {
  width: v-bind('componentStylesConfig.errorBoundary.floatingElementSizeSmall');
  height: v-bind(
    'componentStylesConfig.errorBoundary.floatingElementSizeSmall'
  );
  bottom: 30%;
  right: 20%;
  animation: float-3
    v-bind('`${animationConfig.errorBoundary.floatDurationSec}s`') ease-in-out
    infinite;
  animation-delay: v-bind(
    '`${animationConfig.errorBoundary.floatDelaySec * 2}s`'
  );
}

.error-title {
  font-size: v-bind('componentStylesConfig.errorBoundary.titleFontSize');
  font-weight: bold;
  color: v-bind('themeConfig.errorBoundary.titleColor');
  margin-bottom: v-bind(
    'componentStylesConfig.errorBoundary.titleMarginBottom'
  );
}

.error-title:focus {
  outline: 2px solid v-bind('themeConfig.focusRing');
  outline-offset: 2px;
}

.error-message {
  color: v-bind('themeConfig.errorBoundary.messageColor');
  margin-bottom: 1.5rem;
  font-size: v-bind('componentStylesConfig.errorBoundary.messageFontSize');
}

.error-actions {
  display: flex;
  gap: v-bind('componentStylesConfig.errorBoundary.buttonGap');
  justify-content: center;
}

.retry-button,
.home-button {
  padding: v-bind('componentStylesConfig.errorBoundary.buttonPadding');
  border-radius: v-bind(
    'componentStylesConfig.errorBoundary.buttonBorderRadius'
  );
  font-size: v-bind('componentStylesConfig.errorBoundary.buttonFontSize');
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-button:focus,
.home-button:focus {
  outline: 2px solid v-bind('themeConfig.focusRing');
  outline-offset: 2px;
}

.retry-button {
  background-color: v-bind('themeConfig.errorBoundary.primaryButtonBg');
  color: white;
  border: 1px solid v-bind('themeConfig.errorBoundary.primaryButtonBorder');
}

.retry-button:hover {
  background-color: v-bind('themeConfig.errorBoundary.primaryButtonHover');
}

.home-button {
  background-color: v-bind('themeConfig.errorBoundary.secondaryButtonBg');
  color: v-bind('themeConfig.errorBoundary.secondaryButtonText');
  border: 1px solid v-bind('themeConfig.errorBoundary.secondaryButtonBorder');
}

.home-button:hover {
  background-color: v-bind('themeConfig.errorBoundary.secondaryButtonHover');
}

/* Shake Animation - draws attention to error */
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(
      v-bind('`${-animationConfig.errorBoundary.shakeIntensityPx}px`')
    );
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(
      v-bind('`${animationConfig.errorBoundary.shakeIntensityPx}px`')
    );
  }
}

.animate-shake {
  animation: shake
    v-bind('`${animationConfig.errorBoundary.shakeDurationMs}ms`')
    cubic-bezier(0.36, 0, 0.66, -0.56);
}

/* Error Illustration Animations */
@keyframes error-bg-pulse {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.02);
  }
}

@keyframes draw-triangle {
  from {
    stroke-dashoffset: 100;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes draw-line {
  from {
    stroke-dashoffset: 20;
    opacity: 0;
  }
  to {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

@keyframes draw-dot {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes icon-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes float-1 {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-10px) scale(1.1);
    opacity: 0.8;
  }
}

@keyframes float-2 {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-8px) scale(1.05);
    opacity: 0.7;
  }
}

@keyframes float-3 {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-6px) scale(1.08);
    opacity: 0.6;
  }
}

/* Vue Transition classes */
.error-fade-enter-active,
.error-fade-leave-active {
  transition:
    opacity v-bind('animationConfig.errorBoundary.transitionDuration') ease,
    transform v-bind('animationConfig.errorBoundary.transitionDuration') ease;
}

.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .error-fade-enter-active,
  .error-fade-leave-active {
    transition: opacity 0.01ms;
  }

  .error-fade-enter-from,
  .error-fade-leave-to {
    transform: none;
  }

  .animate-shake {
    animation: none;
  }

  .animate-draw-triangle,
  .animate-draw-line,
  .animate-draw-dot,
  .animate-icon-pulse {
    animation: none;
    stroke-dashoffset: 0;
    opacity: 1;
  }

  .error-exclamation-dot {
    opacity: 1;
  }

  .error-bg-circle,
  .floating-element {
    animation: none;
  }

  .retry-button,
  .home-button {
    transition: none;
  }
}
</style>
