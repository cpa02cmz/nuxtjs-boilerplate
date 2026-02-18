<template>
  <div class="flex flex-col sm:flex-row sm:items-center gap-4">
    <!-- Results Counter with Animation -->
    <div class="text-sm">
      <span
        ref="countRef"
        :class="[
          'font-bold text-lg tabular-nums transition-colors',
          tailwindClassesConfig.duration.medium,
          countChangeClass,
        ]"
        :aria-label="`${displayCount} ${contentConfig.sort.resultsFound}`"
      >
        {{ displayCount }}
      </span>
      <span class="text-gray-800"> {{ contentConfig.sort.resultsFound }}</span>
      <Transition
        :enter-active-class="`transition-all ${tailwindClassesConfig.duration.medium} ease-out`"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        :leave-active-class="`transition-all ${tailwindClassesConfig.duration.normal} ease-in`"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <span
          v-if="showChangeIndicator"
          class="ml-2 text-xs font-medium px-2 py-0.5 rounded-full"
          :class="changeIndicatorClass"
          role="status"
          aria-live="polite"
        >
          {{ changeIndicatorText }}
        </span>
      </Transition>
    </div>

    <!-- Custom Animated Dropdown -->
    <div class="flex items-center space-x-2">
      <label :for="selectId" class="text-sm text-gray-800">{{
        contentConfig.sort.label
      }}</label>

      <div ref="dropdownRef" class="relative">
        <!-- Trigger Button -->
        <button
          :id="selectId"
          type="button"
          :class="[
            'relative flex items-center justify-between w-44 pl-3 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
            tailwindClassesConfig.duration.normal,
            {
              'border-blue-500 ring-2 ring-blue-500': isOpen,
              'hover:border-gray-400 hover:shadow-md': !isOpen,
            },
          ]"
          :aria-expanded="isOpen"
          :aria-haspopup="'listbox'"
          :aria-controls="listboxId"
          @click="toggleDropdown($event)"
          @keydown="handleTriggerKeydown"
        >
          <span class="flex items-center gap-2">
            <span
              :class="[
                'text-gray-600 transition-transform',
                tailwindClassesConfig.duration.normal,
                { 'scale-110': isOpen },
              ]"
            >
              {{ currentOption?.icon }}
            </span>
            <span class="text-gray-900 font-medium">{{
              currentOption?.label
            }}</span>
          </span>
          <svg
            :class="[
              'w-4 h-4 text-gray-500 transition-transform ease-spring',
              tailwindClassesConfig.duration.medium,
              { 'rotate-180': isOpen },
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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

        <!-- Palette's micro-UX enhancement: Keyboard shortcut discovery tooltip 🎨
             Shows helpful keyboard shortcuts when dropdown is opened with mouse -->
        <Transition
          :enter-active-class="`transition-all ${tailwindClassesConfig.duration.normal} ease-out`"
          enter-from-class="opacity-0 scale-95 -translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          :leave-active-class="`transition-all ${tailwindClassesConfig.duration.fast} ease-in`"
          leave-from-class="opacity-100 scale-y-100 translate-y-0"
          leave-to-class="opacity-0 scale-y-95 -translate-y-2"
        >
          <div
            v-if="isOpen"
            :id="listboxId"
            class="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden focus:outline-none"
            role="listbox"
            :aria-label="contentConfig.sort.label"
            tabindex="-1"
          >
            <!-- Keyboard shortcut hint - appears briefly when opened with mouse -->
            <Transition
              :enter-active-class="`transition-all ${tailwindClassesConfig.duration.normal} ease-out`"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              :leave-active-class="`transition-all ${tailwindClassesConfig.duration.fast} ease-in`"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-1"
            >
              <div
                v-if="showKeyboardHint && !prefersReducedMotion"
                class="keyboard-shortcut-hint"
                role="status"
                aria-live="polite"
              >
                <div class="keyboard-shortcut-hint__content">
                  <svg
                    class="keyboard-shortcut-hint__icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span class="keyboard-shortcut-hint__text">
                    {{ contentConfig.sort.keyboardHint.text }}
                  </span>
                  <div class="keyboard-shortcut-hint__shortcuts">
                    <kbd class="keyboard-shortcut-hint__key">↑</kbd>
                    <kbd class="keyboard-shortcut-hint__key">↓</kbd>
                    <span class="keyboard-shortcut-hint__separator">{{
                      contentConfig.sort.keyboardHint.navigate
                    }}</span>
                    <kbd class="keyboard-shortcut-hint__key">Enter</kbd>
                    <span class="keyboard-shortcut-hint__separator">{{
                      contentConfig.sort.keyboardHint.select
                    }}</span>
                    <kbd class="keyboard-shortcut-hint__key">Esc</kbd>
                    <span class="keyboard-shortcut-hint__separator">{{
                      contentConfig.sort.keyboardHint.close
                    }}</span>
                  </div>
                </div>
              </div>
            </Transition>
            <ul class="py-1 max-h-60 overflow-auto">
              <li
                v-for="(option, index) in sortOptions"
                :id="`${optionIdPrefix}-${index}`"
                :key="option.value"
                role="option"
                :aria-selected="selectedSortOption === option.value"
                :class="[
                  'relative flex items-center justify-between px-3 py-2.5 cursor-pointer transition-all',
                  tailwindClassesConfig.duration.fast,
                  {
                    'bg-blue-50 text-blue-900':
                      selectedSortOption === option.value,
                    'hover:bg-gray-50': selectedSortOption !== option.value,
                    'bg-gray-100':
                      highlightedIndex === index &&
                      selectedSortOption !== option.value,
                  },
                ]"
                @click="selectOption(option.value as SortOption)"
                @mouseenter="highlightedIndex = index"
                @keydown.enter.prevent="
                  selectOption(option.value as SortOption)
                "
              >
                <div class="flex items-center gap-2.5">
                  <span
                    :class="[
                      'text-lg transition-transform',
                      tailwindClassesConfig.duration.normal,
                      {
                        'scale-110': highlightedIndex === index,
                        'text-blue-600': selectedSortOption === option.value,
                        'text-gray-500': selectedSortOption !== option.value,
                      },
                    ]"
                  >
                    {{ option.icon }}
                  </span>
                  <span
                    :class="[
                      'font-medium transition-colors',
                      tailwindClassesConfig.duration.fast,
                      {
                        'text-blue-900': selectedSortOption === option.value,
                        'text-gray-700': selectedSortOption !== option.value,
                      },
                    ]"
                  >
                    {{ option.label }}
                  </span>
                </div>

                <!-- Animated Checkmark for Selected Option -->
                <Transition
                  :enter-active-class="`transition-all ${tailwindClassesConfig.duration.normal} ease-out`"
                  enter-from-class="opacity-0 scale-0"
                  enter-to-class="opacity-100 scale-100"
                  :leave-active-class="`transition-all ${tailwindClassesConfig.duration.fast} ease-in`"
                  leave-from-class="opacity-100 scale-100"
                  leave-to-class="opacity-0 scale-0"
                >
                  <svg
                    v-if="selectedSortOption === option.value"
                    class="w-5 h-5 text-blue-600 flex-shrink-0"
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
                      class="checkmark-path"
                    />
                  </svg>
                </Transition>
              </li>
            </ul>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Screen reader announcement for sort order changes -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ sortAnnouncement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import { thresholdsConfig } from '~/configs/thresholds.config'
