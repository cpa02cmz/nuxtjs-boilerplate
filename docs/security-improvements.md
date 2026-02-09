# Security Improvements

This document outlines the security improvements made to address the hardcoded secrets and sensitive data exposure issue.

## Changes Made

### 1. Environment Variables for URLs

- Replaced hardcoded URLs with environment variables in:
  - Page meta tags (`ogUrl` properties in all pages)
  - Sitemap generation routes
- Added fallback to runtime configuration variables

### 2. Conditional Logging

- Updated all console logging to be development-only
- Changed `process.env.NODE_ENV === 'development'` to `process.dev` for Nuxt compatibility
- Applied to:
  - Resource loading errors in `useResources.ts`
  - Image loading errors in `ResourceCard.vue`
  - URL validation errors in `ResourceCard.vue`
  - Sitemap generation errors in API routes

### 3. Enhanced Security Headers

- Added HSTS (HTTP Strict Transport Security) headers in production environments
- Updated security middleware and plugins to include HSTS
- Maintained existing CSP, X-Frame-Options, and other security headers

### 4. URL Validation

- Improved URL validation in resource links
- Enhanced error handling for invalid URLs

## Environment Variables Used

The following environment variables are now used for configuring URLs:

- `CANONICAL_URL` - Set via `runtimeConfig.public.canonicalUrl`
- `SITE_URL` - Set via `runtimeConfig.public.siteUrl`

## Files Updated

- `pages/index.vue`
- `pages/about.vue`
- `pages/ai-keys.vue`
- `pages/search.vue`
- `pages/submit.vue`
- `server/api/sitemap.get.ts`
- `server/routes/sitemap.xml.get.ts`

- `server/plugins/security-headers.ts`
- `components/ResourceCard.vue`

## Known Security Considerations

### Dependency Vulnerabilities (As of 2026-02-08)

There are 8 moderate severity vulnerabilities related to lodash prototype pollution in transitive dependencies:

- **Path**: `@mrleebo/prisma-ast` → `chevrotain` → `@chevrotain/gast` → `lodash`
- **Impact**: Development-only dependency (Prisma schema parsing)
- **Status**: Monitored - These are development dependencies used for Prisma schema parsing and do not affect production runtime
- **Note**: Awaiting upstream updates from `@mrleebo/prisma-ast` and `chevrotain` packages

## Testing

All changes maintain backward compatibility and include proper fallbacks to ensure the application continues to function correctly in all environments.

_Last Updated: 2026-02-08_
