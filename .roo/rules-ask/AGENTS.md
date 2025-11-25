# Project Documentation Rules (Non-Obvious Only)

- The project is a resource discovery platform called "Free Stuff on the Internet", not a generic Nuxt boilerplate
- Server API routes are located in `server/api/` directory, not in `api/` or `pages/api`
- Resources data is loaded from JSON file at `~/data/resources.json`, not from an API or database
- Search functionality uses Fuse.js with specific configuration (threshold: 0.3, includeScore: true)
- Security implementation includes both client-side sanitization (DOMPurify) and server-side middleware
- PWA functionality is implemented with @vite-pwa/nuxt module with custom caching strategies
- Error boundaries are implemented with `hasError` ref pattern rather than try/catch blocks
- Image optimization uses @nuxt/image with static provider and specific quality/format settings
- SEO is implemented via Nuxt's useHead and useSeoMeta composables with JSON-LD structured data
- The project uses Nuxt's built-in sitemap generation rather than a third-party module