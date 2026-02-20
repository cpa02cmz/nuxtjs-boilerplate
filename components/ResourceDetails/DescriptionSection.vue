<template>
  <div class="description-section">
    <!-- Header with title and action buttons -->
    <div class="description-header">
      <h2 class="description-title">
        {{ contentConfig.resourceDetails.descriptionTitle }}
      </h2>

      <!-- Action buttons -->
      <div class="description-actions">
        <!-- Copy button with tooltip -->
        <Tooltip
          :content="copyTooltipText"
          position="top"
          :delay="animationConfig.tooltip.showDelayMs"
        >
          <button
            ref="copyButtonRef"
            class="action-btn copy-btn"
            :class="{
              'copy-success': copySuccess,
              'is-pressed': isCopyPressed && !prefersReducedMotion,
            }"
            :aria-label="copyAriaLabel"
            @click="handleCopy"
            @mousedown="isCopyPressed = true"
            @mouseup="isCopyPressed = false"
            @mouseleave="isCopyPressed = false"
            @touchstart="isCopyPressed = true"
            @touchend="isCopyPressed = false"
          >
            <!-- Copy icon -->
            <svg
              v-if="!copySuccess"
              xmlns="http://www.w3.org/2000/svg"
              class="action-icon"
              :class="{
                'animate-icon': isHoveringCopy && !prefersReducedMotion,
              }"
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
            <!-- Success checkmark -->
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="action-icon checkmark-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </Tooltip>
      </div>
    </div>

    <!-- Description content with read more/less -->
    <div
      class="description-content-wrapper"
      @mouseup="handleTextSelection"
      @touchend="handleTextSelection"
    >
      <!-- 🎨 Palette's micro-UX enhancement: Text Selection Tooltip ✨ -->
      <Transition
        :enter-active-class="`transition-all ${animationConfig.tailwindDurations.fast} ease-out`"
        enter-from-class="opacity-0 scale-90 translate-y-2"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        :leave-active-class="`transition-all ${animationConfig.tailwindDurations.fast} ease-in`"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-90 translate-y-2"
      >
        <div
          v-if="showSelectionTooltip && !prefersReducedMotion"
          class="selection-tooltip"
          :style="selectionTooltipStyle"
          role="tooltip"
        >
          <button
            class="selection-tooltip-btn"
            :class="{ 'is-copied': selectionCopied }"
            :aria-label="selectionCopied ? 'Copied!' : 'Copy selected text'"
            @click="copySelectedText"
            @mousedown="isSelectionPressed = true"
            @mouseup="isSelectionPressed = false"
            @mouseleave="isSelectionPressed = false"
          >
            <svg
              v-if="!selectionCopied"
              xmlns="http://www.w3.org/2000/svg"
              class="selection-tooltip-icon"
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
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="selection-tooltip-icon checkmark"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span class="selection-tooltip-text">{{
              selectionCopied ? 'Copied!' : 'Copy'
            }}</span>
          </button>
          <div class="selection-tooltip-arrow" />
        </div>
      </Transition>

      <Transition
        :enter-active-class="`transition-all ${animationConfig.tailwindDurations.standard} ease-out`"
        :leave-active-class="`transition-all ${animationConfig.tailwindDurations.normal} ease-in`"
        @before-enter="onBeforeEnter"
        @enter="onEnter"
        @before-leave="onBeforeLeave"
        @leave="onLeave"
      >
        <p
          v-if="!isExpanded && isTruncated"
          ref="truncatedRef"
          class="description-text description-text-truncated"
        >
          {{ truncatedText }}
        </p>
        <p
          v-else
          ref="fullRef"
          class="description-text"
          :class="{ 'description-text-full': isExpanded }"
        >
          {{ description }}
        </p>
      </Transition>

      <!-- Read more/less button -->
      <button
        v-if="isTruncated"
        ref="toggleButtonRef"
        class="read-more-btn"
        :class="{
          'is-pressed': isTogglePressed && !prefersReducedMotion,
          'is-expanded': isExpanded,
        }"
        @click="toggleExpand"
        @mousedown="isTogglePressed = true"
        @mouseup="isTogglePressed = false"
        @mouseleave="isTogglePressed = false"
        @touchstart="isTogglePressed = true"
        @touchend="isTogglePressed = false"
      >
        <span class="read-more-text">
          {{ isExpanded ? readLessText : readMoreText }}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="read-more-icon"
          :class="{ 'rotate-180': isExpanded && !prefersReducedMotion }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>

    <!-- Footer with reading stats -->
    <div class="description-footer">
      <div class="reading-stats">
        <!-- Word count -->
        <span class="stat-item">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stat-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span class="stat-value">{{ wordCount }}</span>
          <span class="stat-label">{{ wordsLabel }}</span>
        </span>

        <!-- Reading time estimate -->
        <span class="stat-divider" aria-hidden="true">·</span>

        <span class="stat-item">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stat-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="stat-value">{{ readingTime }}</span>
          <span class="stat-label">{{ minReadLabel }}</span>
        </span>
      </div>
    </div>

    <!-- Screen reader announcement -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ announcement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import Tooltip from '~/components/Tooltip.vue'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'
