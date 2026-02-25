-- Add source_url column for deduplication
-- Extracts URL from JSONB source field into a dedicated indexed column

-- 1. Add source_url column
ALTER TABLE notes ADD COLUMN source_url TEXT;

-- 2. Backfill from existing source JSONB
UPDATE notes
SET source_url = source->>'url'
WHERE source->>'url' IS NOT NULL
  AND source->>'url' != '';

-- 3. Partial unique index: one URL per user (only for non-null URLs)
-- This is the database-level safety net for dedup
CREATE UNIQUE INDEX idx_notes_user_source_url
  ON notes (user_id, source_url)
  WHERE source_url IS NOT NULL;

-- Note: The unique index above already serves as a B-tree for fast lookups.
-- No separate regular index needed.