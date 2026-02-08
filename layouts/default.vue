<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Skip to main content link for screen readers -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-gray-900 focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
    >
      {{ ACCESSIBILITY_LABELS.skipToMainContent }}
    </a>

    <header class="bg-white shadow" role="banner">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink
              to="/"
              class="text-xl font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              :aria-label="ACCESSIBILITY_LABELS.returnToHome"
            >
              {{ APP_NAME }}
            </NuxtLink>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden lg:flex items-center flex-1 max-w-lg mx-8">
            <LazySearchBar
              v-model="searchQuery"
              :aria-label="ACCESSIBILITY_LABELS.searchResources"
              @search="handleSearch"
            />
          </div>

          <nav
            class="hidden lg:flex items-center space-x-4"
            role="navigation"
            aria-label="Main navigation"
          >
            <NuxtLink
              to="/"
              class="text-gray-800 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              :aria-label="NAV_ITEMS.home.ariaLabel"
            >
              {{ NAV_ITEMS.home.label }}
            </NuxtLink>
            <NuxtLink
              :to="NAV_ITEMS.search.path"
              class="text-gray-800 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              active-class="bg-gray-100"
            >
              {{ NAV_ITEMS.search.label }}
            </NuxtLink>
            <NuxtLink
              :to="NAV_ITEMS.aiKeys.path"
              class="text-gray-800 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              active-class="bg-gray-100"
            >
              {{ NAV_ITEMS.aiKeys.label }}
            </NuxtLink>
            <NuxtLink
              :to="NAV_ITEMS.favorites.path"
              class="text-gray-800 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              active-class="bg-gray-100"
            >
              {{ NAV_ITEMS.favorites.label }}
            </NuxtLink>
            <NuxtLink
              :to="NAV_ITEMS.about.path"
              class="text-gray-800 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              active-class="bg-gray-100"
            >
              {{ NAV_ITEMS.about.label }}
            </NuxtLink>
            <NuxtLink
              :to="NAV_ITEMS.submit.path"
              class="text-gray-800 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium font-medium bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              active-class="bg-gray-200"
            >
              {{ NAV_ITEMS.submit.label }}
            </NuxtLink>
            <NuxtLink
              :to="NAV_ITEMS.developer.path"
              class="text-gray-800 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              active-class="bg-gray-100"
            >
              {{ NAV_ITEMS.developer.label }}
            </NuxtLink>
            <NuxtLink
              :to="NAV_ITEMS.apiAnalytics.path"
              class="text-gray-800 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded"
              active-class="bg-gray-100"
            >
              {{ NAV_ITEMS.apiAnalytics.label }}
            </NuxtLink>
          </nav>

          <!-- Mobile menu button -->
          <div class="flex items-center lg:hidden">
            <button
              ref="mobileMenuButton"
              type="button"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-800"
              aria-controls="mobile-menu"
              :aria-expanded="mobileMenuOpen"
              :aria-label="
                mobileMenuOpen
                  ? ACCESSIBILITY_LABELS.closeMainMenu
                  : ACCESSIBILITY_LABELS.openMainMenu
              "
              @click="toggleMobileMenu"
            >
              <span class="sr-only">{{
                mobileMenuOpen
                  ? ACCESSIBILITY_LABELS.closeMainMenu
                  : ACCESSIBILITY_LABELS.openMainMenu
              }}</span>
              <svg
                :class="['h-6 w-6', { hidden: mobileMenuOpen }]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                :class="['h-6 w-6', { hidden: !mobileMenuOpen }]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
        </div>
      </div>

      <!-- Mobile menu -->
      <div
        v-show="mobileMenuOpen"
        id="mobile-menu"
        ref="mobileMenuRef"
        class="lg:hidden"
      >
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <NuxtLink
            to="/"
            class="text-gray-800 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-800"
            @click="closeMobileMenu"
          >
            {{ NAV_ITEMS.home.label }}
          </NuxtLink>
          <NuxtLink
            :to="NAV_ITEMS.search.path"
            class="text-gray-800 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-800"
            active-class="bg-gray-100"
            @click="closeMobileMenu"
          >
            {{ NAV_ITEMS.search.label }}
          </NuxtLink>
          <NuxtLink
            :to="NAV_ITEMS.aiKeys.path"
            class="text-gray-800 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-800"
            active-class="bg-gray-100"
            @click="closeMobileMenu"
          >
            {{ NAV_ITEMS.aiKeys.label }}
          </NuxtLink>
          <NuxtLink
            :to="NAV_ITEMS.favorites.path"
            class="text-gray-800 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-800"
            active-class="bg-gray-100"
            @click="closeMobileMenu"
          >
            {{ NAV_ITEMS.favorites.label }}
          </NuxtLink>
          <NuxtLink
            :to="NAV_ITEMS.about.path"
            class="text-gray-800 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-800"
            active-class="bg-gray-100"
            @click="closeMobileMenu"
          >
            {{ NAV_ITEMS.about.label }}
          </NuxtLink>
          <NuxtLink
            :to="NAV_ITEMS.submit.path"
            class="text-gray-800 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800"
            active-class="bg-gray-200"
            @click="closeMobileMenu"
          >
            {{ NAV_ITEMS.submit.label }}
          </NuxtLink>
          <NuxtLink
            :to="NAV_ITEMS.developer.path"
            class="text-gray-800 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-800"
            active-class="bg-gray-100"
            @click="closeMobileMenu"
          >
            {{ NAV_ITEMS.developer.label }}
          </NuxtLink>
          <NuxtLink
            :to="NAV_ITEMS.apiAnalytics.path"
            class="text-gray-800 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-800"
            active-class="bg-gray-100"
            @click="closeMobileMenu"
          >
            {{ NAV_ITEMS.apiAnalytics.label }}
          </NuxtLink>
          <!-- Mobile search bar -->
          <div class="px-2 pt-2 sm:px-3">
            <LazySearchBar
              v-model="searchQuery"
              :aria-label="ACCESSIBILITY_LABELS.searchResources"
              @search="handleMobileSearch"
            />
          </div>
        </div>
      </div>
    </header>
    <main id="main-content" role="main">
      <slot />
    </main>
    <footer class="bg-white mt-8 py-6 border-t" role="contentinfo">
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm"
      >
        {{ footerCopyright }}
        <p class="sr-only">Footer content ends</p>
      </div>
    </footer>

    <!-- PWA Install Prompt -->
    <client-only>
      <PWAInstallPrompt />
    </client-only>

    <!-- Offline Indicator -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, navigateTo } from '#app'
