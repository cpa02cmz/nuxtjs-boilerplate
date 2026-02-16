<template>
  <div :class="[tailwind.layout.screenHeight, 'bg-gray-50 py-8']">
    <!-- ARIA Live Region for Announcements -->
    <div
      class="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ announcement }}
    </div>

    <div :class="[tailwind.containers.medium, 'mx-auto px-4']">
      <!-- Page Header with Animation -->
      <header
        class="mb-8 text-center"
        :class="{ 'animate-fade-in': !prefersReducedMotion }"
      >
        <div class="inline-flex items-center justify-center mb-4">
          <!-- Animated Code Icon -->
          <div
            class="relative"
            :class="{ 'animate-icon-float': !prefersReducedMotion }"
          >
            <div
              class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </div>
            <!-- Decorative sparkles -->
            <div
              v-if="!prefersReducedMotion"
              class="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-sparkle"
              aria-hidden="true"
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
        </div>
        <h1 :class="[tailwind.typography.pageTitle, 'mb-2']">
          Developer Portal
        </h1>
        <p class="text-gray-600 max-w-lg mx-auto">
          Build amazing applications with our powerful API. Access free
          resources programmatically.
        </p>
      </header>

      <div :class="[tailwind.cards.padded]">
        <!-- Getting Started Section with Stagger Animation -->
        <section
          :class="[tailwind.spacing.section]"
          :style="getSectionStyle(0)"
        >
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"
              :class="{ 'animate-icon-pulse': !prefersReducedMotion }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h2 :class="[tailwind.typography.sectionTitle]">
              Getting Started
            </h2>
          </div>
          <p :class="[tailwind.typography.body, 'mb-4']">
            Welcome to the Free Stuff on the Internet API! Our API allows you to
            access and interact with our collection of free resources
            programmatically.
          </p>

          <div
            :class="[
              tailwind.status.info.bg,
              tailwind.status.info.border,
              'rounded-md p-4 mb-4',
            ]"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-medium text-blue-800">
                Base URL
              </h3>
              <CopyButton
                content="https://yourdomain.com/api"
                label="Copy base URL"
                @copied="announce('Base URL copied to clipboard')"
              />
            </div>
            <div class="relative group">
              <p
                class="font-mono text-sm bg-white p-2 rounded border border-blue-200 transition-all duration-200 group-hover:shadow-sm"
              >
                https://yourdomain.com/api
              </p>
            </div>
          </div>
        </section>

        <!-- Authentication Section -->
        <section
          :class="[tailwind.spacing.section]"
          :style="getSectionStyle(1)"
        >
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"
              :class="{ 'animate-icon-pulse': !prefersReducedMotion }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 :class="[tailwind.typography.sectionTitle]">
              Authentication
            </h2>
          </div>
          <p :class="[tailwind.typography.body, 'mb-4']">
            To use the API, you need to include your API key in the request
            headers.
          </p>

          <CodeBlock
            code="X-API-Key: your-api-key-here"
            label="Header Format"
            :delay="1"
            @copied="announce('Header format copied to clipboard')"
          />

          <button
            :class="[
              tailwind.buttons.primaryBlue,
              'focus:outline-none mt-4 inline-flex items-center gap-2',
              !prefersReducedMotion && 'hover:shadow-md',
            ]"
            @click="goToApiKeys"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            Manage API Keys
          </button>
        </section>

        <!-- API Examples Section with Enhanced Code Blocks -->
        <section
          :class="[tailwind.spacing.section]"
          :style="getSectionStyle(2)"
        >
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"
              :class="{ 'animate-icon-pulse': !prefersReducedMotion }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 :class="[tailwind.typography.sectionTitle]">
              API Examples
            </h2>
          </div>

          <div class="space-y-6">
            <!-- Get Resources Example -->
            <div>
              <h3
                class="font-medium text-gray-800 mb-2 flex items-center gap-2"
              >
                <span class="w-2 h-2 bg-green-500 rounded-full" />
                Get Resources
              </h3>
              <CodeBlock
                :code="getResourcesCode"
                label="curl"
                :delay="2"
                @copied="announce('Get resources example copied to clipboard')"
              />
            </div>

            <!-- Search Resources Example -->
            <div>
              <h3
                class="font-medium text-gray-800 mb-2 flex items-center gap-2"
              >
                <span class="w-2 h-2 bg-blue-500 rounded-full" />
                Search Resources
              </h3>
              <CodeBlock
                :code="searchResourcesCode"
                label="curl"
                :delay="3"
                @copied="
                  announce('Search resources example copied to clipboard')
                "
              />
            </div>

            <!-- Submit Resource Example -->
            <div>
              <h3
                class="font-medium text-gray-800 mb-2 flex items-center gap-2"
              >
                <span class="w-2 h-2 bg-orange-500 rounded-full" />
                Submit a Resource
              </h3>
              <CodeBlock
                :code="submitResourceCode"
                label="curl"
                :delay="4"
                @copied="
                  announce('Submit resource example copied to clipboard')
                "
              />
            </div>
          </div>
        </section>

        <!-- Rate Limiting Section -->
        <section
          :class="[tailwind.spacing.section]"
          :style="getSectionStyle(3)"
        >
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center"
              :class="{ 'animate-icon-pulse': !prefersReducedMotion }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 :class="[tailwind.typography.sectionTitle]">
              Rate Limiting
            </h2>
          </div>
          <p :class="[tailwind.typography.body, 'mb-4']">
            Our API implements rate limiting to ensure fair usage. Each API key
            has its own rate limits:
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <RateLimitCard
              type="general"
              limit="100"
              unit="requests per minute"
              :delay="0"
            />
            <RateLimitCard
              type="search"
              limit="50"
              unit="requests per minute"
              :delay="1"
            />
            <RateLimitCard
              type="submission"
              limit="10"
              unit="requests per minute"
              :delay="2"
            />
          </div>

          <div
            :class="[
              tailwind.status.warning.bg,
              tailwind.status.warning.border,
              'rounded-md p-4',
            ]"
          >
            <h3
              class="font-medium text-yellow-800 mb-2 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Rate Limit Headers
            </h3>
            <p class="text-sm text-gray-700">
              Rate limit responses include headers:
            </p>
            <div class="flex flex-wrap gap-2 mt-2">
              <code
                v-for="header in rateLimitHeaders"
                :key="header"
                class="font-mono text-xs bg-yellow-100 px-2 py-1 rounded border border-yellow-200"
              >
                {{ header }}
              </code>
            </div>
          </div>
        </section>

        <!-- Error Handling Section -->
        <section
          :class="[tailwind.spacing.section]"
          :style="getSectionStyle(4)"
        >
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"
              :class="{ 'animate-icon-pulse': !prefersReducedMotion }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 :class="[tailwind.typography.sectionTitle]">
              Error Handling
            </h2>
          </div>
          <p :class="[tailwind.typography.body, 'mb-4']">
            The API returns standard HTTP status codes and error responses:
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResponseCard
              type="success"
              :code="successResponseCode"
              title="Success Response"
              :delay="0"
              @copied="announce('Success response example copied to clipboard')"
            />
            <ResponseCard
              type="error"
              :code="errorResponseCode"
              title="Error Response"
              :delay="1"
              @copied="announce('Error response example copied to clipboard')"
            />
          </div>
        </section>

        <!-- API Documentation CTA Section -->
        <section :style="getSectionStyle(5)">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center"
              :class="{ 'animate-icon-pulse': !prefersReducedMotion }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 :class="[tailwind.typography.sectionTitle]">
              API Documentation
            </h2>
          </div>
          <div class="flex flex-col sm:flex-row gap-4">
            <a
              href="/api-docs"
              target="_blank"
              :class="[
                tailwind.buttons.primaryBlue,
                'text-center inline-flex items-center justify-center gap-2',
                tailwind.focus.ringWithOffset,
                {
                  'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300':
                    !prefersReducedMotion,
                },
              ]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Interactive API Documentation
            </a>
            <a
              href="/api-keys"
              :class="[
                tailwind.buttons.primary,
                'text-center inline-flex items-center justify-center gap-2',
                tailwind.focus.ringWithOffset,
                {
                  'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300':
                    !prefersReducedMotion,
                },
              ]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              API Key Management
            </a>
          </div>
        </section>
      </div>

      <!-- Keyboard shortcut hint -->
      <div
        class="mt-8 text-center"
        :class="{ 'animate-fade-in-delayed': !prefersReducedMotion }"
      >
        <p class="text-sm text-gray-500">
          Press
          <kbd class="px-2 py-1 bg-gray-200 rounded text-xs font-medium">?</kbd>
          for keyboard shortcuts
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { tailwindClassesConfig as tailwind } from '~/configs/tailwind-classes.config'
import { animationConfig } from '~/configs/animation.config'

