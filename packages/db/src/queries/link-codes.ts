import { getServiceClient } from '../client.js'

export async function createLinkCode(
  userId: string,
  code: string,
  expiresAt: string,
): Promise<void> {
  const { error } = await getServiceClient()
    .from('link_codes')
    .insert({
      user_id: userId,
      code,
      expires_at: expiresAt,
    })

  if (error) throw new Error(`createLinkCode: ${error.message}`)
}

export async function findValidLinkCode(
  code: string,
): Promise<{ user_id: string; id: string } | null> {
  const { data, error } = await getServiceClient()
    .from('link_codes')
    .select('id, user_id, expires_at, used')
    .eq('code', code)
    .eq('used', false)
    .single()

  if (error || !data) return null

  const expires = new Date(data.expires_at as string)
  if (expires < new Date()) return null

  return { user_id: data.user_id as string, id: data.id as string }
}

export async function markLinkCodeUsed(codeId: string): Promise<void> {
  await getServiceClient()
    .from('link_codes')
    .update({ used: true })
    .eq('id', codeId)
}

export interface LinkCodeRecord {
  id: string
  user_id: string
  code: string
  used: boolean
  expires_at: string
}

export async function findLinkCodeByCode(
  code: string,
): Promise<LinkCodeRecord | null> {
  const { data, error } = await getServiceClient()
    .from('link_codes')
    .select('id, user_id, code, used, expires_at')
    .eq('code', code)
    .single()

  if (error || !data) return null
  return data as LinkCodeRecord
}

export async function invalidatePreviousCodes(
  userId: string,
): Promise<void> {
  await getServiceClient()
    .from('link_codes')
    .update({ used: true })
    .eq('user_id', userId)
    .eq('used', false)
}
