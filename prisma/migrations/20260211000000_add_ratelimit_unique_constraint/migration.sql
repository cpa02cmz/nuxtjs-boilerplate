-- Add unique constraint on RateLimit [key, window] to prevent race conditions
-- Issue: #1393 - RateLimit Table Missing Unique Constraint
-- This prevents duplicate entries and ensures atomic rate limiting operations

-- Create unique index on key and window combination
CREATE UNIQUE INDEX "RateLimit_key_window_unique" ON "RateLimit"("key", "window");