import { limitsConfig } from '~/configs/limits.config'
import { zIndexConfig } from '~/configs/z-index.config'
import { hapticLight, hapticSuccess } from '~/utils/hapticFeedback'

interface Props {
  description: string
  /** Maximum characters to show before truncating */
  maxLength?: number
  /** Words per minute for reading time calculation */
  wordsPerMinute?: number
}

// Flexy hates hardcoded values! Using config for default reading speed
const props = withDefaults(defineProps<Props>(), {
  maxLength: limitsConfig.display.descriptionPreview || 300,
  wordsPerMinute: contentConfig.reading.wordsPerMinute,
})

// Reactive state
const isExpanded = ref(false)
const isCopyPressed = ref(false)
const isTogglePressed = ref(false)
const isHoveringCopy = ref(false)
const copySuccess = ref(false)
const prefersReducedMotion = ref(false)
const announcement = ref('')

// 🎨 Palette's micro-UX enhancement: Text selection tooltip state
const showSelectionTooltip = ref(false)
const selectionCopied = ref(false)
const isSelectionPressed = ref(false)
const selectedText = ref('')
const selectionPosition = ref({ x: 0, y: 0 })
let selectionTooltipTimeout: ReturnType<typeof setTimeout> | null = null
let selectionHideTimeout: ReturnType<typeof setTimeout> | null = null

// Refs
const copyButtonRef = ref<HTMLButtonElement | null>(null)
const toggleButtonRef = ref<HTMLButtonElement | null>(null)

// Config values - Flexy hates hardcoded values!
const config = {
  copySuccessDurationMs: animationConfig.copySuccess?.tooltipDurationMs || 1500,
  copyResetDelayMs: animationConfig.microInteractions.savedIndicatorTimeoutMs,
  announcementClearMs: animationConfig.microInteractions.announcementDelayMs,
}

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Computed values
const isTruncated = computed(() => {
  return props.description.length > props.maxLength
})

const truncatedText = computed(() => {
  if (!isTruncated.value) return props.description
  return props.description.slice(0, props.maxLength).trim() + '...'
})

const wordCount = computed(() => {
  return props.description
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length
})

const readingTime = computed(() => {
  const minutes = Math.ceil(wordCount.value / props.wordsPerMinute)
  return Math.max(1, minutes)
})

const copyTooltipText = computed(() => {
  return copySuccess.value
    ? contentConfig.messages.clipboard.copied
    : contentConfig.messages.clipboard.copy
})

const copyAriaLabel = computed(() => {
  return copySuccess.value
    ? contentConfig.ariaLabels.clipboard.copied
    : contentConfig.ariaLabels.clipboard.copy
})

const readMoreText = computed(() => {
  return contentConfig.resourceDetails?.readMore || 'Read more'
})

const readLessText = computed(() => {
  return contentConfig.resourceDetails?.readLess || 'Read less'
})

