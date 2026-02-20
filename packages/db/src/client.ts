import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let serviceClient: SupabaseClient | null = null
let anonClient: SupabaseClient | null = null

/**
 * Service role client — bypasses RLS. Used by API and bot.
 * Data isolation enforced by always filtering on user_id.
 */
export function getServiceClient(): SupabaseClient {
  if (serviceClient) return serviceClient

  const url = process.env['SUPABASE_URL']
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY']

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  serviceClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  return serviceClient
}

/**
 * Anon client — respects RLS. Used by frontend for Auth and Realtime only.
 * NOT for data queries — those go through the API.
 */
export function getAnonClient(): SupabaseClient {
  if (anonClient) return anonClient

  const url = process.env['SUPABASE_URL']
  const key = process.env['SUPABASE_ANON_KEY']

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
  }

  anonClient = createClient(url, key)

  return anonClient
}
