<template>
  <div class="comparison-value-wrapper">
    <!-- Text Type with Copy Functionality -->
    <template v-if="type === 'text'">
      <button
        v-if="value"
        class="comparison-value comparison-value--interactive"
        :class="{
          'comparison-value--copied': copiedState.text,
          'comparison-value--reduced-motion': prefersReducedMotion,
        }"
        :aria-label="`Copy ${value} to clipboard`"
        :title="copyTooltip"
        @click="handleCopy(value as string, 'text')"
        @keydown.enter.prevent="handleCopy(value as string, 'text')"
        @keydown.space.prevent="handleCopy(value as string, 'text')"
      >
        <span class="comparison-value__text">{{ value }}</span>
        <span class="comparison-value__icon" aria-hidden="true">
          <Transition
            mode="out-in"
            :enter-active-class="`transition-all ${animationConfig.tailwindDurations.normal} ease-out`"
            enter-from-class="opacity-0 scale-50"
            enter-to-class="opacity-100 scale-100"
            :leave-active-class="`transition-all ${animationConfig.tailwindDurations.quick} ease-in`"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-50"
          >
            <svg
              v-if="copiedState.text"
              key="check"
              class="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <svg
              v-else
              key="copy"
              class="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </Transition>
        </span>
      </button>
      <span v-else class="comparison-value comparison-value--empty">-</span>
    </template>

    <!-- Number Type with Copy Functionality -->
    <template v-else-if="type === 'number'">
      <button
        v-if="value !== undefined && value !== null"
        class="comparison-value comparison-value--interactive comparison-value--number"
        :class="{
          'comparison-value--copied': copiedState.number,
          'comparison-value--reduced-motion': prefersReducedMotion,
        }"
        :aria-label="`Copy ${value} to clipboard`"
        :title="copyTooltip"
        @click="handleCopy(String(value), 'number')"
        @keydown.enter.prevent="handleCopy(String(value), 'number')"
        @keydown.space.prevent="handleCopy(String(value), 'number')"
      >
        <span class="comparison-value__text">{{ value }}</span>
        <span class="comparison-value__icon" aria-hidden="true">
          <Transition
            mode="out-in"
            :enter-active-class="`transition-all ${animationConfig.tailwindDurations.normal} ease-out`"
            enter-from-class="opacity-0 scale-50"
            enter-to-class="opacity-100 scale-100"
            :leave-active-class="`transition-all ${animationConfig.tailwindDurations.quick} ease-in`"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-50"
          >
            <svg
              v-if="copiedState.number"
              key="check"
              class="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <svg
              v-else
              key="copy"
              class="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </Transition>
        </span>
      </button>
      <span v-else class="comparison-value comparison-value--empty">-</span>
    </template>

    <!-- Boolean Type with Enhanced Visuals -->
    <template v-else-if="type === 'boolean'">
      <span
        v-if="value === true"
        class="comparison-value comparison-value--boolean comparison-value--true"
        :class="{ 'comparison-value--reduced-motion': prefersReducedMotion }"
      >
        <span class="comparison-value__boolean-icon" aria-hidden="true">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
        <span class="comparison-value__boolean-text">Yes</span>
      </span>
      <span
        v-else-if="value === false"
        class="comparison-value comparison-value--boolean comparison-value--false"
        :class="{ 'comparison-value--reduced-motion': prefersReducedMotion }"
      >
        <span class="comparison-value__boolean-icon" aria-hidden="true">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
        <span class="comparison-value__boolean-text">No</span>
      </span>
      <span v-else class="comparison-value comparison-value--empty">-</span>
    </template>

    <!-- List Type with Copy All Functionality -->
    <template v-else-if="type === 'list'">
      <div
        v-if="Array.isArray(value) && value.length > 0"
        class="comparison-value comparison-value--list"
        :class="{ 'comparison-value--reduced-motion': prefersReducedMotion }"
      >
        <div class="flex flex-wrap justify-center gap-1">
          <span
            v-for="(item, index) in displayItems"
            :key="index"
            class="comparison-value__list-item"
            :style="getListItemStyle(index)"
          >
            {{ item }}
          </span>
          <button
            v-if="hasMoreItems"
            ref="moreButtonRef"
            class="comparison-value__more-btn"
            :class="{
              'comparison-value--copied': copiedState.list,
              'comparison-value--reduced-motion': prefersReducedMotion,
              'comparison-value__more-btn--hover': isMoreButtonHovered,
            }"
            :aria-label="`Copy all ${value.length} items to clipboard. Hover to preview hidden items.`"
            :title="`Copy all ${value.length} items`"
            @click="handleCopyList"
            @keydown.enter.prevent="handleCopyList"
            @keydown.space.prevent="handleCopyList"
            @mouseenter="handleMoreButtonMouseEnter"
            @mouseleave="handleMoreButtonMouseLeave"
            @focus="handleMoreButtonMouseEnter"
            @blur="handleMoreButtonMouseLeave"
          >
            <span class="comparison-value__more-btn-text"
              >+{{ value.length - displayLimit }}
              {{ contentConfig.similarResources.moreItemsText }}</span
            >
            <Transition
              mode="out-in"
              :enter-active-class="`transition-all ${animationConfig.tailwindDurations.normal} ease-out`"
              enter-from-class="opacity-0 scale-50"
              enter-to-class="opacity-100 scale-100"
              :leave-active-class="`transition-all ${animationConfig.tailwindDurations.quick} ease-in`"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-50"
            >
              <svg
                v-if="copiedState.list"
                key="check"
                class="w-3 h-3 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <svg
                v-else
                key="copy"
                class="w-3 h-3 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </Transition>
          </button>
        </div>

        <!-- List Preview Tooltip - Palette's micro-UX delight! 🎨 -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-2"
        >
          <div
            v-if="showListPreview && hasMoreItems"
            class="comparison-value__list-preview"
            :class="{
              'comparison-value__list-preview--reduced-motion':
                prefersReducedMotion,
            }"
            role="tooltip"
            @mouseenter="handlePreviewMouseEnter"
            @mouseleave="handlePreviewMouseLeave"
          >
            <div class="comparison-value__list-preview-header">
              <span class="comparison-value__list-preview-title"
                >All Items ({{ value.length }})</span
              >
              <button
                class="comparison-value__list-preview-copy"
                :aria-label="`Copy all ${value.length} items`"
                @click="handleCopyList"
              >
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
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Copy</span>
              </button>
            </div>
            <div class="comparison-value__list-preview-items">
              <span
                v-for="(item, index) in value"
                :key="index"
                class="comparison-value__list-preview-item"
                :class="{
                  'comparison-value__list-preview-item--hidden':
                    index < displayLimit,
                }"
                :style="getPreviewItemStyle(index)"
              >
                {{ item }}
              </span>
            </div>
          </div>
        </Transition>
      </div>
      <span v-else class="comparison-value comparison-value--empty">-</span>
    </template>

    <!-- Screen Reader Announcements -->
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
      {{ announcementText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { limitsConfig } from '~/configs/limits.config'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'
import { themeConfig } from '~/configs/theme.config'
import { hapticSuccess } from '~/utils/hapticFeedback'

interface Props {
  value?: string | number | boolean | string[]
  type?: 'text' | 'number' | 'boolean' | 'list'
  /**
   * Enable copy functionality for text and number values
   * @default true
   */
  enableCopy?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
  type: 'text',
  enableCopy: true,
})

// Flexy hates hardcoded limits! Use configurable display limit
const displayLimit = limitsConfig.display.maxListItemsDisplay

// Copied state for visual feedback
const copiedState = ref({
  text: false,
  number: false,
  list: false,
})

// List preview tooltip state - Palette's micro-UX delight! 🎨
const showListPreview = ref(false)
const isMoreButtonHovered = ref(false)
const moreButtonRef = ref<HTMLElement | null>(null)
let previewShowTimeout: ReturnType<typeof setTimeout> | null = null
let previewHideTimeout: ReturnType<typeof setTimeout> | null = null

// Announcement text for screen readers
const announcementText = ref('')

// Copy timeout refs
const copyTimeouts = ref<Record<string, ReturnType<typeof setTimeout> | null>>({
  text: null,
  number: null,
  list: null,
})

// Check for reduced motion preference
const prefersReducedMotion = ref(false)

const checkReducedMotion = () => {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Initialize on mount
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()
})

