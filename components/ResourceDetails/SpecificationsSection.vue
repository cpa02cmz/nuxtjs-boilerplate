<template>
  <section
    ref="sectionRef"
    :aria-label="ariaLabel"
    :class="{ 'animations-enabled': !prefersReducedMotion && isVisible }"
    class="specifications-section"
    role="region"
  >
    <!-- Section Header with Icon -->
    <div class="specifications-header">
      <div
        :class="{ 'header-icon--animated': !prefersReducedMotion && isVisible }"
        aria-hidden="true"
        class="header-icon"
      >
        <svg
          class="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          />
        </svg>
      </div>
      <h2 class="specifications-title">
        {{ title }}
      </h2>
    </div>

    <!-- Loading Skeleton State -->
    <div
      v-if="isLoading"
      aria-label="Loading specifications"
      class="specifications-skeleton"
      role="status"
    >
      <div
        v-for="n in skeletonCount"
        :key="`skeleton-${n}`"
        :class="{ 'skeleton-shimmer': !prefersReducedMotion }"
        :style="{
          animationDelay: `${(n - 1) * animationConfig.skeleton.staggerIncrementMs}ms`,
        }"
        class="skeleton-item"
      >
        <div class="skeleton-label" />
        <div class="skeleton-value" />
      </div>
    </div>

    <!-- Specifications Grid -->
    <dl v-else :class="gridClass" class="specifications-grid">
      <div
        v-for="(value, key, index) in specifications"
        :key="key"
        :class="{
          'specification-item--hovered': hoveredItem === key,
          'specification-item--copied': copiedItem === key,
          'specification-item--animated': !prefersReducedMotion && isVisible,
        }"
        :style="getItemStyle(index)"
        class="specification-item"
        @click="handleCopy(key, value)"
        @mouseenter="handleMouseEnter(key)"
        @mouseleave="handleMouseLeave"
      >
        <!-- Copy Feedback -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-90"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-90"
        >
          <div
            v-if="copiedItem === key"
            aria-live="polite"
            class="copy-feedback"
            role="status"
          >
            <svg
              aria-hidden="true"
              class="copy-feedback-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M5 13l4 4L19 7"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
            <span class="copy-feedback-text">Copied!</span>
          </div>
        </Transition>

        <!-- Label -->
        <dt class="specification-label">
          <span class="label-text">{{ formatLabel(key) }}</span>
          <span
            v-if="!prefersReducedMotion"
            :class="{ 'copy-hint--visible': hoveredItem === key }"
            aria-hidden="true"
            class="copy-hint"
          >
            <svg
              class="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
          </span>
        </dt>

        <!-- Value -->
        <dd class="specification-value">
          {{ value }}
        </dd>
      </div>
    </dl>

    <!-- Empty State -->
    <div
      v-if="!isLoading && Object.keys(specifications).length === 0"
      class="specifications-empty"
      role="status"
    >
      <div
        :class="{ 'animate-float': !prefersReducedMotion }"
        aria-hidden="true"
        class="empty-icon"
      >
        <svg
          class="h-12 w-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
          />
        </svg>
      </div>
      <p class="empty-text">
        {{ emptyText }}
      </p>
    </div>

    <!-- Screen Reader Announcements -->
    <div aria-atomic="true" aria-live="polite" class="sr-only" role="status">
      {{ announcementText }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { hapticLight, hapticSuccess } from '~/utils/hapticFeedback'

interface Props {
  specifications: Record<string, string>
  title?: string
  ariaLabel?: string
  emptyText?: string
  isLoading?: boolean
  skeletonCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Specifications',
  ariaLabel: 'Specifications section',
  emptyText: 'No specifications available',
  isLoading: false,
  skeletonCount: 4,
})

// Reactive state
const hoveredItem = ref<string | null>(null)
const copiedItem = ref<string | null>(null)
const isVisible = ref(false)
const prefersReducedMotion = ref(false)
const announcementText = ref('')
const sectionRef = ref<HTMLElement | null>(null)

let copyTimeout: ReturnType<typeof setTimeout> | null = null
let intersectionObserver: IntersectionObserver | null = null

// Computed
const gridClass = computed(() => {
  const count = Object.keys(props.specifications).length
  return count === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
})

// Check reduced motion
const checkReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Get staggered animation style
const getItemStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}
  const delay = Math.min(
    index * animationConfig.specificationsSection.staggerMultiplierMs,
    animationConfig.specificationsSection.staggerMaxDelayMs
  )
  return { '--stagger-delay': `${delay}ms` }
}

// Format label
const formatLabel = (key: string) => {
  return key.replace(/([A-Z])/g, ' $1').trim()
}

// Event handlers
const handleMouseEnter = (key: string) => {
  hoveredItem.value = key
}

const handleMouseLeave = () => {
  hoveredItem.value = null
}

