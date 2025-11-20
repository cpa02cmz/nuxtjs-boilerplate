<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Set default meta tags for the entire application
useSeoMeta({
  title: 'Free Stuff on the Internet - Free Resources for Developers',
  ogTitle: 'Free Stuff on the Internet - Free Resources for Developers',
  description:
    'Discover amazing free resources available on the internet - from AI tools to hosting services.',
  ogDescription:
    'Discover amazing free resources available on the internet - from AI tools to hosting services.',
  ogImage: '/og-image.jpg',
  twitterCard: 'summary_large_image',
})

// Add structured data for the website using JSON-LD
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Free Stuff on the Internet',
  description:
    'Discover amazing free resources available on the internet - from AI tools to hosting services.',
  url: 'https://free-stuff-on-the-internet.vercel.app/',
  potentialAction: {
    '@type': 'SearchAction',
    target:
      'https://free-stuff-on-the-internet.vercel.app/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

// Add JSON-LD structured data to the head
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(websiteSchema),
    },
  ],
})
</script>
