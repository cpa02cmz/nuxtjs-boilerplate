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
WHERE deletedAt IS NOT NULL;

-- Drop current DateTime columns
ALTER TABLE "AnalyticsEvent" DROP COLUMN "timestamp";
ALTER TABLE "AnalyticsEvent" DROP COLUMN "deletedAt";

-- Rename new columns to original names
ALTER TABLE "AnalyticsEvent" RENAME COLUMN "timestamp_int" TO "timestamp";
ALTER TABLE "AnalyticsEvent" RENAME COLUMN "deletedAt_int" TO "deletedAt";
