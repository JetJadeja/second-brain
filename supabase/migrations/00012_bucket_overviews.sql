ALTER TABLE para_buckets ADD COLUMN overview TEXT;
ALTER TABLE para_buckets ADD COLUMN notes_at_last_overview INT DEFAULT 0;
