<template>
  <div
    v-if="hasActiveFilters"
    class="flex flex-wrap items-center gap-2 mb-4"
    role="region"
    :aria-label="contentConfig.filters.ariaLabels.region"
  >
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-500 font-medium">{{
        contentConfig.filters.activeFilters
      }}</span>
      <span
        class="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold bg-gray-200 text-gray-700 rounded-full"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ activeFilterCount }}
      </span>
    </div>

    <!-- Aria live region for filter removal announcements -->
    <div
      id="filter-announcements"
      class="sr-only"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ announcement }}
    </div>

    <TransitionGroup
      name="filter-chip"
      tag="div"
      class="flex flex-wrap items-center gap-2"
      @before-leave="handleBeforeLeave"
    >
      <!-- Search query chip -->
      <button
        v-if="searchQuery"
        ref="chipRefs"
        key="search"
        tabindex="0"
        class="filter-chip filter-chip-blue group"
        :class="{
          'spring-physics': !prefersReducedMotion,
          'is-pressed': pressedChips.has(`search-${searchQuery}`),
          'is-exiting': exitingChips.has(`search-${searchQuery}`),
        }"
        :style="getChipSpringStyle('search', searchQuery)"
        :aria-label="
          contentConfig.filters.chipAriaLabels.removeSearch.replace(
            '{{value}}',
            searchQuery
          )
        "
        @click="handleRemove('search', searchQuery, $event)"
        @keydown="e => handleChipKeydown(e, 'search', searchQuery)"
        @mousedown="handleChipPressStart('search', searchQuery)"
        @mouseup="handleChipPressEnd('search', searchQuery)"
        @mouseleave="handleChipPressEnd('search', searchQuery)"
        @touchstart="handleChipPressStart('search', searchQuery)"
        @touchend="handleChipPressEnd('search', searchQuery)"
      >
        <span :class="['truncate', uiConfig.chips.queryMaxWidth]">{{
          searchQuery
        }}</span>
        <span class="remove-icon" aria-hidden="true">
          <svg
            :class="[
              CHIP_ICON_SIZE,
              'transition-transform duration-150 group-hover:rotate-90',
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
        <!-- Shimmer effect on hover -->
        <span class="shimmer-effect" aria-hidden="true" />
      </button>

      <!-- Category chips -->
      <button
        v-for="category in selectedCategories"
        :key="`cat-${category}`"
        ref="chipRefs"
        tabindex="0"
        class="filter-chip filter-chip-gray group"
        :class="{
          'spring-physics': !prefersReducedMotion,
          'is-pressed': pressedChips.has(`category-${category}`),
          'is-exiting': exitingChips.has(`category-${category}`),
        }"
        :style="getChipSpringStyle('category', category)"
        :aria-label="
          contentConfig.filters.chipAriaLabels.removeCategory.replace(
            '{{value}}',
            category
          )
        "
        @click="handleRemove('category', category, $event)"
        @keydown="e => handleChipKeydown(e, 'category', category)"
        @mousedown="handleChipPressStart('category', category)"
        @mouseup="handleChipPressEnd('category', category)"
        @mouseleave="handleChipPressEnd('category', category)"
        @touchstart="handleChipPressStart('category', category)"
        @touchend="handleChipPressEnd('category', category)"
      >
        <span class="text-gray-500 mr-1.5">{{
          contentConfig.filters.labels.category
        }}</span>
        <span :class="['truncate', uiConfig.chips.valueMaxWidth]">{{
          category
        }}</span>
        <span class="remove-icon" aria-hidden="true">
          <svg
            :class="[
              CHIP_ICON_SIZE,
              'transition-transform duration-150 group-hover:rotate-90',
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
        <span class="shimmer-effect" aria-hidden="true" />
      </button>

      <!-- Pricing model chips -->
      <button
        v-for="pricing in selectedPricingModels"
        :key="`price-${pricing}`"
        ref="chipRefs"
        tabindex="0"
        class="filter-chip filter-chip-green group"
        :class="{
          'spring-physics': !prefersReducedMotion,
          'is-pressed': pressedChips.has(`pricing-${pricing}`),
          'is-exiting': exitingChips.has(`pricing-${pricing}`),
        }"
        :style="getChipSpringStyle('pricing', pricing)"
        :aria-label="
          contentConfig.filters.chipAriaLabels.removePricing.replace(
            '{{value}}',
            pricing
          )
        "
        @click="handleRemove('pricing', pricing, $event)"
        @keydown="e => handleChipKeydown(e, 'pricing', pricing)"
        @mousedown="handleChipPressStart('pricing', pricing)"
        @mouseup="handleChipPressEnd('pricing', pricing)"
        @mouseleave="handleChipPressEnd('pricing', pricing)"
        @touchstart="handleChipPressStart('pricing', pricing)"
        @touchend="handleChipPressEnd('pricing', pricing)"
      >
        <span class="text-green-600 mr-1.5">{{
          contentConfig.filters.labels.pricing
        }}</span>
        <span :class="['truncate', uiConfig.chips.valueMaxWidth]">{{
          pricing
        }}</span>
        <span class="remove-icon" aria-hidden="true">
          <svg
            :class="[
              CHIP_ICON_SIZE,
              'transition-transform duration-150 group-hover:rotate-90',
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
        <span class="shimmer-effect" aria-hidden="true" />
      </button>

      <!-- Difficulty chips -->
      <button
        v-for="difficulty in selectedDifficultyLevels"
        :key="`diff-${difficulty}`"
        ref="chipRefs"
        tabindex="0"
        class="filter-chip filter-chip-purple group"
        :class="{
          'spring-physics': !prefersReducedMotion,
          'is-pressed': pressedChips.has(`difficulty-${difficulty}`),
          'is-exiting': exitingChips.has(`difficulty-${difficulty}`),
        }"
        :style="getChipSpringStyle('difficulty', difficulty)"
        :aria-label="
          contentConfig.filters.chipAriaLabels.removeDifficulty.replace(
            '{{value}}',
            difficulty
          )
        "
        @click="handleRemove('difficulty', difficulty, $event)"
        @keydown="e => handleChipKeydown(e, 'difficulty', difficulty)"
        @mousedown="handleChipPressStart('difficulty', difficulty)"
        @mouseup="handleChipPressEnd('difficulty', difficulty)"
        @mouseleave="handleChipPressEnd('difficulty', difficulty)"
        @touchstart="handleChipPressStart('difficulty', difficulty)"
        @touchend="handleChipPressEnd('difficulty', difficulty)"
      >
        <span class="text-purple-600 mr-1.5">{{
          contentConfig.filters.labels.difficulty
        }}</span>
        <span :class="['truncate', uiConfig.chips.valueMaxWidth]">{{
          difficulty
        }}</span>
        <span class="remove-icon" aria-hidden="true">
          <svg
            :class="[
              CHIP_ICON_SIZE,
              'transition-transform duration-150 group-hover:rotate-90',
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
        <span class="shimmer-effect" aria-hidden="true" />
      </button>

      <!-- Technology chips -->
      <button
        v-for="tech in selectedTechnologies"
        :key="`tech-${tech}`"
        ref="chipRefs"
        tabindex="0"
        class="filter-chip filter-chip-orange group"
        :class="{
          'spring-physics': !prefersReducedMotion,
          'is-pressed': pressedChips.has(`technology-${tech}`),
          'is-exiting': exitingChips.has(`technology-${tech}`),
        }"
        :style="getChipSpringStyle('technology', tech)"
        :aria-label="
          contentConfig.filters.chipAriaLabels.removeTechnology.replace(
            '{{value}}',
            tech
          )
        "
        @click="handleRemove('technology', tech, $event)"
        @keydown="e => handleChipKeydown(e, 'technology', tech)"
        @mousedown="handleChipPressStart('technology', tech)"
        @mouseup="handleChipPressEnd('technology', tech)"
        @mouseleave="handleChipPressEnd('technology', tech)"
        @touchstart="handleChipPressStart('technology', tech)"
        @touchend="handleChipPressEnd('technology', tech)"
      >
        <span class="text-orange-600 mr-1.5">{{
          contentConfig.filters.labels.tech
        }}</span>
        <span :class="['truncate', uiConfig.chips.valueMaxWidth]">{{
          tech
        }}</span>
        <span class="remove-icon" aria-hidden="true">
          <svg
            :class="[
              CHIP_ICON_SIZE,
              'transition-transform duration-150 group-hover:rotate-90',
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
        <span class="shimmer-effect" aria-hidden="true" />
      </button>

      <!-- Tag chips -->
      <button
        v-for="tag in selectedTags"
        :key="`tag-${tag}`"
        ref="chipRefs"
        tabindex="0"
        class="filter-chip filter-chip-pink group"
        :class="{
          'spring-physics': !prefersReducedMotion,
          'is-pressed': pressedChips.has(`tag-${tag}`),
          'is-exiting': exitingChips.has(`tag-${tag}`),
        }"
        :style="getChipSpringStyle('tag', tag)"
        :aria-label="
          contentConfig.filters.chipAriaLabels.removeTag.replace(
            '{{value}}',
            tag
          )
        "
        @click="handleRemove('tag', tag, $event)"
        @keydown="e => handleChipKeydown(e, 'tag', tag)"
        @mousedown="handleChipPressStart('tag', tag)"
        @mouseup="handleChipPressEnd('tag', tag)"
        @mouseleave="handleChipPressEnd('tag', tag)"
        @touchstart="handleChipPressStart('tag', tag)"
        @touchend="handleChipPressEnd('tag', tag)"
      >
        <span class="text-pink-600 mr-1.5">{{
          contentConfig.filters.labels.tag
        }}</span>
        <span :class="['truncate', uiConfig.chips.valueMaxWidth]">{{
          tag
        }}</span>
        <span class="remove-icon" aria-hidden="true">
          <svg
            :class="[
              CHIP_ICON_SIZE,
              'transition-transform duration-150 group-hover:rotate-90',
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
        <span class="shimmer-effect" aria-hidden="true" />
      </button>

      <!-- Benefit chips -->
      <button
        v-for="benefit in selectedBenefits"
        :key="`benefit-${benefit}`"
        ref="chipRefs"
        tabindex="0"
        class="filter-chip filter-chip-teal group"
        :class="{
          'spring-physics': !prefersReducedMotion,
          'is-pressed': pressedChips.has(`benefit-${benefit}`),
          'is-exiting': exitingChips.has(`benefit-${benefit}`),
        }"
        :style="getChipSpringStyle('benefit', benefit)"
        :aria-label="
          contentConfig.filters.chipAriaLabels.removeBenefit.replace(
            '{{value}}',
            benefit
          )
        "
        @click="handleRemove('benefit', benefit, $event)"
        @keydown="e => handleChipKeydown(e, 'benefit', benefit)"
        @mousedown="handleChipPressStart('benefit', benefit)"
        @mouseup="handleChipPressEnd('benefit', benefit)"
        @mouseleave="handleChipPressEnd('benefit', benefit)"
        @touchstart="handleChipPressStart('benefit', benefit)"
        @touchend="handleChipPressEnd('benefit', benefit)"
      >
        <span class="text-teal-600 mr-1.5">{{
          contentConfig.filters.labels.benefit
        }}</span>
        <span :class="['truncate', uiConfig.chips.valueMaxWidth]">{{
          benefit
        }}</span>
        <span class="remove-icon" aria-hidden="true">
          <svg
            :class="[
              CHIP_ICON_SIZE,
              'transition-transform duration-150 group-hover:rotate-90',
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
        <span class="shimmer-effect" aria-hidden="true" />
      </button>

      <!-- Date range chip -->
      <button
        v-if="selectedDateRange && selectedDateRange !== 'anytime'"
        ref="chipRefs"
        key="date"
        tabindex="0"
        class="filter-chip filter-chip-indigo group"
        :class="{
          'spring-physics': !prefersReducedMotion,
          'is-pressed': pressedChips.has(`date-${selectedDateRange}`),
          'is-exiting': exitingChips.has(`date-${selectedDateRange}`),
        }"
        :style="getChipSpringStyle('date', selectedDateRange)"
        :aria-label="
          contentConfig.filters.chipAriaLabels.removeDate.replace(
            '{{value}}',
            formatDateRange(selectedDateRange)
          )
        "
        @click="handleRemove('date', selectedDateRange, $event)"
        @keydown="e => handleChipKeydown(e, 'date', selectedDateRange)"
        @mousedown="handleChipPressStart('date', selectedDateRange)"
        @mouseup="handleChipPressEnd('date', selectedDateRange)"
        @mouseleave="handleChipPressEnd('date', selectedDateRange)"
        @touchstart="handleChipPressStart('date', selectedDateRange)"
        @touchend="handleChipPressEnd('date', selectedDateRange)"
      >
        <span class="text-indigo-600 mr-1.5">{{
          contentConfig.filters.labels.date
        }}</span>
        <span>{{ formatDateRange(selectedDateRange) }}</span>
        <span class="remove-icon" aria-hidden="true">
          <svg
            :class="[
              CHIP_ICON_SIZE,
              'transition-transform duration-150 group-hover:rotate-90',
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
        <span class="shimmer-effect" aria-hidden="true" />
      </button>

      <!-- Undo button for recently removed filter -->
      <button
        v-if="lastRemovedFilter"
        key="undo-filter"
        class="filter-chip filter-chip-undo"
        :aria-label="
          contentConfig.filters.chipAriaLabels.undo.replace(
            '{{value}}',
            lastRemovedFilter.displayLabel
          )
        "
        @click="undoRemove"
      >
        <svg
          :class="[CHIP_ICON_SIZE, 'mr-1.5']"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
        <span :class="['truncate', uiConfig.chips.valueMaxWidth]"
          >{{ contentConfig.buttons.undo }} {{ lastRemovedFilter.type }}</span
        >
        <kbd
          class="hidden sm:inline-flex items-center ml-2 px-1.5 py-0.5 text-xs bg-white/50 border border-current/20 rounded"
          aria-hidden="true"
          >{{ contentConfig.filters.keyboard.ctrlZ }}</kbd
        >
        <!-- Progress bar for undo window with color transition -->
        <span
          class="undo-progress-bar"
          :class="undoProgressColorClass"
          :style="{ width: `${undoProgress}%` }"
          aria-hidden="true"
        />
      </button>
    </TransitionGroup>

    <!-- Clear all button with keyboard shortcut hint -->
    <button
      ref="clearAllButtonRef"
      class="group ml-2 text-sm text-gray-500 hover:text-gray-700 underline focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 rounded px-1 transition-colors"
      :aria-label="contentConfig.filters.ariaLabels.clearAll"
      @click="handleClearAll"
    >
      <span>{{ contentConfig.filters.clearAll }}</span>
      <kbd
        class="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded group-hover:bg-gray-200 transition-colors"
        aria-hidden="true"
        >{{ contentConfig.filters.keyboard.esc }}</kbd
      >
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { uiConfig } from '../configs/ui.config'
import { contentConfig } from '../configs/content.config'
import { animationConfig } from '../configs/animation.config'
import { easingConfig, EASING } from '../configs/easing.config'
import { zIndexConfig } from '../configs/z-index.config'
import { shadowsConfig } from '../configs/shadows.config'
import { PROGRESS } from '~/server/utils/constants'
import { triggerHaptic } from '~/utils/hapticFeedback'

