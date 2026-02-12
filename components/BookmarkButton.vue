<template>
  <div>
    <Tooltip
      :content="isBookmarked ? 'Remove from favorites' : 'Add to favorites'"
      position="top"
    >
      <button
        ref="buttonRef"
        :class="[
          'flex items-center justify-center w-10 h-10 rounded-full',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500',
          'active:scale-95 relative overflow-hidden',
          isBookmarked
            ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100 bookmarked'
            : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100',
          isAnimating && 'animate-bounce-scale',
        ]"
        :aria-label="
          isBookmarked ? 'Remove from favorites' : 'Add to favorites'
        "
        :aria-pressed="isBookmarked"
        @click="handleBookmarkToggleWithRipple"
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
            :d="iconsConfig.paths.bookmark"
          />
        </svg>
      </button>
    </Tooltip>

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
import { useRipple } from '~/composables/useRipple'
import { useNuxtApp } from '#imports'
import { computed, ref, onUnmounted, type Ref } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { iconsConfig } from '~/configs/icons.config'
import { hapticSuccess, hapticLight } from '~/utils/hapticFeedback'

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

// Timeout refs for cleanup - preventing memory leaks (Issue #1826)
let animationTimeout: ReturnType<typeof setTimeout> | null = null
let statusTimeout: ReturnType<typeof setTimeout> | null = null

// Initialize ripple effect for tactile feedback
// Flexy loves modularity! Using configurable animation duration from animationConfig
const { createRipple } = useRipple(buttonRef as Ref<HTMLButtonElement | null>, {
  color: animationConfig.ripple.bookmarkColor,
  duration: animationConfig.button.feedbackDurationMs,
})

// Flexy hates hardcoded values! Using configurable animation durations.
const { heartPopDurationMs, statusClearDelayMs } = animationConfig.bookmark

// Get toast notification system
const { $toast } = useNuxtApp()

const handleBookmarkToggle = () => {
  const wasBookmarked = isBookmarked.value

  // Trigger animation when adding bookmark - tracked for cleanup (Issue #1826)
  if (!wasBookmarked) {
    isAnimating.value = true
    if (animationTimeout) clearTimeout(animationTimeout)
    animationTimeout = setTimeout(() => {
      isAnimating.value = false
    }, heartPopDurationMs)
    // Haptic feedback for adding bookmark
    hapticSuccess()
    // Show toast notification for better UX
    $toast.success(`"${props.title}" added to favorites`)
  } else {
    // Light haptic for removing bookmark
    hapticLight()
    // Show toast notification for better UX
    $toast.info(`"${props.title}" removed from favorites`)
  }

  toggleBookmark({
    id: props.resourceId,
    title: props.title,
    description: props.description,
    url: props.url,
  })

  bookmarkStatus.value = wasBookmarked ? 'Bookmark removed' : 'Bookmark added'

  // Tracked for cleanup - preventing memory leaks (Issue #1826)
  if (statusTimeout) clearTimeout(statusTimeout)
  statusTimeout = setTimeout(() => {
    bookmarkStatus.value = ''
  }, statusClearDelayMs)
}

// Cleanup timeouts on unmount - preventing memory leaks (Issue #1826)
onUnmounted(() => {
  if (animationTimeout) clearTimeout(animationTimeout)
  if (statusTimeout) clearTimeout(statusTimeout)
})

// Handle click with ripple effect - Palette's micro-UX touch!
const handleBookmarkToggleWithRipple = (event: MouseEvent) => {
  // Create ripple effect first
  createRipple(event)

  // Then handle the bookmark toggle
  handleBookmarkToggle()
}
</script>

<style scoped>
/* Bookmarked state pulse animation - Flexy hates hardcoded values! */
.bookmarked {
  animation: subtle-pulse
    v-bind('`${animationConfig.bookmark.pulseDurationSec}s`') ease-in-out
    infinite;
}

@keyframes subtle-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0
      rgba(
        234,
        179,
        8,
        v-bind('animationConfig.bookmark.pulseShadow.startOpacity')
      );
  }
  50% {
    box-shadow: 0 0 0
      v-bind('`${animationConfig.bookmark.pulseShadow.endSpread}px`')
      rgba(234, 179, 8, 0);
  }
}

/* Heart pop animation when bookmarking */
.animate-heart-pop {
  animation: heart-pop
    v-bind('`${animationConfig.bookmark.heartPopDurationMs}ms`')
    cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes heart-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(v-bind('animationConfig.bookmark.heartPopScale'));
  }
  100% {
    transform: scale(1);
  }
}

/* Bounce scale animation for button */
.animate-bounce-scale {
  animation: bounce-scale
    v-bind('`${animationConfig.bookmark.bounceScaleDurationMs}ms`')
    cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes bounce-scale {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(v-bind('animationConfig.bookmark.bounceScale.shrink'));
  }
  80% {
    transform: scale(v-bind('animationConfig.bookmark.bounceScale.expand'));
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