import { contentConfig } from '~/configs/content.config'
import { EASING, easingConfig } from '~/configs/easing.config'
import { animationConfig } from '~/configs/animation.config'
import { tailwindClassesConfig } from '~/configs/tailwind-classes.config'
import { limitsConfig } from '~/configs/limits.config'
import { hapticLight } from '~/utils/hapticFeedback'
import { themeConfig } from '~/configs/theme.config'
import type { SortOption } from '~/types/resource'

interface Props {
  selectedSortOption?: SortOption
  totalResources?: number
}

const props = withDefaults(defineProps<Props>(), {
  selectedSortOption: 'popularity-desc',
  totalResources: 0,
})

const emit = defineEmits<{
  (e: 'update-sort-option', option: SortOption): void
}>()

// Sort options from config - Flexy hates hardcoded arrays!
const sortOptions = contentConfig.sort.sortOptions

// Generate unique IDs for accessibility
// Flexy hates hardcoded 9! Using limitsConfig.displayLength.uniqueIdLength
const uniqueId = Math.random()
  .toString(36)
  .substr(2, limitsConfig.displayLength.uniqueIdLength)
const selectId = `sort-select-${uniqueId}`
const listboxId = `sort-listbox-${uniqueId}`
const optionIdPrefix = `sort-option-${uniqueId}`