interface Props {
  searchQuery?: string
  selectedCategories: string[]
  selectedPricingModels: string[]
  selectedDifficultyLevels: string[]
  selectedTechnologies: string[]
  selectedTags: string[]
  selectedBenefits: string[]
  selectedDateRange?: string
}

interface RemovedFilter {
  type: string
  value: string
  timestamp: number
  displayLabel: string
  chipClass: string
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: '',
  selectedDateRange: 'anytime',
})

const emit = defineEmits<{
  'clear-search': []
  'toggle-category': [category: string]
  'toggle-pricing-model': [pricing: string]
  'toggle-difficulty-level': [difficulty: string]
  'toggle-technology': [tech: string]
  'toggle-tag': [tag: string]
  'toggle-benefit': [benefit: string]
  'clear-date-range': []
  'reset-filters': []
}>()

// Announcement state for screen readers
const announcement = ref('')

// Chip refs for keyboard navigation
const chipRefs = ref<HTMLButtonElement[]>([])

// Ref for the Clear all button to return focus when all chips are removed
const clearAllButtonRef = ref<HTMLButtonElement | null>(null)

// Undo feature state
const lastRemovedFilter = ref<RemovedFilter | null>(null)
const undoTimeoutId = ref<ReturnType<typeof setTimeout> | null>(null)
const undoProgress = ref(PROGRESS.MAX_PERCENT)
const progressIntervalId = ref<ReturnType<typeof setInterval> | null>(null)
// Flexy says: No more hardcoded values! Using config values instead.
const UNDO_WINDOW_MS = uiConfig.filterChip.undoWindowMs
const UNDO_PROGRESS_INTERVAL_MS = uiConfig.filterChip.undoProgressIntervalMs
const UNDO_PROGRESS_DECREMENT = uiConfig.filterChip.undoProgressDecrement
const ANNOUNCEMENT_CLEAR_MS = uiConfig.filterChip.announcementClearMs
const CHIP_ICON_SIZE = uiConfig.filterChip.iconSize

