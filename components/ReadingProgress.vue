<template>
  <div
    class="reading-progress-container"
    role="progressbar"
    :aria-label="ariaLabel"
    :aria-valuenow="Math.round(progress)"
    aria-valuemin="0"
    aria-valuemax="100"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
  >
    <div
      class="reading-progress-bar"
      :style="{ transform: `scaleX(${progress / 100})` }"
      aria-hidden="true"
    />

    <!-- Progress tooltip -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="showTooltip"
        class="reading-progress-tooltip"
        :style="tooltipStyle"
        role="tooltip"
        aria-hidden="true"
      >
        <span class="tooltip-text">{{ Math.round(progress) }}%</span>
        <div class="tooltip-arrow" />
      </div>
    </Transition>

    <!-- Screen reader announcement for progress changes -->
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ progressAnnouncement }}
    </div>

    <!-- Completion Celebration - Palette's micro-UX delight! -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 scale-50"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-75"
    >
      <div
        v-if="showCompletionCelebration && !prefersReducedMotion"
        class="reading-progress-completion"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div class="completion-content">
          <!-- Animated checkmark -->
          <div class="completion-icon">
            <svg
              class="checkmark-svg"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                class="checkmark-circle"
                cx="12"
                cy="12"
                r="10"
              />
              <path
                class="checkmark-path"
                d="M7 12l3 3 7-7"
              />
            </svg>
          </div>
          <span class="completion-text">{{
            contentConfig.readingProgress?.completionText || 'Reading complete!'
          }}</span>
        </div>
        <!-- Confetti burst effect -->
        <div
          class="confetti-container"
          aria-hidden="true"
        >
          <span
            v-for="n in 8"
            :key="n"
            class="confetti-piece"
            :style="{ '--confetti-index': n }"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { componentStylesConfig } from '~/configs/component-styles.config'
import { themeConfig } from '~/configs/theme.config'
import { animationConfig } from '~/configs/animation.config'
import { uiConfig } from '~/configs/ui.config'
import { contentConfig } from '~/configs/content.config'

interface Props {
  /**
   * The target element or selector to track scroll progress
   * @default 'main' - tracks the main content area
   */
  targetSelector?: string
  /**
   * Aria label for accessibility
   * @default 'Reading progress'
   */
  ariaLabel?: string
  /**
   * Color of the progress bar
   * @default 'bg-blue-500' - Tailwind blue-500
   */
  color?: string
  /**
   * Enable tooltip on hover
   * @default true
   */
  showTooltipOnHover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  targetSelector: 'main',
  ariaLabel: 'Reading progress',
  color: 'bg-blue-500',
  showTooltipOnHover: true,
})

// Reactive state
const progress = ref(0)
const showTooltip = ref(false)
const tooltipPosition = ref(0)
const lastAnnouncedProgress = ref(0)
const showCompletionCelebration = ref(false)
const hasCelebratedCompletion = ref(false)
const prefersReducedMotion = ref(false)

// Track if component is mounted (to avoid SSR issues)
let isMounted = false

// Completion celebration timeout
let celebrationTimeout: ReturnType<typeof setTimeout> | null = null

// Computed tooltip style
const tooltipStyle = computed(() => ({
  left: `${tooltipPosition.value}px`,
}))

// Progress announcement state
const progressAnnouncement = ref('')

// Watch for milestone announcements (configurable intervals)
watch(progress, newProgress => {
  const currentProgress = Math.round(newProgress)
  const milestoneInterval = animationConfig.readingProgress.milestoneInterval
  const milestone =
    Math.floor(currentProgress / milestoneInterval) * milestoneInterval

  // Only announce when crossing a 25% milestone
  if (milestone > lastAnnouncedProgress.value && milestone <= 100) {
    lastAnnouncedProgress.value = milestone
    progressAnnouncement.value = `${milestone}% reading progress`

    // Clear announcement after screen reader has time to read it
    setTimeout(() => {
      progressAnnouncement.value = ''
    }, uiConfig.feedback.announcementClearMs)
  }

  // Trigger completion celebration at 100% - Palette's micro-UX delight!
  if (
    currentProgress >= 100 &&
    !hasCelebratedCompletion.value &&
    !prefersReducedMotion.value
  ) {
    hasCelebratedCompletion.value = true
    showCompletionCelebration.value = true
    progressAnnouncement.value =
      contentConfig.readingProgress?.completionAnnouncement ||
      'Reading complete! Congratulations!'

    // Clear any existing timeout
    if (celebrationTimeout) {
      clearTimeout(celebrationTimeout)
    }

    // Auto-hide celebration after delay
    celebrationTimeout = setTimeout(() => {
      showCompletionCelebration.value = false
    }, animationConfig.readingProgress?.celebrationDurationMs || 3000)

    // Clear announcement after screen reader has time to read it
    setTimeout(() => {
      progressAnnouncement.value = ''
    }, uiConfig.feedback.announcementClearMs)
  }

  // Reset celebration if user scrolls back up from 100%
  if (currentProgress < 95 && hasCelebratedCompletion.value) {
    hasCelebratedCompletion.value = false
    showCompletionCelebration.value = false
  }
})

