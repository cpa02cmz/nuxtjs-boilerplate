-- Rollback: Restore redundant indexes
-- Note: These indexes are redundant but can be restored if needed

-- Restore AnalyticsEvent indexes
CREATE INDEX "AnalyticsEvent_resourceId_idx" ON "AnalyticsEvent"("resourceId");
CREATE INDEX "AnalyticsEvent_type_idx" ON "AnalyticsEvent"("type");
CREATE INDEX "AnalyticsEvent_ip_idx" ON "AnalyticsEvent"("ip");
CREATE INDEX "AnalyticsEvent_deletedAt_idx" ON "AnalyticsEvent"("deletedAt");
CREATE INDEX "AnalyticsEvent_timestamp_deletedAt_idx" ON "AnalyticsEvent"("timestamp", "deletedAt");
CREATE INDEX "AnalyticsEvent_ip_timestamp_deletedAt_idx" ON "AnalyticsEvent"("ip", "timestamp", "deletedAt");

-- Restore RateLimit redundant index
CREATE INDEX "RateLimit_key_window_idx" ON "RateLimit"("key", "window");