const wordsLabel = computed(() => {
  return wordCount.value === 1
    ? contentConfig.resourceDetails?.wordSingular || 'word'
    : contentConfig.resourceDetails?.wordPlural || 'words'
})

const minReadLabel = computed(() => {
  return contentConfig.resourceDetails?.minRead || 'min read'
})

// 🎨 Palette's micro-UX enhancement: Text selection tooltip position
const selectionTooltipStyle = computed(() => ({
  left: `${selectionPosition.value.x}px`,
  top: `${selectionPosition.value.y}px`,
}))

// Methods
const toggleExpand = async () => {
  isExpanded.value = !isExpanded.value

  // Haptic feedback
  hapticLight()

  // Announce to screen readers
  announcement.value = isExpanded.value
    ? contentConfig.ariaLabels.description.expanded
    : contentConfig.ariaLabels.description.collapsed

  setTimeout(() => {
    announcement.value = ''
  }, config.announcementClearMs)

  // Focus management - focus back on toggle button after state change
  await nextTick()
  toggleButtonRef.value?.focus()
}

const handleCopy = async () => {
  if (copySuccess.value) return

  // BugFixer: Guard for SSR safety
  if (typeof navigator === 'undefined' || !navigator.clipboard) return

  try {
    await navigator.clipboard.writeText(props.description)

    copySuccess.value = true

    // Haptic feedback for success
    hapticSuccess()

    // Announce to screen readers
    announcement.value = contentConfig.ariaLabels.clipboard.copied
    setTimeout(() => {
      announcement.value = ''
    }, config.announcementClearMs)

    // Reset after delay
    setTimeout(() => {
      copySuccess.value = false
    }, config.copyResetDelayMs)
  } catch {
    // Silent fail - user can try again
    announcement.value = contentConfig.ariaLabels.clipboard.failed
    setTimeout(() => {
      announcement.value = ''
    }, config.announcementClearMs)
  }
}

// 🎨 Palette's micro-UX enhancement: Handle text selection
const handleTextSelection = () => {
  // BugFixer: Guard for SSR safety
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const selection = window.getSelection()
  const text = selection?.toString().trim() || ''

  // Clear any existing timeouts
  if (selectionTooltipTimeout) {
    clearTimeout(selectionTooltipTimeout)
  }
  if (selectionHideTimeout) {
    clearTimeout(selectionHideTimeout)
  }

  // Hide tooltip if no text selected or text is too short
  if (!text || text.length < 2) {
    showSelectionTooltip.value = false
    selectedText.value = ''
    return
  }

  // Store selected text
  selectedText.value = text

  // Get selection position for tooltip placement
  const range = selection?.getRangeAt(0)
  if (range) {
    const rect = range.getBoundingClientRect()
    const containerRect = document
      .querySelector('.description-content-wrapper')
      ?.getBoundingClientRect()

    if (containerRect) {
      // Calculate position relative to container
      const centerX = rect.left + rect.width / 2
      selectionPosition.value = {
        x: centerX - containerRect.left,
        y: rect.top - containerRect.top - 45, // Position above selection
      }
    }
  }

  // Show tooltip with small delay to avoid flickering
  selectionTooltipTimeout = setTimeout(() => {
    showSelectionTooltip.value = true
    selectionCopied.value = false
  }, 100)

  // Auto-hide tooltip after delay
  selectionHideTimeout = setTimeout(() => {
    showSelectionTooltip.value = false
  }, animationConfig.microInteractions.selectionTooltipTimeoutMs)
}

// 🎨 Palette's micro-UX enhancement: Copy selected text
const copySelectedText = async () => {
  if (!selectedText.value || selectionCopied.value) return

  // BugFixer: Guard for SSR safety
  if (typeof navigator === 'undefined' || !navigator.clipboard) return

  try {
    await navigator.clipboard.writeText(selectedText.value)

    selectionCopied.value = true

    // Haptic feedback for success
    hapticSuccess()

    // Announce to screen readers
    announcement.value = `Copied "${selectedText.value.slice(0, 50)}${selectedText.value.length > 50 ? '...' : ''}" to clipboard`
    setTimeout(() => {
      announcement.value = ''
    }, config.announcementClearMs)

    // Hide tooltip after success
    setTimeout(() => {
      showSelectionTooltip.value = false
      // Clear selection
      if (typeof window !== 'undefined') {
        window.getSelection()?.removeAllRanges()
      }
    }, animationConfig.copySuccess.tooltipDurationMs) // BugFixer: Fixed incorrect copyFeedback reference
  } catch {
    // Silent fail
    announcement.value = 'Failed to copy selection'
    setTimeout(() => {
      announcement.value = ''
    }, config.announcementClearMs)
  }
}