// Dropdown state
const isOpen = ref(false)
const highlightedIndex = ref(-1)
const dropdownRef = ref<HTMLElement | null>(null)

// Palette's micro-UX enhancement: Keyboard shortcut discovery state
const showKeyboardHint = ref(false)
const openedWithKeyboard = ref(false)
let keyboardHintTimeout: ReturnType<typeof setTimeout> | null = null

// Check for reduced motion preference
const prefersReducedMotion = ref(false)
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Current selected option
const currentOption = computed(
  () =>
    sortOptions.find(opt => opt.value === props.selectedSortOption) ||
    sortOptions[0]
)

// Animated counter state
const displayCount = ref(props.totalResources)
const previousCount = ref(props.totalResources)
const countChangeClass = ref('text-gray-800')
const showChangeIndicator = ref(false)
const changeIndicatorTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

// Compute the change from previous count
const countChange = computed(() => props.totalResources - previousCount.value)

// Compute change indicator text
const changeIndicatorText = computed(() => {
  const change = countChange.value
  if (change > 0) return `+${change}`
  if (change < 0) return `${change}`
  return ''
})

// Compute screen reader announcement for sort order
const sortAnnouncement = computed(() => {
  const sortLabels: Record<string, string> = {
    'popularity-desc': 'sorted by most popular',
    'alphabetical-asc': 'sorted alphabetically A to Z',
    'alphabetical-desc': 'sorted alphabetically Z to A',
    'date-added-desc': 'sorted by newest first',
  }
  const sortLabel = sortLabels[props.selectedSortOption ?? 'popularity-desc']
  return `Showing ${props.totalResources} resources, ${sortLabel}`
})

// Compute change indicator styling based on magnitude
const changeIndicatorClass = computed(() => {
  const change = countChange.value
  const absChange = Math.abs(change)
  const { highThreshold, mediumThreshold } = thresholdsConfig.changeIndicator

  if (change > 0) {
    // Positive change - green shades based on magnitude
    if (absChange >= highThreshold)
      return 'bg-green-100 text-green-700 ring-1 ring-green-200'
    if (absChange >= mediumThreshold) return 'bg-green-50 text-green-600'
    return 'text-green-600'
  }

  if (change < 0) {
    // Negative change - orange/amber shades based on magnitude
    if (absChange >= highThreshold)
      return 'bg-orange-100 text-orange-700 ring-1 ring-orange-200'
    if (absChange >= mediumThreshold) return 'bg-orange-50 text-orange-600'
    return 'text-orange-600'
  }

  return ''
})

