<template>
  <div class="py-12">
    <!-- Confetti celebration when clearing all bookmarks -->
    <ConfettiCelebration
      ref="confettiRef"
      intensity="light"
    />
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          My Bookmarks
        </h1>
        <p class="mt-4 text-xl text-gray-600">
          {{ bookmarkCount }} bookmarked resource<span
            v-if="bookmarkCount !== 1"
          >s</span>
        </p>
      </div>

      <!-- Empty state with animated illustration -->
      <div
        v-if="bookmarkCount === 0"
        class="text-center py-16"
        role="status"
        aria-live="polite"
      >
        <!-- Animated bookmark illustration -->
        <div
          class="relative mx-auto h-32 w-32 mb-4"
          aria-hidden="true"
        >
          <!-- Background circle with pulse -->
          <div
            class="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-full"
            :class="{ 'animate-pulse-slow': !prefersReducedMotion }"
          />

          <!-- Floating bookmark icon -->
          <div
            class="absolute inset-0 flex items-center justify-center"
            :class="{ 'animate-float-gentle': !prefersReducedMotion }"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-20 w-20 text-gray-300"
              :class="{ 'animate-heartbeat': !prefersReducedMotion }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>

          <!-- Decorative sparkles -->
          <div
            v-if="!prefersReducedMotion"
            class="absolute top-2 right-4 w-3 h-3 text-yellow-400 animate-sparkle"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 2l1.5 4.5h4.5l-3.75 2.75 1.5 4.5-3.75-2.75-3.75 2.75 1.5-4.5-3.75-2.75h4.5z"
              />
            </svg>
          </div>
          <div
            v-if="!prefersReducedMotion"
            class="absolute bottom-4 left-2 w-2 h-2 text-yellow-400 animate-sparkle-delayed"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 2l1.5 4.5h4.5l-3.75 2.75 1.5 4.5-3.75-2.75-3.75 2.75 1.5-4.5-3.75-2.75h4.5z"
              />
            </svg>
          </div>
        </div>

        <h3 class="mt-4 text-xl font-medium text-gray-900">
          No bookmarks yet
        </h3>
        <p class="mt-2 text-gray-600 max-w-md mx-auto">
          Save your favorite resources for quick access later. Click the
          <span class="inline-flex items-center mx-1 text-yellow-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </span>
          icon on any resource card to bookmark it.
        </p>

        <!-- CTA with animated arrow -->
        <div class="mt-8">
          <NuxtLink
            to="/"
            class="group inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            Browse Resources
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </NuxtLink>
        </div>

        <!-- Pro tip -->
        <div
          v-if="!prefersReducedMotion"
          class="mt-8 inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-sm text-blue-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-2 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            />
          </svg>
          Pro tip: Use the bookmark button on resource cards to save favorites
        </div>
      </div>

      <!-- Bookmarks content -->
      <div v-else>
        <!-- Controls -->
        <div class="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-700">
              Showing {{ getAllBookmarks.length }} bookmarked resource<span
                v-if="getAllBookmarks.length !== 1"
              >s</span>
            </div>
          </div>
          <div class="flex space-x-3">
            <button
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              @click="exportBookmarks"
            >
              Export
            </button>
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
              mode="out-in"
            >
              <div
                v-if="showClearConfirmation"
                key="confirmation"
                class="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-md px-3 py-2"
                role="alert"
                aria-live="polite"
              >
                <span
                  class="text-sm text-red-700 font-medium whitespace-nowrap"
                >
                  Delete {{ bookmarkCount }} bookmark<span
                    v-if="bookmarkCount !== 1"
                  >s</span>?
                </span>
                <button
                  class="text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-colors"
                  @click="handleCancelClear"
                >
                  Cancel
                </button>
                <button
                  class="text-sm text-red-700 font-medium px-2 py-1 rounded bg-red-100 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-colors"
                  @click="handleConfirmClear"
                >
                  Delete
                </button>
              </div>
              <button
                v-else
                key="clear-button"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                @click="handleClearClick"
              >
                Clear All
              </button>
            </Transition>
          </div>
        </div>

        <!-- Bookmarks grid -->
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <LazyResourceCard
            v-for="bookmark in getAllBookmarks"
            :id="bookmark.id"
            :key="bookmark.id"
            :title="bookmark.title"
            :description="bookmark.description"
            :benefits="['Bookmarked resource']"
            :url="bookmark.url"
            :button-label="'Visit Resource'"
            :date-added="bookmark.dateAdded"
          >
            <template #actions>
              <button
                class="text-red-500 hover:text-red-700"
                :aria-label="`Remove ${bookmark.title} from bookmarks`"
                title="Remove bookmark"
                @click="removeBookmark(bookmark.id)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </template>
          </LazyResourceCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBookmarks } from '~/composables/useBookmarks'
import ConfettiCelebration from '~/components/ConfettiCelebration.vue'

// Respect user's motion preferences for accessibility
const prefersReducedMotion = computed(() => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

// Set page-specific meta tags
useSeoMeta({
  title: 'My Bookmarks - Free Stuff on Internet',
  ogTitle: 'My Bookmarks - Free Stuff on Internet',
  description: 'View and manage your bookmarked resources.',
  ogDescription: 'View and manage your bookmarked resources.',
})

definePageMeta({
  layout: 'default',
})

const confettiRef = ref<InstanceType<typeof ConfettiCelebration> | null>(null)

const {
  getAllBookmarks,
  bookmarkCount,
  removeBookmark,
  exportBookmarks,
  clearBookmarks,
} = useBookmarks()

// Confirmation state for clearing all bookmarks
const showClearConfirmation = ref(false)

const handleClearClick = () => {
  showClearConfirmation.value = true
}

const handleCancelClear = () => {
  showClearConfirmation.value = false
}

const handleConfirmClear = () => {
  clearBookmarks()
  showClearConfirmation.value = false
  // Trigger confetti celebration - Palette's delightful micro-UX touch!
  setTimeout(() => {
    confettiRef.value?.celebrate()
  }, 100)
}
</script>

<style scoped>
/* Gentle floating animation for bookmark icon */
@keyframes float-gentle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.animate-float-gentle {
  animation: float-gentle 3s ease-in-out infinite;
}

/* Heartbeat animation for the bookmark icon */
@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.05);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(1);
  }
}

.animate-heartbeat {
  animation: heartbeat 2s ease-in-out infinite;
}

/* Slow pulse for background circle */
@keyframes pulse-slow {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

/* Sparkle animation for decorative elements */
@keyframes sparkle {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(0.8) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) rotate(180deg);
  }
}

.animate-sparkle {
  animation: sparkle 3s ease-in-out infinite;
}

.animate-sparkle-delayed {
  animation: sparkle 3s ease-in-out infinite;
  animation-delay: 1.5s;
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .animate-float-gentle,
  .animate-heartbeat,
  .animate-pulse-slow,
  .animate-sparkle,
  .animate-sparkle-delayed {
    animation: none;
  }
}
</style>
