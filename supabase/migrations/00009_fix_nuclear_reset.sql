-- Fix nuclear_reset: clear all app data and auth users.
-- Storage objects must be deleted via the Dashboard or Storage API first.
CREATE OR REPLACE FUNCTION public.nuclear_reset()
RETURNS void AS $$
BEGIN
  -- Clear all app tables (order respects FK constraints)
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

  -- Delete all auth users (safe now that all FK references are gone)
  DELETE FROM auth.users WHERE TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
