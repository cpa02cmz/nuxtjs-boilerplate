-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DeadLetterWebhook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "webhookId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "failureReason" TEXT NOT NULL,
    "lastAttemptAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deliveryAttempts" TEXT NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "DeadLetterWebhook_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DeadLetterWebhook" ("createdAt", "deletedAt", "deliveryAttempts", "event", "failureReason", "id", "lastAttemptAt", "payload", "updatedAt", "webhookId") SELECT "createdAt", "deletedAt", "deliveryAttempts", "event", "failureReason", "id", "lastAttemptAt", "payload", "updatedAt", "webhookId" FROM "DeadLetterWebhook";
DROP TABLE "DeadLetterWebhook";
ALTER TABLE "new_DeadLetterWebhook" RENAME TO "DeadLetterWebhook";
CREATE INDEX "DeadLetterWebhook_createdAt_idx" ON "DeadLetterWebhook"("createdAt");
CREATE INDEX "DeadLetterWebhook_webhookId_idx" ON "DeadLetterWebhook"("webhookId");
CREATE INDEX "DeadLetterWebhook_deletedAt_idx" ON "DeadLetterWebhook"("deletedAt");
CREATE TABLE "new_IdempotencyKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "webhookId" TEXT,
    "deliveryId" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "IdempotencyKey_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "WebhookDelivery" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_IdempotencyKey" ("createdAt", "deletedAt", "deliveryId", "expiresAt", "id", "key", "updatedAt", "webhookId") SELECT "createdAt", "deletedAt", "deliveryId", "expiresAt", "id", "key", "updatedAt", "webhookId" FROM "IdempotencyKey";
DROP TABLE "IdempotencyKey";
ALTER TABLE "new_IdempotencyKey" RENAME TO "IdempotencyKey";
CREATE UNIQUE INDEX "IdempotencyKey_key_key" ON "IdempotencyKey"("key");
CREATE INDEX "IdempotencyKey_key_idx" ON "IdempotencyKey"("key");
CREATE INDEX "IdempotencyKey_webhookId_idx" ON "IdempotencyKey"("webhookId");
CREATE INDEX "IdempotencyKey_createdAt_idx" ON "IdempotencyKey"("createdAt");
CREATE INDEX "IdempotencyKey_expiresAt_idx" ON "IdempotencyKey"("expiresAt");
CREATE INDEX "IdempotencyKey_deletedAt_idx" ON "IdempotencyKey"("deletedAt");
CREATE TABLE "new_WebhookDelivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "webhookId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "statusCode" INTEGER,
    "responseBody" TEXT,
    "errorMessage" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 1,
    "idempotencyKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "WebhookDelivery_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WebhookDelivery" ("attemptCount", "createdAt", "deletedAt", "errorMessage", "event", "id", "idempotencyKey", "payload", "responseBody", "status", "statusCode", "updatedAt", "webhookId") SELECT "attemptCount", "createdAt", "deletedAt", "errorMessage", "event", "id", "idempotencyKey", "payload", "responseBody", "status", "statusCode", "updatedAt", "webhookId" FROM "WebhookDelivery";
DROP TABLE "WebhookDelivery";
ALTER TABLE "new_WebhookDelivery" RENAME TO "WebhookDelivery";
CREATE INDEX "WebhookDelivery_webhookId_idx" ON "WebhookDelivery"("webhookId");
CREATE INDEX "WebhookDelivery_idempotencyKey_idx" ON "WebhookDelivery"("idempotencyKey");
CREATE INDEX "WebhookDelivery_status_idx" ON "WebhookDelivery"("status");
CREATE INDEX "WebhookDelivery_createdAt_idx" ON "WebhookDelivery"("createdAt");
CREATE INDEX "WebhookDelivery_webhookId_status_idx" ON "WebhookDelivery"("webhookId", "status");
CREATE INDEX "WebhookDelivery_deletedAt_idx" ON "WebhookDelivery"("deletedAt");
CREATE TABLE "new_WebhookQueue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "webhookId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "scheduledFor" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "WebhookQueue_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WebhookQueue" ("createdAt", "deletedAt", "event", "id", "maxRetries", "payload", "priority", "retryCount", "scheduledFor", "updatedAt", "webhookId") SELECT "createdAt", "deletedAt", "event", "id", "maxRetries", "payload", "priority", "retryCount", "scheduledFor", "updatedAt", "webhookId" FROM "WebhookQueue";
DROP TABLE "WebhookQueue";
ALTER TABLE "new_WebhookQueue" RENAME TO "WebhookQueue";
CREATE INDEX "WebhookQueue_scheduledFor_idx" ON "WebhookQueue"("scheduledFor");
CREATE INDEX "WebhookQueue_priority_scheduledFor_idx" ON "WebhookQueue"("priority", "scheduledFor");
CREATE INDEX "WebhookQueue_webhookId_idx" ON "WebhookQueue"("webhookId");
CREATE INDEX "WebhookQueue_deletedAt_idx" ON "WebhookQueue"("deletedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
