-- CreateTable
CREATE TABLE "AnalyticsEvent" (
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

-- CreateTable
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "secret" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "events" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "WebhookDelivery" (
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
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "WebhookQueue" (
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
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "DeadLetterWebhook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "webhookId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "failureReason" TEXT NOT NULL,
    "lastAttemptAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deliveryAttempts" TEXT NOT NULL,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "IdempotencyKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "webhookId" TEXT,
    "deliveryId" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

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

-- CreateIndex
CREATE INDEX "AnalyticsEvent_timestamp_idx" ON "AnalyticsEvent"("timestamp");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_resourceId_idx" ON "AnalyticsEvent"("resourceId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_idx" ON "AnalyticsEvent"("type");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_ip_idx" ON "AnalyticsEvent"("ip");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_timestamp_type_idx" ON "AnalyticsEvent"("timestamp", "type");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_timestamp_resourceId_idx" ON "AnalyticsEvent"("timestamp", "resourceId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_resourceId_type_idx" ON "AnalyticsEvent"("resourceId", "type");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_ip_timestamp_idx" ON "AnalyticsEvent"("ip", "timestamp");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_category_timestamp_idx" ON "AnalyticsEvent"("category", "timestamp");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_deletedAt_idx" ON "AnalyticsEvent"("deletedAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_resourceId_type_timestamp_deletedAt_idx" ON "AnalyticsEvent"("resourceId", "type", "timestamp", "deletedAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_timestamp_deletedAt_idx" ON "AnalyticsEvent"("timestamp", "deletedAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_ip_timestamp_deletedAt_idx" ON "AnalyticsEvent"("ip", "timestamp", "deletedAt");

-- CreateIndex
CREATE INDEX "Webhook_active_idx" ON "Webhook"("active");

-- CreateIndex
CREATE INDEX "Webhook_deletedAt_idx" ON "Webhook"("deletedAt");

-- CreateIndex
CREATE INDEX "Webhook_active_deletedAt_idx" ON "Webhook"("active", "deletedAt");

-- CreateIndex
CREATE INDEX "Webhook_url_idx" ON "Webhook"("url");

-- CreateIndex
CREATE INDEX "WebhookDelivery_webhookId_idx" ON "WebhookDelivery"("webhookId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_idempotencyKey_idx" ON "WebhookDelivery"("idempotencyKey");

-- CreateIndex
CREATE INDEX "WebhookDelivery_status_idx" ON "WebhookDelivery"("status");

-- CreateIndex
CREATE INDEX "WebhookDelivery_createdAt_idx" ON "WebhookDelivery"("createdAt");

-- CreateIndex
CREATE INDEX "WebhookDelivery_webhookId_status_idx" ON "WebhookDelivery"("webhookId", "status");

-- CreateIndex
CREATE INDEX "WebhookDelivery_deletedAt_idx" ON "WebhookDelivery"("deletedAt");

-- CreateIndex
CREATE INDEX "WebhookQueue_scheduledFor_idx" ON "WebhookQueue"("scheduledFor");

-- CreateIndex
CREATE INDEX "WebhookQueue_priority_scheduledFor_idx" ON "WebhookQueue"("priority", "scheduledFor");

-- CreateIndex
CREATE INDEX "WebhookQueue_webhookId_idx" ON "WebhookQueue"("webhookId");

-- CreateIndex
CREATE INDEX "WebhookQueue_deletedAt_idx" ON "WebhookQueue"("deletedAt");

-- CreateIndex
CREATE INDEX "DeadLetterWebhook_createdAt_idx" ON "DeadLetterWebhook"("createdAt");

-- CreateIndex
CREATE INDEX "DeadLetterWebhook_webhookId_idx" ON "DeadLetterWebhook"("webhookId");

-- CreateIndex
CREATE INDEX "DeadLetterWebhook_deletedAt_idx" ON "DeadLetterWebhook"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiKey_key_idx" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");

-- CreateIndex
CREATE INDEX "ApiKey_active_idx" ON "ApiKey"("active");

-- CreateIndex
CREATE INDEX "ApiKey_expiresAt_idx" ON "ApiKey"("expiresAt");

-- CreateIndex
CREATE INDEX "ApiKey_deletedAt_idx" ON "ApiKey"("deletedAt");

-- CreateIndex
CREATE INDEX "ApiKey_key_deletedAt_active_idx" ON "ApiKey"("key", "deletedAt", "active");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyKey_key_key" ON "IdempotencyKey"("key");

-- CreateIndex
CREATE INDEX "IdempotencyKey_key_idx" ON "IdempotencyKey"("key");

-- CreateIndex
CREATE INDEX "IdempotencyKey_webhookId_idx" ON "IdempotencyKey"("webhookId");

-- CreateIndex
CREATE INDEX "IdempotencyKey_createdAt_idx" ON "IdempotencyKey"("createdAt");

-- CreateIndex
CREATE INDEX "IdempotencyKey_expiresAt_idx" ON "IdempotencyKey"("expiresAt");

-- CreateIndex
CREATE INDEX "IdempotencyKey_deletedAt_idx" ON "IdempotencyKey"("deletedAt");

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