// Calculate scroll progress
const calculateProgress = () => {
  if (typeof window === 'undefined' || !isMounted) return

  const target = document.querySelector(props.targetSelector)
  if (!target) {
    // Fallback: use document scroll
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight
    progress.value = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
    return
  }

  const rect = target.getBoundingClientRect()
  const elementTop = rect.top + window.scrollY
  const elementHeight = rect.height
  const windowHeight = window.innerHeight

  // Calculate how much of the element has been scrolled past
  const scrolled = window.scrollY - elementTop + windowHeight
  const totalScrollable = elementHeight + windowHeight

  if (totalScrollable > 0) {
    progress.value = Math.min(
      100,
      Math.max(0, (scrolled / totalScrollable) * 100)
    )
  } else {
    progress.value = 0
  }
}

// Tooltip event handlers
const handleMouseEnter = () => {
  if (props.showTooltipOnHover) {
    showTooltip.value = true
  }
}

const handleMouseLeave = () => {
  showTooltip.value = false
}

const handleMouseMove = (event: MouseEvent) => {
  if (props.showTooltipOnHover) {
    tooltipPosition.value = event.clientX
  }
}

// Use requestAnimationFrame for smooth updates
let ticking = false
const handleScroll = () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      calculateProgress()
      ticking = false
    })
    ticking = true
  }
}

// Lifecycle hooks
onMounted(() => {
  isMounted = true
  // Initial calculation
  calculateProgress()
  // Add scroll listener with passive option for performance
  window.addEventListener('scroll', handleScroll, { passive: true })

  // Check for reduced motion preference
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function'
  ) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches

    // Listen for changes
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleMotionChange)
  }
})

onUnmounted(() => {
  isMounted = false
  window.removeEventListener('scroll', handleScroll)

  // Clean up celebration timeout
  if (celebrationTimeout) {
    clearTimeout(celebrationTimeout)
  }
})
</script>

<style scoped>
/* Flexy hates hardcoded values! Using config-bound CSS custom properties */
.reading-progress-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: v-bind('componentStylesConfig.readingProgress.height');
  background: transparent;
  z-index: v-bind('themeConfig.zIndex.readingProgress');
  pointer-events: none;
}

.reading-progress-bar {
  height: 100%;
  background: v-bind('componentStylesConfig.readingProgress.gradient');
  background-size: 200% 100%;
  transform-origin: left;
  transition: transform
    v-bind('animationConfig.readingProgress.transitionDuration') ease-out;
  will-change: transform;
}

/* Shimmer animation for the progress bar */
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.reading-progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: v-bind('componentStylesConfig.readingProgress.shimmerWidth');
  background: linear-gradient(
    90deg,
    transparent 0%,
    v-bind('themeConfig.readingProgress.shimmerColor') 50%,
    transparent 100%
  );
  animation: shimmer
    v-bind('animationConfig.readingProgress.shimmerDurationSec + "s"')
    ease-in-out infinite;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .reading-progress-bar {
    transition: none;
  }

  .reading-progress-bar::after {
    animation: none;
    display: none;
  }
}

/* Hide on very short pages */
@media (max-height: 600px) {
  .reading-progress-container {
    display: none;
  }
}