// Cleanup timeouts on unmount
onUnmounted(() => {
  if (previewShowTimeout) {
    clearTimeout(previewShowTimeout)
  }
  if (previewHideTimeout) {
    clearTimeout(previewHideTimeout)
  }
  // Clear copy timeouts
  Object.values(copyTimeouts.value).forEach(timeout => {
    if (timeout) clearTimeout(timeout)
  })
})

const displayItems = computed(() => {
  if (!Array.isArray(props.value)) return []
  return props.value.slice(0, displayLimit)
})

const hasMoreItems = computed(() => {
  return (
    Array.isArray(props.value) &&
    (props.value as string[]).length > displayLimit
  )
})

const copyTooltip = computed(() => {
  return contentConfig.comparisonValue?.copyTooltip || 'Click to copy'
})

// Get staggered animation style for list items
const getListItemStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}
  // Flexy hates hardcoded 50! Using animationConfig
  const staggerDelay = animationConfig.comparisonValue?.listItemStaggerMs ?? 50
  return {
    animationDelay: `${index * staggerDelay}ms`,
  }
}

// Get staggered animation style for preview items
const getPreviewItemStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}
  // Flexy hates hardcoded 50! Using animationConfig
  const staggerDelay = animationConfig.comparisonValue?.listItemStaggerMs ?? 50
  const baseDelay = index * staggerDelay
  return {
    animationDelay: `${baseDelay}ms`,
  }
}

