import { Router } from 'express'
import {
  getPendingSuggestions,
  getSuggestionById,
  updateSuggestionStatus,
} from '@second-brain/db'
import type { SuggestionsResponse } from '@second-brain/shared'
import { executeSuggestion } from '../services/suggestions/execute-suggestion.js'
import { catchAsync, param } from '../middleware/catch-async.js'

export const suggestionsRouter = Router()

suggestionsRouter.get('/', catchAsync(async (req, res) => {
  const userId = req.userId!
  const suggestions = await getPendingSuggestions(userId)

  const response: SuggestionsResponse = {
    suggestions: suggestions.map((s) => ({
      id: s.id,
      type: s.type,
      payload: s.payload,
      created_at: s.created_at,
    })),
  }

  res.json(response)
}))

suggestionsRouter.post('/:id/accept', catchAsync(async (req, res) => {
  const userId = req.userId!
  const suggestionId = param(req, 'id')

  const suggestion = await getSuggestionById(userId, suggestionId)
  if (!suggestion) {
    res.status(404).json({ error: 'Suggestion not found' })
    return
  }

  try {
    const affectedNoteIds = await executeSuggestion(userId, suggestion)
    await updateSuggestionStatus(userId, suggestionId, 'accepted')
    res.json({ success: true, affected_note_ids: affectedNoteIds })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[suggestions/accept] id=${suggestionId}:`, msg)
    res.status(500).json({ error: 'Failed to execute suggestion' })
  }
}))

suggestionsRouter.post('/:id/dismiss', catchAsync(async (req, res) => {
  const userId = req.userId!
  const suggestionId = param(req, 'id')

  await updateSuggestionStatus(userId, suggestionId, 'dismissed')
  res.json({ success: true })
}))
