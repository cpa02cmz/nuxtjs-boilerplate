-- Drop the unique constraint if migration needs to be reverted
DROP INDEX IF EXISTS "RateLimit_key_window_unique";
