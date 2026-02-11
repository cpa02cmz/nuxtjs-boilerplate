/*
  Warnings:

  - You are about to drop the column `key` on the `ApiKey` table. All the data in the column will be lost.
  - Made the column `keyHash` on table `ApiKey` required. This step will fail if there are existing NULL values in that column.
  - Made the column `keyPrefix` on table `ApiKey` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "IdempotencyKey_key_idx";

-- CreateTable
CREATE TABLE "TrackedError" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "component" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'error',
    "url" TEXT,
    "userAgent" TEXT,
    "ip" TEXT,
    "source" TEXT NOT NULL DEFAULT 'client',
    "errorHash" TEXT,
    "occurrenceCount" INTEGER NOT NULL DEFAULT 1,
    "firstSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL,
    "resolvedAt" DATETIME,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "ErrorMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hour" INTEGER NOT NULL DEFAULT 0,
    "severity" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" DATETIME
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME,
    "lastUsedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);
INSERT INTO "new_ApiKey" ("active", "createdAt", "deletedAt", "expiresAt", "id", "keyHash", "keyPrefix", "lastUsedAt", "name", "permissions", "updatedAt", "userId") SELECT "active", "createdAt", "deletedAt", "expiresAt", "id", "keyHash", "keyPrefix", "lastUsedAt", "name", "permissions", "updatedAt", "userId" FROM "ApiKey";
DROP TABLE "ApiKey";
ALTER TABLE "new_ApiKey" RENAME TO "ApiKey";
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");
CREATE INDEX "ApiKey_keyPrefix_idx" ON "ApiKey"("keyPrefix");
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");
CREATE INDEX "ApiKey_active_idx" ON "ApiKey"("active");
CREATE INDEX "ApiKey_expiresAt_idx" ON "ApiKey"("expiresAt");
CREATE INDEX "ApiKey_deletedAt_idx" ON "ApiKey"("deletedAt");
CREATE INDEX "ApiKey_keyPrefix_deletedAt_active_idx" ON "ApiKey"("keyPrefix", "deletedAt", "active");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "TrackedError_severity_idx" ON "TrackedError"("severity");

-- CreateIndex
CREATE INDEX "TrackedError_source_idx" ON "TrackedError"("source");

-- CreateIndex
CREATE INDEX "TrackedError_errorHash_idx" ON "TrackedError"("errorHash");

-- CreateIndex
CREATE INDEX "TrackedError_firstSeenAt_idx" ON "TrackedError"("firstSeenAt");

-- CreateIndex
CREATE INDEX "TrackedError_lastSeenAt_idx" ON "TrackedError"("lastSeenAt");

-- CreateIndex
CREATE INDEX "TrackedError_severity_source_idx" ON "TrackedError"("severity", "source");

-- CreateIndex
CREATE INDEX "TrackedError_errorHash_resolvedAt_idx" ON "TrackedError"("errorHash", "resolvedAt");

-- CreateIndex
CREATE INDEX "ErrorMetric_date_idx" ON "ErrorMetric"("date");

-- CreateIndex
CREATE INDEX "ErrorMetric_severity_source_idx" ON "ErrorMetric"("severity", "source");

-- CreateIndex
CREATE UNIQUE INDEX "ErrorMetric_date_hour_severity_source_key" ON "ErrorMetric"("date", "hour", "severity", "source");

-- RedefineIndex
DROP INDEX "RateLimit_key_window_unique";
CREATE UNIQUE INDEX "RateLimit_key_window_key" ON "RateLimit"("key", "window");
