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
      @before-leave="handleBeforeLeave"
    >
      <div
        v-for="search in savedSearches"
        :key="search.query"
        class="saved-search-item group relative flex items-center justify-between p-2 rounded-lg overflow-hidden"
        :class="{
          'is-pressed': pressedItem === search.query && !prefersReducedMotion,
          'is-deleting': deletingItems.has(search.query),
          'is-restoring': restoringItem === search.query,
        }"
        :data-query="search.query"
        @mouseenter="hoveredItem = search.query"
        @mouseleave="hoveredItem = null"
        @mousedown="handlePressStart(search.query)"
        @mouseup="handlePressEnd(search.query)"
        @mouseleave.passive="handlePressEnd(search.query)"
        @touchstart="handlePressStart(search.query)"
        @touchend="handlePressEnd(search.query)"
      >
        <!-- Palette's micro-UX enhancement: Shimmer sweep effect on hover -->
        <span
          v-if="hoveredItem === search.query && !prefersReducedMotion"
          class="shimmer-sweep"
          aria-hidden="true"
        />

        <div class="flex-1 min-w-0 relative z-10">
          <button
            class="saved-search-button text-left text-sm text-gray-800 truncate focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded px-1 -ml-1 transition-colors duration-200"
            :title="`Search: ${search.query}`"
            :aria-label="`Use saved search: ${search.name || search.query}`"
            @click="onUseSavedSearch(search)"
          >
            <span class="flex items-center gap-2">
              <!-- Search icon -->
              <svg
                class="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span
                class="group-hover:text-blue-600 transition-colors duration-200"
              >
                {{ search.name || search.query }}
              </span>
            </span>
          </button>
          <p class="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <svg
              class="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ formatDate(search.createdAt) }}
          </p>
        </div>

        <!-- Delete button with Palette's micro-UX enhancements -->
        <button
          class="delete-button ml-2 p-2.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 relative z-10"
          :class="{
            'is-pressed': deletePressed && activeDeleteItem === search.query,
          }"
          :aria-label="`Remove saved search: ${search.query}`"
          @click.stop="onRemoveSavedSearch(search)"
          @mousedown="handleDeletePress(search.query)"
          @mouseup="handleDeleteRelease"
          @mouseleave="handleDeleteRelease"
          @touchstart="handleDeletePress(search.query)"
          @touchend="handleDeleteRelease"
        >
          <svg
            class="w-4 h-4 pointer-events-none transition-all duration-200"
            :class="{
              'text-gray-400 group-hover:text-red-400': !deletePressed,
              'text-red-500':
                deletePressed && activeDeleteItem === search.query,
            }"
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

    <!-- Palette's micro-UX enhancement: Restore notification with undo action -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="lastDeletedSearch"
        class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between"
      >
        <div class="flex items-center gap-2 text-sm text-amber-800">
          <svg
            class="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            {{ restorePromptText }}
          </span>
        </div>
        <button
          class="restore-button text-sm font-medium text-amber-700 hover:text-amber-900 px-3 py-1 rounded-md hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1 transition-all duration-200"
          @click="restoreLastDeleted"
        >
          <span class="flex items-center gap-1">
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
            {{ contentConfig.savedSearches.restoreButton }}
          </span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { contentConfig } from '~/configs/content.config'
import { uiConfig } from '~/configs/ui.config'
import { EASING } from '~/configs/easing.config'
import { animationConfig } from '~/configs/animation.config'
import { hapticLight, hapticError, hapticSuccess } from '~/utils/hapticFeedback'

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

withDefaults(defineProps<Props>(), {
  savedSearches: () => [],
})

const emit = defineEmits<Emits>()

// Palette's micro-UX enhancement: Track interaction states for delightful animations
const hoveredItem = ref<string | null>(null)
const pressedItem = ref<string | null>(null)
const deletingItems = ref<Set<string>>(new Set())
const restoringItem = ref<string | null>(null)
const deletePressed = ref(false)
const activeDeleteItem = ref<string | null>(null)

// Check for reduced motion preference
const prefersReducedMotion = ref(false)
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()
})

// Track recently deleted searches for undo functionality
const recentlyDeleted = ref<SavedSearch[]>([])
const undoTimeouts = ref<Map<string, ReturnType<typeof setTimeout>>>(new Map())

// Palette's micro-UX enhancement: Track the last deleted search for quick restore
const lastDeletedSearch = computed(
  () => recentlyDeleted.value[recentlyDeleted.value.length - 1] || null
)

// Palette's micro-UX enhancement: Computed restore prompt text
const restorePromptText = computed(() => {
  if (!lastDeletedSearch.value) return ''
  const name = lastDeletedSearch.value.name || lastDeletedSearch.value.query
  return contentConfig.savedSearches.restorePrompt.replace('{{name}}', name)
})

const { $toast } = useNuxtApp()

// Palette's micro-UX enhancement: Spring physics press effect handlers
const handlePressStart = (query: string) => {
  if (prefersReducedMotion.value) return
  pressedItem.value = query
}

const handlePressEnd = (query: string) => {
  if (pressedItem.value === query) {
    pressedItem.value = null
  }
}

