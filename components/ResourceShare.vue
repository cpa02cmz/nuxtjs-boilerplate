<template>
  <div class="resource-share">
    <h3 class="text-lg font-medium text-gray-900 mb-3">
      {{ contentConfig.socialShare.heading }}
    </h3>
    <div class="flex flex-wrap gap-3">
      <!-- Social Share Buttons with Micro-UX Enhancements -->
      <a
        v-for="platform in socialPlatforms"
        :key="platform.name"
        :href="shareUrls[platform.name]"
        target="_blank"
        rel="noopener noreferrer"
        :class="[
          'share-button',
          `share-button--${platform.name}`,
          { 'share-button--pressed': pressedButton === platform.name },
        ]"
        :aria-label="contentConfig.socialShare.ariaLabels[platform.name]"
        @click="handleSocialClick(platform.name, $event)"
        @mousedown="setPressed(platform.name)"
        @mouseup="clearPressed"
        @mouseleave="clearPressed"
        @touchstart="setPressed(platform.name)"
        @touchend="clearPressed"
      >
        <!-- Button Ripple Effect -->
        <span
          v-if="rippleButton === platform.name"
          class="share-button__ripple"
          :style="rippleStyle"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 relative z-10"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path :d="platform.iconPath" />
        </svg>
      </a>

      <!--
        🎨 Pallete's micro-UX enhancement: Copy button with keyboard shortcut hint
        - Shows helpful Ctrl+C hint on hover/focus for better discoverability
        - Smooth tooltip animations with reduced motion support
        - Helps users discover keyboard shortcuts for faster workflows
      -->
      <button
        ref="copyButtonRef"
        :class="[
          'share-button',
          'share-button--copy',
          { 'share-button--pressed': pressedButton === 'copy' },
          { 'share-button--copied': showCopySuccess },
        ]"
        :aria-label="contentConfig.socialShare.ariaLabels.copy"
        @click="handleCopyClick"
        @mousedown="setPressed('copy')"
        @mouseup="clearPressed"
        @mouseleave="clearPressed"
        @touchstart="setPressed('copy')"
        @touchend="clearPressed"
        @mouseenter="showCopyHint = true"
        @focus="showCopyHint = true"
        @blur="showCopyHint = false"
      >
        <!-- Keyboard shortcut hint tooltip -->
        <Transition
          :enter-active-class="`transition-all ${animationConfig.tailwindDurations.normal} ease-out`"
          enter-from-class="opacity-0 scale-95 translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          :leave-active-class="`transition-all ${animationConfig.tailwindDurations.fast} ease-in`"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-1"
        >
          <span
            v-if="showCopyHint && !showCopySuccess && !prefersReducedMotion"
            class="copy-shortcut-hint"
            role="tooltip"
            aria-hidden="true"
          >
            <span class="copy-shortcut-hint__content">
              <kbd class="copy-shortcut-hint__key">Ctrl</kbd>
              <span class="copy-shortcut-hint__plus">+</span>
              <kbd class="copy-shortcut-hint__key">C</kbd>
              <span class="copy-shortcut-hint__label">to copy</span>
            </span>
            <span class="copy-shortcut-hint__arrow" />
          </span>
        </Transition>
        <!-- Button Ripple Effect -->
        <span
          v-if="rippleButton === 'copy'"
          class="share-button__ripple"
          :style="rippleStyle"
        />

        <!-- Copy Success Animation -->
        <!-- Flexy hates hardcoded duration-200 and duration-150! Using animationConfig.tailwindDurations -->
        <Transition
          :enter-active-class="`transition-all ${animationConfig.tailwindDurations.normal} ease-out`"
          enter-from-class="opacity-0 scale-50"
          enter-to-class="opacity-100 scale-100"
          :leave-active-class="`transition-all ${animationConfig.tailwindDurations.quick} ease-in`"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-75"
        >
          <span
            v-if="showCopySuccess"
            class="copy-success-indicator"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
        </Transition>

        <!-- Default Copy Icon -->
        <svg
          v-show="!showCopySuccess"
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 relative z-10"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path
            d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h4a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"
          />
        </svg>
      </button>
    </div>

    <!-- Screen Reader Announcement for Copy Success -->
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
      {{ screenReaderAnnouncement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { socialConfig } from '~/configs/social.config'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'
import { zIndexScale } from '~/configs/z-index.config'
import { shadowsConfig } from '~/configs/shadows.config'
import { hapticLight, hapticSuccess } from '~/utils/hapticFeedback'

interface ShareUrls {
  twitter: string
  facebook: string
  linkedin: string
  reddit: string
}

interface Props {
  shareUrls: ShareUrls
}

defineProps<Props>()

const emit = defineEmits<{
  copy: []
}>()

// 🎨 Pallete's micro-UX enhancement: Reactive state for delightful interactions
const pressedButton = ref<string | null>(null)
const rippleButton = ref<string | null>(null)
const ripplePosition = ref({ x: 0, y: 0 })
const showCopySuccess = ref(false)
const showCopyHint = ref(false)
const screenReaderAnnouncement = ref('')
const copyButtonRef = ref<HTMLButtonElement | null>(null)

// 🎨 Pallete's micro-UX enhancement: Check for reduced motion preference
const prefersReducedMotion = ref(false)
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Social platform configurations with icons
const socialPlatforms = computed(() => [
  {
    name: 'twitter' as const,
    iconPath:
      'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
  },
  {
    name: 'facebook' as const,
    iconPath:
      'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  {
    name: 'linkedin' as const,
    iconPath:
      'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  {
    name: 'reddit' as const,
    iconPath:
      'M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z',
  },
])

// Ripple effect style
const rippleStyle = computed(() => ({
  left: `${ripplePosition.value.x}px`,
  top: `${ripplePosition.value.y}px`,
}))

// Set pressed state for button press animation
const setPressed = (buttonName: string) => {
  pressedButton.value = buttonName
}

// Clear pressed state
const clearPressed = () => {
  pressedButton.value = null
}

// Create ripple effect at click position
const createRipple = (event: MouseEvent | TouchEvent, buttonName: string) => {
  const target = event.currentTarget as HTMLElement
  if (!target) return

  const rect = target.getBoundingClientRect()

  // Handle both mouse and touch events
  let clientX: number, clientY: number
  if ('touches' in event && event.touches.length > 0) {
    clientX = event.touches[0].clientX
    clientY = event.touches[0].clientY
  } else if ('clientX' in event) {
    clientX = event.clientX
    clientY = event.clientY
  } else {
    // Center of button if no coordinates available
    clientX = rect.left + rect.width / 2
    clientY = rect.top + rect.height / 2
  }

  ripplePosition.value = {
    x: clientX - rect.left,
    y: clientY - rect.top,
  }

  rippleButton.value = buttonName

  // Clear ripple after animation completes
  setTimeout(() => {
    if (rippleButton.value === buttonName) {
      rippleButton.value = null
    }
  }, animationConfig.button.rippleDurationMs)
}

// Handle social button clicks with haptic feedback
const handleSocialClick = (platform: string, event: MouseEvent) => {
  // Create ripple effect
  createRipple(event, platform)

  // Trigger haptic feedback for mobile users
  hapticLight()

  // Announce to screen readers
  screenReaderAnnouncement.value = `Opening ${platform} share dialog`
  setTimeout(() => {
    screenReaderAnnouncement.value = ''
  }, animationConfig.microInteractions.announcementDelayMs)
}

// Handle copy button click with success animation
const handleCopyClick = async (event: MouseEvent) => {
  // 🎨 Pallete's micro-UX enhancement: Hide hint when clicked
  showCopyHint.value = false

  // Create ripple effect
  createRipple(event, 'copy')

  // Emit copy event
  emit('copy')

  // Show success state
  showCopySuccess.value = true

  // Trigger haptic feedback - success pattern
  hapticSuccess()

  // Announce to screen readers
  screenReaderAnnouncement.value = 'Link copied to clipboard'

  // Hide success state after delay
  setTimeout(() => {
    showCopySuccess.value = false
  }, animationConfig.copyFeedback.durationMs)

  // Clear announcement
  setTimeout(() => {
    screenReaderAnnouncement.value = ''
  }, animationConfig.microInteractions.announcementDelayMs)
}

// 🎨 Pallete's micro-UX enhancement: Lifecycle hooks for reduced motion support
let mediaQueryRef: MediaQueryList | null = null

const handleMotionChange = (e: MediaQueryListEvent) => {
  prefersReducedMotion.value = e.matches
}

onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()
  if (typeof window !== 'undefined' && window.matchMedia) {
    mediaQueryRef = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQueryRef.addEventListener('change', handleMotionChange)
  }
})

