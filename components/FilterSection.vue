<template>
  <fieldset
    class="mb-6"
    @keydown="handleKeydown"
  >
    <div class="flex items-center justify-between mb-3">
      <legend class="text-sm font-medium text-gray-900">
        {{ label }}
      </legend>
      <div
        v-if="options.length > 1"
        class="flex items-center gap-2"
      >
        <span
          class="text-xs text-gray-500 transition-all duration-200"
          :class="{ 'text-blue-600 font-medium': selectedOptions.length > 0 }"
          aria-live="polite"
        >
          {{ selectedOptions.length }} of {{ options.length }}
        </span>
        <div class="h-4 w-px bg-gray-300" />
        <button
          v-if="selectedOptions.length === 0"
          type="button"
          class="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded px-1"
          :aria-label="`Select all ${options.length} ${label} filters`"
          @click="selectAll"
        >
          Select All
        </button>
        <button
          v-else
          type="button"
          class="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-1 rounded px-1"
          :aria-label="`Clear all ${selectedOptions.length} selected ${label} filters`"
          @click="clearAll"
        >
          Clear
        </button>
      </div>
    </div>
    <div
      role="group"
      :aria-label="ariaLabel"
      class="space-y-1"
      :class="scrollableClass"
    >
      <div
        v-for="option in options"
        :key="option"
        class="filter-option flex items-center rounded-md transition-all duration-200 ease-out"
        :class="{
          'justify-between': showCount,
          'bg-gray-50': selectedOptions.includes(option),
          'active:bg-gray-100': !isOptionDisabled(option),
          'cursor-pointer hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-blue-50':
            !isOptionDisabled(option),
          'cursor-not-allowed opacity-50': isOptionDisabled(option),
          'checkbox-selected':
            recentlySelected === option && !prefersReducedMotion,
          'checkbox-deselected':
            recentlyDeselected === option && !prefersReducedMotion,
        }"
        :style="getCheckboxBloomStyle(option)"
        @click="!isOptionDisabled(option) && toggleOption(option)"
      >
        <div class="flex items-center flex-1 py-2 px-2">
          <div class="relative flex items-center">
            <div class="checkbox-wrapper relative">
              <!-- Bloom effect ring - Palette's micro-UX delight! -->
              <span
                v-if="
                  !prefersReducedMotion &&
                    (recentlySelected === option || recentlyDeselected === option)
                "
                class="checkbox-bloom absolute inset-0 rounded pointer-events-none"
                :class="{
                  'checkbox-bloom--active': recentlySelected === option,
                  'checkbox-bloom--out': recentlyDeselected === option,
                }"
                aria-hidden="true"
              />
              <input
                :id="`${id}-${option}`"
                type="checkbox"
                :value="option"
                :checked="selectedOptions.includes(option)"
                :disabled="isOptionDisabled(option)"
                :aria-label="ariaLabelOption(option)"
                class="filter-checkbox h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500 focus:ring-offset-0 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 relative z-10"
                :class="{
                  'animate-checkbox-pop':
                    recentlySelected === option && !prefersReducedMotion,
                  'animate-checkbox-pop-out':
                    recentlyDeselected === option && !prefersReducedMotion,
                  'animate-check-draw':
                    selectedOptions.includes(option) &&
                    recentlySelected === option &&
                    !prefersReducedMotion,
                }"
                @change="toggleOption(option)"
                @click.stop
              >
            </div>
            <label
              :for="`${id}-${option}`"
              class="ml-2 text-sm text-gray-800 select-none flex-1 transition-colors duration-200"
              :class="{
                'text-gray-900 font-medium': selectedOptions.includes(option),
                'cursor-pointer': !isOptionDisabled(option),
                'cursor-not-allowed text-gray-400': isOptionDisabled(option),
              }"
            >
              {{ option }}
            </label>
          </div>
          <span
            v-if="showCount && getCountForOption"
            class="mr-2 text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 transition-all duration-200"
            :class="{
              'bg-gray-200 text-gray-800': selectedOptions.includes(option),
              'bg-gray-50 text-gray-400': isOptionDisabled(option),
            }"
            aria-label="result count"
          >
            {{ getCountForOption(option) }}
          </span>
        </div>
      </div>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted, onMounted } from 'vue'
import { hapticLight } from '~/utils/hapticFeedback'
import { animationConfig } from '~/configs/animation.config'
import { EASING } from '~/configs/easing.config'
import { componentColorsConfig } from '~/configs/component-colors.config'

