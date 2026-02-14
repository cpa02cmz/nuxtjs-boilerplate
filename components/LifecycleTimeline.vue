<template>
  <div
    class="lifecycle-timeline"
    :class="{ 'lifecycle-timeline--loaded': isLoaded }"
  >
    <h3 class="timeline-title">
      {{ contentConfig.lifecycle.title }}
    </h3>

    <div v-if="statusHistory && statusHistory.length > 0" class="timeline">
      <div
        v-for="(change, index) in statusHistory"
        :key="change.id"
        :aria-label="getItemAriaLabel(change, index)"
        :style="{ '--item-index': index }"
        class="timeline-item"
        :class="{ 'timeline-item--clicked': clickedIndex === index }"
        role="listitem"
        tabindex="0"
        @click="handleItemClick($event, index, change)"
        @keydown="handleKeydown($event, index)"
      >
        <!-- Ripple effect container -->
        <span
          v-if="ripples[index]"
          class="timeline-item__ripple"
          aria-hidden="true"
        >
          <span
            class="timeline-item__ripple-circle"
            :style="{
              left: `${ripples[index].x}px`,
              top: `${ripples[index].y}px`,
              width: `${ripples[index].size}px`,
              height: `${ripples[index].size}px`,
            }"
          />
        </span>
        <div class="timeline-marker">
          <div
            :class="['marker', getMarkerClass(change.toStatus)]"
            :title="change.toStatus"
          >
            {{ getStatusInitial(change.toStatus) }}
          </div>
          <div
            v-if="index !== statusHistory.length - 1"
            class="timeline-connector"
          />
        </div>
        <div class="timeline-content">
          <div class="change-info">
            <span class="status-change"
              >{{ change.fromStatus }} → {{ change.toStatus }}</span
            >
            <span class="change-date">{{ formatDate(change.changedAt) }}</span>
          </div>
          <div class="change-details">
            <div v-if="change.reason" class="reason">
              {{ contentConfig.lifecycle.labels.reason }} {{ change.reason }}
            </div>
            <div v-if="change.notes" class="notes">
              {{ contentConfig.lifecycle.labels.notes }} {{ change.notes }}
            </div>
            <div class="changed-by">
              {{ contentConfig.lifecycle.labels.changedBy }}
              {{ change.changedBy }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-history">
      {{ contentConfig.lifecycle.emptyState }}
    </div>

    <!-- Screen reader announcements -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ announcement }}
    </div>

    <div
      v-if="updateHistory && updateHistory.length > 0"
      class="update-history"
    >
      <h4>{{ contentConfig.lifecycle.updateHistoryTitle }}</h4>
      <div v-for="update in updateHistory" :key="update.id" class="update-item">
        <div class="update-header">
          <span class="version"
            >{{ contentConfig.lifecycle.versionPrefix
            }}{{ update.version }}</span
          >
          <span class="update-date">{{ formatDate(update.updatedAt) }}</span>
        </div>
        <div v-if="update.changelog" class="changelog">
          {{ update.changelog }}
        </div>
        <ul
          v-if="update.changes && update.changes.length > 0"
          class="changes-list"
        >
          <li v-for="(change, idx) in update.changes" :key="idx">
            {{ change }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Keyboard navigation hint - Palette's micro-UX enhancement!
         Subtle hint that appears when timeline is focused via keyboard -->
    <div
      v-if="statusHistory && statusHistory.length > 1"
      class="keyboard-hint"
      :class="{ 'keyboard-hint--visible': isKeyboardFocused }"
      role="note"
      aria-label="Keyboard navigation shortcuts"
    >
      <div class="keyboard-hint__content">
        <span class="keyboard-hint__item">
          <kbd class="keyboard-hint__key">↑</kbd>
          <kbd class="keyboard-hint__key">↓</kbd>
          <span class="keyboard-hint__text">Navigate</span>
        </span>
        <span class="keyboard-hint__divider" aria-hidden="true">•</span>
        <span class="keyboard-hint__item">
          <kbd class="keyboard-hint__key">j</kbd>
          <kbd class="keyboard-hint__key">k</kbd>
          <span class="keyboard-hint__text">Vim style</span>
        </span>
        <span class="keyboard-hint__divider" aria-hidden="true">•</span>
        <span class="keyboard-hint__item">
          <kbd class="keyboard-hint__key">Home</kbd>
          <span class="keyboard-hint__text">First</span>
        </span>
        <span class="keyboard-hint__divider" aria-hidden="true">•</span>
        <span class="keyboard-hint__item">
          <kbd class="keyboard-hint__key">End</kbd>
          <span class="keyboard-hint__text">Last</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { StatusChange, ResourceUpdate } from '~/types/resource'
import { contentConfig } from '~/configs/content.config'
import { componentColorsConfig } from '~/configs/component-colors.config'
import { shadowsConfig } from '~/configs/shadows.config'
import { animationConfig } from '~/configs/animation.config'
import { easingConfig } from '~/configs/easing.config'
import { hapticLight } from '~/utils/hapticFeedback'
import { uiTimingConfig } from '~/configs/ui-timing.config'

interface Props {
  statusHistory?: StatusChange[]
  updateHistory?: ResourceUpdate[]
}

const props = defineProps<Props>()

// Reactive state
const isLoaded = ref(false)
const prefersReducedMotion = ref(false)
const ripples = ref<{ [key: number]: { x: number; y: number; size: number } }>(
  {}
)
const clickedIndex = ref<number | null>(null)
const announcement = ref('')
const isKeyboardFocused = ref(false)
let keyboardFocusTimeout: ReturnType<typeof setTimeout> | null = null

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

// Get ARIA label for timeline item
const getItemAriaLabel = (change: StatusChange, index: number): string => {
  const position =
    index === 0
      ? 'Most recent change'
      : `Change ${index + 1} of ${props.statusHistory?.length || 0}`
  const statusChange = `${change.fromStatus} changed to ${change.toStatus}`
  const date = formatDate(change.changedAt)
  return `${position}: ${statusChange} on ${date}`
}

const getMarkerClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'marker-active'
    case 'deprecated':
      return 'marker-deprecated'
    case 'discontinued':
      return 'marker-discontinued'
    case 'updated':
      return 'marker-updated'
    case 'pending':
      return 'marker-pending'
    default:
      return 'marker-unknown'
  }
}

