<template>
  <nav
    ref="breadcrumbNav"
    class="mb-6 breadcrumb-nav"
    :class="{
      'breadcrumb-nav--hovered': isNavHovered && !prefersReducedMotion,
      'using-keyboard': isUsingKeyboard,
      'using-mouse': !isUsingKeyboard,
    }"
    aria-label="Breadcrumb"
    @mouseenter="handleNavEnter"
    @mouseleave="handleNavLeave"
  >
    <!-- 🎨 Pallete's micro-UX enhancement: Breadcrumb Trail Glow ✨
         Creates a subtle gradient path connecting all breadcrumbs on hover
         Helps users visualize the navigation hierarchy -->
    <div
      v-if="!prefersReducedMotion"
      class="breadcrumb-trail"
      :class="{ 'breadcrumb-trail--visible': isNavHovered }"
      aria-hidden="true"
    >
      <div
        class="breadcrumb-trail__glow"
        :style="trailGlowStyle"
      />
    </div>

    <ol class="flex items-center space-x-2 text-sm relative z-10">
      <li class="breadcrumb-item">
        <NuxtLink
          to="/"
          data-breadcrumb="home"
          class="breadcrumb-link group"
          :class="{
            'is-pressed': pressedLink === 'home',
            'is-hovered': hoveredLink === 'home',
          }"
          @mousedown="handlePressStart('home')"
          @mouseup="handlePressEnd"
          @mouseleave="handlePressEnd"
          @mouseenter="handleHoverStart('home')"
          @touchstart="handlePressStart('home')"
          @touchend="handlePressEnd"
          @click="handleBreadcrumbClick('home')"
          @keydown="handleBreadcrumbKeydown($event, 'home')"
        >
          <span class="breadcrumb-text">Home</span>
          <span
            class="breadcrumb-underline"
            aria-hidden="true"
          />
        </NuxtLink>
      </li>
      <li aria-hidden="true">
        <span class="breadcrumb-separator">/</span>
      </li>
      <li class="breadcrumb-item">
        <NuxtLink
          to="/search"
          data-breadcrumb="resources"
          class="breadcrumb-link group"
          :class="{
            'is-pressed': pressedLink === 'resources',
            'is-hovered': hoveredLink === 'resources',
          }"
          @mousedown="handlePressStart('resources')"
          @mouseup="handlePressEnd"
          @mouseleave="handlePressEnd"
          @mouseenter="handleHoverStart('resources')"
          @touchstart="handlePressStart('resources')"
          @touchend="handlePressEnd"
          @click="handleBreadcrumbClick('resources')"
          @keydown="handleBreadcrumbKeydown($event, 'resources')"
        >
          <span class="breadcrumb-text">Resources</span>
          <span
            class="breadcrumb-underline"
            aria-hidden="true"
          />
        </NuxtLink>
      </li>
      <li aria-hidden="true">
        <span class="breadcrumb-separator">/</span>
      </li>
      <li
        class="breadcrumb-current"
        aria-current="page"
      >
        <span class="breadcrumb-current-text">{{ title }}</span>
        <span
          class="breadcrumb-current-indicator"
          aria-hidden="true"
        />
      </li>
    </ol>

    <!-- Screen reader announcement for current page -->
    <div
      class="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ announcement }}
    </div>
  </nav>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { contentConfig } from '~/configs/content.config'
import { zIndexConfig } from '~/configs/z-index.config'
import { uiTimingConfig } from '~/configs/ui-timing.config'
import { hapticLight } from '~/utils/hapticFeedback'

const props = defineProps<{
  title: string
}>()

// 🎨 Pallete's micro-UX enhancement: Adaptive Focus Indicators ✨
// Detects keyboard vs mouse navigation to show appropriate focus styles
const isUsingKeyboard = ref(false)
const keyboardModeTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

// 🎨 Pallete's micro-UX enhancement: Press and hover states
const pressedLink = ref<string | null>(null)
const hoveredLink = ref<string | null>(null)

// Handle press start for tactile feedback
const handlePressStart = (link: string) => {
  pressedLink.value = link
}

// Handle press end
const handlePressEnd = () => {
  pressedLink.value = null
}

// Handle hover start
const handleHoverStart = (link: string) => {
  hoveredLink.value = link
}

