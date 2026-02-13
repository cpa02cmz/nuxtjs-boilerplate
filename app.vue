<template>
  <ClientOnly>
    <ErrorBoundary>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </ErrorBoundary>
    <template #fallback>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
// This app.vue file ensures proper layout integration across the application
// It replaces the default Nuxt welcome page and integrates with the custom default layout
// All pages will now properly render within the default layout structure

// Set default meta tags for the entire application
const runtimeConfig = useRuntimeConfig()

// Import ErrorBoundary component for global error handling
import ErrorBoundary from '~/components/ErrorBoundary.vue'

// Import SEO config - Flexy hates hardcoded values!
import { seoConfig } from '~/configs/seo.config'

useSeoMeta({
  title: seoConfig.meta.title,
  ogTitle: seoConfig.meta.title,
  description: seoConfig.meta.description,
  ogDescription: seoConfig.meta.description,
  ogImage: `${runtimeConfig.public.canonicalUrl}${seoConfig.og.image}`,
  ogImageWidth: String(seoConfig.og.imageWidth),
  ogImageHeight: String(seoConfig.og.imageHeight),
  ogImageType: 'image/jpeg',
  ogUrl: runtimeConfig.public.canonicalUrl,
  ogType: seoConfig.og.type as 'website' | 'article' | undefined,
  twitterCard: seoConfig.twitter.card as
    | 'summary'
    | 'summary_large_image'
    | undefined,
  twitterSite: seoConfig.twitter.site,
  twitterCreator: seoConfig.twitter.creator,
})

// Add structured data for the website using JSON-LD
const websiteSchema = {
  '@context': seoConfig.schema.context,
  '@type': seoConfig.structuredData.type,
  name: seoConfig.structuredData.name,
  description: seoConfig.structuredData.description,
  url: runtimeConfig.public.canonicalUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${runtimeConfig.public.canonicalUrl}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

// Add JSON-LD structured data to the head
useHead({
  link: [
    // Note: Google Fonts dns-prefetch removed - not used by this application
    // Fonts are loaded via system font stack for better performance
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