// Transition hooks for smooth height animation
const onBeforeEnter = (el: Element) => {
  const htmlEl = el as HTMLElement
  htmlEl.style.height = '0px'
  htmlEl.style.opacity = '0'
}

const onEnter = (el: Element, done: () => void) => {
  const htmlEl = el as HTMLElement
  const height = htmlEl.scrollHeight

  htmlEl.style.transition = `height ${animationConfig.transition.normal.durationMs}ms ease-out, opacity ${animationConfig.transition.fast.durationMs}ms ease-out`
  htmlEl.style.height = `${height}px`
  htmlEl.style.opacity = '1'

  setTimeout(done, animationConfig.transition.normal.durationMs)
}

const onBeforeLeave = (el: Element) => {
  const htmlEl = el as HTMLElement
  htmlEl.style.height = `${htmlEl.scrollHeight}px`
}

const onLeave = (el: Element, done: () => void) => {
  const htmlEl = el as HTMLElement

  htmlEl.style.transition = `height ${animationConfig.transition.fast.durationMs}ms ease-in, opacity ${animationConfig.transition.fast.durationMs}ms ease-in`
  htmlEl.style.height = '0px'
  htmlEl.style.opacity = '0'

  setTimeout(done, animationConfig.transition.fast.durationMs)
}

// Lifecycle
let mediaQuery: MediaQueryList | null = null
let handleMotionChange: ((e: MediaQueryListEvent) => void) | null = null

onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes
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

  // 🎨 Palette's micro-UX enhancement: Cleanup selection tooltip timeouts
  if (selectionTooltipTimeout) {
    clearTimeout(selectionTooltipTimeout)
  }
  if (selectionHideTimeout) {
    clearTimeout(selectionHideTimeout)
  }
})
</script>

<style scoped>
/* Description section container */
.description-section {
  margin-bottom: 2rem;
}

/* Header with title and actions */
.description-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.description-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(17, 24, 39);
  margin: 0;
}

.description-actions {
  display: flex;
  gap: 0.5rem;
}

/* Action buttons */
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background-color: rgb(243, 244, 246);
  border: none;
  color: rgb(75, 85, 99);
  cursor: pointer;
  transition: all v-bind('`${animationConfig.transition.fast.durationMs}ms`')
    ease-out;
  position: relative;
  overflow: hidden;
}

.action-btn:hover {
  background-color: rgb(229, 231, 235);
  color: rgb(55, 65, 81);
  transform: translateY(-1px);
}

.action-btn:focus-visible {
  outline: 2px solid rgb(59, 130, 246);
  outline-offset: 2px;
}

.action-btn.is-pressed {
  transform: scale(0.95);
}

.action-icon {
  width: 1.125rem;
  height: 1.125rem;
  transition: transform
    v-bind('`${animationConfig.transition.fast.durationMs}ms`') ease-out;
}

/* Copy button states */
.copy-btn.copy-success {
  background-color: rgb(220, 252, 231);
  color: rgb(22, 101, 52);
}

.copy-btn.copy-success:hover {
  background-color: rgb(187, 247, 208);
}

/* Icon animations */
.animate-icon {
  animation: icon-bounce v-bind('`${animationConfig.focus.pulseDurationMs}ms`')
    ease-in-out;
}

@keyframes icon-bounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}

/* Checkmark animation */
.checkmark-icon {
  animation: check-pop
    v-bind('`${animationConfig.copySuccess?.checkmarkDelaySec || 0.3}s`')
    v-bind(
      'animationConfig.easing?.spring || "cubic-bezier(0.175, 0.885, 0.32, 1.275)"'
    );
}

