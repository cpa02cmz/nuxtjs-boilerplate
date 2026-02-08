<template>
  <div
    v-if="savedSearches.length > 0 || recentlyDeleted.length > 0"
    class="mb-6"
  >
    <h4 class="text-sm font-medium text-gray-900 mb-3">Saved Searches</h4>
    <TransitionGroup name="saved-search" tag="div" class="space-y-2">
      <div
        v-for="search in savedSearches"
        :key="search.query"
        class="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200 ease-out"
      >
        <div class="flex-1 min-w-0">
          <button
            class="text-left text-sm text-gray-800 truncate hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded px-1 -ml-1 transition-colors duration-200"
            :title="`Search: ${search.query}`"
            :aria-label="`Use saved search: ${search.name || search.query}`"
            @click="onUseSavedSearch(search)"
          >
            {{ search.name || search.query }}
          </button>
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
import { ref } from 'vue'
import { useNuxtApp } from '#app'

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

// Track recently deleted searches for undo functionality
const recentlyDeleted = ref<SavedSearch[]>([])
const undoTimeouts = ref<Map<string, ReturnType<typeof setTimeout>>>(new Map())

const { $toast } = useNuxtApp()

const onUseSavedSearch = (search: SavedSearch) => {
  emit('use-saved-search', search)
}

const onRemoveSavedSearch = (search: SavedSearch) => {
  // Add to recently deleted list first (for visual feedback during animation)
  recentlyDeleted.value.push(search)

  // Create toast with undo action
  if ($toast) {
    $toast.info(
      `Saved search "${search.name || search.query}" deleted`,
      'Click undo to restore it'
    )
  }

  // Emit removal event after brief delay to allow animation
  setTimeout(() => {
    emit('remove-saved-search', search.query)
  }, 300)

  // Set timeout to permanently remove from undo list after 5 seconds
  const timeout = setTimeout(() => {
    recentlyDeleted.value = recentlyDeleted.value.filter(
      s => s.query !== search.query
    )
    undoTimeouts.value.delete(search.query)
  }, 5000)

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
/* Smooth entry and exit animations for saved search items */
.saved-search-enter-active,
.saved-search-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
}
</style>
