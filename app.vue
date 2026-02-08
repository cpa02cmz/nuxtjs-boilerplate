<template>
  <ErrorBoundary>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </ErrorBoundary>
</template>

<script setup lang="ts">
import {
  APP_NAME,
  APP_DESCRIPTION,
  OG_IMAGE_PATH,
  OG_IMAGE_DIMENSIONS,
} from '~/constants/app'
import { SOCIAL_HANDLES, JSON_LD_CONTEXT, SCHEMA_TYPES } from '~/constants/seo'
import { EXTERNAL_FONTS } from '~/constants/external'

// This app.vue file ensures proper layout integration across the application
// It replaces the default Nuxt welcome page and integrates with the custom default layout
// All pages will now properly render within the default layout structure

// Set default meta tags for the entire application
const runtimeConfig = useRuntimeConfig()

// Import ErrorBoundary component for global error handling
import ErrorBoundary from '~/components/ErrorBoundary.vue'

useSeoMeta({
  title: `${APP_NAME} - Free Resources for Developers`,
  ogTitle: `${APP_NAME} - Free Resources for Developers`,
  description: APP_DESCRIPTION,
  ogDescription: APP_DESCRIPTION,
  ogImage: `${runtimeConfig.public.canonicalUrl}${OG_IMAGE_PATH}`,
  ogImageWidth: OG_IMAGE_DIMENSIONS.width,
  ogImageHeight: OG_IMAGE_DIMENSIONS.height,
  ogImageType: OG_IMAGE_DIMENSIONS.type,
  ogUrl: runtimeConfig.public.canonicalUrl,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterSite: SOCIAL_HANDLES.twitter,
  twitterCreator: SOCIAL_HANDLES.twitter,
})

// Add structured data for the website using JSON-LD
const websiteSchema = {
  '@context': JSON_LD_CONTEXT,
  '@type': SCHEMA_TYPES.website,
  name: APP_NAME,
  description: APP_DESCRIPTION,
  url: runtimeConfig.public.canonicalUrl,
  potentialAction: {
    '@type': SCHEMA_TYPES.searchAction,
    target: `${runtimeConfig.public.canonicalUrl}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

// Add JSON-LD structured data to the head
useHead({
  link: [
    // Preload critical resources
    {
      rel: 'preload',
      as: 'font',
      href: EXTERNAL_FONTS.google.inter,
      crossorigin: 'anonymous',
    },
    // Add resource hints for performance
    { rel: 'dns-prefetch', href: EXTERNAL_FONTS.google.url },
    { rel: 'dns-prefetch', href: EXTERNAL_FONTS.google.gstatic },
    // Add canonical URL
    {
      rel: 'canonical',
      href: runtimeConfig.public.canonicalUrl,
    },
  ],
  meta: [
    // Add og:url using runtime config
    {
      property: 'og:url',
      content: runtimeConfig.public.canonicalUrl,
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(websiteSchema),
    },
  ],
  // Add accessibility-related meta tags and attributes
  bodyAttrs: {
    class: 'font-sans antialiased',
  },
})

// Add global accessibility utilities
onMounted(() => {
  // Add visual focus indicators when using keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      document.body.classList.add('keyboard-nav')
      document.body.classList.remove('mouse-nav')
    }
  }

  const handleMouseDown = () => {
    document.body.classList.remove('keyboard-nav')
    document.body.classList.add('mouse-nav')
  }

  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('mousedown', handleMouseDown)

  // Cleanup event listeners
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('mousedown', handleMouseDown)
  })

  // Handle online/offline status
  window.addEventListener('online', () => {})

  window.addEventListener('offline', () => {
    // Optionally redirect to offline page or show notification
  })

  // Cleanup event listeners
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('mousedown', handleMouseDown)
    window.removeEventListener('beforeinstallprompt', () => {
      // We can't remove the specific deferredPrompt function since it's in a closure
    })
  })
})
</script>
