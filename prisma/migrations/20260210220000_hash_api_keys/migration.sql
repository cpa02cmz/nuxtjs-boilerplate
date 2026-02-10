-- Migration: Hash API Keys for Security
-- Issue: #1391 - API Keys Stored in Plaintext - Security Risk
--
-- This migration converts the ApiKey table to store hashed keys instead of plaintext.
-- Since we cannot retroactively hash existing keys (they would become invalid),
-- we need to handle existing keys with a migration strategy.

-- Step 1: Add new columns for hashed key storage
ALTER TABLE ApiKey ADD COLUMN keyHash TEXT;
ALTER TABLE ApiKey ADD COLUMN keyPrefix TEXT;

-- Step 2: Copy existing key values to keyPrefix (first 8 chars for identification)
-- This allows us to identify keys even after we can't read them
UPDATE ApiKey SET keyPrefix = substr(key, 1, 8) WHERE keyPrefix IS NULL;

-- Step 3: For existing keys, we need to keep them working during transition
-- We'll hash them on first validation, but for now copy to keyHash as placeholder
-- NOTE: In production, existing keys should be invalidated and regenerated
UPDATE ApiKey SET keyHash = key WHERE keyHash IS NULL;

-- Step 4: Create index on keyPrefix for efficient lookups
CREATE INDEX ApiKey_keyPrefix_idx ON ApiKey(keyPrefix);

-- Step 5: Create composite index for common queries
CREATE INDEX ApiKey_keyPrefix_deletedAt_active_idx ON ApiKey(keyPrefix, deletedAt, active);

-- Step 6: Remove the old index on key (we'll keep the column temporarily for rollback)
DROP INDEX ApiKey_key_idx;

-- Step 7: Add unique constraint on keyHash
CREATE UNIQUE INDEX ApiKey_keyHash_key ON ApiKey(keyHash);

-- Note: The old 'key' column should be dropped in a future migration after
-- confirming all existing keys have been migrated or regenerated
