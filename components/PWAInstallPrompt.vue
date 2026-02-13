<template>
  <!-- Success Celebration Toast -->
  <Transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="opacity-0 translate-y-8 scale-50"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-4 scale-95"
  >
    <div
      v-if="showSuccess"
      class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        class="bg-green-500 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-success-pop"
      >
        <!-- Animated checkmark -->
        <div
          class="w-8 h-8 bg-white rounded-full flex items-center justify-center animate-check-pop"
        >
          <svg
            class="w-5 h-5 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="3"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5 13l4 4L19 7"
              class="animate-check-draw"
            />
          </svg>
        </div>
        <span class="font-medium">{{ contentConfig.pwa.installSuccess }}</span>
      </div>
      <!-- Confetti celebration -->
      <ConfettiCelebration
        :trigger="showSuccess"
        intensity="light"
        :duration="animationConfig.celebration.lightDurationMs"
      />
    </div>
  </Transition>

  <!-- Install Prompt -->
  <Transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="opacity-0 translate-y-8 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-4 scale-95"
    @after-leave="handleAfterLeave"
  >
    <div
      v-if="showPrompt && !isDismissing"
      ref="promptRef"
      role="alertdialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-description"
      tabindex="-1"
      :class="[
        'fixed bottom-4 left-1/2 transform -translate-x-1/2',
        'bg-white shadow-lg rounded-lg p-4 border border-gray-200',
        'z-40 max-w-sm w-full mx-4',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      ]"
      @keydown.esc="handleEscape"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <!-- App icon with subtle pulse animation when first shown -->
          <div
            :class="[
              'bg-gray-100 rounded-lg p-2',
              showIconPulse && 'animate-icon-pulse',
            ]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </div>
          <div>
            <h3 id="pwa-install-title" class="font-medium text-gray-900">
              Install App
            </h3>
            <p id="pwa-install-description" class="text-sm text-gray-500">
              Add to your home screen
            </p>
          </div>
        </div>
        <div class="flex space-x-2">
          <button
            ref="dismissButtonRef"
            :class="[
              'px-3 py-1 text-sm text-gray-600 hover:text-gray-800',
              'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
              'transition-all duration-200 ease-out',
              'hover:bg-gray-100 rounded-md',
              isDismissing && 'opacity-50 cursor-not-allowed',
            ]"
            :aria-label="contentConfig.pwa.aria.dismissButton"
            :disabled="isDismissing"
            @click="cancelInstall"
          >
            <span class="flex items-center gap-1">
              {{ contentConfig.pwa.notNow }}
              <kbd
                class="hidden sm:inline-flex items-center px-1 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded text-gray-500"
                aria-hidden="true"
                >Esc</kbd
              >
            </span>
          </button>
          <button
            ref="installButtonRef"
            :class="[
              'px-3 py-1 bg-blue-600 text-white text-sm rounded-md',
              'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'transition-all ease-out',
              'hover:shadow-md',
              isInstalling && 'opacity-75 cursor-wait',
            ]"
            :style="magneticStyle"
            :aria-label="contentConfig.pwa.aria.installButton"
            :disabled="isInstalling"
            @click="installPWA"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
            @mousemove="handleMouseMove"
          >
            <span class="flex items-center gap-1">
              <svg
                v-if="isInstalling"
                class="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {{
                isInstalling
                  ? contentConfig.pwa.installing
                  : contentConfig.pwa.install
              }}
            </span>
          </button>
        </div>
      </div>

      <!-- Progress bar for auto-dismiss (optional feature) -->
      <div
        v-if="autoDismissDuration > 0"
        class="absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-100 ease-linear"
        :style="{ width: `${autoDismissProgress}%` }"
        aria-hidden="true"
      />
    </div>
  </Transition>

  <!-- Screen reader announcement -->
  <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
    {{ announcement }}
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#app'
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { contentConfig } from '../configs/content.config'
import { animationConfig } from '../configs/animation.config'
import { uiConfig } from '~/configs/ui.config'
import { thresholdsConfig } from '~/configs/thresholds.config'
import { EASING } from '~/configs/easing.config'

// Storage key constants
const STORAGE_KEYS = {
  PWA_INSTALL_DISMISSED: 'pwa-install-dismissed',
} as const

interface PWAInterface {
  showInstallPrompt: boolean
  installPWA: () => void
}

const { pwa } = useNuxtApp() as unknown as { pwa: PWAInterface }

// Local state
const userDismissed = ref(false)
const isDismissing = ref(false)
const isInstalling = ref(false)
const showIconPulse = ref(false)
const showSuccess = ref(false)
const announcement = ref('')
const promptRef = ref<HTMLDivElement | null>(null)
const dismissButtonRef = ref<HTMLButtonElement | null>(null)
const installButtonRef = ref<HTMLButtonElement | null>(null)
let successDismissTimeout: ReturnType<typeof setTimeout> | null = null

