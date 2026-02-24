-- RPC function for server-side vector similarity search
-- Replaces client-side cosine similarity computation

CREATE OR REPLACE FUNCTION find_similar_notes(
  p_user_id UUID,
  p_query_embedding vector(1536),
  p_exclude_note_id UUID DEFAULT NULL,
  p_match_count INT DEFAULT 5,
  p_similarity_threshold FLOAT DEFAULT 0.0
)
RETURNS TABLE (id UUID, title TEXT, similarity FLOAT)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id,
    n.title,
    (1 - (n.embedding <=> p_query_embedding))::FLOAT AS similarity
  FROM notes n
  WHERE n.user_id = p_user_id
    AND n.embedding IS NOT NULL
    AND (p_exclude_note_id IS NULL OR n.id != p_exclude_note_id)
    AND (1 - (n.embedding <=> p_query_embedding)) >= p_similarity_threshold
  ORDER BY n.embedding <=> p_query_embedding
  LIMIT p_match_count;
END;
$$;
