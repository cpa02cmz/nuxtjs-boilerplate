<template>
  <div
    ref="filtersContainerRef"
    class="bg-white p-6 rounded-lg shadow border border-gray-200 resource-filters"
    :class="{
      'filters-entrance-complete': entranceComplete || prefersReducedMotion,
    }"
  >
    <!-- Header with Reset Button -->
    <div
      class="flex justify-between items-center mb-4 filter-header"
      :class="{ 'is-visible': entranceComplete || prefersReducedMotion }"
    >
      <h2 class="text-lg font-medium text-gray-900">
        {{ contentConfig.filters.title }}
      </h2>
      <button
        :class="[
          `text-sm transition-all ${animationConfig.tailwindDurations.normal} ease-out focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded px-2 py-1 rounded`,
          resetConfirming
            ? 'text-green-600 bg-green-50'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
        ]"
        :aria-label="
          resetConfirming
            ? contentConfig.filters.ariaLabels.resetSuccess
            : contentConfig.filters.ariaLabels.resetAll
        "
        @click="handleResetWithFeedback"
      >
        <span class="flex items-center">
          <svg
            v-if="resetConfirming"
            class="w-4 h-4 mr-1.5"
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
          {{
            resetConfirming
              ? contentConfig.filters.resetSuccess
              : contentConfig.filters.resetAll
          }}
        </span>
      </button>
    </div>

    <!-- Filter Sections with Staggered Entrance Animation -->
    <div
      v-for="(section, index) in filterSections"
      :key="section.id"
      class="filter-section-wrapper"
      :class="{ 'is-visible': isSectionVisible(index) }"
      :style="getSectionStyle(index)"
    >
      <FilterSection
        :id="section.id"
        :label="section.label"
        :aria-label="section.ariaLabel"
        :options="section.options"
        :selected-options="section.selectedOptions"
        :show-count="section.showCount"
        :get-count-for-option="section.getCountForOption"
        @toggle="section.onToggle"
      />
    </div>

    <!-- Enhanced Date Range Section with Micro-UX -->
    <fieldset
      class="mb-6 date-range-section"
      :class="{ 'is-visible': isSectionVisible(filterSections.length) }"
      :style="getSectionStyle(filterSections.length)"
    >
      <legend class="text-sm font-medium text-gray-900 mb-3">
        {{ contentConfig.filters.sectionLabels.dateAdded }}
      </legend>
      <div
        role="radiogroup"
        :aria-label="contentConfig.filters.ariaLabels.dateAdded"
        class="date-range-grid"
      >
        <label
          v-for="(option, idx) in dateRangeOptions"
          :key="option.value"
          class="date-range-option"
          :class="{
            'is-selected': selectedDateRange === option.value,
            'is-focused': focusedDateOption === option.value,
          }"
          :for="`date-${option.value}`"
          :style="{ '--option-index': idx }"
          @mouseenter="handleDateOptionHover(option.value)"
          @mouseleave="handleDateOptionLeave"
          @keydown.space.prevent="handleDateOptionSelect(option.value)"
          @keydown.enter.prevent="handleDateOptionSelect(option.value)"
        >
          <input
            :id="`date-${option.value}`"
            type="radio"
            name="date-filter"
            :value="option.value"
            :checked="selectedDateRange === option.value"
            class="date-range-input"
            @change="onDateRangeChange(option.value)"
            @focus="focusedDateOption = option.value"
            @blur="focusedDateOption = null"
          >
          <span
            class="date-range-radio"
            aria-hidden="true"
          >
            <span class="date-range-radio-inner" />
          </span>
          <span class="date-range-label">{{ option.label }}</span>
          <!-- Hover glow effect -->
          <span
            v-if="!prefersReducedMotion"
            class="date-range-glow"
            aria-hidden="true"
          />
        </label>
      </div>
    </fieldset>

    <!-- Note: Duplicate Date Added fieldset removed - Issue #3302 fix
         Only the enhanced date range section above (lines 76-130) is now rendered -->

    <SavedSearches
      v-if="savedSearches && savedSearches.length > 0"
      :saved-searches="savedSearches"
      @use-saved-search="onUseSavedSearch"
      @remove-saved-search="onRemoveSavedSearch"
      @undo-delete="onUndoDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, onMounted } from 'vue'
import SavedSearches from '~/components/SavedSearches.vue'
import FilterSection from '~/components/FilterSection.vue'
import { triggerHaptic } from '~/utils/hapticFeedback'
import { uiConfig } from '~/configs/ui.config'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'
import { EASING } from '~/configs/easing.config'

interface FacetCounts {
  [key: string]: number
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
  searchQuery?: string
  facetCounts?: FacetCounts
  savedSearches?: Array<{ name: string; query: string; createdAt: Date }>
}

