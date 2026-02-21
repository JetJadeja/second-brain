-- Conversation messages: per-user message history for context-aware intent detection

CREATE TABLE conversation_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT NOT NULL,
  note_ids   UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_convo_user_recent ON conversation_messages(user_id, created_at DESC);

ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own conversation messages"
  ON conversation_messages FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
