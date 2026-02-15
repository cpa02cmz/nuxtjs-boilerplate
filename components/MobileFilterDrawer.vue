<template>
  <div class="lg:hidden">
    <!-- Mobile Filter Button with Active Count Badge -->
    <button
      ref="filterButtonRef"
      type="button"
      class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
      :aria-label="`Open filters panel. ${activeFiltersCount} filters currently active`"
      :aria-expanded="isOpen"
      aria-controls="mobile-filter-drawer"
      @click="openDrawer"
    >
      <svg
        class="w-5 h-5 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        />
      </svg>
      <span>Filters</span>
      <span
        v-if="activeFiltersCount > 0"
        class="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold bg-gray-800 text-white rounded-full min-w-[1.25rem]"
        aria-hidden="true"
      >
        {{ activeFiltersCount }}
      </span>
    </button>

    <!-- Mobile Filter Drawer Overlay -->
    <Transition
      enter-active-class="transition-opacity ease-linear duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity ease-linear duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        aria-hidden="true"
        @click="closeDrawer"
      />
    </Transition>

    <!-- Mobile Filter Drawer Panel -->
    <Transition
      enter-active-class="transform transition ease-in-out duration-300"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transform transition ease-in-out duration-200"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="isOpen"
        id="mobile-filter-drawer"
        ref="drawerRef"
        class="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl z-50 lg:hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-filter-title"
        tabindex="-1"
      >
        <!-- Drawer Header -->
        <div
          class="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-white"
        >
          <h2
            id="mobile-filter-title"
            class="text-lg font-semibold text-gray-900"
          >
            Filters
            <span
              v-if="activeFiltersCount > 0"
              class="ml-2 text-sm font-normal text-gray-500"
            >
              ({{ activeFiltersCount }} active)
            </span>
          </h2>
          <button
            ref="closeButtonRef"
            type="button"
            class="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label="Close filters panel"
            @click="closeDrawer"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Drawer Content - Scrollable -->
        <div class="flex-1 overflow-y-auto px-4 py-4">
          <ResourceFilters
            :categories="categories"
            :pricing-models="pricingModels"
            :difficulty-levels="difficultyLevels"
            :technologies="technologies"
            :tags="tags"
            :benefits="benefits"
            :selected-categories="selectedCategories"
            :selected-pricing-models="selectedPricingModels"
            :selected-difficulty-levels="selectedDifficultyLevels"
            :selected-technologies="selectedTechnologies"
            :selected-tags="selectedTags"
            :selected-benefits="selectedBenefits"
            :selected-date-range="selectedDateRange"
            :facet-counts="facetCounts"
            :saved-searches="savedSearches"
            @toggle-category="$emit('toggle-category', $event)"
            @toggle-pricing-model="$emit('toggle-pricing-model', $event)"
            @toggle-difficulty-level="$emit('toggle-difficulty-level', $event)"
            @toggle-technology="$emit('toggle-technology', $event)"
            @toggle-tag="$emit('toggle-tag', $event)"
            @toggle-benefit="$emit('toggle-benefit', $event)"
            @date-range-change="$emit('date-range-change', $event)"
            @reset-filters="handleResetFilters"
            @use-saved-search="$emit('use-saved-search', $event)"
            @remove-saved-search="$emit('remove-saved-search', $event)"
            @undo-delete="$emit('undo-delete', $event)"
          />
        </div>

        <!-- Drawer Footer - Sticky Apply/Results Button -->
        <div class="border-t border-gray-200 px-4 py-4 bg-gray-50">
          <button
            type="button"
            class="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            @click="closeDrawer"
          >
            Show {{ resultsCount }} result{{ resultsCount === 1 ? '' : 's' }}
          </button>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import ResourceFilters from '~/components/ResourceFilters.vue'
import { hapticConfig } from '~/configs/haptic.config'
import { hapticLight } from '~/utils/hapticFeedback'

interface FacetCounts {
  [key: string]: number
}

interface SavedSearch {
  name: string
  query: string
  createdAt: Date
}

