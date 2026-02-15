// https://nuxt.com/docs/api/configuration/nuxt-config
// Flexy says: No more hardcoded values! All configuration is now modular.
import {
  appConfig,
  pwaConfig,
  seoConfig,
  themeConfig,
  cacheConfig,
  securityConfig,
  DEFAULT_DEV_URL,
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
        DEFAULT_DEV_URL,
      canonicalUrl:
        process.env.NUXT_PUBLIC_CANONICAL_URL ||
        process.env.CANONICAL_URL ||
        DEFAULT_DEV_URL,
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
    // Enable compression (gzip + brotli)
    compressPublicAssets: {
      brotli: true,
      gzip: true,
    },
    // Improve build performance
    ignore: ['**/.git/**', '**/node_modules/**', '**/dist/**'],
    // Security headers are handled via the security plugins
    // to ensure proper nonce generation and dynamic header values
    plugins: [
      '~/server/plugins/security-headers.ts',
      '~/server/plugins/html-security.ts',
      '~/server/plugins/resource-validation.ts',
    ],
    // Suppress duplicate key warnings from @nuxt/image v2.0.0
    // This is a known upstream issue that doesn't affect functionality
    esbuild: {
      options: {
        logOverride: {
          'duplicate-object-key': 'silent',
        },
      },
    },
    // Route rules for caching and performance
    // Flexy says: No more hardcoded cache headers! Using cacheConfig.routes
    routeRules: {
      '/': {
        prerender: !process.env.NUXT_NO_PRERENDER,
        headers: {
          'Cache-Control': `public, max-age=${cacheConfig.routes.home.maxAge}, s-maxage=${cacheConfig.routes.home.sMaxAge}`,
        },
      },
      '/search': {
        prerender: !process.env.NUXT_NO_PRERENDER,
        headers: {
          'Cache-Control': `public, max-age=${cacheConfig.routes.search.maxAge}, s-maxage=${cacheConfig.routes.search.sMaxAge}`,
        },
      },
      '/about': {
        prerender: !process.env.NUXT_NO_PRERENDER,
        headers: {
          'Cache-Control': `public, max-age=${cacheConfig.routes.about.maxAge}, s-maxage=${cacheConfig.routes.about.sMaxAge}`,
        },
      },
      '/_nuxt/**': {
        headers: {
          'Cache-Control': `public, max-age=${cacheConfig.routes.assets.maxAge}, immutable`,
        },
      },
    },
  },

  // Image optimization configuration
  // Note: provider is omitted as @nuxt/image defaults to 'ipx' internally.
  // Setting it explicitly causes a duplicate key warning during build.
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
    // Smooth page transitions for better UX
    pageTransition: {
      name: 'page',
      mode: 'out-in',
    },
    layoutTransition: {
      name: 'layout',
      mode: 'out-in',
    },
    head: {
      link: [
        // Note: Google Fonts preconnect removed - not used by this application
        // Fonts are loaded via system font stack for better performance
        // Prefetch static resources only - API endpoints should not be prefetched
        // { rel: 'prefetch', href: '/api/resources.json' }, // DISABLED: Causes rate limiting issues
        // Note: Critical CSS is automatically injected by Nuxt
        // Do not preload /_nuxt/ directory as it causes 404 errors
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
    // Main routes with prerender - disabled during build if no database
    '/': {
      prerender: !process.env.NUXT_NO_PRERENDER,
    },
    '/ai-keys': {
      prerender: !process.env.NUXT_NO_PRERENDER,
    },
    '/about': {
      prerender: !process.env.NUXT_NO_PRERENDER,
    },
    '/search': {
      prerender: !process.env.NUXT_NO_PRERENDER,
    },
    '/submit': {
      prerender: !process.env.NUXT_NO_PRERENDER,
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
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.* calls in production
          drop_debugger: true, // Remove debugger statements
          pure_funcs: [
            'console.log',
            'console.info',
            'console.debug',
            'console.trace',
          ],
        },
        format: {
          comments: false, // Remove comments
        },
      },
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
          // Inline small chunks to reduce HTTP requests
          inlineDynamicImports: false,
        },
      },
    },
    // Optimize build speed
    esbuild: {
      logLevel: 'silent', // Reduce build noise
      drop: ['console', 'debugger'], // Remove console and debugger in production
    },
    // Optimize module resolution
    resolve: {
      alias: {},
    },
    // Additional build performance optimizations
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'fuse.js',
        'dompurify',
        '@tanstack/vue-virtual',
        'zod',
      ],
      exclude: [],
      // Enable dependency pre-bundling cache
      force: false,
    },
    // Enable persistent caching
    cacheDir: '.vite-cache',
  },

  // Additional build optimization settings
  build: {
    transpile: ['vue', 'entities', 'estree-walker'],
    analyze: false, // Enable only when needed for analysis
  },
})