onUnmounted(() => {
  if (mediaQueryRef) {
    mediaQueryRef.removeEventListener('change', handleMotionChange)
    mediaQueryRef = null
  }
})
</script>

<style scoped>
/* Base Resource Share Container */
.resource-share {
  margin-bottom: v-bind(
    '`${animationConfig.pixels?.shareSectionMargin || 32}px`'
  );
}

/* Share Button Base Styles - Palette's micro-UX enhancement! */
.share-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: v-bind('`${animationConfig.pixels?.shareButtonPadding || 8}px`');
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: all
    v-bind('`${animationConfig.button?.feedbackDurationMs || 150}ms`') ease-out;
  will-change: transform;
  backface-visibility: hidden;
}

/* Button Press Animation - Tactile feedback */
.share-button--pressed {
  transform: scale(0.92);
}

/* Button Hover Effects */
.share-button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: v-bind('shadowsConfig.resourceShare.default');
}

.share-button:active {
  transform: scale(0.92);
}

/* Ripple Effect - Material Design inspired */
.share-button__ripple {
  position: absolute;
  width: v-bind('`${(animationConfig.pixels?.rippleSize || 100)}px`');
  height: v-bind('`${(animationConfig.pixels?.rippleSize || 100)}px`');
  margin-left: v-bind(
    '`${-(animationConfig.pixels?.rippleSize || 100) / 2}px`'
  );
  margin-top: v-bind('`${-(animationConfig.pixels?.rippleSize || 100) / 2}px`');
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transform: scale(0);
  animation: ripple-animation
    v-bind('`${animationConfig.button?.rippleDurationMs || 400}ms`') ease-out
    forwards;
  pointer-events: none;
  z-index: v-bind('zIndexScale.low[5]');
}

