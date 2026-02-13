<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <div
      class="flex-grow flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
    >
      <div
        class="max-w-md w-full space-y-8 text-center"
        :class="{ 'animate-entrance': !prefersReducedMotion }"
      >
        <div>
          <!-- Error Icon with Pulse Animation - Palette's micro-UX enhancement! -->
          <div
            class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 relative"
            :class="{ 'animate-icon-pulse': !prefersReducedMotion }"
          >
            <!-- Pulse ring for visual emphasis -->
            <div
              v-if="!prefersReducedMotion"
              class="absolute inset-0 rounded-full bg-red-200 animate-pulse-ring"
              aria-hidden="true"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-10 w-10 text-red-600 relative z-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="icons.error"
              />
            </svg>
          </div>
          <h1 class="mt-6 text-3xl font-extrabold text-gray-900">
            {{
              error.statusCode === 404
                ? content.error.notFound.title
                : content.error.generic.title
            }}
          </h1>
          <p class="mt-2 text-gray-600">
            {{
              error.statusCode === 404
                ? content.error.notFound.message
                : content.error.generic.message
            }}
          </p>
        </div>

        <div class="mt-8 space-y-4">
          <details
            v-if="error.message"
            class="text-left inline-block"
          >
            <summary class="text-sm text-gray-500 cursor-pointer">
              {{ content.error.details }}
            </summary>
            <p class="text-sm text-gray-500 mt-2 bg-gray-100 p-2 rounded">
              {{ error.message }}
            </p>
          </details>

          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <!-- Primary Action Button with Hover Lift Effect -->
            <button
              class="error-action-btn error-action-btn--primary"
              :class="{ 'btn-lift': !prefersReducedMotion }"
              :aria-label="`Go back to previous page, error code ${error.statusCode}`"
              @click="handleRetry"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {{ content.error.goBack }}
            </button>
            <!-- Secondary Action Button with Subtle Hover -->
            <NuxtLink
              to="/"
              class="error-action-btn error-action-btn--secondary"
              :class="{ 'btn-lift': !prefersReducedMotion }"
              aria-label="Go to home page"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              {{ content.error.goHome }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Flexy hates hardcoded values! Using config imports instead.
import { ref, computed, onMounted } from 'vue'
import { contentConfig } from '~/configs/content.config'
import { iconsConfig } from '~/configs/icons.config'
import { animationConfig } from '~/configs/animation.config'
import { easingConfig } from '~/configs/easing.config'

const content = contentConfig
const icons = iconsConfig.svg

const props = defineProps<{ statusCode?: number; message?: string }>()

const error = computed(() => ({
  statusCode: props.statusCode || 500,
  message: props.message || 'An error occurred',
}))

// Palette's micro-UX enhancement: Respect user's motion preferences
const prefersReducedMotion = ref(false)

// Check reduced motion preference on mount
onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleChange)
  }
})

const handleRetry = () => {
  if (process.client) {
    window.history.back()
  }
}
</script>

<style scoped>
/* Palette's micro-UX enhancement: Subtle entrance animation for error page */
@keyframes entrance {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-entrance {
  animation: entrance
    v-bind('animationConfig.errorPage.entranceDurationMs + "ms"')
    v-bind('easingConfig.cubicBezier.standard') forwards;
}

/* Error icon pulse animation - provides visual emphasis without being jarring */
@keyframes icon-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.animate-icon-pulse {
  animation: icon-pulse
    v-bind('animationConfig.errorPage.iconPulseDurationSec + "s"') ease-in-out
    infinite;
}

/* Pulse ring animation behind the icon */
@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.4;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.animate-pulse-ring {
  animation: pulse-ring
    v-bind('animationConfig.errorPage.pulseRingDurationSec + "s"') ease-out
    infinite;
}

/* Error Action Button Base Styles */
.error-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all v-bind('animationConfig.cssTransitions.normalSec') ease-out;
  outline: none;
  cursor: pointer;
}

/* Primary Button - Dark background */
.error-action-btn--primary {
  border: 1px solid transparent;
  color: white;
  background-color: rgb(31, 41, 55); /* gray-800 */
}

.error-action-btn--primary:hover {
  background-color: rgb(17, 24, 39); /* gray-900 */
}

.error-action-btn--primary:focus-visible {
  box-shadow:
    0 0 0 2px white,
    0 0 0 4px rgb(31, 41, 55);
}

/* Secondary Button - Light background */
.error-action-btn--secondary {
  border: 1px solid rgb(209, 213, 219); /* gray-300 */
  color: rgb(55, 65, 81); /* gray-700 */
  background-color: white;
}

.error-action-btn--secondary:hover {
  background-color: rgb(249, 250, 251); /* gray-50 */
  border-color: rgb(156, 163, 175); /* gray-400 */
}

.error-action-btn--secondary:focus-visible {
  box-shadow:
    0 0 0 2px white,
    0 0 0 4px rgb(31, 41, 55);
}

/* Button lift effect on hover - micro-UX delight! */
.btn-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-lift:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .animate-entrance,
  .animate-icon-pulse,
  .animate-pulse-ring {
    animation: none !important;
  }

  .btn-lift:hover,
  .btn-lift:active {
    transform: none !important;
  }

  .error-action-btn {
    transition: none;
  }
}
</style>
