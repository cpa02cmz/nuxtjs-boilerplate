<template>
  <fieldset class="mb-6">
    <legend class="text-sm font-medium text-gray-900 mb-3">
      {{ label }}
    </legend>
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

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-checkbox-pop {
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
