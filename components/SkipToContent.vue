<template>
  <!-- Skip Link Container - Palette's micro-UX enhancement! -->
  <div
    class="skip-link-container"
    :class="{
      'skip-link--visible': isVisible,
      'skip-link--reduced-motion': prefersReducedMotion,
    }"
  >
    <!-- Enhanced Skip to Content Button -->
    <a
      ref="skipLinkRef"
      href="#main-content"
      class="skip-link"
      :class="{
        'skip-link--focused': isFocused,
        'skip-link--animating': isAnimating && !prefersReducedMotion,
      }"
      :aria-label="contentConfig.skipLink.ariaLabel"
      @click.prevent="handleSkipClick"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeyDown"
    >
      <!-- Icon -->
      <span class="skip-link__icon" aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </span>

      <!-- Label -->
      <span class="skip-link__text">
        {{ contentConfig.skipLink.label }}
      </span>

      <!-- Keyboard Shortcut Hint -->
      <kbd class="skip-link__shortcut" aria-hidden="true">
        {{ shortcutKey }}
      </kbd>
    </a>

    <!-- Decorative Glow Effect -->
    <div
      v-if="isFocused && !prefersReducedMotion"
      class="skip-link__glow"
      aria-hidden="true"
    />
  </div>

  <!-- Screen reader announcement -->
  <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
    {{ announcement }}
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'
import { componentColorsConfig } from '~/configs/component-colors.config'
import { hapticLight } from '~/utils/hapticFeedback'

// Palette's micro-UX enhancement: Track visibility state
const isVisible = ref(false)
const isFocused = ref(false)
const isAnimating = ref(false)
const skipLinkRef = ref<HTMLAnchorElement | null>(null)
const announcement = ref('')
const prefersReducedMotion = ref(false)

// Get shortcut key from config
const shortcutKey = contentConfig.skipLink.shortcutKey

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Handle focus - show the skip link with animation
const handleFocus = () => {
  isFocused.value = true
  isVisible.value = true
  isAnimating.value = true

  // Reset animation flag after entrance animation
  setTimeout(() => {
    isAnimating.value = false
  }, animationConfig.skipLink.entranceDurationMs)
}

// Handle blur - hide after delay unless user is navigating
const handleBlur = () => {
  isFocused.value = false
  // Small delay to allow clicking
  setTimeout(() => {
    if (!isFocused.value) {
      isVisible.value = false
    }
  }, animationConfig.skipLink.blurDelayMs)
}

// Handle keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  // Allow Escape to hide the skip link
  if (event.key === 'Escape') {
    event.preventDefault()
    isVisible.value = false
    isFocused.value = false
    // Return focus to body
    if (typeof document !== 'undefined') {
      document.body.focus()
    }
  }

  // Allow Enter or Space to activate
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleSkipClick()
  }
}

// Handle skip click with smooth scroll and focus management
const handleSkipClick = async () => {
  // Haptic feedback for mobile users
  hapticLight()

  // Find main content
  const mainContent = document.getElementById('main-content')
  if (!mainContent) {
    // Fallback to standard navigation
    window.location.hash = 'main-content'
    return
  }

  // Smooth scroll to main content
  mainContent.scrollIntoView({
    behavior: prefersReducedMotion.value ? 'auto' : 'smooth',
  })

  // Set focus to main content for keyboard users
  mainContent.setAttribute('tabindex', '-1')
  mainContent.focus({ preventScroll: true })

  // Remove tabindex after focus to keep it out of normal tab order
  setTimeout(() => {
    mainContent.removeAttribute('tabindex')
  }, animationConfig.skipLink.focusRestoreDelayMs)

  // Announce to screen readers
  announcement.value = contentConfig.skipLink.announcement
  setTimeout(() => {
    announcement.value = ''
  }, animationConfig.skipLink.announcementClearMs)

  // Hide skip link
  isVisible.value = false
  isFocused.value = false

  // Update URL hash without jumping
  if (typeof history !== 'undefined') {
    history.pushState(null, '', '#main-content')
  }
}

// Global keyboard shortcut handler
const handleGlobalKeyDown = (event: KeyboardEvent) => {
  // Skip if user is typing in an input
  const target = event.target as HTMLElement
  if (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  ) {
    return
  }

  // Check for configured shortcut key
  if (
    event.key === shortcutKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey
  ) {
    event.preventDefault()
    // Show and focus the skip link
    isVisible.value = true
    nextTick(() => {
      skipLinkRef.value?.focus()
    })
  }
}

// Setup on mount
onMounted(() => {
  // Check reduced motion preference
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion changes
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleChange)

    // Cleanup on unmount
    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handleChange)
    })
  }

  // Add global keyboard shortcut listener
  document.addEventListener('keydown', handleGlobalKeyDown)
})

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeyDown)
})
</script>

<style scoped>
/* Skip Link Container */
.skip-link-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: v-bind('animationConfig.zIndex.skipLink');
  pointer-events: none;
  display: flex;
  justify-content: center;
  padding: v-bind('animationConfig.skipLink.containerPaddingY + "px"')
    v-bind('animationConfig.skipLink.containerPaddingX + "px"');
}

