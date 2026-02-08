// https://nuxt.com/docs/api/configuration/nuxt-config
import {
  SITE_CONFIG,
  THEME_CONFIG,
  SEO_CONFIG,
  FEATURE_FLAGS,
  IMAGE_CONFIG,
  PWA_CONFIG,
} from './configs'

export default defineNuxtConfig({
  devtools: { enabled: FEATURE_FLAGS.devtools },
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
        SITE_CONFIG.canonicalUrl ||
        process.env.VERCEL_URL ||
        'http://localhost:3000',
      canonicalUrl: SITE_CONFIG.canonicalUrl,
      siteName: SITE_CONFIG.name,
      siteTagline: SITE_CONFIG.tagline,
    },
  },

  // PWA Configuration - now using modular config
  pwa: PWA_CONFIG,

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

  // Image optimization configuration - using modular config
  // Note: Only specify non-default values to avoid duplicate key warnings during build
  // Nuxt Image provides sensible defaults: provider='ipx', quality=80, densities=[1,2]
  image: IMAGE_CONFIG,

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
        { name: 'theme-color', content: THEME_CONFIG.colors.themeColor },
        {
          name: 'msapplication-TileColor',
          content: THEME_CONFIG.colors.tileColor,
        },
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
          content: SEO_CONFIG.defaultDescription,
        },
        {
          name: 'keywords',
          content: SEO_CONFIG.keywords,
        },
        { name: 'author', content: SITE_CONFIG.author },
        // Open Graph tags
        {
          property: 'og:title',
          content: SEO_CONFIG.defaultTitle,
        },
        {
          property: 'og:description',
          content: SEO_CONFIG.defaultDescription,
        },
        { property: 'og:type', content: SEO_CONFIG.ogType },
        // og:url will be set dynamically in app.vue
        { property: 'og:image', content: SEO_CONFIG.ogImage },
        // Twitter card
        { name: 'twitter:card', content: SEO_CONFIG.twitterCard },
        {
          name: 'twitter:title',
          content: SEO_CONFIG.defaultTitle,
        },
        {
          name: 'twitter:description',
          content: SEO_CONFIG.defaultDescription,
        },
      ],
      // Add resource hints
      htmlAttrs: {
        lang: SITE_CONFIG.language,
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
