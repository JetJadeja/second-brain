import { Router } from 'express'
import {
  invalidatePreviousCodes,
  createLinkCode,
  getTelegramLink,
  deleteTelegramLink,
} from '@second-brain/db'
import type { LinkCodeResponse, LinkStatusResponse } from '@second-brain/shared'

export const linkRouter = Router()

// Characters excluding ambiguous: 0, O, 1, I, L
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function generateCode(): string {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return code
}

linkRouter.post('/code', async (req, res) => {
  const userId = req.userId!

  await invalidatePreviousCodes(userId)

  const code = generateCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  await createLinkCode(userId, code, expiresAt)

  const response: LinkCodeResponse = { code, expires_at: expiresAt }
  res.json(response)
})

linkRouter.get('/status', async (req, res) => {
  const userId = req.userId!

  const link = await getTelegramLink(userId)

  const response: LinkStatusResponse = link
    ? { linked: true, telegram_username: link.telegram_username ?? undefined }
    : { linked: false }

  res.json(response)
})

linkRouter.delete('/link', async (req, res) => {
  const userId = req.userId!
  await deleteTelegramLink(userId)
  res.json({ success: true })
})