// Magnetic button state
const magneticX = ref(0)
const magneticY = ref(0)
const isHovering = ref(false)
let magneticAnimationFrame: number | null = null

// Magnetic button configuration
const magneticConfig = animationConfig.magneticButton

// Computed style for magnetic effect
const magneticStyle = computed(() => {
  // Skip magnetic effect if reduced motion is preferred or button is disabled
  if (prefersReducedMotion() || isInstalling.value) {
    return {}
  }

  const duration = isHovering.value
    ? '0.1s'
    : `${magneticConfig.returnDurationMs}ms`

  return {
    transform: `translate(${magneticX.value}px, ${magneticY.value}px)`,
    transition: `transform ${duration} ${EASING.SPRING_STANDARD}`,
  }
})

// Handle mouse enter
const handleMouseEnter = (): void => {
  if (prefersReducedMotion() || isInstalling.value) return
  isHovering.value = true
}

// Handle mouse leave - smoothly return to center
const handleMouseLeave = (): void => {
  isHovering.value = false
  magneticX.value = 0
  magneticY.value = 0
}

// Handle mouse move for magnetic effect
const handleMouseMove = (event: MouseEvent): void => {
  if (prefersReducedMotion() || isInstalling.value || !installButtonRef.value)
    return

  const button = installButtonRef.value
  const rect = button.getBoundingClientRect()

  // Calculate button center
  const buttonCenterX = rect.left + rect.width / 2
  const buttonCenterY = rect.top + rect.height / 2

  // Calculate distance from mouse to button center
  const distanceX = event.clientX - buttonCenterX
  const distanceY = event.clientY - buttonCenterY
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

  // Maximum distance for magnetic effect (button diagonal + buffer)
  const maxDistance =
    Math.sqrt(rect.width * rect.width + rect.height * rect.height) * 0.8

  // Only apply magnetic effect when cursor is within range
  if (distance < maxDistance && distance > 0) {
    // Calculate magnetic pull strength (stronger when closer)
    const strength = (1 - distance / maxDistance) * magneticConfig.strength

    // Apply magnetic pull toward cursor
    const pullX =
      (distanceX / distance) * magneticConfig.maxDistancePx * strength
    const pullY =
      (distanceY / distance) * magneticConfig.maxDistancePx * strength

    // Cancel any existing animation frame
    if (magneticAnimationFrame) {
      cancelAnimationFrame(magneticAnimationFrame)
    }

    // Smooth update using requestAnimationFrame
    magneticAnimationFrame = requestAnimationFrame(() => {
      magneticX.value = pullX
      magneticY.value = pullY
    })
  } else {
    // Reset when out of range
    magneticX.value = 0
    magneticY.value = 0
  }
}

// Auto-dismiss feature (disabled by default, can be enabled with prop)
const autoDismissDuration = ref(0) // milliseconds, 0 = disabled
const autoDismissProgress = ref(100)
let autoDismissInterval: ReturnType<typeof setInterval> | null = null
let autoDismissTimeout: ReturnType<typeof setTimeout> | null = null

// Show prompt only if PWA wants to show it AND user hasn't dismissed it
const showPrompt = computed(
  () => pwa?.showInstallPrompt && !userDismissed.value
)

// Check for reduced motion preference
const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Trigger haptic feedback if available - Flexy hates hardcoded values!
const triggerHaptic = (
  pattern: number | number[] = uiConfig.haptics.patterns.light
): void => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

// Announce to screen readers
const announce = (message: string): void => {
  announcement.value = message
  setTimeout(() => {
    announcement.value = ''
  }, uiConfig.feedback.announcementClearMs)
}

// Handle escape key
const handleEscape = (event: KeyboardEvent): void => {
  if (event.key === 'Escape' && !isDismissing.value) {
    cancelInstall()
  }
}

// Install PWA with loading state
const installPWA = async (): Promise<void> => {
  if (isInstalling.value) return

  isInstalling.value = true
  triggerHaptic([20, 30, 20]) // Success pattern
  announce('Installing app...')

  try {
    await pwa?.installPWA()
    // Show success celebration
    showSuccess.value = true
    triggerHaptic([50, 100, 50]) // Celebration pattern
    announce(contentConfig.pwa.installSuccess)

    // Auto-dismiss success toast after configured delay
    successDismissTimeout = setTimeout(() => {
      showSuccess.value = false
    }, animationConfig.pwaInstallPrompt.successDismissDelayMs)
  } catch {
    announce('Installation cancelled or failed')
  } finally {
    isInstalling.value = false
  }
}

// Cancel installation with smooth dismissal
const cancelInstall = (): void => {
  if (isDismissing.value) return

  // Trigger haptic feedback
  triggerHaptic(10) // Light tap

  // Start dismissal animation
  isDismissing.value = true
  announce('Installation prompt dismissed')

  // Store dismissal in session so it doesn't reappear during this session
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEYS.PWA_INSTALL_DISMISSED, 'true')
  }

  // Clear auto-dismiss timers
  clearAutoDismiss()
}

