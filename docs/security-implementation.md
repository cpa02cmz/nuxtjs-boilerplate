# Security Implementation Guide

This document explains the security measures implemented in the application and how they are configured.

## Content Security Policy (CSP)

The application implements Content Security Policy using a multi-layered approach:

1. **Server-Side Headers**: Implemented via the Nitro plugin at `server/plugins/security-headers.ts` which sets the `Content-Security-Policy` header for all responses.

2. **Client-Side Fallback**: Configured in `nuxt.config.ts` via the meta tag in the app head section to provide CSP protection even for static HTML responses.

The CSP policy includes:

- `default-src 'self'` - Restricts resources to same origin
- `script-src 'self' 'unsafe-inline' 'unsafe-eval' https:` - Allows scripts from same origin and HTTPS sources
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` - Allows styles from same origin and Google Fonts
- `img-src 'self' data: blob: https:` - Allows images from same origin, data URIs, blob URIs, and HTTPS sources
- Additional directives for enhanced security

## XSS Protection

Cross-site scripting (XSS) protection is implemented through centralized sanitization:

1. **Centralized Utility**: All sanitization is handled by `utils/sanitize.ts` which provides:
   - `sanitizeForXSS()` - General XSS protection
   - `sanitizeAndHighlight()` - XSS protection with search term highlighting

2. **Component Usage**: Components like `ResourceCard.vue` import and use the centralized sanitization functions instead of direct DOM manipulation.

This approach ensures consistent security measures across the application and makes security updates easier to manage.

## Other Security Headers

The application also implements these security headers:

- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 0` - Disabled since CSP provides better protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Strict-Transport-Security` - Enforces HTTPS
- `Permissions-Policy` - Controls browser features
