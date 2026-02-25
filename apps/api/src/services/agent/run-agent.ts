import { runAgentLoop, type ToolCallRecord } from '@second-brain/ai'
import { getAllBuckets } from '@second-brain/db'
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

  const result = await runAgentLoop({
    system,
    messages,
    tools: AGENT_TOOLS,
    toolExecutor: (name, input) =>
      executeTool(name, input, { userId, preExtracted: options?.preExtracted }),
  })

  return { text: result.text, noteIds: collectNoteIds(result.toolCalls) }
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
