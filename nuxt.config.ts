import {
  APP_NAME,
  APP_SHORT_NAME,
  APP_DESCRIPTION,
  THEME_COLORS,
  DEFAULT_LANGUAGE,
  SEO_KEYWORDS,
} from './constants/app'
import { CACHE_DURATIONS } from './constants/external'
import { IMAGE_CONFIG } from './constants/ui'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false }, // Disable in production for performance
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxt/test-utils/module',
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@vite-pwa/nuxt',
    './modules/openapi',
  ],

  // Runtime configuration for environment variables
  runtimeConfig: {
    public: {
      siteUrl:
        process.env.NUXT_PUBLIC_SITE_URL ||
        process.env.SITE_URL ||
        process.env.NUXT_PUBLIC_CANONICAL_URL ||
        process.env.CANONICAL_URL ||
        process.env.HOST ||
        process.env.VERCEL_URL ||
        'http://localhost:3000',
      canonicalUrl:
        process.env.NUXT_PUBLIC_CANONICAL_URL ||
        process.env.CANONICAL_URL ||
        'http://localhost:3000',
    },
  },

  // PWA Configuration - merged from both branches
  pwa: {
    strategies: 'generateSW',
    registerType: 'autoUpdate',
    manifest: {
      name: APP_NAME,
      short_name: APP_SHORT_NAME,
      description: APP_DESCRIPTION,
      theme_color: THEME_COLORS.primary,
      lang: DEFAULT_LANGUAGE,
      display: 'standalone',
      orientation: 'any',
      background_color: THEME_COLORS.background,
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
    },
    workbox: {
      // Cache strategies for different assets
      globPatterns: ['**/*.{js,css,html,png,svg,ico,jpg,webp,woff2}'],
      runtimeCaching: [
        {
          // Cache API calls with a network-first strategy
          urlPattern: '^/api/.*',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: CACHE_DURATIONS.api,
            },
          },
        },
        {
          // Cache resources data
          urlPattern: '.*resources\\.json',
          handler: 'CacheFirst',
          options: {
            cacheName: 'resources-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
            },
          },
        },
        {
          // Cache static assets
          urlPattern: '^https://fonts\\.(?:googleapis|gstatic)\\.com/.*',
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: CACHE_DURATIONS.fonts,
            },
          },
        },
        {
          // Cache Nuxt build assets
          urlPattern:
            '^/_nuxt/.*\\.(js|css|png|svg|jpg|jpeg|gif|webp|woff|woff2)',
          handler: 'CacheFirst',
          options: {
            cacheName: 'nuxt-assets-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: CACHE_DURATIONS.assets,
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
              maxAgeSeconds: CACHE_DURATIONS.github,
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
              maxAgeSeconds: CACHE_DURATIONS.images,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },

  // Security and performance configuration
  experimental: {
    // Enable nonce-based CSP support
    payloadExtraction: true,
    // Enable component islands for better performance
    componentIslands: true,
  },

  // Nitro configuration for security and performance
  nitro: {
    // Optimize server-side rendering
    minify: true,
    // Enable compression
    compressPublicAssets: true,
    // Improve build performance
    ignore: ['**/.git/**', '**/node_modules/**', '**/dist/**'],
    // Security headers are handled via the security plugins
    // to ensure proper nonce generation and dynamic header values
    plugins: [
      '~/server/plugins/security-headers.ts',
      '~/server/plugins/html-security.ts',
      '~/server/plugins/resource-validation.ts',
    ],
  },

  // Image optimization configuration
  image: {
    quality: IMAGE_CONFIG.quality,
    format: [...IMAGE_CONFIG.formats],
    densities: [...IMAGE_CONFIG.densities],
  },

  // Additional performance optimizations
  features: {
    // Optimize for production
    inlineStyles: true,
  },

  // SEO and Security Configuration - using built-in meta handling
  app: {
    head: {
      link: [
        // Preconnect to external domains
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: 'anonymous',
        },
        // Prefetch resources that might be needed later
        { rel: 'prefetch', href: '/api/resources.json' },
        { rel: 'prefetch', href: '/api/submissions' },
        // Add preloading for critical resources
        { rel: 'preload', href: '/favicon.ico', as: 'image' },
        // Preload critical CSS
        {
          rel: 'preload',
          href: '/_nuxt/',
          as: 'fetch',
          crossorigin: 'anonymous',
        },
        // DNS prefetch for external resources
        { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
        { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
        // Add canonical URL - will be set dynamically in app.vue
      ],
      script: [
        // Add script for performance monitoring if needed
        // Preload important scripts
      ],
      // Add performance-related and security meta tags
      meta: [
        // Note: CSP is implemented via server plugin (server/plugins/security-headers.ts)
        // with dynamic nonce generation for proper security
        { name: 'referrer', content: 'no-referrer' },
        { name: 'theme-color', content: THEME_COLORS.background },
        { name: 'msapplication-TileColor', content: THEME_COLORS.background },
        // Add Core Web Vitals meta tags
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, viewport-fit=cover',
        },
        // Resource hints
        { name: 'format-detection', content: 'telephone=no' },
        // SEO meta tags
        {
          name: 'description',
          content: APP_DESCRIPTION,
        },
        {
          name: 'keywords',
          content: SEO_KEYWORDS.join(', '),
        },
        { name: 'author', content: APP_NAME },
        // Open Graph tags
        {
          property: 'og:title',
          content: `${APP_NAME} - Free Resources for Developers`,
        },
        {
          property: 'og:description',
          content: APP_DESCRIPTION,
        },
        { property: 'og:type', content: 'website' },
        // og:url will be set dynamically in app.vue
        { property: 'og:image', content: '/og-image.jpg' }, // This will be updated later
        // Twitter card
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: `${APP_NAME} - Free Resources for Developers`,
        },
        {
          name: 'twitter:description',
          content: APP_DESCRIPTION,
        },
      ],
      // Add resource hints
      htmlAttrs: {
        lang: 'en',
      },
    },
  },

  routeRules: {
    // Main routes with prerender
    '/': {
      prerender: true,
    },
    '/ai-keys': {
      prerender: true,
    },
    '/about': {
      prerender: true,
    },
    '/search': {
      prerender: true,
    },
    '/submit': {
      prerender: true,
    },
    // API routes
    '/api/**': {
      // Cache control handled by security headers plugin
    },
    // Static assets
    '/_nuxt/**': {
      // Cache control handled by security headers plugin
    },
  },

  // Performance optimizations are included in experimental section above
  // Explicitly use Vite for faster builds
  builder: 'vite',

  // Optimize bundle size
  vite: {
    build: {
      cssCodeSplit: true,
      minify: 'terser',
      target: 'esnext',
      sourcemap: false, // Disable sourcemaps for faster builds in CI
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor chunks to improve caching
            'vendor-vue': ['vue', '@vue/reactivity', 'vue-router'],
            'vendor-search': ['fuse.js'],
            'vendor-security': ['dompurify'],
            'vendor-web-vitals': ['web-vitals'],
          },
          // Optimize chunk naming for better caching
          chunkFileNames: '_nuxt/[name].[hash].js',
          entryFileNames: '_nuxt/[name].[hash].js',
        },
        // Note: @nuxt/kit should NOT be externalized as it's required by custom modules
      },
    },
    // Optimize build speed
    esbuild: {
      logLevel: 'silent', // Reduce build noise
      // Suppress specific warnings that are build artifacts
      logOverride: {
        'duplicate-key': 'silent',
      },
    },
    // Optimize module resolution
    resolve: {
      // Enable more aggressive caching
      alias: {
        // Add common aliases to speed up resolution
      },
    },
    // Additional build performance optimizations
    optimizeDeps: {
      // Only scan necessary files
      include: ['vue', 'vue-router'],
      // Exclude heavy dependencies that shouldn't be pre-bundled
      exclude: [],
    },
  },

  // Additional build optimization settings
  build: {
    // Optimize for faster builds
    transpile: ['vue', 'entities', 'estree-walker'],
    // Add more detailed build information
    analyze: false, // Enable only when needed for analysis
  },
})
