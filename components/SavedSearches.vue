<template>
  <div
    v-if="savedSearches.length > 0 || recentlyDeleted.length > 0"
    class="mb-6"
  >
    <h4 class="text-sm font-medium text-gray-900 mb-3">
      {{ contentConfig.search.suggestions.recentTitle }}
    </h4>
    <TransitionGroup
      name="saved-search"
      tag="div"
      class="space-y-2"
    >
      <div
        v-for="(search, index) in savedSearches"
        :key="search.query"
        class="saved-search-item"
        :class="{
          'saved-search-item--new': isRecentlySaved(search.query),
          'saved-search-item--celebrating': isCelebrating(search.query),
        }"
        :style="getItemStyle(index)"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <button
              class="text-left text-sm text-gray-800 truncate hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded px-1 -ml-1 transition-colors duration-200"
              :title="`Search: ${search.query}`"
              :aria-label="`Use saved search: ${search.name || search.query}`"
              @click="onUseSavedSearch(search)"
            >
              {{ search.name || search.query }}
            </button>
            <!-- Palette's micro-UX: "New" badge for recently saved searches -->
            <span
              v-if="isRecentlySaved(search.query) && !prefersReducedMotion"
              class="new-badge"
              role="status"
              aria-label="Recently saved"
            >
              <span class="new-badge__text">New</span>
              <span
                class="new-badge__sparkle"
                aria-hidden="true"
              />
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            {{ formatDate(search.createdAt) }}
          </p>
        </div>
        <!-- Delete button with larger click target (44x44px) and improved accessibility -->
        <button
          class="ml-2 p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 rounded-full transition-all duration-200 ease-out"
          :aria-label="`Remove saved search: ${search.query}`"
          @click="onRemoveSavedSearch(search)"
        >
          <svg
            class="w-4 h-4 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
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
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNuxtApp } from '#app'
import { contentConfig } from '~/configs/content.config'
import { uiConfig } from '~/configs/ui.config'
import { EASING } from '~/configs/easing.config'
import { animationConfig } from '~/configs/animation.config'
import { hapticSuccess } from '~/utils/hapticFeedback'

interface SavedSearch {
  name: string
  query: string
  createdAt: Date
}

interface Props {
  savedSearches?: SavedSearch[]
}

interface Emits {
  (event: 'use-saved-search', search: SavedSearch): void
  (event: 'remove-saved-search', query: string): void
  (event: 'undo-delete', search: SavedSearch): void
}

// Props destructured for potential future use
withDefaults(defineProps<Props>(), {
  savedSearches: () => [],
})

const emit = defineEmits<Emits>()

// Track recently deleted searches for undo functionality
const recentlyDeleted = ref<SavedSearch[]>([])
const undoTimeouts = ref<Map<string, ReturnType<typeof setTimeout>>>(new Map())

// Palette's micro-UX enhancement: Track recently saved searches for "New" badge
const recentlySavedQueries = ref<Set<string>>(new Set())
const celebratingQueries = ref<Set<string>>(new Set())
const newBadgeTimeouts = ref<Map<string, ReturnType<typeof setTimeout>>>(
  new Map()
)
const celebrationTimeouts = ref<Map<string, ReturnType<typeof setTimeout>>>(
  new Map()
)

// Palette's micro-UX enhancement: Respect reduced motion preference
const prefersReducedMotion = ref(false)

const { $toast } = useNuxtApp()

// Get saved searches config
const savedSearchConfig = computed(() => animationConfig.savedSearches)

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function'
  ) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }
  return undefined
}

// Check if a search was recently saved (for "New" badge)
const isRecentlySaved = (query: string): boolean => {
  return recentlySavedQueries.value.has(query)
}

// Check if a search is currently celebrating
const isCelebrating = (query: string): boolean => {
  return celebratingQueries.value.has(query)
}

// Get staggered animation delay for each item
const getItemStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}
  const delay = index * savedSearchConfig.value.entranceStaggerMs
  return { '--item-stagger-delay': `${delay}ms` } as Record<string, string>
}

const onUseSavedSearch = (search: SavedSearch) => {
  emit('use-saved-search', search)
}

/**
 * Palette's micro-UX enhancement: Trigger celebration animation when a search is saved
 * Call this method from parent when a new search is saved
 */
const celebrateNewSave = (query: string) => {
  // Clear any existing timeouts for this query
  const existingBadgeTimeout = newBadgeTimeouts.value.get(query)
  const existingCelebrationTimeout = celebrationTimeouts.value.get(query)
  if (existingBadgeTimeout) clearTimeout(existingBadgeTimeout)
  if (existingCelebrationTimeout) clearTimeout(existingCelebrationTimeout)

  // Add to recently saved set
  recentlySavedQueries.value.add(query)

  // Trigger celebration animation
  if (!prefersReducedMotion.value) {
    celebratingQueries.value.add(query)
    hapticSuccess()
  }

  // Set timeout to end celebration animation
  const celebrationTimeout = setTimeout(() => {
    celebratingQueries.value.delete(query)
    celebrationTimeouts.value.delete(query)
  }, savedSearchConfig.value.savePopDurationMs)
  celebrationTimeouts.value.set(query, celebrationTimeout)

  // Set timeout to remove "New" badge
  const badgeTimeout = setTimeout(() => {
    recentlySavedQueries.value.delete(query)
    newBadgeTimeouts.value.delete(query)
  }, savedSearchConfig.value.newBadgeDurationMs)
  newBadgeTimeouts.value.set(query, badgeTimeout)
}

