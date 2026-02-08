-- Drop indexes that depend on the columns we're going to modify
DROP INDEX IF EXISTS "AnalyticsEvent_timestamp_idx";
DROP INDEX IF EXISTS "AnalyticsEvent_timestamp_type_idx";
DROP INDEX IF EXISTS "AnalyticsEvent_timestamp_resourceId_idx";
DROP INDEX IF EXISTS "AnalyticsEvent_timestamp_deletedAt_idx";
DROP INDEX IF EXISTS "AnalyticsEvent_ip_timestamp_idx";
DROP INDEX IF EXISTS "AnalyticsEvent_ip_timestamp_deletedAt_idx";
DROP INDEX IF EXISTS "AnalyticsEvent_category_timestamp_idx";
DROP INDEX IF EXISTS "AnalyticsEvent_resourceId_type_timestamp_deletedAt_idx";
DROP INDEX IF EXISTS "AnalyticsEvent_deletedAt_idx";

-- Add new DateTime columns
ALTER TABLE "AnalyticsEvent" ADD COLUMN "timestamp_dt" DATETIME;
ALTER TABLE "AnalyticsEvent" ADD COLUMN "deletedAt_dt" DATETIME;

-- Migrate data: Convert Unix timestamp (milliseconds) to DateTime
-- SQLite datetime() expects seconds, so divide by 1000
UPDATE "AnalyticsEvent" 
SET "timestamp_dt" = datetime(timestamp / 1000, 'unixepoch');

-- Migrate deletedAt if present (null values stay null)
UPDATE "AnalyticsEvent" 
SET "deletedAt_dt" = datetime(deletedAt / 1000, 'unixepoch')
WHERE deletedAt IS NOT NULL;

-- Drop old Int columns
ALTER TABLE "AnalyticsEvent" DROP COLUMN "timestamp";
ALTER TABLE "AnalyticsEvent" DROP COLUMN "deletedAt";

-- Rename new columns to original names
ALTER TABLE "AnalyticsEvent" RENAME COLUMN "timestamp_dt" TO "timestamp";
ALTER TABLE "AnalyticsEvent" RENAME COLUMN "deletedAt_dt" TO "deletedAt";

-- Recreate the indexes
CREATE INDEX "AnalyticsEvent_timestamp_idx" ON "AnalyticsEvent"("timestamp");
CREATE INDEX "AnalyticsEvent_timestamp_type_idx" ON "AnalyticsEvent"("timestamp", "type");
CREATE INDEX "AnalyticsEvent_timestamp_resourceId_idx" ON "AnalyticsEvent"("timestamp", "resourceId");
CREATE INDEX "AnalyticsEvent_timestamp_deletedAt_idx" ON "AnalyticsEvent"("timestamp", "deletedAt");
CREATE INDEX "AnalyticsEvent_ip_timestamp_idx" ON "AnalyticsEvent"("ip", "timestamp");
CREATE INDEX "AnalyticsEvent_ip_timestamp_deletedAt_idx" ON "AnalyticsEvent"("ip", "timestamp", "deletedAt");
CREATE INDEX "AnalyticsEvent_category_timestamp_idx" ON "AnalyticsEvent"("category", "timestamp");
CREATE INDEX "AnalyticsEvent_resourceId_type_timestamp_deletedAt_idx" ON "AnalyticsEvent"("resourceId", "type", "timestamp", "deletedAt");
