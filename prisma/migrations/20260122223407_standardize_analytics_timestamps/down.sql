-- Drop all indexes that reference timestamp or deletedAt columns
DROP INDEX IF EXISTS "AnalyticsEvent_timestamp_idx";
DROP INDEX IF EXISTS "AnalyticsEvent_timestamp_type_idx";
DROP INDEX IF EXISTS "AnalyticsEvent_timestamp_resourceId_idx";
DROP INDEX IF EXISTS "AnalyticsEvent_category_timestamp_idx";
DROP INDEX IF EXISTS "AnalyticsEvent_ip_timestamp_idx";
DROP INDEX IF EXISTS "AnalyticsEvent_deletedAt_idx";
DROP INDEX IF EXISTS "AnalyticsEvent_resourceId_type_timestamp_deletedAt_idx";
DROP INDEX IF EXISTS "AnalyticsEvent_timestamp_deletedAt_idx";
DROP INDEX IF EXISTS "AnalyticsEvent_ip_timestamp_deletedAt_idx";

-- Add new Int columns
ALTER TABLE "AnalyticsEvent" ADD COLUMN "timestamp_int" INTEGER;
ALTER TABLE "AnalyticsEvent" ADD COLUMN "deletedAt_int" INTEGER;

-- Migrate data: Convert DateTime back to Unix timestamp (milliseconds)
-- strftime('%s', datetime) returns seconds, multiply by 1000 for milliseconds
UPDATE "AnalyticsEvent" 
SET "timestamp_int" = CAST(strftime('%s', "timestamp") AS INTEGER) * 1000;

-- Migrate deletedAt if present (null values stay null)
UPDATE "AnalyticsEvent" 
SET "deletedAt_int" = CAST(strftime('%s', "deletedAt") AS INTEGER) * 1000
WHERE "deletedAt" IS NOT NULL;

-- Drop current DateTime columns
ALTER TABLE "AnalyticsEvent" DROP COLUMN "timestamp";
ALTER TABLE "AnalyticsEvent" DROP COLUMN "deletedAt";

-- Rename new columns to original names
ALTER TABLE "AnalyticsEvent" RENAME COLUMN "timestamp_int" TO "timestamp";
ALTER TABLE "AnalyticsEvent" RENAME COLUMN "deletedAt_int" TO "deletedAt";

-- Recreate all the dropped indexes
CREATE INDEX "AnalyticsEvent_timestamp_idx" ON "AnalyticsEvent"("timestamp");
CREATE INDEX "AnalyticsEvent_timestamp_type_idx" ON "AnalyticsEvent"("timestamp", "type");
CREATE INDEX "AnalyticsEvent_timestamp_resourceId_idx" ON "AnalyticsEvent"("timestamp", "resourceId");
CREATE INDEX "AnalyticsEvent_category_timestamp_idx" ON "AnalyticsEvent"("category", "timestamp");
CREATE INDEX "AnalyticsEvent_ip_timestamp_idx" ON "AnalyticsEvent"("ip", "timestamp");
CREATE INDEX "AnalyticsEvent_deletedAt_idx" ON "AnalyticsEvent"("deletedAt");
CREATE INDEX "AnalyticsEvent_resourceId_type_timestamp_deletedAt_idx" ON "AnalyticsEvent"("resourceId", "type", "timestamp", "deletedAt");
CREATE INDEX "AnalyticsEvent_timestamp_deletedAt_idx" ON "AnalyticsEvent"("timestamp", "deletedAt");
CREATE INDEX "AnalyticsEvent_ip_timestamp_deletedAt_idx" ON "AnalyticsEvent"("ip", "timestamp", "deletedAt");