const handleCopy = async (key: string, value: string) => {
  if (copiedItem.value === key) return

  try {
    await navigator.clipboard.writeText(`${formatLabel(key)}: ${value}`)
    copiedItem.value = key

    if (!prefersReducedMotion.value) {
      hapticSuccess()
    }

    announcementText.value = `${formatLabel(key)} copied to clipboard`
    setTimeout(() => {
      announcementText.value = ''
    }, 1000)

    if (copyTimeout) clearTimeout(copyTimeout)
    copyTimeout = setTimeout(() => {
      copiedItem.value = null
    }, 1500)
  } catch {
    if (!prefersReducedMotion.value) {
      hapticLight()
    }
  }
}

// Lifecycle
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  if (sectionRef.value && !prefersReducedMotion.value) {
    intersectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            isVisible.value = true
            intersectionObserver?.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )
    intersectionObserver.observe(sectionRef.value)
  } else {
    isVisible.value = true
  }
})

onUnmounted(() => {
  if (intersectionObserver) {
    intersectionObserver.disconnect()
  }
  if (copyTimeout) {
    clearTimeout(copyTimeout)
  }
})
</script>

<style scoped>
.specifications-section {
  margin-bottom: 2rem;
}

.specifications-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.header-icon {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
}

.header-icon--animated {
  animation: icon-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes icon-pop {
  0% {
    opacity: 0;
    transform: scale(0.5) rotate(-10deg);
  }
  60% {
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

.specifications-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(17, 24, 39);
}

.specifications-skeleton {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
}

@media (min-width: 768px) {
  .specifications-skeleton {
    grid-template-columns: repeat(2, 1fr);
  }
}

.skeleton-item {
  background: rgb(249, 250, 251);
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid rgb(243, 244, 246);
}

.skeleton-label {
  height: 0.875rem;
  width: 33%;
  background: linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%);
  background-size: 200% 100%;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}

.skeleton-value {
  height: 1.25rem;
  width: 75%;
  background: linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%);
  background-size: 200% 100%;
  border-radius: 0.25rem;
}

.skeleton-shimmer {
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.specifications-grid {
  display: grid;
  gap: 1rem;
}

.specification-item {
  position: relative;
  background: rgb(249, 250, 251);
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid rgb(243, 244, 246);
  cursor: pointer;
  transition:
    transform 0.2s ease-out,
    box-shadow 0.2s ease-out,
    border-color 0.2s ease-out;
  overflow: hidden;
}

.specification-item:hover,
.specification-item--hovered {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-color: rgb(209, 213, 219);
}

.specification-item--copied {
  border-color: rgb(34, 197, 94);
  background: rgb(240, 253, 244);
}

.specification-item--animated {
  opacity: 0;
  transform: translateY(20px);
  animation: item-entrance 0.4s ease-out forwards;
  animation-delay: var(--stagger-delay, 0ms);
}

@keyframes item-entrance {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.copy-feedback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(34, 197, 94, 0.95);
  border-radius: inherit;
  color: white;
  font-weight: 600;
  z-index: 10;
}

.copy-feedback-icon {
  width: 1.25rem;
  height: 1.25rem;
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  animation: draw-check 0.3s ease-out forwards;
}

@keyframes draw-check {
  to {
    stroke-dashoffset: 0;
  }
}

.specification-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.label-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(107, 114, 128);
  text-transform: capitalize;
}

.copy-hint {
  opacity: 0;
  color: rgb(156, 163, 175);
  transform: translateX(-4px);
  transition:
    opacity 0.2s ease-out,
    transform 0.2s ease-out;
}

.copy-hint--visible {
  opacity: 1;
  transform: translateX(0);
}

.specification-value {
  font-size: 1rem;
  color: rgb(17, 24, 39);
  font-weight: 500;
  word-break: break-word;
}

.specifications-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  background: linear-gradient(
    135deg,
    rgb(249, 250, 251) 0%,
    rgb(243, 244, 246) 100%
  );
  border-radius: 0.75rem;
  border: 2px dashed rgb(229, 231, 235);
}

.empty-icon {
  color: rgb(209, 213, 219);
  margin-bottom: 1rem;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.empty-text {
  font-size: 1rem;
  color: rgb(107, 114, 128);
  font-weight: 500;
}

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

@media (prefers-reduced-motion: reduce) {
  .specification-item,
  .specification-item--hovered {
    transition: none;
    transform: none;
  }

  .specification-item--animated {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .header-icon--animated {
    animation: none;
  }

  .skeleton-shimmer {
    animation: none;
    background: rgb(229, 231, 235);
  }

  .animate-float {
    animation: none;
  }

  .copy-hint {
    opacity: 0;
  }

  .copy-feedback-icon {
    stroke-dashoffset: 0;
    animation: none;
  }
}

@media (prefers-contrast: high) {
  .specification-item {
    border-width: 2px;
  }

  .specification-item:focus {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
}
</style>