const getStatusInitial = (status: string) => {
  switch (status) {
    case 'active':
      return 'A'
    case 'deprecated':
      return 'D'
    case 'discontinued':
      return 'X'
    case 'updated':
      return 'U'
    case 'pending':
      return 'P'
    default:
      return '?'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Handle timeline item click with micro-UX enhancements
const handleItemClick = (
  event: MouseEvent,
  index: number,
  change: StatusChange
) => {
  // Create ripple effect
  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height) * 1.2

  ripples.value[index] = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    size,
  }

  // Click feedback animation
  clickedIndex.value = index
  setTimeout(() => {
    clickedIndex.value = null
  }, uiTimingConfig.clickFeedback.resetDelay)

  // Haptic feedback for mobile users - Palette's micro-UX touch!
  if (!prefersReducedMotion.value) {
    hapticLight()
  }

  // Announce status change to screen readers
  announcement.value = `Status changed from ${change.fromStatus} to ${change.toStatus} on ${formatDate(change.changedAt)}`
  setTimeout(() => {
    announcement.value = ''
  }, uiTimingConfig.timeline.announcementClearDelay)

  // Remove ripple after animation
  setTimeout(() => {
    delete ripples.value[index]
  }, uiTimingConfig.ripple.removalDelay)
}

// Handle keyboard navigation with enhanced feedback
const handleKeydown = (event: KeyboardEvent, index: number) => {
  const items = document.querySelectorAll('.timeline-item')

  // Show keyboard hint when using keyboard navigation
  isKeyboardFocused.value = true
  if (keyboardFocusTimeout) {
    clearTimeout(keyboardFocusTimeout)
  }

  switch (event.key) {
    case 'ArrowDown':
    case 'j':
      event.preventDefault()
      if (index < items.length - 1) {
        ;(items[index + 1] as HTMLElement)?.focus()
      }
      break
    case 'ArrowUp':
    case 'k':
      event.preventDefault()
      if (index > 0) {
        ;(items[index - 1] as HTMLElement)?.focus()
      }
      break
    case 'Home':
      event.preventDefault()
      ;(items[0] as HTMLElement)?.focus()
      break
    case 'End':
      event.preventDefault()
      ;(items[items.length - 1] as HTMLElement)?.focus()
      break
  }
}

// Handle focus to show keyboard hint
const handleFocus = () => {
  isKeyboardFocused.value = true
  if (keyboardFocusTimeout) {
    clearTimeout(keyboardFocusTimeout)
  }
}

// Handle blur to hide keyboard hint after delay
const handleBlur = () => {
  keyboardFocusTimeout = setTimeout(() => {
    isKeyboardFocused.value = false
  }, animationConfig.tooltip.hideDelayMs)
}

