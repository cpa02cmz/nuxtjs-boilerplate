<template>
  <div
    :class="`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors ${animationConfig.tailwindDurations.standard}`"
  >
    <!-- Skip to main content link for screen readers -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-gray-900 focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
    >
      Skip to main content
    </a>

    <header
      :class="`bg-white dark:bg-gray-800 shadow dark:shadow-gray-900 transition-colors ${animationConfig.tailwindDurations.standard}`"
      role="banner"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink
              to="/"
              :class="`text-xl font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-400 focus:rounded transition-colors ${animationConfig.tailwindDurations.normal}`"
              :aria-label="contentConfig.layout.ariaLabels.homeLink"
            >
              Free Stuff on the Internet
            </NuxtLink>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden lg:flex items-center flex-1 max-w-lg mx-8">
            <LazySearchBar
              v-model="searchQuery"
              :aria-label="contentConfig.layout.ariaLabels.search"
              @search="handleSearch"
            />
          </div>

          <nav
            class="hidden lg:flex items-center space-x-4"
            role="navigation"
            :aria-label="contentConfig.layout.ariaLabels.mainNav"
          >
            <!-- Theme Toggle Button -->
            <ClientOnly>
              <button
                type="button"
                :class="`p-2 rounded-md text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-400 transition-colors ${animationConfig.tailwindDurations.normal}`"
                :aria-label="
                  isDark ? 'Switch to light mode' : 'Switch to dark mode'
                "
                @click="cycleTheme"
              >
                <!-- Sun Icon (shown in dark mode) -->
                <svg
                  v-if="isDark"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <!-- Moon Icon (shown in light mode) -->
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              </button>
              <template #fallback>
                <div class="p-2 rounded-md w-9 h-9">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                </div>
              </template>
            </ClientOnly>

            <NuxtLink
              to="/"
              :class="`text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-400 transition-colors ${animationConfig.tailwindDurations.normal}`"
              :aria-label="contentConfig.layout.ariaLabels.homeLink"
            >
              Home
            </NuxtLink>
            <NuxtLink
              to="/search"
              :class="`text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-400 transition-colors ${animationConfig.tailwindDurations.normal}`"
              active-class="bg-gray-100 dark:bg-gray-800"
            >
              Search
            </NuxtLink>
            <NuxtLink
              to="/ai-keys"
              :class="`text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-400 transition-colors ${animationConfig.tailwindDurations.normal}`"
              active-class="bg-gray-100 dark:bg-gray-800"
            >
              AI Keys
            </NuxtLink>
            <NuxtLink
              to="/favorites"
              :class="`text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-400 transition-colors ${animationConfig.tailwindDurations.normal}`"
              active-class="bg-gray-100 dark:bg-gray-800"
            >
              Favorites
            </NuxtLink>
            <NuxtLink
              to="/about"
              :class="`text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-400 transition-colors ${animationConfig.tailwindDurations.normal}`"
              active-class="bg-gray-100 dark:bg-gray-800"
            >
              About
            </NuxtLink>
            <NuxtLink
              to="/submit"
              :class="`text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-400 transition-colors ${animationConfig.tailwindDurations.normal}`"
              active-class="bg-gray-200 dark:bg-gray-700"
            >
              Submit
            </NuxtLink>
            <NuxtLink
              to="/developer"
              :class="`text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-400 transition-colors ${animationConfig.tailwindDurations.normal}`"
              active-class="bg-gray-100 dark:bg-gray-800"
            >
              Developer
            </NuxtLink>
            <NuxtLink
              to="/api-analytics"
              :class="`text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-400 transition-colors ${animationConfig.tailwindDurations.normal}`"
              active-class="bg-gray-100 dark:bg-gray-800"
            >
              API Analytics
            </NuxtLink>
            <NuxtLink
              v-if="comparisonCount > 0"
              to="/compare"
              :class="[
                `relative inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all ${animationConfig.tailwindDurations.normal}`,
                { 'animate-bounce-scale': isCountAnimating },
              ]"
              :aria-label="
                contentConfig.layout.ariaLabels.compare.replace(
                  '{{count}}',
                  String(comparisonCount)
                )
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Compare
              <span
                class="ml-1.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-bold bg-white text-blue-600 rounded-full"
                :class="{ 'animate-pop': isCountAnimating }"
              >
                {{ comparisonCount }}
              </span>
            </NuxtLink>
          </nav>

          <!-- Mobile menu button -->
          <div class="flex items-center lg:hidden space-x-2">
            <!-- Theme Toggle Button (Mobile) -->
            <ClientOnly>
              <button
                type="button"
                :class="`p-2 rounded-md text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-800 dark:focus:ring-gray-400 transition-colors ${animationConfig.tailwindDurations.normal}`"
                :aria-label="
                  isDark ? 'Switch to light mode' : 'Switch to dark mode'
                "
                @click="cycleTheme"
              >
                <svg
                  v-if="isDark"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              </button>
              <template #fallback>
                <div class="p-2 rounded-md w-10 h-10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                </div>
              </template>
            </ClientOnly>

            <button
              ref="mobileMenuButton"
              type="button"
              :class="`inline-flex items-center justify-center p-2 rounded-md text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-800 dark:focus:ring-gray-400 transition-colors ${animationConfig.tailwindDurations.normal}`"
              aria-controls="mobile-menu"
              :aria-expanded="mobileMenuOpen"
              :aria-label="
                mobileMenuOpen ? 'Close main menu' : 'Open main menu'
              "
              @click="toggleMobileMenu"
            >
              <span class="sr-only">{{
                mobileMenuOpen ? 'Close main menu' : 'Open main menu'
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
        :class="`lg:hidden bg-white dark:bg-gray-800 transition-colors ${animationConfig.tailwindDurations.standard}`"
      >
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <NuxtLink
            to="/"
            :class="`text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-400 transition-colors ${animationConfig.tailwindDurations.normal}`"
            @click="closeMobileMenu"
          >
            Home
          </NuxtLink>
          <NuxtLink
            to="/search"
            :class="`text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-400 transition-colors ${animationConfig.tailwindDurations.normal}`"
            active-class="bg-gray-100 dark:bg-gray-700"
            @click="closeMobileMenu"
          >
            Search
          </NuxtLink>
          <NuxtLink
            to="/ai-keys"
            :class="`text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-400 transition-colors ${animationConfig.tailwindDurations.normal}`"
            active-class="bg-gray-100 dark:bg-gray-700"
            @click="closeMobileMenu"
          >
            AI Keys
          </NuxtLink>
          <NuxtLink
            to="/favorites"
            :class="`text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-400 transition-colors ${animationConfig.tailwindDurations.normal}`"
            active-class="bg-gray-100 dark:bg-gray-700"
            @click="closeMobileMenu"
          >
            Favorites
          </NuxtLink>
          <NuxtLink
            to="/about"
            :class="`text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-400 transition-colors ${animationConfig.tailwindDurations.normal}`"
            active-class="bg-gray-100 dark:bg-gray-700"
            @click="closeMobileMenu"
          >
            About
          </NuxtLink>
          <NuxtLink
            to="/submit"
            :class="`text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-400 transition-colors ${animationConfig.tailwindDurations.normal}`"
            active-class="bg-gray-200 dark:bg-gray-600"
            @click="closeMobileMenu"
          >
            Submit
          </NuxtLink>
          <NuxtLink
            to="/developer"
            :class="`text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-400 transition-colors ${animationConfig.tailwindDurations.normal}`"
            active-class="bg-gray-100 dark:bg-gray-700"
            @click="closeMobileMenu"
          >
            Developer
          </NuxtLink>
          <NuxtLink
            to="/api-analytics"
            :class="`text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-400 transition-colors ${animationConfig.tailwindDurations.normal}`"
            active-class="bg-gray-100 dark:bg-gray-700"
            @click="closeMobileMenu"
          >
            API Analytics
          </NuxtLink>
          <NuxtLink
            v-if="comparisonCount > 0"
            to="/compare"
            :class="`flex items-center justify-between text-gray-800 dark:text-gray-200 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${animationConfig.tailwindDurations.normal}`"
            active-class="bg-blue-100 dark:bg-blue-900/50"
            @click="closeMobileMenu"
          >
            <span class="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Compare Resources
            </span>
            <span
              class="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 text-sm font-bold bg-blue-600 text-white rounded-full"
            >
              {{ comparisonCount }}
            </span>
          </NuxtLink>
          <!-- Mobile search bar -->
          <div class="px-2 pt-2 sm:px-3">
            <LazySearchBar
              v-model="searchQuery"
              :aria-label="contentConfig.layout.ariaLabels.search"
              @search="handleMobileSearch"
            />
          </div>
        </div>
      </div>
    </header>
    <main
      id="main-content"
      role="main"
      tabindex="-1"
      :aria-label="contentConfig.layout.ariaLabels.mainContent"
    >
      <slot />
    </main>
    <footer
      :class="`bg-white dark:bg-gray-800 mt-8 py-6 border-t dark:border-gray-700 transition-colors ${animationConfig.tailwindDurations.standard}`"
      role="contentinfo"
    >
      <div
        :class="`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400 text-sm transition-colors ${animationConfig.tailwindDurations.normal}`"
      >
        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <span>
            © {{ new Date().getFullYear() }} Free Stuff on the Internet. All
            rights reserved.
          </span>
          <button
            :class="`inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded px-2 py-1 transition-colors ${animationConfig.tailwindDurations.normal}`"
            :aria-label="contentConfig.layout.ariaLabels.keyboardShortcuts"
            @click="openShortcutsHelp"
          >
            <kbd
              class="px-1.5 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
            >
              ?
            </kbd>
            <span>Shortcuts</span>
          </button>
        </div>
        <p class="sr-only">Footer content ends</p>
      </div>
    </footer>

    <!-- PWA Install Prompt -->
    <client-only>
      <PWAInstallPrompt />
    </client-only>

    <!-- Scroll to Top Button -->
    <client-only>
      <LazyScrollToTop />
    </client-only>

    <!-- Keyboard Shortcuts Help -->
    <client-only>
      <KeyboardShortcutsHelp ref="shortcutsHelpRef" />
    </client-only>

    <!-- Offline Indicator -->
    <client-only>
      <OfflineIndicator />
    </client-only>

    <!-- Page Transition - Palette's micro-UX enhancement! -->
    <client-only>
      <PageTransition />
    </client-only>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, navigateTo } from '#app'
import { useResources } from '~/composables/useResources'
import { useResourceComparison } from '~/composables/useResourceComparison'
import { useTheme } from '~/composables/useTheme'
import { contentConfig } from '~/configs/content.config'
import { easingConfig } from '~/configs/easing.config'
import { animationConfig } from '~/configs/animation.config'
// Flexy hates hardcoded duration classes! Using animationConfig.tailwindDurations for consistency 🧩
// NodeListOf is a global DOM type, no need to import
import PWAInstallPrompt from '~/components/PWAInstallPrompt.vue'
import KeyboardShortcutsHelp from '~/components/KeyboardShortcutsHelp.vue'
import OfflineIndicator from '~/components/OfflineIndicator.vue'
import PageTransition from '~/components/PageTransition.vue'

// Theme state
const { isDark, cycleTheme } = useTheme()

const mobileMenuOpen = ref(false)
const mobileMenuButton = ref<HTMLElement | null>(null)
const mobileMenuRef = ref<HTMLElement | null>(null)
const firstFocusableElement = ref<HTMLElement | null>(null)
const lastFocusableElement = ref<HTMLElement | null>(null)
const shortcutsHelpRef = ref<InstanceType<typeof KeyboardShortcutsHelp> | null>(
  null
)

const openShortcutsHelp = () => {
  shortcutsHelpRef.value?.open()
}

// Comparison counter state
const { comparisonCount } = useResourceComparison()
const isCountAnimating = ref(false)
const previousCount = ref(comparisonCount.value)

// Watch for comparison count changes to trigger animation
watch(comparisonCount, (newCount, oldCount) => {
  if (newCount !== oldCount && newCount > 0) {
    isCountAnimating.value = true
    setTimeout(() => {
      isCountAnimating.value = false
    }, animationConfig.cssTransitions.slowMs)
  }
  previousCount.value = newCount
})

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

    const focusableElements = Array.from(
      mobileMenuRef.value.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])'
      )
    ) as HTMLElement[]

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

<style scoped>
/* Bounce scale animation for comparison button */
/* Flexy hates hardcoded values! Using modular easing config */
.animate-bounce-scale {
  animation: bounce-scale
    v-bind('easingConfig?.animations?.bounceScale?.durationMs ?? 400 + "ms"')
    v-bind(
      'easingConfig?.animations?.bounceScale?.easing ?? "cubic-bezier(0.175, 0.885, 0.32, 1.275)"'
    );
}

@keyframes bounce-scale {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(0.95);
  }
  80% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

/* Pop animation for counter badge */
/* Flexy hates hardcoded values! Using modular easing config */
.animate-pop {
  animation: pop
    v-bind('easingConfig?.animations?.pop?.durationMs ?? 400 + "ms"')
    v-bind(
      'easingConfig?.animations?.pop?.easing ?? "cubic-bezier(0.175, 0.885, 0.32, 1.275)"'
    );
}

@keyframes pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-bounce-scale,
  .animate-pop {
    animation: none;
  }
}
</style>
