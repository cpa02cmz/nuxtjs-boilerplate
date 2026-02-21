-- -architect: Add composite index for resource listing queries with status filter and date ordering
-- Optimizes queries that filter by status and sort/filter by dateAdded (common in admin dashboards)
CREATE INDEX "Resource_status_dateAdded_idx" ON "Resource"("status", "dateAdded");