// Handle breadcrumb click with haptic feedback - Pallete's micro-UX delight!
const handleBreadcrumbClick = (link: string) => {
  // Trigger haptic feedback for mobile users
  hapticLight()

  // Announce navigation to screen readers
  if (link === 'home') {
    announcement.value = 'Navigating to Home'
  } else if (link === 'resources') {
    announcement.value = 'Navigating to Resources'
  }

  // Clear announcement after delay
  setTimeout(() => {
    announcement.value = ''
  }, uiTimingConfig.breadcrumbs.announcementClearDelay)
}

// 🎨 Pallete's micro-UX enhancement: Keyboard navigation detection
// Switches to keyboard mode when Tab or Arrow keys are used
const handleKeydown = (e: KeyboardEvent) => {
  if (['Tab', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(e.key)) {
    // Clear any pending mouse mode switch
    if (keyboardModeTimeout.value) {
      clearTimeout(keyboardModeTimeout.value)
      keyboardModeTimeout.value = null
    }
    isUsingKeyboard.value = true
  }
}

// 🎨 Pallete's micro-UX enhancement: Mouse detection
// Switches to mouse mode with debounce to prevent flickering
const handleMousedown = () => {
  // Debounce the switch from keyboard to mouse mode
  if (keyboardModeTimeout.value) {
    clearTimeout(keyboardModeTimeout.value)
  }
  keyboardModeTimeout.value = setTimeout(() => {
    isUsingKeyboard.value = false
  }, animationConfig.breadcrumbs.adaptiveFocus.modeSwitchDebounceMs)
}

// Handle keyboard navigation between breadcrumbs
const handleBreadcrumbKeydown = (e: KeyboardEvent, currentLink: string) => {
  const links = ['home', 'resources']
  const currentIndex = links.indexOf(currentLink)

  if (e.key === 'ArrowLeft' && currentIndex > 0) {
    e.preventDefault()
    const prevLink = links[currentIndex - 1]
    const prevElement = document.querySelector(
      `[data-breadcrumb="${prevLink}"]`
    )
    if (prevElement instanceof HTMLElement) {
      prevElement.focus()
      hapticLight()
    }
  } else if (e.key === 'ArrowRight' && currentIndex < links.length - 1) {
    e.preventDefault()
    const nextLink = links[currentIndex + 1]
    const nextElement = document.querySelector(
      `[data-breadcrumb="${nextLink}"]`
    )
    if (nextElement instanceof HTMLElement) {
      nextElement.focus()
      hapticLight()
    }
  }
}

// Screen reader announcement
const announcement = ref('')

// 🎨 Pallete's micro-UX enhancement: Breadcrumb trail glow state
const isNavHovered = ref(false)
const breadcrumbNav = ref<HTMLElement | null>(null)
const trailGlowStyle = ref({})

// Handle nav enter for trail glow
const handleNavEnter = () => {
  isNavHovered.value = true
  updateTrailGlow()
}

// Handle nav leave
const handleNavLeave = () => {
  isNavHovered.value = false
}

// Update trail glow position based on breadcrumb positions
const updateTrailGlow = () => {
  if (!breadcrumbNav.value || prefersReducedMotion.value) return

  const links = breadcrumbNav.value.querySelectorAll('.breadcrumb-link')
  if (links.length === 0) return

  const firstLink = links[0]
  const lastLink = links[links.length - 1]
  const navRect = breadcrumbNav.value.getBoundingClientRect()
  const firstRect = firstLink.getBoundingClientRect()
  const lastRect = lastLink.getBoundingClientRect()

  // Calculate trail position
  const startX = firstRect.left - navRect.left
  const endX = lastRect.right - navRect.left
  const width = endX - startX
  const centerY = firstRect.top - navRect.top + firstRect.height / 2

  trailGlowStyle.value = {
    left: `${startX}px`,
    top: `${centerY - 2}px`,
    width: `${width}px`,
  }
}

// Announce page changes to screen readers
watch(
  () => props.title,
  newTitle => {
    if (newTitle) {
      announcement.value = contentConfig.breadcrumbs.currentPage.replace(
        '{{title}}',
        newTitle
      )
      // Clear announcement after screen reader has time to process
      setTimeout(() => {
        announcement.value = ''
      }, uiTimingConfig.breadcrumbs.announcementClearDelay)
    }
  },
  { immediate: true }
)

// Check for reduced motion preference
const prefersReducedMotion = ref(false)

onMounted(() => {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function'
  ) {
    prefersReducedMotion.value = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
  }

  // 🎨 Pallete's micro-UX enhancement: Set up input method detection
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('mousedown', handleMousedown)
})