// Setup on mount
onMounted(() => {
  // Check reduced motion preference
  prefersReducedMotion.value = checkReducedMotion()

  // Trigger entrance animation after a short delay
  setTimeout(() => {
    isLoaded.value = true
  }, uiTimingConfig.keyboard.hintTimeout)

  // Add global focus tracking for keyboard hint
  document.addEventListener('focusin', handleFocus)
  document.addEventListener('focusout', handleBlur)
})

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('focusin', handleFocus)
  document.removeEventListener('focusout', handleBlur)
  if (keyboardFocusTimeout) {
    clearTimeout(keyboardFocusTimeout)
  }
})
</script>

<style scoped>
.lifecycle-timeline {
  padding: 1rem;
  border: 1px solid v-bind('componentColorsConfig.lifecycleTimeline.border');
  border-radius: 0.5rem;
  background-color: v-bind(
    'componentColorsConfig.lifecycleTimeline.background'
  );
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity v-bind('animationConfig.card.enterDurationMs + "ms"') ease-out,
    transform v-bind('animationConfig.card.enterDurationMs + "ms"') ease-out;
}

.lifecycle-timeline--loaded {
  opacity: 1;
  transform: translateY(0);
}

.timeline-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: v-bind('componentColorsConfig.lifecycleTimeline.title');
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  opacity: 0;
  transform: translateX(-20px);
  animation: slide-in v-bind('animationConfig.suggestion.staggerDelayMs + "ms"')
    ease-out forwards;
  animation-delay: calc(
    var(--item-index) * v-bind('animationConfig.card.staggerDelayMs + "ms"')
  );
  transition:
    transform v-bind('animationConfig.transition.normal.durationMs') ms ease-out,
    background-color v-bind('animationConfig.cssTransitions.quickSec') ease-out;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border-radius: 0.375rem;
  padding: 0.5rem;
  margin: -0.5rem;
}

.timeline-item:hover {
  transform: translateX(4px);
  background-color: v-bind('componentColorsConfig.lifecycleTimeline.hoverBg');
}

.timeline-item:focus {
  outline: 2px solid v-bind('componentColorsConfig.focusRing.color');
  outline-offset: 2px;
}

.timeline-item:focus-visible {
  outline: 2px solid v-bind('componentColorsConfig.focusRing.color');
  outline-offset: 2px;
  background-color: v-bind('componentColorsConfig.lifecycleTimeline.focusBg');
}

/* Click/tap feedback animation - Palette's micro-UX delight!
   Enhanced with spring easing for more tactile, delightful feel */
.timeline-item--clicked {
  animation: timeline-item-press
    v-bind('animationConfig.microInteractions.clickFeedbackDurationMs + "ms"')
    v-bind(
      'easingConfig?.cubicBezier?.spring ?? "cubic-bezier(0.175, 0.885, 0.32, 1.275)"'
    );
}

@keyframes timeline-item-press {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(
      v-bind('animationConfig.microInteractions.clickShrinkScale')
    );
  }
  100% {
    transform: scale(1);
  }
}

/* Ripple effect styles */
.timeline-item__ripple {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: inherit;
}

.timeline-item__ripple-circle {
  position: absolute;
  border-radius: 50%;
  background-color: v-bind(
    'componentColorsConfig.lifecycleTimeline.rippleColor'
  );
  opacity: 0.3;
  transform: translate(-50%, -50%) scale(0);
  animation: timeline-ripple
    v-bind('animationConfig.zeroResultSearches.rippleDurationSec') ease-out
    forwards;
}

@keyframes timeline-ripple {
  to {
    transform: translate(-50%, -50%) scale(4);
    opacity: 0;
  }
}

/* Screen reader only content */
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

@keyframes slide-in {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marker {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
  color: white;
  flex-shrink: 0;
  transition: transform v-bind('animationConfig.transition.normal.durationMs')
    ms ease-out;
  box-shadow: v-bind('shadowsConfig.lifecycleTimeline.default');
}

.timeline-item:hover .marker {
  transform: scale(1.1);
}

.marker-active {
  background-color: v-bind(
    'componentColorsConfig.lifecycleTimeline.markers.active'
  );
}

.marker-deprecated {
  background-color: v-bind(
    'componentColorsConfig.lifecycleTimeline.markers.deprecated'
  );
}

.marker-discontinued {
  background-color: v-bind(
    'componentColorsConfig.lifecycleTimeline.markers.discontinued'
  );
}

.marker-updated {
  background-color: v-bind(
    'componentColorsConfig.lifecycleTimeline.markers.updated'
  );
}

.marker-pending {
  background-color: v-bind(
    'componentColorsConfig.lifecycleTimeline.markers.pending'
  );
}

.marker-unknown {
  background-color: v-bind(
    'componentColorsConfig.lifecycleTimeline.markers.unknown'
  );
}

.timeline-connector {
  width: 2px;
  height: 100%;
  background-color: v-bind('componentColorsConfig.lifecycleTimeline.connector');
  margin-top: 0.5rem;
}

.timeline-content {
  flex: 1;
  padding-bottom: 1rem;
}

.change-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.status-change {
  font-weight: 600;
  color: v-bind('componentColorsConfig.lifecycleTimeline.statusChange');
}

.change-date {
  font-size: 0.875rem;
  color: v-bind('componentColorsConfig.lifecycleTimeline.date');
}

.change-details {
  font-size: 0.875rem;
  color: v-bind('componentColorsConfig.lifecycleTimeline.details');
}

.reason,
.notes,
.changed-by {
  margin: 0.25rem 0;
}

.reason {
  font-weight: 500;
  color: v-bind('componentColorsConfig.lifecycleTimeline.reason');
}

.no-history {
  padding: 1rem;
  text-align: center;
  color: v-bind('componentColorsConfig.lifecycleTimeline.noHistory');
  font-style: italic;
}

.update-history {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid v-bind('componentColorsConfig.lifecycleTimeline.border');
}

.update-history h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: v-bind('componentColorsConfig.lifecycleTimeline.updateHeader');
}

