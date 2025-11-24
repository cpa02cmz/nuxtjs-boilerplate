# Project Debug Rules (Non-Obvious Only)

- Server-side rendered content must skip `useHead` calls in test environment to avoid injection issues
- When debugging PWA functionality, look for `beforeinstallprompt` event handling in app.vue
- Search highlighting requires multiple sanitization steps - check both preprocessing and DOMPurify calls
- Component error boundaries use `hasError` ref pattern - toggle this to simulate error states
- Offline detection uses window event listeners for 'online' and 'offline' events - simulate with browser dev tools
- Keyboard vs mouse navigation is differentiated by 'keyboard-nav' vs 'mouse-nav' CSS classes
- URL validation failures are caught with try/catch around `new URL()` constructor
- Image loading errors in OptimizedImage component trigger error state in parent components
- Bundle analysis requires ANALYZE_BUNDLE=true environment variable to activate rollup-plugin-visualizer
- Security middleware in server/middleware/security.ts affects all API routes