import { useResources } from '~/composables/useResources'
import type { NodeListOf } from 'dom'
import PWAInstallPrompt from '~/components/PWAInstallPrompt.vue'
import {
  APP_NAME,
  ACCESSIBILITY_LABELS,
  getCopyrightText,
} from '~/constants/app'

// Navigation items configuration
const NAV_ITEMS = {
  home: { label: 'Home', ariaLabel: ACCESSIBILITY_LABELS.returnToHome },
  search: { label: 'Search', path: '/search' },
  aiKeys: { label: 'AI Keys', path: '/ai-keys' },
  favorites: { label: 'Favorites', path: '/favorites' },
  about: { label: 'About', path: '/about' },
  submit: { label: 'Submit', path: '/submit' },
  developer: { label: 'Developer', path: '/developer' },
  apiAnalytics: { label: 'API Analytics', path: '/api-analytics' },
} as const

// Footer copyright text
const footerCopyright = computed(() =>
  getCopyrightText(new Date().getFullYear())
)

const mobileMenuOpen = ref(false)
const mobileMenuButton = ref<HTMLElement | null>(null)
const mobileMenuRef = ref<HTMLElement | null>(null)
const firstFocusableElement = ref<HTMLElement | null>(null)
const lastFocusableElement = ref<HTMLElement | null>(null)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const handleMobileSearch = (query: string) => {
  updateSearchQuery(query)
  closeMobileMenu()
  if (useRoute().path !== '/search') {
    navigateTo('/search')
  }
}

const { filterOptions, updateSearchQuery } = useResources()

const searchQuery = computed({
  get: () => filterOptions.value.searchQuery || '',
  set: value => updateSearchQuery(value),
})

const handleSearch = (query: string) => {
  updateSearchQuery(query)
  if (useRoute().path !== '/search') {
    navigateTo('/search')
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (!mobileMenuOpen.value) return

  if (event.key === 'Escape') {
    closeMobileMenu()
    mobileMenuButton.value?.focus()
  } else if (event.key === 'Tab') {
    if (event.shiftKey) {
      if (document.activeElement === firstFocusableElement.value) {
        event.preventDefault()
        lastFocusableElement.value?.focus()
      }
    } else {
      if (document.activeElement === lastFocusableElement.value) {
        event.preventDefault()
        firstFocusableElement.value?.focus()
      }
    }
  }
}

const setupFocusTrap = () => {
  nextTick(() => {
    if (!mobileMenuRef.value) return

    const focusableElements = mobileMenuRef.value.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])'
    ) as unknown as NodeListOf<HTMLElement>

    if (focusableElements.length > 0) {
      firstFocusableElement.value = focusableElements[0]
      lastFocusableElement.value =
        focusableElements[focusableElements.length - 1]
      firstFocusableElement.value?.focus()
    }
  })
}

watch(mobileMenuOpen, isOpen => {
  if (isOpen) {
    setupFocusTrap()
    document.addEventListener('keydown', handleKeyDown)
  } else {
    document.removeEventListener('keydown', handleKeyDown)
  }
})

onMounted(() => {
  closeMobileMenu()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>