@keyframes ripple-animation {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Copy Success Animation */
.share-button--copied {
  background: linear-gradient(
    135deg,
    v-bind('animationConfig.gradients?.emerald?.start') 0%,
    v-bind('animationConfig.gradients?.emerald?.end') 100%
  ) !important;
  color: white !important;
}

.copy-success-indicator {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: v-bind('zIndexScale.low[10]');
  animation: success-pop
    v-bind('`${animationConfig.copyFeedback?.successPopDurationMs || 300}ms`')
    ease-out;
}

@keyframes success-pop {
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

/* Platform-specific button styles using config */
.share-button--twitter {
  background-color: v-bind('socialConfig.platformStyles.twitter.button.bg');
  color: v-bind('socialConfig.platformStyles.twitter.button.text');
}

.share-button--twitter:hover {
  background-color: v-bind(
    'socialConfig.platformStyles.twitter.button.hover.replace("hover:", "")'
  );
}

.share-button--facebook {
  background-color: v-bind('socialConfig.platformStyles.facebook.button.bg');
  color: v-bind('socialConfig.platformStyles.facebook.button.text');
}

.share-button--linkedin {
  background-color: v-bind('socialConfig.platformStyles.linkedin.button.bg');
  color: v-bind('socialConfig.platformStyles.linkedin.button.text');
}

.share-button--reddit {
  background-color: v-bind('socialConfig.platformStyles.reddit.button.bg');
  color: v-bind('socialConfig.platformStyles.reddit.button.text');
}

.share-button--copy {
  background-color: v-bind('socialConfig.platformStyles.copy.button.bg');
  color: v-bind('socialConfig.platformStyles.copy.button.text');
  border: 1px solid v-bind('socialConfig.platformStyles.copy.button.border');
}

/* Focus states for accessibility */
.share-button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
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

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .share-button {
    transition: none;
  }

  .share-button:hover {
    transform: none;
  }

  .share-button--pressed {
    transform: scale(0.95);
  }

  .share-button__ripple {
    display: none;
  }

  .copy-success-indicator {
    animation: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .share-button {
    border: 2px solid currentColor;
  }

  .share-button:focus-visible {
    outline: 3px solid currentColor;
    outline-offset: 3px;
  }
}

/*
  🎨 Pallete's micro-UX enhancement: Keyboard shortcut hint styles
  Tooltip that helps users discover Ctrl+C shortcut for faster copying
*/
.copy-shortcut-hint {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  z-index: v-bind('zIndexScale.high[100]');
  pointer-events: none;
}

.copy-shortcut-hint__content {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: linear-gradient(
    135deg,
    v-bind('animationConfig.gradients?.blue?.start || "#1f2937"') 0%,
    v-bind('animationConfig.gradients?.blue?.end || "#374151"') 100%
  );
  color: white;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  white-space: nowrap;
  box-shadow: v-bind(
    'shadowsConfig.resourceShare.default || "0 4px 6px -1px rgba(0, 0, 0, 0.1)"'
  );
}

.copy-shortcut-hint__key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.copy-shortcut-hint__plus {
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
}

.copy-shortcut-hint__label {
  margin-left: 4px;
  color: rgba(255, 255, 255, 0.9);
}

.copy-shortcut-hint__arrow {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid
    v-bind('animationConfig.gradients?.blue?.end || "#374151"');
}

/* Show hint on focus for keyboard users */
.share-button:focus-visible .copy-shortcut-hint {
  opacity: 1;
  visibility: visible;
}

/* Reduced motion support for keyboard hint */
@media (prefers-reduced-motion: reduce) {
  .copy-shortcut-hint {
    transition: none;
  }
}
</style>