// Cleanup event listeners
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('mousedown', handleMousedown)
  if (keyboardModeTimeout.value) {
    clearTimeout(keyboardModeTimeout.value)
  }
})
</script>

<style scoped>
/* Breadcrumb nav container with trail glow support */
.breadcrumb-nav {
  position: relative;
  padding: 0.5rem 0;
  margin: -0.5rem 0;
}

/* 🎨 Pallete's micro-UX enhancement: Breadcrumb Trail Glow Styles */
.breadcrumb-trail {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: 0.5rem;
  opacity: 0;
  transition: opacity
    v-bind('`${animationConfig.breadcrumbs.trailFadeDurationMs}ms`') ease-out;
}

.breadcrumb-trail--visible {
  opacity: 1;
}

.breadcrumb-trail__glow {
  position: absolute;
  height: 4px;
  background: linear-gradient(
    90deg,
    rgba(37, 99, 235, 0) 0%,
    rgba(37, 99, 235, 0.3) 15%,
    rgba(59, 130, 246, 0.5) 50%,
    rgba(37, 99, 235, 0.3) 85%,
    rgba(37, 99, 235, 0) 100%
  );
  border-radius: 2px;
  filter: blur(2px);
  transition: all
    v-bind('`${animationConfig.breadcrumbs.trailMovementDurationMs}ms`')
    ease-out;
  animation: trail-pulse
    v-bind('`${animationConfig.breadcrumbs.trailPulseDurationMs}ms`')
    ease-in-out infinite;
}

@keyframes trail-pulse {
  0%,
  100% {
    opacity: 0.6;
    filter: blur(2px) brightness(1);
  }
  50% {
    opacity: 1;
    filter: blur(2px) brightness(1.2);
  }
}

/* Breadcrumb item base styles */
.breadcrumb-item {
  position: relative;
}

/* Breadcrumb link with slide-in underline animation */
.breadcrumb-link {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  color: rgb(37, 99, 235); /* blue-600 */
  text-decoration: none;
  padding: 0.125rem 0.25rem;
  margin: -0.125rem -0.25rem;
  border-radius: 0.25rem;
  transition:
    color v-bind('`${animationConfig.transition.fast.durationMs}ms`') ease-out,
    transform v-bind('`${animationConfig.transition.fast.durationMs}ms`')
      ease-out,
    background-color v-bind('`${animationConfig.transition.fast.durationMs}ms`')
      ease-out;
  will-change: transform;
}

/* 🎨 Pallete's micro-UX: Hover lift effect */
.breadcrumb-link.is-hovered {
  transform: translateY(-1px);
  background-color: rgba(37, 99, 235, 0.05);
}

/* 🎨 Pallete's micro-UX: Press/active state */
.breadcrumb-link.is-pressed {
  transform: translateY(0) scale(0.98);
  background-color: rgba(37, 99, 235, 0.1);
}

.breadcrumb-link:hover {
  color: rgb(30, 64, 175); /* blue-800 */
}

.breadcrumb-link:focus-visible {
  outline: 2px solid rgb(37, 99, 235);
  outline-offset: 2px;
}

/* 🎨 Pallete's micro-UX enhancement: Adaptive Focus Indicators ✨
   Keyboard users get prominent focus rings with glow effect
   Mouse users get subtle hover states without intrusive focus rings */

/* Using keyboard: Prominent focus styles */
.using-keyboard .breadcrumb-link:focus-visible {
  outline: v-bind(
      '`${animationConfig.breadcrumbs.adaptiveFocus.keyboardOutlineWidthPx}px`'
    )
    solid rgb(37, 99, 235);
  outline-offset: 3px;
  box-shadow:
    0 0 0
      v-bind(
        '`${animationConfig.breadcrumbs.adaptiveFocus.keyboardOutlineWidthPx + 2}px`'
      )
      rgba(255, 255, 255, 0.8),
    0 0
      v-bind(
        '`${animationConfig.breadcrumbs.adaptiveFocus.keyboardGlowSpreadPx}px`'
      )
      v-bind(
        '`${animationConfig.breadcrumbs.adaptiveFocus.keyboardGlowSpreadPx}px`'
      )
      rgba(
        37,
        99,
        235,
        v-bind('animationConfig.breadcrumbs.adaptiveFocus.keyboardGlowOpacity')
      );
  border-radius: 0.375rem;
  transition:
    box-shadow
      v-bind('animationConfig.breadcrumbs.adaptiveFocus.transitionDurationSec')
      ease-out,
    outline
      v-bind('animationConfig.breadcrumbs.adaptiveFocus.transitionDurationSec')
      ease-out;
}

