# Project Architecture Rules (Non-Obvious Only)

- The architecture follows Nuxt 3 standards with server-side rendering and static generation capabilities
- PWA implementation includes custom caching strategies for different asset types (API, resources, fonts, images)
- Security is implemented at multiple layers: client-side sanitization, server-side middleware, and CSP headers
- Search functionality uses client-side Fuse.js with preloaded resources, not server-side search
- Component architecture follows atomic design principles with error boundary patterns
- Image optimization uses Nuxt Image with static provider and responsive formats (WebP, AVIF)
- SEO implementation includes structured data (JSON-LD), meta tags, and sitemap generation
- State management is handled by Nuxt's built-in composables rather than external libraries
- Bundle optimization includes manual chunk splitting for vendor libraries and lazy loading
- Offline functionality is implemented via service worker with custom caching strategies