import { getServiceClient } from '../client.js'

export interface AnalysisState {
  user_id: string
  notes_at_last_analysis: number
  last_analysis_at: string | null
  total_notes: number
}

export async function getAnalysisState(
  userId: string,
): Promise<AnalysisState | null> {
  const { data, error } = await getServiceClient()
    .from('analysis_state')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) return null
  return data as AnalysisState
}

export async function upsertAnalysisState(
  userId: string,
  fields: Partial<Omit<AnalysisState, 'user_id'>>,
): Promise<void> {
  const { error } = await getServiceClient()
    .from('analysis_state')
    .upsert({ user_id: userId, ...fields })

  if (error) throw new Error(`upsertAnalysisState: ${error.message}`)
}

export async function incrementTotalNotes(
  userId: string,
): Promise<AnalysisState> {
  const sb = getServiceClient()

  // Upsert with increment — create row if missing, increment if exists
  const existing = await getAnalysisState(userId)

  if (!existing) {
    const { data, error } = await sb
      .from('analysis_state')
      .insert({ user_id: userId, total_notes: 1 })
      .select()
      .single()

    if (error) throw new Error(`incrementTotalNotes insert: ${error.message}`)
    return data as AnalysisState
  }

  const { data, error } = await sb
    .from('analysis_state')
    .update({ total_notes: existing.total_notes + 1 })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw new Error(`incrementTotalNotes update: ${error.message}`)
  return data as AnalysisState
}