interface Emits {
  (event: 'toggle-category', category: string): void
  (event: 'toggle-pricing-model', pricingModel: string): void
  (event: 'toggle-difficulty-level', difficulty: string): void
  (event: 'toggle-technology', technology: string): void
  (event: 'toggle-tag', tag: string): void
  (event: 'toggle-benefit', benefit: string): void
  (event: 'date-range-change', dateRange: string): void
  (event: 'reset-filters'): void
  (
    event: 'use-saved-search',
    search: { name: string; query: string; createdAt: Date }
  ): void
  (event: 'remove-saved-search', query: string): void
  (
    event: 'undo-delete',
    search: { name: string; query: string; createdAt: Date }
  ): void
}

const props = withDefaults(defineProps<Props>(), {
  benefits: () => [],
  searchQuery: '',
  facetCounts: () => ({}),
  selectedBenefits: () => [],
  selectedDateRange: 'anytime',
  savedSearches: () => [],
})

const emit = defineEmits<Emits>()

// 🎨 Pallete's micro-UX enhancement: Reactive state for entrance animations
const filtersContainerRef = ref<HTMLElement | null>(null)
const entranceComplete = ref(false)
const prefersReducedMotion = ref(false)
const focusedDateOption = ref<string | null>(null)
const hoveredDateOption = ref<string | null>(null)

