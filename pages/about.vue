<template>
  <div class="py-12">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Title with entrance animation -->
      <div class="text-center mb-12">
        <h1
          class="text-3xl font-extrabold text-gray-900 sm:text-4xl about-title"
          :class="{
            'about-title--animated': !prefersReducedMotion && isLoaded,
          }"
        >
          {{ contentConfig.about.title }}
        </h1>
      </div>

      <!-- Main content card with hover lift effect -->
      <div
        class="bg-white shadow rounded-lg p-6 about-card"
        :class="{
          'about-card--hoverable': !prefersReducedMotion,
          'about-card--loaded': isLoaded,
        }"
      >
        <h2
          class="text-xl font-semibold text-gray-800 mb-4 about-section-title"
          :class="{
            'about-section-title--animated': !prefersReducedMotion && isLoaded,
          }"
        >
          {{ contentConfig.about.sectionTitle }}
        </h2>
        <p
          class="mb-4 text-gray-600 about-description"
          :class="{
            'about-description--animated': !prefersReducedMotion && isLoaded,
          }"
        >
          {{ contentConfig.about.description }}
        </p>

        <h3 class="text-lg font-semibold text-gray-800 mb-3">
          {{ contentConfig.about.categoriesTitle }}
        </h3>

        <!-- Category list with staggered entrance and hover effects -->
        <ul class="space-y-2 about-categories">
          <li
            v-for="(category, index) in categories"
            :key="category.key"
            class="about-category-item"
            :class="{
              'about-category-item--animated':
                !prefersReducedMotion && isLoaded,
              'about-category-item--hoverable': !prefersReducedMotion,
            }"
            :style="getCategoryStyle(index)"
          >
            <div
              class="flex items-start p-2 rounded-lg transition-all duration-200"
            >
              <!-- Animated checkmark icon -->
              <div class="flex-shrink-0 mr-2">
                <svg
                  class="h-6 w-6 text-green-500 about-checkmark"
                  :class="{
                    'about-checkmark--animated':
                      !prefersReducedMotion && isLoaded,
                  }"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  :style="{ animationDelay: `${getCheckmarkDelay(index)}ms` }"
                >
                  <path
                    class="about-checkmark-path"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span class="text-gray-700">{{ category.label }}</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { contentConfig } from '~/configs/content.config'
import { DEFAULT_DEV_URL } from '~/configs/url.config'
import { animationConfig } from '~/configs/animation.config'

definePageMeta({
  layout: 'default',
})

// 🎨 Palette: Micro-UX State
const isLoaded = ref(false)
const prefersReducedMotion = ref(false)

// Categories data for v-for with staggered animations
const categories = computed(() => [
  { key: 'ai', label: contentConfig.about.categories.ai },
  { key: 'vps', label: contentConfig.about.categories.vps },
  { key: 'hosting', label: contentConfig.about.categories.hosting },
  { key: 'databases', label: contentConfig.about.categories.databases },
  { key: 'cdn', label: contentConfig.about.categories.cdn },
])

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Get category item style with stagger delay
const getCategoryStyle = index => {
  if (prefersReducedMotion.value) return {}

  return {
    '--category-index': index,
    animationDelay: `${animationConfig.about.staggerDelayMs * index}ms`,
  }
}

// Get checkmark animation delay
const getCheckmarkDelay = index => {
  if (prefersReducedMotion.value) return 0
  return (
    animationConfig.about.checkmarkBaseDelayMs +
    animationConfig.about.checkmarkStaggerMs * index
  )
}

// Lifecycle
onMounted(() => {
  // Check reduced motion preference
  prefersReducedMotion.value = checkReducedMotion()

  // Trigger entrance animations after a brief delay
  setTimeout(() => {
    isLoaded.value = true
  }, animationConfig.about.entranceDelayMs)
})

