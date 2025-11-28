// server/api/feedback.post.ts
import { randomUUID } from 'node:crypto'
import type { Feedback, FeedbackSubmission } from '~/types/feedback'

export default defineEventHandler(async event => {
  try {
    // Parse the request body
    const body = await readBody(event)

    // Validate required fields
    if (!body.type || !body.title || !body.description) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'Missing required fields: type, title, and description are required',
      })
    }

    // Validate feedback type
    const validTypes = [
      'bug_report',
      'feature_request',
      'general_feedback',
      'suggestion',
      'compliment',
      'complaint',
    ]
    if (!validTypes.includes(body.type)) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'Invalid feedback type. Must be one of: bug_report, feature_request, general_feedback, suggestion, compliment, complaint',
      })
    }

    // Create feedback object
    const feedback: Feedback = {
      id: `feedback_${randomUUID()}`,
      type: body.type,
      title: body.title,
      description: body.description,
      category: body.category,
      userEmail: body.userEmail,
      userAgent: body.userAgent,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: 'medium', // Default priority
    }

    // In a real application, you would save this to a database
    // For now, we'll just log it and return success
    console.log('New feedback received:', feedback)

    // For development/testing purposes, we'll store in a simple in-memory store
    // In production, you would use a proper database
    const feedbackStore = useStorage('feedback')
    await feedbackStore.setItem(feedback.id, feedback)

    // Track the feedback submission in analytics
    try {
      const analyticsEvent = {
        type: 'feedback_submitted',
        properties: {
          feedbackType: feedback.type,
          hasCategory: !!feedback.category,
          hasEmail: !!feedback.userEmail,
          hasUserAgent: !!feedback.userAgent,
        },
      }

      // Send to analytics API
      await $fetch('/api/analytics/events', {
        method: 'POST',
        body: analyticsEvent,
      })
    } catch (analyticsError) {
      console.warn('Analytics tracking failed:', analyticsError)
    }

    return {
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback,
    }
  } catch (error: any) {
    console.error('Error processing feedback:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error',
    })
  }
})