// Handle more button mouse enter with delayed preview
const handleMoreButtonMouseEnter = () => {
  isMoreButtonHovered.value = true

  // Clear any pending hide timeout
  if (previewHideTimeout) {
    clearTimeout(previewHideTimeout)
    previewHideTimeout = null
  }

  // Show preview after delay
  // Flexy hates hardcoded 200! Using animationConfig
  const showDelay =
    animationConfig.comparisonValue?.listPreviewShowDelayMs ?? 200
  previewShowTimeout = setTimeout(() => {
    showListPreview.value = true
  }, showDelay)
}

// Handle more button mouse leave with delayed hide
const handleMoreButtonMouseLeave = () => {
  isMoreButtonHovered.value = false

  // Clear any pending show timeout
  if (previewShowTimeout) {
    clearTimeout(previewShowTimeout)
    previewShowTimeout = null
  }

  // Hide preview after delay (allows moving to tooltip)
  // Flexy hates hardcoded 150! Using animationConfig
  const hideDelay =
    animationConfig.comparisonValue?.listPreviewHideDelayMs ?? 150
  previewHideTimeout = setTimeout(() => {
    showListPreview.value = false
  }, hideDelay)
}

// Handle preview mouse enter (keep preview open)
const handlePreviewMouseEnter = () => {
  // Clear hide timeout when hovering over preview
  if (previewHideTimeout) {
    clearTimeout(previewHideTimeout)
    previewHideTimeout = null
  }
  showListPreview.value = true
}

// Handle preview mouse leave
const handlePreviewMouseLeave = () => {
  // Flexy hates hardcoded 150! Using animationConfig
  const hideDelay =
    animationConfig.comparisonValue?.listPreviewHideDelayMs ?? 150
  previewHideTimeout = setTimeout(() => {
    showListPreview.value = false
  }, hideDelay)
}

// Handle copy action with haptic feedback and visual confirmation
const handleCopy = async (text: string, type: 'text' | 'number' | 'list') => {
  if (!props.enableCopy) return

  try {
    await navigator.clipboard.writeText(text)

    // Trigger haptic feedback on supported devices
    hapticSuccess()

    // Set copied state for visual feedback
    copiedState.value[type] = true

    // Announce to screen readers
    announcementText.value = `${text} copied to clipboard`
    setTimeout(() => {
      announcementText.value = ''
    }, animationConfig.microInteractions.announcementDelayMs)

    // Clear any existing timeout
    if (copyTimeouts.value[type]) {
      clearTimeout(copyTimeouts.value[type]!)
    }

    // Reset copied state after delay
    // Flexy hates hardcoded 2000! Using animationConfig
    copyTimeouts.value[type] = setTimeout(() => {
      copiedState.value[type] = false
    }, animationConfig.comparisonValue?.copyFeedbackDurationMs ?? 2000)
  } catch {
    // Silently fail if clipboard API is not available
  }
}

// Handle copy list action
const handleCopyList = async () => {
  if (!props.enableCopy || !Array.isArray(props.value)) return

  const text = (props.value as string[]).join(', ')
  await handleCopy(text, 'list')
}
</script>

<style scoped>
/* Base wrapper styles */
.comparison-value-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Base value styles */
.comparison-value {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  transition: all v-bind('animationConfig.transition.fast.durationMs + "ms"')
    ease-out;
}

