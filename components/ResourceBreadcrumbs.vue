<template>
  <nav
    class="mb-6"
    aria-label="Breadcrumb"
  >
    <ol class="flex items-center space-x-2 text-sm">
      <li class="breadcrumb-item">
        <NuxtLink
          to="/"
          class="breadcrumb-link group"
        >
          <span class="breadcrumb-text">Home</span>
          <span
            class="breadcrumb-underline"
            aria-hidden="true"
          />
        </NuxtLink>
      </li>
      <li aria-hidden="true">
        <span class="breadcrumb-separator">/</span>
      </li>
      <li class="breadcrumb-item">
        <NuxtLink
          to="/search"
          class="breadcrumb-link group"
        >
          <span class="breadcrumb-text">Resources</span>
          <span
            class="breadcrumb-underline"
            aria-hidden="true"
          />
        </NuxtLink>
      </li>
      <li aria-hidden="true">
        <span class="breadcrumb-separator">/</span>
      </li>
      <li
        class="breadcrumb-current"
        aria-current="page"
      >
        <span class="breadcrumb-current-text">{{ title }}</span>
        <span
          class="breadcrumb-current-indicator"
          aria-hidden="true"
        />
      </li>
    </ol>

    <!-- Screen reader announcement for current page -->
    <div
      class="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ announcement }}
    </div>
  </nav>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { contentConfig } from '~/configs/content.config'

const props = defineProps<{
  title: string
}>()

// Screen reader announcement
const announcement = ref('')

// Announce page changes to screen readers
watch(
  () => props.title,
  newTitle => {
    if (newTitle) {
      announcement.value = contentConfig.breadcrumbs.currentPage.replace(
        '{{title}}',
        newTitle
      )
      // Clear announcement after screen reader has time to process
      setTimeout(() => {
        announcement.value = ''
      }, 1000)
    }
  },
  { immediate: true }
)

// Check for reduced motion preference
const prefersReducedMotion = ref(false)

onMounted(() => {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function'
  ) {
    prefersReducedMotion.value = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
  }
})
</script>

<style scoped>
/* Breadcrumb item base styles */
.breadcrumb-item {
  position: relative;
}

/* Breadcrumb link with slide-in underline animation */
.breadcrumb-link {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  color: rgb(37, 99, 235); /* blue-600 */
  text-decoration: none;
  padding: 0.125rem 0.25rem;
  margin: -0.125rem -0.25rem;
  border-radius: 0.25rem;
  transition: color v-bind('`${animationConfig.transition.fast.durationMs}ms`')
    ease-out;
}

.breadcrumb-link:hover {
  color: rgb(30, 64, 175); /* blue-800 */
}

.breadcrumb-link:focus-visible {
  outline: 2px solid rgb(37, 99, 235);
  outline-offset: 2px;
}

/* Breadcrumb text */
.breadcrumb-text {
  position: relative;
  z-index: 1;
}

/* Slide-in underline effect - Palette's micro-UX delight! */
.breadcrumb-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, rgb(37, 99, 235), rgb(59, 130, 246));
  border-radius: 1px;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform
    v-bind('`${animationConfig.breadcrumbs.underlineDurationMs}ms`')
    v-bind('animationConfig.easeOutQuart');
  opacity: 0;
}

.breadcrumb-link:hover .breadcrumb-underline,
.breadcrumb-link:focus-visible .breadcrumb-underline {
  transform: scaleX(1);
  opacity: 1;
}

/* Separator styling */
.breadcrumb-separator {
  color: rgb(75, 85, 99); /* gray-600 */
  transition: color v-bind('`${animationConfig.transition.fast.durationMs}ms`')
    ease-out;
}

/* Current page styling with pulse indicator */
.breadcrumb-current {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(107, 114, 128); /* gray-500 */
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  margin: -0.125rem -0.5rem;
  background: linear-gradient(
    135deg,
    rgba(243, 244, 246, 0.5),
    rgba(229, 231, 235, 0.5)
  );
  border-radius: 0.375rem;
  max-width: 200px;
}

.breadcrumb-current-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Pulsing indicator dot - Palette's micro-UX enhancement! */
.breadcrumb-current-indicator {
  width: 6px;
  height: 6px;
  background: rgb(37, 99, 235);
  border-radius: 50%;
  animation: pulse-dot
    v-bind('`${animationConfig.breadcrumbs.pulseDurationMs}ms`') ease-in-out
    infinite;
  flex-shrink: 0;
}

@keyframes pulse-dot {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0);
  }
}

/* Screen reader only text */
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

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .breadcrumb-link,
  .breadcrumb-underline,
  .breadcrumb-separator {
    transition: none;
  }

  .breadcrumb-underline {
    transform: none;
    opacity: 0;
  }

  .breadcrumb-link:hover .breadcrumb-underline,
  .breadcrumb-link:focus-visible .breadcrumb-underline {
    opacity: 1;
  }

  .breadcrumb-current-indicator {
    animation: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .breadcrumb-link {
    text-decoration: underline;
  }

  .breadcrumb-underline {
    display: none;
  }

  .breadcrumb-current {
    border: 1px solid currentColor;
  }
}
</style>
