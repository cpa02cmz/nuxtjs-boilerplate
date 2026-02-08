/**
 * Application Configuration
 * Flexy says: No more hardcoded values!
 * All app-wide constants and configurations centralized here
 */

// Site and Brand Configuration
export const SITE_CONFIG = {
  name: process.env.NUXT_PUBLIC_SITE_NAME || 'Free Stuff on the Internet',
  shortName: process.env.NUXT_PUBLIC_SITE_SHORT_NAME || 'Free Resources',
  tagline:
    process.env.NUXT_PUBLIC_SITE_TAGLINE ||
    'Discover amazing free resources available on the internet - from AI tools to hosting services.',
  author: process.env.NUXT_PUBLIC_SITE_AUTHOR || 'Free Stuff on the Internet',
  language: process.env.NUXT_PUBLIC_SITE_LANGUAGE || 'en',
  canonicalUrl:
    process.env.NUXT_PUBLIC_CANONICAL_URL ||
    process.env.CANONICAL_URL ||
    'http://localhost:3000',
  twitterHandle: process.env.NUXT_PUBLIC_TWITTER_HANDLE || '@yourTwitterHandle',
} as const

// Theme and Colors
export const THEME_CONFIG = {
  colors: {
    primary: process.env.NUXT_PUBLIC_THEME_PRIMARY_COLOR || '#4f46e5',
    background: process.env.NUXT_PUBLIC_THEME_BACKGROUND_COLOR || '#ffffff',
    themeColor: process.env.NUXT_PUBLIC_THEME_COLOR || '#ffffff',
    tileColor: process.env.NUXT_PUBLIC_TILE_COLOR || '#ffffff',
  },
} as const

// SEO Configuration
export const SEO_CONFIG = {
  titleTemplate: '{title} - Free Resources for Developers',
  defaultTitle: 'Free Stuff on the Internet - Free Resources for Developers',
  defaultDescription:
    'Discover amazing free resources available on the internet - from AI tools to hosting services.',
  keywords:
    'free resources, AI tools, hosting, databases, CDN, VPS, web development',
  ogImage: '/og-image.jpg',
  ogType: 'website',
  twitterCard: 'summary_large_image',
} as const

// Feature Flags
export const FEATURE_FLAGS = {
  devtools: process.env.NUXT_PUBLIC_ENABLE_DEVTOOLS === 'true' || false,
  pwa: process.env.NUXT_PUBLIC_ENABLE_PWA !== 'false',
  analytics: process.env.NUXT_PUBLIC_ENABLE_ANALYTICS === 'true',
} as const

// Route Configuration
export const ROUTE_CONFIG = {
  prerender: ['/', '/ai-keys', '/about', '/search', '/submit'] as const,
} as const

// Image Optimization Configuration
export const IMAGE_CONFIG = {
  quality: parseInt(process.env.NUXT_PUBLIC_IMAGE_QUALITY || '80'),
  formats: (process.env.NUXT_PUBLIC_IMAGE_FORMATS?.split(',') as (
    | 'webp'
    | 'avif'
    | 'jpeg'
    | 'png'
    | 'jpg'
  )[]) || ['webp', 'avif', 'jpeg'],
  densities: [1, 2],
}

// API Configuration
export const API_CONFIG = {
  pagination: {
    defaultLimit: parseInt(process.env.NUXT_PUBLIC_API_DEFAULT_LIMIT || '20'),
    maxLimit: parseInt(process.env.NUXT_PUBLIC_API_MAX_LIMIT || '100'),
    defaultOffset: 0,
  },
  cache: {
    resources: parseInt(process.env.NUXT_PUBLIC_API_CACHE_RESOURCES || '300'), // 5 minutes
    search: parseInt(process.env.NUXT_PUBLIC_API_CACHE_SEARCH || '120'), // 2 minutes
    trending: parseInt(process.env.NUXT_PUBLIC_API_CACHE_TRENDING || '60'),
  },
} as const

// Export all configs
export default {
  site: SITE_CONFIG,
  theme: THEME_CONFIG,
  seo: SEO_CONFIG,
  features: FEATURE_FLAGS,
  routes: ROUTE_CONFIG,
  image: IMAGE_CONFIG,
  api: API_CONFIG,
}