// Track removing chips for animation (used in future undo feature)
const _removingChips = ref<Set<string>>(new Set())

// Spring Physics Micro-UX - Palette's delightful touch!
// Track which chips are being pressed for spring animation
const pressedChips = ref<Set<string>>(new Set())
// Track which chips are being removed for exit animation
const exitingChips = ref<Set<string>>(new Set())

// Check for reduced motion preference
const prefersReducedMotion = ref(false)
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Computed property for progress bar color - transitions from amber to red as time runs out
const undoProgressColorClass = computed(() => {
  const thresholds = uiConfig.filterChip.progressThresholds
  if (undoProgress.value > thresholds.high) {
    return 'bg-amber-400'
  } else if (undoProgress.value > thresholds.medium) {
    return 'bg-amber-500'
  } else if (undoProgress.value > thresholds.low) {
    return 'bg-orange-500'
  } else {
    return 'bg-red-500'
  }
})

const hasActiveFilters = computed(() => {
  return (
    props.searchQuery ||
    props.selectedCategories.length > 0 ||
    props.selectedPricingModels.length > 0 ||
    props.selectedDifficultyLevels.length > 0 ||
    props.selectedTechnologies.length > 0 ||
    props.selectedTags.length > 0 ||
    props.selectedBenefits.length > 0 ||
    (props.selectedDateRange && props.selectedDateRange !== 'anytime')
  )
})