// 🎨 Pallete's micro-UX enhancement: Check for reduced motion preference
const checkReducedMotion = () => {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// 🎨 Pallete's micro-UX enhancement: Determine if section should be visible
const isSectionVisible = (_index: number) => {
  return entranceComplete.value || prefersReducedMotion.value
}

// 🎨 Pallete's micro-UX enhancement: Get staggered animation style for sections
const getSectionStyle = (index: number) => {
  if (prefersReducedMotion.value) {
    return {}
  }

  const config = animationConfig.resourceFilters
  const staggerDelay = Math.min(
    index * config.staggerDelayMs,
    config.maxStaggerDelayMs
  )

  return {
    '--section-index': index,
    '--stagger-delay': `${staggerDelay}ms`,
    '--entrance-duration': `${config.entranceDurationMs}ms`,
    '--entrance-easing': config.entranceEasing,
  }
}

// 🎨 Pallete's micro-UX enhancement: Date range options with enhanced UX
const dateRangeOptions = computed(() => [
  { value: 'anytime', label: contentConfig.filters.dateRanges.any },
  { value: 'lastWeek', label: contentConfig.filters.dateRanges.week },
  { value: 'lastMonth', label: contentConfig.filters.dateRanges.month },
  { value: 'lastYear', label: contentConfig.filters.dateRanges.year },
])

// Use dateRangeOptions to avoid unused variable warning
// This ensures the computed property is actually used in the template

// 🎨 Pallete's micro-UX enhancement: Handle date option hover
const handleDateOptionHover = (value: string) => {
  hoveredDateOption.value = value
}

// 🎨 Pallete's micro-UX enhancement: Handle date option leave
const handleDateOptionLeave = () => {
  hoveredDateOption.value = null
}

// 🎨 Pallete's micro-UX enhancement: Handle date option selection with haptic feedback
const handleDateOptionSelect = (value: string) => {
  triggerHaptic('light')
  onDateRangeChange(value)
}

// 🎨 Pallete's micro-UX enhancement: Filter sections configuration
const filterSections = computed(() => [
  {
    id: 'category',
    label: contentConfig.filters.sectionLabels.category,
    ariaLabel: contentConfig.filters.ariaLabels.category,
    options: props.categories,
    selectedOptions: props.selectedCategories,
    showCount: true,
    getCountForOption: getCategoryCount,
    onToggle: toggleCategory,
  },
  {
    id: 'pricing',
    label: contentConfig.filters.sectionLabels.pricingModel,
    ariaLabel: contentConfig.filters.ariaLabels.pricingModel,
    options: props.pricingModels,
    selectedOptions: props.selectedPricingModels,
    showCount: true,
    getCountForOption: getPricingCount,
    onToggle: togglePricingModel,
  },
  {
    id: 'difficulty',
    label: contentConfig.filters.sectionLabels.difficulty,
    ariaLabel: contentConfig.filters.ariaLabels.difficulty,
    options: props.difficultyLevels,
    selectedOptions: props.selectedDifficultyLevels,
    showCount: true,
    getCountForOption: getDifficultyCount,
    onToggle: toggleDifficultyLevel,
  },
  {
    id: 'technology',
    label: contentConfig.filters.sectionLabels.technology,
    ariaLabel: contentConfig.filters.ariaLabels.technology,
    options: props.technologies,
    selectedOptions: props.selectedTechnologies,
    showCount: true,
    getCountForOption: getTechnologyCount,
    onToggle: toggleTechnology,
  },
  {
    id: 'tags',
    label: contentConfig.filters.sectionLabels.tags,
    ariaLabel: contentConfig.filters.ariaLabels.tags,
    options: props.tags,
    selectedOptions: props.selectedTags,
    showCount: false,
    getCountForOption: undefined,
    onToggle: toggleTag,
  },
  ...(allBenefits.value.length > 0
    ? [
        {
          id: 'benefits',
          label: contentConfig.filters.sectionLabels.benefits,
          ariaLabel: contentConfig.filters.ariaLabels.benefits,
          options: allBenefits.value,
          selectedOptions: props.selectedBenefits,
          showCount: true,
          getCountForOption: getBenefitCount,
          onToggle: toggleBenefit,
        },
      ]
    : []),
])

const resetConfirming = ref(false)
let resetTimeout: ReturnType<typeof setTimeout> | null = null

const handleResetWithFeedback = () => {
  // Flexy hates hardcoded values! Using haptic utility instead
  triggerHaptic('medium')

  onResetFilters()

  resetConfirming.value = true

  if (resetTimeout) {
    clearTimeout(resetTimeout)
  }

  // Flexy hates hardcoded values! Using configurable delay from uiConfig
  resetTimeout = setTimeout(() => {
    resetConfirming.value = false
  }, uiConfig.feedback.resetConfirmationMs)
}

const toggleCategory = (category: string) => {
  emit('toggle-category', category)
}

const togglePricingModel = (pricingModel: string) => {
  emit('toggle-pricing-model', pricingModel)
}

const toggleDifficultyLevel = (difficulty: string) => {
  emit('toggle-difficulty-level', difficulty)
}

const toggleTechnology = (technology: string) => {
  emit('toggle-technology', technology)
}

const toggleTag = (tag: string) => {
  emit('toggle-tag', tag)
}

const toggleBenefit = (benefit: string) => {
  emit('toggle-benefit', benefit)
}

const onDateRangeChange = (dateRange: string) => {
  emit('date-range-change', dateRange)
}

const onResetFilters = () => {
  emit('reset-filters')
}

const allBenefits = computed(() => {
  const uniqueBenefits = new Set<string>()
  Object.keys(props.facetCounts || {}).forEach(key => {
    if (key.startsWith('benefits_')) {
      const benefit = key.replace('benefits_', '')
      uniqueBenefits.add(benefit)
    }
  })
  return Array.from(uniqueBenefits)
})

const getCategoryCount = (option: string): number => {
  if (!props.facetCounts) return 0
  return props.facetCounts[`category_${option}`] || 0
}

const getPricingCount = (option: string): number => {
  if (!props.facetCounts) return 0
  return props.facetCounts[`pricing_${option}`] || 0
}

const getDifficultyCount = (option: string): number => {
  if (!props.facetCounts) return 0
  return props.facetCounts[`difficulty_${option}`] || 0
}

const getTechnologyCount = (option: string): number => {
  if (!props.facetCounts) return 0
  return props.facetCounts[`technology_${option}`] || 0
}

const getBenefitCount = (option: string): number => {
  if (!props.facetCounts) return 0
  return props.facetCounts[`benefits_${option}`] || 0
}

const onUseSavedSearch = (search: {
  name: string
  query: string
  createdAt: Date
}) => {
  emit('use-saved-search', search)
}

const onRemoveSavedSearch = (query: string) => {
  emit('remove-saved-search', query)
}

const onUndoDelete = (search: {
  name: string
  query: string
  createdAt: Date
}) => {
  emit('undo-delete', search)
}

// 🎨 Pallete's micro-UX enhancement: Lifecycle hooks for entrance animation
let mediaQueryRef: MediaQueryList | null = null
let handleMotionChangeRef: ((e: MediaQueryListEvent) => void) | null = null

onMounted(() => {
  // Check for reduced motion preference
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined' && window.matchMedia) {
    mediaQueryRef = window.matchMedia('(prefers-reduced-motion: reduce)')
    handleMotionChangeRef = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQueryRef.addEventListener('change', handleMotionChangeRef)
  }

  // Trigger entrance animation with staggered delay
  if (!prefersReducedMotion.value) {
    const config = animationConfig.resourceFilters
    setTimeout(() => {
      entranceComplete.value = true
    }, config.entranceDelayMs)
  } else {
    entranceComplete.value = true
  }
})

// Cleanup timeout on unmount to prevent memory leaks
onUnmounted(() => {
  if (resetTimeout) {
    clearTimeout(resetTimeout)
  }

  // 🎨 Pallete's micro-UX enhancement: Cleanup media query listener
  if (mediaQueryRef && handleMotionChangeRef) {
    mediaQueryRef.removeEventListener('change', handleMotionChangeRef)
    mediaQueryRef = null
    handleMotionChangeRef = null
  }
})
</script>

