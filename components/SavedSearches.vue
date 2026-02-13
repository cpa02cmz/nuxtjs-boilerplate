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
        class="saved-search-item flex items-center justify-between p-2 rounded-lg transition-all duration-200 ease-out group"
        :class="{
          'bg-gray-50': clickedIndex === index,
          'hover:bg-gray-50': clickedIndex !== index,
        }"
      >
        <div class="flex-1 min-w-0">
          <Tooltip
            :content="search.query"
            position="top"
            :delay="animationConfig.tooltip.showDelayMs"
            :disabled="!isQueryTruncated(search)"
          >
            <button
              ref="searchButtonRefs"
              class="saved-search-button text-left text-sm text-gray-800 truncate hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded px-1 -ml-1 transition-all duration-200 relative"
              :class="{
                'scale-[0.98]': clickedIndex === index,
                'text-blue-600': activeSearch === search.query,
              }"
              :title="`Search: ${search.query}`"
              :aria-label="`Use saved search: ${search.name || search.query}`"
              @click="handleUseSavedSearch(search, index, $event)"
              @keydown="handleKeydown($event, index)"
            >
              <!-- Ripple effect on click -->
              <span
                v-if="ripples[index]"
                class="absolute inset-0 pointer-events-none overflow-hidden rounded"
                aria-hidden="true"
              >
                <span
                  class="absolute rounded-full bg-blue-400 opacity-30 animate-ripple"
                  :style="{
                    left: `${ripples[index].x}px`,
                    top: `${ripples[index].y}px`,
                    width: `${ripples[index].size}px`,
                    height: `${ripples[index].size}px`,
                  }"
                />
              </span>
              <span class="relative z-10">{{
                search.name || search.query
              }}</span>
              <!-- Active indicator dot -->
              <span
                v-if="activeSearch === search.query"
                class="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse-subtle"
                aria-hidden="true"
              />
            </button>
          </Tooltip>
          <p class="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <span>{{ formatDate(search.createdAt) }}</span>
            <!-- Copy button for quick access -->
            <button
              class="copy-button opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 p-1 rounded hover:bg-gray-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
              :aria-label="`Copy search query: ${search.query}`"
              :title="contentConfig.savedSearches.tooltip.copyQuery"
              @click.stop="copySearchQuery(search.query, index)"
            >
              <svg
                class="w-3 h-3 text-gray-500"
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
            </button>
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

    <!-- Copy feedback toast -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="showCopyFeedback"
        class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
        role="status"
        aria-live="polite"
      >
        <svg
          class="w-4 h-4 text-green-400"
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
        <span class="text-sm">{{
          contentConfig.savedSearches.toast.copied
        }}</span>
      </div>
    </Transition>

    <!-- Screen reader announcements -->
    <div
      class="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ announcement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNuxtApp } from '#app'
import Tooltip from '~/components/Tooltip.vue'
import { contentConfig } from '~/configs/content.config'
import { uiConfig } from '~/configs/ui.config'
import { animationConfig } from '~/configs/animation.config'
import { EASING } from '~/configs/easing.config'
import { hapticLight, hapticSuccess } from '~/utils/hapticFeedback'

interface SavedSearch {
  name: string
  query: string
  createdAt: Date
}

interface Props {
  savedSearches?: SavedSearch[]
  activeSearch?: string
}

interface Emits {
  (event: 'use-saved-search', search: SavedSearch): void
  (event: 'remove-saved-search', query: string): void
  (event: 'undo-delete', search: SavedSearch): void
}

withDefaults(defineProps<Props>(), {
  savedSearches: () => [],
  activeSearch: '',
})

const emit = defineEmits<Emits>()

// Track recently deleted searches for undo functionality
const recentlyDeleted = ref<SavedSearch[]>([])
const undoTimeouts = ref<Map<string, ReturnType<typeof setTimeout>>>(new Map())

// Micro-UX state
const clickedIndex = ref<number | null>(null)
const ripples = ref<{ [key: number]: { x: number; y: number; size: number } }>(
  {}
)
const searchButtonRefs = ref<HTMLButtonElement[]>([])
const showCopyFeedback = ref(false)
const announcement = ref('')
let copyFeedbackTimeout: ReturnType<typeof setTimeout> | null = null

const { $toast } = useNuxtApp()

// Check if query is likely truncated (simplified check)
const isQueryTruncated = (search: SavedSearch): boolean => {
  const displayText = search.name || search.query
  return displayText.length > 25
}

