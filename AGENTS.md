# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Build/Lint/Test Commands

- To run a single test: `npm run test -- --run tests/unit/test-file-name.spec.ts`
- To analyze bundle size: `npm run analyze` (requires ANALYZE_BUNDLE=true environment variable)
- Linting may require specific ESLint version due to compatibility issues: `npx eslint@9.39.1 .`
- Install dependencies with `--legacy-peer-deps` flag if encountering dependency conflicts

## Code Style & Conventions

- Vue components use Composition API with `<script setup>` and TypeScript
- Security: All highlighted content must be sanitized using DOMPurify to prevent XSS
- Resources JSON is imported via: `import('~/data/resources.json')`
- Server-side rendered content must use `process.env.NODE_ENV !== 'test'` checks before using `useHead`
- Error logging uses custom utility: `logError()` from `~/utils/errorLogger`
- Image optimization component uses `@nuxt/image` with specific props (format, quality, loading)
- Components must handle both error and success states with appropriate UI
- All URL validation must be done with try/catch around `new URL()` constructor
- Use `readonly()` from Vue when returning reactive state from composables to prevent external mutations

## Critical Patterns

- PWA installation requires handling `beforeinstallprompt` event and storing deferred prompt
- Search highlighting uses DOMPurify with specific allowed tags: `['mark']` and attributes: `['class']`
- Component error boundaries use `hasError` ref pattern with graceful fallback UI
- Offline detection uses window event listeners for 'online' and 'offline' events
- Keyboard vs mouse navigation is differentiated by adding 'keyboard-nav' vs 'mouse-nav' CSS classes
- Fuse.js is used for fuzzy search with specific configuration (threshold: 0.3, includeScore: true)
- Retry logic for resource loading uses exponential backoff with max 3 attempts
- Search history is stored in localStorage with key 'resource_search_history' and max 10 items
- XSS prevention requires multiple sanitization steps for search highlighting content
- Server API routes require security middleware and specific error handling patterns