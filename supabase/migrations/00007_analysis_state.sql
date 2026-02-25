CREATE TABLE analysis_state (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notes_at_last_analysis integer NOT NULL DEFAULT 0,
  last_analysis_at timestamptz,
  total_notes integer NOT NULL DEFAULT 0
);

ALTER TABLE analysis_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own analysis state"
  ON analysis_state FOR SELECT
  USING (auth.uid() = user_id);
