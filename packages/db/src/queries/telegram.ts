import { getServiceClient } from '../client.js'
import type { TelegramLink } from '@second-brain/shared'

export async function lookupUserByTelegramId(
  telegramUserId: number,
): Promise<string | null> {
  const { data, error } = await getServiceClient()
    .from('telegram_links')
    .select('user_id')
    .eq('telegram_user_id', telegramUserId)
    .single()

  if (error || !data) return null
  return data.user_id as string
}

export async function createTelegramLink(
  userId: string,
  telegramUserId: number,
  telegramUsername?: string,
): Promise<TelegramLink> {
  const { data, error } = await getServiceClient()
    .from('telegram_links')
    .insert({
      user_id: userId,
      telegram_user_id: telegramUserId,
      telegram_username: telegramUsername ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(`createTelegramLink: ${error.message}`)
  return data as TelegramLink
}

export async function deleteTelegramLink(userId: string): Promise<void> {
  const { error } = await getServiceClient()
    .from('telegram_links')
    .delete()
    .eq('user_id', userId)

  if (error) throw new Error(`deleteTelegramLink: ${error.message}`)
}

export async function getTelegramLink(
  userId: string,
): Promise<TelegramLink | null> {
  const { data, error } = await getServiceClient()
    .from('telegram_links')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data as TelegramLink
}

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

export async function invalidatePreviousCodes(
  userId: string,
): Promise<void> {
  await getServiceClient()
    .from('link_codes')
    .update({ used: true })
    .eq('user_id', userId)
    .eq('used', false)
}