// Set page-specific meta tags
const runtimeConfig = useRuntimeConfig()
useSeoMeta({
  title: `About - ${contentConfig.navigation.appName}`,
  ogTitle: `About - ${contentConfig.navigation.appName}`,
  description: contentConfig.about.description,
  ogDescription: contentConfig.about.description,
  ogImage: '/og-image.jpg',
  ogUrl: `${runtimeConfig.public.siteUrl || runtimeConfig.public.canonicalUrl || DEFAULT_DEV_URL}/about`,
  twitterCard: 'summary_large_image',
})
</script>

<style scoped>
/* 🎨 Palette: About Page Micro-UX Enhancement Styles */

/* Title entrance animation */
.about-title {
  opacity: 1;
  transform: translateY(0);
}

.about-title--animated {
  opacity: 0;
  transform: translateY(20px);
  animation: title-enter v-bind('`${animationConfig.about.titleDurationMs}ms`')
    ease-out forwards;
  animation-delay: v-bind('`${animationConfig.about.titleDelayMs}ms`');
}

@keyframes title-enter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Card entrance and hover effects */
.about-card {
  opacity: 1;
  transform: translateY(0);
  transition:
    transform v-bind('animationConfig.cssTransitions.hoverSec') ease-out,
    box-shadow v-bind('animationConfig.cssTransitions.hoverSec') ease-out;
}

.about-card--loaded {
  opacity: 0;
  transform: translateY(30px);
  animation: card-enter v-bind('`${animationConfig.about.cardDurationMs}ms`')
    ease-out forwards;
  animation-delay: v-bind('`${animationConfig.about.cardDelayMs}ms`');
}

.about-card--hoverable:hover {
  transform: translateY(-4px);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

@keyframes card-enter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Section title animation */
.about-section-title {
  opacity: 1;
}

.about-section-title--animated {
  opacity: 0;
  animation: fade-in v-bind('`${animationConfig.about.sectionDurationMs}ms`')
    ease-out forwards;
  animation-delay: v-bind('`${animationConfig.about.sectionDelayMs}ms`');
}

/* Description animation */
.about-description {
  opacity: 1;
}

.about-description--animated {
  opacity: 0;
  animation: fade-in v-bind('`${animationConfig.about.descDurationMs}ms`')
    ease-out forwards;
  animation-delay: v-bind('`${animationConfig.about.descDelayMs}ms`');
}

@keyframes fade-in {
  to {
    opacity: 1;
  }
}

/* Category items with staggered entrance and hover lift */
.about-category-item {
  opacity: 1;
  transform: translateX(0);
}

.about-category-item--animated {
  opacity: 0;
  transform: translateX(-20px);
  animation: category-enter
    v-bind('`${animationConfig.about.categoryDurationMs}ms`') ease-out forwards;
  animation-delay: calc(
    var(--category-index, 0) *
      v-bind('`${animationConfig.about.staggerDelayMs}ms`')
  );
}

.about-category-item--hoverable:hover > div {
  background-color: rgba(59, 130, 246, 0.05);
  transform: translateX(8px);
}

.about-category-item--hoverable > div {
  transition:
    background-color v-bind('animationConfig.cssTransitions.fastSec') ease-out,
    transform v-bind('animationConfig.cssTransitions.fastSec') ease-out;
}

@keyframes category-enter {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Checkmark draw animation */
.about-checkmark {
  opacity: 1;
}

.about-checkmark--animated {
  opacity: 0;
}

.about-checkmark-path {
  stroke-dasharray: 20;
  stroke-dashoffset: 0;
}

.about-checkmark--animated .about-checkmark-path {
  stroke-dashoffset: 20;
  animation: checkmark-draw
    v-bind('`${animationConfig.about.checkmarkDurationMs}ms`') ease-out forwards;
}

@keyframes checkmark-draw {
  to {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .about-title,
  .about-card,
  .about-section-title,
  .about-description,
  .about-category-item,
  .about-checkmark {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
  }

  .about-checkmark-path {
    stroke-dashoffset: 0 !important;
    animation: none !important;
  }

  .about-card--hoverable:hover {
    transform: none;
  }

  .about-category-item--hoverable:hover > div {
    transform: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .about-category-item--hoverable:hover > div {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
}
</style>