@keyframes check-pop {
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(0deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Description content */
.description-content-wrapper {
  position: relative;
}

.description-text {
  margin: 0 0 0.75rem 0;
  color: rgb(55, 65, 81);
  line-height: 1.625;
  font-size: 1rem;
  overflow: hidden;
}

.description-text-truncated {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.description-text-full {
  margin-bottom: 0.75rem;
}

/* Read more/less button */
.read-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(37, 99, 235);
  background-color: rgb(239, 246, 255);
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all v-bind('`${animationConfig.transition.fast.durationMs}ms`')
    ease-out;
}

.read-more-btn:hover {
  background-color: rgb(219, 234, 254);
  color: rgb(29, 78, 216);
  transform: translateY(-1px);
}

.read-more-btn:focus-visible {
  outline: 2px solid rgb(59, 130, 246);
  outline-offset: 2px;
}

.read-more-btn.is-pressed {
  transform: scale(0.95);
}

.read-more-text {
  white-space: nowrap;
}

.read-more-icon {
  width: 1rem;
  height: 1rem;
  transition: transform
    v-bind('`${animationConfig.transition.normal.durationMs}ms`') ease-out;
}

.read-more-icon.rotate-180 {
  transform: rotate(180deg);
}

/* Footer with reading stats */
.description-footer {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgb(229, 231, 235);
}

.reading-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: rgb(107, 114, 128);
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-icon {
  width: 1rem;
  height: 1rem;
  opacity: 0.6;
}

.stat-value {
  font-weight: 600;
  color: rgb(75, 85, 99);
}

.stat-label {
  font-size: 0.8125rem;
}

.stat-divider {
  color: rgb(209, 213, 219);
  user-select: none;
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
  .action-btn,
  .read-more-btn,
  .action-icon,
  .read-more-icon {
    transition: none;
    animation: none;
  }

  .action-btn:hover,
  .read-more-btn:hover {
    transform: none;
  }

  .checkmark-icon {
    animation: none;
  }

  .animate-icon {
    animation: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .read-more-btn {
    border: 1px solid currentColor;
  }

  .action-btn {
    border: 1px solid currentColor;
  }
}

/* 🎨 Palette's micro-UX enhancement: Text Selection Tooltip Styles */
/* Flexy hates hardcoded z-index: 50! Using zIndexConfig.tooltip */
.selection-tooltip {
  position: absolute;
  z-index: v-bind('zIndexConfig.tooltip');
  transform: translateX(-50%);
  pointer-events: auto;
}

.selection-tooltip-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  transition: all v-bind('`${animationConfig.transition.fast.durationMs}ms`')
    ease-out;
  transform-origin: center bottom;
}

.selection-tooltip-btn:hover {
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  transform: translateY(-1px);
  box-shadow:
    0 6px 8px -1px rgba(0, 0, 0, 0.15),
    0 3px 6px -1px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.15) inset;
}

.selection-tooltip-btn.is-pressed {
  transform: scale(0.95);
}

.selection-tooltip-btn.is-copied {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.selection-tooltip-icon {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
}

.selection-tooltip-icon.checkmark {
  animation: selection-check-pop
    v-bind('`${animationConfig.copyFeedback.checkmarkDelaySec || 0.3}s`')
    ease-out;
}

@keyframes selection-check-pop {
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

.selection-tooltip-text {
  white-space: nowrap;
}

.selection-tooltip-arrow {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #111827;
}

/* Reduced motion support for selection tooltip */
@media (prefers-reduced-motion: reduce) {
  .selection-tooltip-btn {
    transition: none;
  }

  .selection-tooltip-btn:hover {
    transform: none;
  }

  .selection-tooltip-icon.checkmark {
    animation: none;
  }
}

/* High contrast mode support for selection tooltip */
@media (prefers-contrast: high) {
  .selection-tooltip-btn {
    background: black;
    border: 2px solid white;
  }

  .selection-tooltip-arrow {
    border-top-color: black;
  }
}
</style>