/* Skip Link - Hidden by default */
.skip-link {
  display: inline-flex;
  align-items: center;
  gap: v-bind('animationConfig.skipLink.gap + "px"');
  padding: v-bind('animationConfig.skipLink.paddingY + "px"')
    v-bind('animationConfig.skipLink.paddingX + "px"');
  background: v-bind('componentColorsConfig.skipLink.background');
  color: v-bind('componentColorsConfig.skipLink.text');
  font-weight: v-bind('animationConfig.skipLink.fontWeight');
  font-size: v-bind('animationConfig.skipLink.fontSize + "px"');
  border-radius: v-bind('animationConfig.skipLink.borderRadius + "px"');
  box-shadow: v-bind('animationConfig.skipLink.boxShadow');
  text-decoration: none;
  pointer-events: auto;
  cursor: pointer;
  transform: translateY(-150%);
  opacity: 0;
  transition:
    transform v-bind('animationConfig.skipLink.transitionDurationMs + "ms"')
      v-bind('animationConfig.skipLink.transitionEasing'),
    opacity v-bind('animationConfig.skipLink.transitionDurationMs + "ms"')
      v-bind('animationConfig.skipLink.transitionEasing'),
    box-shadow v-bind('animationConfig.skipLink.transitionDurationMs + "ms"')
      v-bind('animationConfig.skipLink.transitionEasing');
  position: relative;
  outline: none;
}

/* Visible state */
.skip-link--visible .skip-link {
  transform: translateY(0);
  opacity: 1;
}

/* Focus state */
.skip-link--focused.skip-link {
  box-shadow: v-bind('animationConfig.skipLink.focusBoxShadow');
}

/* Animation state */
.skip-link--animating.skip-link {
  animation: skip-link-bounce
    v-bind('animationConfig.skipLink.bounceDurationMs + "ms"')
    v-bind('animationConfig.skipLink.bounceEasing');
}

/* Icon styling */
.skip-link__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform
    v-bind('animationConfig.skipLink.transitionDurationMs + "ms"')
    v-bind('animationConfig.skipLink.transitionEasing');
}

.skip-link:hover .skip-link__icon,
.skip-link:focus .skip-link__icon {
  transform: translateY(2px);
}

/* Text styling */
.skip-link__text {
  white-space: nowrap;
}

/* Keyboard shortcut hint */
.skip-link__shortcut {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: v-bind('animationConfig.skipLink.shortcutMinWidth + "px"');
  padding: v-bind('animationConfig.skipLink.shortcutPaddingY + "px"')
    v-bind('animationConfig.skipLink.shortcutPaddingX + "px"');
  background: v-bind('componentColorsConfig.skipLink.shortcutBg');
  border: 1px solid v-bind('componentColorsConfig.skipLink.shortcutBorder');
  border-radius: v-bind('animationConfig.skipLink.shortcutBorderRadius + "px"');
  font-size: v-bind('animationConfig.skipLink.shortcutFontSize + "px"');
  font-family: v-bind('animationConfig.skipLink.shortcutFontFamily');
  color: v-bind('componentColorsConfig.skipLink.shortcutText');
  margin-left: v-bind('animationConfig.skipLink.shortcutMarginLeft + "px"');
  transition: all v-bind('animationConfig.skipLink.transitionDurationMs + "ms"')
    v-bind('animationConfig.skipLink.transitionEasing');
}

.skip-link:hover .skip-link__shortcut,
.skip-link:focus .skip-link__shortcut {
  background: v-bind('componentColorsConfig.skipLink.shortcutHoverBg');
  border-color: v-bind('componentColorsConfig.skipLink.shortcutHoverBorder');
}

/* Decorative glow effect */
.skip-link__glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: v-bind('animationConfig.skipLink.glowWidth + "%"');
  height: v-bind('animationConfig.skipLink.glowHeight + "%"');
  background: radial-gradient(
    ellipse at center,
    v-bind('componentColorsConfig.skipLink.glowColor') 0%,
    transparent 70%
  );
  opacity: v-bind('animationConfig.skipLink.glowOpacity');
  pointer-events: none;
  z-index: -1;
  animation: skip-link-glow-pulse
    v-bind('animationConfig.skipLink.glowPulseDurationSec + "s"') ease-in-out
    infinite;
}

/* Bounce animation for entrance */
@keyframes skip-link-bounce {
  0% {
    transform: translateY(-150%);
  }
  60% {
    transform: translateY(10px);
  }
  80% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0);
  }
}

/* Glow pulse animation */
@keyframes skip-link-glow-pulse {
  0%,
  100% {
    opacity: v-bind('animationConfig.skipLink.glowOpacity');
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: v-bind('animationConfig.skipLink.glowOpacityPulse');
    transform: translate(-50%, -50%) scale(1.05);
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
  .skip-link {
    transition: opacity
      v-bind('animationConfig.skipLink.reducedMotionDurationMs + "ms"') ease-out;
  }

  .skip-link--animating.skip-link {
    animation: none;
  }

  .skip-link__glow {
    display: none;
  }

  .skip-link__icon {
    transition: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .skip-link {
    border: 2px solid currentColor;
  }

  .skip-link__shortcut {
    border-width: 2px;
  }
}
</style>
