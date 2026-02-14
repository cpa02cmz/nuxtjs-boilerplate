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
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 scale-50"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-150 ease-in"
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
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 scale-50"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-150 ease-in"
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
      >
        <div class="flex flex-wrap justify-center gap-1">
          <span
            v-for="(item, index) in displayItems"
            :key="index"
            class="comparison-value__list-item"
          >
            {{ item }}
          </span>
          <button
            v-if="hasMoreItems"
            class="comparison-value__more-btn"
            :class="{
              'comparison-value--copied': copiedState.list,
              'comparison-value--reduced-motion': prefersReducedMotion,
            }"
            :aria-label="`Copy all ${value.length} items to clipboard`"
            :title="`Copy all ${value.length} items`"
            @click="handleCopyList"
            @keydown.enter.prevent="handleCopyList"
            @keydown.space.prevent="handleCopyList"
          >
            <span
              >+{{ value.length - displayLimit }}
              {{ contentConfig.similarResources.moreItemsText }}</span
            >
            <Transition
              mode="out-in"
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 scale-50"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition-all duration-150 ease-in"
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
import { computed, ref, onMounted } from 'vue'
import { limitsConfig } from '~/configs/limits.config'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'
import { spacingConfig } from '~/configs/spacing.config'
import { typographyConfig } from '~/configs/typography.config'
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

// Handle copy action with haptic feedback and visual confirmation
const handleCopy = async (text: string, type: 'text' | 'number') => {
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
    copyTimeouts.value[type] = setTimeout(() => {
      copiedState.value[type] = false
    }, animationConfig.comparisonValue?.copyFeedbackDurationMs || 2000)
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
  gap: v-bind('spacingConfig.gap.md');
  font-size: v-bind('typographyConfig.fontSize.sm');
  line-height: v-bind('typographyConfig.lineHeight.sm');
  transition: all v-bind('animationConfig.transition.fast.durationMs + "ms"')
    ease-out;
}

/* Interactive value styles - Palette's micro-UX enhancement! */
.comparison-value--interactive {
  position: relative;
  padding: v-bind('spacingConfig.padding.smMd');
  background: transparent;
  border: v-bind('spacingConfig.border.transparent');
  border-radius: v-bind('spacingConfig.borderRadius.base');
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
  outline: v-bind(
      'spacingConfig.outline.width + " " + spacingConfig.outline.style'
    )
    v-bind('themeConfig.comparisonValue.focusRingColor || "#3b82f6"');
  outline-offset: v-bind('spacingConfig.outline.offset');
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
  gap: v-bind('spacingConfig.gap.md');
  padding: v-bind('spacingConfig.padding.smLg');
  border-radius: v-bind('spacingConfig.borderRadius.full');
  font-weight: v-bind('typographyConfig.fontWeight.medium');
  font-size: v-bind('typographyConfig.fontSize.xs');
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
}

.comparison-value__list-item {
  display: inline-flex;
  align-items: center;
  padding: v-bind('spacingConfig.padding.xs')
    v-bind('spacingConfig.padding.base');
  background-color: v-bind(
    'themeConfig.comparisonValue.listItemBg || "rgba(59, 130, 246, 0.1)"'
  );
  color: v-bind('themeConfig.comparisonValue.listItemColor || "#1d4ed8"');
  border-radius: v-bind('spacingConfig.borderRadius.md');
  font-size: v-bind('typographyConfig.fontSize.xs');
  font-weight: v-bind('typographyConfig.fontWeight.medium');
}

.comparison-value__more-btn {
  display: inline-flex;
  align-items: center;
  padding: v-bind('spacingConfig.padding.xs')
    v-bind('spacingConfig.padding.base');
  background-color: v-bind(
    'themeConfig.comparisonValue.moreBtnBg || "rgba(107, 114, 128, 0.1)"'
  );
  color: v-bind('themeConfig.comparisonValue.moreBtnColor || "#4b5563"');
  border: v-bind('spacingConfig.border.transparent');
  border-radius: v-bind('spacingConfig.borderRadius.md');
  font-size: v-bind('typographyConfig.fontSize.xs');
  font-weight: v-bind('typographyConfig.fontWeight.medium');
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

.comparison-value__more-btn:focus-visible {
  outline: v-bind(
      'spacingConfig.outline.width + " " + spacingConfig.outline.style'
    )
    v-bind('themeConfig.comparisonValue.focusRingColor || "#3b82f6"');
  outline-offset: v-bind('spacingConfig.outline.offset');
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
    outline-offset: v-bind('spacingConfig.outline.offset');
  }
}
</style>
