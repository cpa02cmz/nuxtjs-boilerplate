-- CreateTable
CREATE TABLE "Flag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resourceId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateIndex
CREATE INDEX "Flag_resourceId_idx" ON "Flag"("resourceId");

-- CreateIndex
CREATE INDEX "Flag_reportedBy_idx" ON "Flag"("reportedBy");

-- CreateIndex
CREATE INDEX "Flag_resolved_idx" ON "Flag"("resolved");

-- CreateIndex
CREATE INDEX "Flag_createdAt_idx" ON "Flag"("createdAt");

-- CreateIndex
CREATE INDEX "Flag_deletedAt_idx" ON "Flag"("deletedAt");
