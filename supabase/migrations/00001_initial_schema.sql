-- Second Brain: Initial Schema
-- Extensions, enums, tables, indexes, RLS, functions, triggers

-- ============================================================
-- Extensions
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- Custom Enum Types
-- ============================================================

CREATE TYPE para_type AS ENUM ('project', 'area', 'resource', 'archive');

CREATE TYPE note_source AS ENUM (
  'article', 'tweet', 'thread', 'reel', 'image',
  'pdf', 'voice_memo', 'thought', 'youtube', 'document', 'other'
);

CREATE TYPE distillation_status AS ENUM (
  'raw', 'key_points', 'distilled', 'evergreen'
);

CREATE TYPE connection_type AS ENUM ('explicit', 'ai_detected');

CREATE TYPE suggestion_type AS ENUM (
  'split_bucket', 'merge_notes', 'archive_project',
  'reclassify_note', 'create_sub_bucket', 'link_notes'
);

CREATE TYPE suggestion_status AS ENUM ('pending', 'accepted', 'dismissed');

-- ============================================================
-- Tables
-- ============================================================

-- 1. telegram_links
CREATE TABLE telegram_links (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_user_id BIGINT NOT NULL,
  telegram_username TEXT,
  linked_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(telegram_user_id)
);

CREATE INDEX idx_telegram_links_tg_id ON telegram_links(telegram_user_id);

-- 2. link_codes
CREATE TABLE link_codes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code       TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(code)
);

CREATE INDEX idx_link_codes_code ON link_codes(code);
CREATE INDEX idx_link_codes_user ON link_codes(user_id);

-- 3. para_buckets
CREATE TABLE para_buckets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        para_type NOT NULL,
  parent_id   UUID REFERENCES para_buckets(id) ON DELETE CASCADE,
  description TEXT,
  is_active   BOOLEAN DEFAULT true,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_para_user ON para_buckets(user_id);
CREATE INDEX idx_para_parent ON para_buckets(parent_id);
CREATE INDEX idx_para_type ON para_buckets(user_id, type);

-- 4. notes
CREATE TABLE notes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  original_content    TEXT,
  ai_summary          TEXT,
  key_points          JSONB DEFAULT '[]',
  distillation        TEXT,
  source_type         note_source NOT NULL DEFAULT 'other',
  source              JSONB DEFAULT '{}',
  user_note           TEXT,
  bucket_id           UUID REFERENCES para_buckets(id) ON DELETE SET NULL,
  ai_suggested_bucket UUID REFERENCES para_buckets(id) ON DELETE SET NULL,
  ai_confidence       REAL,
  is_classified       BOOLEAN DEFAULT false,
  is_original_thought BOOLEAN DEFAULT false,
  tags                TEXT[] DEFAULT '{}',
  distillation_status distillation_status DEFAULT 'raw',
  embedding           vector(1536),
  fts                 tsvector GENERATED ALWAYS AS (
                        to_tsvector('english',
                          coalesce(title, '') || ' ' ||
                          coalesce(original_content, '') || ' ' ||
                          coalesce(ai_summary, '') || ' ' ||
                          coalesce(distillation, '') || ' ' ||
                          coalesce(user_note, '')
                        )
                      ) STORED,
  view_count          INT DEFAULT 0,
  last_viewed_at      TIMESTAMPTZ,
  connection_count    INT DEFAULT 0,
  captured_at         TIMESTAMPTZ DEFAULT now(),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Search indexes
CREATE INDEX idx_notes_embedding ON notes USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_notes_fts ON notes USING gin(fts);
CREATE INDEX idx_notes_title_trgm ON notes USING gin(title gin_trgm_ops);

-- Query indexes
CREATE INDEX idx_notes_user ON notes(user_id);
CREATE INDEX idx_notes_bucket ON notes(user_id, bucket_id);
CREATE INDEX idx_notes_classified ON notes(user_id, is_classified);
CREATE INDEX idx_notes_status ON notes(user_id, distillation_status);
CREATE INDEX idx_notes_captured ON notes(user_id, captured_at DESC);
CREATE INDEX idx_notes_source_type ON notes(user_id, source_type);
CREATE INDEX idx_notes_tags ON notes USING gin(tags);

-- 5. note_connections
CREATE TABLE note_connections (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_id  UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  target_id  UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  type       connection_type NOT NULL DEFAULT 'ai_detected',
  similarity REAL,
  context    TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_id, target_id)
);

CREATE INDEX idx_conn_user ON note_connections(user_id);
CREATE INDEX idx_conn_source ON note_connections(source_id);
CREATE INDEX idx_conn_target ON note_connections(target_id);

-- 6. distillation_history
CREATE TABLE distillation_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_id    UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  status     distillation_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_distill_note ON distillation_history(note_id, created_at DESC);

-- 7. syntheses
CREATE TABLE syntheses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  query           TEXT,
  source_note_ids UUID[] NOT NULL,
  bucket_id       UUID REFERENCES para_buckets(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_synth_user ON syntheses(user_id);

-- 8. suggestions
CREATE TABLE suggestions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       suggestion_type NOT NULL,
  payload    JSONB NOT NULL,
  status     suggestion_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_suggestions_user_status ON suggestions(user_id, status);

-- 9. search_log
CREATE TABLE search_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query        TEXT NOT NULL,
  mode         TEXT NOT NULL CHECK (mode IN ('notes', 'answer')),
  result_count INT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_search_user ON search_log(user_id, created_at DESC);

-- 10. note_views
CREATE TABLE note_views (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_id   UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_views_user ON note_views(user_id, viewed_at DESC);
CREATE INDEX idx_views_note ON note_views(note_id);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE telegram_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own telegram link"
  ON telegram_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own telegram link"
  ON telegram_links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own telegram link"
  ON telegram_links FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE link_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own link codes"
  ON link_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own link codes"
  ON link_codes FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE para_buckets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own buckets"
  ON para_buckets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own notes"
  ON notes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE note_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own connections"
  ON note_connections FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE distillation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own distillation history"
  ON distillation_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE syntheses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own syntheses"
  ON syntheses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own suggestions"
  ON suggestions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE search_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own search logs"
  ON search_log FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE note_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own note views"
  ON note_views FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Trigger Functions
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_para_updated_at
  BEFORE UPDATE ON para_buckets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION update_connection_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE notes SET connection_count = connection_count + 1 WHERE id = NEW.source_id;
    UPDATE notes SET connection_count = connection_count + 1 WHERE id = NEW.target_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE notes SET connection_count = GREATEST(connection_count - 1, 0) WHERE id = OLD.source_id;
    UPDATE notes SET connection_count = GREATEST(connection_count - 1, 0) WHERE id = OLD.target_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_connection_count
  AFTER INSERT OR DELETE ON note_connections
  FOR EACH ROW EXECUTE FUNCTION update_connection_count();

-- ============================================================
-- Hybrid Search Function
-- ============================================================

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

-- ============================================================
-- Storage Bucket
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('user-content', 'user-content', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-content'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read their own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'user-content'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-content'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
