import { Router } from 'express'
import type { Request, Response } from 'express'

export const chatRouter = Router()

chatRouter.post('/', (_req: Request, res: Response) => {
  res.status(501).json({ error: 'not implemented' })
})