interface Props {
  label: string
  ariaLabel?: string
  options: readonly string[]
  selectedOptions: readonly string[]
  id: string
  showCount?: boolean
  scrollable?: boolean
  getCountForOption?: (option: string) => number
}

// Check for reduced motion preference
const prefersReducedMotion = ref(false)
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

interface Emits {
  (event: 'toggle', option: string): void
}

const props = withDefaults(defineProps<Props>(), {
  ariaLabel: '',
  showCount: true,
  scrollable: true,
  getCountForOption: undefined,
})

const emit = defineEmits<Emits>()

// Track recently selected option for animation
const recentlySelected = ref<string | null>(null)
const recentlyDeselected = ref<string | null>(null)
const animationTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

const scrollableClass = computed(() =>
  props.scrollable ? 'max-h-40 overflow-y-auto' : ''
)

// Get checkbox bloom animation style - Palette's micro-UX enhancement!
const getCheckboxBloomStyle = (option: string) => {
  if (prefersReducedMotion.value) return {}

  const isRecentlySelected = recentlySelected.value === option
  const isRecentlyDeselected = recentlyDeselected.value === option

  if (!isRecentlySelected && !isRecentlyDeselected) return {}

  const config = animationConfig.checkbox

  return {
    '--bloom-scale': String(config.bloomScale),
    '--bloom-opacity': String(config.bloomOpacity),
    '--bloom-duration': `${config.bloomDurationMs}ms`,
    '--pop-scale': String(config.popScale),
    '--pop-duration': `${config.popDurationMs}ms`,
  } as Record<string, string>
}

// Check if an option should be disabled (zero count)
const isOptionDisabled = (option: string): boolean => {
  if (!props.showCount || !props.getCountForOption) return false
  return props.getCountForOption(option) === 0
}

const toggleOption = (option: string) => {
  // Don't allow toggling if option is disabled
  if (isOptionDisabled(option)) return

  // Provide haptic feedback for mobile users
  hapticLight()

  // Determine if selecting or deselecting
  const isSelecting = !props.selectedOptions.includes(option)

  // Trigger animation based on action
  if (isSelecting) {
    recentlySelected.value = option
    recentlyDeselected.value = null
  } else {
    recentlyDeselected.value = option
    recentlySelected.value = null
  }

  // Clear existing timeout
  if (animationTimeout.value) {
    clearTimeout(animationTimeout.value)
  }

  // Reset animation after it completes
  // Flexy hates hardcoded values! Using configurable duration from animationConfig
  animationTimeout.value = setTimeout(() => {
    recentlySelected.value = null
    recentlyDeselected.value = null
  }, animationConfig.checkbox.bloomDurationMs)

  emit('toggle', option)
}

const ariaLabelOption = (option: string): string => {
  const count = props.getCountForOption?.(option) ?? 0
  const disabledText = count === 0 ? ' - disabled, no results' : ''
  return props.showCount
    ? `Filter by ${option} (${count} results)${disabledText}`
    : `Filter by ${option}${disabledText}`
}

// Bulk selection actions
const selectAll = () => {
  // Provide haptic feedback for bulk action
  hapticLight()

  // Emit toggle for each unselected option that is not disabled
  props.options.forEach(option => {
    if (!props.selectedOptions.includes(option) && !isOptionDisabled(option)) {
      emit('toggle', option)
    }
  })
}

const clearAll = () => {
  // Provide haptic feedback for bulk action
  hapticLight()

  // Emit toggle for each selected option to deselect
  props.selectedOptions.forEach(option => {
    emit('toggle', option)
  })
}

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl/Cmd + A to select all when no text input is focused
  if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
    const activeElement = document.activeElement
    const isTextInput =
      activeElement?.tagName === 'INPUT' &&
      (activeElement as HTMLInputElement).type === 'text'

    if (!isTextInput && props.selectedOptions.length < props.options.length) {
      event.preventDefault()
      selectAll()
    }
  }

  // Escape to clear all when filter section is focused
  if (event.key === 'Escape' && props.selectedOptions.length > 0) {
    const isFilterSectionFocused = (event.target as HTMLElement)?.closest(
      'fieldset'
    )
    if (isFilterSectionFocused) {
      event.preventDefault()
      clearAll()
    }
  }
}

// Setup and cleanup
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleChange)

    // Cleanup
    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handleChange)
    })
  }
})

// Cleanup timeout on unmount to prevent memory leaks
onUnmounted(() => {
  if (animationTimeout.value) {
    clearTimeout(animationTimeout.value)
  }
})
</script>