interface Props {
  categories: readonly string[]
  pricingModels: readonly string[]
  difficultyLevels: readonly string[]
  technologies: readonly string[]
  tags: readonly string[]
  benefits?: readonly string[]
  selectedCategories: readonly string[]
  selectedPricingModels: readonly string[]
  selectedDifficultyLevels: readonly string[]
  selectedTechnologies: readonly string[]
  selectedTags: readonly string[]
  selectedBenefits?: readonly string[]
  selectedDateRange?: string
  resultsCount: number
  facetCounts?: FacetCounts
  savedSearches?: SavedSearch[]
}

const props = withDefaults(defineProps<Props>(), {
  benefits: () => [],
  selectedBenefits: () => [],
  selectedDateRange: 'anytime',
  facetCounts: () => ({}),
  savedSearches: () => [],
})

const emit = defineEmits<{
  (event: 'toggle-category', category: string): void
  (event: 'toggle-pricing-model', pricingModel: string): void
  (event: 'toggle-difficulty-level', difficulty: string): void
  (event: 'toggle-technology', technology: string): void
  (event: 'toggle-tag', tag: string): void
  (event: 'toggle-benefit', benefit: string): void
  (event: 'date-range-change', dateRange: string): void
  (event: 'reset-filters'): void
  (event: 'use-saved-search', search: SavedSearch): void
  (event: 'remove-saved-search', query: string): void
  (event: 'undo-delete', search: SavedSearch): void
}>()

const isOpen = ref(false)
const drawerRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLButtonElement | null>(null)
const filterButtonRef = ref<HTMLButtonElement | null>(null)
let previouslyFocusedElement: HTMLElement | null = null

// Palette's micro-UX enhancement: Track reduced motion preference for accessibility
const prefersReducedMotion = ref(false)

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const activeFiltersCount = computed(() => {
  let count = 0
  count += props.selectedCategories.length
  count += props.selectedPricingModels.length
  count += props.selectedDifficultyLevels.length
  count += props.selectedTechnologies.length
  count += props.selectedTags.length
  count += props.selectedBenefits?.length || 0
  if (props.selectedDateRange && props.selectedDateRange !== 'anytime') {
    count += 1
  }
  return count
})

const openDrawer = () => {
  previouslyFocusedElement = document.activeElement as HTMLElement
  isOpen.value = true
  document.body.style.overflow = 'hidden'

  // Palette's micro-UX delight: Haptic feedback when opening drawer
  // Provides subtle tactile confirmation on supported mobile devices
  if (!prefersReducedMotion.value) {
    hapticLight()
  }

  nextTick(() => {
    closeButtonRef.value?.focus()
  })
}

const closeDrawer = () => {
  isOpen.value = false
  document.body.style.overflow = ''

  // Palette's micro-UX delight: Haptic feedback when closing drawer
  // Provides subtle tactile confirmation on supported mobile devices
  if (!prefersReducedMotion.value) {
    hapticLight()
  }

  nextTick(() => {
    previouslyFocusedElement?.focus()
  })
}

const handleResetFilters = () => {
  emit('reset-filters')
}

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeDrawer()
  }
}

const handleFocusTrap = (event: KeyboardEvent) => {
  if (!isOpen.value || event.key !== 'Tab') return

  const focusableElements = drawerRef.value?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  if (!focusableElements || focusableElements.length === 0) return

  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[
    focusableElements.length - 1
  ] as HTMLElement

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey)
  document.addEventListener('keydown', handleFocusTrap)

  // Check for reduced motion preference on mount
  prefersReducedMotion.value = checkReducedMotion()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
  document.removeEventListener('keydown', handleFocusTrap)
  document.body.style.overflow = ''
})

watch(isOpen, newValue => {
  if (newValue) {
    const haptic = (
      navigator as Navigator & {
        vibrate?: (pattern: number | number[]) => boolean
      }
    ).vibrate
    if (haptic) {
      haptic(hapticConfig.duration.light)
    }
  }
})
</script>

<style scoped>
/* Prevent body scroll when drawer is open */
:global(body.drawer-open) {
  overflow: hidden;
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .transform {
    transition: none !important;
  }
}
</style>
