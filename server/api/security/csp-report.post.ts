// CSP Violation Reporting Endpoint
// Receives and logs Content Security Policy violation reports
// Issue #2212: Added input validation and sanitization
// Flexy update: Using centralized limits config - no more hardcoded values!

import { defineEventHandler, readBody } from 'h3'
import { limitsConfig } from '~/configs/limits.config'
import { HTTP_STATUS } from '~/server/utils/constants'

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
    documentUri: String(r['document-uri'] || '').substring(
      0,
      limitsConfig.cspReport.maxUriLength
    ),
    referrer: String(r.referrer || '').substring(
      0,
      limitsConfig.cspReport.maxUriLength
    ),
    blockedUri: String(r['blocked-uri'] || '').substring(
      0,
      limitsConfig.cspReport.maxUriLength
    ),
    effectiveDirective: String(r['effective-directive'] || '').substring(
      0,
      limitsConfig.cspReport.maxDirectiveLength
    ),
    violatedDirective: String(r['violated-directive'] || '').substring(
      0,
      limitsConfig.cspReport.maxDirectiveLength
    ),
    originalPolicy: String(r['original-policy'] || '').substring(
      0,
      limitsConfig.cspReport.maxPolicyLength
    ),
    disposition: String(r.disposition || '').substring(
      0,
      limitsConfig.cspReport.maxDispositionLength
    ),
    sourceFile: String(r['source-file'] || '').substring(
      0,
      limitsConfig.cspReport.maxUriLength
    ),
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
      statusCode: HTTP_STATUS.METHOD_NOT_ALLOWED,
      statusMessage: 'Method Not Allowed',
    })
  }

  try {
    const body = await readBody(event)

    // Issue #2212: Validate and sanitize the CSP report
    const report = sanitizeCspReport(body)
    if (!report) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
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
    event.node.res.statusCode = HTTP_STATUS.NO_CONTENT
    return null
  } catch (error) {
    console.error('[CSP Report Error]', error)
    throw createError({
      statusCode: HTTP_STATUS.BAD_REQUEST,
      statusMessage: 'Bad Request',
    })
  }
})

// Helper function to create errors
function createError(options: { statusCode: number; statusMessage: string }) {
  return Object.assign(new Error(options.statusMessage), options)
}
