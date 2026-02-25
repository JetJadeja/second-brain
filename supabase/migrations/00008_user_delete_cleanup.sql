-- ============================================================
-- Nuclear reset: delete ALL app data and ALL auth users
-- ============================================================

-- Delete storage objects via Dashboard or Storage API before calling this.
-- Supabase protects storage.objects from direct SQL deletion and
-- ALTER TABLE on storage tables requires owner privileges not available
-- via the REST API.

CREATE OR REPLACE FUNCTION public.nuclear_reset()
RETURNS void AS $$
BEGIN
  DELETE FROM note_connections WHERE TRUE;
  DELETE FROM distillation_history WHERE TRUE;
  DELETE FROM suggestions WHERE TRUE;
  DELETE FROM search_log WHERE TRUE;
  DELETE FROM note_views WHERE TRUE;
  DELETE FROM conversation_messages WHERE TRUE;
  DELETE FROM syntheses WHERE TRUE;
  DELETE FROM notes WHERE TRUE;
  DELETE FROM para_buckets WHERE TRUE;
  DELETE FROM telegram_links WHERE TRUE;
  DELETE FROM link_codes WHERE TRUE;
  DELETE FROM user_onboarding WHERE TRUE;
  DELETE FROM analysis_state WHERE TRUE;
  DELETE FROM auth.users WHERE TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
