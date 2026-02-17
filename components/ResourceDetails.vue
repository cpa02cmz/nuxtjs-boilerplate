<template>
  <div
    ref="containerRef"
    class="resource-details mb-8"
    :class="{ 'animations-enabled': !prefersReducedMotion }"
  >
    <DeprecationNotice
      v-if="
        status &&
          (status === 'deprecated' ||
            status === 'discontinued' ||
            status === 'pending')
      "
      :status="status"
      :migration-path="migrationPath"
      :deprecation-date="deprecationDate"
    />

    <!-- 🎨 Palette's micro-UX enhancement: Reading Progress Bar ✨ -->
    <div
      v-if="showProgressBar && !prefersReducedMotion"
      class="reading-progress-container"
      aria-hidden="true"
    >
      <div
        class="reading-progress-bar"
        :style="{ transform: `scaleX(${readingProgress})` }"
      />
    </div>

    <!-- 🎨 Palette's micro-UX enhancement: Quick Navigation for keyboard users ✨ -->
    <nav
      v-if="showQuickNav"
      class="quick-nav"
      aria-label="Resource sections"
    >
      <button
        v-for="(section, index) in availableSections"
        :key="section.id"
        type="button"
        class="quick-nav-item"
        :class="{
          'is-active': activeSection === section.id,
          'is-visited': visitedSections.has(section.id),
        }"
        :style="getNavItemStyle(index)"
        :aria-current="activeSection === section.id ? 'true' : undefined"
        @click="scrollToSection(section.id)"
        @mouseenter="handleNavHover(section.id)"
        @mouseleave="handleNavLeave"
      >
        <span class="quick-nav-icon">{{ section.icon }}</span>
        <span class="quick-nav-label">{{ section.label }}</span>
      </button>
    </nav>

    <div
      class="grid grid-cols-1 md:grid-cols-3 gap-8"
      @scroll="handleScroll"
    >
      <div class="md:col-span-2 resource-content">
        <!-- 🎨 Palette's micro-UX enhancement: Sections with intersection observer ✨ -->
        <div
          ref="descriptionRef"
          class="resource-section"
          data-section="description"
          :class="{
            'is-visible': visibleSections.has('description'),
            'is-hovered': hoveredSection === 'description',
          }"
          :style="getSectionStyle(0)"
          @mouseenter="hoveredSection = 'description'"
          @mouseleave="hoveredSection = null"
        >
          <DescriptionSection :description="description" />
        </div>

        <div
          ref="benefitsRef"
          class="resource-section"
          data-section="benefits"
          :class="{
            'is-visible': visibleSections.has('benefits'),
            'is-hovered': hoveredSection === 'benefits',
          }"
          :style="getSectionStyle(1)"
          @mouseenter="hoveredSection = 'benefits'"
          @mouseleave="hoveredSection = null"
        >
          <BenefitsSection :benefits="benefits" />
        </div>

        <div
          v-if="screenshots && screenshots.length > 0"
          ref="screenshotsRef"
          class="resource-section"
          data-section="screenshots"
          :class="{
            'is-visible': visibleSections.has('screenshots'),
            'is-hovered': hoveredSection === 'screenshots',
          }"
          :style="getSectionStyle(2)"
          @mouseenter="hoveredSection = 'screenshots'"
          @mouseleave="hoveredSection = null"
        >
          <ScreenshotsSection
            :screenshots="screenshots"
            :title="title"
            @image-error="handleImageError"
          />
        </div>

        <div
          v-if="specifications && Object.keys(specifications).length > 0"
          ref="specificationsRef"
          class="resource-section"
          data-section="specifications"
          :class="{
            'is-visible': visibleSections.has('specifications'),
            'is-hovered': hoveredSection === 'specifications',
          }"
          :style="getSectionStyle(3)"
          @mouseenter="hoveredSection = 'specifications'"
          @mouseleave="hoveredSection = null"
        >
          <SpecificationsSection :specifications="specifications" />
        </div>

        <div
          v-if="features && features.length > 0"
          ref="featuresRef"
          class="resource-section"
          data-section="features"
          :class="{
            'is-visible': visibleSections.has('features'),
            'is-hovered': hoveredSection === 'features',
          }"
          :style="getSectionStyle(4)"
          @mouseenter="hoveredSection = 'features'"
          @mouseleave="hoveredSection = null"
        >
          <FeaturesSection :features="features" />
        </div>

        <div
          v-if="limitations && limitations.length > 0"
          ref="limitationsRef"
          class="resource-section"
          data-section="limitations"
          :class="{
            'is-visible': visibleSections.has('limitations'),
            'is-hovered': hoveredSection === 'limitations',
          }"
          :style="getSectionStyle(5)"
          @mouseenter="hoveredSection = 'limitations'"
          @mouseleave="hoveredSection = null"
        >
          <LimitationsSection :limitations="limitations" />
        </div>
      </div>
    </div>

    <!-- 🎨 Palette's micro-UX enhancement: Back to Top Button ✨ -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <button
        v-if="showBackToTop && !prefersReducedMotion"
        type="button"
        class="back-to-top"
        aria-label="Back to top"
        @click="scrollToTop"
        @mouseenter="isBackToTopHovered = true"
        @mouseleave="isBackToTopHovered = false"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="back-to-top-icon"
          :class="{ 'is-hovered': isBackToTopHovered }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </Transition>

    <!-- Screen reader announcements -->
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ announcement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import DeprecationNotice from '~/components/DeprecationNotice.vue'
import DescriptionSection from '~/components/ResourceDetails/DescriptionSection.vue'
import BenefitsSection from '~/components/ResourceDetails/BenefitsSection.vue'
import ScreenshotsSection from '~/components/ResourceDetails/ScreenshotsSection.vue'
import SpecificationsSection from '~/components/ResourceDetails/SpecificationsSection.vue'
import FeaturesSection from '~/components/ResourceDetails/FeaturesSection.vue'
import LimitationsSection from '~/components/ResourceDetails/LimitationsSection.vue'
import { animationConfig } from '~/configs/animation.config'
import { uiConfig } from '~/configs/ui.config'

