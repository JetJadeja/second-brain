import { Router } from 'express'
import { randomInt } from 'node:crypto'
import {
  invalidatePreviousCodes,
  createLinkCode,
  getTelegramLink,
  deleteTelegramLink,
} from '@second-brain/db'
import { catchAsync } from '../middleware/catch-async.js'
import type { LinkCodeResponse, LinkStatusResponse } from '@second-brain/shared'

export const linkRouter = Router()

const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function generateCode(): string {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += CHARS[randomInt(CHARS.length)]
  }
  return code
}

linkRouter.post('/code', catchAsync(async (req, res) => {
  const userId = req.userId!

  await invalidatePreviousCodes(userId)

  const code = generateCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  await createLinkCode(userId, code, expiresAt)

  const response: LinkCodeResponse = { code, expires_at: expiresAt }
  res.json(response)
}))

linkRouter.get('/status', catchAsync(async (req, res) => {
  const userId = req.userId!

  const link = await getTelegramLink(userId)

  const response: LinkStatusResponse = link
    ? { linked: true, telegram_username: link.telegram_username ?? undefined }
    : { linked: false }

  res.json(response)
}))

linkRouter.delete('/link', catchAsync(async (req, res) => {
  const userId = req.userId!
  await deleteTelegramLink(userId)
  res.json({ success: true })
}))
