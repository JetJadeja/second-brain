import { Router } from 'express'
import { z } from 'zod'
import {
  getNoteById,
  deleteNote,
  incrementViewCount,
  getConnectionsForNote,
  createConnection,
  insertNoteView,
} from '@second-brain/db'
import { getBucketPath } from '../services/para/para-cache.js'
import { buildNoteRelations } from '../services/notes/build-note-relations.js'
import { updateNoteWithHistory, BucketNotFoundError } from '../services/notes/update-note-fields.js'
import type { NoteDetailResponse } from '@second-brain/shared'

export const notesRouter = Router()

const updateNoteSchema = z.object({
  title: z.string().min(1).optional(),
  bucket_id: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  distillation: z.string().optional(),
  distillation_status: z
    .enum(['raw', 'key_points', 'distilled', 'evergreen'])
    .optional(),
  key_points: z.array(z.string()).optional(),
})

const connectSchema = z.object({
  target_note_id: z.string().uuid(),
})

notesRouter.get('/:noteId', async (req, res) => {
  const userId = req.userId!
  const noteId = req.params['noteId']!

  const note = await getNoteById(userId, noteId)
  if (!note) {
    res.status(404).json({ error: 'Note not found' })
    return
  }

  // Fire view tracking asynchronously
  incrementViewCount(userId, noteId).catch((err) =>
    console.error('[notes] view count increment failed:', err),
  )
  insertNoteView(userId, noteId).catch((err) =>
    console.error('[notes] view insert failed:', err),
  )

  const [connections, bucketPath] = await Promise.all([
    getConnectionsForNote(userId, noteId),
    getBucketPath(userId, note.bucket_id),
  ])

  const { relatedNotes, backlinks } = await buildNoteRelations(userId, noteId, connections)

  const response: NoteDetailResponse = {
    note: {
      id: note.id,
      title: note.title,
      original_content: note.original_content,
      ai_summary: note.ai_summary,
      key_points: note.key_points,
      distillation: note.distillation,
      source_type: note.source_type,
      source: note.source,
      user_note: note.user_note,
      bucket_id: note.bucket_id,
      bucket_path: bucketPath,
      distillation_status: note.distillation_status,
      is_original_thought: note.is_original_thought,
      tags: note.tags,
      captured_at: note.captured_at,
      view_count: note.view_count,
      connection_count: note.connection_count,
    },
    related_notes: relatedNotes,
    backlinks,
  }

  res.json(response)
})

notesRouter.patch('/:noteId', async (req, res) => {
  const userId = req.userId!
  const noteId = req.params['noteId']!
  const parsed = updateNoteSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const existing = await getNoteById(userId, noteId)
  if (!existing) {
    res.status(404).json({ error: 'Note not found' })
    return
  }

  try {
    const updated = await updateNoteWithHistory(userId, noteId, parsed.data, existing)
    res.json(updated)
  } catch (err) {
    if (err instanceof BucketNotFoundError) {
      res.status(404).json({ error: 'Target bucket not found' })
      return
    }
    throw err
  }
})

notesRouter.delete('/:noteId', async (req, res) => {
  const userId = req.userId!
  await deleteNote(userId, req.params['noteId']!)
  res.json({ success: true })
})

notesRouter.post('/:noteId/connect', async (req, res) => {
  const userId = req.userId!
  const noteId = req.params['noteId']!
  const parsed = connectSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  // Verify both notes exist and belong to user
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
})