interface Props {
  title: string
  description: string
  benefits: string[]
  screenshots?: string[]
  specifications?: Record<string, string>
  features?: string[]
  limitations?: string[]
  status?: string
  migrationPath?: string
  deprecationDate?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  imageError: [event: Event | string]
}>()

// 🎨 Palette's micro-UX enhancement: Refs for intersection observer
const containerRef = ref<HTMLElement | null>(null)
const descriptionRef = ref<HTMLElement | null>(null)
const benefitsRef = ref<HTMLElement | null>(null)
const screenshotsRef = ref<HTMLElement | null>(null)
const specificationsRef = ref<HTMLElement | null>(null)
const featuresRef = ref<HTMLElement | null>(null)
const limitationsRef = ref<HTMLElement | null>(null)

// 🎨 Palette's micro-UX enhancement: Reactive state
const prefersReducedMotion = ref(false)
const readingProgress = ref(0)
const showBackToTop = ref(false)
const isBackToTopHovered = ref(false)
const activeSection = ref<string | null>(null)
const hoveredSection = ref<string | null>(null)
const visibleSections = ref<Set<string>>(new Set())
const visitedSections = ref<Set<string>>(new Set())
const announcement = ref('')

// 🎨 Palette's micro-UX enhancement: Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// 🎨 Palette's micro-UX enhancement: Available sections configuration
const availableSections = computed(() => {
  const sections: Array<{ id: string; label: string; icon: string }> = [
    { id: 'description', label: 'Description', icon: '📝' },
    { id: 'benefits', label: 'Benefits', icon: '✨' },
  ]

  if (props.screenshots && props.screenshots.length > 0) {
    sections.push({ id: 'screenshots', label: 'Screenshots', icon: '📸' })
  }

  if (props.specifications && Object.keys(props.specifications).length > 0) {
    sections.push({ id: 'specifications', label: 'Specs', icon: '⚙️' })
  }

  if (props.features && props.features.length > 0) {
    sections.push({ id: 'features', label: 'Features', icon: '🚀' })
  }

  if (props.limitations && props.limitations.length > 0) {
    sections.push({ id: 'limitations', label: 'Limitations', icon: '⚠️' })
  }

  return sections
})

