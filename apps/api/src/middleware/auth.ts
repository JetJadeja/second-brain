import type { Request, Response, NextFunction } from 'express'
import { getServiceClient } from '@second-brain/db'

declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

export interface AuthenticatedRequest extends Request {
  userId: string
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization token' })
    return
  }

  const token = header.slice(7)
  const sb = getServiceClient()

  sb.auth.getUser(token).then(({ data, error }) => {
    if (error || !data.user) {
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    }

    req.userId = data.user.id
    next()
  }).catch(() => {
    res.status(500).json({ error: 'Authentication service unavailable' })
  })
}
