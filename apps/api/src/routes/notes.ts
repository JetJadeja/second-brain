import { Router } from 'express'
import { z } from 'zod'
import {
  getNoteById,
  updateNote,
  deleteNote,
  incrementViewCount,
  getConnectionsForNote,
  createConnection,
  getBucketById,
} from '@second-brain/db'
import { insertNoteView } from '@second-brain/db'
import { insertDistillationHistory } from '@second-brain/db'
import { getBucketPath } from '../services/para-tree.js'
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
  incrementViewCount(userId, noteId).catch(() => {})
  insertNoteView(userId, noteId).catch(() => {})

  const connections = await getConnectionsForNote(userId, noteId)
  const bucketPath = await getBucketPath(userId, note.bucket_id)

  // Build related notes from connections
  const relatedNotes: NoteDetailResponse['related_notes'] = []
  const backlinks: NoteDetailResponse['backlinks'] = []

  for (const conn of connections) {
    const otherId = conn.source_id === noteId ? conn.target_id : conn.source_id
    const otherNote = await getNoteById(userId, otherId)
    if (!otherNote) continue

    const otherPath = await getBucketPath(userId, otherNote.bucket_id)

    if (conn.target_id === noteId) {
      backlinks.push({
        id: otherNote.id,
        title: otherNote.title,
        bucket_path: otherPath,
      })
    }

    relatedNotes.push({
      id: otherNote.id,
      title: otherNote.title,
      ai_summary: otherNote.ai_summary,
      similarity: conn.similarity ?? 0,
      bucket_path: otherPath,
      connection_type: conn.type,
    })
  }

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

  // Archive distillation history if distillation is changing
  const fields = parsed.data
  if (
    (fields.distillation !== undefined || fields.distillation_status !== undefined) &&
    existing.distillation
  ) {
    await insertDistillationHistory(
      userId,
      noteId,
      existing.distillation,
      existing.distillation_status,
    )
  }

  // If setting bucket_id, also mark classified
  const updateFields: Record<string, unknown> = { ...fields }
  if (fields.bucket_id) {
    const bucket = await getBucketById(userId, fields.bucket_id)
    if (!bucket) {
      res.status(404).json({ error: 'Target bucket not found' })
      return
    }
    updateFields['is_classified'] = true
  }

  const updated = await updateNote(userId, noteId, updateFields)
  res.json(updated)
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