// Palette's micro-UX enhancement: Delete button press effect handlers
const handleDeletePress = (query: string) => {
  if (prefersReducedMotion.value) return
  deletePressed.value = true
  activeDeleteItem.value = query
}

const handleDeleteRelease = () => {
  deletePressed.value = false
  activeDeleteItem.value = null
}

const onUseSavedSearch = (search: SavedSearch) => {
  // Palette's micro-UX enhancement: Haptic feedback when using saved search
  hapticLight()
  emit('use-saved-search', search)
}

// Palette's micro-UX enhancement: Handle before leave animation
const handleBeforeLeave = (el: Element) => {
  const htmlEl = el as HTMLElement
  const { width, height } = htmlEl.getBoundingClientRect()
  htmlEl.style.width = `${width}px`
  htmlEl.style.height = `${height}px`
}

const onRemoveSavedSearch = (search: SavedSearch) => {
  // Palette's micro-UX enhancement: Add to deleting set for animation
  deletingItems.value.add(search.query)

  // Haptic feedback for deletion
  hapticError()

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
    // Remove from deleting set after animation
    deletingItems.value.delete(search.query)
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

// Palette's micro-UX enhancement: Restore last deleted search
const restoreLastDeleted = () => {
  if (!lastDeletedSearch.value) return

  const search = lastDeletedSearch.value

  // Set restoring state for animation
  restoringItem.value = search.query

  // Haptic feedback for restore
  hapticSuccess()

  // Clear timeout and remove from deleted list
  const timeout = undoTimeouts.value.get(search.query)
  if (timeout) {
    clearTimeout(timeout)
    undoTimeouts.value.delete(search.query)
  }

  recentlyDeleted.value = recentlyDeleted.value.filter(
    s => s.query !== search.query
  )

  // Clear restoring state after animation
  setTimeout(() => {
    restoringItem.value = null
  }, 500)

  // Emit undo event
  emit('undo-delete', search)
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
</script>

<style scoped>
/* Palette's micro-UX enhancement: Saved search item base styles */
.saved-search-item {
  background: transparent;
  transition:
    background-color v-bind('animationConfig.cssTransitions.normalSec') ease-out,
    transform v-bind('animationConfig.cssTransitions.fastSec') ease-out;
  cursor: pointer;
}

.saved-search-item:hover {
  background-color: rgb(249, 250, 251); /* gray-50 */
}

/* Palette's micro-UX enhancement: Spring physics press effect */
.saved-search-item.is-pressed {
  transform: scale(0.98);
  transition: transform v-bind('animationConfig.cssTransitions.fastSec')
    ease-out;
}

/* Palette's micro-UX enhancement: Delete animation with slide-out */
.saved-search-item.is-deleting {
  animation: slide-out-delete
    v-bind('animationConfig.cssAnimations.standardDurationSec')
    v-bind('EASING.MATERIAL_STANDARD') forwards;
}

@keyframes slide-out-delete {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(20px) scale(0.95);
  }
}

/* Palette's micro-UX enhancement: Restore animation with bounce-in */
.saved-search-item.is-restoring {
  animation: bounce-in-restore
    v-bind('animationConfig.cssAnimations.standardDurationSec')
    v-bind('EASING.SPRING_SNAPPY') forwards;
}

@keyframes bounce-in-restore {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-10px);
  }
  60% {
    transform: scale(1.02) translateY(2px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Palette's micro-UX enhancement: Shimmer sweep effect on hover */
.shimmer-sweep {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: shimmer-sweep
    v-bind('animationConfig.cssAnimations.sweepDurationSec') ease-in-out;
  pointer-events: none;
  z-index: 1;
}

@keyframes shimmer-sweep {
  0% {
    left: -100%;
  }
  100% {
    left: 200%;
  }
}

/* Saved search button styles */
.saved-search-button {
  position: relative;
}

.saved-search-button:hover {
  color: rgb(75, 85, 99); /* gray-600 */
}

/* Delete button styles */
.delete-button {
  transition: all v-bind('animationConfig.cssTransitions.fastSec') ease-out;
  background: transparent;
}

.delete-button:hover {
  background-color: rgb(254, 242, 242); /* red-50 */
}

.delete-button.is-pressed {
  transform: scale(0.9);
  background-color: rgb(254, 226, 226); /* red-100 */
}

/* Restore button styles */
.restore-button {
  transition: all v-bind('animationConfig.cssTransitions.fastSec') ease-out;
}

.restore-button:hover {
  background-color: rgb(254, 243, 199); /* amber-100 */
}

.restore-button:active {
  transform: scale(0.95);
}

/* Smooth entry and exit animations for saved search items */
.saved-search-enter-active,
.saved-search-leave-active {
  transition: all v-bind('animationConfig.cssTransitions.standardSec')
    v-bind('EASING.MATERIAL_STANDARD');
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
  .saved-search-item,
  .saved-search-item:hover,
  .saved-search-item.is-pressed,
  .delete-button,
  .restore-button {
    transition: none;
    transform: none;
    animation: none;
  }

  .shimmer-sweep {
    display: none;
  }

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
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .saved-search-item:hover {
    outline: 2px solid currentColor;
    outline-offset: -2px;
  }

  .delete-button:hover,
  .restore-button:hover {
    outline: 2px solid currentColor;
  }
}
</style>
