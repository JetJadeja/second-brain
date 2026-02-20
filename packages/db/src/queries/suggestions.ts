import { getServiceClient } from '../client.js'
import type { Suggestion, SuggestionStatus } from '@second-brain/shared'

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
