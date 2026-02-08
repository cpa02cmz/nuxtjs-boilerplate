<template>
  <div>
    <button
      ref="buttonRef"
      :class="[
        'flex items-center justify-center w-10 h-10 rounded-full',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500',
        'active:scale-95',
        isBookmarked
          ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100 bookmarked'
          : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100',
        isAnimating && 'animate-bounce-scale',
      ]"
      :aria-label="isBookmarked ? 'Remove bookmark' : 'Bookmark resource'"
      :title="isBookmarked ? 'Remove bookmark' : 'Bookmark resource'"
      :aria-pressed="isBookmarked"
      @click="handleBookmarkToggle"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        :class="[
          'w-5 h-5 transition-transform duration-200',
          isBookmarked ? 'fill-current' : 'stroke-current',
          isAnimating && 'animate-heart-pop',
        ]"
        :stroke-width="isBookmarked ? '0' : '1.5'"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>

    <div
      :id="`bookmark-announcement-${resourceId}`"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ bookmarkStatus }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBookmarks } from '~/composables/useBookmarks'
import { computed, ref } from 'vue'
import { uiConfig } from '~/configs/ui.config'

interface Props {
  resourceId?: string
  title?: string
  description?: string
  url?: string
}

const props = withDefaults(defineProps<Props>(), {
  resourceId: '',
  title: '',
  description: '',
  url: '',
})

const { isBookmarked: checkBookmarked, toggleBookmark } = useBookmarks()

const isBookmarked = computed(() =>
  props.resourceId ? checkBookmarked(props.resourceId) : false
)

const bookmarkStatus = ref('')
const isAnimating = ref(false)
const buttonRef = ref<HTMLButtonElement | null>(null)

const handleBookmarkToggle = () => {
  const wasBookmarked = isBookmarked.value

  // Trigger animation when adding bookmark
  if (!wasBookmarked) {
    isAnimating.value = true
    setTimeout(() => {
      isAnimating.value = false
    }, 400)
  }

  toggleBookmark({
    id: props.resourceId,
    title: props.title,
    description: props.description,
    url: props.url,
  })

  bookmarkStatus.value = wasBookmarked ? 'Bookmark removed' : 'Bookmark added'

  // Flexy hates hardcoded! Using config value from uiConfig
  setTimeout(() => {
    bookmarkStatus.value = ''
  }, uiConfig.timing.bookmarkStatusClearMs)
}
</script>

<style scoped>
/* Bookmarked state pulse animation */
.bookmarked {
  animation: subtle-pulse 2s ease-in-out infinite;
}

@keyframes subtle-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.2);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(234, 179, 8, 0);
  }
}

/* Heart pop animation when bookmarking */
.animate-heart-pop {
  animation: heart-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes heart-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

/* Bounce scale animation for button */
.animate-bounce-scale {
  animation: bounce-scale 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes bounce-scale {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(0.9);
  }
  80% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .bookmarked {
    animation: none;
  }

  .animate-heart-pop,
  .animate-bounce-scale {
    animation: none;
  }
}
</style>