const onRemoveSavedSearch = (search: SavedSearch) => {
  // Add to recently deleted list first (for visual feedback during animation)
  recentlyDeleted.value.push(search)

  // Create toast with undo action
  if ($toast) {
    $toast.info(
      contentConfig.savedSearches.toast.deleted.replace(
        '{{name}}',
        search.name || search.query
      ),
      contentConfig.savedSearches.toast.undoHint
    )
  }

  // Emit removal event after brief delay to allow animation
  setTimeout(() => {
    emit('remove-saved-search', search.query)
  }, uiConfig.animation.leaveDurationMs)

  // Set timeout to permanently remove from undo list after configured duration
  const timeout = setTimeout(() => {
    recentlyDeleted.value = recentlyDeleted.value.filter(
      s => s.query !== search.query
    )
    undoTimeouts.value.delete(search.query)
  }, uiConfig.toast.duration.info)

  undoTimeouts.value.set(search.query, timeout)

  // Store undo callback globally for the toast action
  if (typeof window !== 'undefined') {
    window.addEventListener(
      'toast-action-undo',
      () => {
        undoDelete(search)
      },
      { once: true }
    )
  }
}

const undoDelete = (search: SavedSearch) => {
  // Clear the timeout
  const timeout = undoTimeouts.value.get(search.query)
  if (timeout) {
    clearTimeout(timeout)
    undoTimeouts.value.delete(search.query)
  }

  // Remove from recently deleted
  recentlyDeleted.value = recentlyDeleted.value.filter(
    s => s.query !== search.query
  )

  // Emit undo event to parent
  emit('undo-delete', search)
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Cleanup timeouts on unmount
let cleanupReducedMotion: (() => void) | undefined

onMounted(() => {
  cleanupReducedMotion = checkReducedMotion()
})

onUnmounted(() => {
  // Clear all timeouts
  newBadgeTimeouts.value.forEach(timeout => clearTimeout(timeout))
  celebrationTimeouts.value.forEach(timeout => clearTimeout(timeout))
  undoTimeouts.value.forEach(timeout => clearTimeout(timeout))

  if (cleanupReducedMotion) {
    cleanupReducedMotion()
  }
})

// Expose celebrateNewSave method for parent components
defineExpose({
  celebrateNewSave,
})
</script>

<style scoped>
/* Saved search item with hover glow effect */
.saved-search-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all v-bind('animationConfig.cssTransitions.standardSec')
    v-bind('EASING.MATERIAL_STANDARD');
  position: relative;
  overflow: hidden;
}

.saved-search-item:hover {
  background-color: rgb(249, 250, 251);
  box-shadow: 0 0 v-bind('savedSearchConfig.hoverGlowSpread + "px"')
    v-bind('savedSearchConfig.hoverGlowColor');
}

/* Shimmer effect for newly saved items */
.saved-search-item--new::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(59, 130, 246, 0.1),
    transparent
  );
  animation: shimmer v-bind('savedSearchConfig.shimmerDurationMs + "ms"')
    ease-out;
  pointer-events: none;
}

/* Celebration pop animation */
.saved-search-item--celebrating {
  animation: save-celebration
    v-bind('savedSearchConfig.savePopDurationMs + "ms"')
    v-bind('EASING.SPRING_STANDARD');
}

/* "New" badge styling */
.new-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border-radius: 9999px;
  animation: badge-pop
    v-bind('savedSearchConfig.badgeEntranceDurationMs + "ms"')
    v-bind('EASING.SPRING_STANDARD');
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.new-badge__text {
  position: relative;
  z-index: 1;
}

/* Sparkle effect on badge */
.new-badge__sparkle {
  position: absolute;
  top: 50%;
  right: 2px;
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  transform: translateY(-50%);
  animation: sparkle-twinkle 1.5s ease-in-out infinite;
}

.new-badge__sparkle::before,
.new-badge__sparkle::after {
  content: '';
  position: absolute;
  background: white;
  border-radius: 50%;
}

.new-badge__sparkle::before {
  width: 2px;
  height: 6px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.new-badge__sparkle::after {
  width: 6px;
  height: 2px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes save-celebration {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(v-bind('savedSearchConfig.savePopScale'));
    background-color: rgba(59, 130, 246, 0.1);
  }
  100% {
    transform: scale(1);
    background-color: transparent;
  }
}

@keyframes badge-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(v-bind('savedSearchConfig.badgePopScale'));
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes sparkle-twinkle {
  0%,
  100% {
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }
  50% {
    opacity: 0.6;
    transform: translateY(-50%) scale(0.8);
  }
}

/* Smooth entry and exit animations for saved search items */
.saved-search-enter-active,
.saved-search-leave-active {
  transition: all v-bind('savedSearchConfig.entranceDurationMs + "ms"')
    v-bind('EASING.MATERIAL_STANDARD');
  transition-delay: var(--item-stagger-delay, 0ms);
}

.saved-search-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.saved-search-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* Smooth layout transitions when items are reordered */
.saved-search-move {
  transition: transform v-bind('animationConfig.cssTransitions.standardSec')
    v-bind('EASING.MATERIAL_STANDARD');
}

/* Respect reduced motion preferences for accessibility */
@media (prefers-reduced-motion: reduce) {
  .saved-search-enter-active,
  .saved-search-leave-active,
  .saved-search-move {
    transition: none;
  }

  .saved-search-enter-from,
  .saved-search-leave-to {
    opacity: 0;
    transform: none;
  }

  .saved-search-item:hover {
    box-shadow: none;
  }

  .saved-search-item--new::before {
    display: none;
  }

  .saved-search-item--celebrating {
    animation: none;
  }

  .new-badge {
    animation: none;
  }

  .new-badge__sparkle {
    display: none;
  }
}
</style>