// Reduced motion preference
const prefersReducedMotion = ref(false)

// Screen reader announcement
const announcement = ref('')

// Code examples
const getResourcesCode = `curl -X GET \\
  -H "X-API-Key: your-api-key-here" \\
  "https://yourdomain.com/api/v1/resources?limit=10&category=tools"`

const searchResourcesCode = `curl -X GET \\
  -H "X-API-Key: your-api-key-here" \\
  "https://yourdomain.com/api/v1/search?q=hosting&pricing=Free"`

const submitResourceCode = `curl -X POST \\
  -H "X-API-Key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "My Resource",
    "description": "A brief description of my resource",
    "url": "https://example.com",
    "category": "Tools"
  }' \\
  "https://yourdomain.com/api/submissions"`

const successResponseCode = `{
  "success": true,
  "data": { ... }
}`

const errorResponseCode = `{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}`

const rateLimitHeaders = [
  'X-RateLimit-Limit',
  'X-RateLimit-Remaining',
  'X-RateLimit-Reset',
]

// Section animation styles - Flexy hates hardcoded 100!
const getSectionStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}
  return {
    animationDelay: `${index * animationConfig.developerPage.staggerDelayMs}ms`,
  }
}

// Announce to screen readers - Flexy hates hardcoded 1000!
const announce = (message: string) => {
  announcement.value = message
  setTimeout(() => {
    announcement.value = ''
  }, animationConfig.developerPage.announcementTimeoutMs)
}

