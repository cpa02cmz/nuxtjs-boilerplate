// CSP Violation Reporting Endpoint
// Receives and logs Content Security Policy violation reports

import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async event => {
  // Only accept POST requests
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed',
    })
  }

  try {
    const report = await readBody(event)

    // Log the CSP violation for monitoring
    console.error('[CSP Violation]', {
      timestamp: new Date().toISOString(),
      documentUri: report['document-uri'],
      referrer: report.referrer,
      blockedUri: report['blocked-uri'],
      effectiveDirective: report['effective-directive'],
      violatedDirective: report['violated-directive'],
      originalPolicy: report['original-policy'],
      disposition: report.disposition,
      sourceFile: report['source-file'],
      lineNumber: report['line-number'],
      columnNumber: report['column-number'],
      statusCode: report['status-code'],
    })

    // Store in database for analytics (optional)
    // await storeCspViolation(report)

    // Return 204 No Content (as per CSP reporting spec)
    event.node.res.statusCode = 204
    return null
  } catch (error) {
    console.error('[CSP Report Error]', error)
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
    })
  }
})

// Helper function to create errors
function createError(options: { statusCode: number; statusMessage: string }) {
  return Object.assign(new Error(options.statusMessage), options)
}
