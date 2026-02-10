-- Add index on Resource.url field for improved query performance
-- This enables efficient URL lookups for duplicate detection and validation
CREATE INDEX "Resource_url_idx" ON "Resource"("url");
