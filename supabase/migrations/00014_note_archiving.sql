-- Add archived_at timestamp to notes
ALTER TABLE notes ADD COLUMN archived_at TIMESTAMPTZ DEFAULT NULL;

-- Index for archive view (listing archived notes)
CREATE INDEX idx_notes_archived ON notes(user_id, archived_at DESC)
  WHERE archived_at IS NOT NULL;

-- Index for active-note queries (most queries filter archived_at IS NULL)
CREATE INDEX idx_notes_active ON notes(user_id, captured_at DESC)
  WHERE archived_at IS NULL;

-- Backfill: notes currently in the Archive bucket get archived_at set
UPDATE notes n
SET archived_at = n.updated_at
FROM para_buckets b
WHERE n.bucket_id = b.id
  AND b.is_system = true
  AND b.type = 'archive'
  AND b.parent_id IS NULL
  AND n.archived_at IS NULL;

-- Recreate hybrid_search with archived_at IS NULL filter in both CTEs
CREATE OR REPLACE FUNCTION hybrid_search(
  p_user_id UUID,
  p_query_text TEXT,
  p_query_embedding vector(1536),
  p_match_count INT DEFAULT 20,
  p_full_text_weight FLOAT DEFAULT 1.0,
  p_semantic_weight FLOAT DEFAULT 1.0,
  p_rrf_k INT DEFAULT 50,
  p_filter_bucket_id UUID DEFAULT NULL,
  p_filter_source_type note_source DEFAULT NULL,
  p_filter_status distillation_status DEFAULT NULL,
  p_filter_after TIMESTAMPTZ DEFAULT NULL,
  p_filter_before TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  original_content TEXT,
  ai_summary TEXT,
  distillation TEXT,
  source_type note_source,
  source JSONB,
  distillation_status distillation_status,
  bucket_id UUID,
  tags TEXT[],
  captured_at TIMESTAMPTZ,
  connection_count INT,
  user_note TEXT,
  is_original_thought BOOLEAN,
  similarity FLOAT,
  rank_score FLOAT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH full_text AS (
    SELECT
      n.id,
      row_number() OVER (ORDER BY ts_rank_cd(n.fts, websearch_to_tsquery(p_query_text)) DESC) AS rank_ix
    FROM notes n
    WHERE n.user_id = p_user_id
      AND n.archived_at IS NULL
      AND n.fts @@ websearch_to_tsquery(p_query_text)
      AND (p_filter_bucket_id IS NULL OR n.bucket_id = p_filter_bucket_id)
      AND (p_filter_source_type IS NULL OR n.source_type = p_filter_source_type)
      AND (p_filter_status IS NULL OR n.distillation_status = p_filter_status)
      AND (p_filter_after IS NULL OR n.captured_at >= p_filter_after)
      AND (p_filter_before IS NULL OR n.captured_at <= p_filter_before)
    ORDER BY rank_ix
    LIMIT LEAST(p_match_count, 100) * 2
  ),
  semantic AS (
    SELECT
      n.id,
      1 - (n.embedding <=> p_query_embedding) AS sim,
      row_number() OVER (ORDER BY n.embedding <=> p_query_embedding) AS rank_ix
    FROM notes n
    WHERE n.user_id = p_user_id
      AND n.archived_at IS NULL
      AND n.embedding IS NOT NULL
      AND (p_filter_bucket_id IS NULL OR n.bucket_id = p_filter_bucket_id)
      AND (p_filter_source_type IS NULL OR n.source_type = p_filter_source_type)
      AND (p_filter_status IS NULL OR n.distillation_status = p_filter_status)
      AND (p_filter_after IS NULL OR n.captured_at >= p_filter_after)
      AND (p_filter_before IS NULL OR n.captured_at <= p_filter_before)
    ORDER BY rank_ix
    LIMIT LEAST(p_match_count, 100) * 2
  )
  SELECT
    n.id,
    n.title,
    n.original_content,
    n.ai_summary,
    n.distillation,
    n.source_type,
    n.source,
    n.distillation_status,
    n.bucket_id,
    n.tags,
    n.captured_at,
    n.connection_count,
    n.user_note,
    n.is_original_thought,
    COALESCE(s.sim, 0)::FLOAT AS similarity,
    (
      COALESCE(1.0 / (p_rrf_k + ft.rank_ix), 0.0) * p_full_text_weight +
      COALESCE(1.0 / (p_rrf_k + s.rank_ix), 0.0) * p_semantic_weight
    )::FLOAT AS rank_score
  FROM full_text ft
  FULL OUTER JOIN semantic s ON ft.id = s.id
  JOIN notes n ON COALESCE(ft.id, s.id) = n.id
  ORDER BY rank_score DESC
  LIMIT LEAST(p_match_count, 100)
$$;
