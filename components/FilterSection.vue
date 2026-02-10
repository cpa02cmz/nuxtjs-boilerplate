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
        class="filter-option flex items-center cursor-pointer rounded-md transition-all duration-200 ease-out hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-blue-50"
        :class="{
          'justify-between': showCount,
          'bg-gray-50': selectedOptions.includes(option),
          'active:bg-gray-100': true,
        }"
        @click="toggleOption(option)"
      >
        <div class="flex items-center flex-1 py-2 px-2">
          <div class="relative flex items-center">
            <input
              :id="`${id}-${option}`"
              type="checkbox"
              :value="option"
              :checked="selectedOptions.includes(option)"
              :aria-label="ariaLabelOption(option)"
              class="filter-checkbox h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500 focus:ring-offset-0 transition-all duration-200"
              :class="{
                'animate-checkbox-pop': recentlySelected === option,
              }"
              @change="toggleOption(option)"
              @click.stop
            >
          </div>
          <label
            :for="`${id}-${option}`"
            class="ml-2 text-sm text-gray-800 cursor-pointer select-none flex-1 transition-colors duration-200"
            :class="{
              'text-gray-900 font-medium': selectedOptions.includes(option),
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
          }"
          aria-label="result count"
        >
          {{ getCountForOption(option) }}
        </span>
      </div>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  label: string
  ariaLabel?: string
  options: string[]
  selectedOptions: string[]
  id: string
  showCount?: boolean
  scrollable?: boolean
  getCountForOption?: (option: string) => number
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
const animationTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

const scrollableClass = computed(() =>
  props.scrollable ? 'max-h-40 overflow-y-auto' : ''
)

const toggleOption = (option: string) => {
  // Trigger animation if selecting (not deselecting)
  if (!props.selectedOptions.includes(option)) {
    recentlySelected.value = option

    // Clear existing timeout
    if (animationTimeout.value) {
      clearTimeout(animationTimeout.value)
    }

    // Reset animation after it completes
    animationTimeout.value = setTimeout(() => {
      recentlySelected.value = null
    }, 300)
  }

  emit('toggle', option)
}

const ariaLabelOption = (option: string): string => {
  const count = props.getCountForOption?.(option) ?? 0
  return props.showCount
    ? `Filter by ${option} (${count} results)`
    : `Filter by ${option}`
}

// Bulk selection actions
const selectAll = () => {
  // Emit toggle for each unselected option
  props.options.forEach(option => {
    if (!props.selectedOptions.includes(option)) {
      emit('toggle', option)
    }
  })
}

const clearAll = () => {
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
</script>

<style scoped>
/* Checkbox pop animation when selected */
.animate-checkbox-pop {
  animation: checkbox-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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

/* Enhanced focus styles for keyboard navigation */
.filter-checkbox:focus-visible {
  outline: 2px solid #6b7280;
  outline-offset: 2px;
}

/* Smooth scrollbar styling for the scrollable container */
.max-h-40 {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

.max-h-40::-webkit-scrollbar {
  width: 4px;
}

.max-h-40::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-40::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 2px;
}

.max-h-40::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
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

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-checkbox-pop,
  .text-blue-600.font-medium {
    animation: none;
  }

  .filter-option,
  .filter-checkbox,
  .filter-option label,
  .filter-option span {
    transition: none !important;
  }
}
</style>