.update-item {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border: 1px solid v-bind('componentColorsConfig.lifecycleTimeline.border');
  border-radius: 0.375rem;
  background-color: v-bind('componentColorsConfig.common.white');
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.version {
  font-weight: 600;
  color: v-bind('componentColorsConfig.lifecycleTimeline.version');
}

.update-date {
  font-size: 0.875rem;
  color: v-bind('componentColorsConfig.lifecycleTimeline.date');
}

.changelog {
  margin-bottom: 0.5rem;
  color: v-bind('componentColorsConfig.lifecycleTimeline.changelog');
}

.changes-list {
  list-style-type: disc;
  padding-left: 1.25rem;
  color: v-bind('componentColorsConfig.lifecycleTimeline.changelog');
}

.changes-list li {
  margin-bottom: 0.25rem;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .lifecycle-timeline {
    transition: none;
    opacity: 1;
    transform: none;
  }

  .timeline-item {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .timeline-item:hover {
    transform: none;
    background-color: transparent;
  }

  .timeline-item:focus-visible {
    background-color: transparent;
  }

  .timeline-item--clicked {
    transform: none;
  }

  .timeline-item:hover .marker {
    transform: none;
  }

  .marker {
    transition: none;
  }

  .timeline-item__ripple-circle {
    animation: none;
    opacity: 0;
  }
}

/* Focus visible support */
.timeline-item:focus {
  outline: 2px solid v-bind('componentColorsConfig.focusRing.color');
  outline-offset: 2px;
}

/* Keyboard navigation hint - Palette's micro-UX enhancement!
   Shows keyboard shortcuts when user navigates via keyboard */
.keyboard-hint {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid v-bind('componentColorsConfig.lifecycleTimeline.border');
  opacity: 0;
  transform: translateY(-8px);
  transition: all v-bind('animationConfig.transition.normal.durationMs + "ms"')
    ease-out;
  pointer-events: none;
}

.keyboard-hint--visible {
  opacity: 1;
  transform: translateY(0);
}

.keyboard-hint__content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  font-size: 0.75rem;
  color: v-bind('componentColorsConfig.lifecycleTimeline.hintText');
}

.keyboard-hint__item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.keyboard-hint__key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  padding: 0.125rem 0.375rem;
  font-family: monospace;
  font-size: 0.6875rem;
  font-weight: 600;
  color: v-bind('componentColorsConfig.lifecycleTimeline.hintKeyText');
  background-color: v-bind('componentColorsConfig.lifecycleTimeline.hintKeyBg');
  border: 1px solid
    v-bind('componentColorsConfig.lifecycleTimeline.hintKeyBorder');
  border-radius: 0.25rem;
  box-shadow: 0 1px 0
    v-bind('componentColorsConfig.lifecycleTimeline.hintKeyBorder');
}

.keyboard-hint__text {
  margin-left: 0.25rem;
}

.keyboard-hint__divider {
  color: v-bind('componentColorsConfig.lifecycleTimeline.hintDivider');
  opacity: 0.5;
}

/* Reduced motion support for keyboard hint */
@media (prefers-reduced-motion: reduce) {
  .keyboard-hint {
    transition: opacity v-bind('animationConfig.cssTransitions.fastSec') ease;
    transform: none;
  }

  .keyboard-hint--visible {
    transform: none;
  }
}

/* Hide keyboard hint on touch devices */
@media (hover: none) and (pointer: coarse) {
  .keyboard-hint {
    display: none;
  }
}
</style>