/* Using mouse: Subtle focus styles */
.using-mouse .breadcrumb-link:focus:not(:focus-visible) {
  outline: none;
  box-shadow: none;
}

.using-mouse .breadcrumb-link:focus-visible {
  outline: 2px solid rgb(37, 99, 235);
  outline-offset: 2px;
  box-shadow: none;
}

/* Enhanced hover for keyboard users */
.using-keyboard .breadcrumb-link:hover {
  background-color: rgba(37, 99, 235, 0.08);
}

/* Keyboard shortcut hint tooltip */
.breadcrumb-keyboard-hint {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) scale(0.9);
  background: rgba(17, 24, 39, 0.9);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity
      v-bind('animationConfig.breadcrumbs.adaptiveFocus.transitionDurationSec')
      ease-out,
    transform
      v-bind('animationConfig.breadcrumbs.adaptiveFocus.transitionDurationSec')
      ease-out;
  pointer-events: none;
  z-index: v-bind('zIndexConfig.tooltip');
}

.breadcrumb-link:focus-visible .breadcrumb-keyboard-hint,
.breadcrumb-link:hover .breadcrumb-keyboard-hint {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) scale(1);
}

/* Breadcrumb text */
.breadcrumb-text {
  position: relative;
  z-index: v-bind('zIndexConfig.floatingLabel');
}

/* Slide-in underline effect - Palette's micro-UX delight! */
.breadcrumb-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, rgb(37, 99, 235), rgb(59, 130, 246));
  border-radius: 1px;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform
    v-bind('`${animationConfig.breadcrumbs.underlineDurationMs}ms`')
    v-bind('animationConfig.easeOutQuart');
  opacity: 0;
}

.breadcrumb-link:hover .breadcrumb-underline,
.breadcrumb-link:focus-visible .breadcrumb-underline {
  transform: scaleX(1);
  opacity: 1;
}

/* Separator styling */
.breadcrumb-separator {
  color: rgb(75, 85, 99); /* gray-600 */
  transition: color v-bind('`${animationConfig.transition.fast.durationMs}ms`')
    ease-out;
}

/* Current page styling with pulse indicator */
.breadcrumb-current {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(107, 114, 128); /* gray-500 */
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  margin: -0.125rem -0.5rem;
  background: linear-gradient(
    135deg,
    rgba(243, 244, 246, 0.5),
    rgba(229, 231, 235, 0.5)
  );
  border-radius: 0.375rem;
  max-width: 200px;
}

.breadcrumb-current-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Pulsing indicator dot - Palette's micro-UX enhancement! */
.breadcrumb-current-indicator {
  width: 6px;
  height: 6px;
  background: rgb(37, 99, 235);
  border-radius: 50%;
  animation: pulse-dot
    v-bind('`${animationConfig.breadcrumbs.pulseDurationMs}ms`') ease-in-out
    infinite;
  flex-shrink: 0;
}

@keyframes pulse-dot {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0);
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

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .breadcrumb-link,
  .breadcrumb-underline,
  .breadcrumb-separator,
  .breadcrumb-trail {
    transition: none;
  }

  .breadcrumb-underline {
    transform: none;
    opacity: 0;
  }

  .breadcrumb-link:hover .breadcrumb-underline,
  .breadcrumb-link:focus-visible .breadcrumb-underline {
    opacity: 1;
  }

  .breadcrumb-current-indicator {
    animation: none;
  }

  .breadcrumb-link.is-hovered,
  .breadcrumb-link.is-pressed {
    transform: none;
  }

  .breadcrumb-trail__glow {
    animation: none;
    opacity: 0 !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .breadcrumb-link {
    text-decoration: underline;
  }

  .breadcrumb-underline {
    display: none;
  }

  .breadcrumb-current {
    border: 1px solid currentColor;
  }
}
</style>