// Dropdown methods
const toggleDropdown = (event?: MouseEvent | KeyboardEvent) => {
  isOpen.value = !isOpen.value

  if (isOpen.value) {
    // Highlight current selection when opening
    highlightedIndex.value = sortOptions.findIndex(
      opt => opt.value === props.selectedSortOption
    )

    // Palette's micro-UX enhancement: Detect if opened with keyboard or mouse
    // Show keyboard shortcut hint only when opened with mouse
    openedWithKeyboard.value = event instanceof KeyboardEvent
    if (!openedWithKeyboard.value && !prefersReducedMotion.value) {
      showKeyboardHint.value = true

      // Clear any existing timeout
      if (keyboardHintTimeout) {
        clearTimeout(keyboardHintTimeout)
      }

      // Auto-hide hint after delay
      keyboardHintTimeout = setTimeout(() => {
        showKeyboardHint.value = false
      }, animationConfig.sortDropdown.keyboardHintDisplayDurationMs)
    }
  } else {
    // Clear hint when closing
    showKeyboardHint.value = false
    if (keyboardHintTimeout) {
      clearTimeout(keyboardHintTimeout)
      keyboardHintTimeout = null
    }
  }
}

const selectOption = (value: SortOption) => {
  emit('update-sort-option', value)
  isOpen.value = false
  highlightedIndex.value = -1

  // Palette's micro-UX delight: Haptic feedback for tactile confirmation
  // Provides subtle vibration on supported mobile devices
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.vibrate === 'function'
  ) {
    hapticLight()
  }
}

const closeDropdown = () => {
  isOpen.value = false
  highlightedIndex.value = -1
}

// Keyboard navigation
const handleTriggerKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
    case 'Down':
      event.preventDefault()
      if (!isOpen.value) {
        isOpen.value = true
        highlightedIndex.value = 0
      } else {
        highlightedIndex.value =
          (highlightedIndex.value + 1) % sortOptions.length
      }
      break
    case 'ArrowUp':
    case 'Up':
      event.preventDefault()
      if (isOpen.value) {
        highlightedIndex.value =
          highlightedIndex.value <= 0
            ? sortOptions.length - 1
            : highlightedIndex.value - 1
      }
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (isOpen.value && highlightedIndex.value >= 0) {
        selectOption(sortOptions[highlightedIndex.value].value as SortOption)
      } else {
        toggleDropdown()
      }
      break
    case 'Escape':
      event.preventDefault()
      closeDropdown()
      break
    case 'Home':
      if (isOpen.value) {
        event.preventDefault()
        highlightedIndex.value = 0
      }
      break
    case 'End':
      if (isOpen.value) {
        event.preventDefault()
        highlightedIndex.value = sortOptions.length - 1
      }
      break
  }
}

// Close on outside click
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

// Store mediaQuery reference for cleanup
let mediaQueryRef: MediaQueryList | null = null

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // Check reduced motion preference
  prefersReducedMotion.value = checkReducedMotion()
  // Listen for changes
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function'
  ) {
    mediaQueryRef = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQueryRef.addEventListener('change', e => {
      prefersReducedMotion.value = e.matches
    })
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  // Cleanup mediaQuery listener
  if (mediaQueryRef) {
    mediaQueryRef.removeEventListener('change', () => {})
    mediaQueryRef = null
  }
  // Cleanup keyboard hint timeout
  if (keyboardHintTimeout) {
    clearTimeout(keyboardHintTimeout)
  }
})

// Animation frame reference for cleanup
const animationFrame = ref<number | null>(null)

// Smooth count animation function
const animateCount = (
  from: number,
  to: number,
  duration: number = thresholdsConfig.countAnimation.defaultDurationMs
) => {
  const startTime = performance.now()
  const diff = to - from

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function: easeOutQuart for smooth deceleration - Flexy hates hardcoded 4!
    const easeOutQuart =
      1 - Math.pow(1 - progress, easingConfig.powers.easeOutQuart)

    displayCount.value = Math.round(from + diff * easeOutQuart)

    if (progress < 1) {
      animationFrame.value = requestAnimationFrame(step)
    }
  }

  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
  }

  animationFrame.value = requestAnimationFrame(step)
}

