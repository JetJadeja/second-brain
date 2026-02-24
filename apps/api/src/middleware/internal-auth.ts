import type { Request, Response, NextFunction } from 'express'

const INTERNAL_API_KEY = process.env['INTERNAL_API_KEY']

export function requireInternalAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!INTERNAL_API_KEY) {
    console.error('[internal-auth] INTERNAL_API_KEY not configured')
    res.status(500).json({ error: 'internal auth not configured' })
    return
  }

  const key = req.headers['x-internal-key']
  if (key !== INTERNAL_API_KEY) {
    res.status(401).json({ error: 'invalid internal key' })
    return
  }

  const userId = req.body?.userId
  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ error: 'userId is required' })
    return
  }

  req.userId = userId
  next()
}