const activeFilterCount = computed(() => {
  let count = 0
  if (props.searchQuery) count++
  count += props.selectedCategories.length
  count += props.selectedPricingModels.length
  count += props.selectedDifficultyLevels.length
  count += props.selectedTechnologies.length
  count += props.selectedTags.length
  count += props.selectedBenefits.length
  if (props.selectedDateRange && props.selectedDateRange !== 'anytime') count++
  return count
})

const formatDateRange = (range: string): string => {
  const dateLabels: Record<string, string> = {
    lastWeek: contentConfig.filters.dateRanges.week,
    lastMonth: contentConfig.filters.dateRanges.month,
    lastYear: contentConfig.filters.dateRanges.year,
  }
  return dateLabels[range] || range
}

const handleRemove = (type: string, value: string, _event: Event) => {
  // Spring Physics Micro-UX - Palette's delightful touch!
  // Add chip to exiting set for spring physics exit animation
  const chipKey = `${type}-${value}`
  exitingChips.value.add(chipKey)

  // Trigger haptic feedback with configurable pattern
  triggerHaptic('light')

  // Store the removed filter for potential undo
  lastRemovedFilter.value = {
    type,
    value,
    timestamp: Date.now(),
    displayLabel: getFilterDisplayLabel(type, value),
    chipClass: getFilterChipClass(type),
  }

  // Start progress countdown
  undoProgress.value = 100
  if (progressIntervalId.value) {
    clearInterval(progressIntervalId.value)
  }
  progressIntervalId.value = setInterval(() => {
    undoProgress.value -= UNDO_PROGRESS_DECREMENT // Configurable decrement
    if (undoProgress.value <= 0) {
      undoProgress.value = 0
      if (progressIntervalId.value) {
        clearInterval(progressIntervalId.value)
        progressIntervalId.value = null
      }
    }
  }, UNDO_PROGRESS_INTERVAL_MS)

  // Set timeout to clear undo state after window expires
  if (undoTimeoutId.value) {
    clearTimeout(undoTimeoutId.value)
  }
  undoTimeoutId.value = setTimeout(() => {
    clearUndoState()
  }, UNDO_WINDOW_MS)

  // Announce to screen readers with undo hint
  const remainingCount = activeFilterCount.value - 1
  announcement.value = `${type} filter removed. ${remainingCount} filter${remainingCount !== 1 ? 's' : ''} active. Press Control Z to undo.`

  // Clear announcement after screen reader has time to read it
  setTimeout(() => {
    announcement.value = ''
  }, ANNOUNCEMENT_CLEAR_MS)

  // Emit the appropriate event
  switch (type) {
    case 'search':
      emit('clear-search')
      break
    case 'category':
      emit('toggle-category', value)
      break
    case 'pricing':
      emit('toggle-pricing-model', value)
      break
    case 'difficulty':
      emit('toggle-difficulty-level', value)
      break
    case 'technology':
      emit('toggle-technology', value)
      break
    case 'tag':
      emit('toggle-tag', value)
      break
    case 'benefit':
      emit('toggle-benefit', value)
      break
    case 'date':
      emit('clear-date-range')
      break
  }
}

