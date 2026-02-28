-- Expand connection_type enum with new edge types for knowledge graph
ALTER TYPE connection_type ADD VALUE 'embedding';
ALTER TYPE connection_type ADD VALUE 'keyword';
ALTER TYPE connection_type ADD VALUE 'bucket';

-- Track per-user graph computation state for incremental recomputation
CREATE TABLE graph_job_state (
  user_id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_computed_at TIMESTAMPTZ,
  last_note_count  INT DEFAULT 0,
  notes_since_last INT DEFAULT 0,
  is_running       BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_graph_job_state_updated_at
  BEFORE UPDATE ON graph_job_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger to track new notes for graph recomputation
CREATE OR REPLACE FUNCTION increment_graph_pending()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO graph_job_state (user_id, notes_since_last)
  VALUES (NEW.user_id, 1)
  ON CONFLICT (user_id)
  DO UPDATE SET notes_since_last = graph_job_state.notes_since_last + 1,
               updated_at = now();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_graph_pending
  AFTER INSERT ON notes
  FOR EACH ROW EXECUTE FUNCTION increment_graph_pending();

-- Composite index for graph endpoint queries
CREATE INDEX idx_conn_user_pair ON note_connections(user_id, source_id, target_id);
