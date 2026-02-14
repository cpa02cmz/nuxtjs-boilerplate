// CSP Violation Reporting Endpoint
// Receives and logs Content Security Policy violation reports
// Issue #2212: Added input validation and sanitization

import { defineEventHandler, readBody } from 'h3'

const MAX_URI_LENGTH = 2048
const MAX_POLICY_LENGTH = 4096

interface SanitizedCspReport {
  documentUri: string
  referrer: string
  blockedUri: string
  effectiveDirective: string
  violatedDirective: string
  originalPolicy: string
  disposition: string
  sourceFile: string
  lineNumber?: number
  columnNumber?: number
  statusCode?: number
}

/**
 * Sanitizes CSP report to prevent log injection attacks
 * Issue #2212: Added validation and length limits
 */
function sanitizeCspReport(report: unknown): SanitizedCspReport | null {
  if (typeof report !== 'object' || report === null) {
    return null
  }

  const r = report as Record<string, unknown>

  return {
    documentUri: String(r['document-uri'] || '').substring(0, MAX_URI_LENGTH),
    referrer: String(r.referrer || '').substring(0, MAX_URI_LENGTH),
    blockedUri: String(r['blocked-uri'] || '').substring(0, MAX_URI_LENGTH),
    effectiveDirective: String(r['effective-directive'] || '').substring(
      0,
      100
    ),
    violatedDirective: String(r['violated-directive'] || '').substring(0, 100),
    originalPolicy: String(r['original-policy'] || '').substring(
      0,
      MAX_POLICY_LENGTH
    ),
    disposition: String(r.disposition || '').substring(0, 20),
    sourceFile: String(r['source-file'] || '').substring(0, MAX_URI_LENGTH),
    lineNumber:
      typeof r['line-number'] === 'number' ? r['line-number'] : undefined,
    columnNumber:
      typeof r['column-number'] === 'number' ? r['column-number'] : undefined,
    statusCode:
      typeof r['status-code'] === 'number' ? r['status-code'] : undefined,
  }
}

export default defineEventHandler(async event => {
  // Only accept POST requests
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed',
    })
  }

  try {
    const body = await readBody(event)

    // Issue #2212: Validate and sanitize the CSP report
    const report = sanitizeCspReport(body)
    if (!report) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request: Invalid CSP report format',
      })
    }

    // Log the CSP violation for monitoring (now with validated data)
    console.error('[CSP Violation]', {
      timestamp: new Date().toISOString(),
      ...report,
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