/* Interactive value styles - Palette's micro-UX enhancement! */
.comparison-value--interactive {
  position: relative;
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  cursor: pointer;
  color: v-bind(
    'themeConfig.comparisonValue.interactiveTextColor || "#374151"'
  );
  transition: all v-bind('animationConfig.transition.fast.durationMs + "ms"')
    ease-out;
}

.comparison-value--interactive:hover {
  background-color: v-bind(
    'themeConfig.comparisonValue.hoverBgColor || "rgba(59, 130, 246, 0.1)"'
  );
  border-color: v-bind(
    'themeConfig.comparisonValue.hoverBorderColor || "rgba(59, 130, 246, 0.3)"'
  );
  transform: translateY(-1px);
}

.comparison-value--interactive:hover:not(.comparison-value--reduced-motion) {
  box-shadow: 0 2px 4px
    v-bind(
      'themeConfig.comparisonValue.hoverShadowColor || "rgba(0, 0, 0, 0.1)"'
    );
}

.comparison-value--interactive:active {
  transform: translateY(0) scale(0.98);
}

.comparison-value--interactive:focus-visible {
  outline: 2px solid
    v-bind('themeConfig.comparisonValue.focusRingColor || "#3b82f6"');
  outline-offset: 2px;
}

/* Copied state styles */
.comparison-value--copied {
  background-color: v-bind(
    'themeConfig.comparisonValue.copiedBgColor || "rgba(34, 197, 94, 0.1)"'
  ) !important;
  border-color: v-bind(
    'themeConfig.comparisonValue.copiedBorderColor || "rgba(34, 197, 94, 0.5)"'
  ) !important;
  color: v-bind(
    'themeConfig.comparisonValue.copiedTextColor || "#15803d"'
  ) !important;
}

.comparison-value--copied:not(.comparison-value--reduced-motion) {
  animation: copy-success-pulse
    v-bind('animationConfig.comparisonValue?.copySuccessAnimationMs || "400ms"')
    ease-out;
}

@keyframes copy-success-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* Icon styles */
.comparison-value__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  transition: opacity
    v-bind('animationConfig.transition.fast.durationMs + "ms"') ease;
}

.comparison-value--interactive:hover .comparison-value__icon {
  opacity: 1;
}

.comparison-value--copied .comparison-value__icon {
  opacity: 1;
}

/* Empty state styles */
.comparison-value--empty {
  color: v-bind('themeConfig.comparisonValue.emptyTextColor || "#6b7280"');
  font-style: italic;
}

/* Boolean value styles */
.comparison-value--boolean {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 500;
  font-size: 0.75rem;
}

.comparison-value--true {
  background-color: v-bind(
    'themeConfig.comparisonValue.booleanTrueBg || "rgba(34, 197, 94, 0.1)"'
  );
  color: v-bind('themeConfig.comparisonValue.booleanTrueColor || "#15803d"');
}

.comparison-value--false {
  background-color: v-bind(
    'themeConfig.comparisonValue.booleanFalseBg || "rgba(239, 68, 68, 0.1)"'
  );
  color: v-bind('themeConfig.comparisonValue.booleanFalseColor || "#b91c1c"');
}

.comparison-value__boolean-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.comparison-value--true:not(.comparison-value--reduced-motion)
  .comparison-value__boolean-icon {
  animation: boolean-pop
    v-bind('animationConfig.comparisonValue?.booleanPopDurationMs || "300ms"')
    ease-out;
}

@keyframes boolean-pop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* List value styles */
.comparison-value--list {
  display: block;
  width: 100%;
  position: relative;
}

.comparison-value__more-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  background-color: v-bind(
    'themeConfig.comparisonValue.moreBtnBg || "rgba(107, 114, 128, 0.1)"'
  );
  color: v-bind('themeConfig.comparisonValue.moreBtnColor || "#4b5563"');
  border: 1px solid transparent;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all v-bind('animationConfig.transition.fast.durationMs + "ms"')
    ease-out;
}

.comparison-value__more-btn:hover {
  background-color: v-bind(
    'themeConfig.comparisonValue.moreBtnHoverBg || "rgba(107, 114, 128, 0.2)"'
  );
  border-color: v-bind(
    'themeConfig.comparisonValue.moreBtnHoverBorder || "rgba(107, 114, 128, 0.3)"'
  );
}

.comparison-value__more-btn--hover:not(.comparison-value--reduced-motion) {
  transform: scale(
    v-bind('animationConfig.comparisonValue?.moreBtnHoverScale || 1.05')
  );
}

