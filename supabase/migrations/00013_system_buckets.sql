-- Add is_system flag to para_buckets
ALTER TABLE para_buckets ADD COLUMN is_system BOOLEAN NOT NULL DEFAULT false;

-- Mark existing root PARA buckets as system buckets
UPDATE para_buckets
SET is_system = true
WHERE parent_id IS NULL
  AND name IN ('Projects', 'Areas', 'Resources', 'Archive');

-- Uniqueness: one system root per (user_id, type)
CREATE UNIQUE INDEX idx_para_system_root
  ON para_buckets (user_id, type)
  WHERE is_system = true;

-- Prevent creating new system buckets or duplicating system names
CREATE OR REPLACE FUNCTION prevent_system_bucket_conflict()
RETURNS TRIGGER AS $$
BEGIN
  -- Block non-system rows from using reserved root names at root level
  IF NEW.parent_id IS NULL
     AND NEW.is_system = false
     AND LOWER(NEW.name) IN ('projects', 'areas', 'resources', 'archive')
  THEN
    RAISE EXCEPTION 'Cannot create a root bucket with reserved name: %', NEW.name;
  END IF;

  -- Block setting is_system=true on non-canonical rows
  IF TG_OP = 'INSERT' AND NEW.is_system = true AND NEW.parent_id IS NOT NULL THEN
    RAISE EXCEPTION 'Only root buckets can be system buckets';
  END IF;

  -- Block setting is_system=true via update on rows that weren't already system
  IF TG_OP = 'UPDATE' AND NEW.is_system = true AND OLD.is_system = false THEN
    RAISE EXCEPTION 'Cannot promote a bucket to system bucket';
  END IF;

  -- Block any modification of is_system on existing system buckets
  IF TG_OP = 'UPDATE' AND OLD.is_system = true THEN
    IF NEW.is_system = false THEN
      RAISE EXCEPTION 'Cannot remove system flag from system bucket';
    END IF;
    IF NEW.name != OLD.name THEN
      RAISE EXCEPTION 'Cannot rename system bucket: %', OLD.name;
    END IF;
    IF NEW.parent_id IS DISTINCT FROM OLD.parent_id THEN
      RAISE EXCEPTION 'Cannot reparent system bucket: %', OLD.name;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protect_system_buckets
  BEFORE INSERT OR UPDATE ON para_buckets
  FOR EACH ROW EXECUTE FUNCTION prevent_system_bucket_conflict();

-- Prevent deletion of system buckets
CREATE OR REPLACE FUNCTION prevent_system_bucket_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_system = true THEN
    RAISE EXCEPTION 'Cannot delete system bucket: %', OLD.name;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_system_delete
  BEFORE DELETE ON para_buckets
  FOR EACH ROW EXECUTE FUNCTION prevent_system_bucket_delete();

-- Merge any user-created duplicate root buckets into system ones
DO $$
DECLARE
  sys_bucket RECORD;
  dup_bucket RECORD;
BEGIN
  FOR sys_bucket IN
    SELECT id, user_id, LOWER(name) AS lname
    FROM para_buckets
    WHERE is_system = true AND parent_id IS NULL
  LOOP
    FOR dup_bucket IN
      SELECT id FROM para_buckets
      WHERE user_id = sys_bucket.user_id
        AND LOWER(name) = sys_bucket.lname
        AND parent_id IS NULL
        AND is_system = false
    LOOP
      -- Reparent children of duplicate under system bucket
      UPDATE para_buckets SET parent_id = sys_bucket.id
      WHERE parent_id = dup_bucket.id;

      -- Move notes from duplicate to system bucket
      UPDATE notes SET bucket_id = sys_bucket.id
      WHERE bucket_id = dup_bucket.id;

      -- Delete the duplicate (trigger won't fire since is_system = false)
      DELETE FROM para_buckets WHERE id = dup_bucket.id;
    END LOOP;
  END LOOP;
END;
$$;