// 🎨 Palette's micro-UX enhancement: Show quick nav when there are multiple sections
const showQuickNav = computed(() => availableSections.value.length > 2)

// 🎨 Palette's micro-UX enhancement: Show progress bar on long pages
const showProgressBar = computed(() => availableSections.value.length > 3)

// 🎨 Palette's micro-UX enhancement: Calculate section style with stagger delay
const getSectionStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}
  const delay = Math.min(
    index * animationConfig.resourceDetails.sectionStaggerMs,
    animationConfig.resourceDetails.maxStaggerMs
  )
  return { '--section-delay': `${delay}ms` }
}

// 🎨 Palette's micro-UX enhancement: Calculate nav item style with stagger
const getNavItemStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}
  const delay = index * animationConfig.resourceDetails.navStaggerMs
  return { '--nav-item-delay': `${delay}ms` }
}

// 🎨 Palette's micro-UX enhancement: Scroll to specific section
const scrollToSection = (sectionId: string) => {
  const sectionMap: Record<string, HTMLElement | null> = {
    description: descriptionRef.value,
    benefits: benefitsRef.value,
    screenshots: screenshotsRef.value,
    specifications: specificationsRef.value,
    features: featuresRef.value,
    limitations: limitationsRef.value,
  }

  const element = sectionMap[sectionId]
  if (element) {
    element.scrollIntoView({
      behavior: prefersReducedMotion.value ? 'auto' : 'smooth',
      block: 'start',
    })
    activeSection.value = sectionId
    visitedSections.value.add(sectionId)

    // Announce to screen readers
    const section = availableSections.value.find(s => s.id === sectionId)
    if (section) {
      announcement.value = `Navigated to ${section.label} section`
      setTimeout(() => {
        announcement.value = ''
      }, uiConfig.accessibility.announcementDurationMs)
    }
  }
}

// 🎨 Palette's micro-UX enhancement: Scroll to top
const scrollToTop = () => {
  if (containerRef.value) {
    containerRef.value.scrollIntoView({
      behavior: prefersReducedMotion.value ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  // Trigger haptic feedback
  if (
    !prefersReducedMotion.value &&
    typeof navigator !== 'undefined' &&
    navigator.vibrate
  ) {
    navigator.vibrate(10)
  }
}

// 🎨 Palette's micro-UX enhancement: Handle scroll for progress and back-to-top
const handleScroll = () => {
  if (typeof window === 'undefined' || !containerRef.value) return

  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  // Calculate reading progress
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const scrollableHeight = documentHeight - windowHeight
  readingProgress.value =
    scrollableHeight > 0 ? Math.min(scrollTop / scrollableHeight, 1) : 0

  // Show/hide back to top button
  showBackToTop.value = scrollTop > windowHeight * 0.5

  // Determine active section based on scroll position
  const sectionRefs = [
    { id: 'description', ref: descriptionRef.value },
    { id: 'benefits', ref: benefitsRef.value },
    { id: 'screenshots', ref: screenshotsRef.value },
    { id: 'specifications', ref: specificationsRef.value },
    { id: 'features', ref: featuresRef.value },
    { id: 'limitations', ref: limitationsRef.value },
  ].filter(s => s.ref !== null) as Array<{ id: string; ref: HTMLElement }>

  // Find the section closest to the top of the viewport
  let closestSection: string | null = null
  let closestDistance = Infinity

  sectionRefs.forEach(({ id, ref }) => {
    const sectionRect = ref.getBoundingClientRect()
    const distance = Math.abs(sectionRect.top)
    if (distance < closestDistance && sectionRect.top < windowHeight * 0.5) {
      closestDistance = distance
      closestSection = id
    }
  })

  if (closestSection && closestSection !== activeSection.value) {
    activeSection.value = closestSection
    visitedSections.value.add(closestSection)
  }
}

// 🎨 Palette's micro-UX enhancement: Navigation hover handlers
const handleNavHover = (sectionId: string) => {
  hoveredSection.value = sectionId
}

const handleNavLeave = () => {
  hoveredSection.value = null
}

// 🎨 Palette's micro-UX enhancement: Handle image errors
const handleImageError = (event: Event | string) => {
  emit('imageError', event)
}

// 🎨 Palette's micro-UX enhancement: Intersection Observer for section visibility
let intersectionObserver: IntersectionObserver | null = null

const setupIntersectionObserver = () => {
  if (typeof window === 'undefined' || prefersReducedMotion.value) return

  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
  }

  intersectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const sectionId = entry.target.getAttribute('data-section')
      if (sectionId) {
        if (entry.isIntersecting) {
          visibleSections.value.add(sectionId)
        } else {
          // Keep in set briefly for exit animation
          setTimeout(() => {
            if (!visibleSections.value.has(sectionId)) {
              visibleSections.value.delete(sectionId)
            }
          }, 300)
        }
      }
    })
  }, options)

  // Observe all sections
  const sectionElements = [
    descriptionRef.value,
    benefitsRef.value,
    screenshotsRef.value,
    specificationsRef.value,
    featuresRef.value,
    limitationsRef.value,
  ].filter(Boolean) as HTMLElement[]

  sectionElements.forEach(el => {
    if (intersectionObserver) {
      intersectionObserver.observe(el)
    }
  })
}

