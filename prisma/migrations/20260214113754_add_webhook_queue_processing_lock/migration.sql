-- AlterTable
ALTER TABLE "WebhookQueue" ADD COLUMN "processedBy" TEXT;
ALTER TABLE "WebhookQueue" ADD COLUMN "processingStartedAt" DATETIME;

-- CreateIndex
CREATE INDEX "WebhookQueue_processingStartedAt_idx" ON "WebhookQueue"("processingStartedAt");
