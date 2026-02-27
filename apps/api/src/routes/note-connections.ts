import { Router } from 'express'
import { z } from 'zod'
import { getNoteById, createConnection } from '@second-brain/db'
import { catchAsync, param } from '../middleware/catch-async.js'

export const noteConnectionsRouter = Router()

const connectSchema = z.object({
  target_note_id: z.string().uuid(),
})

noteConnectionsRouter.post('/:noteId/connect', catchAsync(async (req, res) => {
  const userId = req.userId!
  const noteId = param(req, 'noteId')
  const parsed = connectSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const [source, target] = await Promise.all([
    getNoteById(userId, noteId),
    getNoteById(userId, parsed.data.target_note_id),
  ])

  if (!source || !target) {
    res.status(404).json({ error: 'Note not found' })
    return
  }

  const conn = await createConnection(userId, noteId, parsed.data.target_note_id, 'explicit')
  res.status(201).json(conn)
}))
