import { getServiceClient } from '../client.js'
import type { Suggestion, SuggestionStatus, SuggestionType } from '@second-brain/shared'

export async function getPendingSuggestions(
  userId: string,
): Promise<Suggestion[]> {
  const { data, error } = await getServiceClient()
    .from('suggestions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`getPendingSuggestions: ${error.message}`)
  return (data ?? []) as Suggestion[]
}

export async function getSuggestionById(
  userId: string,
  suggestionId: string,
): Promise<Suggestion | null> {
  const { data, error } = await getServiceClient()
    .from('suggestions')
    .select('*')
    .eq('id', suggestionId)
    .eq('user_id', userId)
    .single()

  if (error) return null
  return data as Suggestion
}

export async function createSuggestion(
  userId: string,
  type: SuggestionType,
  payload: Record<string, unknown>,
): Promise<Suggestion> {
  const { data, error } = await getServiceClient()
    .from('suggestions')
    .insert({ user_id: userId, type, payload })
    .select()
    .single()

  if (error) throw new Error(`createSuggestion: ${error.message}`)
  return data as Suggestion
}

export async function hasPendingSuggestion(
  userId: string,
  type: SuggestionType,
  payloadKey: string,
  payloadValue: string,
): Promise<boolean> {
  const pending = await getPendingSuggestions(userId)
  return pending.some(
    (s) => s.type === type && s.payload[payloadKey] === payloadValue,
  )
}

export async function updateSuggestionStatus(
  userId: string,
  suggestionId: string,
  status: SuggestionStatus,
): Promise<void> {
  const { error } = await getServiceClient()
    .from('suggestions')
    .update({ status })
    .eq('id', suggestionId)
    .eq('user_id', userId)

  if (error) throw new Error(`updateSuggestionStatus: ${error.message}`)
}
