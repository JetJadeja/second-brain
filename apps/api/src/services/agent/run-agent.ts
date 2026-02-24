import { callClaudeWithTools, extractText } from '@second-brain/ai'
import { getAllBuckets } from '@second-brain/db'
import { buildParaTree } from '@second-brain/shared'
import type { ExtractedContent } from '@second-brain/shared'
import { loadHistory } from '../conversation/load-history.js'
import { buildAgentSystemPrompt } from './system-prompt.js'
import { AGENT_TOOLS } from '../tools/tool-definitions.js'
import { buildMessages } from './build-messages.js'
import { handleToolCalls } from './handle-tool-calls.js'
import { loadOnboardingPhase } from '../onboarding/load-onboarding.js'

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
  const [history, buckets, onboardingPhase] = await Promise.all([
    loadHistory(userId),
    getAllBuckets(userId),
    loadOnboardingPhase(userId),
  ])

  const paraTree = buildParaTree(buckets)
  const isOnboarding = onboardingPhase !== null

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

  const response = await callClaudeWithTools({
    system,
    messages,
    tools: AGENT_TOOLS,
  })

  const noteIds: string[] = []

  if (response.stop_reason === 'tool_use') {
    const result = await handleToolCalls(
      response.content, userId, messages, options?.preExtracted,
    )
    noteIds.push(...result.noteIds)
    return { text: result.text, noteIds }
  }

  const text = extractText(response.content)
  return { text, noteIds }
}
