import { Router } from 'express'
import { z } from 'zod'
import type { ChatResponse, ExtractedContent } from '@second-brain/shared'
import { NOTE_SOURCES } from '@second-brain/shared'
import { runAgent } from '../services/agent/run-agent.js'
import { recordUserMessage, recordBotResponse } from '../services/conversation/record-exchange.js'
import { startOnboarding } from '../services/onboarding/start-onboarding.js'

export const chatRouter = Router()

const extractedContentSchema = z.object({
  title: z.string(),
  content: z.string(),
  sourceType: z.enum(NOTE_SOURCES),
  source: z.record(z.string(), z.unknown()),
  thumbnailUrl: z.string().optional(),
  mediaUrls: z.array(z.string()).optional(),
})

const chatRequestSchema = z.object({
  userId: z.string(),
  message: z.string(),
  preExtracted: extractedContentSchema.optional(),
  noteContext: z.string().optional(),
  startOnboarding: z.boolean().optional(),
  attachmentDescription: z.string().optional(),
  platform: z.string().optional(),
})

chatRouter.post('/', async (req, res) => {
  const parsed = chatRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid request', details: parsed.error.issues })
    return
  }

  const { userId, message, preExtracted, noteContext, platform, attachmentDescription } = parsed.data

  try {
    // Initialize onboarding if requested
    if (parsed.data.startOnboarding) {
      await startOnboarding(userId)
    }

    // Record user message
    recordUserMessage(userId, message)

    // Run agent
    const result = await runAgent(userId, message, {
      preExtracted: preExtracted as ExtractedContent | undefined,
      noteContext,
      attachmentDescription,
      platform,
    })

    // Record bot response
    recordBotResponse(userId, result.text, result.noteIds)

    const response: ChatResponse = {
      text: result.text,
      noteIds: result.noteIds,
    }

    res.json(response)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[chat] agent error:', msg)
    res.status(500).json({ error: 'agent failed' })
  }
})