// Handle after leave animation
const handleAfterLeave = (): void => {
  userDismissed.value = true
}

// Clear auto-dismiss timers
const clearAutoDismiss = (): void => {
  if (autoDismissInterval) {
    clearInterval(autoDismissInterval)
    autoDismissInterval = null
  }
  if (autoDismissTimeout) {
    clearTimeout(autoDismissTimeout)
    autoDismissTimeout = null
  }
}

// Setup auto-dismiss (if enabled)
const setupAutoDismiss = (): void => {
  if (autoDismissDuration.value <= 0) return

  const updateInterval = animationConfig.pwaInstall.autoDismissIntervalMs // Update every 50ms
  const decrement = (100 / autoDismissDuration.value) * updateInterval

  autoDismissInterval = setInterval(() => {
    autoDismissProgress.value -= decrement
    if (autoDismissProgress.value <= 0) {
      autoDismissProgress.value = 0
      clearAutoDismiss()
      cancelInstall()
    }
  }, updateInterval)
}

// Focus management - focus the dismiss button when prompt appears
onMounted(async () => {
  // Check if user previously dismissed in this session
  if (typeof sessionStorage !== 'undefined') {
    const previouslyDismissed = sessionStorage.getItem(
      STORAGE_KEYS.PWA_INSTALL_DISMISSED
    )
    if (previouslyDismissed === 'true') {
      userDismissed.value = true
    }
  }

  // Show icon pulse animation on first appearance (skip if reduced motion)
  if (showPrompt.value && !prefersReducedMotion()) {
    showIconPulse.value = true
    setTimeout(() => {
      showIconPulse.value = false
    }, animationConfig.pwaInstall.iconPulseDurationSec * 1000)
  }

  // Focus management for accessibility
  if (showPrompt.value) {
    await nextTick()
    // Small delay to allow transition to start
    setTimeout(() => {
      dismissButtonRef.value?.focus()
    }, thresholdsConfig.focus.transitionFocusDelayMs)

    // Setup auto-dismiss if enabled
    setupAutoDismiss()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  clearAutoDismiss()
  if (successDismissTimeout) {
    clearTimeout(successDismissTimeout)
  }
  if (magneticAnimationFrame) {
    cancelAnimationFrame(magneticAnimationFrame)
  }
})
</script>

<style scoped>
/* Icon pulse animation for initial appearance */
.animate-icon-pulse {
  animation: icon-pulse
    v-bind('`${animationConfig.pwaInstall.iconPulseDurationSec}s`') ease-in-out;
}

@keyframes icon-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
  }
}

/* Spinner animation for loading state */
.animate-spin {
  animation: spin v-bind('`${animationConfig.pwaInstall.spinDurationSec}s`')
    linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-icon-pulse {
    animation: none;
  }

  .animate-spin {
    animation: none;
    opacity: 0.5;
  }

  /* Override Vue transition classes - Flexy hates hardcoded values! */
  :deep(.transition-all) {
    transition: opacity
      v-bind('`${animationConfig.transition.normal.durationMs}ms`') ease-out !important;
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

/* Success toast spring animation - Flexy hates hardcoded values! */
.animate-success-pop {
  animation: success-pop
    v-bind('`${animationConfig.pwaInstallPrompt.successPopDurationSec}s`')
    v-bind('animationConfig.pwaInstallPrompt.easing') forwards;
}

@keyframes success-pop {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(20px);
  }
  60% {
    transform: scale(1.05) translateY(-4px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Checkmark container pop animation - Flexy hates hardcoded values! */
.animate-check-pop {
  animation: check-pop
    v-bind('`${animationConfig.pwaInstallPrompt.checkPopDurationSec}s`')
    v-bind('animationConfig.pwaInstallPrompt.easing')
    v-bind('`${animationConfig.pwaInstallPrompt.checkPopDelaySec}s`') both;
}

@keyframes check-pop {
  0% {
    transform: scale(0);
  }
  60% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Checkmark draw animation - Flexy hates hardcoded values! */
.animate-check-draw {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  animation: check-draw
    v-bind('`${animationConfig.pwaInstallPrompt.checkDrawDurationSec}s`')
    ease-out v-bind('`${animationConfig.pwaInstallPrompt.checkDrawDelaySec}s`')
    forwards;
}

@keyframes check-draw {
  to {
    stroke-dashoffset: 0;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  div[role='alertdialog'] {
    border: 2px solid currentColor;
  }
}

/* Reduced motion support for success animations */
@media (prefers-reduced-motion: reduce) {
  .animate-success-pop,
  .animate-check-pop,
  .animate-check-draw {
    animation: none;
  }

  .animate-success-pop {
    opacity: 1;
    transform: none;
  }

  .animate-check-pop {
    transform: scale(1);
  }

  .animate-check-draw {
    stroke-dashoffset: 0;
  }
}
</style>