// 🎨 Palette's micro-UX enhancement: Keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  // Alt + Arrow keys to navigate between sections
  if (event.altKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
    event.preventDefault()

    const sections = availableSections.value
    const currentIndex = sections.findIndex(s => s.id === activeSection.value)

    let nextIndex: number
    if (event.key === 'ArrowDown') {
      nextIndex = currentIndex < sections.length - 1 ? currentIndex + 1 : 0
    } else {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : sections.length - 1
    }

    scrollToSection(sections[nextIndex].id)
  }
}

// Lifecycle hooks
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Add scroll listener
  window.addEventListener('scroll', handleScroll, { passive: true })

  // Add keyboard listener
  document.addEventListener('keydown', handleKeyDown)

  // Setup intersection observer
  setupIntersectionObserver()

  // Initial scroll check
  handleScroll()

  // Announce page load
  announcement.value = `${props.title} details loaded with ${availableSections.value.length} sections`
  setTimeout(() => {
    announcement.value = ''
  }, uiConfig.accessibility.announcementDurationMs)
})

onUnmounted(() => {
  // Cleanup
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('keydown', handleKeyDown)

  if (intersectionObserver) {
    intersectionObserver.disconnect()
    intersectionObserver = null
  }
})

// Watch for section visibility changes
watch(
  visibleSections,
  newSet => {
    newSet.forEach(sectionId => {
      visitedSections.value.add(sectionId)
    })
  },
  { deep: true }
)

// Flexy hates hardcoded values! Using animationConfig for all CSS durations 🧩
const navEntranceDuration = computed(
  () => `${animationConfig.resourceDetails.navEntranceMs}ms`
)
const navTransitionDuration = computed(
  () => `${animationConfig.resourceDetails.navTransitionMs}ms`
)
const navItemEntranceDuration = computed(
  () => `${animationConfig.resourceDetails.navItemEntranceMs}ms`
)
const sectionTransitionDuration = computed(
  () => `${animationConfig.resourceDetails.sectionTransitionMs}ms`
)
const backToTopBounceDuration = computed(
  () => `${animationConfig.resourceDetails.backToTopBounceMs}ms`
)
</script>

<style scoped>
/* 🎨 Palette's micro-UX enhancement: Resource Details Container */
.resource-details {
  position: relative;
}

/* 🎨 Palette's micro-UX enhancement: Reading Progress Bar */
.reading-progress-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.05);
  z-index: 1000;
  pointer-events: none;
}

.reading-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  transform-origin: left;
  transition: transform 100ms linear;
  will-change: transform;
}

/* 🎨 Palette's micro-UX enhancement: Quick Navigation */
.quick-nav {
  position: sticky;
  top: 80px;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  z-index: 50;
  /* Flexy hates hardcoded 0.4s! Using v-bind with animationConfig */
  animation: nav-fade-in v-bind(navEntranceDuration) ease-out;
}

