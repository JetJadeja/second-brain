import { Router } from 'express'
import {
  getPendingSuggestions,
  updateSuggestionStatus,
} from '@second-brain/db'
import type { SuggestionsResponse } from '@second-brain/shared'

export const suggestionsRouter = Router()

suggestionsRouter.get('/', async (req, res) => {
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
})

suggestionsRouter.post('/:id/accept', async (req, res) => {
  const userId = req.userId!
  const suggestionId = req.params['id']!

  // For MVP: just mark as accepted
  await updateSuggestionStatus(userId, suggestionId, 'accepted')
  res.json({ success: true })
})

suggestionsRouter.post('/:id/dismiss', async (req, res) => {
  const userId = req.userId!
  const suggestionId = req.params['id']!

  await updateSuggestionStatus(userId, suggestionId, 'dismissed')
  res.json({ success: true })
})
