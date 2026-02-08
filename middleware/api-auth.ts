// API Authentication Middleware
// This middleware handles API key validation for protected routes

export default defineNuxtRouteMiddleware(async to => {
  // Only apply to API routes that need authentication
  if (!to.path.startsWith('/api/')) {
    return
  }

  // Skip authentication for public API endpoints
  const publicEndpoints = ['/api/health', '/api/docs']
  if (publicEndpoints.some(endpoint => to.path.startsWith(endpoint))) {
    return
  }

  // API key validation can be added here when needed
  // const apiKey = to.headers.get('x-api-key')
  // if (!apiKey || !isValidApiKey(apiKey)) {
  //   throw createError({
  //     statusCode: 401,
  //     message: 'Invalid or missing API key'
  //   })
  // }
})