@keyframes nav-fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.quick-nav-item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  /* Flexy hates hardcoded 0.2s! Using v-bind with animationConfig */
  transition: all v-bind(navTransitionDuration) ease-out;
  opacity: 0;
  /* Flexy hates hardcoded 0.3s! Using v-bind with animationConfig */
  animation: nav-item-enter v-bind(navItemEntranceDuration) ease-out forwards;
  animation-delay: var(--nav-item-delay, 0ms);
}

@keyframes nav-item-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.quick-nav-item:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  transform: translateY(-1px);
}

.quick-nav-item.is-active {
  background: #3b82f6;
  color: white;
  border-color: #2563eb;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.quick-nav-item.is-visited:not(.is-active) {
  color: #10b981;
}

.quick-nav-icon {
  font-size: 1rem;
  line-height: 1;
}

.quick-nav-label {
  white-space: nowrap;
}

/* 🎨 Palette's micro-UX enhancement: Resource Content Sections */
.resource-content {
  scroll-behavior: smooth;
}

.resource-section {
  margin-bottom: 2rem;
  opacity: 0;
  transform: translateY(20px);
  /* Flexy hates hardcoded 0.5s! Using v-bind with animationConfig */
  transition: all v-bind(sectionTransitionDuration)
    cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-delay: var(--section-delay, 0ms);
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin-left: -0.5rem;
  margin-right: -0.5rem;
}

.resource-section.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.resource-section.is-hovered {
  background: rgba(0, 0, 0, 0.02);
}

/* 🎨 Palette's micro-UX enhancement: Back to Top Button */
.back-to-top {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  color: #374151;
  /* Flexy hates hardcoded 0.2s! Using v-bind with animationConfig */
  transition: all v-bind(navTransitionDuration) ease-out;
  z-index: 100;
}

.back-to-top:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  background: #f9fafb;
}

.back-to-top:active {
  transform: translateY(0) scale(0.95);
}

.back-to-top-icon {
  width: 24px;
  height: 24px;
  /* Flexy hates hardcoded 0.2s! Using v-bind with animationConfig */
  transition: transform v-bind(navTransitionDuration) ease-out;
}

.back-to-top-icon.is-hovered {
  transform: translateY(-2px);
  /* Flexy hates hardcoded 0.6s! Using v-bind with animationConfig */
  animation: bounce-up v-bind(backToTopBounceDuration) ease-in-out;
}

@keyframes bounce-up {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

/* 🎨 Palette's micro-UX enhancement: Screen Reader Only */
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

/* 🎨 Palette's micro-UX enhancement: Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .resource-section,
  .quick-nav,
  .quick-nav-item,
  .back-to-top,
  .back-to-top-icon {
    transition: none !important;
    animation: none !important;
  }

  .resource-section {
    opacity: 1;
    transform: none;
  }

  .quick-nav {
    animation: none;
    opacity: 1;
  }

  .quick-nav-item {
    animation: none;
    opacity: 1;
  }

  .reading-progress-container {
    display: none;
  }
}

/* 🎨 Palette's micro-UX enhancement: High Contrast Mode Support */
@media (prefers-contrast: high) {
  .quick-nav {
    border-width: 2px;
  }

  .quick-nav-item.is-active {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  .back-to-top {
    border-width: 2px;
  }

  .reading-progress-bar {
    background: currentColor;
  }
}

/* 🎨 Palette's micro-UX enhancement: Mobile Optimizations */
@media (max-width: 768px) {
  .quick-nav {
    top: 60px;
    padding: 0.5rem;
    gap: 0.375rem;
  }

  .quick-nav-item {
    padding: 0.25rem 0.5rem;
    font-size: 0.8125rem;
  }

  .quick-nav-label {
    display: none;
  }

  .back-to-top {
    bottom: 24px;
    right: 24px;
    width: 44px;
    height: 44px;
  }
}

/* 🎨 Palette's micro-UX enhancement: Print Styles */
@media print {
  .quick-nav,
  .back-to-top,
  .reading-progress-container {
    display: none !important;
  }

  .resource-section {
    opacity: 1 !important;
    transform: none !important;
    page-break-inside: avoid;
  }
}
</style>