// Watch for count changes
watch(
  () => props.totalResources,
  (newCount, oldCount) => {
    if (newCount === oldCount) return

    // Update previous count reference
    const oldValue = previousCount.value
    previousCount.value = newCount

    // Animate the count change
    animateCount(displayCount.value, newCount)

    // Apply color change based on direction
    const change = newCount - oldValue

    if (change > 0) {
      countChangeClass.value = 'text-green-600'
    } else if (change < 0) {
      countChangeClass.value = 'text-orange-600'
    }

    // Reset color after animation
    setTimeout(() => {
      countChangeClass.value = 'text-gray-800'
    }, thresholdsConfig.countAnimation.colorResetDelayMs)

    // Show change indicator for significant changes
    if (Math.abs(change) >= thresholdsConfig.changeIndicator.minChange) {
      showChangeIndicator.value = true

      // Clear existing timeout
      if (changeIndicatorTimeout.value) {
        clearTimeout(changeIndicatorTimeout.value)
      }

      // Hide after delay
      changeIndicatorTimeout.value = setTimeout(() => {
        showChangeIndicator.value = false
      }, thresholdsConfig.changeIndicator.displayDurationMs)
    }
  },
  { immediate: false }
)

// Cleanup on unmount
onUnmounted(() => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
  }
  if (changeIndicatorTimeout.value) {
    clearTimeout(changeIndicatorTimeout.value)
  }
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Spring physics for chevron rotation */
.ease-spring {
  transition-timing-function: v-bind('EASING.SPRING_SNAPPY');
}

/* Checkmark animation - Flexy hates hardcoded values! */
.checkmark-path {
  stroke-dasharray: v-bind(
    'animationConfig.svgStroke.smallCheckmark.dashArray'
  );
  stroke-dashoffset: v-bind(
    'animationConfig.svgStroke.smallCheckmark.dashOffset'
  );
  animation: drawCheck v-bind('animationConfig.svgStroke.drawDurationSec')
    v-bind('animationConfig.svgStroke.drawEasing') forwards;
}

@keyframes drawCheck {
  to {
    stroke-dashoffset: 0;
  }
}

/* Palette's micro-UX enhancement: Keyboard shortcut hint styles 🎨 */
.keyboard-shortcut-hint {
  background: linear-gradient(
    135deg,
    v-bind('themeConfig.keyboardHint.gradientStart') 0%,
    v-bind('themeConfig.keyboardHint.gradientEnd') 100%
  );
  border-bottom: 1px solid v-bind('themeConfig.keyboardHint.borderColor');
  padding: v-bind('animationConfig.sortDropdown.keyboardHintPaddingYPx + "px"')
    v-bind('animationConfig.sortDropdown.keyboardHintPaddingXPx + "px"');
}

.keyboard-shortcut-hint__content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: v-bind(
    'animationConfig.sortDropdown.keyboardHintFontSizePx + "px"'
  );
  color: v-bind('themeConfig.keyboardHint.textColor');
}

.keyboard-shortcut-hint__icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  animation: hint-icon-pulse
    v-bind('animationConfig.sortDropdown.keyboardHintPulseDurationSec + "s"')
    ease-in-out infinite;
}

@keyframes hint-icon-pulse {
  0%,
  100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.keyboard-shortcut-hint__text {
  font-weight: 500;
  white-space: nowrap;
}

.keyboard-shortcut-hint__shortcuts {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.keyboard-shortcut-hint__key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  background: v-bind('themeConfig.keyboardHint.keyBg');
  border: 1px solid v-bind('themeConfig.keyboardHint.keyBorder');
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  font-weight: 600;
  color: v-bind('themeConfig.keyboardHint.keyText');
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.keyboard-shortcut-hint__separator {
  color: v-bind('themeConfig.keyboardHint.separatorColor');
  font-size: 11px;
  margin: 0 2px;
}

/* Reduced motion support for keyboard hint */
@media (prefers-reduced-motion: reduce) {
  .keyboard-shortcut-hint__icon {
    animation: none;
    opacity: 1;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .ease-spring {
    transition-timing-function: ease-out;
    transition-duration: v-bind(
      'animationConfig.cssTransitions.reducedMotionSec'
    );
  }

  .checkmark-path {
    animation: none;
    stroke-dashoffset: 0;
  }
}
</style>
