-- Optimize AnalyticsEvent indexes (Issue #1397)
-- Reduce from 13 to 7 indexes to improve INSERT performance by ~40%
-- 
-- Removed redundant indexes that are covered by composite indexes:
-- - [resourceId] covered by [resourceId, type] and [timestamp, resourceId]
-- - [type] covered by [resourceId, type] and [timestamp, type]
-- - [ip] covered by [ip, timestamp]
-- - [deletedAt] covered by [resourceId, type, timestamp, deletedAt]
-- - [timestamp, deletedAt] redundant with [timestamp] and composite
-- - [ip, timestamp, deletedAt] redundant with [ip, timestamp]

-- Drop redundant indexes from AnalyticsEvent
DROP INDEX IF EXISTS "AnalyticsEvent_resourceId_idx";
DROP INDEX IF EXISTS "AnalyticsEvent_type_idx";
DROP INDEX IF EXISTS "AnalyticsEvent_ip_idx";
DROP INDEX IF EXISTS "AnalyticsEvent_deletedAt_idx";
DROP INDEX IF EXISTS "AnalyticsEvent_timestamp_deletedAt_idx";
DROP INDEX IF EXISTS "AnalyticsEvent_ip_timestamp_deletedAt_idx";

-- Also drop redundant index from RateLimit (unique constraint already has index)
DROP INDEX IF EXISTS "RateLimit_key_window_idx";