const handleClearAll = () => {
  // Clear any pending undo first
  clearUndoState()

  // Announce to screen readers
  announcement.value = 'All filters cleared.'

  // Clear announcement after screen reader has time to read it
  setTimeout(() => {
    announcement.value = ''
  }, ANNOUNCEMENT_CLEAR_MS)

  emit('reset-filters')
}

// Clear undo state and timers
const clearUndoState = () => {
  if (undoTimeoutId.value) {
    clearTimeout(undoTimeoutId.value)
    undoTimeoutId.value = null
  }
  if (progressIntervalId.value) {
    clearInterval(progressIntervalId.value)
    progressIntervalId.value = null
  }
  lastRemovedFilter.value = null
  undoProgress.value = 100
}

// Restore the last removed filter
const undoRemove = () => {
  if (!lastRemovedFilter.value) return

  const filter = lastRemovedFilter.value

  // Clear undo state first
  clearUndoState()

  // Announce to screen readers
  announcement.value = `${filter.displayLabel} filter restored.`
  setTimeout(() => {
    announcement.value = ''
  }, ANNOUNCEMENT_CLEAR_MS)

  // Re-add the filter by emitting the appropriate event
  switch (filter.type) {
    case 'search':
      // For search, we can't easily restore - emit clear-search (noop)
      // Search restoration would require a different approach
      break
    case 'category':
      emit('toggle-category', filter.value)
      break
    case 'pricing':
      emit('toggle-pricing-model', filter.value)
      break
    case 'difficulty':
      emit('toggle-difficulty-level', filter.value)
      break
    case 'technology':
      emit('toggle-technology', filter.value)
      break
    case 'tag':
      emit('toggle-tag', filter.value)
      break
    case 'benefit':
      emit('toggle-benefit', filter.value)
      break
    case 'date':
      // Date range restoration
      break
  }
}

// Handle keyboard shortcut for undo (Ctrl+Z / Cmd+Z)
const handleKeydown = (event: KeyboardEvent) => {
  if (
    (event.ctrlKey || event.metaKey) &&
    event.key === 'z' &&
    lastRemovedFilter.value
  ) {
    event.preventDefault()
    undoRemove()
  }
}