// Navigation
const goToApiKeys = () => {
  navigateTo('/api-keys')
}

// Keyboard shortcuts
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === '?') {
    e.preventDefault()
    // Could show keyboard shortcuts modal
    announce(
      'Keyboard shortcuts: Press 1-5 to navigate to sections, C to copy code example'
    )
  }
}

onMounted(() => {
  // Check reduced motion preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    prefersReducedMotion.value = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
  }

  // Listen for keyboard shortcuts
  document.addEventListener('keydown', handleKeydown)
})

// Cleanup event listener to prevent memory leaks
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

useHead({
  title: 'Developer Portal - Free Stuff on the Internet',
  meta: [
    {
      name: 'description',
      content:
        'Developer documentation and API access for Free Stuff on the Internet',
    },
  ],
})
</script>

<style scoped>
/* Fade in animation */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}

.animate-fade-in-delayed {
  animation: fade-in 0.6s ease-out 0.5s forwards;
  opacity: 0;
}

/* Icon float animation */
@keyframes icon-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.animate-icon-float {
  animation: icon-float 3s ease-in-out infinite;
}

/* Icon pulse animation */
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
  animation: icon-pulse 2s ease-in-out infinite;
}

/* Sparkle animation */
@keyframes sparkle {
  0%,
  100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
}

.animate-sparkle {
  animation: sparkle 2s ease-in-out infinite;
}

/* Section entrance animation */
section {
  opacity: 0;
  transform: translateY(20px);
  animation: fade-in 0.5s ease-out forwards;
}

/* Reduced motion - disable animations */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .animate-fade-in-delayed,
  .animate-icon-float,
  .animate-icon-pulse,
  .animate-sparkle,
  section {
    animation: none !important;
    opacity: 1;
    transform: none;
  }
}
</style>
