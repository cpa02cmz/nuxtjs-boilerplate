// PWA Configuration - Progressive Web App Settings
// Flexy hates hardcoded values! All PWA settings are now configurable.

import { appConfig } from './app.config'
import { themeConfig } from './theme.config'

export const pwaConfig = {
  // Manifest Settings
  manifest: {
    name: appConfig.name,
    short_name: appConfig.shortName,
    description: appConfig.description,
    theme_color: themeConfig.pwa.themeColor,
    background_color: themeConfig.pwa.backgroundColor,
    lang: appConfig.lang,
    display: process.env.PWA_DISPLAY || 'standalone',
    orientation: process.env.PWA_ORIENTATION || 'any',
    id: process.env.PWA_ID || '/',
    start_url: process.env.PWA_START_URL || '/',
    scope: process.env.PWA_SCOPE || '/',

    // Icons
    icons: [
      {
        src: process.env.PWA_ICON_192 || 'pwa/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: process.env.PWA_ICON_512 || 'pwa/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src:
          process.env.PWA_MASKABLE_ICON_192 || 'pwa/maskable-icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src:
          process.env.PWA_MASKABLE_ICON_512 || 'pwa/maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  },

  // Workbox Settings
  workbox: {
    strategy: process.env.PWA_WORKBOX_STRATEGY || 'generateSW',
    registerType: process.env.PWA_REGISTER_TYPE || 'autoUpdate',
    globPatterns: parseGlobPatterns(
      process.env.PWA_CACHE_GLOB_PATTERNS ||
        '**/*.{js,css,html,png,svg,ico,jpg,webp,woff2}'
    ),
  },

  // Dev Options
  devOptions: {
    enabled: process.env.PWA_DEV_ENABLED !== 'false',
    suppressWarnings: process.env.PWA_DEV_SUPPRESS_WARNINGS !== 'false',
    navigateFallback: process.env.PWA_DEV_NAVIGATE_FALLBACK || '/',
    type: process.env.PWA_DEV_TYPE || 'module',
  },
} as const

// Helper function to parse glob patterns
function parseGlobPatterns(value: string): string[] {
  return value.split(',').map(s => s.trim())
}

export type PwaConfig = typeof pwaConfig
