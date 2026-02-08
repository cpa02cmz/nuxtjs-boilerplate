/**
 * PWA Configuration
 * Flexy says: Make PWA settings configurable!
 */

import { SITE_CONFIG, THEME_CONFIG } from './app.config'

// PWA Manifest Configuration
export const PWA_MANIFEST = {
  name: SITE_CONFIG.name,
  short_name: SITE_CONFIG.shortName,
  description: SITE_CONFIG.tagline,
  theme_color: THEME_CONFIG.colors.primary,
  lang: SITE_CONFIG.language,
  display: 'standalone' as const,
  orientation: 'any' as const,
  background_color: THEME_CONFIG.colors.background,
  id: '/',
  start_url: '/',
  scope: '/',
  icons: [
    {
      src: 'pwa/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: 'pwa/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
    {
      src: 'pwa/maskable-icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable',
    },
    {
      src: 'pwa/maskable-icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
}

// Cache Durations (in seconds)
const CACHE_DURATIONS = {
  ONE_HOUR: 60 * 60,
  ONE_DAY: 60 * 60 * 24,
  ONE_WEEK: 60 * 60 * 24 * 7,
  ONE_MONTH: 60 * 60 * 24 * 30,
  ONE_YEAR: 60 * 60 * 24 * 365,
} as const

// Workbox Runtime Caching Configuration
export const PWA_CACHE_CONFIG = {
  globPatterns: ['**/*.{js,css,html,png,svg,ico,jpg,webp,woff2}'],
  runtimeCaching: [
    {
      urlPattern: '^/api/.*',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: CACHE_DURATIONS.ONE_DAY,
        },
      },
    },
    {
      urlPattern: '.*resources\\.json',
      handler: 'CacheFirst',
      options: {
        cacheName: 'resources-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: CACHE_DURATIONS.ONE_WEEK,
        },
      },
    },
    {
      urlPattern: '^https://fonts\\.(?:googleapis|gstatic)\\.com/.*',
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: CACHE_DURATIONS.ONE_YEAR,
        },
      },
    },
    {
      urlPattern: '^/_nuxt/.*\\.(js|css|png|svg|jpg|jpeg|gif|webp|woff|woff2)',
      handler: 'CacheFirst',
      options: {
        cacheName: 'nuxt-assets-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: CACHE_DURATIONS.ONE_MONTH,
        },
      },
    },
    {
      urlPattern: 'https://.*\\.githubusercontent\\.com/.*',
      handler: 'CacheFirst',
      options: {
        cacheName: 'github-cdn-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: CACHE_DURATIONS.ONE_WEEK,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: '^https://.*\\.(png|jpe?g|gif|svg|webp)$',
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: CACHE_DURATIONS.ONE_WEEK,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
}

// PWA Development Options
export const PWA_DEV_OPTIONS = {
  enabled: process.env.NUXT_PUBLIC_PWA_DEV_ENABLED === 'true' || true,
  suppressWarnings: true,
  navigateFallback: '/',
  navigateFallbackAllowlist: [/^\/$/],
  type: 'module' as const,
} as const

// Export complete PWA configuration
export const PWA_CONFIG = {
  strategies: 'generateSW',
  registerType: 'autoUpdate',
  manifest: PWA_MANIFEST,
  workbox: PWA_CACHE_CONFIG,
  devOptions: PWA_DEV_OPTIONS,
}

export default PWA_CONFIG
