import { getServiceClient } from '../client.js'

export async function getDistillationCandidates(
  userId: string,
  limit: number,
): Promise<Array<{ id: string; title: string; view_count: number }>> {
  const { data, error } = await getServiceClient()
    .from('notes')
    .select('id, title, view_count')
    .eq('user_id', userId)
    .eq('is_classified', true)
    .eq('distillation_status', 'raw')
    .is('archived_at', null)
    .order('view_count', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`getDistillationCandidates: ${error.message}`)
  return (data ?? []) as Array<{ id: string; title: string; view_count: number }>
}

export async function getOldestInboxAge(userId: string): Promise<string | null> {
  const { data, error } = await getServiceClient()
    .from('notes')
    .select('captured_at')
    .eq('user_id', userId)
    .eq('is_classified', false)
    .is('archived_at', null)
    .order('captured_at', { ascending: true })
    .limit(1)

  if (error) throw new Error(`getOldestInboxAge: ${error.message}`)
  return (data?.[0]?.captured_at as string) ?? null
}
