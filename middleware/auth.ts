/**
 * Auth Middleware
 *
 * This middleware protects routes that require authentication.
 * It validates API keys stored in cookies and redirects to login if invalid.
 *
 * Protected routes: moderation pages and other admin functionality
 */

import { ROUTE_PATTERNS } from '~/configs/routes.config'

// Cookie name for API key storage
const API_KEY_COOKIE = 'fsi_api_key'

export default defineNuxtRouteMiddleware(async to => {
  // Skip auth check on server-side for hydration safety
  if (process.server) {
    return
  }

  // Get API key from cookie
  const apiKeyCookie = useCookie(API_KEY_COOKIE, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  })

  const apiKey = apiKeyCookie.value

  // No API key present - redirect to login
  if (!apiKey) {
    console.log('[Auth Middleware] No API key found, redirecting to login')
    return navigateTo(
      `${ROUTE_PATTERNS.pages.aiKeys}?redirect=${encodeURIComponent(to.fullPath)}`,
      { redirectCode: 302 }
    )
  }

  // Validate API key with backend
  try {
    const response = await fetch('/api/v1/auth/api-keys', {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // API key is invalid - clear cookie and redirect
      console.log('[Auth Middleware] Invalid API key, clearing and redirecting')
      apiKeyCookie.value = null
      return navigateTo(
        `${ROUTE_PATTERNS.pages.aiKeys}?redirect=${encodeURIComponent(to.fullPath)}&error=invalid_key`,
        { redirectCode: 302 }
      )
    }

    // API key is valid - allow access
    const data = await response.json()

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Auth Middleware] Access granted to: ${to.path}`, {
        keysCount: data.keys?.length || 0,
      })
    }

    // Store auth state in pinia/nuxt state if needed
    // This can be used by components to show authenticated UI
    const authState = useState('auth', () => ({
      isAuthenticated: true,
      apiKey: apiKey,
      lastVerified: new Date().toISOString(),
    }))

    authState.value = {
      isAuthenticated: true,
      apiKey: apiKey,
      lastVerified: new Date().toISOString(),
    }
  } catch (error) {
    // Network or other error - log and redirect with error message
    console.error('[Auth Middleware] Validation error:', error)
    return navigateTo(
      `${ROUTE_PATTERNS.pages.aiKeys}?redirect=${encodeURIComponent(to.fullPath)}&error=validation_failed`,
      { redirectCode: 302 }
    )
  }
})

/**
 * Composable to check authentication status
 * Use this in components to conditionally show authenticated UI
 */
export function useAuth() {
  const authState = useState<{
    isAuthenticated: boolean
    apiKey: string | null
    lastVerified: string | null
  }>('auth', () => ({
    isAuthenticated: false,
    apiKey: null,
    lastVerified: null,
  }))

  const isAuthenticated = computed(() => authState.value.isAuthenticated)

  const logout = () => {
    const apiKeyCookie = useCookie(API_KEY_COOKIE)
    apiKeyCookie.value = null
    authState.value = {
      isAuthenticated: false,
      apiKey: null,
      lastVerified: null,
    }
    navigateTo(ROUTE_PATTERNS.pages.aiKeys)
  }

  return {
    isAuthenticated,
    apiKey: computed(() => authState.value.apiKey),
    lastVerified: computed(() => authState.value.lastVerified),
    logout,
  }
}

/**
 * Helper to set API key after successful authentication
 */
export function setAuthApiKey(apiKey: string) {
  const apiKeyCookie = useCookie(API_KEY_COOKIE, {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  })
  apiKeyCookie.value = apiKey

  // Update auth state
  const authState = useState('auth')
  authState.value = {
    isAuthenticated: true,
    apiKey: apiKey,
    lastVerified: new Date().toISOString(),
  }
}
