/**
 * Auth Middleware
 *
 * This middleware protects routes that require authentication.
 * In a production app, this would verify the user's session/token.
 *
 * For this demo application, authentication is bypassed to allow
 * easy access to protected pages for demonstration purposes.
 */

export default defineNuxtRouteMiddleware(to => {
  // Skip auth check on server-side rendering for hydration safety
  if (process.server) {
    return
  }

  // In a real application, you would:
  // 1. Check for authentication token/session
  // 2. Verify the token is valid
  // 3. Check user permissions
  // 4. Redirect to login if not authenticated

  // For demo purposes, we'll allow access but log the navigation
  // This allows developers to test protected pages without authentication
  const isDev = process.env.NODE_ENV === 'development'

  if (isDev) {
    console.log(`[Auth Middleware] Accessing protected route: ${to.path}`)
  }

  // TODO: Implement proper authentication check
  // Example:
  // const { isAuthenticated, hasPermission } = useAuth()
  //
  // if (!isAuthenticated.value) {
  //   return navigateTo(ROUTE_PATTERNS.pages.login, { redirectCode: 302 })
  // }
  //
  // if (!hasPermission('moderator')) {
  //   return navigateTo(ROUTE_PATTERNS.pages.unauthorized, { redirectCode: 403 })
  // }

  // Allow access for now
  return
})
