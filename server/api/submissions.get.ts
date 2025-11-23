export default defineEventHandler(async event => {
  try {
    // For now, return an empty array since we're not persisting submissions to a real database
    // In a real implementation, this would fetch from a database
    const config = useRuntimeConfig()

    return {
      success: true,
      submissions: [],
    }
  } catch (error: any) {
    if (process.dev) {
      // eslint-disable-next-line no-console
      console.error('Error fetching submissions:', error) // Only log in development
    }

    // Return proper error response
    return {
      success: false,
      message: 'An error occurred while fetching submissions',
      submissions: [],
    }
  }
})
