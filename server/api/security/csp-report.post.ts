// CSP Violation Reporting Endpoint
// Receives and logs Content Security Policy violation reports
// Issue #2212: Added input validation and sanitization
// Issue #3219: Standardized error handling
// Flexy update: Using centralized limits config - no more hardcoded values!

import { defineEventHandler, readBody } from 'h3'
import { limitsConfig } from '~/configs/limits.config'
import {
  sendMethodNotAllowedError,
  sendBadRequestError,
  handleApiRouteError,
} from '~/server/utils/api-response'

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
    return sendMethodNotAllowedError(event, 'POST')
  }

  try {
    const body = await readBody(event)

    // Issue #2212: Validate and sanitize the CSP report
    const report = sanitizeCspReport(body)
    if (!report) {
      return sendBadRequestError(
        event,
        'Invalid CSP report format',
        'The provided CSP report is malformed or missing required fields'
      )
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
    return handleApiRouteError(event, error)
  }
})