// Handle keyboard navigation between chips
const handleChipKeydown = (
  event: KeyboardEvent,
  type: string,
  value: string
) => {
  const chips = chipRefs.value.filter(Boolean)
  const currentIndex = chips.indexOf(event.target as HTMLButtonElement)

  if (currentIndex === -1) return

  switch (event.key) {
    case 'ArrowLeft':
    case 'Left':
      event.preventDefault()
      if (currentIndex > 0) {
        chips[currentIndex - 1].focus()
        announceFilterNavigation('previous')
      }
      break
    case 'ArrowRight':
    case 'Right':
      event.preventDefault()
      if (currentIndex < chips.length - 1) {
        chips[currentIndex + 1].focus()
        announceFilterNavigation('next')
      }
      break
    case 'Delete':
    case 'Backspace':
      event.preventDefault()
      handleRemove(type, value, event as unknown as Event)
      // Focus the next chip, previous chip, or Clear all button if this was the last one
      // Use nextTick to ensure DOM has updated after filter removal
      nextTick(() => {
        const updatedChips = chipRefs.value.filter(Boolean)
        if (updatedChips.length > 0) {
          // Focus the chip at the same index, or the last one if we removed the last chip
          const focusIndex = Math.min(currentIndex, updatedChips.length - 1)
          updatedChips[focusIndex]?.focus()
        } else {
          // All filters removed - return focus to Clear all button for better accessibility
          clearAllButtonRef.value?.focus()
        }
      })
      break
    case 'Home':
      event.preventDefault()
      if (chips.length > 0) {
        chips[0].focus()
        announceFilterNavigation('first')
      }
      break
    case 'End':
      event.preventDefault()
      if (chips.length > 0) {
        chips[chips.length - 1].focus()
        announceFilterNavigation('last')
      }
      break
  }
}

// Announce filter navigation for screen readers
const announceFilterNavigation = (
  direction: 'previous' | 'next' | 'first' | 'last'
) => {
  const directionText: Record<string, string> = {
    previous: 'Previous filter',
    next: 'Next filter',
    first: 'First filter',
    last: 'Last filter',
  }
  announcement.value = `${directionText[direction]} focused`
  setTimeout(() => {
    announcement.value = ''
  }, ANNOUNCEMENT_CLEAR_MS)
}

// Get display label for filter type
const getFilterDisplayLabel = (type: string, value: string): string => {
  const typeLabels: Record<string, string> = {
    search: value,
    category: value,
    pricing: value,
    difficulty: value,
    technology: value,
    tag: value,
    benefit: value,
    date: formatDateRange(value),
  }
  return typeLabels[type] || value
}

// Get chip class based on filter type
const getFilterChipClass = (type: string): string => {
  const classMap: Record<string, string> = {
    search: 'filter-chip-blue',
    category: 'filter-chip-gray',
    pricing: 'filter-chip-green',
    difficulty: 'filter-chip-purple',
    technology: 'filter-chip-orange',
    tag: 'filter-chip-pink',
    benefit: 'filter-chip-teal',
    date: 'filter-chip-indigo',
  }
  return classMap[type] || 'filter-chip-gray'
}

// Handle before leave to fix layout shift during transition
const handleBeforeLeave = (el: Element) => {
  const htmlEl = el as HTMLElement
  const { width, height } = htmlEl.getBoundingClientRect()
  htmlEl.style.width = `${width}px`
  htmlEl.style.height = `${height}px`
}

// Spring Physics Micro-UX - Palette's delightful touch!
// Handle chip press start for spring animation
const handleChipPressStart = (type: string, value: string) => {
  if (prefersReducedMotion.value) return
  pressedChips.value.add(`${type}-${value}`)
}

// Handle chip press end for spring animation
const handleChipPressEnd = (type: string, value: string) => {
  pressedChips.value.delete(`${type}-${value}`)
}

// Get spring physics style for a chip
const getChipSpringStyle = (type: string, value: string) => {
  const chipKey = `${type}-${value}`
  const isPressed = pressedChips.value.has(chipKey)
  const isExiting = exitingChips.value.has(chipKey)

  if (prefersReducedMotion.value) {
    return {}
  }

  const config = animationConfig.filterChipSpring

  if (isExiting) {
    return {
      transform: `translateX(${config.removeTranslateXPx}px) rotate(${config.removeRotationDeg}deg) scale(0.8)`,
      opacity: '0',
      // Flexy hates hardcoded values! Using configurable easing from easingConfig
      transition: `all ${config.durationSec} ${easingConfig.cubicBezier.standard}`,
    }
  }

  if (isPressed) {
    return {
      transform: `scale(${config.pressScale})`,
      transition: `transform ${animationConfig.cssTransitions.fastSec} ease-out`,
    }
  }

  // Flexy hates hardcoded values! Using configurable easing from easingConfig
  return {
    transition: `all ${config.durationSec} ${easingConfig.cubicBezier.spring}`,
  }
}

// Setup and cleanup keyboard event listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  // Check reduced motion preference
  prefersReducedMotion.value = checkReducedMotion()
  // Listen for changes
  if (typeof window.matchMedia === 'function') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleMotionChange)
  }
})

// 🎯 Flexy: Modular easing values for tooltip transitions
const tooltipEasing = computed(() => EASING.MATERIAL_STANDARD)

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  clearUndoState()
})
</script>

<style scoped>
/* Filter chip base styles */
.filter-chip {
  @apply relative inline-flex items-center px-3 py-1.5 text-sm rounded-full border transition-all duration-200 ease-out overflow-hidden;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-1;
}

