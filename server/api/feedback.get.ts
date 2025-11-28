// server/api/feedback.get.ts
import type { Feedback } from '~/types/feedback'

export default defineEventHandler(async event => {
  try {
    // In a real application, you would fetch from a database
    // For now, we'll retrieve from the storage
    const feedbackStore = useStorage('feedback')
    const allKeys = await feedbackStore.getKeys()

    const feedbackList: Feedback[] = []

    for (const key of allKeys) {
      const feedback = (await feedbackStore.getItem(key)) as Feedback
      if (feedback) {
        feedbackList.push(feedback)
      }
    }

    // Sort by creation date (newest first)
    feedbackList.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Apply query parameters for filtering
    const query = getQuery(event)
    const { type, status, limit } = query

    let filteredFeedback = feedbackList

    if (type) {
      filteredFeedback = filteredFeedback.filter(f => f.type === type)
    }

    if (status) {
      filteredFeedback = filteredFeedback.filter(f => f.status === status)
    }

    if (limit && !isNaN(Number(limit))) {
      filteredFeedback = filteredFeedback.slice(0, Number(limit))
    }

    return {
      success: true,
      data: filteredFeedback,
      count: filteredFeedback.length,
    }
  } catch (error: any) {
    console.error('Error fetching feedback:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error',
    })
  }
})
