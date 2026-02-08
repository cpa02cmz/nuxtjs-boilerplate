// https://nuxt.com/docs/api/configuration/nuxt-config
// Flexy says: No more hardcoded values! All configuration is now modular.
import {
  appConfig,
  pwaConfig,
  seoConfig,
  themeConfig,
  cacheConfig,
  securityConfig,
} from './configs'

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

  // PWA Configuration - using modular config
  pwa: {
    strategies: pwaConfig.workbox.strategy as 'generateSW' | 'injectManifest',
    registerType: pwaConfig.workbox.registerType as 'autoUpdate' | 'prompt',
    manifest: {
      name: pwaConfig.manifest.name,
      short_name: pwaConfig.manifest.short_name,
      description: pwaConfig.manifest.description,
      theme_color: pwaConfig.manifest.theme_color,
      lang: pwaConfig.manifest.lang,
      display: pwaConfig.manifest.display as
        | 'standalone'
        | 'fullscreen'
        | 'minimal-ui'
        | 'browser',
      orientation: pwaConfig.manifest.orientation as
        | 'any'
        | 'natural'
        | 'landscape'
        | 'landscape-primary'
        | 'landscape-secondary'
        | 'portrait'
        | 'portrait-primary'
        | 'portrait-secondary'
        | undefined,
      background_color: pwaConfig.manifest.background_color,
      id: pwaConfig.manifest.id,
      start_url: pwaConfig.manifest.start_url,
      scope: pwaConfig.manifest.scope,
      icons: [...pwaConfig.manifest.icons],
    },
    workbox: {
      // Cache strategies for different assets
      globPatterns: cacheConfig.pwa.globPatterns,
      runtimeCaching: [
        {
          // Cache API calls with a network-first strategy
          urlPattern: '^/api/.*',
          handler: 'NetworkFirst',
          options: {
            cacheName: cacheConfig.pwa.api.name,
            expiration: {
              maxEntries: cacheConfig.pwa.api.maxEntries,
              maxAgeSeconds: cacheConfig.pwa.api.maxAgeSeconds,
            },
          },
        },
        {
          // Cache resources data
          urlPattern: '.*resources\\.json',
          handler: 'CacheFirst',
          options: {
            cacheName: cacheConfig.pwa.resources.name,
            expiration: {
              maxEntries: cacheConfig.pwa.resources.maxEntries,
              maxAgeSeconds: cacheConfig.pwa.resources.maxAgeSeconds,
            },
          },
        },
        {
          // Cache static assets
          urlPattern: '^https://fonts\\.(?:googleapis|gstatic)\\.com/.*',
          handler: 'CacheFirst',
          options: {
            cacheName: cacheConfig.pwa.fonts.name,
            expiration: {
              maxEntries: cacheConfig.pwa.fonts.maxEntries,
              maxAgeSeconds: cacheConfig.pwa.fonts.maxAgeSeconds,
            },
          },
        },
        {
          // Cache Nuxt build assets
          urlPattern:
            '^/_nuxt/.*\\.(js|css|png|svg|jpg|jpeg|gif|webp|woff|woff2)',
          handler: 'CacheFirst',
          options: {
            cacheName: cacheConfig.pwa.assets.name,
            expiration: {
              maxEntries: cacheConfig.pwa.assets.maxEntries,
              maxAgeSeconds: cacheConfig.pwa.assets.maxAgeSeconds,
            },
          },
        },
        {
          urlPattern: 'https://.*\\.githubusercontent\\.com/.*',
          handler: 'CacheFirst',
          options: {
            cacheName: cacheConfig.pwa.github.name,
            expiration: {
              maxEntries: cacheConfig.pwa.github.maxEntries,
              maxAgeSeconds: cacheConfig.pwa.github.maxAgeSeconds,
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
            cacheName: cacheConfig.pwa.images.name,
            expiration: {
              maxEntries: cacheConfig.pwa.images.maxEntries,
              maxAgeSeconds: cacheConfig.pwa.images.maxAgeSeconds,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
    devOptions: {
      enabled: pwaConfig.devOptions.enabled,
      suppressWarnings: pwaConfig.devOptions.suppressWarnings,
      navigateFallback: pwaConfig.devOptions.navigateFallback,
      navigateFallbackAllowlist: [/^\/$/],
      type: pwaConfig.devOptions.type as 'classic' | 'module',
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
    quality: securityConfig.image.quality,
    format: securityConfig.image.formats as (
      | 'webp'
      | 'avif'
      | 'jpeg'
      | 'png'
      | 'gif'
      | 'svg'
    )[],
  },

  // Additional performance optimizations
  features: {
    // Optimize for production
    inlineStyles: true,
  },

  // SEO and Security Configuration - using modular config
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
      ],
      script: [],
      // Add performance-related and security meta tags
      meta: [
        // Note: CSP is implemented via server plugin (server/plugins/security-headers.ts)
        // with dynamic nonce generation for proper security
        {
          name: 'referrer',
          content: securityConfig.headers['Referrer-Policy'],
        },
        { name: 'theme-color', content: themeConfig.pwa.themeColor },
        {
          name: 'msapplication-TileColor',
          content: themeConfig.pwa.msTileColor,
        },
        // Add Core Web Vitals meta tags
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, viewport-fit=cover',
        },
        // Resource hints
        { name: 'format-detection', content: 'telephone=no' },
        // SEO meta tags - using modular config
        {
          name: 'description',
          content: seoConfig.meta.description,
        },
        {
          name: 'keywords',
          content: seoConfig.meta.keywords,
        },
        { name: 'author', content: seoConfig.meta.author },
        // Open Graph tags - using modular config
        {
          property: 'og:title',
          content: seoConfig.meta.title,
        },
        {
          property: 'og:description',
          content: seoConfig.meta.description,
        },
        { property: 'og:type', content: seoConfig.og.type },
        { property: 'og:image', content: seoConfig.og.image },
        // Twitter card - using modular config
        { name: 'twitter:card', content: seoConfig.twitter.card },
        {
          name: 'twitter:title',
          content: seoConfig.meta.title,
        },
        {
          name: 'twitter:description',
          content: seoConfig.meta.description,
        },
      ],
      htmlAttrs: {
        lang: appConfig.lang,
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

  // Builder configuration
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
      },
    },
    // Optimize build speed
    esbuild: {
      logLevel: 'silent', // Reduce build noise
    },
    // Optimize module resolution
    resolve: {
      alias: {},
    },
    // Additional build performance optimizations
    optimizeDeps: {
      include: ['vue', 'vue-router'],
      exclude: [],
    },
  },

  // Additional build optimization settings
  build: {
    transpile: ['vue', 'entities', 'estree-walker'],
    analyze: false, // Enable only when needed for analysis
  },
})
