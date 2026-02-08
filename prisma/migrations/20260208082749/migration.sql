/*
  Warnings:

  - Made the column `timestamp` on table `AnalyticsEvent` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ApiKey" ADD COLUMN "lastUsedAt" DATETIME;

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "benefits" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "pricingModel" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "technology" TEXT NOT NULL,
    "dateAdded" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" DATETIME NOT NULL,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL,
    "screenshots" TEXT,
    "specifications" TEXT,
    "features" TEXT,
    "limitations" TEXT,
    "platforms" TEXT,
    "license" TEXT,
    "icon" TEXT,
    "alternatives" TEXT,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "submittedBy" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "rejectionReason" TEXT,
    "qualityScore" REAL,
    "deletedAt" DATETIME
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "resourceId" TEXT,
    "category" TEXT,
    "url" TEXT,
    "userAgent" TEXT,
    "ip" TEXT,
    "timestamp" DATETIME NOT NULL,
    "properties" TEXT,
    "deletedAt" DATETIME
);
INSERT INTO "new_AnalyticsEvent" ("category", "deletedAt", "id", "ip", "properties", "resourceId", "timestamp", "type", "url", "userAgent") SELECT "category", "deletedAt", "id", "ip", "properties", "resourceId", "timestamp", "type", "url", "userAgent" FROM "AnalyticsEvent";
DROP TABLE "AnalyticsEvent";
ALTER TABLE "new_AnalyticsEvent" RENAME TO "AnalyticsEvent";
CREATE INDEX "AnalyticsEvent_timestamp_idx" ON "AnalyticsEvent"("timestamp");
CREATE INDEX "AnalyticsEvent_resourceId_idx" ON "AnalyticsEvent"("resourceId");
CREATE INDEX "AnalyticsEvent_type_idx" ON "AnalyticsEvent"("type");
CREATE INDEX "AnalyticsEvent_ip_idx" ON "AnalyticsEvent"("ip");
CREATE INDEX "AnalyticsEvent_timestamp_type_idx" ON "AnalyticsEvent"("timestamp", "type");
CREATE INDEX "AnalyticsEvent_timestamp_resourceId_idx" ON "AnalyticsEvent"("timestamp", "resourceId");
CREATE INDEX "AnalyticsEvent_resourceId_type_idx" ON "AnalyticsEvent"("resourceId", "type");
CREATE INDEX "AnalyticsEvent_ip_timestamp_idx" ON "AnalyticsEvent"("ip", "timestamp");
CREATE INDEX "AnalyticsEvent_category_timestamp_idx" ON "AnalyticsEvent"("category", "timestamp");
CREATE INDEX "AnalyticsEvent_deletedAt_idx" ON "AnalyticsEvent"("deletedAt");
CREATE INDEX "AnalyticsEvent_resourceId_type_timestamp_deletedAt_idx" ON "AnalyticsEvent"("resourceId", "type", "timestamp", "deletedAt");
CREATE INDEX "AnalyticsEvent_timestamp_deletedAt_idx" ON "AnalyticsEvent"("timestamp", "deletedAt");
CREATE INDEX "AnalyticsEvent_ip_timestamp_deletedAt_idx" ON "AnalyticsEvent"("ip", "timestamp", "deletedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Resource_category_idx" ON "Resource"("category");

-- CreateIndex
CREATE INDEX "Resource_status_idx" ON "Resource"("status");

-- CreateIndex
CREATE INDEX "Resource_dateAdded_idx" ON "Resource"("dateAdded");

-- CreateIndex
CREATE INDEX "Resource_popularity_idx" ON "Resource"("popularity");

-- CreateIndex
CREATE INDEX "Resource_deletedAt_idx" ON "Resource"("deletedAt");

-- CreateIndex
CREATE INDEX "Resource_category_status_idx" ON "Resource"("category", "status");

-- CreateIndex
CREATE INDEX "Resource_status_deletedAt_idx" ON "Resource"("status", "deletedAt");

-- CreateIndex
CREATE INDEX "ApiKey_key_deletedAt_active_idx" ON "ApiKey"("key", "deletedAt", "active");

-- CreateIndex
CREATE INDEX "Webhook_active_deletedAt_idx" ON "Webhook"("active", "deletedAt");