/* Remove icon container */
.remove-icon {
  @apply ml-2 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity;
}

/* Shimmer effect on hover */
.shimmer-effect {
  @apply absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Color variants */
.filter-chip-blue {
  @apply bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 focus:ring-blue-500;
}

.filter-chip-gray {
  @apply bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 focus:ring-gray-500;
}

.filter-chip-green {
  @apply bg-green-50 text-green-700 border-green-200 hover:bg-green-100 focus:ring-green-500;
}

.filter-chip-purple {
  @apply bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 focus:ring-purple-500;
}

.filter-chip-orange {
  @apply bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 focus:ring-orange-500;
}

.filter-chip-pink {
  @apply bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 focus:ring-pink-500;
}

.filter-chip-teal {
  @apply bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 focus:ring-teal-500;
}

.filter-chip-indigo {
  @apply bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 focus:ring-indigo-500;
}

/* Undo filter chip styles - Flexy hates hardcoded values! */
.filter-chip-undo {
  @apply relative bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 focus:ring-amber-500;
  @apply overflow-hidden;
  animation: undo-chip-in
    v-bind('animationConfig?.cssAnimations?.standardDurationSec ?? "0.3s"')
    v-bind(
      'easingConfig?.cubicBezier?.standard ?? "cubic-bezier(0.4, 0, 0.2, 1)"'
    );
}

/* Progress bar for undo countdown */
.undo-progress-bar {
  @apply absolute bottom-0 left-0 h-0.5 transition-all duration-300 ease-out;
}

@keyframes undo-chip-in {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-4px);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Spring Physics Micro-UX - Palette's delightful touch!
   Adds tactile spring physics animations for satisfying interactions */

/* Base spring physics chip styles */
.filter-chip.spring-physics {
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
}

/* Pressed state - immediate scale down */
.filter-chip.spring-physics.is-pressed {
  transform: scale(
    v-bind('animationConfig?.filterChipSpring?.pressScale ?? 0.95')
  );
  transition: transform
    v-bind('animationConfig?.cssTransitions?.fastSec ?? "0.1s"') ease-out;
}

/* Exiting state - spring physics exit animation */
.filter-chip.spring-physics.is-exiting {
  transform: translateX(
      v-bind(
        'animationConfig?.filterChipSpring?.removeTranslateXPx ?? 100 + "px"'
      )
    )
    rotate(
      v-bind(
        'animationConfig?.filterChipSpring?.removeRotationDeg ?? 10 + "deg"'
      )
    )
    scale(0.8);
  opacity: 0;
  /* Flexy hates hardcoded values! Using configurable easing from easingConfig */
  transition: all
    v-bind('animationConfig?.filterChipSpring?.durationSec ?? "0.3s"')
    v-bind(
      'easingConfig?.cubicBezier?.standard ?? "cubic-bezier(0.4, 0, 0.2, 1)"'
    );
}

/* Entrance animation with spring physics */
@keyframes chip-spring-enter {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(-20px);
  }
  60% {
    transform: scale(
        v-bind('animationConfig?.filterChipSpring?.enterScale ?? 1.1')
      )
      translateY(2px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Apply spring entrance to filter chips - Flexy hates hardcoded values! */
.filter-chip.spring-physics:not(.is-exiting):not(.is-pressed) {
  animation: chip-spring-enter
    v-bind('animationConfig?.filterChipSpring?.durationSec ?? "0.3s"')
    v-bind(
      'easingConfig?.cubicBezier?.bouncy ?? "cubic-bezier(0.34, 1.56, 0.64, 1)"'
    )
    forwards;
}

/* Hover enhancement with subtle lift - Flexy hates hardcoded values! */
.filter-chip.spring-physics:hover:not(.is-pressed):not(.is-exiting) {
  transform: translateY(-2px);
  transition: transform
    v-bind('animationConfig?.cssTransitions?.normalSec ?? "0.2s"')
    v-bind(
      'easingConfig?.cubicBezier?.spring ?? "cubic-bezier(0.175, 0.885, 0.32, 1.275)"'
    );
}

/* Focus state enhancement - Flexy hates hardcoded values! */
.filter-chip.spring-physics:focus-visible {
  transform: translateY(-1px) scale(1.02);
  transition: all v-bind('animationConfig?.cssTransitions?.normalSec ?? "0.2s"')
    v-bind(
      'easingConfig?.cubicBezier?.spring ?? "cubic-bezier(0.175, 0.885, 0.32, 1.275)"'
    );
}

/* Reduced motion support - disable spring physics */
@media (prefers-reduced-motion: reduce) {
  .filter-chip.spring-physics,
  .filter-chip.spring-physics.is-pressed,
  .filter-chip.spring-physics.is-exiting {
    animation: none;
    transition: opacity
      v-bind('animationConfig?.cssTransitions?.normalSec ?? "0.2s"') ease-out;
    transform: none;
  }
}

/* Vue Transition Group animations with Spring Physics */

/* Enter transition - smooth fade and scale up - Flexy hates hardcoded values! */
.filter-chip-enter-active {
  transition: all
    v-bind('animationConfig?.cssAnimations?.standardDurationSec ?? "0.3s"')
    v-bind(
      'easingConfig?.cubicBezier?.bouncy ?? "cubic-bezier(0.34, 1.56, 0.64, 1)"'
    );
}

.filter-chip-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-12px);
}

/* Leave transition - spring physics with anticipation - Flexy hates hardcoded values! */
.filter-chip-leave-active {
  position: absolute;
  transition: all
    v-bind('animationConfig?.cssTransitions?.slowerSec ?? "0.35s"')
    v-bind(
      'easingConfig?.cubicBezier?.bouncy ?? "cubic-bezier(0.34, 1.56, 0.64, 1)"'
    );
}

/* Anticipation phase - brief scale up before disappearing */
.filter-chip-leave-from {
  transform: scale(1);
  opacity: 1;
}

/* Final state - shrink and fade with slight overshoot */
.filter-chip-leave-to {
  opacity: 0;
  transform: scale(0.75) translateX(-8px);
}

/* Staggered sibling movement - create fluid feel as chips reposition - Flexy hates hardcoded values! */
.filter-chip-move {
  transition: transform
    v-bind('animationConfig?.cssAnimations?.mediumDurationSec ?? "0.4s"')
    v-bind(
      'easingConfig?.cubicBezier?.bouncy ?? "cubic-bezier(0.34, 1.56, 0.64, 1)"'
    );
}

/* Reduced motion support - disable spring physics */
@media (prefers-reduced-motion: reduce) {
  .filter-chip,
  .remove-icon,
  .shimmer-effect {
    transition: none !important;
    animation: none !important;
  }

  .filter-chip-enter-active,
  .filter-chip-leave-active,
  .filter-chip-move {
    transition: opacity
      v-bind('animationConfig?.cssTransitions?.fastSec ?? "0.1s"') ease-out !important;
  }

  .filter-chip-enter-from,
  .filter-chip-leave-to {
    transform: none !important;
  }

  .shimmer-effect {
    display: none;
  }
}

/* Focus styles enhancement */
.filter-chip:focus-visible {
  @apply ring-2 ring-offset-1;
}

/* Active state for tactile feedback */
.filter-chip:active {
  transform: scale(0.96);
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

/* Enhanced keyboard focus styles */
.filter-chip:focus-visible {
  @apply ring-2 ring-offset-2 ring-blue-500 outline-none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* Keyboard navigation tooltip */
.filter-chip::after {
  content: 'Press Delete to remove';
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) scale(0.9);
  padding: 6px 10px;
  background-color: rgba(17, 24, 39, 0.9);
  color: white;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  border-radius: 6px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s v-bind('tooltipEasing');
  pointer-events: none;
  z-index: v-bind('zIndexConfig.tooltip');
  box-shadow: v-bind('shadowsConfig.activeFilters.default');
}

/* Tooltip arrow */
.filter-chip::before {
  content: '';
  position: absolute;
  bottom: calc(100% + 3px);
  left: 50%;
  transform: translateX(-50%) scale(0.9);
  border-width: 5px;
  border-style: solid;
  border-color: rgba(17, 24, 39, 0.9) transparent transparent transparent;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s v-bind('tooltipEasing');
  pointer-events: none;
  z-index: v-bind('zIndexConfig.tooltip');
}

/* Show tooltip on focus */
.filter-chip:focus-visible::after,
.filter-chip:focus-visible::before {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) scale(1);
}

/* Also show tooltip on hover for mouse users */
@media (hover: hover) {
  .filter-chip:hover::after,
  .filter-chip:hover::before {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) scale(1);
  }
}

/* Hide tooltip when user is navigating with mouse after keyboard use */
.filter-chip:focus:not(:focus-visible)::after,
.filter-chip:focus:not(:focus-visible)::before {
  opacity: 0;
  visibility: hidden;
}

/* Keyboard shortcut hint in tooltip */
.filter-chip[data-has-keyboard-hint='true']::after {
  content: '← → Navigate  |  Delete Remove';
}

/* Enhanced active state for keyboard interaction */
.filter-chip:active {
  transform: scale(0.96);
}

/* Focus indicator animation */
@keyframes focusPulse {
  0%,
  100% {
    box-shadow: v-bind('shadowsConfig.activeFilters.focusRing.default');
  }
  50% {
    box-shadow: v-bind('shadowsConfig.activeFilters.focusRing.pulse');
  }
}

.filter-chip:focus-visible {
  animation: focusPulse
    v-bind('animationConfig?.idlePulse?.durationSec ?? "2s"') ease-in-out
    infinite;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .filter-chip::after,
  .filter-chip::before {
    transition: none;
  }

  .filter-chip:focus-visible {
    animation: none;
  }
}
</style>