// Handle use saved search with haptic feedback and ripple effect
const handleUseSavedSearch = (
  search: SavedSearch,
  index: number,
  event: MouseEvent
) => {
  const button = event.currentTarget as HTMLButtonElement
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height) * 1.5

  // Create ripple effect
  ripples.value[index] = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    size,
  }

  // Click feedback animation
  clickedIndex.value = index
  setTimeout(() => {
    clickedIndex.value = null
  }, 150)

  // Remove ripple after animation
  setTimeout(() => {
    delete ripples.value[index]
  }, 600)

  // Haptic feedback
  hapticLight()

  // Announce to screen readers
  announcement.value = `Loading saved search: ${search.name || search.query}`
  setTimeout(() => {
    announcement.value = ''
  }, 1000)

  emit('use-saved-search', search)
}

// Copy search query to clipboard
const copySearchQuery = async (query: string, _index: number) => {
  try {
    await navigator.clipboard.writeText(query)

    // Show copy feedback
    showCopyFeedback.value = true

    // Haptic feedback for success
    hapticSuccess()

    // Announce to screen readers
    announcement.value = `Search query copied: ${query}`
    setTimeout(() => {
      announcement.value = ''
    }, 1000)

    // Clear any existing timeout
    if (copyFeedbackTimeout) {
      clearTimeout(copyFeedbackTimeout)
    }

    // Hide feedback after delay
    copyFeedbackTimeout = setTimeout(() => {
      showCopyFeedback.value = false
    }, uiConfig.toast.duration.success)
  } catch {
    // Silent fail - clipboard API might not be available
    announcement.value = 'Failed to copy search query'
    setTimeout(() => {
      announcement.value = ''
    }, 1000)
  }
}

// Enhanced keyboard navigation
const handleKeydown = (event: KeyboardEvent, currentIndex: number) => {
  const buttons = searchButtonRefs.value
  if (!buttons.length) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (currentIndex < buttons.length - 1) {
        buttons[currentIndex + 1]?.focus()
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (currentIndex > 0) {
        buttons[currentIndex - 1]?.focus()
      }
      break
    case 'Home':
      event.preventDefault()
      buttons[0]?.focus()
      break
    case 'End':
      event.preventDefault()
      buttons[buttons.length - 1]?.focus()
      break
    case 'Delete':
    case 'Backspace':
      // Allow parent to handle deletion
      break
  }
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
</script>

<style scoped>
/* Saved search item styles */
.saved-search-item {
  position: relative;
}

/* Saved search button styles */
.saved-search-button {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Copy button hover enhancement */
.copy-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateX(-4px);
}

.group:hover .copy-button,
.copy-button:focus {
  opacity: 1;
  transform: translateX(0);
}

.copy-button:hover {
  transform: scale(1.1);
}

/* Ripple animation */
@keyframes ripple {
  to {
    transform: translate(-50%, -50%) scale(4);
    opacity: 0;
  }
}

.animate-ripple {
  animation: ripple 0.6s ease-out forwards;
  transform: translate(-50%, -50%) scale(0);
}

/* Subtle pulse animation for active indicator */
@keyframes pulse-subtle {
  0%,
  100% {
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }
  50% {
    opacity: 0.7;
    transform: translateY(-50%) scale(1.2);
  }
}

.animate-pulse-subtle {
  animation: pulse-subtle 2s ease-in-out infinite;
}

/* Scale feedback for click */
.scale-98 {
  transform: scale(0.98);
}

/* Smooth entry and exit animations for saved search items */
.saved-search-enter-active,
.saved-search-leave-active {
  transition: all 0.3s v-bind('EASING.MATERIAL_STANDARD');
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
  transition: transform 0.3s v-bind('EASING.MATERIAL_STANDARD');
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

/* Respect reduced motion preferences for accessibility */
@media (prefers-reduced-motion: reduce) {
  .saved-search-enter-active,
  .saved-search-leave-active,
  .saved-search-move,
  .animate-ripple,
  .animate-pulse-subtle {
    transition: none;
    animation: none;
  }

  .saved-search-enter-from,
  .saved-search-leave-to {
    opacity: 0;
    transform: none;
  }

  .copy-button {
    opacity: 1;
    transform: none;
  }
}

/* Reduced motion - hide decorative elements */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse-subtle {
    display: none;
  }
}
</style>
