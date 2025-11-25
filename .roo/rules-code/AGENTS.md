# Project Coding Rules (Non-Obvious Only)

- Always use `logError()` from `~/utils/errorLogger` for error logging instead of direct console.error calls
- Resources JSON must be imported dynamically via: `import('~/data/resources.json')` to avoid SSR issues
- When using `useHead` in components, check `process.env.NODE_ENV !== 'test'` to avoid injection issues in tests
- Security: All highlighted content must be sanitized using DOMPurify with specific allowed tags: `['mark']` and attributes: `['class']`
- URL validation must be done with try/catch around `new URL()` constructor to prevent runtime errors
- Use `readonly()` from Vue when returning reactive state from composables to prevent external mutations
- PWA installation requires handling `beforeinstallprompt` event and storing deferred prompt for later use
- Search highlighting requires multiple sanitization steps to prevent XSS: preprocess + DOMPurify + final sanitization
- Server API routes must include security middleware from `~/server/middleware/security.ts`
- Component error boundaries should use the `hasError` ref pattern with appropriate fallback UI