-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resourceData" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "submittedBy" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "notes" TEXT,
    "rejectionReason" TEXT,
    "deletedAt" DATETIME
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Resource" (
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
    "deletedAt" DATETIME,
    "submissionId" TEXT,
    CONSTRAINT "Resource_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Resource" ("alternatives", "benefits", "category", "dateAdded", "deletedAt", "description", "difficulty", "features", "icon", "id", "lastUpdated", "license", "limitations", "platforms", "popularity", "pricingModel", "qualityScore", "rating", "rejectionReason", "reviewedAt", "reviewedBy", "screenshots", "specifications", "status", "submittedBy", "tags", "technology", "title", "url", "viewCount") SELECT "alternatives", "benefits", "category", "dateAdded", "deletedAt", "description", "difficulty", "features", "icon", "id", "lastUpdated", "license", "limitations", "platforms", "popularity", "pricingModel", "qualityScore", "rating", "rejectionReason", "reviewedAt", "reviewedBy", "screenshots", "specifications", "status", "submittedBy", "tags", "technology", "title", "url", "viewCount" FROM "Resource";
DROP TABLE "Resource";
ALTER TABLE "new_Resource" RENAME TO "Resource";
CREATE UNIQUE INDEX "Resource_submissionId_key" ON "Resource"("submissionId");
CREATE INDEX "Resource_category_idx" ON "Resource"("category");
CREATE INDEX "Resource_status_idx" ON "Resource"("status");
CREATE INDEX "Resource_dateAdded_idx" ON "Resource"("dateAdded");
CREATE INDEX "Resource_popularity_idx" ON "Resource"("popularity");
CREATE INDEX "Resource_deletedAt_idx" ON "Resource"("deletedAt");
CREATE INDEX "Resource_category_status_idx" ON "Resource"("category", "status");
CREATE INDEX "Resource_status_deletedAt_idx" ON "Resource"("status", "deletedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Submission_status_idx" ON "Submission"("status");

-- CreateIndex
CREATE INDEX "Submission_submittedBy_idx" ON "Submission"("submittedBy");

-- CreateIndex
CREATE INDEX "Submission_submittedAt_idx" ON "Submission"("submittedAt");

-- CreateIndex
CREATE INDEX "Submission_deletedAt_idx" ON "Submission"("deletedAt");

-- CreateIndex
CREATE INDEX "Submission_status_deletedAt_idx" ON "Submission"("status", "deletedAt");