/* Progress tooltip */
.reading-progress-tooltip {
  position: absolute;
  top: v-bind('componentStylesConfig.readingProgress.tooltipTop');
  transform: translateX(-50%);
  z-index: v-bind('themeConfig.zIndex.tooltip');
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tooltip-text {
  background: v-bind('themeConfig.readingProgress.tooltipGradient');
  color: v-bind('themeConfig.readingProgress.tooltipTextColor');
  padding: v-bind('componentStylesConfig.readingProgress.tooltipPadding');
  border-radius: v-bind(
    'componentStylesConfig.readingProgress.tooltipBorderRadius'
  );
  font-size: v-bind('componentStylesConfig.readingProgress.tooltipFontSize');
  font-weight: v-bind(
    'componentStylesConfig.readingProgress.tooltipFontWeight'
  );
  white-space: nowrap;
  box-shadow: v-bind('themeConfig.readingProgress.tooltipShadow');
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  animation: tooltip-appear
    v-bind('animationConfig.readingProgress.tooltipAppearDuration') ease-out;
}

.tooltip-arrow {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid #374151;
  margin-top: -1px;
}

@keyframes tooltip-appear {
  0% {
    opacity: 0;
    transform: translateY(-4px) scale(0.95);
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

/* Reduced motion support for tooltip */
@media (prefers-reduced-motion: reduce) {
  .reading-progress-tooltip {
    transition: none;
  }

  .tooltip-text {
    animation: none;
  }
}

/* Completion Celebration - Palette's micro-UX delight! */
.reading-progress-completion {
  position: fixed;
  top: v-bind('componentStylesConfig.readingProgress.completionTop');
  right: v-bind('componentStylesConfig.readingProgress.completionRight');
  z-index: v-bind('themeConfig.zIndex.tooltip');
  pointer-events: none;
}

.completion-content {
  display: inline-flex;
  align-items: center;
  gap: v-bind('componentStylesConfig.readingProgress.completionGap');
  padding: v-bind('componentStylesConfig.readingProgress.completionPadding');
  background: v-bind('themeConfig.readingProgress.completionGradient');
  border-radius: v-bind(
    'componentStylesConfig.readingProgress.completionBorderRadius'
  );
  box-shadow: v-bind('themeConfig.readingProgress.completionShadow');
  animation: completion-pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
}

@keyframes completion-pop-in {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(-20px);
  }
  60% {
    transform: scale(1.05) translateY(2px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.completion-icon {
  width: v-bind('componentStylesConfig.readingProgress.completionIconSize');
  height: v-bind('componentStylesConfig.readingProgress.completionIconSize');
  flex-shrink: 0;
}

.checkmark-svg {
  width: 100%;
  height: 100%;
  animation: icon-rotate-in 0.4s ease-out 0.2s both;
}

@keyframes icon-rotate-in {
  0% {
    opacity: 0;
    transform: rotate(-45deg) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: rotate(0) scale(1);
  }
}

.checkmark-circle {
  fill: v-bind('themeConfig.readingProgress.completionIconBg');
  animation: circle-scale 0.3s ease-out 0.1s both;
}

@keyframes circle-scale {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.checkmark-path {
  stroke: v-bind('themeConfig.readingProgress.completionIconColor');
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: checkmark-draw 0.3s ease-out 0.3s forwards;
}

@keyframes checkmark-draw {
  to {
    stroke-dashoffset: 0;
  }
}

.completion-text {
  font-size: v-bind('componentStylesConfig.readingProgress.completionFontSize');
  font-weight: v-bind(
    'componentStylesConfig.readingProgress.completionFontWeight'
  );
  color: v-bind('themeConfig.readingProgress.completionTextColor');
  white-space: nowrap;
  animation: text-fade-in 0.3s ease-out 0.4s both;
}

@keyframes text-fade-in {
  0% {
    opacity: 0;
    transform: translateX(-10px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Confetti burst animation */
.confetti-container {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
}

.confetti-piece {
  position: absolute;
  width: 8px;
  height: 8px;
  background: v-bind(
    'themeConfig.readingProgress.confettiColors[(parseInt(`--confetti-index`) - 1) % 4]'
  );
  border-radius: 50%;
  opacity: 0;
  animation: confetti-burst 0.8s ease-out 0.2s forwards;
  --angle: calc(var(--confetti-index) * 45deg);
}

.confetti-piece:nth-child(1) {
  --confetti-index: 1;
  background: #ff6b6b;
}
.confetti-piece:nth-child(2) {
  --confetti-index: 2;
  background: #4ecdc4;
}
.confetti-piece:nth-child(3) {
  --confetti-index: 3;
  background: #45b7d1;
}
.confetti-piece:nth-child(4) {
  --confetti-index: 4;
  background: #96ceb4;
}
.confetti-piece:nth-child(5) {
  --confetti-index: 5;
  background: #ffeaa7;
}
.confetti-piece:nth-child(6) {
  --confetti-index: 6;
  background: #dda0dd;
}
.confetti-piece:nth-child(7) {
  --confetti-index: 7;
  background: #98d8c8;
}
.confetti-piece:nth-child(8) {
  --confetti-index: 8;
  background: #f7dc6f;
}

@keyframes confetti-burst {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-60px)
      scale(0);
  }
}

/* Reduced motion support for completion celebration */
@media (prefers-reduced-motion: reduce) {
  .reading-progress-completion,
  .completion-content,
  .checkmark-svg,
  .checkmark-circle,
  .checkmark-path,
  .completion-text,
  .confetti-piece {
    animation: none !important;
    transition: opacity 0.2s ease-out !important;
  }

  .checkmark-path {
    stroke-dashoffset: 0;
  }

  .confetti-piece {
    display: none;
  }
}
</style>