<style scoped>
/* Checkbox pop animation when selected */
.animate-checkbox-pop {
  animation: checkbox-pop
    v-bind('animationConfig.checkbox.checkDrawDurationSec')
    v-bind('EASING.SPRING_STANDARD');
}

@keyframes checkbox-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Checkbox pop-out animation when deselected */
.animate-checkbox-pop-out {
  animation: checkbox-pop-out
    v-bind('animationConfig.checkbox.checkDrawDurationSec')
    v-bind('EASING.SPRING_STANDARD');
}

@keyframes checkbox-pop-out {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.85);
  }
  100% {
    transform: scale(1);
  }
}

/* Enhanced focus styles for keyboard navigation - Flexy hates hardcoded colors! */
.filter-checkbox:focus-visible {
  outline: 2px solid v-bind('componentColorsConfig.filterSection.focusOutline');
  outline-offset: 2px;
}

/* Smooth scrollbar styling for the scrollable container - Flexy hates hardcoded colors! */
.max-h-40 {
  scrollbar-width: thin;
  scrollbar-color: v-bind('componentColorsConfig.filterSection.scrollbar.thumb')
    v-bind('componentColorsConfig.filterSection.scrollbar.track');
}

.max-h-40::-webkit-scrollbar {
  width: 4px;
}

.max-h-40::-webkit-scrollbar-track {
  background: v-bind('componentColorsConfig.filterSection.scrollbar.track');
}

.max-h-40::-webkit-scrollbar-thumb {
  background-color: v-bind(
    'componentColorsConfig.filterSection.scrollbar.thumb'
  );
  border-radius: 2px;
}

.max-h-40::-webkit-scrollbar-thumb:hover {
  background-color: v-bind(
    'componentColorsConfig.filterSection.scrollbar.thumbHover'
  );
}

/* Quick action buttons hover state */
button:hover {
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* Selection count pulse animation */
@keyframes count-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.text-blue-600.font-medium {
  animation: count-pulse 0.3s ease-out;
}

/* Checkbox bloom effect - Palette's micro-UX enhancement! */
.checkbox-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-bloom {
  background: radial-gradient(
    circle,
    rgba(59, 130, 246, var(--bloom-opacity)) 0%,
    rgba(59, 130, 246, 0) 70%
  );
  transform: scale(1);
  opacity: 0;
  pointer-events: none;
}

.checkbox-bloom--active {
  animation: checkbox-bloom var(--bloom-duration) ease-out forwards;
}

.checkbox-bloom--out {
  animation: checkbox-bloom-out var(--bloom-duration) ease-out forwards;
}

@keyframes checkbox-bloom {
  0% {
    transform: scale(1);
    opacity: var(--bloom-opacity, 0.3);
  }
  100% {
    transform: scale(var(--bloom-scale, 1.8));
    opacity: 0;
  }
}

@keyframes checkbox-bloom-out {
  0% {
    transform: scale(var(--bloom-scale, 1.8));
    opacity: var(--bloom-opacity, 0.3);
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

/* Enhanced checkbox pop animation */
.animate-checkbox-pop {
  animation: checkbox-pop-enhanced var(--pop-duration)
    v-bind('EASING.SPRING_STANDARD');
}

.animate-checkbox-pop-out {
  animation: checkbox-pop-out-enhanced var(--pop-duration)
    v-bind('EASING.SPRING_STANDARD');
}

@keyframes checkbox-pop-enhanced {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(var(--pop-scale, 1.25));
  }
  100% {
    transform: scale(1);
  }
}

@keyframes checkbox-pop-out-enhanced {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(0.85);
  }
  100% {
    transform: scale(1);
  }
}

/* Check draw animation for the checkmark */
.animate-check-draw {
  animation: check-bounce
    v-bind('animationConfig.checkbox.checkDrawDurationSec') ease-out;
}

@keyframes check-bounce {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.1);
  }
  60% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

/* Checkbox selected state background highlight */
.checkbox-selected {
  animation: checkbox-highlight
    v-bind('`${animationConfig.checkbox.highlightDurationMs}ms`') ease-out;
}

@keyframes checkbox-highlight {
  0% {
    background-color: rgba(59, 130, 246, 0.2);
  }
  100% {
    background-color: rgb(249, 250, 251);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-checkbox-pop,
  .animate-checkbox-pop-out,
  .text-blue-600.font-medium,
  .animate-check-draw,
  .checkbox-bloom,
  .checkbox-selected {
    animation: none !important;
  }

  .filter-option,
  .filter-checkbox,
  .filter-option label,
  .filter-option span {
    transition: none !important;
  }

  .checkbox-bloom {
    display: none;
  }
}
</style>
