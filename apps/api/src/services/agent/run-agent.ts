import { runAgentLoop, type ToolCallRecord } from '@second-brain/ai'
import { getAllBuckets, updateNote } from '@second-brain/db'
import { buildParaTree } from '@second-brain/shared'
import type { ExtractedContent } from '@second-brain/shared'
import { loadHistory } from '../conversation/load-history.js'
import { buildAgentSystemPrompt } from './system-prompt.js'
import { AGENT_TOOLS } from '../tools/tool-definitions.js'
import { buildMessages } from './build-messages.js'
import { executeTool } from '../tools/execute-tool.js'
import { loadIsOnboarding } from '../onboarding/load-onboarding.js'

export interface AgentResult {
  text: string
  noteIds: string[]
}

export interface RunAgentOptions {
  preExtracted?: ExtractedContent
  noteContext?: string
  attachmentDescription?: string
  platform?: string
}

export async function runAgent(
  userId: string,
  message: string,
  options?: RunAgentOptions,
): Promise<AgentResult> {
  const [history, buckets, isOnboarding] = await Promise.all([
    loadHistory(userId),
    getAllBuckets(userId),
    loadIsOnboarding(userId),
  ])

  const paraTree = buildParaTree(buckets)

  const system = buildAgentSystemPrompt({
    bucketTree: paraTree,
    noteContext: options?.noteContext,
    isOnboarding,
    platform: options?.platform,
  })

  const messages = buildMessages(
    history,
    message,
    options?.attachmentDescription,
  )

  const savedNoteIds = new Set<string>()

  const result = await runAgentLoop({
    system,
    messages,
    tools: AGENT_TOOLS,
    toolExecutor: async (name, input) => {
      if (name === 'move_note' && savedNoteIds.has(String(input['note_id'] ?? ''))) {
        return JSON.stringify({ error: 'New notes go to inbox for user review. Cannot move a note that was just saved.' })
      }
      const output = await executeTool(name, input, { userId, preExtracted: options?.preExtracted })
      if (name === 'save_note') {
        try {
          const parsed = JSON.parse(output) as Record<string, unknown>
          const noteId = parsed['noteId']
          if (typeof noteId === 'string') {
            savedNoteIds.add(noteId)
            await forceInboxState(userId, noteId)
          }
        } catch { /* result not parseable */ }
      }
      return output
    },
  })

  return { text: result.text, noteIds: collectNoteIds(result.toolCalls) }
}

/**
 * Hard guarantee: any note saved through the agent always lands in inbox.
 * Overwrites bucket_id and is_classified regardless of what the pipeline set.
 */
async function forceInboxState(userId: string, noteId: string): Promise<void> {
  try {
    await updateNote(userId, noteId, { bucket_id: null, is_classified: false })
  } catch (err: unknown) {
    console.error('[run-agent] forceInboxState failed:', err instanceof Error ? err.message : err)
  }
}

function collectNoteIds(toolCalls: ToolCallRecord[]): string[] {
  const noteIds: string[] = []
  for (const call of toolCalls) {
    try {
      const parsed = JSON.parse(call.result) as Record<string, unknown>
      if (typeof parsed['noteId'] === 'string') {
        noteIds.push(parsed['noteId'])
      }
    } catch {
      // Not parseable — no note IDs to collect
    }
  }
  return noteIds
}
