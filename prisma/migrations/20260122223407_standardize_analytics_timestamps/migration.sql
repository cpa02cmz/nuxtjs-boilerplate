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