<style scoped>
/* 🎨 Pallete's micro-UX enhancement: Entrance animations for filter sections */
.filter-section-wrapper {
  opacity: 0;
  transform: translateY(20px);
  /* Flexy hates hardcoded 400ms! Using animationConfig.stagger.entranceDurationMs */
  transition:
    opacity
      var(
        --entrance-duration,
        v-bind('animationConfig.stagger.entranceDurationMs + "ms"')
      )
      ease-out,
    transform
      var(
        --entrance-duration,
        v-bind('animationConfig.stagger.entranceDurationMs + "ms"')
      )
      v-bind('EASING.SPRING_SNAPPY');
  /* Flexy hates hardcoded 0ms! Using animationConfig.stagger.baseDelayMs */
  transition-delay: var(
    --stagger-delay,
    v-bind('animationConfig.stagger.baseDelayMs + "ms"')
  );
}

.filter-section-wrapper.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Header entrance animation */
/* Flexy hates hardcoded 0ms! Using animationConfig.resourceFilters.headerDelayMs */
.filter-header {
  opacity: 0;
  transform: translateY(-10px);
  transition:
    opacity var(--entrance-duration, 400ms) ease-out,
    transform var(--entrance-duration, 400ms) ease-out;
  transition-delay: v-bind(
    'animationConfig.resourceFilters.headerDelayMs + "ms"'
  );
}

.filter-header.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* 🎨 Pallete's micro-UX enhancement: Enhanced Date Range Section */
.date-range-section {
  opacity: 0;
  transform: translateY(20px);
  /* Flexy hates hardcoded 400ms! Using animationConfig.stagger.entranceDurationMs */
  transition:
    opacity
      var(
        --entrance-duration,
        v-bind('animationConfig.stagger.entranceDurationMs + "ms"')
      )
      ease-out,
    transform
      var(
        --entrance-duration,
        v-bind('animationConfig.stagger.entranceDurationMs + "ms"')
      )
      v-bind('EASING.SPRING_SNAPPY');
  /* Flexy hates hardcoded 0ms! Using animationConfig.stagger.baseDelayMs */
  transition-delay: var(
    --stagger-delay,
    v-bind('animationConfig.stagger.baseDelayMs + "ms"')
  );
}

.date-range-section.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.date-range-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .date-range-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.date-range-option {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all v-bind('animationConfig.transition.fast.durationMs + "ms"')
    ease-out;
  overflow: hidden;
}

.date-range-option:hover {
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.date-range-option.is-selected {
  border-color: #4b5563;
  background: #f9fafb;
}

.date-range-option.is-focused {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* Custom radio button styling */
.date-range-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.date-range-radio {
  position: relative;
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  margin-right: 0.5rem;
  flex-shrink: 0;
  /* Flexy hates hardcoded 200ms! Using animationConfig.resourceFilters.dateRange.transitionMs */
  transition: all
    v-bind('animationConfig.resourceFilters.dateRange.transitionSec') ease-out;
}

.date-range-option:hover .date-range-radio {
  border-color: #9ca3af;
}

.date-range-option.is-selected .date-range-radio {
  border-color: #4b5563;
  background: #4b5563;
}

.date-range-radio-inner {
  position: absolute;
  inset: 3px;
  background: white;
  border-radius: 50%;
  transform: scale(0);
  /* Flexy hates hardcoded 200ms! Using animationConfig.resourceFilters.dateRange.transformMs */
  transition: transform
    v-bind('animationConfig.resourceFilters.dateRange.transformSec')
    cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.date-range-option.is-selected .date-range-radio-inner {
  transform: scale(1);
}

.date-range-label {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
  /* Flexy hates hardcoded 200ms! Using animationConfig.resourceFilters.dateRange.transitionMs */
  transition: color
    v-bind('animationConfig.resourceFilters.dateRange.transitionSec') ease;
}

.date-range-option.is-selected .date-range-label {
  color: #111827;
}

/* Glow effect on hover */
.date-range-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba(59, 130, 246, 0.1) 0%,
    transparent 70%
  );
  opacity: 0;
  /* Flexy hates hardcoded 200ms! Using animationConfig.resourceFilters.dateRange.transitionMs */
  transition: opacity
    v-bind('animationConfig.resourceFilters.dateRange.transitionSec') ease;
  pointer-events: none;
}

.date-range-option:hover .date-range-glow {
  opacity: 1;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .filter-section-wrapper,
  .filter-header,
  .date-range-section {
    transition: none;
    opacity: 1;
    transform: none;
  }

  .date-range-option {
    transition: none;
  }

  .date-range-option:hover {
    transform: none;
  }

  .date-range-radio-inner {
    transition: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .date-range-option {
    border-width: 3px;
  }

  .date-range-option.is-selected {
    border-width: 3px;
  }
}
</style>
