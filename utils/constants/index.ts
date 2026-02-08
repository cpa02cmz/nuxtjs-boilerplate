/**
 * Central constants export file
 * Import all constants from this file for consistency
 *
 * @example
 * ```typescript
 * import { TIME_CONSTANTS, ResourceStatus, DateRange, HTTP_HEADERS } from '~/utils/constants'
 * ```
 */

// Time constants
export { TIME_CONSTANTS, TIME_CONSTANTS_SECONDS } from './time.constants'

// Status enums
export {
  ResourceStatus,
  SubmissionStatus,
  CommentStatus,
  FlagStatus,
  ModerationStatus,
  TaskStatus,
  type ResourceStatusValue,
  type SubmissionStatusValue,
  type CommentStatusValue,
  type FlagStatusValue,
  type ModerationStatusValue,
  type TaskStatusValue,
} from './status.enums'

// Date range enums
export {
  DateRange,
  DATE_RANGE_OPTIONS,
  type DateRangeValue,
} from './date-range.enums'

// HTTP constants
export { HTTP_HEADERS, CSRF_CONSTANTS, HTTP_STATUS } from './http.constants'

// App constants
export {
  DEFAULT_BASE_URL,
  DEFAULT_CANONICAL_URL,
  DATA_PATHS,
  SERVER_TIMING,
  DATABASE_CONSTANTS,
  CACHE_TTL,
  HIGHLIGHT_CLASSES,
  PAGINATION_DEFAULTS,
} from './app.constants'
