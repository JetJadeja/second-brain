import type { BotContext } from '../context.js'

/**
 * Downloads a file from Telegram by file_id.
 * Returns the raw buffer and file path.
 */
export async function downloadTelegramFile(
  ctx: BotContext,
  fileId: string,
): Promise<{ buffer: Buffer; filePath: string }> {
  const file = await ctx.api.getFile(fileId)
  const filePath = file.file_path

  if (!filePath) {
    throw new Error('Telegram returned no file path')
  }

  const token = ctx.api.token
  const url = `https://api.telegram.org/file/bot${token}/${filePath}`

  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) })

  if (!res.ok) {
    throw new Error(`Failed to download file: ${res.status}`)
  }

  const arrayBuffer = await res.arrayBuffer()
  return { buffer: Buffer.from(arrayBuffer), filePath }
}
