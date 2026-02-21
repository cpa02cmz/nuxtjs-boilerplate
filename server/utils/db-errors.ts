/**
 * Database Error Utilities
 * Centralized error code definitions and retry logic for PostgreSQL/Prisma
 *
 * -backend-engineer: Extracted from db.ts for reuse across modules
 * @see https://www.postgresql.org/docs/current/errcodes-appendix.html
 * @see https://www.prisma.io/docs/reference/api-reference/error-reference
 */

/**
 * PostgreSQL error codes that indicate transient/retryable errors
 * -architect: Added comprehensive error code detection for better retry handling
 * -architect: Added 08006 connection_failure for network resilience
 */
export const POSTGRESQL_RETRYABLE_CODES = {
  // Class 08 - Connection Exception
  '08006': 'connection_failure', // -architect: Common during temporary network issues
  // Class 40 - Transaction Rollback
  '40001': 'serialization_failure',
  '40003': 'statement_completion_unknown',
  '40P01': 'deadlock_detected',
  // Class 53 - Insufficient Resources
  '53000': 'insufficient_resources',
  '53100': 'disk_full',
  '53200': 'out_of_memory',
  '53300': 'too_many_connections',
  '53400': 'configuration_limit_exceeded',
  // Class 57 - Operator Intervention
  '57000': 'operator_intervention',
  '57014': 'query_canceled',
  '57P01': 'admin_shutdown',
  '57P02': 'crash_shutdown',
  '57P03': 'cannot_connect_now',
  '57P04': 'database_dropped',
  // Class 58 - System Error
  '58000': 'system_error',
  '58030': 'io_error',
  '58P01': 'undefined_file',
  '58P02': 'duplicate_file',
} as const

/**
 * Prisma error codes that indicate transient/retryable errors
 * -architect: Added Prisma-specific error codes for comprehensive handling
 */
export const PRISMA_RETRYABLE_CODES = {
  P2024: 'timed_out', // Connection timed out
  P2034: 'transaction_conflict', // Transaction write conflict or deadlock
  P2037: 'transaction_exceeded_retry_limit', // Transaction was retried too many times
  P1001: 'cannot_reach_database_server', // Can't reach database server
  P1002: 'database_server_connection_timeout', // Connection to database server timed out
  P1008: 'operations_timed_out', // Operations timed out
  P1017: 'server_closed_connection', // Server has closed the connection
} as const

/**
 * Check if error is a database retryable error (deadlock, lock timeout, connection issues, etc.)
 * -architect: Enhanced to detect PostgreSQL and Prisma error codes in addition to message patterns
 * -backend-engineer: Renamed from isRetryableError to avoid conflict with retry.ts
 *
 * @param error - The error to check
 * @returns true if the error is retryable, false otherwise
 */
export function isDatabaseRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()

  // Check for message-based patterns (existing behavior)
  const isRetryableMessage =
    message.includes('deadlock') ||
    message.includes('lock timeout') ||
    message.includes('could not obtain lock') ||
    message.includes('concurrent') ||
    message.includes('transaction rollback')

  if (isRetryableMessage) return true

  // -architect: Check for PostgreSQL error codes in message
  for (const code of Object.keys(POSTGRESQL_RETRYABLE_CODES)) {
    if (message.includes(code)) return true
  }

  // -architect: Check for Prisma error codes in message
  for (const code of Object.keys(PRISMA_RETRYABLE_CODES)) {
    if (message.includes(code)) return true
  }

  // -architect: Check error code property (Prisma errors have a code field)
  const errorWithCode = error as { code?: string }
  if (errorWithCode.code) {
    const code = errorWithCode.code
    if (code in POSTGRESQL_RETRYABLE_CODES || code in PRISMA_RETRYABLE_CODES) {
      return true
    }
  }

  return false
}