.comparison-value__more-btn-text {
  display: inline-flex;
  align-items: center;
}

.comparison-value__more-btn:focus-visible {
  outline: 2px solid
    v-bind('themeConfig.comparisonValue.focusRingColor || "#3b82f6"');
  outline-offset: 2px;
}

/* List Preview Tooltip - Palette's micro-UX delight! 🎨 */
.comparison-value__list-preview {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 0.5rem;
  min-width: 200px;
  max-width: 300px;
  background: v-bind('themeConfig.comparisonValue.previewBg || "#ffffff"');
  border: 1px solid
    v-bind('themeConfig.comparisonValue.previewBorder || "rgba(0, 0, 0, 0.1)"');
  border-radius: 0.5rem;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
  z-index: 50;
  padding: 0.75rem;
}

.comparison-value__list-preview::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: v-bind(
    'themeConfig.comparisonValue.previewBg || "#ffffff"'
  );
}

.comparison-value__list-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid
    v-bind('themeConfig.comparisonValue.previewDivider || "rgba(0, 0, 0, 0.1)"');
}

.comparison-value__list-preview-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: v-bind('themeConfig.comparisonValue.previewTitleColor || "#374151"');
}

.comparison-value__list-preview-copy {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: v-bind(
    'themeConfig.comparisonValue.previewCopyBg || "rgba(59, 130, 246, 0.1)"'
  );
  color: v-bind('themeConfig.comparisonValue.previewCopyColor || "#2563eb"');
  border: none;
  border-radius: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all v-bind('animationConfig.transition.fast.durationMs + "ms"')
    ease;
}

.comparison-value__list-preview-copy:hover {
  background: v-bind(
    'themeConfig.comparisonValue.previewCopyHoverBg || "rgba(59, 130, 246, 0.2)"'
  );
}

.comparison-value__list-preview-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  max-height: 150px;
  overflow-y: auto;
}

.comparison-value__list-preview-item {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background: v-bind(
    'themeConfig.comparisonValue.previewItemBg || "rgba(59, 130, 246, 0.08)"'
  );
  color: v-bind('themeConfig.comparisonValue.previewItemColor || "#1d4ed8"');
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0;
  animation: preview-item-fade-in
    v-bind('animationConfig.transition.normal.durationMs + "ms"') ease-out
    forwards;
}

.comparison-value__list-preview-item--hidden {
  opacity: 0.5;
  background: v-bind(
    'themeConfig.comparisonValue.previewItemHiddenBg || "rgba(107, 114, 128, 0.1)"'
  );
  color: v-bind(
    'themeConfig.comparisonValue.previewItemHiddenColor || "#6b7280"'
  );
}

@keyframes preview-item-fade-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.comparison-value__list-preview--reduced-motion
  .comparison-value__list-preview-item {
  animation: none;
  opacity: 1;
}

/* Enhanced List Item Hover Effects */
.comparison-value__list-item {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  background-color: v-bind(
    'themeConfig.comparisonValue.listItemBg || "rgba(59, 130, 246, 0.1)"'
  );
  color: v-bind('themeConfig.comparisonValue.listItemColor || "#1d4ed8"');
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all v-bind('animationConfig.transition.fast.durationMs + "ms"')
    ease-out;
  opacity: 0;
  animation: list-item-entrance
    v-bind('animationConfig.transition.normal.durationMs + "ms"') ease-out
    forwards;
}

.comparison-value__list-item:hover:not(.comparison-value--reduced-motion) {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: v-bind(
    'themeConfig.comparisonValue.listItemHoverBg || "rgba(59, 130, 246, 0.2)"'
  );
}

@keyframes list-item-entrance {
  from {
    opacity: 0;
    transform: translateY(4px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.comparison-value--reduced-motion .comparison-value__list-item {
  animation: none;
  opacity: 1;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .comparison-value,
  .comparison-value--interactive,
  .comparison-value__icon,
  .comparison-value__more-btn {
    transition: none !important;
    animation: none !important;
    transform: none !important;
  }

  .comparison-value--interactive:hover {
    transform: none;
    box-shadow: none;
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

/* High contrast mode support */
@media (prefers-contrast: high) {
  .comparison-value--interactive {
    border: 1px solid currentColor;
  }

  .comparison-value--interactive:focus-visible {
    outline: 3px solid currentColor;
    outline-offset: 3px;
  }
}
</style>
